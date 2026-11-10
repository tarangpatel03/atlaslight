import type { ReactNode } from 'react';
import { GeoJSONSource, Layer } from '@maplibre/maplibre-react-native';
import { visitedRegionPaint } from '@/theme/mapStyle';
import type { RegionData } from '@/utils/region.util';

interface VisitedRegionsProps {
  regions: RegionData;
}

// Fills sit under the base style's borders and labels so those stay readable.
const BELOW = 'state-borders';

/** Visited countries and Indian states or union territories, filled amber. */
export const VisitedRegions = ({ regions }: VisitedRegionsProps): ReactNode => (
  <>
    <GeoJSONSource id="visited-countries" data={regions.countries}>
      <Layer
        type="fill"
        id="visited-countries-fill"
        beforeId={BELOW}
        paint={visitedRegionPaint.fill}
      />
      <Layer
        type="line"
        id="visited-countries-outline"
        beforeId={BELOW}
        paint={visitedRegionPaint.outline}
      />
    </GeoJSONSource>
    <GeoJSONSource id="visited-states" data={regions.states}>
      <Layer
        type="fill"
        id="visited-states-fill"
        beforeId={BELOW}
        paint={visitedRegionPaint.fill}
      />
      <Layer
        type="line"
        id="visited-states-outline"
        beforeId={BELOW}
        paint={visitedRegionPaint.outline}
      />
    </GeoJSONSource>
  </>
);
