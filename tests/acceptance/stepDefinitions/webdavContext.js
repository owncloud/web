const { Then } = require('cucumber')
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
