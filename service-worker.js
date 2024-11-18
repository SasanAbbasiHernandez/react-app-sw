/* eslint-disable no-restricted-globals */

const CACHE_NAME = 'app-cache-v9';
const urlsToCache = [
  'https://sasanabbasihernandez.github.io/react-app-sw/', // Raíz de la app
  'https://sasanabbasihernandez.github.io/react-app-sw/index.html', // Archivo principal
  'https://sasanabbasihernandez.github.io/react-app-sw/static/js/main.js', // Archivos estáticos generados
  'https://sasanabbasihernandez.github.io/react-app-sw/static/css/main.css', // Estilo generado
  // Agrega aquí más rutas según las necesidades de tu app
];

self.addEventListener('install', (event) => {
  console.log('[Service Worker] Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Cacheando archivos iniciales');
      return cache.addAll(urlsToCache);
    }).catch((error) => {
      console.error('[Service Worker] Error al cachear archivos iniciales:', error);
    })
  );
});

self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activando...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      console.log('[Service Worker] Cachés existentes:', cacheNames);
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Eliminando caché antigua:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).catch((error) => {
      console.error('[Service Worker] Error al eliminar caché antigua:', error);
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  console.log('[Service Worker] Interceptando fetch para:', event.request.url);
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        console.log('[Service Worker] Respuesta desde caché:', event.request.url);
        return response;
      }
      console.log('[Service Worker] Respuesta desde red:', event.request.url);
      return fetch(event.request);
    }).catch((error) => {
      console.error('[Service Worker] Error en fetch:', error);
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

