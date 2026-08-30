import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ces paquets ne doivent pas être bundlés : ils tournent côté serveur
  // (Node) et embarquent du natif / des require('fs').
  serverExternalPackages: [
    "@prisma/adapter-neon",
    "@prisma/adapter-better-sqlite3",
    "better-sqlite3",
  ],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
};

export default nextConfig;
