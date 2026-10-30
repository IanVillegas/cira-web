// Service worker mínimo de CIRA: solo existe para que el navegador trate a CIRA como app
// instalable. No guarda nada en caché (todo va siempre a la red), así que nunca muestra
// una versión vieja de la app.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") event.respondWith(fetch(event.request));
});
