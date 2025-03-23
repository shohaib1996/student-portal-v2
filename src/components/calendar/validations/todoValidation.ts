import dayjs from 'dayjs';
import { z } from 'zod';

export const TodoFormSchema = z.object({
    title: z.string().min(2, {
        message: 'Event name is required.',
    }),
    priority: z.enum(['low', 'medium', 'high']).optional(),
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
    isAllDay: z.boolean().default(false),
    reminders: z.array(
        z
            .object({
                chatGroups: z.array(z.string()).optional(),
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
                        return !!data.chatGroups && data.chatGroups.length > 0;
                    }
                    return true;
                },
                {
                    message: 'Please select at least one chat group',
                    path: ['chatGroups'],
                },
            ),
    ),
    description: z.string().optional(),
});

export type TTodoFormType = z.infer<typeof TodoFormSchema>;
