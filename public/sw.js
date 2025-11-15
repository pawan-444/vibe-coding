// This is a stub service worker.
// You can expand it with caching strategies.

self.addEventListener('install', (event) => {
  console.log('Service Worker installing.');
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating.');
});

self.addEventListener('fetch', (event) => {
  // console.log('Fetching:', event.request.url);
});
