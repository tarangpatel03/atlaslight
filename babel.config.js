module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    ['inline-import', { extensions: ['.sql'] }],
    // Keep in sync with `paths` in tsconfig.json: `@/` points at `src/`.
    ['module-resolver', { root: ['.'], alias: { '@': './src' } }],
    // Reanimated 4 moved its Babel plugin into react-native-worklets; it must stay last.
    'react-native-worklets/plugin',
  ],
};
