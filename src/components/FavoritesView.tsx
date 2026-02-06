import { Box, Text } from "ink";
import React from "react";
import type { RadioStation } from "../types";
import { StationList } from "./StationList";

type Props = {
  radios: RadioStation[];
  selectedIndex: number;
  favoriteUuids: Set<string>;
  currentStation?: RadioStation | null;
};

export function FavoritesView(props: Props) {
  const { radios, selectedIndex, favoriteUuids, currentStation } = props;

  return (
    <>
      <Box marginBottom={1}>
        <Text bold color="cyan">
          Your Favorites
        </Text>
      </Box>

      {radios.length === 0 ? (
        <Box marginTop={1}>
          <Text color="gray">
            No favorite stations yet. Press "s" to search, then "f" to add to
            favorites!
          </Text>
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
