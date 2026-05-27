/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // HTTPS强制
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          // 防止点击劫持
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          // 防止MIME类型嗅探
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          // XSS防护
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          // 引用来源策略
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          // CSP策略（基础，生产环境需根据需求调整）
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'; frame-src 'self';"
          },
          // 权限策略
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
          },
        ],
      },
    ];
  },
};

export default nextConfig;