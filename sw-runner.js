import {precacheAndRoute} from 'workbox-precaching';
import OwnCloud from 'owncloud-sdk';

console.log("SWag machine initialized 😎");
const sdk = new OwnCloud();
console.log(sdk);
const SW_VERSION = '1.1.2';

// auto generate from webpack manifest
precacheAndRoute(self.__WB_MANIFEST, {
  // Ignore all URL parameters.
  ignoreURLParametersMatching: [/.*/] // main.js is loaded with a version hash
});

self.addEventListener('install', e => {
  self.skipWaiting();
});
addEventListener('message', (event) => {
  if (event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage(SW_VERSION);
    console.log("message recieved");
  }
  if (event.data.type === 'move') {
    console.log("move files");
    event.data.sdk.files.copy(
      event.data.source,
      event.data.target,
      event.data.options
    )
  }
});

workbox.skipWaiting()

