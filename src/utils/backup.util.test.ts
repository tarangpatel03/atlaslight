import {
  BACKUP_FORMAT,
  BACKUP_VERSION,
  backupFileName,
  backupMediaPaths,
  BACKUP_STAGES,
  buildBackupEntries,
  buildManifest,
  describeBackup,
  formatRestoreSummary,
  parseBackupData,
  countRows,
  overallProgress,
  requiredFreeSpace,
  validateBackup,
  type BackupData,
} from './backup.util';

const NOW = new Date(2026, 10, 11, 9, 30).getTime();

const sampleData = (): BackupData => ({
  journeys: [
    {
      id: 'j1',
      title: 'Spiti Valley',
      description: null,
      coverMediaId: 'm1',
      color: '#f5b544',
      startDate: 1000,
      endDate: null,
      isFavorite: true,
      createdAt: 1000,
      updatedAt: 1000,
    },
  ],
  stops: [
    {
      id: 's1',
      journeyId: 'j1',
      placeId: 'p1',
      latitude: 32.2,
      longitude: 78,
      altitude: 4300,
      title: 'Chandratal',
      note: null,
      mood: 'calm',
      visitedAt: 2000,
      orderIndex: 0,
      createdAt: 2000,
      updatedAt: 2000,
    },
    {
      id: 's2',
      journeyId: 'j1',
      placeId: null,
      latitude: 32.3,
      longitude: 78.1,
      altitude: null,
      title: 'Kaza',
      note: 'Tea stop',
      mood: null,
      visitedAt: 3000,
      orderIndex: 1,
      createdAt: 3000,
      updatedAt: 3000,
    },
  ],
  media: [
    {
      id: 'm1',
      stopId: 's1',
      type: 'photo',
      filePath: 'media/j1/m1.jpg',
      thumbnailPath: 'thumbs/j1/m1.jpg',
      width: 1200,
      height: 800,
      durationMs: null,
      takenAt: 2000,
      latitude: 32.2,
      longitude: 78,
      sourceAssetId: 'asset-1',
      sortOrder: 0,
      createdAt: 2000,
    },
    {
      id: 'm2',
      stopId: 's1',
      type: 'video',
      filePath: 'media/j1/m2.mp4',
      thumbnailPath: null,
      width: null,
      height: null,
      durationMs: 5000,
      takenAt: null,
      latitude: null,
      longitude: null,
      sourceAssetId: null,
      sortOrder: 1,
      createdAt: 2000,
    },
  ],
  places: [
    {
      id: 'p1',
      name: 'Chandratal',
      locality: null,
      adminArea: 'Himachal Pradesh',
      countryCode: 'IN',
      countryName: 'India',
      latitude: 32.2,
      longitude: 77.6,
      source: 'manual',
      createdAt: 1000,
    },
    {
      id: 'p2',
      name: 'Lisbon',
      locality: 'Lisbon',
      adminArea: null,
      countryCode: 'PT',
      countryName: 'Portugal',
      latitude: 38.7,
      longitude: -9.1,
      source: 'photon',
      createdAt: 1000,
    },
  ],
  wishlist: [{ id: 'w1', placeId: 'p2', note: null, createdAt: 1000 }],
});

const ENTRIES = [
  'manifest.json',
  'data.json',
  'media/j1/m1.jpg',
  'thumbs/j1/m1.jpg',
  'media/j1/m2.mp4',
];

/** Runs the validator on a backup of `data`, with the manifest built from the same rows unless overridden. */
const check = (
  data: unknown = sampleData(),
  options: { manifest?: unknown; entries?: string[] } = {},
): ReturnType<typeof validateBackup> =>
  validateBackup({
    // `in`, not `??`: a null manifest is a case under test, not "use the default".
    manifest: 'manifest' in options ? options.manifest : buildManifest(sampleData(), NOW, '1.0'),
    data,
    entries: options.entries ?? ENTRIES,
  });

const reasonOf = (result: ReturnType<typeof validateBackup>): string =>
  result.ok ? '' : result.reason;

describe('buildManifest', () => {
  it('describes the backup and counts every table', () => {
    expect(buildManifest(sampleData(), NOW, '1.0')).toEqual({
      format: BACKUP_FORMAT,
      version: BACKUP_VERSION,
      exportedAt: NOW,
      appVersion: '1.0',
      counts: { journeys: 1, stops: 2, media: 2, places: 2, wishlist: 1 },
    });
  });
});

