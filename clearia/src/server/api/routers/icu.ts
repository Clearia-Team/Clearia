// src/server/api/routers/icu.ts
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const icuRouter = createTRPCRouter({
  // Public procedure: Say hello (simple example for testing)
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  // Public procedure: Create a new ICU admission
  createAdmission: publicProcedure
    .input(
      z.object({
        patientId: z.string().uuid(),
        bedNumber: z.number().int().positive(),
        staffId: z.string().uuid(), // Staff ID now required as input
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.icuAdmission.create({ // Using ctx.db per your setup
        data: {
          patient: { connect: { id: input.patientId } },
          bedNumber: input.bedNumber,
          staffId: input.staffId, // Use provided staffId
        },
      });
    }),

  // Public procedure: Update patient status
  updateStatus: publicProcedure
    .input(
      z.object({
        icuAdmissionId: z.string().uuid(),
        status: z.enum(["CRITICAL", "STABLE", "IMPROVING", "RECOVERED", "DECEASED"]),
        staffId: z.string().uuid(), // Staff ID now required as input
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.statusUpdate.create({ // Using ctx.db
        data: {
          icuAdmission: { connect: { id: input.icuAdmissionId } },
          staff: { connect: { id: input.staffId } },
          status: input.status,
          notes: input.notes,
        },
      });
    }),

  // Public procedure: Get the latest status for an ICU admission
  getLatestStatus: publicProcedure
    .input(z.object({ icuAdmissionId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const status = await ctx.db.statusUpdate.findFirst({ // Using ctx.db
        where: { icuAdmissionId: input.icuAdmissionId },
        orderBy: { timestamp: "desc" },
        include: { staff: true }, // Include staff details
      });

      return status ?? null;
    }),

  // Public procedure: Get all active ICU admissions for a given staff member
  getMyActiveAdmissions: publicProcedure
    .input(z.object({ staffId: z.string().uuid() })) // Staff ID now required as input
    .query(async ({ ctx, input }) => {
      const admissions = await ctx.db.icuAdmission.findMany({ // Using ctx.db
        where: {
          dischargeDate: null, // Only active admissions
          statusUpdates: {
            some: { staffId: input.staffId }, // Filter by provided staffId
          },
        },
        include: {
          patient: true,
          statusUpdates: {
            orderBy: { timestamp: "desc" },
            take: 1, // Latest status only
          },
        },
      });

      return admissions;
    }),

  // Public procedure: Get a secret message (no auth needed)
  getSecretMessage: publicProcedure.query(() => {
    return "you can now see the ICU secret message!";
  }),
});
