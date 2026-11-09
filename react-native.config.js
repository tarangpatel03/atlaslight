// Links the Atlaslight fonts into the Android (and iOS) projects.
// Also links the demo photos (src/assets/demo/photos). After adding or changing files in either folder, run: npx react-native-asset
module.exports = {
  project: {
    ios: {},
    android: {},
  },
  assets: ['./src/assets/fonts', './src/assets/demo/photos'],
};
