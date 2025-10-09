/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  verbose: true,
  testMatch: ['**/tests/**/*.test.js'],
  roots: ['<rootDir>'],
  moduleFileExtensions: ['js', 'json'],
};
