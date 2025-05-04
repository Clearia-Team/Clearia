import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import bcrypt from "bcryptjs";

// for Zod input validation
const userSchema = z.object({
  id: z.string().uuid().optional(), // Optional for creation, required for updates/deletes
  name: z.string().min(2, "Name must be at least 2 characters long"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  role: z.enum(["NURSE", "DOCTOR", "ADMIN"]).default("NURSE"),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const userRouter = createTRPCRouter({
  verifyCredentials: publicProcedure
    .input(z.object({ email: z.string().email(), password: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { email: input.email },
      });

      if (!user?.password) {
        throw new Error("Invalid email or password");
      }

      const isMatch = await bcrypt.compare(input.password, user.password);
      if (!isMatch) {
        throw new Error("Invalid email or password");
      }

      return {
        success: true,
        user: { id: user.id, email: user.email, role: user.role },
      };
    }),

  createUser: publicProcedure
    .input(userSchema.omit({ id: true, createdAt: true, updatedAt: true }))
    .mutation(async ({ ctx, input }) => {
      const hashedPassword = await bcrypt.hash(input.password, 10);

      return ctx.db.user.create({
        data: {
          ...input,
          password: hashedPassword,
        },
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

  getLatest: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.user.findFirst({
      orderBy: {
        createdAt: "desc",
      },
    });
  }),
  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.user.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
  }),
});

