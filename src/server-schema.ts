import { z } from "zod";

const workerMessageSchema = z.object({
  requestType: z.enum(["HTTP"]),
  headers: z.any(),
  body: z.any(),
  url: z.string(),
});

export type WorkerMessageType = z.infer<typeof workerMessageSchema>;
