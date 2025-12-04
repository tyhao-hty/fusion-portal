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
      {
        source: '/science.html',
        destination: '/science',
      },
      {
        source: '/theory.html',
        destination: '/theory',
      },
      {
        source: '/technology.html',
        destination: '/technology',
      },
      {
        source: '/business.html',
        destination: '/business',
      },
    ];
  },
};

module.exports = nextConfig;
