"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const workerMessageSchema = zod_1.z.object({
    requestType: zod_1.z.enum(["HTTP"]),
    headers: zod_1.z.any(),
    body: zod_1.z.any(),
    url: zod_1.z.string(),
});
const workerReplySchema = zod_1.z.object({
    statusCode: zod_1.z.number(),
    isError: zod_1.z.boolean(),
    data: zod_1.z.string().optional(),
    errorMessage: zod_1.z.string().optional(),
});
