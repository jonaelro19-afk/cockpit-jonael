import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ne pas bundler l'adaptateur Neon : il tourne côté serveur (Node) et
  // embarque des dépendances (ws) qui n'aiment pas le bundling.
  serverExternalPackages: ["@prisma/adapter-neon"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
};

export default nextConfig;
