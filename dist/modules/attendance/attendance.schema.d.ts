import { z } from 'zod';
export declare const scanQrSchema: z.ZodObject<{
    qrToken: z.ZodString;
}, z.core.$strip>;
export type ScanQrInput = z.infer<typeof scanQrSchema>;
