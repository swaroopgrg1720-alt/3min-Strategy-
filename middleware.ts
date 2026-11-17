import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

type CookieToSet = { name: string; value: string; options: CookieOptions };

/** Refreshes the Supabase session cookie and requires sign-in for /dashboard and /admin. */
export async function middleware(req: NextRequest) {
  try {
    return await run(req);
  } catch {
    // Never take the whole site down because of a configuration problem.
    const p = req.nextUrl.pathname;
    if (p.startsWith("/admin") && p !== "/admin/login") return NextResponse.redirect(new URL("/admin/login", req.url));
    if (p.startsWith("/dashboard")) return NextResponse.redirect(new URL("/login", req.url));
    return NextResponse.next();
  }
}

async function run(req: NextRequest) {
  let res = NextResponse.next({ request: req });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const path = req.nextUrl.pathname;
  const isAdminArea = path.startsWith("/admin") && path !== "/admin/login";
  const protectedPath = path.startsWith("/dashboard") || isAdminArea;
  const loginPath = isAdminArea ? "/admin/login" : "/login";
  if (!url || !anon) {
    if (protectedPath) return NextResponse.redirect(new URL(loginPath, req.url));
    return res;
  }
  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll: (list: CookieToSet[]) => {
        list.forEach(({ name, value }) => req.cookies.set(name, value));
        res = NextResponse.next({ request: req });
        list.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
      },
    },
  });
  const { data } = await supabase.auth.getUser(); // validates the JWT with Supabase
  if (protectedPath && !data.user) {
    const to = new URL(loginPath, req.url);
    if (!isAdminArea) to.searchParams.set("next", path);
    return NextResponse.redirect(to);
  }
  return res;
}

export const config = { matcher: ["/dashboard/:path*", "/admin/:path*", "/login"] };
