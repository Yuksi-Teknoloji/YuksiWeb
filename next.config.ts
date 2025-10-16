//import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
// config options here };

//export default nextConfig;



// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/yuksi/geo/:path*',
        destination: 'https://www.yuksi.dev/geo/:path*',
      },
      {
        source: '/yuksi/:path*',
        destination: 'https://www.yuksi.dev/api/:path*',
      },
    ];
  },
};

export default nextConfig;
