import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { userRouter } from "./routers/user";
import { patientRouter } from "./routers/patient";
import { icuAdmissionRouter } from "./routers/icuAdmission";
import { statusUpdateRouter } from "./routers/statusUpdates";
import { treatmentRouter } from "./routers/treatment";
import { treatmentHistoryRouter } from "./routers/treatmentHistory";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  user: userRouter,
  patient: patientRouter,
  icuAdmission: icuAdmissionRouter,
  statusUpdate: statusUpdateRouter,
  treatment: treatmentRouter,
  treatmentHistory: treatmentHistoryRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
