// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // 🚀 Fully disables ESLint during builds
  },
  async rewrites() {
    return [
      // 1) ÖZEL: file upload önce gelmeli
      {
        source: '/yuksi/file/upload',
        destination: 'https://www.yuksi.dev/file/upload',
      },

      // 2) Diğer özel kural(lar)
      {
        source: '/yuksi/geo/:path*',
        destination: 'https://www.yuksi.dev/geo/:path*',
      },

      // 3) En sona GENEL kural
      {
        source: '/yuksi/:path*',
        destination: 'https://www.yuksi.dev/api/:path*',
      },
    ];
  },
};

export default nextConfig;
