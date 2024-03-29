import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { Resend } from "resend";
import { generateOTP, sendEmail } from "@/helpers";
import { TRPCError } from "@trpc/server";
const resend = new Resend(process.env.RESEND_API_KEY);

import { Ratelimit } from "@upstash/ratelimit"; // for deno: see above
import { Redis } from "@upstash/redis"; // see below for cloudflare and fastly adapters

// Create a new ratelimiter, that allows 1 otp requests per 1 minute
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(1, "1 m"),
  analytics: true,
  /**
   * Optional prefix for the keys used in redis. This is useful if you want to share a redis
   * instance with other applications and want to avoid key collisions. The default prefix is
   * "@upstash/ratelimit"
   */
  prefix: "@upstash/ratelimit",
});

export const UserVerificationRouter = createTRPCRouter({
  create: publicProcedure
    .input(z.object({ email: z.string().toLowerCase().email() }))
    .mutation(async ({ ctx, input: { email } }) => {
      let { db } = ctx;

      try {
        const { success } = await ratelimit.limit(email);
        if (!success)
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: "wait for one minute after one request",
          });
        const token = await generateOTP(8);
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 10);

        const userTokenInDb = await db.tokenVerification.findUnique({
          where: { email },
        });

        console.log(userTokenInDb);

        if (userTokenInDb) {
          const updatedToken = await db.tokenVerification.update({
            where: { email },
            data: { token, tokenExpiry: expiresAt },
          });

          const deliveredEmail = await sendEmail({
            resend,
            email: updatedToken.email,
            token: updatedToken.token,
          });

          if (deliveredEmail.error) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "error while delivering email",
            });
          }

          return {
            success: true,
            message: "Email delivered",
          };
        } else {
          const createdToken = await db.tokenVerification.create({
            data: {
              email,
              token,
              tokenExpiry: expiresAt,
            },
          });

          const deliveredEmail = await sendEmail({
            resend,
            email: createdToken.email,
            token: createdToken.token,
          });

          if (deliveredEmail.error) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "error while delivering email",
            });
          }

          return {
            success: true,
            message: "Email delivered",
          };
        }
      } catch (e: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: e.message,
        });
      }
    }),
  verifyToken: publicProcedure
    .input(
      z.object({
        email: z
          .string({ required_error: "email is required" })
          .toLowerCase()
          .email({ message: "invalid email" }),
        token: z
          .string({ required_error: "otp should consist 8 numbers" })
          .min(8)
          .max(8),
      }),
    )
    .mutation(async ({ ctx, input: { email, token } }) => {
      let { db } = ctx;
      try {
        const userTokenInDb = await db.tokenVerification.findUnique({
          where: { email },
        });
        if (!userTokenInDb) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        if (userTokenInDb.token !== token) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Incorrect otp",
          });
        }
        if (userTokenInDb.tokenExpiry < new Date()) {
          throw new TRPCError({ code: "TIMEOUT", message: "Otp expired" });
        }

        const verifyUser = await db.tokenVerification.update({
          where: { email },
          data: { isVerified: true },
        });
      } catch (e: any) {
        throw new TRPCError({ code: "BAD_REQUEST", message: e.message });
      }
    }),
});
