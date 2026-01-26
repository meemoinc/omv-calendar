import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    const cspHeader = `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com;
      style-src 'self' 'unsafe-inline';
      img-src 'self' blob: data: https://www.googletagmanager.com;
      font-src 'self';
      connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://*.googletagmanager.com;
      object-src 'none';
      base-uri 'self';
      form-action 'self';
      frame-ancestors 'none';
    `
      .replace(/\s{2,}/g, ' ')
      .trim();

    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Content-Security-Policy',
            value: cspHeader
          }
        ],
      },
    ];
  },
};

export default nextConfig;
