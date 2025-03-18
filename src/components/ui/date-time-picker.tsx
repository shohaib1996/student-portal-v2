'use client';

import * as React from 'react';
import { CalendarIcon, Clock } from 'lucide-react';
import { format } from 'date-fns';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface DateTimePickerProps {
    date: Date | null;
    setDate: (date: Date | null) => void;
    disabled?: (date: Date) => boolean;
    className?: string;
}

export function DateTimePicker({
    date,
    setDate,
    disabled,
    className,
}: DateTimePickerProps) {
    const [selectedTime, setSelectedTime] = React.useState<string | undefined>(
        date ? format(date, 'HH:mm') : undefined,
    );

    const handleDateChange = (selectedDate: Date | undefined) => {
        if (!selectedDate) {
            return;
        }

        const newDate = selectedDate;
        if (selectedTime) {
            const [hours, minutes] = selectedTime.split(':').map(Number);
            newDate.setHours(hours);
            newDate.setMinutes(minutes);
        }
        setDate(newDate);
    };

    const handleTimeChange = (time: string) => {
        setSelectedTime(time);
        if (date) {
            const newDate = new Date(date);
            const [hours, minutes] = time.split(':').map(Number);
            newDate.setHours(hours);
            newDate.setMinutes(minutes);
            setDate(newDate);
        }
    };

    // Generate time options in 30-minute intervals
    const timeOptions = React.useMemo(() => {
        const options = [];
        for (let i = 0; i < 24; i++) {
            for (let j = 0; j < 60; j += 30) {
                const hour = i.toString().padStart(2, '0');
                const minute = j.toString().padStart(2, '0');
                options.push(`${hour}:${minute}`);
            }
        }
        return options;
    }, []);

    return (
        <div className={cn('grid gap-2', className)}>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant={'outline'}
                        className={cn(
                            'w-full justify-start text-left font-normal',
                            !date && 'text-muted-foreground',
                        )}
                    >
                        <CalendarIcon className='mr-2 h-4 w-4' />
                        {date ? format(date, 'PPP') : <span>Pick a date</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className='w-auto p-0'>
                    <Calendar
                        mode='single'
                        selected={date || undefined}
                        onSelect={handleDateChange}
                        disabled={disabled}
                        initialFocus
                    />
                </PopoverContent>
            </Popover>
            <div className='flex items-center gap-2'>
                <Clock className='h-4 w-4 text-muted-foreground' />
                <Select value={selectedTime} onValueChange={handleTimeChange}>
                    <SelectTrigger className='w-full'>
                        <SelectValue placeholder='Select time' />
                    </SelectTrigger>
                    <SelectContent>
                        {timeOptions.map((time) => (
                            <SelectItem key={time} value={time}>
                                {format(
                                    new Date().setHours(
                                        Number.parseInt(time.split(':')[0]),
                                        Number.parseInt(time.split(':')[1]),
                                    ),
                                    'h:mm a',
                                )}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
