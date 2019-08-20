/* eslint-disable import/no-commonjs */

module.exports = api => {
  const isWeb = api.caller(({target} = {}) => target === 'web')
  const isWebpack = api.caller(({name} = {}) => name === 'babel-loader')

  return {
    plugins: [
      '@loadable/babel-plugin',
    ],
    presets: [
      '@babel/preset-react',
      [
        '@babel/preset-env',
        {
          corejs: isWeb ? 3 : false,
          ignoreBrowserslistConfig: !isWeb,
          modules: isWebpack ? false : 'commonjs',
          targets: isWeb ? undefined : {node: 'current'},
          useBuiltIns: isWeb ? 'usage' : undefined,
        },
      ],
    ],
  }
}
