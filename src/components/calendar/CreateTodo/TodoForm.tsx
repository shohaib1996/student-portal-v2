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
import { UseFormReturn, SubmitHandler } from 'react-hook-form';
import { ColorPicker } from '@/components/global/ColorPicker';
import { TAvailability, TNotification } from '@/types/calendar/calendarTypes';
import { MarkdownEditor } from '@/components/global/MarkdownEditor/MarkdownEditor';
import { MDXEditorMethods } from '@mdxeditor/editor';
import Image from 'next/image';
import { useEventPopover } from '../CreateEvent/EventPopover';
import { TTodoFormType } from '../validations/todoValidation';
import AddNotification from '../CreateEvent/AddNotification';

type TProps = {
    form: UseFormReturn<TTodoFormType>;
    onSubmit: SubmitHandler<TTodoFormType>;
    setCurrentDate: Dispatch<SetStateAction<Dayjs>>;
};

const TodoForm = ({ form, onSubmit, setCurrentDate }: TProps) => {
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

    const reminderField = (className?: string) => {
        return (
            <FormField
                control={form.control}
                name='notifications'
                render={({ field }) => (
                    <FormItem>
                        <div className={isFullScreen ? '' : ''}>
                            {isFullScreen && (
                                <FormLabel reqired>Add Reminders</FormLabel>
                            )}
                            {field.value?.map((noti, i) => (
                                <AddNotification
                                    className={
                                        isFullScreen
                                            ? 'min-h-[calc(100%-20px)]'
                                            : ''
                                    }
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

                            {/* Date and Time */}
                            {dateField()}

                            {/* Agenda */}
                            {agendaField()}

                            {reminderField()}

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
                            </div>
                            <div className='grid grid-cols-2 gap-2'>
                                {dateField('')}
                                {reminderField()}
                            </div>
                            {agendaField()}
                        </div>
                    )}
                </form>
            </Form>
        </div>
    );
};

export default TodoForm;
