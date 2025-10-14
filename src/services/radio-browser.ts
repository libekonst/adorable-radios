import axios from "axios";
import { RadioStation } from "../types.js";

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

  async clickStation(stationUuid: string): Promise<void> {
    try {
      await axios.get(`${this.baseUrl}/url/${stationUuid}`);
    } catch (error) {
      // Ignore errors, this is just for tracking
    }
  }
}
