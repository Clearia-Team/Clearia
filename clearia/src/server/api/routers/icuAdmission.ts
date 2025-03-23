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
    .input(icuAdmissionSchema.omit({ id: true, createdAt: true, updatedAt: true }))
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
    .input(z.object({ 
      id: z.string().uuid(),
      dischargeDate: z.date().default(() => new Date())
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.icuAdmission.update({
        where: { id: input.id },
        data: { 
          dischargeDate: input.dischargeDate
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
});
