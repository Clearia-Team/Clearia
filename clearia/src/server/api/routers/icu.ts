import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const icuRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  // Create a new ICU admission
  createAdmission: publicProcedure
    .input(z.object({ 
      patientId: z.string().uuid(),
      bedNumber: z.number().int().positive(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.icuAdmission.create({
        data: {
          patientId: input.patientId,
          bedNumber: input.bedNumber,
          staffId: ctx.session?.user?.id,
        },
      });
    }),

  // Update patient status
  updateStatus: publicProcedure
    .input(z.object({
      icuAdmissionId: z.string().uuid(),
      status: z.enum(["CRITICAL", "STABLE", "IMPROVING", "RECOVERED", "DECEASED"]),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.statusUpdate.create({
        data: {
          icuAdmissionId: input.icuAdmissionId,
          status: input.status,
          notes: input.notes,
          staffId: ctx.session?.user?.id,
        },
      });
    }),

  // Get latest status for a patient's ICU admission
  getLatestStatus: publicProcedure
    .input(z.object({ icuAdmissionId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const status = await ctx.db.statusUpdate.findFirst({
        where: { icuAdmissionId: input.icuAdmissionId },
        orderBy: { timestamp: "desc" },
        include: { staff: true },
      });
      return status ?? null;
    }),

  // Get all active ICU admissions
  getActiveAdmissions: publicProcedure
    .query(async ({ ctx }) => {
      return ctx.db.icuAdmission.findMany({
        where: {
          dischargeDate: null,
        },
        include: {
          patient: true,
          statusUpdates: {
            orderBy: { timestamp: "desc" },
            take: 1,
          },
        },
        orderBy: { admissionDate: "desc" },
      });
    }),

  // Get all patients
  getPatients: publicProcedure
    .query(async ({ ctx }) => {
      return ctx.db.patient.findMany({
        orderBy: { lastName: "asc" },
      });
    }),
    
  // Create a new patient
  createPatient: publicProcedure
    .input(z.object({
      firstName: z.string().min(1),
      lastName: z.string().min(1),
      dateOfBirth: z.date(),
      medicalId: z.string().min(1),
      allergies: z.string().optional(),
      bloodType: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.patient.create({
        data: input,
      });
    }),

  // Discharge a patient
  dischargePatient: publicProcedure
    .input(z.object({
      icuAdmissionId: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.icuAdmission.update({
        where: { id: input.icuAdmissionId },
        data: { dischargeDate: new Date() },
      });
    }),
});
