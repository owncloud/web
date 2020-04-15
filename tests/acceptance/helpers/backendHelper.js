const { client } = require('nightwatch-api')

/**
 * @enum {string}
 * @readonly
 */
const BACKENDS = (exports.BACKENDS = Object.freeze({
  local: 'LOCAL',
  remote: 'REMOTE'
}))

/**
 * Give the backend URL for currently default backend
 */
exports.getCurrentBackendUrl = function() {
  // eslint-disable-next-line camelcase
  const { backend_url, remote_backend_url, default_backend } = client.globals
  // eslint-disable-next-line camelcase
  return default_backend === BACKENDS.local ? backend_url : remote_backend_url
}

/**
 * Run a function using the remote backend
 *
 * @param fn - the function to run using the remote backend
 * @param {...*} args - the arguments to pass to the function
 *
 * @example using multiple functions concurrently by using closures
 * runOnRemoteBackend(() => Promise.all([...list_of_promises]);
 * // probably, we need a async-mutex here :evil_laugh:
 *
 * @example
 * runOnRemoteBackend(doSomething, arg1, arg2); // if you don't want unnecessary closures
 * runOnRemoteBackend(() => doSomething(arg1, arg2)); // use closure to get better completion
 */
exports.runOnRemoteBackend = async function(fn, ...args) {
  if (typeof fn !== 'function') {
    throw new Error('expected function, received: ' + typeof fn)
  }

  client.globals.default_backend = BACKENDS.remote
  let errorFound, res
  try {
    res = await fn(...args)
  } catch (e) {
    errorFound = e
  } finally {
    client.globals.default_backend = BACKENDS.local
  }

  if (errorFound) {
    throw errorFound
  }
  return res
}
