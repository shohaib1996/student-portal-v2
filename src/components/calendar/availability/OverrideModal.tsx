'use client';

import React, { useState } from 'react';
import { Dayjs } from 'dayjs';
import { Plus, X } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import timesArray from '../helpers/times';
import { TInterval } from '@/components/calendar/types/calendarTypes';
import GlobalModal from '@/components/global/GlobalModal';

type TProps = {
    isOpen: boolean;
    handleClose: () => void;
    handleApply: ({
        dates,
        intervals,
    }: {
        dates: Dayjs[];
        intervals: TInterval[];
    }) => void;
};

export default function OverrideModal({
    isOpen,
    handleClose,
    handleApply,
}: TProps) {
    const [selected, setSelected] = useState<Date[]>([]);
    const [intervals, setIntervals] = useState<TInterval[]>([
        { from: '09:00', to: '17:00' },
    ]);

    const handleChange = ({
        key,
        value,
        index,
    }: {
        key: string;
        value: string;
        index: number;
    }) => {
        const arr = [...intervals];
        arr[index] = { ...arr[index], [key]: value };
        setIntervals(arr);
    };

    const handleAddInterval = () => {
        const arr = [...intervals, { from: '18:00', to: '19:00' }];
        setIntervals(arr);
    };

    const handleClearInterval = (index: number) => {
        const arr = [...intervals];
        arr.splice(index, 1);
        setIntervals(arr);
    };

    const handleSubmit = () => {
        handleApply({
            dates: selected as unknown as Dayjs[],
            intervals,
        });
        handleClose();
    };

    return (
        <GlobalModal
            open={isOpen}
            setOpen={handleClose}
            title='Date Specific Schedule'
            subTitle='Select the date(s) you want to assign specific hours'
            buttons={
                <div className='flex gap-2 items-center'>
                    <Button variant='secondary' onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={selected.length === 0}
                    >
                        Apply
                    </Button>
                </div>
            }
        >
            <div className='flex gap-2 pt-2'>
                <div className='flex justify-center mb-4'>
                    <Calendar
                        mode='multiple'
                        selected={selected}
                        onSelect={(date) => setSelected(date as Date[])}
                        className='rounded-md border w-full bg-background'
                    />
                </div>

                {selected?.length > 0 && (
                    <div className='space-y-2 bg-background w-full rounded-md border border-forground-border p-2'>
                        {intervals.map((interval, i) => (
                            <div
                                key={i}
                                className='flex items-center justify-between gap-2 rounded-md'
                            >
                                <div className='flex items-center gap-2 flex-grow'>
                                    <Select
                                        value={interval.from}
                                        onValueChange={(value) =>
                                            handleChange({
                                                key: 'from',
                                                value,
                                                index: i,
                                            })
                                        }
                                    >
                                        <SelectTrigger className='w-full bg-foreground'>
                                            <SelectValue placeholder='From' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {timesArray.map((time) => (
                                                <SelectItem
                                                    key={time.value}
                                                    value={time.value}
                                                >
                                                    {time.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <span>-</span>

                                    <Select
                                        value={interval.to}
                                        onValueChange={(value) =>
                                            handleChange({
                                                key: 'to',
                                                value,
                                                index: i,
                                            })
                                        }
                                    >
                                        <SelectTrigger className='w-full bg-foreground'>
                                            <SelectValue placeholder='To' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {timesArray.map((time) => (
                                                <SelectItem
                                                    key={time.value}
                                                    value={time.value}
                                                >
                                                    {time.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className='flex items-center gap-2'>
                                    <Button
                                        variant='danger_light'
                                        size='icon'
                                        onClick={() => handleClearInterval(i)}
                                    >
                                        <X className='h-4 w-4' />
                                    </Button>
                                    <Button
                                        variant='primary_light'
                                        size='icon'
                                        onClick={handleAddInterval}
                                    >
                                        <Plus className='h-4 w-4' />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </GlobalModal>
    );
}
