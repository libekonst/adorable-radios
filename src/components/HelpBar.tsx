import React from "react";
import { Box, Text } from "ink";

type Props = {
  view: string;
};

export function HelpBar({ view }: Props) {
  return (
    <Box
      borderStyle="round"
      borderColor="blue"
      paddingX={1}
      marginTop={1}
      flexDirection="column"
    >
      <Box>
        <Text bold color="blue">
          Controls:
        </Text>
      </Box>
      <Box>
        <Text>
          <Text color="yellow">↑/↓</Text> Navigate{" "}
          <Text color="yellow">Enter</Text> Play/Pause{" "}
          <Text color="yellow">Space</Text> Stop <Text color="yellow">+/-</Text>{" "}
          Volume
        </Text>
      </Box>
      <Box>
        <Text>
          <Text color="yellow">f</Text> Favorite <Text color="yellow">s</Text>{" "}
          Search <Text color="yellow">b</Text> Browse{" "}
          <Text color="yellow">v</Text> Favorites <Text color="yellow">q</Text>{" "}
          Quit
        </Text>
      </Box>
    </Box>
  );
}
