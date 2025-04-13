'use client';

import {
    Dispatch,
    SetStateAction,
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react';
import {
    ChevronDown,
    Users,
    LinkIcon,
    SearchIcon,
    Check,
    X,
    Repeat2,
    CircleCheck,
    Loader,
    RepeatIcon,
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
import {
    TAvailability,
    TEvent,
    TNotification,
} from '@/types/calendar/calendarTypes';
import { MarkdownEditor } from '@/components/global/MarkdownEditor/MarkdownEditor';
import { MDXEditorMethods } from '@mdxeditor/editor';
import Image from 'next/image';

const zoomImg = '/calendar/zoom.png';
const meetImg = '/calendar/meet.png';
const phoneImg = '/calendar/phone.png';
const customImg = '/calendar/custom.png';
import AddNotification from './AddNotification';
import { TEventFormType } from '../validations/eventValidation';
import MultiSelect from '@/components/global/MultiSelect';
import { useAppSelector } from '@/redux/hooks';
import { toast } from 'sonner';
import SelectPurpose from './SelectPurpose';
import GlobalEditor from '@/components/editor/GlobalEditor';

type TProps = {
    form: UseFormReturn<TEventFormType>;
    onSubmit: SubmitHandler<TEventFormType>;
    setCurrentDate: Dispatch<SetStateAction<Dayjs>>;
    edit: boolean;
    event?: TEvent;
};

export const renderRecurrence = (
    val?: 'weekly' | 'daily' | 'monthly' | 'yearly' | '',
) => {
    switch (val) {
        case 'weekly':
            return 'Week';
        case 'daily':
            return 'Day';
        case 'monthly':
            return 'Month';
        case 'yearly':
            return 'Year';
    }
};

const EventForm = ({ form, onSubmit, setCurrentDate, edit, event }: TProps) => {
    const [openUser, setOpenUser] = useState<string>('');
    const [query, setQuery] = useState('');
    const {
        data: userAvailability,
        isLoading: availibilityLoading,
        isFetching,
    } = useFindUserAvailabilityQuery(openUser, { skip: !openUser });
    const [date, setDate] = useState<Date>(form.getValues('startTime'));
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
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>(
        [],
    );
    const { user } = useAppSelector((s) => s.auth);

    const isMyEvent = event?.organizer?._id === user?._id;

    useEffect(() => {
        if (userAvailability) {
            handleSetAvailibility(date);
        }
    }, [userAvailability]);

    const handleDateSelect = (date: Date | undefined) => {
        if (date) {
            setDate(date);
            handleSetAvailibility(date);
        }
    };

    const days = [
        { value: 0, label: 'Sun' },
        { value: 1, label: 'Mon' },
        { value: 2, label: 'Tue' },
        { value: 3, label: 'Wed' },
        { value: 4, label: 'Thu' },
        { value: 5, label: 'Fri' },
        { value: 6, label: 'Sat' },
    ];

    const { data: userData, isLoading } = useFetchUsersQuery(query);

    const users: TUser[] = userData?.users
        ? (Array.from(
              new Map(
                  userData.users.map((user: TUser) => [user._id, user]),
              ).values(),
          ) as TUser[])
        : [];

    const { isFullScreen, setIsFullScreen } = useEventPopover();

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
                name='purpose'
                render={({ field }) => (
                    <FormItem className={className}>
                        {isFullScreen && <FormLabel>Purpose</FormLabel>}
                        <FormControl>
                            <SelectPurpose
                                value={
                                    field.value || {
                                        category: '',
                                        resourceId: '',
                                    }
                                }
                                onChange={(val) => field.onChange(val)}
                            />
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
                    <FormItem className={className}>
                        {isFullScreen && <FormLabel>Color</FormLabel>}
                        <FormControl>
                            <div>
                                <ColorPicker
                                    className='h-10 bg-foreground border border-forground-bordere'
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
                        'border border-forground-border bg-foreground rounded-md p-2 mt-2 min-h-[calc(100%-20px)]',
                        className,
                    )}
                >
                    <div
                        className={cn('w-full space-y-3', {
                            'h-[calc(100%-19px)]': isFullScreen,
                        })}
                    >
                        {/* Date Picker */}
                        <div className='flex gap-3'>
                            <div className='flex-1 space-y-1'>
                                <FormField
                                    name='startTime'
                                    control={form.control}
                                    render={({ field, formState }) => (
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
                                                            form.setValue(
                                                                'endTime',
                                                                dayjs(val)
                                                                    .add(
                                                                        15,
                                                                        'minute',
                                                                    )
                                                                    .toDate(),
                                                            );
                                                            setCurrentDate(
                                                                val || dayjs(),
                                                            );
                                                        }}
                                                    />
                                                    {/* Time Picker */}
                                                    {form.watch('isAllDay') ===
                                                        false && (
                                                        <TimePicker
                                                            className='bg-background '
                                                            value={field.value}
                                                            onChange={(val) => {
                                                                field.onChange(
                                                                    val,
                                                                );
                                                                form.setValue(
                                                                    'endTime',
                                                                    dayjs(val)
                                                                        .add(
                                                                            15,
                                                                            'minute',
                                                                        )
                                                                        .toDate(),
                                                                );
                                                            }}
                                                        />
                                                    )}
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    name='endTime'
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
                                                    {!form.getValues(
                                                        'isAllDay',
                                                    ) && (
                                                        <TimePicker
                                                            className='bg-background'
                                                            value={field.value}
                                                            onChange={(val) =>
                                                                field.onChange(
                                                                    val,
                                                                )
                                                            }
                                                        />
                                                    )}
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
                                                    onCheckedChange={(val) =>
                                                        field.onChange(val)
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
                        <FormField
                            control={form.control}
                            name='recurrence'
                            render={({ field, formState }) => (
                                <FormItem>
                                    <FormControl>
                                        <div>
                                            <Select
                                                allowDeselect
                                                value={
                                                    field.value?.isRecurring
                                                        ? field.value?.frequency
                                                        : ''
                                                }
                                                onValueChange={(val) =>
                                                    field.onChange({
                                                        frequency: val,
                                                        isRecurring: true,
                                                        interval: 1,
                                                        endRecurrence:
                                                            field.value
                                                                ?.endRecurrence,
                                                    })
                                                }
                                            >
                                                <SelectTrigger className='w-fit gap-2 bg-background h-8 flex'>
                                                    <RepeatIcon size={16} />
                                                    <SelectValue placeholder='Repeat'></SelectValue>
                                                    <X />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value='daily'>
                                                        Daily
                                                    </SelectItem>
                                                    <SelectItem value='weekly'>
                                                        Weekly
                                                    </SelectItem>
                                                    <SelectItem value='monthly'>
                                                        Monthly
                                                    </SelectItem>
                                                    <SelectItem value='yearly'>
                                                        Yearly
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>

                                            {field.value?.isRecurring &&
                                                field.value?.frequency ===
                                                    'weekly' && (
                                                    <div className='flex gap-1 pt-2'>
                                                        {days.map((day) => (
                                                            <p
                                                                key={day.label}
                                                                onClick={() =>
                                                                    field.onChange(
                                                                        {
                                                                            ...field.value,
                                                                            daysOfWeek:
                                                                                field.value?.daysOfWeek?.includes(
                                                                                    day.value,
                                                                                )
                                                                                    ? field.value?.daysOfWeek.filter(
                                                                                          (
                                                                                              v,
                                                                                          ) =>
                                                                                              v !==
                                                                                              day.value,
                                                                                      )
                                                                                    : [
                                                                                          ...(field
                                                                                              .value
                                                                                              ?.daysOfWeek ||
                                                                                              []),
                                                                                          day.value,
                                                                                      ],
                                                                        },
                                                                    )
                                                                }
                                                                className={`hover:bg-primary text-xs size-8 flex items-center justify-center py-1 px-2 cursor-pointer hover:text-pure-white rounded-full ${
                                                                    field.value?.daysOfWeek?.includes(
                                                                        day.value,
                                                                    )
                                                                        ? 'bg-primary text-pure-white'
                                                                        : 'bg-background'
                                                                }`}
                                                            >
                                                                <span>
                                                                    {day.label}
                                                                </span>
                                                            </p>
                                                        ))}
                                                    </div>
                                                )}
                                            {field.value?.isRecurring && (
                                                <div className='flex items-center text-xs text-dark-gray'>
                                                    <p>
                                                        Occurs every{' '}
                                                        {renderRecurrence(
                                                            field.value
                                                                .frequency,
                                                        )}{' '}
                                                        till -
                                                    </p>
                                                    <DatePicker
                                                        allowDeselect={false}
                                                        className='border-none h-fit w-fit'
                                                        value={dayjs(
                                                            form.watch(
                                                                'recurrence',
                                                            )?.endRecurrence,
                                                        )}
                                                        onChange={(val) =>
                                                            field.onChange({
                                                                ...field.value,
                                                                endRecurrence:
                                                                    val?.toISOString(),
                                                            })
                                                        }
                                                        placeholder='Choose an end date'
                                                    />
                                                </div>
                                            )}
                                            {form.formState.errors?.recurrence
                                                ?.endRecurrence && (
                                                <p className='text-xs text-destructive'>
                                                    {
                                                        form.formState.errors
                                                            ?.recurrence
                                                            ?.endRecurrence
                                                            ?.message
                                                    }
                                                </p>
                                            )}
                                        </div>
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>
                </div>
            </div>
        );
    };

    const reminderField = (className?: string) => {
        return (
            <FormField
                control={form.control}
                name='reminders'
                render={({ field }) => (
                    <FormItem
                        className={cn('col-span-5', {
                            'col-span-10 order-9': isFullScreen,
                        })}
                    >
                        <div
                            className={
                                isFullScreen ? 'min-h-[calc(100%-20px)]' : ''
                            }
                        >
                            {isFullScreen && (
                                <FormLabel reqired>Add Reminders</FormLabel>
                            )}
                            {field.value?.map((noti, i) => (
                                <AddNotification
                                    disabled={edit}
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
        const options = [
            {
                label: 'Zoom',
                image: zoomImg,
                value: 'zoom',
            },
            {
                label: 'Phone Call',
                image: phoneImg,
                value: 'call',
            },
            {
                label: 'Google Meet',
                image: meetImg,
                value: 'meet',
            },
            {
                label: 'Custom',
                image: customImg,
                value: 'custom',
            },
        ];

        return (
            <FormField
                control={form.control}
                name='location'
                render={({ field }) => (
                    <FormItem className={className}>
                        <div
                            className={cn('w-full', {
                                'h-[calc(100%-19px)]': isFullScreen,
                            })}
                        >
                            {isFullScreen && (
                                <FormLabel reqired>Location</FormLabel>
                            )}
                            <div className='bg-foreground space-y-2 rounded-md border border-forground-border p-3 mt-2'>
                                <div className='grid grid-cols-2 md:grid-cols-4 gap-2'>
                                    {options.map((op) => (
                                        <div
                                            onClick={() =>
                                                field.onChange({
                                                    ...field.value,
                                                    type: op.value,
                                                })
                                            }
                                            key={op.value}
                                            className={cn(
                                                'bg-background cursor-pointer h-full w-full rounded-md flex flex-col items-center p-2',
                                                {
                                                    'bg-primary-light border border-primary':
                                                        field.value?.type ===
                                                        op.value,
                                                },
                                            )}
                                        >
                                            <Image
                                                className='size-9 object-contain'
                                                src={op.image}
                                                height={60}
                                                width={60}
                                                alt='zoom'
                                            />
                                            <h5 className='text-dark-gray text-sm'>
                                                {op.label}
                                            </h5>
                                        </div>
                                    ))}
                                </div>
                                <Input
                                    value={field.value?.link}
                                    onChange={(e) =>
                                        field.onChange({
                                            ...field.value,
                                            link: e.target.value,
                                        })
                                    }
                                    placeholder={`Paste your ${field.value.type === 'call' ? 'phone number here' : 'meeting link'} here...`}
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
                    {/* <MarkdownEditor
                        ref={agendaRef}
                        placeholder='Enter agenda/follow up/action item...'
                        className='bg-foreground h-full overflow-y-auto'
                        markdown={form.getValues('description') || ''}
                        onChange={() => {
                            const value = agendaRef.current?.getMarkdown();
                            form.setValue('description', value);
                        }}
                    /> */}
                    <GlobalEditor
                        className='bg-foreground'
                        placeholder='Write Agenda/Follow up/Action Item'
                        value={form.watch('description') || ''}
                        onChange={(value) => {
                            form.setValue('description', value);
                        }}
                    />
                </div>
            </div>
        );
    };

    useEffect(() => {
        const permissionsFromForm = form.getValues('permissions');
        if (permissionsFromForm) {
            const selectedKeys = Object.entries(permissionsFromForm)
                .filter(([_, value]) => value === true)
                .map(([key]) => key); // Extract the permission keys
            setSelectedPermissions(selectedKeys);
        }
    }, [form.watch('permissions')]);

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
                                name='attendees'
                                render={({ field }) => (
                                    <FormItem
                                        className={cn('col-span-5 w-full', {
                                            'order-5': isFullScreen,
                                        })}
                                    >
                                        <FormControl>
                                            <div className='w-full'>
                                                <GlobalDropdown
                                                    className='w-[--radix-popover-trigger-width] '
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
                                                                                    u._id ===
                                                                                    user._id,
                                                                            );
                                                                        return (
                                                                            <div
                                                                                onClick={() => {
                                                                                    if (
                                                                                        !edit ||
                                                                                        isMyEvent ||
                                                                                        event
                                                                                            ?.permissions
                                                                                            ?.inviteOthers
                                                                                    ) {
                                                                                        if (
                                                                                            selected
                                                                                        ) {
                                                                                            field.onChange(
                                                                                                field.value?.filter(
                                                                                                    (
                                                                                                        u,
                                                                                                    ) =>
                                                                                                        u._id !==
                                                                                                        user._id,
                                                                                                ),
                                                                                            );
                                                                                        } else {
                                                                                            field.onChange(
                                                                                                [
                                                                                                    ...field.value,
                                                                                                    user,
                                                                                                ],
                                                                                            );
                                                                                        }
                                                                                    } else {
                                                                                        toast.warning(
                                                                                            'You do not have permission to invite users',
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
                                                                                    i
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
                                                    <div className='w-full border border-forground-border h-10 rounded-md bg-foreground flex px-3 items-center text-dark-gray gap-2'>
                                                        <Users size={18} />
                                                        Add Guests{' '}
                                                        <span className='text-danger'>
                                                            *
                                                        </span>
                                                    </div>
                                                </GlobalDropdown>

                                                {field.value?.length > 0 && (
                                                    <div className='space-y-2 max-h-40 bg-foreground p-2 overflow-y-auto'>
                                                        {field.value?.map(
                                                            (us, i) => {
                                                                const user =
                                                                    us as TUser;
                                                                return (
                                                                    <div
                                                                        className='relative bg-background px-2 py-1 flex items-center justify-between rounded-md'
                                                                        key={i}
                                                                    >
                                                                        <TdUser
                                                                            user={
                                                                                user
                                                                            }
                                                                        />
                                                                        {(!edit ||
                                                                            isMyEvent) && (
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
                                                                        )}
                                                                    </div>
                                                                );
                                                            },
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
                                {titleField('col-span-10 lg:col-span-5')}
                                {courseLink(
                                    'md:col-span-5 col-span-10 2xl:col-span-2',
                                )}
                                {priorityField(
                                    'col-span-5 md:col-span-5 2xl:col-span-2',
                                )}
                                {colorField(
                                    'col-span-5 md:col-span-5 2xl:col-span-1',
                                )}
                            </div>
                            <div className='grid md:grid-cols-2 grid-cols-1 gap-2'>
                                {dateField('')}
                                {locationField()}
                            </div>
                            <div className='grid md:grid-cols-2 grid-cols-1 lg:grid-cols-[2fr_1fr] gap-2'>
                                {agendaField()}
                                <div className='h-full'>
                                    {isFullScreen && (
                                        <FormLabel reqired>
                                            Invitations/Add Guests
                                        </FormLabel>
                                    )}
                                    <FormField
                                        control={form.control}
                                        name='attendees'
                                        render={({ field }) => (
                                            <FormItem className='bg-foreground h-[60vh] overflow-y-auto rounded-md border border-forground-border mt-2'>
                                                <FormControl>
                                                    <div>
                                                        <FormMessage className='pt-2 text-center' />
                                                        {field.value?.length >
                                                            0 && (
                                                            <div className='p-2'>
                                                                <div className='space-y-2 bg-foreground max-h-[300px] overflow-y-auto'>
                                                                    {field.value?.map(
                                                                        (
                                                                            user,
                                                                            i,
                                                                        ) => (
                                                                            <div
                                                                                className='relative bg-background px-2 py-1 flex items-center justify-between rounded-md'
                                                                                key={
                                                                                    i
                                                                                }
                                                                            >
                                                                                <TdUser
                                                                                    user={
                                                                                        user as TUser
                                                                                    }
                                                                                />
                                                                                {(!edit ||
                                                                                    isMyEvent) && (
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
                                                                                )}
                                                                            </div>
                                                                        ),
                                                                    )}
                                                                </div>
                                                                <div className='pt-2'>
                                                                    <label className='text-sm text-black font-medium'>
                                                                        Permission
                                                                    </label>
                                                                    <MultiSelect
                                                                        disabled={
                                                                            !isMyEvent &&
                                                                            edit
                                                                        }
                                                                        onChange={(
                                                                            val,
                                                                        ) => {
                                                                            form.setValue(
                                                                                'permissions',
                                                                                {
                                                                                    inviteOthers:
                                                                                        val.includes(
                                                                                            'inviteOthers',
                                                                                        ),
                                                                                    modifyEvent:
                                                                                        val.includes(
                                                                                            'modifyEvent',
                                                                                        ),
                                                                                    seeGuestList:
                                                                                        val.includes(
                                                                                            'seeGuestList',
                                                                                        ),
                                                                                },
                                                                            );
                                                                        }}
                                                                        value={
                                                                            selectedPermissions
                                                                        }
                                                                        options={[
                                                                            {
                                                                                value: 'modifyEvent',
                                                                                label: 'Modify Event',
                                                                            },
                                                                            {
                                                                                value: 'inviteOthers',
                                                                                label: 'Invite Others',
                                                                            },
                                                                            {
                                                                                value: 'seeGuestList',
                                                                                label: 'See Guest List',
                                                                            },
                                                                        ]}
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}

                                                        <div className='p-2 overflow-y-auto'>
                                                            <Input
                                                                className='bg-background'
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
                                                                                    u._id ===
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
                                                                                    i
                                                                                }
                                                                            >
                                                                                <PopoverTrigger className='w-full block'>
                                                                                    <div
                                                                                        onClick={() => {
                                                                                            if (
                                                                                                !edit ||
                                                                                                isMyEvent ||
                                                                                                event
                                                                                                    ?.permissions
                                                                                                    ?.inviteOthers
                                                                                            ) {
                                                                                                if (
                                                                                                    selected
                                                                                                ) {
                                                                                                    field.onChange(
                                                                                                        field.value?.filter(
                                                                                                            (
                                                                                                                u,
                                                                                                            ) =>
                                                                                                                u._id !==
                                                                                                                user._id,
                                                                                                        ),
                                                                                                    );
                                                                                                } else {
                                                                                                    field.onChange(
                                                                                                        [
                                                                                                            ...field.value,
                                                                                                            user,
                                                                                                        ],
                                                                                                    );
                                                                                                }
                                                                                            } else {
                                                                                                toast.warning(
                                                                                                    'You do not have permission to invite users',
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
