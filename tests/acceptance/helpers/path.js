const join = require('join-path')
const _ = require('lodash/fp')
<<<<<<< HEAD
const assert = require('assert')
const normalize = _.replace(/^\/+|$/g, '')
const parts = _.pipe(normalize, _.split('/'))
const relativeTo = function (basePath, childPath) {
  basePath = normalize(basePath)
  childPath = normalize(childPath)
  assert.ok(childPath.startsWith(basePath), `${childPath} doesnot contain ${basePath}`)
  const basePathLength = basePath.length
  return childPath.slice(basePathLength)
}
=======
const normalize = _.replace(/^\/+|\/+$/g, '')
const parts = _.pipe(normalize, _.split('/'))
>>>>>>> New Scenarios Added

module.exports = {
  normalize,
  resolve: _.partial(join, ['/']),
  join,
  parts,
<<<<<<< HEAD
  relativeTo,
  filename: _.pipe(parts, _.remove(n => n === ''), _.last)
=======
  filename: _.pipe(parts, _.last)
>>>>>>> New Scenarios Added
}
