import axios from "axios";
import type { RadioStation } from "../types.js";

export class RadioBrowserAPI {
  private baseUrl: string = "https://fi1.api.radio-browser.info/json";

  async getTopStations(limit: number = 50): Promise<RadioStation[]> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/stations/topvote/${limit}`
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch top stations: ${error}`);
    }
  }

  async searchStations(
    query: string,
    limit: number = 50
  ): Promise<RadioStation[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/stations/search`, {
        params: {
          name: query,
          limit,
          hidebroken: true,
          order: "votes",
          reverse: true,
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to search stations: ${error}`);
    }
  }

  async getStationsByCountry(
    countryCode: string,
    limit: number = 50
  ): Promise<RadioStation[]> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/stations/bycountrycodeexact/${countryCode}`,
        {
          params: {
            limit,
            hidebroken: true,
            order: "votes",
            reverse: true,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch stations by country: ${error}`);
    }
  }

  async getStationsByTag(
    tag: string,
    limit: number = 50
  ): Promise<RadioStation[]> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/stations/bytagexact/${tag}`,
        {
          params: {
            limit,
            hidebroken: true,
            order: "votes",
            reverse: true,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch stations by tag: ${error}`);
    }
  }

  async getStationsByLanguage(
    language: string,
    limit: number = 50
  ): Promise<RadioStation[]> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/stations/bylanguageexact/${language}`,
        {
          params: {
            limit,
            hidebroken: true,
            order: "votes",
            reverse: true,
          },
        }
      );
      return response.data;
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
      await axios.get(`${this.baseUrl}/url/${stationUuid}`);
    } catch (error) {
      // Ignore errors, this is just for tracking
    }
  }
}
