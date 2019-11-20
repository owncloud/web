const { client } = require('nightwatch-api')

const BACKENDS = exports.BACKENDS = Object.freeze({
  local: 'LOCAL',
  remote: 'REMOTE'
})

/**
 * Give the address of the backend url
 *
 * @param {string} server - REMOTE/LOCAL
 * @returns {string}
 */
exports.getBackendUrl = function (server = 'LOCAL') {
  return server === BACKENDS.local ? client.globals.backend_url : client.globals.remote_backend_url
}

/**
 * Give the backend URL for currently default backend
 */
exports.getCurrentBackendUrl = function () {
  return client.globals.default_backend === BACKENDS.local ? client.globals.backend_url : client.globals.remote_backend_url
}

/**
 * change current default backend
 */
exports.changeBackend = function (server) {
  if (!server) {
    throw new Error('Empty value provided, please provide "REMOTE" or "LOCAL"')
  }
  client.globals.default_backend = server
}
/**
 * Run a function using the remote backend
 *
 * @callback fn - the function to run using the remote backend
 * @param args - the arguments to pass to the function
 */
exports.runOnRemoteBackend = async function (fn, args = []) {
  this.changeBackend(BACKENDS.remote)
  let errorFound, res
  try {
    res = await fn(...args)
  } catch (e) {
    errorFound = e
  } finally {
    this.changeBackend(BACKENDS.local)
  }
  if (errorFound) {
    throw errorFound
  }
  return res
}
