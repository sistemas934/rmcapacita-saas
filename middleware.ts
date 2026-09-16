import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const isDashboardRoute = request.nextUrl.pathname.startsWith('/admin') || 
                           request.nextUrl.pathname.startsWith('/proveedor') || 
                           request.nextUrl.pathname.startsWith('/guardia') ||
                           request.nextUrl.pathname.startsWith('/superadmin');

  if (!user && isDashboardRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user) {
    // Obtener el rol solo si es necesario para enrutar
    let role = 'TENANT_ADMIN'; // default
    if (isDashboardRoute || request.nextUrl.pathname === '/' || request.nextUrl.pathname === '/login') {
      const { data: roleData } = await supabase.from('user_roles').select('role').eq('email', user.email).single();
      if (roleData?.role) role = roleData.role;
    }

    // Redirigir si intenta entrar a login o la raiz estando logueado
    if (request.nextUrl.pathname === '/' || request.nextUrl.pathname === '/login') {
      if (role === 'SUPER_ADMIN') return NextResponse.redirect(new URL('/superadmin', request.url));
      if (role === 'PROVIDER') return NextResponse.redirect(new URL('/proveedor', request.url));
      if (role === 'GUARD') return NextResponse.redirect(new URL('/guardia', request.url));
      return NextResponse.redirect(new URL('/admin', request.url));
    }

    // Proteger rutas según rol (RBAC)
    const path = request.nextUrl.pathname;
    if (role === 'PROVIDER' && !path.startsWith('/proveedor')) {
      return NextResponse.redirect(new URL('/proveedor', request.url));
    }
    if (role === 'GUARD' && !path.startsWith('/guardia')) {
      return NextResponse.redirect(new URL('/guardia', request.url));
    }
    if (role === 'TENANT_ADMIN' && path.startsWith('/superadmin')) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    if (role === 'SUPER_ADMIN' && !path.startsWith('/superadmin')) {
      return NextResponse.redirect(new URL('/superadmin', request.url));
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
