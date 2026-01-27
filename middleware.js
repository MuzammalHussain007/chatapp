import { NextResponse } from "next/server"
import { jwtVerify } from "jose"
//import { authOptions } from './app/api/auth/[...nextauth]/route';

export async function middleware(req) {
  const { pathname } = req.nextUrl


  if (pathname === "/") {
    const token = req.cookies.get("accessToken")?.value

    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url))
    }

    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET)

      await jwtVerify(token, secret)

      // Token valid → redirect to dashboard
      return NextResponse.redirect(new URL("/dashboard", req.url))
    } catch (error) {
      // Token expired or invalid
      return NextResponse.redirect(new URL("/login", req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/", "/dashboard"],
}
