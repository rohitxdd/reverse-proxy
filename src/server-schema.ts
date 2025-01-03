import { error } from "node:console";
import { z } from "zod";

const workerMessageSchema = z.object({
  requestType: z.enum(["HTTP"]),
  headers: z.any(),
  body: z.any(),
  url: z.string(),
});

const workerReplySchema = z.object({
  statusCode: z.number(),
  isError: z.boolean(),
  data: z.string().optional(),
  errorMessage: z.string().optional(),
});

export type WorkerMessageType = z.infer<typeof workerMessageSchema>;
export type WorkerReplyType = z.infer<typeof workerReplySchema>;
