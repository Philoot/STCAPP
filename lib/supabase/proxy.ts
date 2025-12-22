import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isAuthPage = request.nextUrl.pathname.startsWith("/auth")
  const isOnboardingPage = request.nextUrl.pathname.startsWith("/onboarding")
  const isProtectedRoute =
    request.nextUrl.pathname.startsWith("/tradie") || request.nextUrl.pathname.startsWith("/admin")

  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    return NextResponse.redirect(url)
  }

  if (user && !isAuthPage && !isOnboardingPage) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding_completed, role")
      .eq("id", user.id)
      .single()

    // Redirect to onboarding if not completed
    if (!profile?.onboarding_completed && isProtectedRoute) {
      const url = request.nextUrl.clone()
      url.pathname = "/onboarding"
      return NextResponse.redirect(url)
    }

    // Redirect authenticated users with completed onboarding away from auth pages
    if (isAuthPage && profile?.onboarding_completed) {
      const url = request.nextUrl.clone()
      url.pathname = profile.role === "admin" ? "/admin" : "/tradie"
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
