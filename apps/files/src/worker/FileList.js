import Client from './davClient.js'
import v4 from 'uuid/v4'
import OwnCloud from 'owncloud-sdk'
import parseXml from './xml.js'

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
  client.propFind(clientInit.baseUrl + path, davProperties, 1, headers).then(response => {
    console.log('[worker] propfind returned')
    if (response.status !== 207) {
      return response.body.text().then(text => {
        const error = sdk.helpers.buildHttpErrorFromDavResponse(response.status, text)
        return Promise.reject(error)
      })
    } else {
      return new Promise(function (resolve, reject) {
        let counter = 0
        parseXml(response.body, {
          end: () => { resolve() },
          error: error => { reject(error) },
          'tag:{DAV:}response': node => {
            const multiStatusResponse = {
              href: null,
              propStat: []
            }
            for (const item of node.$markup) {
              if (item.name === '{DAV:}href') {
                multiStatusResponse.href = item.$markup[0]
              }
              if (item.name === '{DAV:}propstat') {
                var propStat = {
                  status: '',
                  properties: {}
                }
                for (const p of item.$markup) {
                  if (p.name === '{DAV:}status') {
                    propStat.status = p.$markup[0]
                  }
                  if (p.name === '{DAV:}prop') {
                    propStat.properties = p.$markup.reduce((result, item) => {
                      // make sdk parser happy - temp solution
                      if (item.name === '{DAV:}resourcetype') {
                        result[item.name] = item.$markup
                        if (result[item.name].length === 0) {
                          result[item.name] = [{}]
                        }
                      } else {
                        // TODO: handle array
                        result[item.name] = item.$markup[0]
                      }
                      return result
                    }, {})
                  }
                }
                multiStatusResponse.propStat.push(propStat)
              }
            }
            const files = sdk.helpers._parseBody(multiStatusResponse)
            self.postMessage({ file: files[0], index: counter })
            counter++
          }
        })
      })
    }
  }).then(res => {
    console.log('[worker] finished')
    self.postMessage({ finished: true })
  })
    .catch(error => {
      console.log(error)
      self.postMessage({ error: error })
    })
})
