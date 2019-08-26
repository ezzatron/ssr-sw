/* eslint-disable import/no-commonjs */

module.exports = api => {
  const isServer = api.caller(({target} = {}) => target === 'server')
  const isWebpack = api.caller(({name} = {}) => name === 'babel-loader')

  return {
    ignore: [
      './artifacts',
    ],
    plugins: [
      '@loadable/babel-plugin',
      'react-hot-loader/babel',
    ],
    presets: [
      '@babel/preset-react',
      [
        '@babel/preset-env',
        {
          corejs: isServer ? false : 3,
          ignoreBrowserslistConfig: isServer,
          modules: isWebpack ? false : 'commonjs',
          targets: isServer ? {node: 'current'} : undefined,
          useBuiltIns: isServer ? undefined : 'usage',
        },
      ],
    ],
  }
}
