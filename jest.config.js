/** Jest runs pure logic only (utils), so a plain Node environment is enough: no React Native preset. */
module.exports = {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/**/*.test.ts'],
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
};
