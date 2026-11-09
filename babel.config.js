module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    // zod 4 ships ES modules that use `export * as ns`, which the React Native preset does not transform.
    '@babel/plugin-transform-export-namespace-from',
    ['inline-import', { extensions: ['.sql'] }],
    // Keep in sync with `paths` in tsconfig.json: `@/` points at `src/`.
    ['module-resolver', { root: ['.'], alias: { '@': './src' } }],
    // Reanimated 4 moved its Babel plugin into react-native-worklets; it must stay last.
    'react-native-worklets/plugin',
  ],
};
