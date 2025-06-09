import { z } from "zod";
import { publicProcedure, createTRPCRouter } from "~/server/api/trpc";
import axios from "axios";

export const doctorRecommendationRouter = createTRPCRouter({
  recommend: publicProcedure
    .input(z.object({ symptoms: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const response = await axios.post("http://localhost:8080/recommend", {
          symptoms: input.symptoms,
        });
        return response.data;
      } catch (error: any) {
        throw new Error(
          error.response?.data?.detail ?? "Failed to get recommendation"
        );
      }
    }),
});
