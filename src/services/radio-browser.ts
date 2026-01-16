import type { RadioStation } from "../types.js";

// TODO fix radio browser server URL changing - do DNS lookup https://api.radio-browser.info/
export class RadioBrowserAPI {
  private baseUrl: string = "https://de1.api.radio-browser.info/json";

  private buildUrl(path: string, params?: Record<string, any>): string {
    const url = new URL(`${this.baseUrl}${path}`);
    if (!params) {
      return url.toString();
    }

    Object.entries(params)
      .filter(([_, value]) => value != null)
      .forEach(([key, value]) => {
        const values = Array.isArray(value) ? value : [value];
        values.forEach(v => {
          url.searchParams.append(key, String(v));
        });
      });

    return url.toString();
  }

  async getTopStations(limit: number = 50): Promise<RadioStation[]> {
    try {
      const response = await fetch(this.buildUrl(`/stations/topvote/${limit}`));
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return (await response.json()) as RadioStation[];
    } catch (error) {
      throw new Error(`Failed to fetch top stations: ${error}`);
    }
  }

  async searchStations(
    query: string,
    limit: number = 50
  ): Promise<RadioStation[]> {
    try {
      const response = await fetch(
        this.buildUrl("/stations/search", {
          name: query,
          limit,
          hidebroken: true,
          order: "votes",
          reverse: true,
        })
      );
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return (await response.json()) as RadioStation[];
    } catch (error) {
      throw new Error(`Failed to search stations: ${error}`);
    }
  }

  async getStationsByCountry(
    countryCode: string,
    limit: number = 50
  ): Promise<RadioStation[]> {
    try {
      const response = await fetch(
        this.buildUrl(`/stations/bycountrycodeexact/${countryCode}`, {
          limit,
          hidebroken: true,
          order: "votes",
          reverse: true,
        })
      );
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return (await response.json()) as RadioStation[];
    } catch (error) {
      throw new Error(`Failed to fetch stations by country: ${error}`);
    }
  }

  async getStationsByTag(
    tag: string,
    limit: number = 50
  ): Promise<RadioStation[]> {
    try {
      const response = await fetch(
        this.buildUrl(`/stations/bytagexact/${tag}`, {
          limit,
          hidebroken: true,
          order: "votes",
          reverse: true,
        })
      );
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return (await response.json()) as RadioStation[];
    } catch (error) {
      throw new Error(`Failed to fetch stations by tag: ${error}`);
    }
  }

  async getStationsByLanguage(
    language: string,
    limit: number = 50
  ): Promise<RadioStation[]> {
    try {
      const response = await fetch(
        this.buildUrl(`/stations/bylanguageexact/${language}`, {
          limit,
          hidebroken: true,
          order: "votes",
          reverse: true,
        })
      );
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return (await response.json()) as RadioStation[];
    } catch (error) {
      throw new Error(`Failed to fetch stations by language: ${error}`);
    }
  }

  // TODO: Optional analytics tracking for Radio Browser API
  // Calling this endpoint increments the station's click counter, helping the community
  // identify popular stations. Only counts once per IP per station per day.
  // Should be opt-in with user consent before implementing.
  // Usage: await api.clickStation(station.stationuuid) when playing a new station
  async clickStation(stationUuid: string): Promise<void> {
    try {
      await fetch(this.buildUrl(`/url/${stationUuid}`));
    } catch (error) {
      // Ignore errors, this is just for tracking
    }
  }
}
