import dayjs from 'dayjs';
import { z } from 'zod';

export const TodoFormSchema = z
    .object({
        title: z.string().trim().min(2, {
            message: 'Event name is required.',
        }),
        priority: z.enum(['low', 'medium', 'high', 'notdefined']).optional(),
        purpose: z
            .object({
                category: z.string(),
                resourceId: z.string(),
            })
            .optional(),
        startTime: z.date().refine(
            (data) => {
                return dayjs(data).isAfter(dayjs(), 'minute');
            },
            { message: 'Please select a future date' },
        ),
        endTime: z.date(),
        recurrence: z
            .object({
                isRecurring: z.boolean(),
                frequency: z
                    .enum(['daily', 'weekly', 'monthly', 'yearly', ''])
                    .optional(),
                interval: z.number().int().positive(), // Ensures a positive integer
                daysOfWeek: z.array(z.number().int()).max(7).optional(), // 1 = Monday, 7 = Sunday
                endRecurrence: z.string().nullable().optional(),
            })
            .superRefine((data, ctx) => {
                if (data.isRecurring) {
                    if (!data.endRecurrence) {
                        ctx.addIssue({
                            path: ['endRecurrence'],
                            message:
                                'End Recurrence date is required for recurring events',
                            code: z.ZodIssueCode.custom,
                        });
                    } else if (isNaN(Date.parse(data.endRecurrence))) {
                        ctx.addIssue({
                            path: ['endRecurrence'],
                            message: 'Invalid ISO 8601 date format',
                            code: z.ZodIssueCode.custom,
                        });
                    }
                }
            })
            .optional(),
        isAllDay: z.boolean().default(false),
        reminders: z.array(
            z
                .object({
                    crowds: z.array(z.string()).optional(),
                    methods: z
                        .array(
                            z.enum([
                                'email',
                                'push',
                                'text',
                                'directMessage',
                                'crowds',
                            ]),
                        )
                        .min(1, 'Choose at least one method')
                        .max(3, "Can't add more than 3 methods"),
                    offsetMinutes: z.number(),
                })
                .refine(
                    (data) => {
                        if (data.methods.includes('crowds')) {
                            return !!data.crowds && data.crowds.length > 0;
                        }
                        return true;
                    },
                    {
                        message: 'Please select at least one chat group',
                        path: ['crowds'],
                    },
                ),
        ),
        description: z.string().optional(),
        seriesId: z.string().optional(),
    })
    .superRefine((data, ctx) => {
        if (
            data?.recurrence?.isRecurring &&
            data.recurrence.endRecurrence &&
            !data?.seriesId
        ) {
            const endDate = new Date(data.endTime);
            const endRecurrence = new Date(data.recurrence.endRecurrence);
            const oneYearLater = new Date(endDate);
            oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);

            if (endRecurrence < endDate) {
                ctx.addIssue({
                    path: ['recurrence', 'endRecurrence'],
                    message: 'End of recurrence date cannot be before end date',
                    code: z.ZodIssueCode.custom,
                });
            }

            if (endRecurrence > oneYearLater) {
                ctx.addIssue({
                    path: ['recurrence', 'endRecurrence'],
                    message:
                        'End of recurrence date cannot be more than a year from start date',
                    code: z.ZodIssueCode.custom,
                });
            }
        }
    });

export type TTodoFormType = z.infer<typeof TodoFormSchema>;
