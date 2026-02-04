import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  // Get NextAuth token
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // 1️⃣ User IS logged in
  if (token) {
    // If user tries to access /login, redirect to /dashboard
    if (pathname === "/login") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    // Allow access to /dashboard
    return NextResponse.next();
  }

  // 2️⃣ User is NOT logged in
  else {
    // Allow access to login page
    if (pathname === "/login") {
      return NextResponse.next();
    }

    // Any other protected page (like /dashboard) → redirect to login
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: ["/dashboard", "/login"], // Only these paths are checked
};
