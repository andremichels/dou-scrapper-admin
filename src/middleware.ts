import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Root → admin
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  // Public paths
  if (pathname.startsWith("/login") || pathname.startsWith("/unauthorized")) {
    return NextResponse.next();
  }

  // Protect /admin/*
  if (pathname.startsWith("/admin")) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              request.cookies.set(name, value)
            );
          },
        },
      }
    );

    const { data } = await supabase.auth.getUser();

    if (!data.user) {
      // Redirect to login, preserving the original destination
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }

    // Check admin_users
    const { data: adminUser } = await supabase
      .from("admin_users")
      .select("role")
      .eq("user_id", data.user.id)
      .single();

    if (!adminUser) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
