import { useCallback, useEffect, useRef, useState } from 'react';
import type { Position } from 'geojson';
import { routeSlice } from '@/utils/mapFeatures.util';

/** How long the line takes to draw, whatever the distance. */
const REPLAY_MS = 6000;
// The line is a GeoJSON source update, so ~30 updates a second is smooth enough and cheap.
const FRAME_MS = 33;

export type RouteReplay = {
  replaying: boolean;
  /** The part of the route drawn so far while replaying; null otherwise. */
  slice: { line: Position[]; head: Position } | null;
  start: () => void;
};

/** Replay route: grows the route line from its start to its end, once per `start()`. */
export const useRouteReplay = (coordinates: Position[]): RouteReplay => {
  const [slice, setSlice] = useState<RouteReplay['slice']>(null);
  const [replaying, setReplaying] = useState(false);
  const frame = useRef<number | null>(null);

  const stop = useCallback((): void => {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;
  }, []);

  const start = useCallback((): void => {
    stop();
    const startedAt = Date.now();
    let lastDrawn = 0;
    setReplaying(true);

    const tick = (): void => {
      const elapsed = Date.now() - startedAt;
      if (elapsed >= REPLAY_MS) {
        frame.current = null;
        setSlice(null);
        setReplaying(false);
        return;
      }
      if (elapsed - lastDrawn >= FRAME_MS) {
        lastDrawn = elapsed;
        setSlice(routeSlice(coordinates, elapsed / REPLAY_MS));
      }
      frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
  }, [coordinates, stop]);

  // Leaving the screen mid-replay must not keep the loop running.
  useEffect(() => stop, [stop]);

  return { replaying, slice, start };
};
