/* eslint-disable no-undef */

importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.3.1/workbox-sw.js');

workbox.routing.registerRoute(
	new RegExp('http://localhost:4000/.*'),
	workbox.strategies.cacheFirst()
);
