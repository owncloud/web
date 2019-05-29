const { Given, Then } = require('cucumber')
const fetch = require('node-fetch')
require('url-search-params-polyfill')
const httpHelper = require('../helpers/httpHelper')
const webdavHelper = require('../helpers/webdavHelper')

Then('as {string} file/folder {string} should exist', function (userId, element) {
  const headers = httpHelper.createAuthHeader(userId)
  return fetch(
    webdavHelper.createDavPath(userId, element),
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
  const headers = httpHelper.createAuthHeader(userId)
  return fetch(
    webdavHelper.createDavPath(userId, element),
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

Given('user {string} has favorited element {string}', function (userId, element) {
  const headers = httpHelper.createAuthHeader(userId)
  const body = '<?xml version="1.0"?>\n' +
    '<d:propertyupdate xmlns:d="DAV:"\n' +
    'xmlns:oc="http://owncloud.org/ns">\n' +
    '  <d:set>\n' +
    '   <d:prop><oc:favorite>true</oc:favorite></d:prop>\n' +
    '  </d:set>\n' +
    '</d:propertyupdate>'

  return fetch(
    webdavHelper.createDavPath(userId, element),
    { method: 'PROPPATCH', headers: headers, body: body }
  )
    .then(function (res) {
      if (res.status === 207) {
        return res
      } else {
        throw Error('file/folder could not be favorited')
      }
    })
})
