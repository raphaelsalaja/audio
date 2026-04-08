import { type NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.endsWith(".mdx")) {
    const base = pathname.slice(0, -4);
    const rewritten = new URL(`/llms.mdx${base}`, request.url);
    return NextResponse.rewrite(rewritten);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|favicon).*)"],
};
