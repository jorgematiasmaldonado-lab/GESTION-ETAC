/* Service worker – Gestión de Personal ETAC (JMM Gestiones y Tecnologías)
   Guarda la app en el dispositivo para que abra sin internet.
   Los archivos propios se buscan primero en internet (para recibir las
   actualizaciones de GitHub) y, si no hay conexión, se usan los guardados. */
const VERSION = 'etac-personal-v3.1';
const ARCHIVOS = ['./', './index.html', './manifest.webmanifest', './logo-etac.jpg', './logo-jmm.png',
  './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable-512.png', './icons/apple-touch-icon.png', './icons/favicon.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === location.origin){
    // Primero internet (versión nueva), si falla, lo guardado
    e.respondWith(fetch(req).then(r => { const cp = r.clone(); if (r.ok) caches.open(VERSION).then(c => c.put(req, cp)); return r; })
      .catch(() => caches.match(req).then(r => r || caches.match('./index.html'))));
  } else if (/cdn\.sheetjs\.com|cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net|tessdata/.test(url.host + url.pathname)){
    // Librerías para importar Excel viejo / PDF: se guardan la primera vez que se usan
    e.respondWith(caches.match(req).then(r => r || fetch(req).then(res => { const cp = res.clone(); caches.open(VERSION).then(c => c.put(req, cp)); return res; })));
  }
});
