'use client';

import React, { useState } from 'react';
import { Plus, Minus, Copy } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../ui/select';
import { Switch } from '../ui/switch';
import { Button } from '../ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '../ui/dialog';
import { Checkbox } from '../ui/checkbox';
import { TInterval } from '../types/calendarTypes';
import timesArray from '../helpers/times';

export type TCopyTo = Record<string, boolean>;

type TProps = {
    intervals: TInterval[];
    updateIntervals: (interval: TInterval[]) => void;
    title: string;
    handleAppyCopyTo: ({
        intervals,
        copyTo,
    }: {
        intervals: TInterval[];
        copyTo: TCopyTo;
    }) => void;
};

export default function WeekDay({
    intervals,
    updateIntervals,
    title,
    handleAppyCopyTo,
}: TProps) {
    const [copyTo, setCopyTo] = useState<TCopyTo>({
        sunday: false,
        monday: false,
        tuesday: false,
        wednesday: false,
        thursday: false,
        friday: false,
        saturday: false,
    });

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
        updateIntervals(arr);
    };

    const handleSetIntervalsSwitch = (isChecked: boolean) => {
        if (isChecked) {
            updateIntervals([{ from: '09:00', to: '17:00' }]);
        } else {
            updateIntervals([]);
        }
    };

    const handleAddInterval = () => {
        const arr: TInterval[] = [...(intervals || [])];
        arr.push({ from: '18:00', to: '19:00' });
        updateIntervals(arr);
    };

    const handleClearInterval = (index: number) => {
        const arr = [...(intervals || [])];
        arr.splice(index, 1);
        updateIntervals(arr);
    };

    const handleChangeCopy = ({
        checked,
        key,
    }: {
        checked: boolean;
        key: string;
    }) => {
        setCopyTo((prev) => ({ ...prev, [key]: checked }));
    };

    return (
        <div className='flex items-center gap-4'>
            <div className='flex items-center gap-2'>
                <Switch
                    checked={intervals?.length !== 0}
                    onCheckedChange={handleSetIntervalsSwitch}
                />
                <span className='capitalize text-muted-foreground'>
                    {title}
                </span>
            </div>

            <div className='flex-grow space-y-2'>
                {intervals?.length > 0 ? (
                    intervals.map((interval, i) => (
                        <div
                            key={i}
                            className='flex items-center justify-between'
                        >
                            <div className='flex items-center gap-2'>
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
                                    <SelectTrigger className='w-[180px]'>
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

                                <span>to</span>

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
                                    <SelectTrigger className='w-[180px]'>
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
                                    variant='destructive'
                                    size='icon'
                                    onClick={() => handleClearInterval(i)}
                                >
                                    <Minus className='h-4 w-4' />
                                </Button>

                                {i === 0 && (
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button
                                                variant='outline'
                                                size='icon'
                                            >
                                                <Copy className='h-4 w-4' />
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>
                                                    Copy to Other Days
                                                </DialogTitle>
                                            </DialogHeader>
                                            <div className='space-y-4'>
                                                {Object.keys(copyTo).map(
                                                    (key) => (
                                                        <div
                                                            key={key}
                                                            className='flex items-center space-x-2'
                                                        >
                                                            <Checkbox
                                                                checked={
                                                                    copyTo[key]
                                                                }
                                                                onCheckedChange={(
                                                                    checked,
                                                                ) =>
                                                                    handleChangeCopy(
                                                                        {
                                                                            checked:
                                                                                !!checked,
                                                                            key,
                                                                        },
                                                                    )
                                                                }
                                                            />
                                                            <span className='capitalize'>
                                                                {key}
                                                            </span>
                                                        </div>
                                                    ),
                                                )}
                                                <DialogClose className='w-full'>
                                                    <Button
                                                        className='w-full'
                                                        onClick={() =>
                                                            handleAppyCopyTo({
                                                                intervals,
                                                                copyTo,
                                                            })
                                                        }
                                                    >
                                                        Apply
                                                    </Button>
                                                </DialogClose>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                )}

                                <Button
                                    variant='default'
                                    size='icon'
                                    onClick={handleAddInterval}
                                >
                                    <Plus className='h-4 w-4' />
                                </Button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className='flex items-center gap-2'>
                        <span className='text-muted-foreground'>
                            Unavailable
                        </span>
                        <Button
                            variant='default'
                            size='icon'
                            onClick={handleAddInterval}
                        >
                            <Plus className='h-4 w-4' />
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
