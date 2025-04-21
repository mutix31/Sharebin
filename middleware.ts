import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const isAuthenticated = !!token

  // Protected routes that require authentication
  const protectedPaths = ["/dashboard", "/admin"]
  const isProtectedPath = protectedPaths.some((path) => request.nextUrl.pathname.startsWith(path))

  // Admin-only routes
  const isAdminPath = request.nextUrl.pathname.startsWith("/admin")
  const isAdmin = token?.role === "admin"

  // Redirect to login if accessing protected route without authentication
  if (isProtectedPath && !isAuthenticated) {
    const url = new URL("/login", request.url)
    url.searchParams.set("callbackUrl", request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // Redirect non-admin users trying to access admin routes
  if (isAdminPath && !isAdmin) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

// Configure which paths the middleware runs on
export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
}
