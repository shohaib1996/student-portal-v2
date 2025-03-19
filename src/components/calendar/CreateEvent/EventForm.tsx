'use client';

import { Dispatch, SetStateAction, useCallback, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormProps, useForm } from 'react-hook-form';
import { z } from 'zod';
import {
    CalendarIcon,
    ChevronDown,
    Clock,
    MapPin,
    Bell,
    Users,
    LinkIcon,
    Menu,
    SearchIcon,
    Check,
    X,
    Repeat2,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
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
import { useFetchUsersQuery } from '@/redux/api/calendar/calendarApi';
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
import { EventFormSchema } from './CreateEventModal';
import { ColorPicker } from '@/components/global/ColorPicker';

type TProps = {
    form: UseFormReturn<z.infer<typeof EventFormSchema>>;
    onSubmit: SubmitHandler<z.infer<typeof EventFormSchema>>;
    setCurrentDate: Dispatch<SetStateAction<Dayjs>>;
};

const EventForm = ({ form, onSubmit, setCurrentDate }: TProps) => {
    const [date, setDate] = useState<Date>();
    const [query, setQuery] = useState('');

    const { data: userData, isLoading } = useFetchUsersQuery(query);

    const users: TUser[] = userData?.users || [];

    const { isFullScreen } = useEventPopover();

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
            <div
                className={cn(
                    'border border-forground-border bg-foreground rounded-md p-2',
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
                                                    value={dayjs(field.value)}
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
                                                    value={dayjs(field.value)}
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
                                                onCheckedChange={field.onChange}
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
        );
    };

    const reminderField = (className?: string) => {
        return (
            <FormField
                control={form.control}
                name='reminder'
                render={({ field }) => (
                    <FormItem
                        className={cn('col-span-5', {
                            'col-span-10 order-9': isFullScreen,
                        })}
                    >
                        <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                        >
                            <FormControl>
                                <SelectTrigger>
                                    <Bell className='mr-2 h-4 w-4' />
                                    <SelectValue placeholder='Reminder 15 minutes before' />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value='5 minutes before'>
                                    5 minutes before
                                </SelectItem>
                                <SelectItem value='10 minutes before'>
                                    10 minutes before
                                </SelectItem>
                                <SelectItem value='15 minutes before'>
                                    15 minutes before
                                </SelectItem>
                                <SelectItem value='30 minutes before'>
                                    30 minutes before
                                </SelectItem>
                                <SelectItem value='1 hour before'>
                                    1 hour before
                                </SelectItem>
                                <SelectItem value='1 day before'>
                                    1 day before
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
            />
        );
    };

    const locationField = (className?: string) => {
        return (
            <FormField
                control={form.control}
                name='location'
                render={({ field }) => (
                    <FormItem className={className}>
                        <div className='w-full'>
                            <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                            >
                                <FormControl>
                                    <SelectTrigger className=''>
                                        <MapPin className='mr-2 h-4 w-4' />
                                        <SelectValue placeholder='Select location' />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value='office'>
                                        Office
                                    </SelectItem>
                                    <SelectItem value='home'>Home</SelectItem>
                                    <SelectItem value='conference-room'>
                                        Conference Room
                                    </SelectItem>
                                    <SelectItem value='virtual'>
                                        Virtual Meeting
                                    </SelectItem>
                                    <SelectItem value='custom'>
                                        Custom Location
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <FormMessage />
                    </FormItem>
                )}
            />
        );
    };

    const agendaField = (className?: string) => {
        return (
            <FormField
                control={form.control}
                name='agenda'
                render={({ field }) => (
                    <FormItem className={className}>
                        <FormControl>
                            <div className='flex items-center border rounded-md focus-within:ring-1 focus-within:ring-ring'>
                                <Menu className='ml-3 h-4 w-4 text-muted-foreground' />
                                <Input
                                    placeholder='Enter agenda/follow up/action item...'
                                    {...field}
                                    className='border-0 focus-visible:ring-0'
                                />
                            </div>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
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
                        </div>
                    ) : (
                        <div className='space-y-2 h-full'>
                            <div className='grid grid-cols-10 gap-2'>
                                {titleField('col-span-5')}
                                {courseLink('col-span-2')}
                                {priorityField('col-span-2')}
                                {colorField('col-span-1')}
                            </div>
                            <div className='grid grid-cols-2 gap-2'>
                                {dateField()}
                                {locationField()}
                            </div>
                            <div className='grid grid-cols-2 gap-2 h-full'>
                                {agendaField('h-full')}
                                <FormField
                                    control={form.control}
                                    name='invitations'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <div>
                                                    {field.value?.length >
                                                        0 && (
                                                        <div className='space-y-2 max-h-40 bg-foreground p-2 overflow-y-auto'>
                                                            {field.value?.map(
                                                                (user, i) => (
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
                                                                    size={18}
                                                                />
                                                            }
                                                        />

                                                        <div className='space-y-2'>
                                                            {users?.map(
                                                                (user, i) => {
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
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                    )}
                </form>
            </Form>
        </div>
    );
};

export default EventForm;
