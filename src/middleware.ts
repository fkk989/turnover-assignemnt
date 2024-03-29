import { type NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/helpers/auth";
import { NextApiRequest } from "next";

export async function middleware(req: NextRequest) {
  // validate the user is authenticated
  const pathname = req.nextUrl.pathname;
  const verifiedToken = await verifyAuth({ nextReq: req }).catch((err) => {
    console.error(err.message);
  });

  //just adding / path as we dont have anyting on /
  if ((pathname === "/categories" || pathname === "/") && !verifiedToken) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (
    (pathname === "/login" || pathname === "/signup" || pathname === "/") &&
    verifiedToken
  ) {
    return NextResponse.redirect(new URL("/categories", req.url));
  }
}

/*
not exporting config as we only have three routes
export const config = {
  matcher: '/about/:path*',
}
 */
