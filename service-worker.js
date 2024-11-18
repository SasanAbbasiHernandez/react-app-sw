/* eslint-disable no-restricted-globals */

const CACHE_NAME = 'app-cache-v9';
const urlsToCache = [
  '${process.env.PUBLIC_URL}/', // Raíz de la app
  'https://sasanabbasihernandez.github.io/react-app-sw/index.html', // Archivo principal
  'https://sasanabbasihernandez.github.io/react-app-sw/static/js/main.js', // Archivos estáticos generados
  'https://sasanabbasihernandez.github.io/react-app-sw/static/css/main.css', // Estilo generado
  // Agrega aquí más rutas según las necesidades de tu app
];

// Instalación del Service Worker
// self.addEventListener('install', (event) => {
//   console.log('[Service Worker] Instalando...');
//   event.waitUntil(
//     caches.open(CACHE_NAME).then((cache) => {
//       console.log('[Service Worker] Cacheando archivos iniciales');
//       return cache.addAll(urlsToCache);
//     })
//   );
//   self.skipWaiting(); // Permite la activación inmediata
// });

// // Activación del Service Worker
// self.addEventListener('activate', (event) => {
//   console.log('[Service Worker] Activando...');
//   event.waitUntil(
//     caches.keys().then((cacheNames) => {
//       console.log('[Service Worker] Cachés existentes:', cacheNames);
//       return Promise.all(
//         cacheNames.map((cacheName) => {
//           if (cacheName !== CACHE_NAME) {
//             console.log('[Service Worker] Eliminando caché antigua:', cacheName);
//             return caches.delete(cacheName);
//           }
//         })
//       );
//     })
//   );
//   return self.clients.claim(); // Reclama control de los clientes
// });

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

// Manejar eventos de fetch
// self.addEventListener('fetch', (event) => {
//   console.log('[Service Worker] Fetch para:', event.request.url);
//   event.respondWith(
//     fetch(event.request)
//       .then((response) => {
//         // Almacena una copia actualizada en la caché
//         return caches.open(CACHE_NAME).then((cache) => {
//           cache.put(event.request, response.clone());
//           return response;
//         });
//       })
//       .catch(() => {
//         // Si no hay conexión, intenta servir desde la caché
//         return caches.match(event.request).then((response) => {
//           if (response) {
//             console.log('[Service Worker] Sirviendo desde caché:', event.request.url);
//             return response;
//           }
          
//           // Si no está en la caché y la red falla, muestra un error
//           console.log('[Service Worker] Respuesta desde red:', event.request.url);
//           return Promise.reject('No se encontró en la caché ni se pudo descargar de la red.');
//         });
//       })
//   );
// });
