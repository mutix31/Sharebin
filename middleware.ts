import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get("sharebin_session")

  // Protected routes that require authentication
  const protectedPaths = ["/dashboard", "/admin", "/profile"]
  const isProtectedPath = protectedPaths.some((path) => request.nextUrl.pathname.startsWith(path))

  // Check if accessing protected route without authentication
  if (isProtectedPath && !sessionCookie) {
    const url = new URL("/login", request.url)
    url.searchParams.set("callbackUrl", request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // Hata işleme için özel yönlendirmeler
  // Geçersiz dosya veya not ID'leri için 404 sayfasına yönlendir
  const viewPathMatch = request.nextUrl.pathname.match(/^\/view\/([^/]+)$/)
  const notePathMatch = request.nextUrl.pathname.match(/^\/note\/([^/]+)$/)

  if (viewPathMatch || notePathMatch) {
    const id = viewPathMatch ? viewPathMatch[1] : notePathMatch ? notePathMatch[1] : null

    // Geçersiz ID formatı kontrolü (basit bir kontrol)
    if (id && (id.length < 5 || id.includes(".") || id.includes("/") || id.includes("\\"))) {
      return NextResponse.redirect(new URL("/not-found", request.url))
    }
  }

  return NextResponse.next()
}

// Configure which paths the middleware runs on
export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/profile/:path*", "/view/:path*", "/note/:path*", "/u/:path*"],
}
