const { readFileSync } = require('fs');
const { join } = require('path');
const preset = require('./jest.preset.js');

module.exports = (projectDir, displayName) => {
  const swcJestConfig = JSON.parse(
    readFileSync(join(projectDir, '.spec.swcrc'), 'utf-8'),
  );
  swcJestConfig.swcrc = false;

  return {
    ...preset,
    displayName,
    rootDir: projectDir,
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
