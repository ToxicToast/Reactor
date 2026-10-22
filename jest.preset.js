const nxPreset = require('@nx/jest/preset').default;

module.exports = {
  ...nxPreset,
  testPathIgnorePatterns: ['/node_modules/', '\\.integration\\.spec\\.ts$'],
};