describe('backupFileName', () => {
  it('uses the local date', () => {
    expect(backupFileName(NOW)).toBe('atlaslight-backup-2026-11-11.zip');
  });

  it('pads single-digit months and days', () => {
    expect(backupFileName(new Date(2027, 0, 5, 12).getTime())).toBe(
      'atlaslight-backup-2027-01-05.zip',
    );
  });
});

describe('backupMediaPaths', () => {
  it('lists each file and thumbnail once', () => {
    expect(backupMediaPaths(sampleData()).sort()).toEqual([
      'media/j1/m1.jpg',
      'media/j1/m2.mp4',
      'thumbs/j1/m1.jpg',
    ]);
  });
});

describe('validateBackup', () => {
  it('accepts a backup made from the same rows', () => {
    const result = check();
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toEqual(sampleData());
      expect(countRows(result.data)).toEqual(result.manifest.counts);
    }
  });

  it('accepts an empty journal', () => {
    const empty: BackupData = { journeys: [], stops: [], media: [], places: [], wishlist: [] };
    expect(
      validateBackup({ manifest: buildManifest(empty, NOW, '1.0'), data: empty, entries: [] }).ok,
    ).toBe(true);
  });

  it('ignores extra files in the zip', () => {
    expect(check(sampleData(), { entries: [...ENTRIES, 'notes.txt', 'media/j1/'] }).ok).toBe(true);
  });

  it('rejects a file that is not a backup', () => {
    expect(reasonOf(check(sampleData(), { manifest: { hello: 'world' } }))).toMatch(
      /not an Atlaslight backup/,
    );
    expect(reasonOf(check(sampleData(), { manifest: null }))).toMatch(/not an Atlaslight backup/);
    expect(
      reasonOf(
        check(sampleData(), {
          manifest: { ...buildManifest(sampleData(), NOW, '1.0'), format: 'other' },
        }),
      ),
    ).toMatch(/not an Atlaslight backup/);
  });

  it('asks for an app update when the backup is from a newer version', () => {
    const manifest = { format: BACKUP_FORMAT, version: BACKUP_VERSION + 1, somethingNew: true };
    expect(reasonOf(check(sampleData(), { manifest }))).toMatch(/newer version/);
  });

  it('rejects a manifest with missing details', () => {
    const full = buildManifest(sampleData(), NOW, '1.0');
    const withoutCounts = {
      format: full.format,
      version: full.version,
      exportedAt: NOW,
      appVersion: '1.0',
    };
    expect(reasonOf(check(sampleData(), { manifest: withoutCounts }))).toMatch(
      /details are incomplete/,
    );
  });

  it('names the table and row of damaged data', () => {
    const data = sampleData();
    const broken = { ...data, stops: [data.stops[0], { ...data.stops[1], title: 42 }] };
    expect(reasonOf(check(broken))).toBe('The backup data is damaged (stops, row 2).');
  });

  it('rejects a missing table', () => {
    const data = sampleData();
    const withoutWishlist = {
      journeys: data.journeys,
      stops: data.stops,
      media: data.media,
      places: data.places,
    };
    expect(reasonOf(check(withoutWishlist))).toMatch(/data is damaged/);
  });

  it('rejects values outside the allowed lists and ranges', () => {
    const data = sampleData();
    expect(reasonOf(check({ ...data, stops: [{ ...data.stops[0], mood: 'angry' }] }))).toMatch(
      /damaged/,
    );
    expect(reasonOf(check({ ...data, media: [{ ...data.media[0], type: 'audio' }] }))).toMatch(
      /damaged/,
    );
    expect(reasonOf(check({ ...data, places: [{ ...data.places[0], source: 'web' }] }))).toMatch(
      /damaged/,
    );
    expect(reasonOf(check({ ...data, stops: [{ ...data.stops[0], latitude: 91 }] }))).toMatch(
      /damaged/,
    );
  });

  it('rejects data that does not match the manifest counts', () => {
    const data = sampleData();
    const truncated = { ...data, media: [data.media[0]] };
    expect(reasonOf(check(truncated))).toBe(
      'The backup is incomplete: expected 2 media but found 1.',
    );
  });

  it('rejects a repeated id', () => {
    const data = sampleData();
    const duplicated = { ...data, stops: [data.stops[0], { ...data.stops[1], id: 's1' }] };
    expect(reasonOf(check(duplicated))).toBe('The backup repeats an id in stops.');
  });

  it('rejects the same camera-roll photo listed twice', () => {
    const data = sampleData();
    const duplicated = {
      ...data,
      media: [data.media[0], { ...data.media[1], sourceAssetId: 'asset-1' }],
    };
    expect(reasonOf(check(duplicated))).toMatch(/same photo twice/);
  });

  describe('references', () => {
    it('rejects a journey cover that does not exist', () => {
      const data = sampleData();
      const broken = { ...data, journeys: [{ ...data.journeys[0], coverMediaId: 'nope' }] };
      expect(reasonOf(check(broken))).toMatch(/cover photo/);
    });

    it('rejects a memory without its journey', () => {
      const data = sampleData();
      const broken = { ...data, stops: [{ ...data.stops[0], journeyId: 'nope' }, data.stops[1]] };
      expect(reasonOf(check(broken))).toMatch(/journey that is not in the backup/);
    });

    it('rejects a memory with an unknown place', () => {
      const data = sampleData();
      const broken = { ...data, stops: [{ ...data.stops[0], placeId: 'nope' }, data.stops[1]] };
      expect(reasonOf(check(broken))).toMatch(/memory uses a place/);
    });

    it('rejects media without its memory', () => {
      const data = sampleData();
      const broken = { ...data, media: [{ ...data.media[0], stopId: 'nope' }, data.media[1]] };
      expect(reasonOf(check(broken))).toMatch(/memory that is not in the backup/);
    });

    it('rejects a wishlist entry with an unknown place', () => {
      const data = sampleData();
      const broken = { ...data, wishlist: [{ ...data.wishlist[0], placeId: 'nope' }] };
      expect(reasonOf(check(broken))).toMatch(/wishlist entry/);
    });

    it('rejects the same place on the wishlist twice', () => {
      const data = sampleData();
      const broken = { ...data, wishlist: [data.wishlist[0], { ...data.wishlist[0], id: 'w2' }] };
      expect(reasonOf(check(broken, { manifest: buildManifest(broken, NOW, '1.0') }))).toMatch(
        /same place twice/,
      );
    });
  });

  describe('paths', () => {
    const withFilePath = (filePath: string): BackupData => {
      const data = sampleData();
      return { ...data, media: [{ ...data.media[0], filePath }, data.media[1]] };
    };

    it.each([
      '../evil.jpg',
      'media/../../evil.jpg',
      '/etc/passwd',
      'media\\j1\\m1.jpg',
      'media//m1.jpg',
      'photos/m1.jpg',
    ])('rejects the media path %s', (path) => {
      const data = withFilePath(path);
      const entries = [...ENTRIES, path];
      // Entries with an unsafe name fail first; either way the backup is refused.
      expect(check(data, { entries }).ok).toBe(false);
      expect(check(data).ok).toBe(false);
    });

    it('rejects a thumbnail path outside the thumbs folder', () => {
      const data = sampleData();
      const broken = {
        ...data,
        media: [{ ...data.media[0], thumbnailPath: 'media/j1/m1.jpg' }, data.media[1]],
      };
      expect(reasonOf(check(broken))).toMatch(/thumbnail outside/);
    });

    it('rejects zip entries with an unsafe name even when no row uses them', () => {
      for (const name of ['../evil', '/abs/file', 'a\\b', 'media/../x']) {
        expect(reasonOf(check(sampleData(), { entries: [...ENTRIES, name] }))).toMatch(
          /unsafe name/,
        );
      }
    });
  });

  describe('files', () => {
    it('rejects a media file that is not in the zip', () => {
      const entries = ENTRIES.filter((name) => name !== 'media/j1/m2.mp4');
      expect(reasonOf(check(sampleData(), { entries }))).toMatch(/missing from the backup file/);
    });

    it('drops a thumbnail that is not in the zip instead of failing', () => {
      const entries = ENTRIES.filter((name) => name !== 'thumbs/j1/m1.jpg');
      const result = check(sampleData(), { entries });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.media[0].thumbnailPath).toBeNull();
        expect(result.data.media[0].filePath).toBe('media/j1/m1.jpg');
      }
    });
  });
});

