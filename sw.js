importScripts("precache-manifest.bd3851738f050b7d06906609d8e9d760.js", "https://storage.googleapis.com/workbox-cdn/releases/3.2.0/workbox-sw.js");

/* eslint-env serviceworker */
/* eslint-disable no-restricted-globals */
/* globals workbox */

// workbox.setConfig({ debug: true });

const thirtyDays = 30 * 24 * 60 * 60;

// Precache and provide routes for webpack assets.
workbox.precaching.precacheAndRoute(self.__precacheManifest || []);

// Cache the offline page.
workbox.precaching.precache([
  { url: '/offline', revision: '1' },
]);

// Runtime caching for fonts. They aren't precached because not all browsers
// support the woff2 file type yet, so this avoids downloading both woff and woff2.
workbox.routing.registerRoute(
  /\.(?:woff|woff2)$/,
  workbox.strategies.cacheFirst({
    cacheName: 'fonts',
    plugins: [
      new workbox.expiration.Plugin({
        maxAgeSeconds: thirtyDays,
      }),
    ],
  }),
);

// Runtime caching of images from odopod.com.
workbox.routing.registerRoute(
  /\.(?:png|gif|jpg|jpeg|svg)$/,
  workbox.strategies.cacheFirst({
    cacheName: 'images',
    plugins: [
      new workbox.expiration.Plugin({
        maxEntries: 40,
        maxAgeSeconds: thirtyDays,
      }),
    ],
  }),
);

// Runtime caching of images from contentful
// For example:
// https://images.contentful.com/7zrcoz02zalr/2hacR8voaokEYqmUgyyee4/6b12e1cd686d66a9840fce1289437969/caseStudy-sephora-homeFeatured-md-2x.jpg?w=1800&fm=jpg&q=80
// Uses staleWhileRevalidate instead of cacheFirst because:
// https://developers.google.com/web/tools/workbox/guides/handle-third-party-requests
workbox.routing.registerRoute(
  /https:\/\/images\.contentful\.com\/.+\.(?:png|gif|jpg|jpeg|svg)/,
  workbox.strategies.staleWhileRevalidate({
    cacheName: 'contentful-images',
    plugins: [
      new workbox.expiration.Plugin({
        maxEntries: 30,
        maxAgeSeconds: thirtyDays,
      }),
    ],
  }),
);

// Respond to navigation requests with the offline page if the fetch fails.
// https://github.com/GoogleChrome/workbox/issues/796#issuecomment-329401387
workbox.routing.registerRoute(
  ({ event }) => event.request.mode === 'navigate',
  ({ url }) => fetch(url.href).catch(() => caches.match('/offline')),
);

