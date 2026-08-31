import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Cockpit — Jonael",
    short_name: "Cockpit",
    description: "Cockpit personnel : timebox, BTS, sport, M&J Production, Gmail",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    lang: "fr",
    categories: ["productivity", "utilities"],
    background_color: "#0a0a0a",
    theme_color: "#0a0a0a",
    icons: [
      { src: "/icon", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
