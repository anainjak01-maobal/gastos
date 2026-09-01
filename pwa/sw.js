/* generado por build.js — no editar a mano */
const VERSION = "reparto-06ee76fb87";
const SHELL = ["./", "./index.html", "./manifest.webmanifest",
  "./icon-192.png", "./icon-512.png", "./icon-maskable-512.png", "./apple-touch-icon.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || !req.url.startsWith("http")) return;

  // la página: red primero (para recibir actualizaciones), caché si no hay señal
  if (req.mode === "navigate") {
    e.respondWith(fetch(req)
      .then(res => { const copy = res.clone(); caches.open(VERSION).then(c => c.put("./index.html", copy)); return res; })
      .catch(() => caches.match("./index.html").then(r => r || caches.match("./"))));
    return;
  }

  // lo demás (iconos, tipografías): caché primero, y se guarda lo que llegue nuevo
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
    if (res && (res.ok || res.type === "opaque")) {
      const copy = res.clone();
      caches.open(VERSION).then(c => c.put(req, copy));
    }
    return res;
  }).catch(() => new Response("", { status: 504, statusText: "sin conexión" }))));
});
