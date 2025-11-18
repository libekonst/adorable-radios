import React from "react";
import { Box, Text } from "ink";
import { RadioStation } from "../types.js";

type Props = {
  station: RadioStation | null;
  isPlaying: boolean;
  volume: number;
  metadata: string;
};

export function NowPlaying({ station, isPlaying, volume, metadata }: Props) {
  if (!station) {
    return (
      <Box borderStyle="round" borderColor="gray" paddingX={1} marginBottom={1}>
        <Text color="gray">No station playing</Text>
      </Box>
    );
  }

  return (
    <Box
      borderStyle="round"
      borderColor={isPlaying ? "green" : "yellow"}
      paddingX={1}
      marginBottom={1}
      flexDirection="column"
    >
      <Box>
        <Text bold color={isPlaying ? "green" : "yellow"}>
          {isPlaying ? "♫ " : "⏸ "}
          {station.name}
        </Text>
      </Box>
      {metadata && (
        <Box marginTop={0}>
          <Text color="cyan">Now: {metadata}</Text>
        </Box>
      )}
      <Box marginTop={0}>
        <Text color="gray">
          {station.country && `${station.country} • `}
          {station.codec && `${station.codec} `}
          {station.bitrate > 0 && `${station.bitrate}kbps`}
        </Text>
      </Box>
      <Box marginTop={0}>
        <Text color="magenta">Volume: {volume}%</Text>
      </Box>
    </Box>
  );
}
