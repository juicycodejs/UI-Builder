/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '@ui-builder/shared': '<rootDir>/../../packages/shared/src/index.ts',
  },
};
