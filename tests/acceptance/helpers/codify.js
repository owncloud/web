const _ = require('lodash')
const { client } = require('nightwatch-api')

const { passwords } = require('./userSettings')

/**
 * Gets the password for the un-initialized users and replaces the password accordingly
 *
 * @param {string} input
 * @returns {string}
 */
exports.replaceInlineCode = function(input) {
  const codes = {
    ...passwords,
    remote_backend_url: client.globals.remote_backend_url,
    backend_url: client.globals.backend_url
  }

  const interpolate = /%([\s\S]+?)%/g
  const compiled = _.template(input, { interpolate })
  return compiled(codes)
}

exports.replaceInlineTable = function(dataTable) {
  dataTable.raw().forEach(row => {
    row.forEach((cell, index, arr) => {
      arr[index] = exports.replaceInlineCode(cell)
    })
  })
  return dataTable
}
