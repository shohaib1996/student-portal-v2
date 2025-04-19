'use client';

import type React from 'react';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Loader2, CalendarIcon, Clock, SaveIcon } from 'lucide-react';
import { toast } from 'sonner';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import GlobalDialog from '@/components/global/GlobalDialogModal/GlobalDialog';
import CustomTimePicker from '@/components/global/CustomTimePicker';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAppDispatch } from '@/redux/hooks';
import { updateMyData } from '@/redux/features/chatReducer';
import { instance } from '@/lib/axios/axiosInstance';

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
    const [showDateTimePicker, setShowDateTimePicker] =
        useState<boolean>(false);

    // Redux dispatch
    const dispatch = useAppDispatch();

    const modalClose = useCallback(() => {
        close();
    }, [close]);

    // Check if the form is valid for submission
    const isFormValid = useMemo(() => {
        if (selectedOption === 4) {
            return date !== undefined && timeValue !== null;
        }
        return selectedOption !== null;
    }, [selectedOption, date, timeValue]);

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
            setIsLoading(false);
        }
    }, [member]);

    // Update dateTime when date or timeValue changes
    useEffect(() => {
        if (selectedOption === 4 && date && timeValue) {
            const newDate = new Date(date);
            newDate.setHours(timeValue.getHours(), timeValue.getMinutes());
        }
    }, [date, timeValue, selectedOption]);

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

        if (selectedOption === 4 && (!date || !timeValue)) {
            toast.error('Please select both date and time');
            return;
        }

        if (!member?.mute?.isMuted && !selectedOption) {
            toast.error('Please select a mute option');
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

        instance
            .post('/chat/member/update', data)
            .then((res) => {
                // Update the member data in the callback
                handleUpdateCallback(res.data?.member);

                // Update the chat data in Redux
                // if (res.data?.member?.mute) {
                //     dispatch(
                //         updateMyData({
                //             _id: chat,
                //             field: 'mute',
                //             value: res.data.member.mute,
                //         }),
                //     );
                // }

                // Show appropriate toast based on the action
                if (member?.mute?.isMuted) {
                    toast.success('Member unmuted successfully');
                } else {
                    const duration =
                        selectedOption === 1
                            ? '1 hour'
                            : selectedOption === 2
                              ? '1 day'
                              : selectedOption === 3
                                ? 'indefinitely'
                                : selectedOption === 4
                                  ? 'until the specified time'
                                  : '';
                    toast.success(`Member muted for ${duration}`);
                }

                setIsUpdating(false);
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
        date,
        timeValue,
    ]);

    const handleUnmute = useCallback(() => {
        if (!member || isUpdating) {
            return;
        }

        setSelectedOption(5);

        const data = {
            member: member?._id,
            selectedOption: 5,
            date: null,
            note,
            chat,
            actionType: 'unmute',
        };

        setIsUpdating(true);

        instance
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

                toast.success('Member unmuted successfully');
                setIsUpdating(false);
                modalClose();
            })
            .catch((err) => {
                setIsUpdating(false);
                toast.error(err?.response?.data?.error || 'Failed to unmute');
            });
    }, [
        member,
        isUpdating,
        note,
        chat,
        handleUpdateCallback,
        dispatch,
        modalClose,
    ]);

    const disabledDate = useCallback((date: Date) => {
        return date < new Date(new Date().setHours(0, 0, 0, 0));
    }, []);

    // Toggle datetime picker visibility
    const toggleDateTimePicker = useCallback(() => {
        // If not showing yet, initialize values if needed
        if (!showDateTimePicker) {
            // Initialize date if not already set
            if (!date) {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                setDate(tomorrow);
            }

            // Initialize time if not already set
            if (!timeValue) {
                const now = new Date();
                setTimeValue(now);
            }
        }

        setShowDateTimePicker(!showDateTimePicker);
    }, [showDateTimePicker, date, timeValue]);

    // Handle date selection
    const handleDateSelect = useCallback((newDate: Date | undefined) => {
        setDate(newDate);
    }, []);

    // Handle time selection
    const handleTimeSelect = useCallback((newTime: Date | null) => {
        setTimeValue(newTime);
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
            setOpen={(open) => !open && modalClose()}
            title={`${member?.user?.firstName || member?.user?.fullName}'s Mute options`}
            subTitle={`Muted members can't send message in this crowd but can read messages`}
            className='sm:max-w-[580px]'
            bgColor='bg-background'
            allowFullScreen={false}
            buttons={
                <Button
                    onClick={handleSave}
                    disabled={
                        isUpdating || (!member?.mute?.isMuted && !isFormValid)
                    }
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
                <div className=' rounded-md'>
                    <p className='bg-orange-500/20 p-2 text-orange-600 leading-tight text-sm border-orange-500/30 rounded-lg'>
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
                                        onClick={handleUnmute}
                                        disabled={isUpdating}
                                    >
                                        {isUpdating ? (
                                            <Loader2 className='h-4 w-4 animate-spin mr-2' />
                                        ) : (
                                            'Unmute'
                                        )}
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
                                onClick={() => {
                                    setSelectedOption(1);
                                    setShowDateTimePicker(false);
                                }}
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
                                onClick={() => {
                                    setSelectedOption(2);
                                    setShowDateTimePicker(false);
                                }}
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
                                onClick={() => {
                                    setSelectedOption(3);
                                    setShowDateTimePicker(false);
                                }}
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
                                        {/* Date selector field */}
                                        <Button
                                            variant='outline'
                                            className={cn(
                                                'w-full justify-start text-left font-normal bg-foreground',
                                                !date && 'text-gray',
                                            )}
                                            onClick={toggleDateTimePicker}
                                            type='button'
                                        >
                                            <CalendarIcon className='mr-2 h-4 w-4' />
                                            {date ? (
                                                format(date, 'PPP')
                                            ) : (
                                                <span>Pick a date</span>
                                            )}
                                        </Button>

                                        {/* Time selector field */}
                                        <Button
                                            variant='outline'
                                            className={cn(
                                                'w-full justify-start text-left font-normal bg-foreground',
                                                !timeValue && 'text-gray',
                                            )}
                                            onClick={toggleDateTimePicker}
                                            type='button'
                                        >
                                            <Clock className='mr-2 h-4 w-4' />
                                            {timeValue ? (
                                                format(timeValue, 'h:mm a')
                                            ) : (
                                                <span>Pick a time</span>
                                            )}
                                        </Button>
                                    </div>
                                )}

                                {/* Combined Date-Time picker */}
                                {selectedOption === 4 && showDateTimePicker && (
                                    <div className='mt-2 bg-foreground border rounded-md shadow-lg overflow-hidden'>
                                        <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
                                            <div className='p-2 border-b md:border-b-0 md:border-r'>
                                                <h3 className='text-sm font-medium mb-1 text-center'>
                                                    Date
                                                </h3>
                                                <Calendar
                                                    mode='single'
                                                    selected={date}
                                                    onSelect={handleDateSelect}
                                                    disabled={disabledDate}
                                                    initialFocus
                                                />
                                            </div>
                                            <div className='p-2'>
                                                <h3 className='text-sm font-medium mb-1 text-center'>
                                                    Time
                                                </h3>
                                                <CustomTimePicker
                                                    value={timeValue}
                                                    onChange={handleTimeSelect}
                                                    className='w-full'
                                                />
                                            </div>
                                        </div>
                                        <div className='p-2 bg-background text-right'>
                                            <Button
                                                size='sm'
                                                onClick={() =>
                                                    setShowDateTimePicker(false)
                                                }
                                                type='button'
                                            >
                                                Done
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className='mt-4'>
                        <Label
                            htmlFor='note'
                            className='text-lg font-medium block mb-2'
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
