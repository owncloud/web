'use strict';

class Client {
    test() {
        console.log("LOL IM A MODULE");
    }
}

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
class WebDav {
  constructor() {
    this.webDavPath = "https://host.docker.internal:9200/remote.php/dav";
  }
  async moveFile(sourceSpaceId, sourcePath, targetSpaceId, targetPath, token){
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

const client = new WebDav();
addEventListener('message', async (event) => {
  if (event.data.type === 'health') {
    event.ports[0].postMessage(true);
    console.log('%c🔨 ServiceWorker up and running ', 'background: green; color: white');
    var t = new Client();
    t.test();
  }
  if (event.data.type === 'copy') {
    const data = event.data;
    const sourceSpaceId = data.sourceSpaceId;
    const sourcePath = data.sourcePath;
    const targetSpaceId = data.targetSpaceId;
    const targetPath = data.targetPath;
    const token = data.token;

    console.log(`%c🔨 ServiceWorker copy file from ${sourcePath} to ${targetPath}`, 'background: blue; color: white');
    await client.moveFile(sourceSpaceId, sourcePath, targetSpaceId, targetPath, token);
  }
});
