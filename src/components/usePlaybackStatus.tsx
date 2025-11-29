import { useEffect, useState } from "react";
import type { PlaybackState, RadioStation } from "../types";
import { player, storage } from "./App";

export function usePlaybackStatus(): PlaybackState {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStation, setCurrentStation] = useState<RadioStation | null>(
    null
  );
  const [volume, setVolume] = useState(() => storage.getVolume() ?? 50);
  const [metadata, setMetadata] = useState("");

  // Player event listeners
  useEffect(() => {
    const handlePlaying = (station: RadioStation) => {
      setIsPlaying(true);
      setCurrentStation(station);
      storage.setLastPlayed(station); // TODO not utilized
    };

    const handleStopped = () => {
      setIsPlaying(false);
    };

    player.on("playing", handlePlaying);
    player.on("stopped", handleStopped);

    return () => {
      player.off("playing", handlePlaying);
      player.off("stopped", handleStopped);
    };
  }, []);

  // Listen to volume changes
  useEffect(() => {
    const handleVolumeChange = (newVolume: number) => {
      setVolume(newVolume);
    };

    player.on("volumechange", handleVolumeChange);
    return () => {
      player.off("volumechange", handleVolumeChange);
    };
  }, []);

  // TODO don't setup the interval if no station is playing or player isn't initialized
  // Metadata update interval
  useEffect(() => {
    if (!currentStation) return;

    const intervalID = setInterval(() => {
      const playerMeta = player.getMetadata();
      setMetadata(playerMeta);
    }, 2000);

    return () => {
      clearInterval(intervalID);
    };
  }, [currentStation]);

  return {
    isPlaying,
    currentStation,
    volume,
    metadata,
  };
}
