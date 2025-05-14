import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value; // Cek apakah token ada
  const isAuthPage =
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/register") ||
    request.nextUrl.pathname.startsWith("/forgot-password") ||
    request.nextUrl.pathname.startsWith("/reset-password"); // ✅ ini dia



  // 🔹 Jika user belum login dan mencoba akses halaman yang butuh login, redirect ke login
  if (!token && !isAuthPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 🔹 Jika user sudah login dan mencoba akses halaman login/register, redirect ke dashboard
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
