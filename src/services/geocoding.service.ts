import { parsePhotonResponse, type PlaceSuggestion } from '@/utils/photon.util';

/**
 * Photon (komoot) place search and reverse geocoding. Free, no key; fair use means a descriptive
 * User-Agent, a debounced search (the screen waits 400 ms) and caching every result (places.api).
 * Only the typed text, or one coordinate pair, leaves the device.
 */
const BASE_URL = 'https://photon.komoot.io';
const TIMEOUT_MS = 8000;
const MIN_QUERY_LENGTH = 3;
const RESULT_LIMIT = 6;
const NETWORK_MESSAGE = "Can't reach place search. Check your connection.";

const fetchPhoton = async (path: string, signal?: AbortSignal): Promise<unknown> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const cancel = (): void => controller.abort();
  signal?.addEventListener('abort', cancel);
  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      headers: { 'User-Agent': 'Atlaslight' },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(NETWORK_MESSAGE);
    return await response.json();
  } catch (e) {
    // A cancel from the caller (the user kept typing) is not a network problem.
    if (signal?.aborted) throw e;
    throw new Error(NETWORK_MESSAGE);
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', cancel);
  }
};

/** Places matching the typed text; empty for fewer than 3 characters. */
export const searchPlaces = async (
  query: string,
  signal?: AbortSignal,
): Promise<PlaceSuggestion[]> => {
  const text = query.trim();
  if (text.length < MIN_QUERY_LENGTH) return [];
  const json = await fetchPhoton(
    `/api/?q=${encodeURIComponent(text)}&limit=${RESULT_LIMIT}&lang=en`,
    signal,
  );
  return parsePhotonResponse(json);
};

/** The place at a point, or null when Photon knows nothing there (open sea, wilderness). */
export const reversePlace = async (
  latitude: number,
  longitude: number,
  signal?: AbortSignal,
): Promise<PlaceSuggestion | null> => {
  const json = await fetchPhoton(`/reverse?lat=${latitude}&lon=${longitude}&lang=en`, signal);
  return parsePhotonResponse(json)[0] ?? null;
};
