import { Box, Text } from "ink";
import Spinner from "ink-spinner";
import React from "react";
import type { RadioStation } from "../types";
import { StationList } from "./StationList";

type Props = {
  searchQuery: string;
  loading: boolean;
  error: string | null;
  radios: RadioStation[];
  selectedIndex: number;
  favoriteUuids: Set<string>;
  currentStation?: RadioStation | null;
};
export function BrowseView(props: Props) {
  const {
    searchQuery,
    loading,
    error,
    radios,
    selectedIndex,
    favoriteUuids,
    currentStation,
  } = props;
  return (
    <>
      <Box marginBottom={1}>
        <Text bold color="cyan">
          Browse Stations
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
          stations={radios}
          selectedIndex={selectedIndex}
          favoriteUuids={favoriteUuids}
          currentStationUuid={currentStation?.stationuuid}
        />
      )}
    </>
  );
}
