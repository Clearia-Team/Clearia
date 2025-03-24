import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

// for Zod input validation
const userSchema = z.object({
  id: z.string().uuid().optional(), // Optional for creation, required for updates/deletes
  name: z.string().min(2, "Name must be at least 2 characters long"),
  email: z.string().email("Invalid email format"),
  role: z.enum(["NURSE", "DOCTOR", "ADMIN"]).default("NURSE"),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const userRouter = createTRPCRouter({
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.db.user.findMany();
  }),

  getLatest: publicProcedure.query(({ ctx }) => {
    return ctx.db.user.findFirst({
      orderBy: { createdAt: "desc" },
    });
  }),

  createUser: publicProcedure
    .input(userSchema.omit({ id: true, createdAt: true, updatedAt: true }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.user.create({
        data: input,
      });
    }),

  updateUser: publicProcedure
    .input(userSchema.partial())
    .mutation(async ({ ctx, input }) => {
      return ctx.db.user.update({
        where: { id: input.id },
        data: input,
      });
    }),

  deleteUser: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.user.delete({
        where: { id: input.id },
      });
    }),
});

