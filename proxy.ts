import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export const proxy = auth((req) => {
  const path = req.nextUrl.pathname;
  const role = req.auth?.user?.role;
  if (path.startsWith("/admin")) {
    if (!req.auth) {
      const url = new URL("/auth/signin", req.nextUrl.origin);
      url.searchParams.set("callbackUrl", path);
      return NextResponse.redirect(url);
    }
    if (role !== "admin") return NextResponse.redirect(new URL("/", req.nextUrl.origin));
  }
  if (path.startsWith("/member") && !req.auth) {
    const url = new URL("/auth/signin", req.nextUrl.origin);
    url.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/member/:path*"],
};
