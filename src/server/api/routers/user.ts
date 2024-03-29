import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  privateProcedure,
} from "@/server/api/trpc";
import { Resend } from "resend";
import { TRPCError } from "@trpc/server";
import bcrypt from "bcrypt";
import { setUserCookie } from "@/helpers";

export const userRouter = createTRPCRouter({
  submitInput: publicProcedure
    .input(
      z.object({
        name: z
          .string({ required_error: "name is required" })
          .min(5, { message: "name should be atleast 5 character's" }),
        email: z
          .string({ required_error: "email is required" })
          .email({ message: "email invalid" }),
        password: z
          .string({ required_error: "password is required" })
          .min(8, { message: "password must be 8 characters long" })
          .regex(/[a-z]/, {
            message: "password must have one lowercase letter",
          })
          .regex(/[A-Z]/, {
            message: "password must have one uppercase letter",
          })
          .regex(/\d/, { message: "password must have one digit" })
          .regex(/[!@#$%^&*()_+]/, {
            message: "password must mush have one special character",
          }),
      }),
    )
    .mutation(async ({ ctx, input: { email } }) => {
      const { db } = ctx;
      try {
        const findUser = await db.user.findUnique({ where: { email } });
        if (findUser) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "email",
          });
        }
        return {
          success: true,
          message: "successfull",
        };
      } catch (e: any) {
        throw new TRPCError({
          code: e.code ? e.code : "INTERNAL_SERVER_ERROR",
          message: e.message,
        });
      }
    }),
  create: publicProcedure
    .input(
      z.object({
        name: z.string({ required_error: "name is required" }),
        email: z
          .string({ required_error: "email is required" })
          .toLowerCase()
          .email({ message: "email invalid" }),
        password: z
          .string({ required_error: "password is required" })
          .min(8, { message: "password must be 8 characters long" })
          .regex(/[a-z]/, {
            message: "password must have one lowercase letter",
          })
          .regex(/[A-Z]/, {
            message: "password must have one uppercase letter",
          })
          .regex(/\d/, { message: "password must have one digit" })
          .regex(/[!@#$%^&*()_+]/, {
            message: "password must mush have one special character",
          }),
      }),
    )
    .mutation(async ({ ctx, input: { email, name, password } }) => {
      let { res, db } = ctx;
      try {
        const user = await db.tokenVerification.findUnique({
          where: { email },
        });
        if (!user) {
          throw new TRPCError({ code: "NOT_FOUND", message: "user not found" });
        }
        if (!user.isVerified) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "user not verified",
          });
        }

        const salt = await bcrypt.genSalt(Number(process.env.SALT));
        const hashedPassword = await bcrypt.hash(password, salt);
        const createdUser = await db.user.create({
          data: {
            email,
            name,
            password: hashedPassword,
          },
        });

        // deletign verifying token for this user after creation
        await db.tokenVerification.delete({
          where: { email: createdUser.email },
        });

        // setting cookie
        await setUserCookie(
          res,
          createdUser.email,
          createdUser.id,
          createdUser.role,
        );

        return {
          success: true,
          message: "user created successfully",
        };
      } catch (e: any) {
        throw new TRPCError({
          code: e.code ? e.code : "INTERNAL_SERVER_ERROR",
          message: e.message ? e.message : "server",
        });
      }
    }),
  login: publicProcedure
    .input(
      z.object({
        email: z
          .string({ required_error: "email is requires" })
          .toLowerCase()
          .email({ message: "invalid email type" }),
        password: z
          .string({
            required_error: "password required",
          })
          .min(1),
      }),
    )
    .mutation(async ({ ctx, input: { email, password } }) => {
      const { res, db } = ctx;
      try {
        const user = await db.user.findUnique({
          where: { email },
        });
        if (!user) {
          throw new TRPCError({ code: "NOT_FOUND", message: "email" });
        }

        const isVerifiedPassword = await bcrypt.compare(
          password,
          user.password,
        );
        if (!isVerifiedPassword) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "password",
          });
        }

        await setUserCookie(res, user.email, user.id, user.role);

        return {
          success: true,
          message: "user log in successully",
        };
      } catch (e: any) {
        throw new TRPCError({
          code: e.code ? e.code : "INTERNAL_SERVER_ERROR",
          message: e.message,
        });
      }
    }),
  logout: publicProcedure.mutation(({ ctx }) => {
    const { res } = ctx;
    try {
      res.setHeader("Set-Cookie", `turnover-user=""; Path=/; HttpOnly`);
      return {
        success: true,
        message: "loged out successfylly",
      };
    } catch (e: any) {
      throw new TRPCError({ code: e.code ? e.code : "INTERNAL_SERVER_ERROR" });
    }
  }),
  getUser: privateProcedure.query(async ({ ctx }) => {
    const { id, db } = ctx;

    try {
      const user = await db.user.findUnique({
        where: { id },
      });
      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      user.password = "";
      return {
        success: true,
        message: "user fetched successfylly",
        user,
      };
    } catch (e: any) {
      throw new TRPCError({
        code: e.code ? e.code : "INTERNAL_SERVER_ERROR",
        message: e.message,
      });
    }
  }),
});
