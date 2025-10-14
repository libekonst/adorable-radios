import React, { useState } from 'react';
import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';

interface SearchInputProps {
  onSearch: (query: string) => void;
  onCancel: () => void;
}

export const SearchInput: React.FC<SearchInputProps> = ({ onSearch, onCancel }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = () => {
    if (query.trim()) {
      onSearch(query.trim());
    } else {
      onCancel();
    }
  };

  return (
    <Box flexDirection="column" marginBottom={1}>
      <Box marginBottom={0}>
        <Text color="cyan" bold>
          Search stations:{' '}
        </Text>
        <TextInput
          value={query}
          onChange={setQuery}
          onSubmit={handleSubmit}
        />
      </Box>
      <Box>
        <Text color="gray" dimColor>
          Press Enter to search, Esc to cancel
        </Text>
      </Box>
    </Box>
  );
};