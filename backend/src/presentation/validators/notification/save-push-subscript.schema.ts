import { z } from "zod";

export const SavePushSubscriptionSchema = z.object({
    endpoint: z.string().url(),
    p256dh: z.string().min(1),
    auth: z.string().min(1),
});
