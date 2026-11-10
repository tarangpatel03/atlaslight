import { locationErrorKind } from './location.util';

describe('locationErrorKind', () => {
  it('maps a refused permission to denied', () => {
    expect(locationErrorKind(1)).toBe('denied');
  });

  it('maps no position and timeouts to unavailable', () => {
    expect(locationErrorKind(2)).toBe('unavailable');
    expect(locationErrorKind(3)).toBe('unavailable');
  });

  it('treats an unknown code as unavailable', () => {
    expect(locationErrorKind(0)).toBe('unavailable');
    expect(locationErrorKind(99)).toBe('unavailable');
  });
});
