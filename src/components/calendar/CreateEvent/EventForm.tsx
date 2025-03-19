'use client';

import {
    Dispatch,
    SetStateAction,
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react';
import { z } from 'zod';
import {
    ChevronDown,
    MapPin,
    Bell,
    Users,
    LinkIcon,
    Menu,
    SearchIcon,
    Check,
    X,
    Repeat2,
    CircleCheck,
    Loader,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    useFetchUsersQuery,
    useFindUserAvailabilityQuery,
} from '@/redux/api/calendar/calendarApi';
import { TUser } from '@/types/auth';
import { TdUser } from '@/components/global/TdUser';
import GlobalDropdown from '@/components/global/GlobalDropdown';
import { DatePicker } from '@/components/global/DatePicket';
import dayjs, { Dayjs } from 'dayjs';
import { TimePicker } from '@/components/global/TimePicker';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { DayView } from '../DayView';
import { useEventPopover } from './EventPopover';

import { UseFormReturn, SubmitHandler } from 'react-hook-form';
import { ColorPicker } from '@/components/global/ColorPicker';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import timesArray from '../../../../public/times';
import { TAvailability, TNotification } from '@/types/calendar/calendarTypes';
import { MarkdownEditor } from '@/components/global/MarkdownEditor/MarkdownEditor';
import { MDXEditorMethods } from '@mdxeditor/editor';
import Image from 'next/image';

import zoomImg from '../../../../public/calendar/zoom.png';
import meetImg from '../../../../public/calendar/meet.png';
import phoneImg from '../../../../public/calendar/phone.png';
import customImg from '../../../../public/calendar/custom.png';
import AddNotification from './AddNotification';
import { TEventFormType } from '../validations/eventValidation';

type TProps = {
    form: UseFormReturn<TEventFormType>;
    onSubmit: SubmitHandler<TEventFormType>;
    setCurrentDate: Dispatch<SetStateAction<Dayjs>>;
};

const EventForm = ({ form, onSubmit, setCurrentDate }: TProps) => {
    const [openUser, setOpenUser] = useState<string>('');
    const [query, setQuery] = useState('');
    const {
        data: userAvailability,
        isLoading: availibilityLoading,
        isFetching,
    } = useFindUserAvailabilityQuery(openUser, { skip: !openUser });
    const [date, setDate] = useState<Date>(form.getValues('start'));
    const [availability, setAvailibility] = useState<
        TAvailability | undefined
    >();
    const agendaRef = useRef<MDXEditorMethods>(null);
    const handleSetAvailibility = (date: Date) => {
        const availabilityList: TAvailability[] | undefined =
            userAvailability?.schedule?.availability || [];
        const wday = dayjs(date).format('dddd').toLowerCase();

        const result = availabilityList?.find((x) => x?.wday === wday);
        setAvailibility(result);
    };

    useEffect(() => {
        handleSetAvailibility(date);
    }, [userAvailability]);

    const handleDateSelect = (date: Date | undefined) => {
        if (date) {
            setDate(date);
            handleSetAvailibility(date);
        }
    };

    const { data: userData, isLoading } = useFetchUsersQuery(query);

    const users: TUser[] = userData?.users
        ? (Array.from(
              new Map(
                  userData.users.map((user: TUser) => [user._id, user]),
              ).values(),
          ) as TUser[])
        : [];

    const { isFullScreen, setIsFullScreen } = useEventPopover();

    const findUser = useCallback(
        (id: string) => {
            const user = users?.find((u) => u._id === id);

            return user;
        },
        [users],
    );

    const titleField = (className?: string) => {
        return (
            <FormField
                control={form.control}
                name='title'
                render={({ field }) => (
                    <FormItem className={className}>
                        {isFullScreen && <FormLabel reqired>Name</FormLabel>}
                        <FormControl>
                            <Input
                                className='bg-foreground'
                                placeholder='Enter event name *'
                                {...field}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        );
    };

    const priorityField = (className?: string) => {
        return (
            <FormField
                control={form.control}
                name='priority'
                render={({ field }) => (
                    <FormItem className={className}>
                        <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                        >
                            {isFullScreen && <FormLabel>Priority</FormLabel>}
                            <FormControl>
                                <SelectTrigger className='bg-foreground col-span-2'>
                                    <SelectValue placeholder='Select priority' />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value='high'>High</SelectItem>
                                <SelectItem value='medium'>Medium</SelectItem>
                                <SelectItem value='low'>Low</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
            />
        );
    };

    const courseLink = (className?: string) => {
        return (
            <FormField
                control={form.control}
                name='courseLink'
                render={({ field }) => (
                    <FormItem className={className}>
                        {isFullScreen && <FormLabel>Purpose</FormLabel>}
                        <FormControl>
                            <div className='flex items-center border rounded-md h-10 bg-foreground border-forground-border'>
                                <LinkIcon className='ml-3 h-4 w-4 text-muted-foreground' />
                                <Input
                                    placeholder='Bootcamps/course link'
                                    {...field}
                                    className='border-0 h-8 focus-visible:ring-0 bg-foreground'
                                />
                                <ChevronDown className='mr-3 h-4 w-4 opacity-50' />
                            </div>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        );
    };

    const colorField = (className?: string) => {
        return (
            <FormField
                control={form.control}
                name='eventColor'
                render={({ field }) => (
                    <FormItem>
                        {isFullScreen && <FormLabel>Color</FormLabel>}
                        <FormControl>
                            <div>
                                <ColorPicker
                                    className='h-10 bg-foreground'
                                    value={field.value || ''}
                                    onChange={field.onChange}
                                />
                            </div>
                        </FormControl>
                    </FormItem>
                )}
            />
        );
    };

    const dateField = (className?: string) => {
        return (
            <div>
                {isFullScreen && (
                    <FormLabel reqired>Event Date & Time</FormLabel>
                )}
                <div
                    className={cn(
                        'border border-forground-border bg-foreground rounded-md p-2 mt-2',
                        className,
                    )}
                >
                    <div className='space-y-2'>
                        {/* Date Picker */}
                        <div className='flex gap-3'>
                            <div className='flex-1 space-y-1'>
                                <FormField
                                    name='start'
                                    control={form.control}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <div className='flex items-center gap-2'>
                                                    <DatePicker
                                                        className='bg-background min-h-8'
                                                        value={dayjs(
                                                            field.value,
                                                        )}
                                                        onChange={(val) => {
                                                            field.onChange(
                                                                val?.toDate(),
                                                            );
                                                            setCurrentDate(
                                                                val || dayjs(),
                                                            );
                                                        }}
                                                    />
                                                    {/* Time Picker */}
                                                    <TimePicker
                                                        className='bg-background '
                                                        value={field.value}
                                                        onChange={(val) =>
                                                            field.onChange(val)
                                                        }
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    name='end'
                                    control={form.control}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <div className='flex items-center gap-2'>
                                                    <DatePicker
                                                        className='bg-background min-h-8'
                                                        value={dayjs(
                                                            field.value,
                                                        )}
                                                        onChange={(val) =>
                                                            field.onChange(
                                                                val?.toDate(),
                                                            )
                                                        }
                                                    />
                                                    {/* Time Picker */}
                                                    <TimePicker
                                                        className='bg-background'
                                                        value={field.value}
                                                        onChange={(val) =>
                                                            field.onChange(val)
                                                        }
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                name='isAllDay'
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <div className='flex items-center space-x-2'>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={
                                                        field.onChange
                                                    }
                                                    id='airplane-mode'
                                                />
                                                <Label htmlFor='airplane-mode'>
                                                    All Day
                                                </Label>
                                            </div>
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Repeat Button */}
                        <Button
                            type='button'
                            variant='plain'
                            className='flex items-center gap-2'
                            size='sm'
                        >
                            <Repeat2 size={16} />
                            Repeat
                        </Button>
                    </div>
                </div>
            </div>
        );
    };

    const reminderField = (className?: string) => {
        return (
            <FormField
                control={form.control}
                name='notifications'
                render={({ field }) => (
                    <FormItem
                        className={cn('col-span-5', {
                            'col-span-10 order-9': isFullScreen,
                        })}
                    >
                        <div className={isFullScreen ? '' : ''}>
                            {isFullScreen && (
                                <FormLabel reqired>Add Reminders</FormLabel>
                            )}
                            {field.value?.map((noti, i) => (
                                <AddNotification
                                    setNotification={(val) =>
                                        field.onChange([val])
                                    }
                                    key={i}
                                    notificaiton={noti as TNotification}
                                />
                            ))}
                            <FormMessage />
                        </div>
                    </FormItem>
                )}
            />
        );
    };

    const locationField = (className?: string) => {
        return (
            <FormField
                control={form.control}
                name='meetingLink'
                render={({ field }) => (
                    <FormItem className={className}>
                        <div className='w-full'>
                            {isFullScreen && (
                                <FormLabel reqired>Location</FormLabel>
                            )}
                            <div className='bg-foreground space-y-2 rounded-md border border-forground-border p-3 mt-2'>
                                <div className='grid grid-cols-4 gap-2'>
                                    <div className='bg-background h-full w-full rounded-md flex flex-col items-center p-2'>
                                        <Image
                                            className='size-9 object-contain'
                                            src={zoomImg}
                                            height={60}
                                            width={60}
                                            alt='zoom'
                                        />
                                        <h5 className='text-dark-gray text-sm'>
                                            Zoom
                                        </h5>
                                    </div>
                                    <div className='bg-background h-full w-full rounded-md flex flex-col items-center p-2'>
                                        <Image
                                            className='size-9 object-contain'
                                            src={phoneImg}
                                            height={60}
                                            width={60}
                                            alt='zoom'
                                        />
                                        <h5 className='text-dark-gray text-sm'>
                                            Phone Call
                                        </h5>
                                    </div>
                                    <div className='bg-background h-full w-full rounded-md flex flex-col items-center p-2'>
                                        <Image
                                            className='size-9 object-contain'
                                            src={meetImg}
                                            height={60}
                                            width={60}
                                            alt='zoom'
                                        />
                                        <h5 className='text-dark-gray text-sm'>
                                            Google Meet
                                        </h5>
                                    </div>
                                    <div className='bg-background h-full w-full rounded-md flex flex-col items-center p-2'>
                                        <Image
                                            className='size-9 object-contain'
                                            src={customImg}
                                            height={60}
                                            width={60}
                                            alt='zoom'
                                        />
                                        <h5 className='text-dark-gray text-sm'>
                                            Custom
                                        </h5>
                                    </div>
                                </div>
                                <Input
                                    {...field}
                                    placeholder='Paste your meeting link here...'
                                />
                            </div>
                        </div>
                        <FormMessage />
                    </FormItem>
                )}
            />
        );
    };

    const agendaField = (className?: string) => {
        return (
            <div className={isFullScreen ? 'h-[60vh]' : ''}>
                {isFullScreen && (
                    <FormLabel>Meeting Agenda/Follow up/Action Item</FormLabel>
                )}
                <div className='mt-2 h-full'>
                    <MarkdownEditor
                        ref={agendaRef}
                        placeholder='Enter agenda/follow up/action item...'
                        className='bg-foreground h-full overflow-y-auto'
                        markdown={form.getValues('agenda') || ''}
                        onChange={() => {
                            const value = agendaRef.current?.getMarkdown();
                            form.setValue('agenda', value);
                        }}
                    />
                </div>
            </div>
        );
    };

    return (
        <div className='w-full flex h-full'>
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className='w-full h-full'
                >
                    {!isFullScreen ? (
                        <div className='space-y-2 w-full'>
                            <div className='grid grid-cols-[2fr_1fr] gap-2'>
                                {/* Event Name */}
                                {titleField()}
                                {priorityField()}
                            </div>

                            {/* Course Link */}
                            {courseLink()}

                            {/* Guests */}
                            <FormField
                                control={form.control}
                                name='invitations'
                                render={({ field }) => (
                                    <FormItem
                                        className={cn('col-span-5', {
                                            'order-5': isFullScreen,
                                        })}
                                    >
                                        <FormControl>
                                            <div>
                                                <GlobalDropdown
                                                    className='w-[--radix-popover-trigger-width]'
                                                    dropdownRender={
                                                        <div className='p-2'>
                                                            <Input
                                                                onChange={(e) =>
                                                                    setQuery(
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                                prefix={
                                                                    <SearchIcon
                                                                        size={
                                                                            18
                                                                        }
                                                                    />
                                                                }
                                                            />

                                                            <div className='space-y-2'>
                                                                {users?.map(
                                                                    (
                                                                        user,
                                                                        i,
                                                                    ) => {
                                                                        const selected =
                                                                            field.value.find(
                                                                                (
                                                                                    u,
                                                                                ) =>
                                                                                    u ===
                                                                                    user._id,
                                                                            );
                                                                        return (
                                                                            <div
                                                                                onClick={() => {
                                                                                    if (
                                                                                        selected
                                                                                    ) {
                                                                                        field.onChange(
                                                                                            field.value?.filter(
                                                                                                (
                                                                                                    u,
                                                                                                ) =>
                                                                                                    u !==
                                                                                                    user._id,
                                                                                            ),
                                                                                        );
                                                                                    } else {
                                                                                        field.onChange(
                                                                                            [
                                                                                                ...field.value,
                                                                                                user._id,
                                                                                            ],
                                                                                        );
                                                                                    }
                                                                                }}
                                                                                className={cn(
                                                                                    'relative flex justify-between items-center px-2 py-1 cursor-pointer bg-foreground rounded-md',
                                                                                    {
                                                                                        'bg-primary-light':
                                                                                            selected,
                                                                                    },
                                                                                )}
                                                                                key={
                                                                                    user._id
                                                                                }
                                                                            >
                                                                                <TdUser
                                                                                    user={
                                                                                        user
                                                                                    }
                                                                                />
                                                                                {selected && (
                                                                                    <Check
                                                                                        size={
                                                                                            16
                                                                                        }
                                                                                    />
                                                                                )}
                                                                            </div>
                                                                        );
                                                                    },
                                                                )}
                                                            </div>
                                                        </div>
                                                    }
                                                >
                                                    <div className='cursor-pointer'>
                                                        <div className='w-full border border-forground-border h-10 rounded-md bg-foreground flex px-3 items-center text-dark-gray gap-2'>
                                                            <Users size={18} />
                                                            Add Guests{' '}
                                                            <span className='text-danger'>
                                                                *
                                                            </span>
                                                        </div>
                                                    </div>
                                                </GlobalDropdown>

                                                {field.value?.length > 0 && (
                                                    <div className='space-y-2 max-h-40 bg-foreground p-2 overflow-y-auto'>
                                                        {field.value?.map(
                                                            (user, i) => (
                                                                <div
                                                                    className='relative bg-background px-2 py-1 flex items-center justify-between rounded-md'
                                                                    key={user}
                                                                >
                                                                    <TdUser
                                                                        user={
                                                                            findUser(
                                                                                user,
                                                                            ) as TUser
                                                                        }
                                                                    />
                                                                    <X
                                                                        onClick={() =>
                                                                            field.onChange(
                                                                                field.value?.filter(
                                                                                    (
                                                                                        u,
                                                                                    ) =>
                                                                                        u !==
                                                                                        user,
                                                                                ),
                                                                            )
                                                                        }
                                                                        className='text-danger cursor-pointer'
                                                                        size={
                                                                            18
                                                                        }
                                                                    />
                                                                </div>
                                                            ),
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Date and Time */}
                            {dateField()}

                            {/* Reminder */}
                            {reminderField()}

                            {/* Location */}

                            {locationField()}
                            {/* Agenda */}
                            {agendaField()}

                            {!isFullScreen && (
                                <button
                                    type='button'
                                    onClick={() => setIsFullScreen(true)}
                                    className='w-full text-end font-semibold pb-2 text-sm text-primary'
                                >
                                    More Options
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className='space-y-2 h-full w-full pb-2'>
                            <div className='grid grid-cols-10 gap-2 items-start'>
                                {titleField('col-span-5')}
                                {courseLink('col-span-2')}
                                {priorityField('col-span-2')}
                                {colorField('col-span-1')}
                            </div>
                            <div className='grid grid-cols-2 gap-2'>
                                {dateField('')}
                                {locationField()}
                            </div>
                            <div className='grid grid-cols-[2fr_1fr] gap-2'>
                                {agendaField()}
                                <div className='h-full'>
                                    {isFullScreen && (
                                        <FormLabel reqired>
                                            Invitations/Add Guests
                                        </FormLabel>
                                    )}
                                    <FormField
                                        control={form.control}
                                        name='invitations'
                                        render={({ field }) => (
                                            <FormItem className='bg-foreground h-[60vh] overflow-y-auto rounded-md border border-forground-border mt-2'>
                                                <FormControl>
                                                    <div>
                                                        <FormMessage className='pt-2 text-center' />
                                                        {field.value?.length >
                                                            0 && (
                                                            <div className='space-y-2 bg-foreground p-2'>
                                                                {field.value?.map(
                                                                    (
                                                                        user,
                                                                        i,
                                                                    ) => (
                                                                        <div
                                                                            className='relative bg-background px-2 py-1 flex items-center justify-between rounded-md'
                                                                            key={
                                                                                user
                                                                            }
                                                                        >
                                                                            <TdUser
                                                                                user={
                                                                                    findUser(
                                                                                        user,
                                                                                    ) as TUser
                                                                                }
                                                                            />
                                                                            <X
                                                                                onClick={() =>
                                                                                    field.onChange(
                                                                                        field.value?.filter(
                                                                                            (
                                                                                                u,
                                                                                            ) =>
                                                                                                u !==
                                                                                                user,
                                                                                        ),
                                                                                    )
                                                                                }
                                                                                className='text-danger cursor-pointer'
                                                                                size={
                                                                                    18
                                                                                }
                                                                            />
                                                                        </div>
                                                                    ),
                                                                )}
                                                            </div>
                                                        )}

                                                        <div className='p-2 overflow-y-auto'>
                                                            <Input
                                                                onChange={(e) =>
                                                                    setQuery(
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                                prefix={
                                                                    <SearchIcon
                                                                        size={
                                                                            18
                                                                        }
                                                                    />
                                                                }
                                                            />

                                                            <div className='space-y-2 pt-2 overflow-y-auto'>
                                                                {users?.map(
                                                                    (
                                                                        user,
                                                                        i,
                                                                    ) => {
                                                                        const selected =
                                                                            field.value.find(
                                                                                (
                                                                                    u,
                                                                                ) =>
                                                                                    u ===
                                                                                    user._id,
                                                                            );
                                                                        return (
                                                                            <Popover
                                                                                open={
                                                                                    openUser ===
                                                                                    user._id
                                                                                }
                                                                                onOpenChange={() =>
                                                                                    setOpenUser(
                                                                                        '',
                                                                                    )
                                                                                }
                                                                                key={
                                                                                    user._id
                                                                                }
                                                                            >
                                                                                <PopoverTrigger className='w-full block'>
                                                                                    <div
                                                                                        onClick={() => {
                                                                                            if (
                                                                                                selected
                                                                                            ) {
                                                                                                field.onChange(
                                                                                                    field.value?.filter(
                                                                                                        (
                                                                                                            u,
                                                                                                        ) =>
                                                                                                            u !==
                                                                                                            user._id,
                                                                                                    ),
                                                                                                );
                                                                                            } else {
                                                                                                field.onChange(
                                                                                                    [
                                                                                                        ...field.value,
                                                                                                        user._id,
                                                                                                    ],
                                                                                                );
                                                                                            }
                                                                                        }}
                                                                                        className={cn(
                                                                                            'relative flex justify-between items-center px-2 py-1 cursor-pointer bg-background rounded-md',
                                                                                            {
                                                                                                'bg-primary-light':
                                                                                                    selected,
                                                                                            },
                                                                                        )}
                                                                                    >
                                                                                        <TdUser
                                                                                            user={
                                                                                                user
                                                                                            }
                                                                                        />
                                                                                        <div className='flex items-center gap-3'>
                                                                                            <Button
                                                                                                type='button'
                                                                                                onClick={(
                                                                                                    e,
                                                                                                ) => {
                                                                                                    e.stopPropagation();
                                                                                                    setOpenUser(
                                                                                                        user?._id,
                                                                                                    );
                                                                                                }}
                                                                                                variant={
                                                                                                    'primary_light'
                                                                                                }
                                                                                                size={
                                                                                                    'sm'
                                                                                                }
                                                                                                className='h-7'
                                                                                                icon={
                                                                                                    <CircleCheck
                                                                                                        size={
                                                                                                            16
                                                                                                        }
                                                                                                    />
                                                                                                }
                                                                                            >
                                                                                                Availability
                                                                                            </Button>
                                                                                        </div>
                                                                                    </div>
                                                                                </PopoverTrigger>
                                                                                <PopoverContent className='z-[9999] w-[var(--radix-popover-trigger-width)]'>
                                                                                    <div className='flex gap-2'>
                                                                                        <Calendar
                                                                                            className='p-0'
                                                                                            mode='single'
                                                                                            selected={
                                                                                                date
                                                                                            }
                                                                                            onSelect={
                                                                                                handleDateSelect
                                                                                            }
                                                                                        />
                                                                                        {availibilityLoading ||
                                                                                        isFetching ? (
                                                                                            <div className='w-full h-[260px] flex items-center justify-center'>
                                                                                                <Loader
                                                                                                    size={
                                                                                                        18
                                                                                                    }
                                                                                                    className='animate-spin'
                                                                                                />
                                                                                            </div>
                                                                                        ) : (
                                                                                            <>
                                                                                                {availability &&
                                                                                                availability
                                                                                                    ?.intervals
                                                                                                    ?.length >
                                                                                                    0 ? (
                                                                                                    <div className='border-l border-forground-border w-full'>
                                                                                                        <h2 className='font-semibold pb-1 text-black text-base text-center'>
                                                                                                            {dayjs(
                                                                                                                date,
                                                                                                            ).format(
                                                                                                                'dddd',
                                                                                                            )}
                                                                                                        </h2>
                                                                                                        <div className='flex flex-col gap-2 ps-2 overflow-y-auto w-full max-h-[270px]'>
                                                                                                            {availability?.intervals?.map(
                                                                                                                (
                                                                                                                    interval,
                                                                                                                    i,
                                                                                                                ) => (
                                                                                                                    <div
                                                                                                                        key={
                                                                                                                            i
                                                                                                                        }
                                                                                                                        className='flex bg-foreground text-sm rounded-md border border-forground-border w-full px-2 py-1 '
                                                                                                                    >
                                                                                                                        <span>
                                                                                                                            {timesArray?.find(
                                                                                                                                (
                                                                                                                                    x,
                                                                                                                                ) =>
                                                                                                                                    x.value ===
                                                                                                                                    interval?.from,
                                                                                                                            )
                                                                                                                                ?.label ||
                                                                                                                                interval?.from}
                                                                                                                        </span>
                                                                                                                        <span>
                                                                                                                            -
                                                                                                                        </span>
                                                                                                                        <span>
                                                                                                                            {timesArray?.find(
                                                                                                                                (
                                                                                                                                    x,
                                                                                                                                ) =>
                                                                                                                                    x.value ===
                                                                                                                                    interval?.to,
                                                                                                                            )
                                                                                                                                ?.label ||
                                                                                                                                interval?.to}
                                                                                                                        </span>
                                                                                                                    </div>
                                                                                                                ),
                                                                                                            )}
                                                                                                        </div>
                                                                                                    </div>
                                                                                                ) : (
                                                                                                    <div className='h-[260px] w-full flex items-center'>
                                                                                                        No
                                                                                                        available
                                                                                                        time
                                                                                                        found
                                                                                                    </div>
                                                                                                )}
                                                                                            </>
                                                                                        )}
                                                                                    </div>
                                                                                </PopoverContent>
                                                                            </Popover>
                                                                        );
                                                                    },
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                            {reminderField()}
                        </div>
                    )}
                </form>
            </Form>
        </div>
    );
};

export default EventForm;
