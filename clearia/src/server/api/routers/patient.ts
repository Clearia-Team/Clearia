import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

// Zod schema for Patient validation
const patientSchema = z.object({
  id: z.string().uuid().optional(), // Optional for creation, required for updates/deletes
  firstName: z.string().min(2, "First name must be at least 2 characters long"),
  lastName: z.string().min(2, "Last name must be at least 2 characters long"),
  dateOfBirth: z.date(),
  medicalId: z.string().min(1, "Medical ID is required"),
  allergies: z.string().optional(),
  bloodType: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const patientRouter = createTRPCRouter({
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.db.patient.findMany({
      orderBy: { createdAt: "desc" },
    });
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(({ ctx, input }) => {
      return ctx.db.patient.findUnique({
        where: { id: input.id },
      });
    }),

  createPatient: publicProcedure
    .input(patientSchema.omit({ id: true, createdAt: true, updatedAt: true }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.patient.create({
        data: input,
      });
    }),

  updatePatient: publicProcedure
    .input(patientSchema.partial())
    .mutation(async ({ ctx, input }) => {
      return ctx.db.patient.update({
        where: { id: input.id },
        data: input,
      });
    }),

  deletePatient: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.patient.delete({
        where: { id: input.id },
      });
    }),
});
