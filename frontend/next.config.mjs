import { withPayload } from '@payloadcms/next/withPayload'
/** @type {import('next').NextConfig} */

const nextConfig = {
  // 你的 Next.js 配置放在这里
    reactStrictMode: true,

  experimental: {
    reactCompiler: false,
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },  
}

// 确保用 `withPayload` 插件
// 包裹你的 `nextConfig`
export default withPayload(nextConfig) // highlight-line
