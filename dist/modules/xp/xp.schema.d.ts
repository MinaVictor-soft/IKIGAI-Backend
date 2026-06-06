import { z } from 'zod';
export declare const awardXpSchema: z.ZodObject<{
    userId: z.ZodString;
    amount: z.ZodNumber;
    description: z.ZodOptional<z.ZodString>;
    reason: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const bulkAwardSchema: z.ZodObject<{
    userIds: z.ZodArray<z.ZodString>;
    amount: z.ZodNumber;
    description: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type AwardXpInput = z.infer<typeof awardXpSchema>;
export type BulkAwardInput = z.infer<typeof bulkAwardSchema>;
