import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const PROTECTED = ['/dashboard', '/assessment', '/metrics', '/settings']
const AUTH_ONLY  = ['/login', '/signup']

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = req.cookies.get('hqcode_token')?.value

  const isProtected = PROTECTED.some(r => pathname.startsWith(r))
  const isAuthOnly  = AUTH_ONLY.some(r => pathname.startsWith(r))

  if (isProtected) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
      await jwtVerify(token, secret)
    } catch {
      const res = NextResponse.redirect(new URL('/login', req.url))
      res.cookies.delete('hqcode_token')
      return res
    }
  }

  if (isAuthOnly && token) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
      await jwtVerify(token, secret)
      return NextResponse.redirect(new URL('/dashboard', req.url))
    } catch {
      // invalid token — let them through to login
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/assessment/:path*',
    '/metrics/:path*',
    '/settings/:path*',
    '/login',
    '/signup',
  ],
}