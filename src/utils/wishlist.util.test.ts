import { placeSubtitle } from './wishlist.util';

describe('placeSubtitle', () => {
  it('joins locality, state and country', () => {
    expect(
      placeSubtitle({
        name: 'Hampi',
        locality: 'Hosapete',
        adminArea: 'Karnataka',
        countryName: 'India',
      }),
    ).toBe('Hosapete, Karnataka, India');
  });

  it('leaves out missing parts and parts equal to the name', () => {
    expect(
      placeSubtitle({ name: 'Kyoto', locality: 'Kyoto', adminArea: null, countryName: 'Japan' }),
    ).toBe('Japan');
    expect(
      placeSubtitle({ name: 'Nowhere', locality: null, adminArea: null, countryName: null }),
    ).toBe('');
  });
});
