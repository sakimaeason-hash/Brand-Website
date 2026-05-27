import { NextResponse } from 'next/server'

export function middleware() {
  const response = NextResponse.next()

  // DNS预取控制
  response.headers.set('X-DNS-Prefetch-Control', 'on')

  // 强制下载类型
  response.headers.set('X-Download-Options', 'noopen')

  // 清除 DNS 缓存
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none')

  return response
}

export const config = {
  matcher: '/:path*',
}