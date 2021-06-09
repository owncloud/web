const httpHelper = require('../helpers/httpHelper')

/**
 * Run occ command using the testing API
 *
 * @param {Array} args
 */
exports.runOcc = async function(args) {
  const params = new URLSearchParams()
  params.append('command', args.join(' '))
  const apiURL = 'apps/testing/api/v1/occ'
  const res = await httpHelper.postOCS(apiURL, 'admin', params).then(res => {
    return httpHelper.checkStatus(res, 'Failed while executing occ command')
  })

  const json = await res.json()
  await httpHelper.checkOCSStatus(json, 'Failed while executing occ command')

  await clearOpCache()

  return json
}

const clearOpCache = async function() {
  const apiURL = 'apps/testing/api/v1/opcache'

  try {
    const res = await httpHelper.deleteOCS(apiURL, 'admin').then(res => {
      return httpHelper.checkStatus(res, 'Failed while resetting the opcache')
    })
    const json = await res.json()
    return httpHelper.checkOCSStatus(json, 'Failed while resetting the opcache')
  } catch {
    console.log(
      '\x1b[33m%s\x1b[0m',
      "could not reset opcache, if tests fail try to set 'opcache.revalidate_freq=0' in the php.ini file\n"
    )
  }
}
