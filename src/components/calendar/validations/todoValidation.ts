import dayjs from 'dayjs';
import { z } from 'zod';

export const TodoFormSchema = z.object({
    title: z.string().min(2, {
        message: 'Event name is required.',
    }),
    priority: z.string().optional(),
    courseLink: z.string().optional(),
    invitations: z
        .array(
            z.string().min(1, {
                message: 'Please add at least one guest.',
            }),
        )
        .min(1, 'Please add at least one guest.'),
    start: z.date().refine(
        (data) => {
            return dayjs(data).isAfter(dayjs(), 'minute');
        },
        { message: 'Please select a future date' },
    ),
    end: z.date(),
    isAllDay: z.boolean().default(false),
    repeat_on: z.array(z.string()).optional(),
    repeat: z.boolean().default(false).optional(),
    notifications: z.array(
        z
            .object({
                chatGroups: z.array(z.string()).optional(),
                methods: z
                    .array(z.string())
                    .min(1, 'Choose at least one method')
                    .max(3, "Can't add more than 3 methods"),
                timeBefore: z.number(),
            })
            .refine(
                (data) => {
                    if (data.methods.includes('groups')) {
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
    meetingLink: z.string().optional(),
    agenda: z.string().optional(),
    eventColor: z.string().optional(),
});

export type TTodoFormType = z.infer<typeof TodoFormSchema>;
