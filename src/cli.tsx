#!/usr/bin/env node
import React from 'react';
import { render } from 'ink';
import { App } from './components/App.js';
import { QueryProvider } from './providers/QueryProvider.js';

render(
  <QueryProvider>
    <App />
  </QueryProvider>
);