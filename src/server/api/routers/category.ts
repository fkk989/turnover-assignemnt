import { z } from "zod";
import {
  adminProcedure,
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const categoryRouter = createTRPCRouter({
  create: adminProcedure
    .input(
      z.object({
        name: z.string(),
      }),
    )
    .mutation(async ({ ctx, input: { name } }) => {
      const { db } = ctx;
      try {
        await db.category.create({
          data: {
            name,
          },
        });
        return {
          success: true,
          message: "category created",
        };
      } catch (e: any) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  getAll: publicProcedure
    .input(
      z.object({
        currentPage: z.number(),
        limit: z.number(),
      }),
    )
    .query(async ({ ctx, input: { currentPage, limit } }) => {
      const { db } = ctx;
      try {
        const start = (Number(currentPage) - 1) * Number(limit);
        const categories = await db.category.findMany({
          skip: start,
          take: limit,
          include: {
            users: true,
          },
        });
        return {
          success: true,
          message: "fetched categories successfully",
          categories,
        };
      } catch (e: any) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  getCount: publicProcedure.query(async ({ ctx }) => {
    const { db } = ctx;
    try {
      const categoriesCount = await db.category.count();
      return {
        success: true,
        message: "categories counted",
        categoriesCount,
      };
    } catch (e: any) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),
  select: privateProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input: { id } }) => {
      const { db, id: userId } = ctx;
      try {
        const categoryIsSelected = await db.userCategory.findUnique({
          where: {
            userId_categoryId: { userId: userId!, categoryId: id },
          },
        });
        if (categoryIsSelected) {
          await db.userCategory.delete({
            where: { userId_categoryId: { userId: userId!, categoryId: id } },
          });
          return {
            success: true,
            message: "category deselected",
          };
        }

        await db.userCategory.create({
          data: {
            user: { connect: { id: userId } },
            category: { connect: { id } },
          },
        });
        return {
          success: true,
          message: "category saved",
        };
      } catch (e: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
        });
      }
    }),
  getAllSelected: privateProcedure.query(async ({ ctx }) => {
    const { id: userId, db } = ctx;
    try {
      const selectedCategories = await db.userCategory.findMany({
        where: { user: { id: userId } },
      });
      return {
        success: true,
        message: "fetched selected categories",
        selectedCategories,
      };
    } catch (e: any) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
      });
    }
  }),
});
