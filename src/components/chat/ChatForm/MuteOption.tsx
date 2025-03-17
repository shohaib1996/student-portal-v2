'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { X, Loader2 } from 'lucide-react';
import dayjs from 'dayjs';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DateTimePicker } from '@/components/ui/date-time-picker';
import { useAppDispatch } from '@/redux/hooks';
import { updateMyData } from '@/redux/features/chatReducer';

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
    const [date, setDate] = useState<Date | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [note, setNote] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    // Redux dispatch
    const dispatch = useAppDispatch();

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
                    setDate(null);
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
                    }
                }

                setIsLoading(false);
            }
        } else {
            setSelectedOption(null);
        }
    }, [member]);

    const handleSave = () => {
        if (!member) {
            return;
        }

        const data = {
            member: member?._id,
            selectedOption,
            date: selectedOption === 4 ? date?.toISOString() : null,
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
                setDate(null);
                setNote('');
                close();
            })
            .catch((err) => {
                setIsUpdating(false);
                toast.error(err?.response?.data?.error || 'Failed to update');
            });
    };

    const disabledDate = (date: Date) => {
        return dayjs(date).isBefore(dayjs().startOf('day'));
    };

    return (
        <Dialog open={opened} onOpenChange={(open) => !open && close()}>
            <DialogContent className='sm:max-w-[580px] p-0 bModalContent'>
                <DialogHeader className='px-6 py-4 border-b border-border bModalHeader'>
                    <div className='flex items-center justify-between'>
                        <DialogTitle className='text-xl font-medium bModalTitle'>
                            Mute{' '}
                            {member?.user?.firstName || member?.user?.fullName}
                        </DialogTitle>
                        <Button
                            variant='ghost'
                            size='icon'
                            onClick={close}
                            className='h-10 w-10 rounded-full bg-muted/20 hover:bg-muted/40 btn-close'
                        >
                            <X className='h-5 w-5 text-muted-foreground' />
                            <span className='sr-only'>Close</span>
                        </Button>
                    </div>
                </DialogHeader>

                <div className='p-6 bModalBody'>
                    <div className='role-form-container'>
                        <div className='bg-background rounded-md p-4 mute-box'>
                            <p className='text-muted-foreground'>
                                {`Muted members can't send message in this crowd
                                but he/she can read message`}
                            </p>
                            {member?.mute?.isMuted ? (
                                <>
                                    {isUpdating ? (
                                        <div className='flex items-center justify-center w-full pt-4'>
                                            <Loader2 className='h-8 w-8 animate-spin text-primary' />
                                        </div>
                                    ) : (
                                        <>
                                            <strong className='block text-xl font-medium mt-4'>
                                                {selectedOption === 1
                                                    ? 'Already muted for 1 Hour'
                                                    : selectedOption === 2
                                                      ? 'Already muted for 1 Day'
                                                      : selectedOption === 3
                                                        ? 'Muted until you turn it back'
                                                        : member?.mute?.date
                                                          ? `Muted till ${dayjs(member.mute.date).format('MMM DD, YYYY')} at ${dayjs(
                                                                member.mute
                                                                    .date,
                                                            ).format(
                                                                'hh:mm A',
                                                            )}`
                                                          : 'Muted'}
                                            </strong>
                                            <Button
                                                onClick={() => {
                                                    setSelectedOption(5);
                                                    handleSave();
                                                }}
                                                className='mt-5 button primary'
                                            >
                                                Unmute
                                            </Button>
                                        </>
                                    )}
                                </>
                            ) : (
                                <div className='mt-5 space-y-4'>
                                    <RadioGroup
                                        value={selectedOption?.toString()}
                                        onValueChange={(value) =>
                                            setSelectedOption(
                                                Number.parseInt(value),
                                            )
                                        }
                                        className='space-y-3'
                                    >
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem
                                                value='1'
                                                id='mute-1-hour'
                                            />
                                            <Label
                                                htmlFor='mute-1-hour'
                                                className='text-base font-normal cursor-pointer'
                                            >
                                                Mute for 1 hour
                                            </Label>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem
                                                value='2'
                                                id='mute-1-day'
                                            />
                                            <Label
                                                htmlFor='mute-1-day'
                                                className='text-base font-normal cursor-pointer'
                                            >
                                                Mute for 1 day
                                            </Label>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem
                                                value='3'
                                                id='mute-indefinite'
                                            />
                                            <Label
                                                htmlFor='mute-indefinite'
                                                className='text-base font-normal cursor-pointer'
                                            >
                                                Mute Until I turn it back on
                                            </Label>
                                        </div>
                                        <div className='space-y-2'>
                                            <div className='flex items-center space-x-2'>
                                                <RadioGroupItem
                                                    value='4'
                                                    id='mute-custom'
                                                />
                                                <Label
                                                    htmlFor='mute-custom'
                                                    className='text-base font-normal cursor-pointer'
                                                >
                                                    Custom time
                                                </Label>
                                            </div>
                                            {selectedOption === 4 && (
                                                <div className='ml-7'>
                                                    <DateTimePicker
                                                        date={date}
                                                        setDate={setDate}
                                                        disabled={(date) =>
                                                            disabledDate(date)
                                                        }
                                                        className='w-full'
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </RadioGroup>
                                </div>
                            )}
                        </div>
                        <div className='mt-6 mute-note'>
                            <Label
                                htmlFor='note'
                                className='text-lg font-medium block mb-2'
                            >
                                Add a note (Optional)
                            </Label>
                            <Textarea
                                id='note'
                                value={note || member?.mute?.note || ''}
                                onChange={(e) => setNote(e.target.value)}
                                className='h-24 resize-none note'
                                placeholder='Add your note here...'
                            />
                        </div>

                        <div className='grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-border'>
                            <Button
                                variant='outline'
                                onClick={close}
                                disabled={isUpdating}
                                className='w-full text-base button delete'
                            >
                                Cancel
                            </Button>
                            <Button
                                variant='default'
                                onClick={handleSave}
                                disabled={isUpdating}
                                className='w-full text-base button primary'
                            >
                                {isUpdating ? (
                                    <Loader2 className='h-4 w-4 animate-spin mr-2' />
                                ) : null}
                                {isUpdating ? 'Saving...' : 'Save'}
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default MuteOption;
