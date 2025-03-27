'use client';

import * as React from 'react';
import { addDays, format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { DateRange } from 'react-day-picker';

interface DateRangePickerProps {
    value: DateRange;
    onChange: (value: DateRange) => void;
    className?: string;
}

export function RangePickerCL({
    value,
    onChange,
    className,
}: DateRangePickerProps) {
    const [date, setDate] = React.useState<DateRange>(value);
    const [open, setOpen] = React.useState(false);

    // Update internal state when props change
    React.useEffect(() => {
        setDate(value);
    }, [value]);

    const handleApply = () => {
        onChange(date);
        setOpen(false);
    };

    return (
        <div className={cn('grid gap-2', className)}>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        id='date'
                        variant={'outline'}
                        className={cn(
                            'w-full bg-foreground justify-start text-left font-normal',
                            !date && 'text-muted-foreground',
                        )}
                    >
                        <CalendarIcon className='h-4 w-4' />
                        <p className='hidden md:block md:ml-2'>
                            {date?.from ? (
                                date.to ? (
                                    <>
                                        {format(date.from, 'LLL dd, y')} -{' '}
                                        {format(date.to, 'LLL dd, y')}
                                    </>
                                ) : (
                                    format(date.from, 'LLL dd, y')
                                )
                            ) : (
                                <span>Pick a date range</span>
                            )}
                        </p>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className='w-auto p-0' align='start'>
                    <div className='flex items-center justify-between px-3 py-2 border-b border-forground-border'>
                        <p className='text-base font-medium'>
                            Select Date Range
                        </p>
                        <Button className='h-9' onClick={handleApply}>
                            Apply
                        </Button>
                    </div>
                    <div className='flex max-w-[80vw] overflow-x-auto gap-2 p-3 pt-0'>
                        <div>
                            <div className='py-1 text-sm font-medium'>From</div>
                            <Calendar
                                mode='single'
                                className='bg-background rounded-md'
                                selected={date?.from}
                                onSelect={(day) =>
                                    setDate((prev) => ({
                                        from: day,
                                        to:
                                            prev?.to && day && prev.to < day
                                                ? day
                                                : prev?.to,
                                    }))
                                }
                                initialFocus
                            />
                        </div>
                        <div>
                            <div className='py-1 text-sm font-medium'>To</div>
                            <Calendar
                                mode='single'
                                className='bg-background rounded-md'
                                selected={date?.to}
                                onSelect={(day) =>
                                    setDate((prev) => ({
                                        from: prev?.from,
                                        to:
                                            day && prev?.from && day < prev.from
                                                ? prev.from
                                                : day,
                                    }))
                                }
                                disabled={(da) =>
                                    da <
                                    (date?.from
                                        ? addDays(date.from, 0)
                                        : new Date())
                                }
                                initialFocus
                            />
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
}
