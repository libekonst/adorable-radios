import { Box, Text, useApp, useInput } from "ink";
import Spinner from "ink-spinner";
import React, { useEffect, useState } from "react";
import {
  useSearchStations,
  useTopStations,
} from "../hooks/useRadioStations.js";
import { RadioPlayer } from "../services/player.js";
import { StorageManager } from "../services/storage.js";
import { HelpBar } from "./HelpBar.js";
import { NowPlaying } from "./NowPlaying.js";
import { SearchInput } from "./SearchInput.js";
import { StationList } from "./StationList.js";
import { usePlaybackStatus } from "./usePlaybackStatus.js";

// TODO proper singleton pattern for testability and lazy initialization (save startup time/memory)
export const player = new RadioPlayer();
export const storage = new StorageManager();

export function App() {
  const { exit } = useApp();
  const [view, setView] = useState<"browse" | "favorites">("browse");
  const [favorites, setFavorites] = useState(storage.getFavorites());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isSearching, setIsSearching] = useState(false);

  // Fetch stations based on search query
  const topStationsQuery = useTopStations(100);
  const searchStationsQuery = useSearchStations(searchQuery);

  // Determine which query to use
  const activeQuery = searchQuery ? searchStationsQuery : topStationsQuery;
  const stations = activeQuery.data ?? [];
  const loading = activeQuery.isLoading;
  const error = activeQuery.error ? String(activeQuery.error) : null;

  // Initialize player
  // TODO handle error, move to a better place
  useEffect(() => {
    const init = async () => {
      await player.initialize({ initialVolume: storage.getVolume() ?? 50 });
    };
    init();
  }, []);

  const { currentStation, volume, metadata, isPlaying } = usePlaybackStatus();

  // Keyboard controls
  useInput(async (input, key) => {
    // Don't handle input when searching
    if (isSearching && input !== "\u001B") {
      return;
    }

    if (input === "q") {
      exit();
      return;
    }

    const currentList = view === "favorites" ? favorites : stations;

    if (key.upArrow) {
      setSelectedIndex(Math.max(0, selectedIndex - 1));
    } else if (key.downArrow) {
      setSelectedIndex(Math.min(currentList.length - 1, selectedIndex + 1));
    } else if (key.return && !isSearching) {
      const station = currentList[selectedIndex];
      if (station) {
        await player.toggleOrPlay(station);
      }
    } else if (input === " ") {
      player.stop();
    } else if (input === "+" || input === "=") {
      const newVolume = await player.increaseVolume();
      storage.setVolume(newVolume);
    } else if (input === "-" || input === "_") {
      const newVolume = await player.decreaseVolume();
      storage.setVolume(newVolume);
    } else if (input === "f") {
      const station = currentList[selectedIndex];
      if (station) {
        storage.toggleFavorite(station);
        setFavorites(storage.getFavorites());
      }
    } else if (input === "s") {
      setIsSearching(true);
    } else if (input === "b") {
      setView("browse");
      setSelectedIndex(0);
    } else if (input === "v") {
      setView("favorites");
      setSelectedIndex(0);
    } else if (input === "\u001B" && isSearching) {
      setIsSearching(false);
    }
  });

  const handleSearch = (query: string) => {
    setIsSearching(false);
    setSearchQuery(query);
    setView("browse");
    setSelectedIndex(0);
  };

  const handleCancelSearch = () => {
    setIsSearching(false);
  };

  // TODO Improve view router
  const currentList = view === "favorites" ? favorites : stations;
  const favoriteUuids = new Set(favorites.map(f => f.stationuuid));

  return (
    <Box flexDirection="column" padding={1}>
      <Box>
        <Text bold color="green">
          🎵 Adorable Radios
        </Text>
      </Box>

      <NowPlaying
        station={currentStation}
        isPlaying={isPlaying}
        volume={volume}
        metadata={metadata}
      />

      {isSearching ? (
        <SearchInput onSearch={handleSearch} onCancel={handleCancelSearch} />
      ) : (
        <>
          <Box marginBottom={1}>
            <Text bold color="cyan">
              {view === "favorites" ? "Your Favorites" : "Browse Stations"}
              {searchQuery && ` - Search: "${searchQuery}"`}
            </Text>
          </Box>

          {loading ? (
            <Box>
              <Text color="green">
                <Spinner type="dots" /> Loading stations...
              </Text>
            </Box>
          ) : error ? (
            <Box>
              <Text color="red">Error: {error}</Text>
            </Box>
          ) : (
            <StationList
              stations={currentList}
              selectedIndex={selectedIndex}
              favoriteUuids={favoriteUuids}
              currentStationUuid={currentStation?.stationuuid}
            />
          )}
        </>
      )}

      <HelpBar />
    </Box>
  );
}
