import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// Optimistik kontroll (läser bara JWT-cookien, ingen databasfråga) — se
// Next.js proxy-guiden: den riktiga behörighetskontrollen görs i
// src/lib/dal.ts och körs i varje sida/server action, inte bara här.
export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isAdminRoute = pathname.startsWith("/admin");
  const isMedlemRoute = pathname.startsWith("/skafferi") || pathname.startsWith("/min-sida");

  const needsRedirect =
    (isAdminRoute && req.auth?.user?.role !== "ADMIN") || (isMedlemRoute && !req.auth?.user);

  if (needsRedirect) {
    const url = new URL("/logga-in", req.nextUrl.origin);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }
});

export const config = {
  matcher: ["/admin/:path*", "/skafferi/:path*", "/min-sida/:path*"],
};
