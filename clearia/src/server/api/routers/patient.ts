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
      include: {
        User: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(({ ctx, input }) => {
      return ctx.db.patient.findUnique({
        where: { id: input.id },
        include: {
          User: {
            select: {
              name: true,
              email: true,
            },
          },
          icuAdmissions: true,
          treatments: true,
          medical_ids: true,
        },
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
        password: z.string().min(6),
        username: z.string().min(3, "Username must be at least 3 characters long"), // Added username field
        name: z.string().optional(), // Optional name field for User
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if email already exists
        const existingUserByEmail = await ctx.db.user.findUnique({
          where: { email: input.email },
        });

        if (existingUserByEmail) {
          throw new Error("An account with this email already exists");
        }

        // Check if username already exists
        const existingUserByUsername = await ctx.db.user.findUnique({
          where: { username: input.username },
        });

        if (existingUserByUsername) {
          throw new Error("This username is already taken");
        }

        // Check if medical ID already exists
        const existingPatientByMedicalId = await ctx.db.patient.findUnique({
          where: { medicalId: input.medicalId },
        });

        if (existingPatientByMedicalId) {
          throw new Error("An account with this medical ID already exists");
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(input.password, 10);
        
        // Create user first
        const user = await ctx.db.user.create({
          data: {
            email: input.email,
            username: input.username, // Added username field
            password: hashedPassword,
            role: "PATIENT",
            name: input.name || `${input.firstName} ${input.lastName}`,
          },
        });

        // Create patient with the user ID
        const patient = await ctx.db.patient.create({
          data: {
            id: user.id, // Use the same ID as the user (based on your schema relationship)
            firstName: input.firstName,
            lastName: input.lastName,
            dateOfBirth: input.dateOfBirth,
            medicalId: input.medicalId,
            allergies: input.allergies,
            bloodType: input.bloodType,
            userId: user.id,
            updatedAt: new Date(), // Explicitly set updatedAt
          },
          include: {
            User: {
              select: {
                name: true,
                email: true,
                username: true, // Include username in response
              },
            },
          },
        });

        return patient;
      } catch (error) {
        // Handle Prisma unique constraint errors
        if (error instanceof Error) {
          if (error.message.includes('Unique constraint failed on the fields: (`email`)')) {
            throw new Error("An account with this email already exists");
          }
          if (error.message.includes('Unique constraint failed on the fields: (`medicalId`)')) {
            throw new Error("An account with this medical ID already exists");
          }
          if (error.message.includes('Unique constraint failed on the fields: (`username`)')) {
            throw new Error("This username is already taken");
          }
          // Re-throw custom errors
          throw error;
        }
        // Handle unexpected errors
        throw new Error("Failed to create patient account. Please try again.");
      }
    }),

  updatePatient: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        firstName: z.string().min(2).optional(),
        lastName: z.string().min(2).optional(),
        dateOfBirth: z.date().optional(),
        allergies: z.string().optional(),
        bloodType: z.string().optional(),
        // Note: medicalId is unique, so be careful when updating
        medicalId: z.string().min(1).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;
      
      return ctx.db.patient.update({
        where: { id },
        data: {
          ...updateData,
          updatedAt: new Date(),
        },
        include: {
          User: {
            select: {
              name: true,
              email: true,
              username: true, // Include username in response
            },
          },
        },
      });
    }),

  deletePatient: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Note: This will cascade delete the User due to onDelete: Cascade in the schema
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
          dischargeDate: null, // Only active ICU admissions
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

  getPatientTreatments: publicProcedure
    .input(z.object({ patientId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.treatment.findMany({
        where: {
          patientId: input.patientId,
        },
        include: {
          doctor: {
            select: {
              name: true,
              email: true,
              username: true, // Include username in response
            },
          },
          history: {
            orderBy: {
              date: "desc",
            },
          },
        },
        orderBy: {
          date: "desc",
        },
      });
    }),

  getPatientByMedicalId: publicProcedure
    .input(z.object({ medicalId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.patient.findUnique({
        where: { medicalId: input.medicalId },
        include: {
          User: {
            select: {
              name: true,
              email: true,
              username: true, // Include username in response
            },
          },
        },
      });
    }),

  resetPassword: publicProcedure
  .input(z.object({ email: z.string().email() }))
  .mutation(async ({ ctx, input }) => {
    // Implementation for sending password reset email
    // This would typically involve:
    // 1. Checking if user exists
    // 2. Generating a reset token
    // 3. Sending email with reset link
    // 4. Storing the token with expiration
  }),
});
