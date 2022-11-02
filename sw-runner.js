/*
  command: npx workbox injectManifest
*/

importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.0.0/workbox-sw.js');

workbox.setConfig({
  // set the local path is not using Google CDN
  //modulePathPrefix: '/directory/to/workbox/'

  // By default, workbox-sw will use the debug build for sites on localhost,
  // but for any other origin it’ll use the production build. Force by setting to true.
  // debug: true
});

addEventListener('message', event => {
  if (event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage(SW_VERSION);
  }
  console.log('test')
});
workbox.precaching.precacheAndRoute(self.__WB_MANIFEST);

