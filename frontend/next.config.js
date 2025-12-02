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
      {
        source: '/links.html',
        destination: '/site/links',
      },
      {
        source: '/papers.html',
        destination: '/site/papers',
      },
    ];
  },
};

module.exports = nextConfig;