describe('overallProgress', () => {
  it('starts at 0 and ends at 1', () => {
    expect(overallProgress('reading', 0)).toBe(0);
    expect(overallProgress('saving', 1)).toBeCloseTo(1, 10);
  });

  it('places a stage after the ones before it', () => {
    expect(overallProgress('media', 0)).toBeCloseTo(0.05, 10);
    expect(overallProgress('media', 0.5)).toBeCloseTo(0.35, 10);
    expect(overallProgress('thumbs', 0)).toBeCloseTo(0.65, 10);
  });

  it('clamps a fraction outside 0 to 1', () => {
    expect(overallProgress('media', -1)).toBeCloseTo(0.05, 10);
    expect(overallProgress('media', 2)).toBeCloseTo(0.65, 10);
  });

  it('never goes backwards across the stages', () => {
    let last = -1;
    for (const stage of BACKUP_STAGES) {
      for (const fraction of [0, 0.25, 0.5, 0.75, 1]) {
        const value = overallProgress(stage.id, fraction);
        expect(value).toBeGreaterThanOrEqual(last);
        last = value;
      }
    }
  });

  it('gives the stages shares that add up to the whole bar', () => {
    expect(BACKUP_STAGES.reduce((sum, stage) => sum + stage.weight, 0)).toBeCloseTo(1, 10);
  });
});

