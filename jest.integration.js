const { readFileSync } = require('fs');
const { join } = require('path');

module.exports = (projectDir, displayName) => {
  const swcJestConfig = JSON.parse(
    readFileSync(join(projectDir, '.spec.swcrc'), 'utf-8'),
  );
  swcJestConfig.swcrc = false;

  return {
    displayName,
    rootDir: projectDir,
    preset: join(__dirname, 'jest.preset.js'),
    testEnvironment: 'node',
    transform: {
      '^.+\\.[tj]s$': ['@swc/jest', swcJestConfig],
    },
    moduleFileExtensions: ['ts', 'js', 'html'],
    testMatch: ['<rootDir>/src/**/*.integration.spec.ts'],
    testPathIgnorePatterns: ['/node_modules/'],
    testTimeout: 60000,
  };
};
