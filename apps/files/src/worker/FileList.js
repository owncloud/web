import Client from './davClient.js'
import v4 from 'uuid/v4'
import OwnCloud from 'owncloud-sdk'

self.addEventListener('message', (msg) => {
  const data = msg.data
  const absolutePath = data.absolutePath
  const clientInit = data.clientInit
  const davProperties = data.davProperties

  const sdk = new OwnCloud()
  const client = new Client({
    baseUrl: clientInit.baseUrl,
    xmlNamespaces: {
      'DAV:': 'd',
      'http://owncloud.org/ns': 'oc'
    }
  })
  const path = '/remote.php/webdav' + sdk.helpers._encodeUri(absolutePath)
  const headers = {
    'OCS-APIREQUEST': true,
    authorization: `Bearer ${clientInit.auth.bearer}`,
    'X-Requested-With': 'XMLHttpRequest',
    'X-Request-ID': v4()
  }

  console.log('[worker] send propfind ....')
  client.propFind(path, davProperties, 1, headers).then(result => {
    console.log('[worker] propfind returned')
    if (result.status !== 207) {
      const error = sdk.helpers.buildHttpErrorFromDavResponse(result.status, result.xhr.response)
      return Promise.reject(error)
    } else {
      // convert into FileInfo ....
      console.log('[worker] start parsing body')
      const files = sdk.helpers._parseBody(result.body)
      console.log('[worker] parsing body done')
      console.log('[worker] propfind returned')
      return Promise.resolve(files)
    }
  }).then(res => {
    self.postMessage({ res: res })
  })
    .catch(error => {
      self.postMessage({ error: error })
    })
})
