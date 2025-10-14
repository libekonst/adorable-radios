# Blissful Radios - Architecture Overview

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLI Entry Point                                │
│                          src/cli.tsx                                     │
│                    (Renders React/Ink App)                               │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      React/Ink UI Layer                                  │
│                      src/components/                                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                  │
│  │   App.tsx    │  │ NowPlaying   │  │ StationList  │                  │
│  │              │  │   .tsx       │  │    .tsx      │                  │
│  │ - State Mgmt │  │              │  │              │                  │
│  │ - Keyboard   │  │ - Current    │  │ - Browse UI  │                  │
│  │   Controls   │  │   Station    │  │ - Selection  │                  │
│  │              │  │ - Metadata   │  │ - Favorites  │                  │
│  └──────┬───────┘  └──────────────┘  └──────────────┘                  │
│         │                                                                │
│  ┌──────▼───────┐  ┌──────────────┐                                    │
│  │ SearchInput  │  │  HelpBar     │                                    │
│  │   .tsx       │  │   .tsx       │                                    │
│  │              │  │              │                                    │
│  │ - Search UI  │  │ - Controls   │                                    │
│  └──────────────┘  │   Guide      │                                    │
│                    └──────────────┘                                    │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         Service Layer                                    │
│                        src/services/                                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────┐        │
│  │              RadioPlayer (player.ts)                        │        │
│  │                                                             │        │
│  │  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌────────┐ │        │
│  │  │  HTTP    │──▶│   ICY    │──▶│   MPV    │──▶│ Audio  │ │        │
│  │  │ Stream   │   │ Metadata │   │ Process  │   │ Output │ │        │
│  │  │ (axios)  │   │  Parser  │   │ + IPC    │   │        │ │        │
│  │  └──────────┘   └──────────┘   └─────┬────┘   └────────┘ │        │
│  │                                       │                    │        │
│  │                                       ▼                    │        │
│  │                                ┌──────────────┐            │        │
│  │  Features:                     │ IPC Socket   │            │        │
│  │  - MPV subprocess management   │ (Volume Ctrl)│            │        │
│  │  - Supports all audio formats  └──────────────┘            │        │
│  │  - Real-time volume via IPC                                │        │
│  │  - Metadata extraction                                     │        │
│  └─────────────────────────────────────────────────────────────┘        │
│                                                                           │
│  ┌──────────────────────────┐    ┌───────────────────────────┐          │
│  │  RadioBrowserAPI         │    │  StorageManager           │          │
│  │  (radio-browser.ts)      │    │  (storage.ts)             │          │
│  │                          │    │                           │          │
│  │ - Search stations        │    │ - Save favorites          │          │
│  │ - Get top stations       │    │ - Persist settings        │          │
│  │ - Filter by country/tag  │    │ - Last played station     │          │
│  │ - Track clicks           │    │ - Volume preference       │          │
│  └──────────┬───────────────┘    └─────────┬─────────────────┘          │
│             │                               │                            │
└─────────────┼───────────────────────────────┼────────────────────────────┘
              │                               │
              ▼                               ▼
┌─────────────────────────┐    ┌──────────────────────────┐
│   Radio-Browser.info    │    │    Local File System     │
│   API (External)        │    │    ~/.config/            │
│                         │    │    blissful-radios/      │
│ - Station database      │    │                          │
│ - Metadata              │    │ - config.json (settings) │
└─────────────────────────┘    └──────────────────────────┘
```

## Component Flow

### 1. **User Interaction Flow**

```
User Keyboard Input
      │
      ▼
App.tsx (useInput hook)
      │
      ├─── Navigation (↑/↓) ──────▶ Update selectedIndex
      │
      ├─── Play/Pause (Enter) ────▶ RadioPlayer.play() ──▶ Audio Pipeline
      │
      ├─── Search (s) ────────────▶ SearchInput ──▶ RadioBrowserAPI.search()
      │
      ├─── Favorite (f) ──────────▶ StorageManager.toggleFavorite()
      │
      └─── Volume (+/-) ──────────▶ RadioPlayer.setVolume() ──▶ Volume Transform
```

### 2. **Audio Streaming Pipeline**

```
Station URL
      │
      ▼
HTTP Stream (axios)
      │
      ├─── Fetch audio stream metadata
      ├─── Extract ICY headers (station name)
      │
      ▼
