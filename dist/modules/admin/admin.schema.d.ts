import { z } from 'zod';
export declare const createSessionSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    speaker: z.ZodOptional<z.ZodString>;
    location: z.ZodOptional<z.ZodString>;
    sessionDate: z.ZodString;
    startTime: z.ZodString;
    endTime: z.ZodString;
    xpReward: z.ZodDefault<z.ZodNumber>;
    maxCapacity: z.ZodOptional<z.ZodNumber>;
    attendanceBufferMinutes: z.ZodDefault<z.ZodNumber>;
}, z.core.$strip>;
export declare const updateSessionStatusSchema: z.ZodObject<{
    status: z.ZodEnum<{
        ACTIVE: "ACTIVE";
        SCHEDULED: "SCHEDULED";
        COMPLETED: "COMPLETED";
        CANCELLED: "CANCELLED";
    }>;
}, z.core.$strip>;
export declare const updateSessionSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    speaker: z.ZodOptional<z.ZodString>;
    location: z.ZodOptional<z.ZodString>;
    sessionDate: z.ZodOptional<z.ZodString>;
    startTime: z.ZodOptional<z.ZodString>;
    endTime: z.ZodOptional<z.ZodString>;
    xpReward: z.ZodOptional<z.ZodNumber>;
    maxCapacity: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
}, z.core.$strip>;
export declare const createUserSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    name: z.ZodString;
    phone: z.ZodOptional<z.ZodString>;
    role: z.ZodDefault<z.ZodEnum<{
        ATTENDEE: "ATTENDEE";
        ADMIN: "ADMIN";
        SUPER_ADMIN: "SUPER_ADMIN";
        STAFF: "STAFF";
    }>>;
    church: z.ZodOptional<z.ZodString>;
    diocese: z.ZodOptional<z.ZodString>;
    tribeId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const createTribeSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    color: z.ZodOptional<z.ZodString>;
    maxMembers: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export declare const updateTribeSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    color: z.ZodOptional<z.ZodString>;
    maxMembers: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
}, z.core.$strip>;
export declare const assignTribeSchema: z.ZodObject<{
    tribeId: z.ZodNullable<z.ZodString>;
}, z.core.$strip>;
export declare const adjustXpSchema: z.ZodObject<{
    amount: z.ZodNumber;
    reason: z.ZodString;
}, z.core.$strip>;
export declare const resetPasswordSchema: z.ZodObject<{
    defaultPassword: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const changeUserRoleSchema: z.ZodObject<{
    role: z.ZodEnum<{
        ATTENDEE: "ATTENDEE";
        ADMIN: "ADMIN";
        SUPER_ADMIN: "SUPER_ADMIN";
        STAFF: "STAFF";
    }>;
}, z.core.$strip>;
export declare const updateCmsConfigSchema: z.ZodObject<{
    appName: z.ZodOptional<z.ZodString>;
    appNameAr: z.ZodOptional<z.ZodString>;
    infoPageTitle: z.ZodOptional<z.ZodString>;
    infoPageTitleAr: z.ZodOptional<z.ZodString>;
    infoPageContent: z.ZodOptional<z.ZodString>;
    infoPageContentAr: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const updateNavConfigSchema: z.ZodObject<{
    web: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        visible: z.ZodBoolean;
    }, z.core.$strip>>>;
    mobile: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        visible: z.ZodBoolean;
    }, z.core.$strip>>>;
}, z.core.$strip>;
export type CreateSessionInput = z.infer<typeof createSessionSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type CreateTribeInput = z.infer<typeof createTribeSchema>;
export type ChangeUserRoleInput = z.infer<typeof changeUserRoleSchema>;
export type UpdateCmsConfigInput = z.infer<typeof updateCmsConfigSchema>;
export type UpdateNavConfigInput = z.infer<typeof updateNavConfigSchema>;
