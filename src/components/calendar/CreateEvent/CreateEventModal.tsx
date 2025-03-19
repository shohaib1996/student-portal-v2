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
import TodoForm from './TodoForm';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DayView } from '../DayView';
import dayjs from 'dayjs';

export const EventFormSchema = z.object({
    title: z.string().min(2, {
        message: 'Event name must be at least 2 characters.',
    }),
    priority: z.string().optional(),
    courseLink: z.string().optional(),
    invitations: z.array(
        z.string().min(1, {
            message: 'Please add at least one guest.',
        }),
    ),
    start: z.date(),
    end: z.date(),
    isAllDay: z.boolean().default(false),
    repeat_on: z.array(z.string()),
    repeat: z.boolean().default(false),
    reminder: z.string().default('15 minutes before'),
    location: z.string().optional(),
    agenda: z.string().optional(),
    eventColor: z.string().optional(),
});

const CreateEventModal = () => {
    const { closePopover, isFullScreen } = useEventPopover();
    const [currentDate, setCurrentDate] = useState(dayjs());

    const eventForm = useForm<z.infer<typeof EventFormSchema>>({
        resolver: zodResolver(EventFormSchema),
        defaultValues: {
            title: '',
            priority: '',
            courseLink: '',
            invitations: [],
            start: new Date(),
            end: new Date(),
            isAllDay: false,
            repeat: false,
            reminder: '15 minutes before',
            location: '',
            agenda: '',
            eventColor: '',
        },
    });

    useEffect(() => {
        const startDate = eventForm.getValues('start');
        if (startDate) {
            const date = dayjs(startDate);
            eventForm.setValue('end', date.add(15, 'minute').toDate());
        }
    }, [eventForm.watch('start')]);

    function onEventSubmit(values: z.infer<typeof EventFormSchema>) {
        console.log(values);
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
                    <Button icon={<BookmarkCheck size={18} />}>
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
                            eventForm.setValue('start', date.toDate())
                        }
                        currentDate={currentDate.toDate()}
                    />
                </div>
            }
        >
            {/* <Tabs defaultValue='event'>
                <TabsList>
                    <TabsTrigger value='event'>Events</TabsTrigger>
                    <TabsTrigger value='todo'>Events</TabsTrigger>
                </TabsList>
                <TabsContent value='event'>
                    <EventForm
                        setCurrentDate={setCurrentDate}
                        form={eventForm}
                        onSubmit={onEventSubmit}
                    />
                </TabsContent>
                <TabsContent value='todo'>
                    <TodoForm />
                </TabsContent>
            </Tabs> */}
            <EventForm
                setCurrentDate={setCurrentDate}
                form={eventForm}
                onSubmit={onEventSubmit}
            />
        </EventPopover>
    );
};
export default CreateEventModal;
