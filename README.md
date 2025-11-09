# 🎵 Adorable Radios

Your terminal audio companion for streaming internet radio stations, built with Node.js, React, and Ink.

## Features

- 🎧 Stream thousands of radio stations from around the world
- 🔍 Search stations by name, country, genre, or language
- ⭐ Favorite stations for quick access
- 🎚️ Volume control
- 📻 Live metadata display (now playing information)
- 💾 Persistent settings and favorites
- ⌨️ Intuitive keyboard controls

## Prerequisites

Before installing, make sure you have:

- **Node.js** (v18 or higher)
- **MPV** (media player for audio playback)

### Installing MPV

**macOS:**
```bash
brew install mpv
```

**Linux:**
```bash
# Ubuntu/Debian
sudo apt install mpv

# Fedora/RHEL
sudo dnf install mpv

# Arch Linux
sudo pacman -S mpv
```

**Windows:**
- Download from [mpv.io](https://mpv.io/installation/)
- Or use Chocolatey: `choco install mpv`

**Why MPV?** MPV is a lightweight, cross-platform media player that handles all audio formats and provides real-time volume control. It includes FFmpeg internally.

## Quick Start (Running Locally)

### 1. Install Dependencies

```bash
npm install
```

This will install all required packages for the terminal UI and API integration.

### 2. Run in Development Mode

```bash
npm run dev
```

This uses `tsx` to run TypeScript directly with hot-reload enabled. Best for development.

### 3. Or Build and Run

```bash
npm run build   # Compile TypeScript to JavaScript
npm start       # Run compiled version
```

The compiled output goes to the `dist/` folder.

### Troubleshooting

**"MPV not found" error:**
- Make sure MPV is installed (see Prerequisites above)
- Verify MPV is in your PATH: `mpv --version`
- Restart your terminal after installing MPV
- Adorable Radios will show OS-specific installation instructions

**Audio not playing:**
- Check your system audio settings and volume
- Make sure no other application is blocking audio output
- Verify the station URL is working by testing in your browser
- Some stations may have geo-restrictions

**Installation issues:**
- If `npm install` fails, make sure you have Node.js v18 or higher
- Try clearing npm cache: `npm cache clean --force`

### Keyboard Controls

- **↑/↓** - Navigate through station list
- **Enter** - Play selected station / Pause current station
- **Space** - Stop playback
- **+/-** - Increase/decrease volume
- **f** - Toggle favorite for selected station
- **s** - Search for stations
- **b** - Browse all stations
- **v** - View favorites
- **q** - Quit application

## Architecture

For new developers, see the detailed [Architecture Guide](ARCHITECTURE.md) which includes:
- Complete system diagram
- Component interaction flows
- Audio pipeline explanation
- Design patterns used
- Data flow examples

### Core Components (Quick Overview)

1. **Audio Player Service** (`src/services/player.ts`)
   - MPV-based audio playback for all formats (MP3, AAC, OGG, FLAC, etc.)
   - Real-time volume control via IPC (Inter-Process Communication)
   - Handles HTTP stream connections and ICY metadata parsing
   - Event-driven architecture for state updates

2. **Radio Browser API Client** (`src/services/radio-browser.ts`)
   - Integrates with Radio-Browser.info API
   - Discovers and searches thousands of stations
   - Provides filtering by country, genre, and language

3. **Storage Manager** (`src/services/storage.ts`)
   - Persists user favorites and settings
   - Manages last played station
   - Stores volume preferences

4. **React/Ink UI Components** (`src/components/`)
   - Terminal-based UI using React and Ink
   - Real-time updates and interactive controls
   - Clean, intuitive interface

## Project Structure

```
adorable-radios/
├── src/
│   ├── components/
│   │   ├── App.tsx           # Main application component
│   │   ├── StationList.tsx   # Station browser
│   │   ├── NowPlaying.tsx    # Playback display
│   │   ├── SearchInput.tsx   # Search interface
│   │   └── HelpBar.tsx       # Keyboard controls help
│   ├── services/
│   │   ├── player.ts         # Audio playback service
│   │   ├── radio-browser.ts  # API client
│   │   └── storage.ts        # Data persistence
│   ├── types.ts              # TypeScript interfaces
│   └── cli.tsx               # CLI entry point
├── package.json
├── tsconfig.json
└── README.md
```

## Tech Stack

- **Node.js** - Runtime environment
- **TypeScript** - Type safety
- **React** - UI component framework
- **Ink** - Terminal UI rendering
- **MPV** - Media player for audio playback
- **axios** - HTTP client for streaming and API requests
- **conf** - Configuration management

## API

This application uses the [Radio-Browser.info](https://www.radio-browser.info/) API, a community-driven catalog of radio stations.

## License

MIT