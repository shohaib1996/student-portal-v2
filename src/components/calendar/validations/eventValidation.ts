import dayjs from 'dayjs';
import { z } from 'zod';

export const EventFormSchema = z.object({
    title: z.string().min(2, {
        message: 'Event name is required.',
    }),
    priority: z.enum(['low', 'medium', 'high']).optional(),
    purpose: z.object({
        category: z.string(),
        resourceId: z.string()
    }).optional(),
    attendees: z
        .array(
            z.string().min(1, {
                message: 'Please add at least one guest.',
            }),
        )
        .min(1, 'Please add at least one guest.'),
    startTime: z.date().refine(
        (data) => {
            return dayjs(data).isAfter(dayjs(), 'minute');
        },
        { message: 'Please select a future date' },
    ),
    endTime: z.date(),
    isAllDay: z.boolean().default(false),
    recurrence: z.object({
        isRecurring: z.boolean(),
        frequency: z.enum(["daily", "weekly", "monthly", "yearly"]),
        interval: z.number().int().positive(), // Ensures a positive integer
        daysOfWeek: z.array(z.number().int().min(1).max(7)).optional(), // 1 = Monday, 7 = Sunday
        endRecurrence: z.string().refine(
            (val) => !isNaN(Date.parse(val)),
            { message: "Invalid ISO 8601 date format" }
        ),
    }).optional(),
    reminders: z.array(
        z
            .object({
                chatGroups: z.array(z.string()).optional(),
                methods: z.array(z.enum(['email', 'push', 'text', 'directMessage', 'crowds'])).min(1, 'Choose at least one method').max(3, "Can't add more than 3 methods"),
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
    location: z.object({
        type: z.enum(["meet", "zoom", "call", "custom"]),
        link: z.string()
    }),
    description: z.string().optional(),
    eventColor: z.string().optional(),
    permissions: z.object({
        modifyEvent: z.boolean().default(false),  // Default: false
        inviteOthers: z.boolean().default(false), // Default: false
        seeGuestList: z.boolean().default(true),  // Default: true
    })
});

export type TEventFormType = z.infer<typeof EventFormSchema>;
