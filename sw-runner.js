
importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.0.0/workbox-sw.js');

console.log("NEW");
const SW_VERSION = '1.0.0';

self.addEventListener('message', (event) => {
  if (event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage(SW_VERSION);
  }
});
workbox.precaching.precacheAndRoute(self.__WB_MANIFEST);

