import { EmailTemplate } from "@/components";
import { Resend } from "resend";
export async function sendEmail({
  resend,
  email,
  token,
}: {
  resend: Resend;
  email: string;
  token: string;
}) {
  const data = await resend.emails.send({
    from: "Turnover <turnover@faisaldev.online>",
    to: [email],
    subject: "Email Verification",
    react: EmailTemplate({ token }),
    text: "",
  });
  console.log("Email Error:", data.error?.message);
  return data;
}

export const generateOTP = (length: number): Promise<string> => {
  return new Promise((resolve, reject) => {
    const charset = "0123456789"; // Define the character set for the OTP
    let otp = "";

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      otp += charset[randomIndex];
    }
    resolve(otp); // Resolve the promise with the generated OTP
  });
};

import type { NextRequest } from "next/server";
import { nanoid } from "nanoid";
import { SignJWT, jwtVerify } from "jose";
import { USER_TOKEN, getJwtSecretKey } from "@/lib/constants";
import { NextApiRequest, NextApiResponse } from "next";

interface UserJwtPayload {
  jti: string;
  iat: number;
  email?: string;
  userId?: string;
  role?: "ADMIN" | "USER";
}

export class AuthError extends Error {}

/**
 * Verifies the user's JWT token and returns its payload if it's valid.
 */
export async function verifyAuth({
  nextReq,
  nextApiReq,
}: {
  nextReq?: NextRequest;
  nextApiReq?: NextApiRequest;
}) {
  const token = nextReq
    ? nextReq.cookies.get(USER_TOKEN)?.value
    : nextApiReq?.cookies[USER_TOKEN];

  if (!token) throw new AuthError("Missing user token");

  try {
    const verified = await jwtVerify(
      token,
      new TextEncoder().encode(getJwtSecretKey()),
    );
    return verified.payload as UserJwtPayload;
  } catch (err) {
    throw new AuthError("Your token has expired.");
  }
}

/**
 * Adds the user token cookie to a response.
 */
export async function setUserCookie(
  res: NextApiResponse,
  email: string,
  userId: string,
  role: string,
) {
  const token = await new SignJWT({ email, userId, role })
    .setProtectedHeader({ alg: "HS256" })
    .setJti(nanoid())
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(new TextEncoder().encode(getJwtSecretKey()));

  res.setHeader("Set-Cookie", `turnover-user=${token}; Path=/; HttpOnly`);

  return res;
}
