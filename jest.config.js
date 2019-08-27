/* eslint-disable import/no-commonjs */

module.exports = {
  cacheDirectory: 'artifacts/test/jest/cache',
  collectCoverageFrom: [
    'src/**',
  ],
  coverageDirectory: 'artifacts/test/jest/coverage',
  moduleNameMapper: {
    '\\.css$': 'identity-obj-proxy',
  },
  transform: {
    '\\.(gif|jpg|png)$': '<rootDir>/test/mocks/image-transform.js',
    '\\.js$': 'babel-jest',
  },
}
