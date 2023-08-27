export default {
  roots: ['<rootDir>'],
  modulePaths: ['<rootDir>'],
  moduleDirectories: ['node_modules', '<rootDir>'],
  preset: 'ts-jest',
  testMatch: ['**/?(*.)(spec).ts', '**/?(*.)(test).ts', '**/__tests__/**/*'],
  resetMocks: true,
  clearMocks: true,
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@app/(.*)$': '<rootDir>/src/$1',
  },
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx'],
  transform: { '\\.[jt]sx?$': 'ts-jest' },
  testTimeout: 50000,
};
