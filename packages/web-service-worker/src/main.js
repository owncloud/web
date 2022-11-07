import { WebDavClient } from './webDav.js'
import { Logger } from './logger.js'
import '../workbox/workbox-v6.5.4/workbox-sw.js'

Logger.info('initialized')
workbox.precaching.precacheAndRoute(self.__WB_MANIFEST, {
  ignoreURLParametersMatching: [/.*/]
})

self.addEventListener('install', e => {
  self.skipWaiting()
})
addEventListener('message', async (event) => {
  if (event.data.type === 'health') {
    event.ports[0].postMessage(true)
    Logger.success('up and running')
  }
  if (event.data.type === 'copy') {
    const data = event.data
    const sourceSpaceId = data.sourceSpaceId
    const sourcePath = data.sourcePath
    const targetSpaceId = data.targetSpaceId
    const targetPath = data.targetPath
    const token = data.token

    Logger.info(`copy file from ${sourcePath} to ${targetPath}`)
    await WebDavClient.moveFile(sourceSpaceId, sourcePath, targetSpaceId, targetPath, token)
  }
})

