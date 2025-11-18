import React from "react";
import { Box, Text } from "ink";
import { RadioStation } from "../types.js";

type Props = {
  stations: RadioStation[];
  selectedIndex: number;
  favoriteUuids: Set<string>;
  currentStationUuid?: string;
};

export function StationList({
  stations,
  selectedIndex,
  favoriteUuids,
  currentStationUuid,
}: Props) {
  if (stations.length === 0) {
    return (
      <Box marginTop={1}>
        <Text color="gray">No stations found</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" marginTop={1}>
      {stations.slice(0, 15).map((station, index) => {
        const isSelected = index === selectedIndex;
        const isFavorite = favoriteUuids.has(station.stationuuid);
        const isPlaying = station.stationuuid === currentStationUuid;

        return (
          <Box key={station.stationuuid} marginBottom={0}>
            <Text color={isSelected ? "cyan" : "white"} bold={isSelected}>
              {isSelected ? "> " : "  "}
              {isPlaying ? "♫ " : ""}
              {station.name}
              {isFavorite ? " ★" : ""}
            </Text>
            <Text color="gray" dimColor>
              {" "}
              ({station.country || "Unknown"})
              {station.bitrate > 0 ? ` ${station.bitrate}kbps` : ""}
            </Text>
          </Box>
        );
      })}
      {stations.length > 15 && (
        <Box marginTop={1}>
          <Text color="gray">... and {stations.length - 15} more stations</Text>
        </Box>
      )}
    </Box>
  );
}
