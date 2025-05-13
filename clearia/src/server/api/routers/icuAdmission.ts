import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

// Zod schema for ICU Admission validation
const icuAdmissionSchema = z.object({
  id: z.string().uuid().optional(), // Optional for creation, required for updates/deletes
  patientId: z.string().uuid(),
  bedNumber: z.number().int().positive(),
  admissionDate: z.date().default(() => new Date()),
  dischargeDate: z.date().optional().nullable(),
  staffId: z.string().uuid(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const icuAdmissionRouter = createTRPCRouter({
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.db.icuAdmission.findMany({
      orderBy: { admissionDate: "desc" },
      include: {
        patient: true,
        staff: true,
      },
    });
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(({ ctx, input }) => {
      return ctx.db.icuAdmission.findUnique({
        where: { id: input.id },
        include: {
          patient: true,
          staff: true,
          statusUpdates: {
            include: {
              staff: true,
            },
            orderBy: {
              timestamp: "desc",
            },
          },
        },
      });
    }),

  getByPatientId: publicProcedure
    .input(z.object({ patientId: z.string().uuid() }))
    .query(({ ctx, input }) => {
      return ctx.db.icuAdmission.findMany({
        where: { patientId: input.patientId },
        include: {
          patient: true,
          staff: true,
          statusUpdates: {
            include: {
              staff: true,
            },
            orderBy: {
              timestamp: "desc",
            },
          },
        },
        orderBy: {
          admissionDate: "desc",
        },
      });
    }),

  getCurrentAdmissions: publicProcedure.query(({ ctx }) => {
    return ctx.db.icuAdmission.findMany({
      where: {
        dischargeDate: null,
      },
      include: {
        patient: true,
        staff: true,
        statusUpdates: {
          take: 1,
          orderBy: {
            timestamp: "desc",
          },
        },
      },
      orderBy: {
        admissionDate: "desc",
      },
    });
  }),

  createAdmission: publicProcedure
    .input(
      icuAdmissionSchema.omit({ id: true, createdAt: true, updatedAt: true }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.icuAdmission.create({
        data: input,
        include: {
          patient: true,
          staff: true,
        },
      });
    }),

  updateAdmission: publicProcedure
    .input(icuAdmissionSchema.partial())
    .mutation(async ({ ctx, input }) => {
      return ctx.db.icuAdmission.update({
        where: { id: input.id },
        data: input,
        include: {
          patient: true,
          staff: true,
        },
      });
    }),

  dischargePatient: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        dischargeDate: z.date().default(() => new Date()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.icuAdmission.update({
        where: { id: input.id },
        data: {
          dischargeDate: input.dischargeDate,
        },
        include: {
          patient: true,
        },
      });
    }),

  deleteAdmission: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.icuAdmission.delete({
        where: { id: input.id },
      });
    }),

  // More robust getCurrentStatus procedure with safer querying
 getCurrentStatus : publicProcedure
    .input(z.object({ patientId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      try {
        // Step 1: Find the current admission
        const currentAdmission = await ctx.db.icuAdmission.findFirst({
          where: {
            patientId: input.patientId,
            dischargeDate: null, // Not discharged yet
          },
          orderBy: {
            admissionDate: "desc",
          },
        });

        if (!currentAdmission) {
          return {
            admission: null,
            latestStatus: null,
            message: "Patient is not currently admitted to ICU"
          };
        }

        // Step 2: Find the latest status update WITHOUT including staff at first
        const latestStatusUpdate = await ctx.db.statusUpdate.findFirst({
          where: {
            icuAdmissionId: currentAdmission.id,
          },
          orderBy: {
            timestamp: "desc",
          },
        });

        // Step 3: If we have a status update and it has a staffId, fetch staff separately
        let staffData = null;
        if (latestStatusUpdate?.staffId) {
          try {
            staffData = await ctx.db.user.findUnique({
              where: {
                id: latestStatusUpdate.staffId
              },
              select: {
                id: true,
                name: true
              }
            });
          } catch (staffError) {
            console.error("Error fetching staff data:", staffError);
            // Continue without staff data
          }
        }

        // Step 4: Return combined data
        return {
          admission: currentAdmission,
          latestStatus: latestStatusUpdate ? {
            ...latestStatusUpdate,
            staff: staffData
          } : null
        };
      } catch (error) {
        console.error("Error in getCurrentStatus:", error);

        // Return empty data instead of throwing
        return {
          admission: null,
          latestStatus: null,
          error: "An error occurred while fetching current status"
        };
      }
    })
});
