import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
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
  const { pathname } = request.nextUrl;

  async function getRole() {
    if (!user) return null;
    const { data } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    return data?.role as string | null;
  }

  // Admin section
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!user) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    const role = await getRole();
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/home", request.url));
    }
  }

  // Protected customer routes
  const customerProtected = ["/home", "/orders", "/checkout", "/cart"];
  if (customerProtected.some((r) => pathname.startsWith(r))) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Redirect already-logged-in users away from auth pages
  if (pathname === "/login" || pathname === "/register") {
    if (user) {
      const role = await getRole();
      if (role === "admin") {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      }
      return NextResponse.redirect(new URL("/home", request.url));
    }
  }

  if (pathname === "/admin/login" && user) {
    const role = await getRole();
    if (role === "admin") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
  }

  return supabaseResponse;
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
