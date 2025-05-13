import bcrypt from "bcryptjs";
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
    .input(
      z.object({
        firstName: z.string().min(2),
        lastName: z.string().min(2),
        dateOfBirth: z.date(),
        medicalId: z.string().min(1),
        allergies: z.string().optional(),
        bloodType: z.string().optional(),
        email: z.string().email(),
        password: z.string().min(6), // Add password for the User
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Hash the password
      const hashedPassword = await bcrypt.hash(input.password, 10);

      const user = await ctx.db.user.create({
        data: {
          email: input.email,
          password: hashedPassword,
          role: "PATIENT",
          name: input.firstName + " " + input.lastName, // optional
        },
      });

      const patient = await ctx.db.patient.create({
        data: {
          firstName: input.firstName,
          lastName: input.lastName,
          dateOfBirth: input.dateOfBirth,
          medicalId: input.medicalId,
          allergies: input.allergies,
          bloodType: input.bloodType,
          user: {
            connect: { id: user.id }, // ✅ Proper way to link user
          },
        },
      });

      return patient;
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

  getIcuAdmissionIdByPatientId: publicProcedure
    .input(z.object({ patientId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const admission = await ctx.db.icuAdmission.findFirst({
        where: {
          patientId: input.patientId,
          dischargeDate: null, // Optional: if you only want active ICU admissions
        },
        orderBy: {
          admissionDate: "desc",
        },
        select: {
          id: true,
        },
      });

      return admission; // will return { id: string } | null
    }),
});
