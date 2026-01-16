import { useQuery } from "@tanstack/react-query";
import { RadioBrowserAPI } from "../services/radio-browser.js";

const api = new RadioBrowserAPI();

export function useTopStations(limit = 100) {
  return useQuery({
    queryKey: ["stations", "top", limit],
    queryFn: () => api.getTopStations(limit),
  });
}

export function useSearchStations(query: string, limit = 50) {
  return useQuery({
    queryKey: ["stations", "search", query, limit],
    queryFn: () => api.searchStations(query, limit),
    enabled: query.length > 0,
  });
}

export function useStationsByCountry(countryCode: string, limit = 50) {
  return useQuery({
    queryKey: ["stations", "country", countryCode, limit],
    queryFn: () => api.getStationsByCountry(countryCode, limit),
    enabled: countryCode.length > 0,
  });
}

export function useStationsByTag(tag: string, limit = 50) {
  return useQuery({
    queryKey: ["stations", "tag", tag, limit],
    queryFn: () => api.getStationsByTag(tag, limit),
    enabled: tag.length > 0,
  });
}

export function useStationsByLanguage(language: string, limit = 50) {
  return useQuery({
    queryKey: ["stations", "language", language, limit],
    queryFn: () => api.getStationsByLanguage(language, limit),
    enabled: language.length > 0,
  });
}
