import React, { Dispatch, SetStateAction } from 'react';
import GlobalModal from '../global/GlobalModal';
import { Button } from '../ui/button';
import { BookmarkCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DatePicker } from '../global/DatePicket';
import dayjs from 'dayjs';
import { TimePicker } from '../global/TimePicker';
import { Textarea } from '../ui/textarea';

export type TProposeTime = {
    start: string;
    end: string;
    reason: string;
};

type TProps = {
    open: boolean;
    setOpen: (_: boolean) => void;
    setProposeTime: Dispatch<SetStateAction<TProposeTime>>;
    onSubmit: () => void;
    proproseTime: TProposeTime;
};

const ProposeTimeModal = ({
    open,
    setOpen,
    onSubmit,
    proproseTime,
    setProposeTime,
}: TProps) => {
    return (
        <GlobalModal
            buttons={
                <div className='flex items-center gap-2'>
                    <Button
                        variant={'secondary'}
                        onClick={() => setOpen(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={() => onSubmit()}
                        icon={<BookmarkCheck size={18} />}
                    >
                        Save & Close
                    </Button>
                </div>
            }
            title='Propose new time'
            open={open}
            setOpen={setOpen}
        >
            <div>
                <div className={cn('mt-2 min-h-[calc(100%-20px)]')}>
                    <div className={cn('w-full')}>
                        {/* Date Picker */}
                        <p className='text-sm text-dark-gray pb-1'>
                            Date & Time
                        </p>
                        <div className='flex gap-3'>
                            <div className='flex-1 space-y-1'>
                                <div className='flex items-center gap-2'>
                                    <DatePicker
                                        className='bg-background min-h-8'
                                        value={dayjs(proproseTime.start)}
                                        onChange={(val) => {
                                            setProposeTime((prev) => ({
                                                ...prev,
                                                start: val?.toISOString() || '',
                                            }));
                                        }}
                                    />
                                    {/* Time Picker */}
                                    <TimePicker
                                        className='bg-background '
                                        value={
                                            proproseTime.start
                                                ? new Date(proproseTime?.start)
                                                : new Date()
                                        }
                                        onChange={(val) => {
                                            console.log(val);
                                            setProposeTime((prev) => ({
                                                ...prev,
                                                start: val?.toISOString() || '',
                                            }));
                                        }}
                                    />
                                </div>
                                <div className='flex items-center gap-2'>
                                    <DatePicker
                                        className='bg-background min-h-8'
                                        value={dayjs(proproseTime.end)}
                                        onChange={(val) =>
                                            setProposeTime((prev) => ({
                                                ...prev,
                                                end: val?.toISOString() || '',
                                            }))
                                        }
                                    />
                                    {/* Time Picker */}
                                    <TimePicker
                                        className='bg-background'
                                        value={
                                            proproseTime.end
                                                ? new Date(proproseTime?.end)
                                                : new Date()
                                        }
                                        onChange={(val) =>
                                            setProposeTime((prev) => ({
                                                ...prev,
                                                end: val?.toISOString() || '',
                                            }))
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                        <p className='text-sm text-dark-gray pb-1 mt-2'>
                            Reason
                        </p>
                        <div>
                            <Textarea
                                className='bg-background'
                                placeholder='Reason for proposingn new time'
                                value={proproseTime.reason}
                                onChange={(e) =>
                                    setProposeTime((prev) => ({
                                        ...prev,
                                        reason: e.target.value,
                                    }))
                                }
                            />
                        </div>
                    </div>
                </div>
            </div>
        </GlobalModal>
    );
};

export default ProposeTimeModal;
