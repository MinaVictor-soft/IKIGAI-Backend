import { z } from 'zod';

export const scanQrSchema = z.object({
  qrToken: z.string().min(1, 'QR token is required'),
});

export type ScanQrInput = z.infer<typeof scanQrSchema>;
