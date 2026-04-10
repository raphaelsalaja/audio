import { type NextRequest, NextResponse } from "next/server";

const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT = 30;

// Per-process store: effective on a single long-lived Node server but
// resets on every cold start in serverless / multi-instance deployments.
// Swap for Redis or similar shared store if running multiple instances.
const hits = new Map<string, { count: number; reset: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || now > entry.reset) {
    hits.set(ip, { count: 1, reset: now + RATE_WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/")) {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      "unknown";
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429, headers: { "Retry-After": "60" } },
      );
    }
  }

  if (pathname.endsWith(".mdx")) {
    const base = pathname.slice(0, -4);
    const rewritten = new URL(`/llms.mdx${base}`, request.url);
    return NextResponse.rewrite(rewritten);
  }

  return NextResponse.next();
}

export const proxyConfig = {
  matcher: ["/((?!_next|favicon).*)"],
};
