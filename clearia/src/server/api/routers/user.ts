import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";

// Updated user schema to match the new Prisma schema
const userSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2, "Name must be at least 2 characters long"),
  email: z.string().email("Invalid email format"),
  username: z.string().min(3, "Username must be at least 3 characters long"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  role: z.enum(["NURSE", "DOCTOR", "ADMIN", "PATIENT"]).default("NURSE"),
  hospitalId: z.string().uuid().optional(),
  emailVerified: z.date().optional(),
  image: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

const createUserSchema = userSchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
  emailVerified: true 
});

export const userRouter = createTRPCRouter({
  // Updated to work with new schema fields
verifyCredentials: publicProcedure
  .input(
    z.object({
      email: z.string().email(),
      password: z.string().min(1),
    })
  )
  .mutation(async ({ ctx, input }) => {
    try {
      const user = await ctx.db.user.findUnique({
        where: { email: input.email },
        include: {
          patients: true,
          hospital: {
            select: {
              id: true,
              name: true,
              city: true,
              state: true,
            },
          },
        },
      });

      if (!user?.password) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid email or password",
        });
      }

      const isMatch = await bcrypt.compare(input.password, user.password);
      if (!isMatch) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid email or password",
        });
      }

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
          hospital: user.hospital,
        },
      };
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Authentication failed",
        cause: error,
      });
    }
  }),

  // Admin login verification
  verifyAdminCredentials: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        username: z.string().optional(),
        password: z.string().min(1),
        hospitalId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const user = await ctx.db.user.findFirst({
          where: {
            OR: [
              { email: input.email },
              { username: input.username },
            ],
            role: "ADMIN",
          },
          include: {
            hospital: {
              select: {
                id: true,
                name: true,
                city: true,
                state: true,
              }
            },
          },
        });

        if (!user?.password) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid credentials",
          });
        }

        const isMatch = await bcrypt.compare(input.password, user.password);
        if (!isMatch) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid credentials",
          });
        }

        // Check hospital ID if provided
        if (input.hospitalId && user.hospitalId !== input.hospitalId) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Hospital ID does not match",
          });
        }

        return {
          success: true,
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            role: user.role,
            hospital: user.hospital,
          },
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Authentication failed",
          cause: error,
        });
      }
    }),

  // Updated createUser with new schema fields
  createUser: publicProcedure
    .input(createUserSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if email already exists
        const existingEmail = await ctx.db.user.findUnique({
          where: { email: input.email },
        });

        if (existingEmail) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Email already exists",
          });
        }

        // Check if username already exists
        const existingUsername = await ctx.db.user.findUnique({
          where: { username: input.username },
        });

        if (existingUsername) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Username already exists",
          });
        }

        // Verify hospital exists if hospitalId is provided
        if (input.hospitalId) {
          const hospital = await ctx.db.hospital.findUnique({
            where: { id: input.hospitalId },
          });

          if (!hospital) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Hospital not found",
            });
          }
        }

        const hashedPassword = await bcrypt.hash(input.password, 12);

        const user = await ctx.db.user.create({
          data: {
            name: input.name,
            email: input.email,
            username: input.username,
            password: hashedPassword,
            role: input.role,
            hospitalId: input.hospitalId,
            image: input.image,
          },
          include: {
            hospital: {
              select: {
                id: true,
                name: true,
                city: true,
                state: true,
              }
            },
          },
        });

        // Don't return password in response
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create user",
          cause: error,
        });
      }
    }),

  // Updated updateUser with new schema fields
  updateUser: publicProcedure
    .input(
      userSchema.partial().extend({
        id: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, password, ...updateData } = input;

        // If updating password, hash it
        const dataToUpdate: any = { ...updateData };
        if (password) {
          dataToUpdate.password = await bcrypt.hash(password, 12);
        }

        // Verify hospital exists if hospitalId is being updated
        if (input.hospitalId) {
          const hospital = await ctx.db.hospital.findUnique({
            where: { id: input.hospitalId },
          });

          if (!hospital) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Hospital not found",
            });
          }
        }

        const user = await ctx.db.user.update({
          where: { id },
          data: dataToUpdate,
          include: {
            hospital: {
              select: {
                id: true,
                name: true,
                city: true,
                state: true,
              }
            },
          },
        });

        // Don't return password in response
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update user",
          cause: error,
        });
      }
    }),

  deleteUser: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.db.user.delete({
          where: { id: input.id },
        });
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete user",
          cause: error,
        });
      }
    }),

  // Updated getAll with new fields and hospital info
  getAll: publicProcedure.query(async ({ ctx }) => {
    try {
      const users = await ctx.db.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          username: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          emailVerified: true,
          image: true,
          hospital: {
            select: {
              id: true,
              name: true,
              city: true,
              state: true,
            }
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return users;
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch users",
        cause: error,
      });
    }
  }),

  getLatest: publicProcedure.query(async ({ ctx }) => {
    try {
      return await ctx.db.user.findFirst({
        select: {
          id: true,
          name: true,
          email: true,
          username: true,
          role: true,
          createdAt: true,
          hospital: {
            select: {
              id: true,
              name: true,
              city: true,
              state: true,
            }
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch latest user",
        cause: error,
      });
    }
  }),

  getDoctors: publicProcedure.query(async ({ ctx }) => {
    try {
      return await ctx.db.user.findMany({
        where: {
          role: "DOCTOR",
        },
        select: {
          id: true,
          name: true,
          email: true,
          username: true,
          hospital: {
            select: {
              id: true,
              name: true,
              city: true,
              state: true,
            }
          },
        },
        orderBy: {
          name: "asc",
        },
      });
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch doctors",
        cause: error,
      });
    }
  }),

  // Get users by hospital
  getUsersByHospital: publicProcedure
    .input(z.object({ hospitalId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      try {
        return await ctx.db.user.findMany({
          where: {
            hospitalId: input.hospitalId,
          },
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
            role: true,
            createdAt: true,
            hospital: {
              select: {
                id: true,
                name: true,
                city: true,
                state: true,
              }
            },
          },
          orderBy: {
            name: "asc",
          },
        });
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch users by hospital",
          cause: error,
        });
      }
    }),

  // Get user by username
  getUserByUsername: publicProcedure
    .input(z.object({ username: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const user = await ctx.db.user.findUnique({
          where: { username: input.username },
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
            role: true,
            createdAt: true,
            emailVerified: true,
            image: true,
            hospital: {
              select: {
                id: true,
                name: true,
                city: true,
                state: true,
              }
            },
          },
        });

        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }

        return user;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch user",
          cause: error,
        });
      }
    }),
});
