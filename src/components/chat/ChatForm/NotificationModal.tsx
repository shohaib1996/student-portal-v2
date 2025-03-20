'use client';

import type React from 'react';
import { useEffect, useState, useCallback } from 'react';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Loader2, CalendarIcon, SaveIcon } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import GlobalDialog from '@/components/global/GlobalDialogModal/GlobalDialog';
import { TimePicker } from '@/components/global/TimePicker';

dayjs.extend(customParseFormat);

interface NotificationOptionModalProps {
    opened: boolean;
    close: () => void;
    chatId: string;
    member: {
        _id: string;
        notification?: {
            isOn: boolean;
            dateUntil: string | null;
        };
    } | null;
    handleUpdateCallback?: (member: any) => void;
}

interface MemberNotification {
    isOn: boolean;
    dateUntil: string | null;
}

const NotificationOptionModal: React.FC<NotificationOptionModalProps> = (
    props,
) => {
    const { opened, close, chatId, member, handleUpdateCallback } = props;
    console.log('member', member);

    const modalClose = useCallback(() => {
        close();
    }, [close]);

    // Initial states
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [dateUntil, setDateUntil] = useState<string | null>(null);
    const [isUpdating, setIsUpdating] = useState<boolean>(false);
    const [note, setNote] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [date, setDate] = useState<Date | undefined>();
    const [timeValue, setTimeValue] = useState<Date | null>(null);

    useEffect(() => {
        setNote('');
        if (!member?.notification?.isOn) {
            if (member) {
                console.log('member', member);

                const muteDate = dayjs(member?.notification?.dateUntil);
                const now = dayjs();

                if (!member?.notification?.dateUntil) {
                    setSelectedOption(3);
                    setDateUntil(null);
                } else {
                    const hourDifference = muteDate.diff(now, 'hour');
                    const dayDifference = muteDate.diff(now, 'day');

                    if (hourDifference <= 1) {
                        setSelectedOption(1);
                    } else if (dayDifference < 1) {
                        setSelectedOption(2);
                    } else {
                        setSelectedOption(4);
                        setDateUntil(muteDate.toISOString());
                        setDate(muteDate.toDate());

                        // Set time value for TimePicker
                        const timeDate = new Date();
                        timeDate.setHours(muteDate.hour(), muteDate.minute());
                        setTimeValue(timeDate);
                    }
                }

                setIsLoading(false);
            }
        } else {
            setSelectedOption(null);
        }
    }, [member]);

    const handleSave = useCallback(() => {
        const data = {
            member: member?._id,
            selectedOption,
            dateUntil: selectedOption === 4 ? dateUntil : null,
            chat: chatId,
            actionType: member?.notification?.isOn ? 'mutenoti' : 'unmutenoti',
        };

        setIsUpdating(true);

        axios
            .post('/chat/member/update', data)
            .then((res) => {
                // Using RTK would replace this dispatch
                // dispatch(updateMyData({ _id: chatId, field: "notification", value: res.data?.member?.notification }))

                setIsUpdating(false);
                toast.success('Updated successfully');
                setSelectedOption(null);
                setDateUntil(null);
                modalClose();
            })
            .catch((err) => {
                setIsUpdating(false);
                toast.error(err?.response?.data?.error || 'An error occurred');
            });
    }, [
        member?._id,
        selectedOption,
        dateUntil,
        chatId,
        member?.notification?.isOn,
        modalClose,
    ]);

    const handleDateTimeChange = useCallback(() => {
        if (date && timeValue) {
            const newDate = new Date(date);
            newDate.setHours(timeValue.getHours(), timeValue.getMinutes());
            setDateUntil(dayjs(newDate).toISOString());
        }
    }, [date, timeValue]);

    useEffect(() => {
        handleDateTimeChange();
    }, [date, timeValue, handleDateTimeChange]);

    const disabledDate = useCallback((date: Date) => {
        return date < new Date(new Date().setHours(0, 0, 0, 0));
    }, []);

    // Custom radio component
    const CustomRadio = ({ selected }: { selected: boolean }) => (
        <div
            className={cn(
                'w-5 h-5 rounded-full border flex items-center justify-center transition-colors',
                selected ? 'border-primary' : 'border-gray-300',
            )}
        >
            {selected && <div className='w-3 h-3 rounded-full bg-primary' />}
        </div>
    );

    return (
        <GlobalDialog
            open={opened}
            setOpen={(open: any) => !open && modalClose()}
            title='Mute Notifications'
            subTitle={`Muted chats are private, and you'll still get mentions`}
            className='sm:max-w-[580px]'
            allowFullScreen={false}
            buttons={
                <Button
                    onClick={handleSave}
                    disabled={isUpdating}
                    className='text-lg'
                >
                    {isUpdating ? (
                        <Loader2 className='h-4 w-4 animate-spin mr-2' />
                    ) : (
                        <SaveIcon size={18} className='mr-2' />
                    )}
                    Save
                </Button>
            }
        >
            <div className=''>
                <div className='bg-card rounded-md'>
                    <p className='bg-orange-500/10 p-2 text-dark-gray leading-tight text-sm border-orange-500/30 rounded-lg'>
                        Other members will not see that you muted this chat. You
                        will still be notified if you are mentioned.
                    </p>
                    {!member?.notification?.isOn ? (
                        <>
                            {isUpdating ? (
                                <div className='flex items-center justify-center w-full pt-4'>
                                    <Loader2 className='h-8 w-8 animate-spin' />
                                </div>
                            ) : (
                                <div className='mt-2 bg-foreground p-2 rounded-lg flex flex-col md:flex-row items-center md:justify-between gap-5 border shadow-md'>
                                    <p className='text-xl font-semibold text-black '>
                                        {selectedOption === 1
                                            ? 'Already muted for 1 Hour'
                                            : selectedOption === 2
                                              ? 'Already muted for 1 Day'
                                              : selectedOption === 3
                                                ? 'Muted for until you turn it back'
                                                : `Muted till ${dayjs(
                                                      member?.notification
                                                          ?.dateUntil,
                                                  ).format(
                                                      'MMM DD, YYYY',
                                                  )} at ${dayjs(
                                                      member?.notification
                                                          ?.dateUntil,
                                                  ).format('hh:mm A')}`}
                                    </p>
                                    <Button
                                        onClick={() => {
                                            setSelectedOption(5);
                                            handleSave();
                                        }}
                                        className=''
                                    >
                                        Unmute
                                    </Button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className='w-full pt-2 space-y-2'>
                            {/* Option 1: Mute for 1 hour */}
                            <div
                                className={cn(
                                    'flex items-center space-x-3 bg-foreground rounded-lg border p-2 cursor-pointer',
                                    selectedOption === 1
                                        ? 'border-blue-500/30 bg-primary-light'
                                        : 'hover:border-blue-500/30 hover:bg-primary-light',
                                )}
                                onClick={() => setSelectedOption(1)}
                            >
                                <CustomRadio selected={selectedOption === 1} />
                                <span className='text-gray'>
                                    Mute for 1 hour
                                </span>
                            </div>

                            {/* Option 2: Mute for 1 day */}
                            <div
                                className={cn(
                                    'flex items-center space-x-3 bg-foreground rounded-lg border p-2 cursor-pointer',
                                    selectedOption === 2
                                        ? 'border-blue-500/30 bg-primary-light'
                                        : 'hover:border-blue-500/30 hover:bg-primary-light',
                                )}
                                onClick={() => setSelectedOption(2)}
                            >
                                <CustomRadio selected={selectedOption === 2} />
                                <span className='text-gray'>
                                    Mute for 1 day
                                </span>
                            </div>

                            {/* Option 3: Mute until turned back on */}
                            <div
                                className={cn(
                                    'flex items-center space-x-3 bg-foreground rounded-lg border p-2 cursor-pointer',
                                    selectedOption === 3
                                        ? 'border-blue-500/30 bg-primary-light'
                                        : 'hover:border-blue-500/30 hover:bg-primary-light',
                                )}
                                onClick={() => setSelectedOption(3)}
                            >
                                <CustomRadio selected={selectedOption === 3} />
                                <span className='text-gray'>
                                    Mute Until I turn it back on
                                </span>
                            </div>

                            {/* Option 4: Custom time */}
                            <div
                                className={cn(
                                    'bg-foreground rounded-lg border p-2',
                                    selectedOption === 4
                                        ? 'border-blue-500/30 bg-primary-light'
                                        : 'hover:border-blue-500/30 hover:bg-primary-light',
                                )}
                            >
                                <div
                                    className='flex items-center space-x-3 cursor-pointer'
                                    onClick={() => setSelectedOption(4)}
                                >
                                    <CustomRadio
                                        selected={selectedOption === 4}
                                    />
                                    <span className='text-gray'>
                                        Custom time
                                    </span>
                                </div>

                                {selectedOption === 4 && (
                                    <div className='flex flex-col sm:flex-row gap-2 mt-1 w-full'>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant='outline'
                                                    className={cn(
                                                        'w-full justify-start text-left font-normal bg-background',
                                                        !date && 'text-gray',
                                                    )}
                                                >
                                                    <CalendarIcon className='mr-2 h-4 w-4' />
                                                    {date ? (
                                                        format(date, 'PPP')
                                                    ) : (
                                                        <span>Pick a date</span>
                                                    )}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className='w-auto p-0'>
                                                <Calendar
                                                    mode='single'
                                                    selected={date}
                                                    onSelect={setDate}
                                                    disabled={disabledDate}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <TimePicker
                                            value={timeValue}
                                            onChange={setTimeValue}
                                            className='w-full bg-background'
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </GlobalDialog>
    );
};

export default NotificationOptionModal;
