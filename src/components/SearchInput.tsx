import { Box, Text } from "ink";
import TextInput from "ink-text-input";
import React, { useState } from "react";

type Props = {
  onSearch: (query: string) => void;
  onCancel: () => void;
};

export function SearchInput({ onSearch, onCancel }: Props) {
  const [query, setQuery] = useState("");

  const handleSubmit = () => {
    const trimmedQuery = query.trim();
    if (trimmedQuery) {
      onSearch(trimmedQuery);
    } else {
      onCancel();
    }
  };

  return (
    <Box flexDirection="column" marginBottom={1}>
      <Box marginBottom={0}>
        <Text color="cyan" bold>
          Search stations:{" "}
        </Text>
        <TextInput value={query} onChange={setQuery} onSubmit={handleSubmit} />
      </Box>
      <Box>
        <Text color="gray" dimColor>
          Press Enter to search, Esc to cancel
        </Text>
      </Box>
    </Box>
  );
}
