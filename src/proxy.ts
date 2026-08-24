import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// Optimistik kontroll (läser bara JWT-cookien, ingen databasfråga) — se
// Next.js proxy-guiden: den riktiga behörighetskontrollen görs i
// src/lib/dal.ts och körs i varje admin-sida/server action, inte bara här.
export default auth((req) => {
  const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");
  if (isAdminRoute && req.auth?.user?.role !== "ADMIN") {
    const url = new URL("/logga-in", req.nextUrl.origin);
    url.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
});

export const config = {
  matcher: ["/admin/:path*"],
};
