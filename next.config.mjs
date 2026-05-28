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
          // 防止点击劫持 - 使用 CSP frame-ancestors 替代 X-Frame-Options
          // 'self' 允许同源iframe，youtube.com 允许YouTube嵌入
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' https://www.youtube.com https://www.youtube-nocookie.com"
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
        ],
      },
    ];
  },
};

export default nextConfig;