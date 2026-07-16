module.exports = {
  testEnvironment: 'jsdom',
  transform: { '^.+\\.jsx?$': 'babel-jest' },
  moduleNameMapper: { '^nr1$': '<rootDir>/__mocks__/nr1.js' },
  testMatch: ['**/nerdlets/**/__tests__/**/*.test.js'],
};
