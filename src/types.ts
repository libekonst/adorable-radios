export interface RadioStation {
  stationuuid: string;
  name: string;
  url: string;
  url_resolved: string;
  homepage: string;
  favicon: string;
  tags: string;
  country: string;
  countrycode: string;
  state: string;
  language: string;
  votes: number;
  codec: string;
  bitrate: number;
  lastcheckok: number;
}

export interface PlaybackState {
  isPlaying: boolean;
  currentStation: RadioStation | null;
  volume: number;
  metadata: string;
}

export interface AppState {
  view: 'browse' | 'favorites' | 'search' | 'playing';
  playback: PlaybackState;
  stations: RadioStation[];
  favorites: RadioStation[];
  searchQuery: string;
  selectedIndex: number;
  loading: boolean;
  error: string | null;
}