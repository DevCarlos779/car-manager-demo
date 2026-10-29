import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const temSessao = request.cookies.has("session");
  const ehLogin = request.nextUrl.pathname === "/login";

  if (!temSessao && !ehLogin) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
