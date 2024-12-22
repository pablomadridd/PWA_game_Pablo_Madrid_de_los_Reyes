const CACHE_NAME = 'shooter-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/Game.js',
  '/Entity.js',
  '/Character.js',
  '/Player.js',
  '/Opponent.js',
  '/Shot.js',
  '/main.js',
  '/game.css',
  '/assets/bueno.png',
  '/assets/malo.png',
  '/assets/shot1.png',
  '/assets/shot2.png',
  '/assets/bueno_muerto.png',
  '/assets/clases.png',
  '/assets/game_over.png',
  '/assets/jefe_muerto.png',
  '/assets/screenshot.png',
  '/assets/you_win.png',
  '/manifest.json',
  '/assets/icons/icon-512x512.png',
  '/assets/icons/icon-192x192.png'
];

// Se ejecuta cuando el Service Worker se instala
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Se ejecuta en cada petición (fetch) para responder con caché o hacer fetch
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Devuelve la respuesta desde caché si está disponible, si no va a la red
        return response || fetch(event.request);
      })
  );
});
