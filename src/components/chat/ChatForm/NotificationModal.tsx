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
import { DateTimePicker } from '@/components/ui/date-time-picker';
import { useAppDispatch } from '@/redux/hooks';
import { updateMyData } from '@/redux/features/chatReducer';

interface Notification {
    isOn?: boolean;
    dateUntil?: string;
}

interface Member {
    _id: string;
    notification?: Notification;
}

interface NotificationOptionModalProps {
    opened: boolean;
    close: () => void;
    chatId: string;
    member: Member | null;
    handleUpdateCallback?: (member: Member) => void;
}

const NotificationOptionModal: React.FC<NotificationOptionModalProps> = ({
    opened,
    close,
    chatId,
    member,
    handleUpdateCallback,
}) => {
    // Initial states
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [dateUntil, setDateUntil] = useState<Date | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Redux dispatch
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (!member?.notification?.isOn) {
            if (member) {
                const muteDate = member?.notification?.dateUntil
                    ? dayjs(member.notification.dateUntil)
                    : null;
                const now = dayjs();

                if (!member?.notification?.dateUntil) {
                    setSelectedOption(3);
                    setDateUntil(null);
                } else if (muteDate) {
                    const hourDifference = muteDate.diff(now, 'hour');
                    const dayDifference = muteDate.diff(now, 'day');

                    if (hourDifference <= 1) {
                        setSelectedOption(1);
                    } else if (dayDifference < 1) {
                        setSelectedOption(2);
                    } else {
                        setSelectedOption(4);
                        setDateUntil(muteDate.toDate());
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
            dateUntil: selectedOption === 4 ? dateUntil?.toISOString() : null,
            chat: chatId,
            actionType: member?.notification?.isOn ? 'mutenoti' : 'unmutenoti',
        };

        setIsUpdating(true);

        axios
            .post('/chat/member/update', data)
            .then((res) => {
                // Update the chat data with Redux
                dispatch(
                    updateMyData({
                        _id: chatId,
                        field: 'notification',
                        value: res.data?.member?.notification,
                    }),
                );

                if (handleUpdateCallback) {
                    handleUpdateCallback(res.data?.member);
                }

                setIsUpdating(false);
                toast.success('Notification settings updated successfully');
                setSelectedOption(null);
                setDateUntil(null);
                close();
            })
            .catch((err) => {
                setIsUpdating(false);
                toast.error(
                    err?.response?.data?.error ||
                        'Failed to update notification settings',
                );
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
                            Notification Options
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
                                Other members will not see that you muted this
                                chat. You will still be notified if you are
                                mentioned.
                            </p>
                            {!member?.notification?.isOn ? (
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
                                                        : member?.notification
                                                                ?.dateUntil
                                                          ? `Muted till ${dayjs(member.notification.dateUntil).format('MMM DD, YYYY')} at ${dayjs(
                                                                member
                                                                    .notification
                                                                    .dateUntil,
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
                                                        date={dateUntil}
                                                        setDate={setDateUntil}
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

export default NotificationOptionModal;