MPV Subprocess
      │
      ├─── Decode all formats (MP3, AAC, OGG, FLAC, etc.)
      ├─── Handle various bitrates
      ├─── Apply volume level
      ├─── Parse StreamTitle (now playing)
      │
      ├─── IPC Socket (/tmp/mpv-socket-*)
      │         ↑
      │         │
      │    Volume commands from Node.js
      │    (real-time, no restart)
      │
      ▼
🔊 Your Speakers/Headphones
```

### 3. **State Management**

```
App.tsx State
      │
      ├─── view: 'browse' | 'favorites' | 'search'
      │
      ├─── playback: {
      │         isPlaying: boolean
      │         currentStation: RadioStation | null
      │         volume: number
      │         metadata: string
      │    }
      │
      ├─── stations: RadioStation[]  (from API)
      │
      ├─── favorites: RadioStation[] (from StorageManager)
      │
      └─── selectedIndex: number
```

## Key Architectural Decisions

### 1. **MPV-Based Audio Playback**
- Uses MPV media player for reliable audio playback
- Supports all audio formats (MP3, AAC, OGG, FLAC, HLS, etc.)
- Real-time volume control via IPC (Inter-Process Communication)
- No native compilation required (pure Node.js + system MPV)
- Industry-standard tool used by millions

### 2. **Event-Driven Player**
- `RadioPlayer` extends `EventEmitter`
- Components listen for `playing`, `stopped`, `error` events
- Decouples audio logic from UI

### 3. **React for Terminal UI**
- Uses Ink to render React components in terminal
- Familiar React patterns (hooks, state, effects)
- Component-based UI architecture

### 4. **IPC for Volume Control**
- Unix socket communication between Node.js and MPV
- JSON commands sent to `/tmp/mpv-socket-*`
- Real-time volume changes without restarting stream
- Instant response (<10ms latency)

### 5. **Persistent Storage**
- Uses `conf` package for cross-platform config
- Stores in `~/.config/blissful-radios/` (Linux/Mac)
- JSON-based, human-readable

## Data Flow Example: Playing a Station

```
1. User presses Enter on selected station
      ↓
2. App.tsx calls player.play(station)
      ↓
3. RadioPlayer.play():
   - Stops current playback
   - Fetches ICY metadata headers
   - Creates IPC socket path
   - Spawns MPV subprocess with station URL
   - Configures volume and IPC options
      ↓
4. RadioPlayer emits 'playing' event
      ↓
5. App.tsx updates state:
   - playback.isPlaying = true
   - playback.currentStation = station
      ↓
6. React re-renders:
   - NowPlaying shows station info
   - StationList highlights playing station
      ↓
7. Metadata updates every 2s:
   - App.tsx interval calls player.getMetadata()
   - Updates playback.metadata
   - NowPlaying shows current song
```

## File Structure

```
blissful-radios/
│
├── src/
│   ├── cli.tsx                 # Entry point - renders App
│   │
│   ├── types.ts                # TypeScript interfaces
│   │                           # - RadioStation, AppState, etc.
│   │
│   ├── components/             # React/Ink UI components
│   │   ├── App.tsx             # Main component (state + keyboard)
│   │   ├── NowPlaying.tsx      # Current station display
│   │   ├── StationList.tsx     # Browsable station list
│   │   ├── SearchInput.tsx     # Search interface
│   │   └── HelpBar.tsx         # Keyboard shortcuts
│   │
│   └── services/               # Business logic (no UI)
│       ├── player.ts           # Audio playback engine
│       ├── radio-browser.ts    # API client
│       └── storage.ts          # Persistence layer
│
├── package.json                # Dependencies + scripts
├── tsconfig.json               # TypeScript config
└── README.md                   # User documentation
```

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **UI Framework** | React + Ink | Terminal UI with familiar React patterns |
| **Language** | TypeScript | Type safety and developer experience |
| **Audio Playback** | MPV | Reliable audio playback with IPC control |
| **HTTP Client** | axios | Metadata fetching and API calls |
| **Storage** | conf | Cross-platform config persistence |
| **Build Tool** | tsc | TypeScript compilation |
| **Dev Tool** | tsx | TypeScript execution + watch mode |

## Design Patterns Used

1. **Service Layer Pattern**: Separation between UI (components) and business logic (services)
2. **Event Emitter Pattern**: Player communicates via events, not direct calls
3. **Stream Pipeline Pattern**: Audio processing through Transform streams
4. **Component Pattern**: Modular, reusable UI components
5. **Repository Pattern**: StorageManager abstracts persistence details

## Running Locally

See the main [README.md](README.md) for detailed instructions.