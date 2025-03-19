'use client';

import * as React from 'react';
import { Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TimePickerProps {
    value: Date | null;
    onChange: (value: Date | null) => void;
    className?: string;
}

export function TimePicker({ value, onChange, className }: TimePickerProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const [period, setPeriod] = React.useState<'AM' | 'PM'>('AM');

    // Format time for display
    const formatTime = (date: Date | null) => {
        if (!date) {
            return '';
        }
        return new Intl.DateTimeFormat('en-US', {
            hour: 'numeric',
            minute: 'numeric',
            hour12: true,
        }).format(date);
    };

    // Create time options
    const hours = Array.from({ length: 12 }, (_, i) => i + 1);
    const minutes = Array.from({ length: 60 }, (_, i) =>
        i.toString().padStart(2, '0'),
    );

    // Handle time selection
    const handleTimeSelect = (hour: number, minute: string) => {
        const newDate = new Date();
        newDate.setHours(
            period === 'PM'
                ? hour === 12
                    ? 12
                    : hour + 12
                : hour === 12
                  ? 0
                  : hour,
            Number.parseInt(minute),
        );
        onChange(newDate);
        setIsOpen(false);
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant='secondary'
                    className={cn(
                        'w-full justify-start text-left font-normal',
                        !value && 'text-muted-foreground',
                        className,
                    )}
                >
                    <Clock className='mr-2 h-4 w-4' />
                    {value ? formatTime(value) : 'Select time'}
                </Button>
            </PopoverTrigger>
            <PopoverContent className='p-0' align='start'>
                <div className='space-y-2 p-2'>
                    <div className='font-medium text-dark-gray'>
                        Select Time
                    </div>
                    <div className='flex gap-2'>
                        <Select
                            onValueChange={(val: string) =>
                                setPeriod(val as 'AM' | 'PM')
                            }
                            value={period}
                        >
                            <SelectTrigger className='h-7 bg-foreground'>
                                <SelectValue placeholder='Select period' />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='AM'>AM</SelectItem>
                                <SelectItem value='PM'>PM</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <ScrollArea className='h-[200px] rounded-md border'>
                        <div className='grid grid-cols-4 gap-1 p-2 bg-foreground'>
                            {hours.map((hour) => (
                                <React.Fragment key={hour}>
                                    {minutes.map((minute) => (
                                        <Button
                                            key={`${hour}-${minute}`}
                                            variant='ghost'
                                            className='h-8 w-full text-xs'
                                            onClick={() =>
                                                handleTimeSelect(hour, minute)
                                            }
                                        >
                                            {`${hour}:${minute}`}
                                        </Button>
                                    ))}
                                </React.Fragment>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
                <div className='flex items-center justify-between p-2 pt-0'>
                    <div className='text-sm text-muted-foreground'>
                        Selected: {formatTime(value)}
                    </div>
                    <Button
                        size='sm'
                        onClick={() => {
                            onChange(null);
                            setIsOpen(false);
                        }}
                    >
                        Clear
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}
