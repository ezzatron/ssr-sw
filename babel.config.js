/* eslint-disable import/no-commonjs */

module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        corejs: false,
        ignoreBrowserslistConfig: true,
        modules: 'commonjs',
        targets: {node: 'current'},
      },
    ],
  ],
}
