/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/index.html',
        destination: '/',
      },
      {
        source: '/history.html',
        destination: '/history',
      },
      {
        source: '/links.html',
        destination: '/links',
      },
      {
        source: '/papers.html',
        destination: '/papers',
      },
    ];
  },
};

module.exports = nextConfig;
