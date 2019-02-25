const path = require('path')

function integratePhoenix (webpackConfig) {
  let phoenixWebpackConfig = {
    resolve: {
      alias: {
        'oc_components': path.join(__dirname, 'src/components'),
        'oc_mixins': path.join(__dirname, 'src/mixins'),
        'oc_router$': path.join(__dirname, 'src/router')
      }
    }
  }
  return Object.assign(webpackConfig, phoenixWebpackConfig)
}
module.exports = integratePhoenix
