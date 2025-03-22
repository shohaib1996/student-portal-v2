'use client';
import React, { useEffect, useState } from 'react';
import { EventPopover, useEventPopover } from './EventPopover';
import { Button } from '@/components/ui/button';
import {
    BookmarkCheck,
    ChevronLeft,
    ChevronRight,
    XCircle,
} from 'lucide-react';
import AvailabilityIcon from '@/components/svgs/calendar/Availability';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EventForm from './EventForm';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DayView } from '../DayView';
import dayjs from 'dayjs';
import { useCreateEventMutation } from '@/redux/api/calendar/calendarApi';
import { toast } from 'sonner';
import {
    EventFormSchema,
    TEventFormType,
} from '../validations/eventValidation';
import TodoForm from '../CreateTodo/TodoForm';
import { TodoFormSchema, TTodoFormType } from '../validations/todoValidation';
import { useSearchParams } from 'next/navigation';

const CreateEventModal = () => {
    const { closePopover, isFullScreen } = useEventPopover();
    const [currentDate, setCurrentDate] = useState(dayjs());
    const searchParams = useSearchParams()
    const id = searchParams.get('detail')

    const [createEvent] = useCreateEventMutation();

    const eventForm = useForm<TEventFormType>({
        resolver: zodResolver(EventFormSchema),
        defaultValues: {
            title: '',
            priority: undefined,
            attendees: [],
            startTime: new Date(),
            endTime: new Date(),
            isAllDay: false,
            // repeat: false,
            reminders: [
                {
                    chatGroups: [],
                    methods: ['push'],
                    offsetMinutes: 15,
                },
            ],
            location: {
                type: 'custom',
                link: ''
            },
            recurrence: {
                isRecurring: false,
                daysOfWeek: [],
                frequency: undefined,
                interval: 1,
                endRecurrence: ''
            },
            description: '',
            eventColor: '',
            permissions: {
                modifyEvent: false,
                inviteOthers: false,
                seeGuestList: false
            }
        },
    });

    const todoForm = useForm<TTodoFormType>({
        resolver: zodResolver(TodoFormSchema),
        defaultValues: {
            title: '',
            priority: '',
            courseLink: '',
            start: new Date(),
            end: new Date(),
            isAllDay: false,
            repeat: false,
            notifications: [
                {
                    chatGroups: [],
                    methods: ['push'],
                    timeBefore: 15,
                },
            ],
            meetingLink: '',
            agenda: '',
        },
    });

    useEffect(() => {
        console.log(eventForm.formState?.errors);
        const errors = Object.values(eventForm.formState?.errors);
        if (errors.length > 0) {
            toast.error(errors[0].message);
        }
    }, [eventForm.formState?.errors]);

    useEffect(() => {
        const startDate = eventForm.getValues('startTime');
        if (startDate) {
            const date = dayjs(startDate);
            eventForm.setValue('endTime', date.add(15, 'minute').toDate());
        }
    }, [eventForm.watch('startTime')]);

    async function onEventSubmit(values: z.infer<typeof EventFormSchema>) {
        const data = values;
        try {
            const res = await createEvent({
                ...data,
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            }).unwrap();
            if (res) {
                eventForm.reset(eventForm.formState.defaultValues)
            }
        } catch (err) {
            console.log(err);
        }
    }
    async function onTodoSubmit(values: z.infer<typeof TodoFormSchema>) {
        const data = values;
        try {
            const res = await createEvent({
                ...data,
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            }).unwrap();
            console.log(res);
        } catch (err) {
            console.log(err);
        }
    }

    const handleNext = () => {
        const date = dayjs(currentDate);
        const addOneDay = date.add(1, 'day');

        setCurrentDate(addOneDay);
    };
    const handlePrev = () => {
        const date = dayjs(currentDate);
        const removeOneDay = date.subtract(1, 'day');

        setCurrentDate(removeOneDay);
    };

    return (
        <EventPopover
            title={
                <div className='flex justify-between items-center w-full'>
                    <Button
                        onClick={eventForm.handleSubmit(onEventSubmit)}
                        icon={<BookmarkCheck size={18} />}
                    >
                        Save & Close
                    </Button>
                    <div className='flex gap-2'>
                        <Button
                            tooltip='My Availibility'
                            size={'icon'}
                            variant={'secondary'}
                            icon={<AvailabilityIcon />}
                        />
                        <Button
                            onClick={closePopover}
                            variant={'secondary'}
                            icon={<XCircle size={18} />}
                        >
                            Close
                        </Button>
                    </div>
                </div>
            }
            sidebar={
                <div className='w-[600px] h-screen border-r border-forground-border overflow-y-auto'>
                    <div className='sticky top-0 flex justify-between py-3 px-2 bg-background border-b border-forground-border z-30 items-center'>
                        <Button
                            onClick={handlePrev}
                            size={'icon'}
                            className='rounded-full'
                            variant={'secondary'}
                        >
                            <ChevronLeft size={18} />
                        </Button>
                        <h2 className='text-black text-lg font-semibold'>
                            {currentDate.format('dddd - D MMMM, YYYY')}
                        </h2>
                        <Button
                            onClick={handleNext}
                            size={'icon'}
                            className='rounded-full'
                            variant={'secondary'}
                        >
                            <ChevronRight size={18} />
                        </Button>
                    </div>
                    <DayView
                        onChange={(date) =>
                            eventForm.setValue('startTime', date.toDate())
                        }
                        currentDate={currentDate.toDate()}
                    />
                </div>
            }
        >
            <Tabs defaultValue='event'>
                <TabsList>
                    <TabsTrigger value='event'>Event</TabsTrigger>
                    <TabsTrigger value='todo'>Todo</TabsTrigger>
                </TabsList>
                <TabsContent value='event'>
                    <EventForm
                        setCurrentDate={setCurrentDate}
                        form={eventForm}
                        onSubmit={onEventSubmit}
                    />
                </TabsContent>
                <TabsContent value='todo'>
                    <TodoForm
                        setCurrentDate={setCurrentDate}
                        form={todoForm}
                        onSubmit={onTodoSubmit}
                    />
                </TabsContent>
            </Tabs>
        </EventPopover>
    );
};
export default CreateEventModal;
