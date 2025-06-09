// server/api/routers/hospital.ts
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

const hospitalSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2, "Hospital name must be at least 2 characters long"),
  address: z.string().min(5, "Address must be at least 5 characters long"),
  city: z.string().min(2, "City must be at least 2 characters long"),
  state: z.string().min(2, "State must be at least 2 characters long"),
  zipCode: z.string().min(5, "Zip code must be at least 5 characters long"),
  phone: z.string().min(10, "Phone number must be at least 10 characters long"),
  email: z.string().email("Invalid email format").optional(),
  website: z.string().url("Invalid website URL").optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

const createHospitalSchema = hospitalSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

const updateHospitalSchema = hospitalSchema.partial().extend({
  id: z.string().uuid(),
});

export const hospitalRouter = createTRPCRouter({
  // Create a new hospital
  create: publicProcedure
    .input(createHospitalSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if hospital with same name and city already exists
        const existingHospital = await ctx.db.hospital.findFirst({
          where: {
            name: input.name,
            city: input.city,
          },
        });

        if (existingHospital) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Hospital with this name already exists in this city",
          });
        }

        const hospital = await ctx.db.hospital.create({
          data: input,
          include: {
            users: {
              select: {
                id: true,
                name: true,
                email: true,
                username: true,
                role: true,
              },
            },
          },
        });

        return hospital;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create hospital",
          cause: error,
        });
      }
    }),

  // Get all hospitals
  getAll: publicProcedure.query(async ({ ctx }) => {
    try {
      return await ctx.db.hospital.findMany({
        include: {
          users: {
            select: {
              id: true,
              name: true,
              email: true,
              username: true,
              role: true,
            },
          },
        },
        orderBy: {
          name: "asc",
        },
      });
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch hospitals",
        cause: error,
      });
    }
  }),

  // Get hospital by ID
  getById: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      try {
        const hospital = await ctx.db.hospital.findUnique({
          where: { id: input.id },
          include: {
            users: {
              select: {
                id: true,
                name: true,
                email: true,
                username: true,
                role: true,
                createdAt: true,
              },
              orderBy: {
                name: "asc",
              },
            },
          },
        });

        if (!hospital) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Hospital not found",
          });
        }

        return hospital;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch hospital",
          cause: error,
        });
      }
    }),

  // Get hospitals by city/state
  getByLocation: publicProcedure
    .input(
      z.object({
        city: z.string().optional(),
        state: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const whereClause: any = {};
        
        if (input.city) {
          whereClause.city = {
            contains: input.city,
            mode: "insensitive",
          };
        }
        
        if (input.state) {
          whereClause.state = {
            contains: input.state,
            mode: "insensitive",
          };
        }

        return await ctx.db.hospital.findMany({
          where: whereClause,
          include: {
            users: {
              select: {
                id: true,
                name: true,
                role: true,
              },
            },
          },
          orderBy: {
            name: "asc",
          },
        });
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch hospitals by location",
          cause: error,
        });
      }
    }),

  // Update hospital
  update: publicProcedure
    .input(updateHospitalSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, ...updateData } = input;

        // Check if hospital exists
        const existingHospital = await ctx.db.hospital.findUnique({
          where: { id },
        });

        if (!existingHospital) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Hospital not found",
          });
        }

        // Check for name conflicts if name is being updated
        if (updateData.name && updateData.name !== existingHospital.name) {
          const nameConflict = await ctx.db.hospital.findFirst({
            where: {
              name: updateData.name,
              city: updateData.city || existingHospital.city,
              id: {
                not: id,
              },
            },
          });

          if (nameConflict) {
            throw new TRPCError({
              code: "CONFLICT",
              message: "Hospital with this name already exists in this city",
            });
          }
        }

        const hospital = await ctx.db.hospital.update({
          where: { id },
          data: updateData,
          include: {
            users: {
              select: {
                id: true,
                name: true,
                email: true,
                username: true,
                role: true,
              },
            },
          },
        });

        return hospital;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update hospital",
          cause: error,
        });
      }
    }),

  // Delete hospital
  delete: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if hospital has users
        const hospital = await ctx.db.hospital.findUnique({
          where: { id: input.id },
          include: {
            users: true,
          },
        });

        if (!hospital) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Hospital not found",
          });
        }

        if (hospital.users.length > 0) {
          throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message: "Cannot delete hospital with existing users. Please reassign or remove users first.",
          });
        }

        await ctx.db.hospital.delete({
          where: { id: input.id },
        });

        return { success: true, message: "Hospital deleted successfully" };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete hospital",
          cause: error,
        });
      }
    }),

  // Get hospital statistics
  getStats: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      try {
        const hospital = await ctx.db.hospital.findUnique({
          where: { id: input.id },
          include: {
            users: {
              select: {
                role: true,
              },
            },
          },
        });

        if (!hospital) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Hospital not found",
          });
        }

        const stats = {
          totalStaff: hospital.users.length,
          doctors: hospital.users.filter(u => u.role === "DOCTOR").length,
          nurses: hospital.users.filter(u => u.role === "NURSE").length,
          admins: hospital.users.filter(u => u.role === "ADMIN").length,
          patients: hospital.users.filter(u => u.role === "PATIENT").length,
        };

        return {
          hospital: {
            id: hospital.id,
            name: hospital.name,
            city: hospital.city,
            state: hospital.state,
          },
          stats,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch hospital statistics",
          cause: error,
        });
      }
    }),

  // Search hospitals
  search: publicProcedure
    .input(
      z.object({
        query: z.string().min(1, "Search query is required"),
        limit: z.number().min(1).max(50).default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        return await ctx.db.hospital.findMany({
          where: {
            OR: [
              {
                name: {
                  contains: input.query,
                  mode: "insensitive",
                },
              },
              {
                city: {
                  contains: input.query,
                  mode: "insensitive",
                },
              },
              {
                state: {
                  contains: input.query,
                  mode: "insensitive",
                },
              },
            ],
          },
          take: input.limit,
          include: {
            users: {
              select: {
                id: true,
                name: true,
                role: true,
              },
            },
          },
          orderBy: {
            name: "asc",
          },
        });
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to search hospitals",
          cause: error,
        });
      }
    }),
});
