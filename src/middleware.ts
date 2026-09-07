import { getToken } from "next-auth/jwt"
import { NextRequest, NextResponse } from "next/server"
import { isConfiguredAdminEmail } from "@/lib/admin/identity"

function addSecurityHeaders(response: NextResponse) {

  // DNS预取控制
  response.headers.set('X-DNS-Prefetch-Control', 'on')

  // 强制下载类型
  response.headers.set('X-Download-Options', 'noopen')

  // 清除 DNS 缓存
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none')

  return response
}

export async function middleware(request: NextRequest) {
  const isAdminPage = request.nextUrl.pathname === "/admin" || request.nextUrl.pathname.startsWith("/admin/")
  if (isAdminPage) {
    const token = await getToken({ req: request })
    if (!token) {
      const signInUrl = new URL("/auth/signin", request.url)
      signInUrl.searchParams.set("callbackUrl", `${request.nextUrl.pathname}${request.nextUrl.search}`)
      return addSecurityHeaders(NextResponse.redirect(signInUrl))
    }
    if (token.role !== "ADMIN" || !isConfiguredAdminEmail(token.email)) {
      return addSecurityHeaders(NextResponse.json({ error: "Admin access required" }, { status: 403 }))
    }
  }

  return addSecurityHeaders(NextResponse.next())
}

export const config = {
  matcher: '/:path*',
}
