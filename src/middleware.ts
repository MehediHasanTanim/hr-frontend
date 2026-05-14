import { NextRequest, NextResponse } from "next/server";

const authPaths = ["/login", "/register", "/forgot-password", "/reset-password"];
const refreshCookieNames = ["refresh", "refreshToken", "refresh_token"];

function hasRefreshCookie(request: NextRequest) {
  return refreshCookieNames.some((name) => Boolean(request.cookies.get(name)?.value));
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const authenticated = hasRefreshCookie(request);
  const isProtected = pathname.startsWith("/dashboard");
  const isAuthPath = authPaths.includes(pathname);

  if (isProtected && !authenticated) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(url);
  }

  if (isAuthPath && authenticated) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register", "/forgot-password", "/reset-password"],
};
