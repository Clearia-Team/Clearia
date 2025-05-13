import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { PatientStatus } from "@prisma/client";

// Zod schema for Status Update validation
const statusUpdateSchema = z.object({
  id: z.string().uuid().optional(), // Optional for creation, required for updates/deletes
  icuAdmissionId: z.string().uuid(),
  status: z.nativeEnum(PatientStatus),
  notes: z.string().optional().nullable(),
  timestamp: z.date().default(() => new Date()),
  staffId: z.string().uuid(),
});

export const statusUpdateRouter = createTRPCRouter({
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.db.statusUpdate.findMany({
      orderBy: { timestamp: "desc" },
      include: {
        staff: true,
        icuAdmission: {
          include: {
            patient: true,
          },
        },
      },
    });
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(({ ctx, input }) => {
      return ctx.db.statusUpdate.findUnique({
        where: { id: input.id },
        include: {
          staff: true,
          icuAdmission: {
            include: {
              patient: true,
            },
          },
        },
      });
    }),

  getByAdmissionId: publicProcedure
    .input(z.object({ icuAdmissionId: z.string().uuid() }))
    .query(({ ctx, input }) => {
      return ctx.db.statusUpdate.findMany({
        where: { icuAdmissionId: input.icuAdmissionId },
        include: {
          staff: true,
        },
        orderBy: {
          timestamp: "desc",
        },
      });
    }),

  getLatestByAdmissionId: publicProcedure
    .input(z.object({ icuAdmissionId: z.string().uuid() }))
    .query(({ ctx, input }) => {
      return ctx.db.statusUpdate.findFirst({
        where: { icuAdmissionId: input.icuAdmissionId },
        include: {
          staff: true,
        },
        orderBy: {
          timestamp: "desc",
        },
      });
    }),

  createStatusUpdate: publicProcedure
    .input(statusUpdateSchema.omit({ id: true }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.statusUpdate.create({
        data: input,
        include: {
          staff: true,
          icuAdmission: {
            include: {
              patient: true,
            },
          },
        },
      });
    }),

  updateStatusUpdate: publicProcedure
    .input(statusUpdateSchema.partial())
    .mutation(async ({ ctx, input }) => {
      return ctx.db.statusUpdate.update({
        where: { id: input.id },
        data: input,
        include: {
          staff: true,
        },
      });
    }),

  deleteStatusUpdate: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.statusUpdate.delete({
        where: { id: input.id },
      });
    }),

  getStatusCounts: publicProcedure
    .input(
      z
        .object({
          startDate: z.date().optional(),
          endDate: z.date().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const dateFilter = input
        ? {
            timestamp: {
              ...(input.startDate ? { gte: input.startDate } : {}),
              ...(input.endDate ? { lte: input.endDate } : {}),
            },
          }
        : {};

      const statuses = Object.values(PatientStatus);
      const counts = await Promise.all(
        statuses.map((status) =>
          ctx.db.statusUpdate.count({
            where: {
              status,
              ...dateFilter,
            },
          }),
        ),
      );

      return statuses.reduce(
        (acc, status, index) => {
          acc[status] = counts[index] ?? 0;
          return acc;
        },
        {} as Record<PatientStatus, number>,
      );
    }),

  getCurrentStatusByAdmissionId: publicProcedure
    .input(z.object({ icuAdmissionId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const latest = await ctx.db.statusUpdate.findFirst({
        where: { icuAdmissionId: input.icuAdmissionId },
        select: {
          status: true,
          timestamp: true,
          staffId: true,
        },
        orderBy: {
          timestamp: "desc",
        },
      });

      return latest;
    }),
});
