import { type ChildProcess, spawn } from "child_process";
import { EventEmitter } from "events";
import { Socket } from "net";
import { platform } from "os";
import type { RadioStation } from "../types.js";

type RadioPlayerEvents = {
  playing: [station: RadioStation];
  stopped: [];
  error: [message: string];
  volumechange: [volume: number];
};

export class RadioPlayer extends EventEmitter<RadioPlayerEvents> {
  private currentStation: RadioStation | null = null;
  private _volume: number = 50; // 0-100 for MPV
  private isInitialized: boolean = false;
  private _isPlaying: boolean = false;
  private mpvProcess: ChildProcess | null = null;
  private ipcSocket: string = "";
  private currentMetadata: string = "";

  constructor() {
    super();
  }

  async initialize({ initialVolume = 50 } = {}) {
    if (this.isInitialized) return;

    // Check if mpv is available
    try {
      await new Promise<void>((resolve, reject) => {
        const check = spawn("mpv", ["--version"]);
        check.on("error", reject);
        check.on("exit", code => {
          if (code === 0 || code === null) resolve();
          else reject(new Error("mpv not found"));
        });
      });

      await this.setVolume(initialVolume);
      this.isInitialized = true;
    } catch (error) {
      this.showMPVInstallInstructions();
      throw new Error("MPV not found");
    }
  }

  private showMPVInstallInstructions() {
    const os = platform();
    console.error(
      "\n❌ MPV not found. Please install MPV to use Adorable Radios.\n"
    );

    switch (os) {
      case "darwin":
        console.error("Install on macOS:");
        console.error("  brew install mpv\n");
        break;

      case "linux":
        console.error("Install on Linux:");
        console.error("  Ubuntu/Debian: sudo apt install mpv");
        console.error("  Fedora/RHEL:   sudo dnf install mpv");
        console.error("  Arch:          sudo pacman -S mpv\n");
        break;

      case "win32":
        console.error("Install on Windows:");
        console.error("  1. Download from: https://mpv.io/installation/");
        console.error("  2. Or use Chocolatey: choco install mpv\n");
        break;

      default:
        console.error("Install MPV for your system:");
        console.error("  Visit: https://mpv.io/installation/\n");
    }
  }

  async play(station: RadioStation) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    // Stop current playback
    await this.stop();

    try {
      this.currentStation = station;
      const url = station.url_resolved || station.url;

      // Fetch metadata from station headers
      try {
        const response = await fetch(url, {
          method: "HEAD",
          signal: AbortSignal.timeout(5000),
          headers: {
            "User-Agent": "Adorable-Radios/1.0",
            "Icy-MetaData": "1",
          },
        });

        const icyName = response.headers.get("icy-name");
        if (icyName) {
          this.currentMetadata = icyName;
        }
      } catch {
        // Ignore metadata fetch errors
      }

      // Create IPC socket path
      this.ipcSocket = `/tmp/mpv-socket-${Date.now()}`;

      // Spawn MPV with IPC enabled
      this.mpvProcess = spawn("mpv", [
        "--no-video", // Audio only
        "--no-terminal", // No interactive terminal
        `--volume=${this._volume}`, // Initial volume
        `--input-ipc-server=${this.ipcSocket}`, // Enable IPC for volume control
        "--no-config", // Don't load user config
        url,
      ]);

      this.mpvProcess.on("error", err => {
        this.emit("error", `Player error: ${err.message}`);
        this._isPlaying = false;
      });

      this.mpvProcess.on("exit", () => {
        this._isPlaying = false;
        this.mpvProcess = null;
        this.emit("stopped");
      });

      this._isPlaying = true;
      this.emit("playing", station);
    } catch (error) {
      this.emit("error", `Failed to play station: ${error}`);
      throw error;
    }
  }

  async stop() {
    if (!this.mpvProcess) return;

    try {
      // Set state immediately to prevent race conditions
      this._isPlaying = false;
      const processToKill = this.mpvProcess;
      this.mpvProcess = null;
      this.currentStation = null;
      this.currentMetadata = "";
      this.ipcSocket = "";

      // Kill MPV process
      processToKill.kill("SIGTERM");

      // Force kill if not terminated after 1 second
      setTimeout(() => {
        if (processToKill && !processToKill.killed) {
          processToKill.kill("SIGKILL");
        }
      }, 1000);

      this.emit("stopped");
    } catch (error) {
      // TODO rollback state changes on error?
      this.emit("error", `Failed to stop playback: ${error}`);
    }
  }

  async pause() {
    await this.stop();
  }

  async resume() {
    if (this.currentStation) {
      await this.play(this.currentStation);
    }
  }

  // TODO consistent volume change with MPV command success/failure
  async setVolume(volume: number) {
    this._volume = Math.max(0, Math.min(100, volume));

    // Send volume command via IPC socket
    if (this._isPlaying && this.ipcSocket) {
      try {
        await this.sendMPVCommand(["set_property", "volume", this._volume]);
      } catch (error) {
        // IPC failed, ignore (socket might not be ready yet)
      }
    }

    this.emit("volumechange", this._volume);
  }

  async increaseVolume(step = 5) {
    await this.setVolume(this._volume + step);
    return this._volume;
  }

  async decreaseVolume(step = 5) {
    await this.setVolume(this._volume - step);
    return this._volume;
  }

  // Helper method for IPC communication with MPV
  private async sendMPVCommand(command: any[]): Promise<void> {
    return new Promise((resolve, reject) => {
      const socket = new Socket();

      const timeout = setTimeout(() => {
        socket.destroy();
        reject(new Error("IPC timeout"));
      }, 1000);

      socket.connect(this.ipcSocket, () => {
        clearTimeout(timeout);
        const cmd = JSON.stringify({ command }) + "\n";
        socket.write(cmd);
        socket.end();
        resolve();
      });

      socket.on("error", err => {
        clearTimeout(timeout);
        reject(err);
      });
    });
  }

  getVolume() {
    return this._volume;
  }

  getMetadata() {
    return this.currentMetadata;
  }

  getCurrentStation(): RadioStation | null {
    return this.currentStation;
  }

  async isPlaying(): Promise<boolean> {
    return this._isPlaying;
  }

  async quit() {
    await this.stop();
    this.isInitialized = false;
  }

  /**
   * Intelligently handles station selection:
   * - If same station is playing: pause it
   * - If same station is paused: resume it
   * - If different station: play it
   */
  async toggleOrPlay(station: RadioStation): Promise<void> {
    const isSameStation =
      this.currentStation?.stationuuid === station.stationuuid;
    const isCurrentlyPlaying = this._isPlaying;

    if (isSameStation && isCurrentlyPlaying) await this.pause();
    else if (isSameStation && !isCurrentlyPlaying) await this.resume();
    else await this.play(station);
  }
}
