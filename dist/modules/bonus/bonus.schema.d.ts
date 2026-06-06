import { z } from 'zod';
export declare const createBonusQrSchema: z.ZodObject<{
    amount: z.ZodNumber;
    label: z.ZodOptional<z.ZodString>;
    maxClaims: z.ZodOptional<z.ZodNumber>;
    expiresAt: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const claimBonusSchema: z.ZodObject<{
    token: z.ZodString;
}, z.core.$strip>;
export declare const staffAwardSchema: z.ZodObject<{
    userId: z.ZodOptional<z.ZodString>;
    userQrToken: z.ZodOptional<z.ZodString>;
    amount: z.ZodNumber;
    reason: z.ZodString;
}, z.core.$strip>;
export type CreateBonusQrInput = z.infer<typeof createBonusQrSchema>;
export type ClaimBonusInput = z.infer<typeof claimBonusSchema>;
export type StaffAwardInput = z.infer<typeof staffAwardSchema>;
