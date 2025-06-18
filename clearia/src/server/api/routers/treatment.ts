import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { TreatmentStatus } from "@prisma/client";

// Schema for treatment creation validation
const createTreatmentSchema = z.object({
  name: z.string().min(1, { message: "Treatment name is required" }),
  hospital: z.string().min(1, { message: "Hospital name is required" }),
  date: z.string().transform((str) => new Date(str)),
  patientId: z.string().uuid({ message: "Valid patient ID is required" }),
  doctorId: z.string().uuid({ message: "Valid doctor ID is required" }),
  status: z.nativeEnum(TreatmentStatus).default("ONGOING"),
});

// Schema for treatment update validation
const updateTreatmentSchema = z.object({
  id: z.string().uuid({ message: "Valid treatment ID is required" }),
  name: z.string().min(1, { message: "Treatment name is required" }).optional(),
  hospital: z
    .string()
    .min(1, { message: "Hospital name is required" })
    .optional(),
  date: z
    .string()
    .transform((str) => new Date(str))
    .optional(),
  patientId: z
    .string()
    .uuid({ message: "Valid patient ID is required" })
    .optional(),
  doctorId: z
    .string()
    .uuid({ message: "Valid doctor ID is required" })
    .optional(),
  status: z.nativeEnum(TreatmentStatus).optional(),
});

// Optional filter schema for fetching treatments
const treatmentFilterSchema = z.object({
  patientId: z.string().optional(),
  doctorId: z.string().optional(),
  status: z.nativeEnum(TreatmentStatus).optional(),
});

export const treatmentRouter = createTRPCRouter({
  // Create a new treatment
  create: publicProcedure
    .input(createTreatmentSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const treatment = await ctx.db.treatment.create({
          data: {
            name: input.name,
            hospital: input.hospital,
            date: input.date,
            status: input.status,
            patientId: input.patientId,
            doctorId: input.doctorId,
          },
        });

        return {
          success: true,
          treatment,
        };
      } catch (error) {
        if (error.code === "P2003") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid patient or doctor ID",
          });
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create treatment",
          cause: error,
        });
      }
    }),

  // Update a treatment
  update: publicProcedure
    .input(updateTreatmentSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, ...updateData } = input;

        const treatment = await ctx.db.treatment.update({
          where: { id },
          data: updateData,
          include: {
            patient: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                medicalId: true,
              },
            },
            doctor: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        });

        return {
          success: true,
          treatment,
        };
      } catch (error) {
        if (error.code === "P2025") {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Treatment not found",
          });
        }

        if (error.code === "P2003") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid patient or doctor ID",
          });
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update treatment",
          cause: error,
        });
      }
    }),

  // Get all treatments with optional filtering
  getAll: publicProcedure
    .input(treatmentFilterSchema.optional())
    .query(async ({ ctx, input }) => {
      try {
        // Build filter object
        const filter = input ?? {};

        return await ctx.db.treatment.findMany({
          where: filter,
          include: {
            patient: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                medicalId: true,
              },
            },
            doctor: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            date: "desc",
          },
        });
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch treatments",
          cause: error,
        });
      }
    }),

  // Get treatment by ID
  getById: publicProcedure.input(z.string()).query(async ({ ctx, input }) => {
    try {
      const treatment = await ctx.db.treatment.findUnique({
        where: { id: input },
        include: {
          patient: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              medicalId: true,
            },
          },
          doctor: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (!treatment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Treatment not found",
        });
      }

      return treatment;
    } catch (error) {
      if (error instanceof TRPCError) throw error;

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch treatment",
        cause: error,
      });
    }
  }),

  // Get all treatments for the current user
  getUserTreatments: publicProcedure
    .input(
      z.object({
        userId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      // First, find the Patient record associated with the user
      const patient = await ctx.db.patients.findUnique({
        where: {
          userId: input.userId,
        },
      });

      if (!patient) {
        return [];
      }

      // Then get all treatments for this patient
      const treatments = await ctx.db.treatment.findMany({
        where: {
          patientId: patient.id,
        },
        include: {
          doctor: {
            select: {
              name: true,
            },
          },
          history: {
            orderBy: {
              date: "desc",
            },
            take: 1, // Get the most recent history record
          },
        },
        orderBy: {
          updatedAt: "desc", // Most recent first
        },
      });

      // Transform the data to match the expected format in the frontend
      return treatments.map((treatment) => {
        const latestHistory = treatment.history[0];

        return {
          id: treatment.id,
          name: treatment.name,
          hospital: treatment.hospital,
          status: treatment.status,
          doctor: {
            name: treatment.doctor.name,
          },
          date: treatment.date,
          description: latestHistory?.notes || undefined,
          nextReviewDate: latestHistory?.nextReview || undefined,
          sideEffects: latestHistory?.sideEffects || undefined,
          medications: latestHistory?.prescribedMedications
            ? latestHistory.prescribedMedications
                .split(",")
                .map((med) => med.trim())
            : [],
        };
      });
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.treatment.delete({
        where: { id: input.id },
      });
    }),
});
