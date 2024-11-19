/* eslint-disable no-restricted-globals */

const CACHE_NAME = 'app-cache-v6';
const urlsToCache = [
  // './', // Raíz de la app
  // './index.html', // Archivo principal
  // './static/js/main.js', // Archivos estáticos generados
  // './static/css/main.css', // Estilo generado
  // './manifest.json', // Archivo de manifiesto
  // './favicon.ico', // Ícono de la aplicación
  // // Agrega aquí más rutas según las necesidades de tu app
];

self.addEventListener('install', (event) => {
  console.log('[Service Worker] Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Cacheando archivos iniciales');
      return cache.addAll(urlsToCache).catch((error) => {
        console.error('[Service Worker] Error al cachear archivos iniciales:', error);
      });
    })
  );
  self.skipWaiting(); // Permite la activación inmediata
});

self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activando...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Eliminando caché antigua:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim(); // Reclama control de los clientes
});

self.addEventListener('fetch', (event) => {
  console.log('[Service Worker] Interceptando fetch para:', event.request.url);
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        console.log('[Service Worker] Sirviendo desde caché:', event.request.url);
        return response;
      }
      console.log('[Service Worker] Fetch desde la red:', event.request.url);
      return fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          caches.open(CACHE_NAME).then((cache) => {
            console.log('[Service Worker] Cacheando nueva respuesta:', event.request.url);
            cache.put(event.request, networkResponse.clone());
          });
        }
        return networkResponse;
      });
    })
  );
});


// Escuchar mensajes de la aplicación
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[Service Worker] Saltando a la nueva versión y limpiando cachés...');
    // Limpia todas las cachés antes de activar la nueva versión
    caches.keys().then((cacheNames) => {
      console.log('Cachés existentes:', cacheNames);
      return Promise.all(
        cacheNames.map((cacheName) => {
          console.log('[Service Worker] Eliminando caché durante la actualización:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      self.skipWaiting(); // Activa el nuevo Service Worker
    });
  }
});

