import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const treatmentHistoryRouter = createTRPCRouter({
  getByTreatmentId: publicProcedure
    .input(z.object({ treatmentId: z.string().uuid() })) // assuming UUID; adjust if needed
    .query(async ({ ctx, input }) => {
      try {
        // Step 1: Auth check
        const userId = ctx.session?.user?.id;
        if (!userId) {
          return {
            history: null,
            message: "Unauthorized",
            error: "NOT_AUTHENTICATED"
          };
        }

        // Step 2: Validate that the treatment belongs to the current user
        const treatment = await ctx.db.treatment.findFirst({
          where: {
            id: input.treatmentId,
            patient: {
              userId,
            },
          },
          select: {
            id: true,
          },
        });

        if (!treatment) {
          return {
            history: null,
            message: "Treatment not found or access denied",
            error: "NOT_FOUND_OR_UNAUTHORIZED"
          };
        }

        // Step 3: Fetch treatment history
        const history = await ctx.db.treatmentHistory.findMany({
          where: { treatmentId: input.treatmentId },
          orderBy: { session: "asc" },
        });

        return {
          history,
          message: "History retrieved successfully",
          error: null
        };

      } catch (error) {
        console.error("Error in getByTreatmentId:", error);

        // Step 4: Return structured fallback on error
        return {
          history: null,
          message: "Failed to fetch treatment history",
          error: "INTERNAL_SERVER_ERROR"
        };
      }
    }),
});

