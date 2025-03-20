'use client';

import type React from 'react';
import { useEffect, useState, useCallback } from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAppDispatch } from '@/redux/hooks';
import { updateMyData } from '@/redux/features/chatReducer';

dayjs.extend(customParseFormat);

interface User {
    _id: string;
    firstName?: string;
    fullName?: string;
}

interface Mute {
    isMuted?: boolean;
    date?: string;
    note?: string;
}

interface Member {
    _id: string;
    user?: User;
    mute?: Mute;
}

interface MuteOptionProps {
    opened: boolean;
    close: () => void;
    chat: string;
    member: Member | null;
    handleUpdateCallback: (member: Member) => void;
}

const MuteOption: React.FC<MuteOptionProps> = ({
    opened,
    close,
    chat,
    member,
    handleUpdateCallback,
}) => {
    // Initial states
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [date, setDate] = useState<Date | undefined>();
    const [timeValue, setTimeValue] = useState<Date | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [note, setNote] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    // Redux dispatch
    const dispatch = useAppDispatch();

    const modalClose = useCallback(() => {
        close();
    }, [close]);

    useEffect(() => {
        setNote('');
        if (member?.mute?.isMuted) {
            if (member) {
                setNote(member?.mute?.note || '');
                const muteDate = member?.mute?.date
                    ? dayjs(member.mute.date)
                    : null;
                const now = dayjs();

                if (!member?.mute?.date || !muteDate) {
                    setSelectedOption(3);
                    setDate(undefined);
                    setTimeValue(null);
                } else {
                    const hourDifference = muteDate.diff(now, 'hour');
                    const dayDifference = muteDate.diff(now, 'day');

                    if (hourDifference <= 1) {
                        setSelectedOption(1);
                    } else if (dayDifference < 1) {
                        setSelectedOption(2);
                    } else {
                        setSelectedOption(4);
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

    const handleDateTimeChange = useCallback(() => {
        if (date && timeValue) {
            const newDate = new Date(date);
            newDate.setHours(timeValue.getHours(), timeValue.getMinutes());
            return newDate.toISOString();
        }
        return null;
    }, [date, timeValue]);

    const handleSave = useCallback(() => {
        if (!member) {
            return;
        }

        const data = {
            member: member?._id,
            selectedOption,
            date: selectedOption === 4 ? handleDateTimeChange() : null,
            note,
            chat,
            actionType: member?.mute?.isMuted ? 'unmute' : 'mute',
        };

        setIsUpdating(true);

        axios
            .post('/chat/member/update', data)
            .then((res) => {
                // Update the member data in the callback
                handleUpdateCallback(res.data?.member);

                // Update the chat data in Redux
                if (res.data?.member?.mute) {
                    dispatch(
                        updateMyData({
                            _id: chat,
                            field: 'mute',
                            value: res.data.member.mute,
                        }),
                    );
                }

                setIsUpdating(false);
                toast.success('Updated successfully');
                setSelectedOption(null);
                setDate(undefined);
                setTimeValue(null);
                setNote('');
                modalClose();
            })
            .catch((err) => {
                setIsUpdating(false);
                toast.error(err?.response?.data?.error || 'Failed to update');
            });
    }, [
        member,
        selectedOption,
        handleDateTimeChange,
        note,
        chat,
        handleUpdateCallback,
        dispatch,
        modalClose,
    ]);

    const disabledDate = useCallback((date: Date) => {
        return date < new Date(new Date().setHours(0, 0, 0, 0));
    }, []);

    return (
        <GlobalDialog
            open={opened}
            setOpen={(open) => !open && modalClose()}
            title={`${member?.user?.firstName || member?.user?.fullName}'s Mute options`}
            subTitle={`Muted members can't send message in this crowd but can read messages`}
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
                    <p className='bg-orange-500/10 p-2 text-dark-gray leading-tight text-sm border-orange-500/90 rounded-lg'>
                        {`Muted members can't send message in this crowd but
                        he/she can read message`}
                    </p>
                    {member?.mute?.isMuted ? (
                        <>
                            {isUpdating ? (
                                <div className='flex items-center justify-center w-full pt-4'>
                                    <Loader2 className='h-8 w-8 animate-spin' />
                                </div>
                            ) : (
                                <div className='mt-2 bg-foreground p-2 rounded-lg flex flex-col md:flex-row items-center md:justify-between gap-5 border shadow-md'>
                                    <p className='text-xl font-semibold text-black'>
                                        {selectedOption === 1
                                            ? 'Already muted for 1 Hour'
                                            : selectedOption === 2
                                              ? 'Already muted for 1 Day'
                                              : selectedOption === 3
                                                ? 'Muted until you turn it back'
                                                : member?.mute?.date
                                                  ? `Muted till ${dayjs(member.mute.date).format('MMM DD, YYYY')} at ${dayjs(
                                                        member.mute.date,
                                                    ).format('hh:mm A')}`
                                                  : 'Muted'}
                                    </p>
                                    <Button
                                        onClick={() => {
                                            setSelectedOption(5);
                                            handleSave();
                                        }}
                                    >
                                        Unmute
                                    </Button>
                                </div>
                            )}
                        </>
                    ) : (
                        <RadioGroup
                            className='w-full pt-2 space-y-1'
                            value={selectedOption?.toString()}
                            onValueChange={(value) =>
                                setSelectedOption(Number.parseInt(value))
                            }
                        >
                            <div className='flex items-center space-x-2 bg-foreground rounded-lg border p-2'>
                                <RadioGroupItem value='1' id='option1' />
                                <label htmlFor='option1' className='text-gray'>
                                    Mute for 1 hour
                                </label>
                            </div>
                            <div className='flex items-center space-x-2 bg-foreground rounded-lg border p-2'>
                                <RadioGroupItem value='2' id='option2' />
                                <label htmlFor='option2' className='text-gray'>
                                    Mute for 1 day
                                </label>
                            </div>
                            <div className='flex items-center space-x-2 bg-foreground rounded-lg border p-2'>
                                <RadioGroupItem value='3' id='option3' />
                                <label htmlFor='option3' className='text-gray'>
                                    Mute Until I turn it back on
                                </label>
                            </div>
                            <div className='flex items-start space-x-2 bg-foreground rounded-lg border p-2'>
                                <RadioGroupItem
                                    value='4'
                                    id='option4'
                                    className='mt-1'
                                />
                                <div className='w-full'>
                                    <label
                                        htmlFor='option4'
                                        className='text-gray'
                                    >
                                        Custom time
                                    </label>
                                    {selectedOption === 4 && (
                                        <div className='flex flex-col sm:flex-row gap-2 mt-1 w-full'>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant='outline'
                                                        className={cn(
                                                            'w-full justify-start text-left font-normal bg-background',
                                                            !date &&
                                                                'text-gray',
                                                        )}
                                                    >
                                                        <CalendarIcon className='mr-2 h-4 w-4' />
                                                        {date ? (
                                                            format(date, 'PPP')
                                                        ) : (
                                                            <span>
                                                                Pick a date
                                                            </span>
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
                        </RadioGroup>
                    )}

                    <div className='mt-2'>
                        <Label
                            htmlFor='note'
                            className='text-lg font-medium block'
                        >
                            Add a note (Optional)
                        </Label>
                        <Textarea
                            id='note'
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            className='h-24 resize-none bg-foreground border'
                            placeholder='Add your note here...'
                        />
                    </div>
                </div>
            </div>
        </GlobalDialog>
    );
};

export default MuteOption;
