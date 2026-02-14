import { Box, Text, useApp, useInput } from "ink";
import React, { useEffect, useState } from "react";
import { usePlaybackStatus } from "../hooks/usePlaybackStatus.js";
import {
  useSearchStations,
  useTopStations,
} from "../hooks/useRadioStations.js";
import { RadioPlayer } from "../services/player.js";
import { StorageManager } from "../services/storage.js";
import { BrowseView } from "./BrowseView.js";
import { FavoritesView } from "./FavoritesView.js";
import { HelpBar } from "./HelpBar.js";
import { NowPlaying } from "./NowPlaying.js";
import { SearchInput } from "./SearchInput.js";

// TODO proper singleton pattern for testability and lazy initialization (save startup time/memory)
export const player = new RadioPlayer();
export const storage = new StorageManager();

type ViewRoute = "browse" | "favorites" | "search";

export function App() {
  const { exit } = useApp();
  const [view, setView] = useState<ViewRoute>("browse");
  const [favorites, setFavorites] = useState(storage.getFavorites());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

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
    if (view === "search" && input !== "\u001B") {
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
    } else if (key.return && view !== "search") {
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
      setView("search");
    } else if (input === "b") {
      setView("browse");
      setSelectedIndex(0);
    } else if (input === "v") {
      setView(currentView =>
        currentView === "favorites" ? "browse" : "favorites"
      );
      setSelectedIndex(0);
    } else if (input === "\u001B" && view === "search") {
      setView("browse");
      setSelectedIndex(0);
    }
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setView("browse");
    setSelectedIndex(0);
  };

  const handleCancelSearch = () => {
    setView("browse");
    setSelectedIndex(0);
  };

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

      {view === "favorites" && (
        <FavoritesView
          radios={favorites}
          selectedIndex={selectedIndex}
          favoriteUuids={favoriteUuids}
          currentStation={currentStation}
        />
      )}

      {view === "browse" && (
        <BrowseView
          radios={stations}
          selectedIndex={selectedIndex}
          favoriteUuids={favoriteUuids}
          currentStation={currentStation}
          searchQuery={searchQuery}
          loading={loading}
          error={error}
        />
      )}

      {view === "search" && (
        <SearchInput onSearch={handleSearch} onCancel={handleCancelSearch} />
      )}

      <HelpBar />
    </Box>
  );
}
