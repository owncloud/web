'use strict';

class WebDavHelper {
  constructor() {
    this.webDavPath = "https://host.docker.internal:9200/remote.php/dav";
  }
  async moveFile(sourceSpaceId, sourcePath, targetSpaceId, targetPath, token) {
    return fetch(`${this.webDavPath}/spaces/${sourceSpaceId}/${sourcePath}`, {
      method: 'COPY',
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'same-origin',
      headers: {
        authorization: `Bearer ${token}`,
        overwrite: 'F',
        destination: `${this.webDavPath}/spaces/${targetSpaceId}/${targetPath}`,
        'OCS-APIREQUEST': 'true'
      },
      redirect: 'follow',
      referrerPolicy: 'no-referrer'
    });
  }
}
const WebDavClient = new WebDavHelper();

class LoggerHelper {
  info(message) {
    console.log(`%c[🔨 ServiceWorker] ${message}`, 'background: #273d3d; color: white');
  }
  success(message) {
    console.log(`%c[🔨 ServiceWorker] ${message}`, 'background: green; color: white');
  }
  error(message) {
    console.log(`%c[🔨 ServiceWorker] ${message}`, 'background: #b52d34; color: white');
  }
}
const Logger = new LoggerHelper();

importScripts("https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");
Logger.info('initialized');
workbox.precaching.precacheAndRoute(self.__WB_MANIFEST, {
  ignoreURLParametersMatching: [/.*/]
});
self.addEventListener('install', e => {
  self.skipWaiting();
});
addEventListener('message', async event => {
  if (event.data.type === 'health') {
    event.ports[0].postMessage(true);
    Logger.success('up and running');
  }
  if (event.data.type === 'copy') {
    const data = event.data;
    const sourceSpaceId = data.sourceSpaceId;
    const sourcePath = data.sourcePath;
    const targetSpaceId = data.targetSpaceId;
    const targetPath = data.targetPath;
    const token = data.token;
    Logger.info(`copy file from ${sourcePath} to ${targetPath}`);
    await WebDavClient.moveFile(sourceSpaceId, sourcePath, targetSpaceId, targetPath, token);
  }
});
