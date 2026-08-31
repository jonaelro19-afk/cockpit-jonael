"use client";

import { useEffect } from "react";

// Enregistre le service worker (public/sw.js) côté navigateur, après le
// chargement de la page, uniquement en production.
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // échec silencieux : l'app fonctionne sans
      });
    };

    if (document.readyState === "complete") register();
    else window.addEventListener("load", register, { once: true });
  }, []);

  return null;
}
