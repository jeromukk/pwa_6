const CACHE_NAME = 'art-exhibition-v24-videopopup-resize';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './manifest.json',
  './font/GenesisSansProHead-Lt.otf',
  './image/footer-logo.avif',
  './sound/sound_01.mp3',
  './sound/sound_02.mp3',
  './video/video_01.mp4',
  './video/video_02.mp4',
  './video/video_03.mp4',
  './video/video_04.mp4',
  './video/video_05.mp4',
  './js/vanilla-tilt.min.js'
];

// Install Event: Cache all assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate: Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Helper: Handle Range Requests for Safari Video Support
async function getFromCacheOrFetch(request) {
  const cache = await caches.open(CACHE_NAME);
  // Ignore query string/fragments for matching
  const cachedResponse = await cache.match(request, { ignoreSearch: true });

  if (!cachedResponse) {
    return fetch(request);
  }

  // If request has Range header (iOS Video)
  if (request.headers.has('range')) {
    const blob = await cachedResponse.blob();
    const range = request.headers.get('range');
    const total = blob.size;

    // Parse partial response range
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : total - 1;

    // Create chunk
    const chunk = blob.slice(start, end + 1);

    return new Response(chunk, {
      status: 206,
      statusText: 'Partial Content',
      headers: {
        'Content-Type': cachedResponse.headers.get('Content-Type') || 'video/mp4',
        'Content-Length': chunk.size,
        'Content-Range': `bytes ${start}-${end}/${total}`
      }
    });
  }

  return cachedResponse;
}

// Fetch Event
self.addEventListener('fetch', (event) => {
  event.respondWith(getFromCacheOrFetch(event.request));
});
