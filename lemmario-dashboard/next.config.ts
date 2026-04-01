import type { NextConfig } from "next";

// Supporto multi-dominio con basePath condizionale
// Per linguistica.dh.unica.it/atliteg imposta NEXT_PUBLIC_BASE_PATH=/atliteg
// Per atlante.atliteg.org lascia vuoto o ometti la variabile
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true, // Required for static export
  },
  trailingSlash: true,
  // BasePath per subpath routing (es. /atliteg)
  basePath: basePath,
  // Asset prefix per garantire il corretto caricamento degli asset
  assetPrefix: basePath,
  // Turbopack è già abilitato di default in Next.js 16
};

export default nextConfig;
