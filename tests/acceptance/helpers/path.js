const join = require('join-path')
const _ = require('lodash/fp')

module.exports = {
  normalize: _.replace(/^\/+|\/+$/g, ''),
  resolve: _.partial(join, ['/']),
  join
}
