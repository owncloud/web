const { client } = require('nightwatch-api')
const { Then } = require('cucumber')
const fetch = require('node-fetch')
require('url-search-params-polyfill')

Then('as {string} file/folder {string} should exist', function (userId, element) {
  const headers = createAuthHeader(userId)
  return fetch(
    createDavPath(userId, element),
    { method: 'GET', headers: headers }
  )
    .then(function (res) {
      if (res.status === 200) {
        return res
      } else {
        throw Error('file/folder should exist, but does not')
      }
    })
})

Then('as {string} file/folder {string} should not exist', function (userId, element) {
  const headers = createAuthHeader(userId)
  return fetch(
    createDavPath(userId, element),
    { method: 'GET', headers: headers }
  )
    .then(function (res) {
      if (res.status === 401 || res.status === 404) {
        return res
      } else {
        throw Error('file/folder should not exist, but does')
      }
    })
})

const createAuthHeader = function (userId) {
  return {
    'Authorization': 'Basic ' +
      Buffer.from(userId + ':' + userId).toString('base64')
  }
}

const createDavPath = function (userId, element) {
  return client.globals.backend_url +
         '/remote.php/dav/files/' + userId + '/' + encodeURIComponent(element)
}
