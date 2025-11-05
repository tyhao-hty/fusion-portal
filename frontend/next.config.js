/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/index.html',
        destination: '/site',
      },
      {
        source: '/history.html',
        destination: '/site/history',
      },
    ];
  },
};

module.exports = nextConfig;
