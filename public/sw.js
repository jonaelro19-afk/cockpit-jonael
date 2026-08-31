// Service worker du Cockpit — cache léger pour un démarrage rapide et un
// minimum de fonctionnement hors-ligne. Volontairement simple : on ne met
// jamais en cache les pages qui dépendent de la session ou de l'API.

const CACHE = "cockpit-v1";
const OFFLINE_URL = "/offline";

// Fichiers indispensables pour afficher quelque chose sans réseau.
const PRECACHE = ["/offline", "/manifest.webmanifest", "/icon", "/apple-icon"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  // Jamais de cache pour l'authentification et les routes d'API.
  if (url.pathname.startsWith("/api")) return;

  // Navigations (changement de page) : réseau d'abord, page hors-ligne en secours.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match(OFFLINE_URL)),
    );
    return;
  }

  // Ressources statiques versionnées de Next : cache d'abord.
  if (url.pathname.startsWith("/_next/static")) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((res) => {
            const copy = res.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
            return res;
          }),
      ),
    );
  }
});
