const js = require('@eslint/js');
const { defineConfig, globalIgnores } = require('eslint/config');
const prettier = require('eslint-config-prettier');
const reactHooks = require('eslint-plugin-react-hooks');
const tseslint = require('typescript-eslint');

module.exports = defineConfig([
  globalIgnores([
    'node_modules',
    'android',
    'ios',
    'coverage',
    '.claude',
    '*.config.js',
    'index.js',
  ]),
  js.configs.recommended,
  tseslint.configs.recommended,
  reactHooks.configs.flat.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/explicit-module-boundary-types': 'error',
      '@typescript-eslint/ban-ts-comment': [
        'error',
        { 'ts-ignore': true, 'ts-expect-error': true, 'ts-nocheck': true },
      ],
      // React and React Native code uses arrow functions, not `function` declarations.
      'func-style': ['error', 'expression'],
      'no-console': 'warn',
      // Shared state lives in Redux; read it with typed hooks instead of useContext.
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'react',
              importNames: ['useContext'],
              message: 'Do not use useContext. Use the Redux store with the typed hooks.',
            },
          ],
        },
      ],
      'no-restricted-properties': [
        'error',
        {
          object: 'React',
          property: 'useContext',
          message: 'Do not use useContext. Use the Redux store with the typed hooks.',
        },
      ],
    },
  },
  prettier,
]);
