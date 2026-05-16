import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  try {
    let supabaseResponse = NextResponse.next({ request });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            supabaseResponse = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();

    // Protect customer routes
    const customerProtected = ["/home", "/orders", "/checkout", "/cart"];
    if (customerProtected.some((r) => pathname.startsWith(r)) && !user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Protect admin routes
    if (pathname.startsWith("/admin") && pathname !== "/admin/login" && !user) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    // Redirect logged-in users away from login/register
    if ((pathname === "/login" || pathname === "/register") && user) {
      return NextResponse.redirect(new URL("/home", request.url));
    }

    return supabaseResponse;
  } catch {
    // If middleware fails for any reason, just let the request through
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/home/:path*",
    "/orders/:path*",
    "/cart/:path*",
    "/checkout/:path*",
    "/login",
    "/register",
    "/admin/:path*",
  ],
};
