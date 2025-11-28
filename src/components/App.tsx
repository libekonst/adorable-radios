import { Box, Text, useApp, useInput } from "ink";
import Spinner from "ink-spinner";
import React, { useEffect, useState } from "react";
import { RadioPlayer } from "../services/player.js";
import { RadioBrowserAPI } from "../services/radio-browser.js";
import { StorageManager } from "../services/storage.js";
import type { AppState, PlaybackState, RadioStation } from "../types.js";
import { HelpBar } from "./HelpBar.js";
import { NowPlaying } from "./NowPlaying.js";
import { SearchInput } from "./SearchInput.js";
import { StationList } from "./StationList.js";

// TODO proper singleton pattern for testability and lazy initialization (save startup time/memory)
const player = new RadioPlayer();
const api = new RadioBrowserAPI();
const storage = new StorageManager();

export function usePlaybackStatus(): PlaybackState {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStation, setCurrentStation] = useState<RadioStation | null>(
    null
  );
  const [volume, setVolume] = useState(() => storage.getVolume() ?? 50);
  const [metadata, setMetadata] = useState("");

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

export function App() {
  const { exit } = useApp();
  const [state, setState] = useState<AppState>({
    view: "browse",
    playback: {
      isPlaying: false,
      currentStation: null,
    },
    stations: [],
    favorites: storage.getFavorites(),
    searchQuery: "",
    selectedIndex: 0,
    loading: true,
    error: null,
  });

  const [isSearching, setIsSearching] = useState(false);

  // Initialize player and load stations
  useEffect(() => {
    const init = async () => {
      try {
        await player.initialize({ initialVolume: storage.getVolume() ?? 50 });

        const topStations = await api.getTopStations(100);
        setState(prev => ({
          ...prev,
          stations: topStations,
          loading: false,
        }));
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: String(error),
          loading: false,
        }));
      }
    };

    init();
  }, []);

  const { currentStation, volume, metadata, isPlaying } = usePlaybackStatus();

  // Player event listeners
  useEffect(() => {
    const handlePlaying = (station: RadioStation) => {
      setState(prev => ({
        ...prev,
        playback: {
          ...prev.playback,
          isPlaying: true,
          currentStation: station,
        },
      }));
      storage.setLastPlayed(station);
    };

    const handleStopped = () => {
      setState(prev => ({
        ...prev,
        playback: { ...prev.playback, isPlaying: false },
      }));
    };

    player.on("playing", handlePlaying);
    player.on("stopped", handleStopped);

    return () => {
      player.off("playing", handlePlaying);
      player.off("stopped", handleStopped);
    };
  }, []);

  // Keyboard controls
  useInput((input, key) => {
    // Don't handle input when searching
    if (isSearching && input !== "\u001B") {
      return;
    }

    if (input === "q") {
      exit();
      return;
    }

    const currentList =
      state.view === "favorites" ? state.favorites : state.stations;

    if (key.upArrow) {
      setState(prev => ({
        ...prev,
        selectedIndex: Math.max(0, prev.selectedIndex - 1),
      }));
    } else if (key.downArrow) {
      setState(prev => ({
        ...prev,
        selectedIndex: Math.min(currentList.length - 1, prev.selectedIndex + 1),
      }));
    } else if (key.return && !isSearching) {
      const station = currentList[state.selectedIndex];
      if (station) {
        // Check if same station AND already playing
        const isSameStation =
          state.playback.currentStation?.stationuuid === station.stationuuid;
        const isCurrentlyPlaying = state.playback.isPlaying;

        if (isSameStation && isCurrentlyPlaying) {
          // Toggle pause/resume for same station
          player.pause();
        } else if (isSameStation && !isCurrentlyPlaying) {
          // Resume same station
          player.resume();
        } else {
          // Play different station
          player.play(station);
          api.clickStation(station.stationuuid);
        }
      }
    } else if (input === " ") {
      player.stop();
    } else if (input === "+" || input === "=") {
      const newVolume = Math.min(100, player.getVolume() + 5);
      player.setVolume(newVolume);
      storage.setVolume(newVolume);
    } else if (input === "-" || input === "_") {
      const newVolume = Math.max(0, player.getVolume() - 5);
      player.setVolume(newVolume);
      storage.setVolume(newVolume);
    } else if (input === "f") {
      const station = currentList[state.selectedIndex];
      if (station) {
        storage.toggleFavorite(station);
        setState(prev => ({
          ...prev,
          favorites: storage.getFavorites(),
        }));
      }
    } else if (input === "s") {
      setIsSearching(true);
    } else if (input === "b") {
      setState(prev => ({
        ...prev,
        view: "browse",
        selectedIndex: 0,
      }));
    } else if (input === "v") {
      setState(prev => ({
        ...prev,
        view: "favorites",
        selectedIndex: 0,
      }));
    } else if (input === "\u001B" && isSearching) {
      setIsSearching(false);
    }
  });

  const handleSearch = async (query: string) => {
    setIsSearching(false);
    setState(prev => ({ ...prev, loading: true, searchQuery: query }));

    try {
      const results = await api.searchStations(query);
      setState(prev => ({
        ...prev,
        stations: results,
        view: "browse",
        selectedIndex: 0,
        loading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: String(error),
        loading: false,
      }));
    }
  };

  const handleCancelSearch = () => {
    setIsSearching(false);
  };

  // TODO Improve view router
  const currentList =
    state.view === "favorites" ? state.favorites : state.stations;
  const favoriteUuids = new Set(state.favorites.map(f => f.stationuuid));

  return (
    <Box flexDirection="column" padding={1}>
      <Box>
        <Text bold color="green">
          🎵 Adorable Radios
        </Text>
      </Box>

      <NowPlaying
        station={state.playback.currentStation}
        isPlaying={state.playback.isPlaying}
        volume={volume}
        metadata={metadata}
      />

      {isSearching ? (
        <SearchInput onSearch={handleSearch} onCancel={handleCancelSearch} />
      ) : (
        <>
          <Box marginBottom={1}>
            <Text bold color="cyan">
              {state.view === "favorites"
                ? "Your Favorites"
                : "Browse Stations"}
              {state.searchQuery && ` - Search: "${state.searchQuery}"`}
            </Text>
          </Box>

          {state.loading ? (
            <Box>
              <Text color="green">
                <Spinner type="dots" /> Loading stations...
              </Text>
            </Box>
          ) : state.error ? (
            <Box>
              <Text color="red">Error: {state.error}</Text>
            </Box>
          ) : (
            <StationList
              stations={currentList}
              selectedIndex={state.selectedIndex}
              favoriteUuids={favoriteUuids}
              currentStationUuid={state.playback.currentStation?.stationuuid}
            />
          )}
        </>
      )}

      <HelpBar view={state.view} />
    </Box>
  );
}
