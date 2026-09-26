// Service worker mínimo de ChatNova: existe solo para que el navegador
// permita "Instalar" la app. No guarda nada en caché por su cuenta:
// todo el guardado real de las conversaciones pasa por el Worker y R2/KV.
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Un fetch handler es obligatorio para que el navegador considere la app instalable.
// Simplemente deja pasar cada pedido tal cual, directo a la red.
self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request));
});
