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
import {
    useCreateEventMutation,
    useGetSingleEventQuery,
    useUpdateEventMutation,
} from '@/redux/api/calendar/calendarApi';
import { toast } from 'sonner';
import {
    EventFormSchema,
    TEventFormType,
} from '../validations/eventValidation';
import TodoForm from '../CreateTodo/TodoForm';
import { TodoFormSchema, TTodoFormType } from '../validations/todoValidation';
import { TEvent } from '@/types/calendar/calendarTypes';
import { TUser } from '@/types/auth';
import { Checkbox } from '@/components/ui/checkbox';
import GlobalModal from '@/components/global/GlobalModal';
import { useAppSelector } from '@/redux/hooks';

export const updateOptionsOptions: {
    label: string;
    value: 'thisEvent' | 'thisAndFollowing' | 'allEvents';
}[] = [
    {
        label: 'This event',
        value: 'thisEvent',
    },
    {
        label: 'This Event and Following Events',
        value: 'thisAndFollowing',
    },
    {
        label: 'All events',
        value: 'allEvents',
    },
];

const CreateEventModal = () => {
    const { closePopover, isFullScreen, updateId } = useEventPopover();
    const { currentDate: clickedDate } = useAppSelector((s) => s.calendar);
    const [currentDate, setCurrentDate] = useState(
        clickedDate ? dayjs(clickedDate) : dayjs(),
    );
    const [tab, setTab] = useState('event');
    const [createEvent, { isLoading: isCreatingEvent }] =
        useCreateEventMutation();
    const [updateEvent, { isLoading: isUpdating }] = useUpdateEventMutation();
    const [updateOption, setUpdateOption] = useState<
        'thisEvent' | 'thisAndFollowing' | 'allEvents'
    >('thisEvent');

    const { data: eventDetails } = useGetSingleEventQuery(updateId as string, {
        skip: !updateId,
    });

    const handleClose = () => {
        closePopover();
        eventForm.reset(eventDefaultValues);
        todoForm.reset(todoDefalultValues);
        setUpdateOpen(false);
    };

    useEffect(() => {
        const event: TEvent | undefined = eventDetails?.event;
        if (!event || !updateId) {
            return;
        }
        if (event.type === 'event') {
            setTab('event');
            eventForm.reset({
                title: event.title,
                priority: event.priority || undefined,
                attendees: event.attendees?.map((at) => at.user),
                startTime: new Date(event.startTime),
                endTime: new Date(event.endTime),
                isAllDay: event.isAllDay,
                // repeat: false,
                reminders: event.reminders,
                location: event.location,
                recurrence: event.recurrence,
                description: event.description,
                eventColor: event.eventColor,
                permissions: event.permissions,
            });
        } else if (event.type === 'task') {
            setTab('todo');
            todoForm.reset({
                title: event.title,
                priority: event.priority || undefined,
                startTime: new Date(event.startTime),
                endTime: new Date(event.endTime),
                isAllDay: event.isAllDay,
                // repeat: false,
                reminders: event.reminders,
                recurrence: event.recurrence,
                description: event.description,
            });
        }
    }, [eventDetails, updateId]);

    const eventDefaultValues: TEventFormType = {
        title: '',
        priority: undefined,
        attendees: [],
        startTime: clickedDate ? new Date(clickedDate) : new Date(),
        endTime: clickedDate ? new Date(clickedDate) : new Date(),
        isAllDay: false,
        reminders: [
            {
                chatGroups: [],
                methods: ['push'],
                offsetMinutes: 15,
            },
        ],
        location: {
            type: 'custom',
            link: '',
        },
        recurrence: {
            isRecurring: false,
            daysOfWeek: [],
            frequency: undefined,
            interval: 1,
            endRecurrence: '',
        },
        description: '',
        eventColor: '',
        permissions: {
            modifyEvent: false,
            inviteOthers: false,
            seeGuestList: false,
        },
    };

    const eventForm = useForm<TEventFormType>({
        resolver: zodResolver(EventFormSchema),
        defaultValues: eventDefaultValues,
    });

    const todoDefalultValues: TTodoFormType = {
        title: '',
        priority: undefined,
        startTime: clickedDate ? new Date(clickedDate) : new Date(),
        endTime: clickedDate ? new Date(clickedDate) : new Date(),
        isAllDay: false,
        reminders: [
            {
                chatGroups: [],
                methods: ['push'],
                offsetMinutes: 15,
            },
        ],
        description: '',
    };

    const todoForm = useForm<TTodoFormType>({
        resolver: zodResolver(TodoFormSchema),
        defaultValues: todoDefalultValues,
    });

    useEffect(() => {
        if (clickedDate) {
            eventForm.setValue('startTime', new Date(clickedDate));
            todoForm.setValue(
                'startTime',
                dayjs(clickedDate).add(15, 'minutes').toDate(),
            );
            setCurrentDate(dayjs(clickedDate));
            eventForm.setValue('endTime', new Date(clickedDate));
            todoForm.setValue(
                'endTime',
                dayjs(clickedDate).add(15, 'minutes').toDate(),
            );
        }
    }, [clickedDate]);

    useEffect(() => {
        const errors = Object.values(eventForm.formState?.errors);
        console.log(errors);
        if (errors.length > 0) {
            if (eventForm.formState.errors.recurrence?.endRecurrence) {
                toast.error(
                    eventForm.formState.errors.recurrence?.endRecurrence
                        .message,
                );
            } else {
                toast.error(errors[0].message);
            }
        }
    }, [eventForm.formState?.errors]);

    const getAttendeeChanges = (
        prevAttendees: TUser[],
        newAttendees: TUser[],
    ): { removed: string[]; added: string[] } => {
        // Convert arrays to sets for easy comparison
        const prevSet = new Set(prevAttendees.map((a) => a._id));
        const newSet = new Set(newAttendees.map((a) => a._id));

        // Find removed attendees
        const removed = prevAttendees
            .filter((a) => !newSet.has(a._id))
            .map((u) => u._id);

        // Find added attendees
        const added = newAttendees
            .filter((a) => !prevSet.has(a._id))
            .map((u) => u._id);

        return { removed, added };
    };

    async function onEventSubmit(values: z.infer<typeof EventFormSchema>) {
        const data = values;
        try {
            if (updateId) {
                const event = eventDetails?.event as TEvent;
                const prevAttendee =
                    event?.attendees && event.attendees?.length > 0
                        ? event.attendees?.map((at) => at.user as TUser)
                        : [];
                const { removed, added } = getAttendeeChanges(
                    prevAttendee,
                    values.attendees,
                );

                const changes: any = {
                    ...data,
                };

                if (removed && removed.length > 0) {
                    changes['attendeesToRemove'] = removed;
                }
                if (added && added.length > 0) {
                    changes['attendeesToAdd'] = removed;
                }

                const res = await updateEvent({
                    id: updateId,
                    changes,
                    updateOption,
                }).unwrap();
                if (res) {
                    eventForm.reset(eventForm.formState.defaultValues);
                    toast.success('Successfully updated event');
                    handleClose();
                }
            } else {
                const res = await createEvent({
                    ...data,
                    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                }).unwrap();
                if (res) {
                    eventForm.reset(eventForm.formState.defaultValues);
                    toast.success('Successfully added a new event');
                    handleClose();
                }
            }
        } catch (err) {
            console.log(err);
        }
    }
    async function onTodoSubmit(values: z.infer<typeof TodoFormSchema>) {
        const data = values;
        try {
            if (updateId) {
                const res = await updateEvent({
                    id: updateId,
                    updateOption,
                    changes: {
                        ...data,
                    },
                }).unwrap();
                if (res) {
                    todoForm.reset(todoForm.formState.defaultValues);
                    toast.success('Successfully added a new event');
                    handleClose();
                }
            } else {
                const res = await createEvent({
                    ...data,
                    type: 'task',
                    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                }).unwrap();
                if (res) {
                    todoForm.reset(todoForm.formState.defaultValues);
                    toast.success('Successfully added a new event');
                    handleClose();
                }
            }
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

    const [updateOpen, setUpdateOpen] = useState(false);

    const event = eventDetails?.event as TEvent;

    const submitButton = () => {
        return (
            <Button
                onClick={() => {
                    if (
                        updateId &&
                        (event?.seriesId || event.recurrence?.isRecurring)
                    ) {
                        setUpdateOpen(true);
                    } else {
                        if (tab === 'event') {
                            eventForm.handleSubmit(onEventSubmit)();
                        } else {
                            todoForm.handleSubmit(onTodoSubmit)();
                        }
                    }
                }}
                icon={<BookmarkCheck size={18} />}
                isLoading={isCreatingEvent || isUpdating}
            >
                Save & Close
            </Button>
        );
    };

    return (
        <div>
            <EventPopover
                title={
                    <div className='flex justify-between items-center w-full'>
                        {isFullScreen && (
                            <div>
                                <h2 className='text-xl text-black font-semibold'>
                                    {updateId !== null ? 'Update' : 'Add New'}{' '}
                                    {tab === 'todo' ? 'To-Do' : 'Event'}{' '}
                                </h2>
                                <p className='text-sm'>
                                    Fill out the form to{' '}
                                    {updateId !== null
                                        ? 'update'
                                        : 'create new'}{' '}
                                    {tab === 'todo' ? 'to-do' : 'event'}
                                </p>
                            </div>
                        )}
                        {!isFullScreen && submitButton()}
                        <div className='flex gap-2'>
                            <Button
                                tooltip='My Availibility'
                                size={'icon'}
                                variant={'secondary'}
                                icon={<AvailabilityIcon />}
                            />
                            <Button
                                onClick={handleClose}
                                variant={'secondary'}
                                icon={<XCircle size={18} />}
                            >
                                Close
                            </Button>
                            {isFullScreen && submitButton()}
                        </div>
                    </div>
                }
                sidebar={
                    <div className='w-[600px] hidden lg:block h-screen border-r border-forground-border overflow-y-auto'>
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
                            onModal
                            onChange={(date) => {
                                if (tab === 'event') {
                                    eventForm.setValue(
                                        'startTime',
                                        date.toDate(),
                                    );
                                    eventForm.setValue(
                                        'endTime',
                                        date.add(15, 'minutes').toDate(),
                                    );
                                } else {
                                    todoForm.setValue(
                                        'startTime',
                                        date.toDate(),
                                    );
                                    todoForm.setValue(
                                        'endTime',
                                        date.add(15, 'minutes').toDate(),
                                    );
                                }
                            }}
                            currentDate={currentDate.toDate()}
                        />
                    </div>
                }
            >
                <Tabs value={tab}>
                    <TabsList>
                        <TabsTrigger
                            disabled={updateId !== null}
                            onClick={() => setTab('event')}
                            value='event'
                        >
                            Event
                        </TabsTrigger>
                        <TabsTrigger
                            disabled={updateId !== null}
                            onClick={() => setTab('todo')}
                            value='todo'
                        >
                            Todo
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value='event'>
                        <EventForm
                            event={eventDetails?.event as TEvent}
                            edit={updateId !== null && eventDetails?.event}
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

            <GlobalModal
                open={updateOpen}
                setOpen={setUpdateOpen}
                className='w-[550px] md:w-[550px] lg:w-[550px]'
                allowFullScreen={false}
                buttons={
                    <div className='flex gap-2 items-center'>
                        <Button
                            onClick={() => setUpdateOpen(false)}
                            variant={'primary_light'}
                            icon={<XCircle size={18} />}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={
                                tab === 'event'
                                    ? eventForm.handleSubmit(onEventSubmit)
                                    : todoForm.handleSubmit(onTodoSubmit)
                            }
                            icon={<BookmarkCheck size={18} />}
                            isLoading={isCreatingEvent || isUpdating}
                        >
                            Save & Close
                        </Button>
                    </div>
                }
                subTitle='Select events to update from the series.'
                title='Update recurring event'
            >
                <div className='flex flex-col gap-2 py-2'>
                    {updateOptionsOptions.map((item) => (
                        <Button
                            onClick={() => setUpdateOption(item.value)}
                            key={item.value}
                            className='text-start bg-background flex justify-start gap-2'
                            variant={'secondary'}
                        >
                            <Checkbox
                                className='rounded-full'
                                checked={item.value === updateOption}
                            />{' '}
                            {item.label}
                        </Button>
                    ))}
                </div>
            </GlobalModal>
        </div>
    );
};
export default CreateEventModal;
