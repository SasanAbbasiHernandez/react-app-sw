import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

// Registro manual del Service Worker personalizado
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').then((registration) => {
      console.log('Service Worker registrado con éxito:', registration);

      // Escuchar actualizaciones en el Service Worker
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // Hay una nueva versión lista
                showUpdateNotification(registration);
                console.log("hola")
                console.log("hola")
                console.log("hola")
              }
            }
          });
        }
      });
    }).catch((error) => {
      console.error('Error al registrar el Service Worker:', error);
    });
  });
}

// Mostrar notificación para actualizar
function showUpdateNotification(registration) {
  const userConfirmed = window.confirm('¡Nueva versión disponible! ¿Deseas actualizar?');
  if (userConfirmed) {
    if (registration.waiting) {
      // Envía un mensaje para que el Service Worker limpie la caché
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      registration.waiting.addEventListener('statechange', (event) => {
        if (event.target.state === 'activated') {
          console.log('Nueva versión activada, recargando la página...');
          window.location.reload();
        }
      });
    }
  }
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
