import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/auth/jwt";

/**
 * First line of defence only: cheap, edge-level redirect for obviously
 * unauthenticated / wrong-role requests. Authoritative checks (DB role, suspension,
 * ownership) always happen again on the server in layouts and actions.
 */
const PREFIX_ROLE: Array<[string, "COUPLE" | "VENDOR" | "ADMIN"]> = [
  ["/admin", "ADMIN"],
  ["/vendor", "VENDOR"],
  ["/dashboard", "COUPLE"],
];

const HOME = { ADMIN: "/admin", VENDOR: "/vendor", COUPLE: "/dashboard" } as const;

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const match = PREFIX_ROLE.find(([prefix]) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  if (!match) return NextResponse.next();

  const claims = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);
  if (!claims) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(pathname + req.nextUrl.search)}`;
    return NextResponse.redirect(url);
  }
  if (claims.role !== match[1]) {
    const url = req.nextUrl.clone();
    url.pathname = HOME[claims.role];
    url.search = "";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*", "/vendor/:path*", "/dashboard/:path*"] };
