import { WebDav } from './webDav.js'
importScripts("https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");

console.log('%c🔨 ServiceWorker initialized ', 'background: #273d3d; color: white');

// auto generate from webpack manifest
workbox.precaching.precacheAndRoute(self.__WB_MANIFEST, {
  // Ignore all URL parameters.
  ignoreURLParametersMatching: [/.*/] // main.js is loaded with a version hash
});

self.addEventListener('install', e => {
  self.skipWaiting();
});

const client = new WebDav()
addEventListener('message', async (event) => {
  if (event.data.type === 'health') {
    event.ports[0].postMessage(true);
    console.log('%c🔨 ServiceWorker up and running ', 'background: green; color: white');
  }
  if (event.data.type === 'copy') {
    const data = event.data
    const sourceSpaceId = data.sourceSpaceId
    const sourcePath = data.sourcePath
    const targetSpaceId = data.targetSpaceId
    const targetPath = data.targetPath
    const token = data.token

    console.log(`%c🔨 ServiceWorker copy file from ${sourcePath} to ${targetPath}`, 'background: blue; color: white');
    await client.moveFile(sourceSpaceId, sourcePath, targetSpaceId, targetPath, token)
  }
});

