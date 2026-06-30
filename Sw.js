// sw.js — NCR Solutions Quiz SST
// Mode hors-ligne : met en cache l'appli (HTML/CSS/JS embarqués + images)
// pour que les fiches réflexes, le métronome RCP et la révision solo
// fonctionnent même sans réseau. Les fonctionnalités Live (Firebase)
// nécessitent toujours une connexion.

const CACHE_NAME = 'ncr-sst-cache-v2';
const APP_SHELL = [
  './',
  './quizz.html',
  './modules-sst.js',
  './manifest.json',
  './favicon.png',
  './logo.png',
  './qrcode.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // addAll échoue globalement si un seul fichier est manquant :
      // on ajoute donc fichier par fichier pour ne pas bloquer l'installation
      return Promise.all(
        APP_SHELL.map((url) =>
          cache.add(url).catch((err) => console.warn('[SW] Non mis en cache:', url, err))
        )
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Ne jamais intercepter les appels Firebase / Google (Live, scores, sync) :
  // ils doivent toujours passer par le réseau normalement.
  if (
    url.hostname.includes('firebaseio.com') ||
    url.hostname.includes('googleapis.com') ||
    url.hostname.includes('gstatic.com') ||
    url.hostname.includes('firebaseapp.com')
  ) {
    return; // laisse la requête réseau suivre son cours normal
  }

  // Stratégie "cache d'abord, réseau en secours" pour le reste (app shell)
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          // Met en cache les nouvelles ressources statiques récupérées avec succès
          if (response && response.status === 200 && event.request.method === 'GET') {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          }
          return response;
        })
        .catch(() => cached); // hors-ligne et pas en cache : échoue silencieusement
    })
  );
});