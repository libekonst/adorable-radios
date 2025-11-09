import Conf from 'conf';
import { RadioStation } from '../types.js';

interface StoreSchema {
  favorites: RadioStation[];
  lastPlayed: RadioStation | null;
  volume: number;
}

export class StorageManager {
  private config: Conf<StoreSchema>;

  constructor() {
    this.config = new Conf<StoreSchema>({
      projectName: 'adorable-radios',
      defaults: {
        favorites: [],
        lastPlayed: null,
        volume: 50,
      },
    });
  }

  getFavorites(): RadioStation[] {
    return this.config.get('favorites');
  }

  addFavorite(station: RadioStation): void {
    const favorites = this.getFavorites();
    const exists = favorites.some(fav => fav.stationuuid === station.stationuuid);

    if (!exists) {
      favorites.push(station);
      this.config.set('favorites', favorites);
    }
  }

  removeFavorite(stationUuid: string): void {
    const favorites = this.getFavorites();
    const filtered = favorites.filter(fav => fav.stationuuid !== stationUuid);
    this.config.set('favorites', filtered);
  }

  isFavorite(stationUuid: string): boolean {
    const favorites = this.getFavorites();
    return favorites.some(fav => fav.stationuuid === stationUuid);
  }

  toggleFavorite(station: RadioStation): boolean {
    if (this.isFavorite(station.stationuuid)) {
      this.removeFavorite(station.stationuuid);
      return false;
    } else {
      this.addFavorite(station);
      return true;
    }
  }

  setLastPlayed(station: RadioStation | null): void {
    this.config.set('lastPlayed', station);
  }

  getLastPlayed(): RadioStation | null {
    return this.config.get('lastPlayed');
  }

  setVolume(volume: number): void {
    this.config.set('volume', volume);
  }

  getVolume(): number {
    return this.config.get('volume');
  }

  clear(): void {
    this.config.clear();
  }
}