describe('requiredFreeSpace', () => {
  it('is twice the media plus a 20 MB margin', () => {
    expect(requiredFreeSpace(0)).toBe(20 * 1024 * 1024);
    expect(requiredFreeSpace(100 * 1024 * 1024)).toBe(220 * 1024 * 1024);
  });
});

describe('buildBackupEntries', () => {
  it('keeps the outer names and prefixes the names inside the inner zips', () => {
    expect(
      buildBackupEntries({
        outer: ['manifest.json', 'data.json', 'media.zip', 'thumbs.zip'],
        media: ['j1/m1.jpg', 'j1/'],
        thumbs: ['j1/m1.jpg'],
      }),
    ).toEqual([
      'manifest.json',
      'data.json',
      'media.zip',
      'thumbs.zip',
      'media/j1/m1.jpg',
      'media/j1/',
      'thumbs/j1/m1.jpg',
    ]);
  });

  it('makes a nested backup pass validation like a flat one', () => {
    const entries = buildBackupEntries({
      outer: ['manifest.json', 'data.json', 'media.zip', 'thumbs.zip'],
      media: ['j1/', 'j1/m1.jpg', 'j1/m2.mp4'],
      thumbs: ['j1/', 'j1/m1.jpg'],
    });
    expect(check(sampleData(), { entries }).ok).toBe(true);
  });

  it('still refuses an unsafe name inside an inner zip', () => {
    const entries = buildBackupEntries({
      outer: ['manifest.json', 'data.json', 'media.zip'],
      media: ['j1/m1.jpg', 'j1/m2.mp4', '../evil.jpg'],
      thumbs: ['j1/m1.jpg'],
    });
    expect(reasonOf(check(sampleData(), { entries }))).toMatch(/unsafe name/);
  });
});

describe('describeBackup and formatRestoreSummary', () => {
  it('counts photos and videos apart', () => {
    const summary = describeBackup(sampleData(), buildManifest(sampleData(), NOW, '1.0'));
    expect(summary).toEqual({
      journeyCount: 1,
      stopCount: 2,
      photoCount: 1,
      videoCount: 1,
      exportedAt: NOW,
    });
  });

  it('writes the question for the confirmation', () => {
    const summary = describeBackup(sampleData(), buildManifest(sampleData(), NOW, '1.0'));
    expect(formatRestoreSummary(summary)).toBe(
      'Replaces everything on this phone with the backup from 11 Nov 2026: 1 journey, 2 memories, 1 photo and 1 video. Your current journal is deleted. Your settings stay. This cannot be undone.',
    );
  });

  it('leaves videos out when there are none', () => {
    const text = formatRestoreSummary({
      journeyCount: 7,
      stopCount: 31,
      photoCount: 32,
      videoCount: 0,
      exportedAt: NOW,
    });
    expect(text).toContain('7 journeys, 31 memories and 32 photos.');
  });
});

describe('parseBackupData', () => {
  it('returns the rows when the shape is right', () => {
    expect(parseBackupData(JSON.parse(JSON.stringify(sampleData())))).toEqual(sampleData());
  });

  it('returns null for anything else', () => {
    expect(parseBackupData(null)).toBeNull();
    expect(parseBackupData({ journeys: [] })).toBeNull();
  });
});
