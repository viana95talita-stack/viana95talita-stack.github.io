/* Guarda o app inteiro no aparelho para funcionar sem internet.
   Ao publicar uma versão nova, mude VERSION para os aparelhos baixarem de novo. */
const VERSION = 'rumo-2026.10.29';
const FILES = ['./','index.html','style.css','fonts.css','menu.js','content.js','app.js','manifest.webmanifest',
  'theme.js','fonts/cormorant-garamond-n-300_700.woff2','fonts/cormorant-garamond-i-300_700.woff2','fonts/jost-n-300_700.woff2','fonts/pinyon-script-n-400.woff2',
  'icons/icon-192.png','icons/icon-512.png','icons/maskable-512.png','icons/apple-touch-icon.png','icons/favicon-32.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    caches.match(req, {ignoreSearch: true}).then(hit => hit || fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => req.mode === 'navigate' ? caches.match('index.html') : Response.error()))
  );
});
