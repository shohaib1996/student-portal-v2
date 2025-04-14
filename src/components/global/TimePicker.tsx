'use client';

import { useState, useRef, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface TimePickerProps {
    value: Date | null;
    onChange: (value: Date | null) => void;
    className?: string;
}

export function TimePicker({ value, onChange, className }: TimePickerProps) {
    // Initialize state based on the value prop
    const [hour, setHour] = useState<number>(() => {
        if (!value) {
            return 12;
        }
        const h = value.getHours();
        return h === 0 ? 12 : h > 12 ? h - 12 : h;
    });

    const [minute, setMinute] = useState<number>(() => {
        return value ? value.getMinutes() : 0;
    });

    const [period, setPeriod] = useState<'AM' | 'PM'>(() => {
        if (!value) {
            return 'AM';
        }
        const hours = value.getHours();
        return hours >= 12 ? 'PM' : 'AM';
    });

    const [isOpen, setIsOpen] = useState(false);

    const hourRef = useRef<HTMLDivElement>(null);
    const minuteRef = useRef<HTMLDivElement>(null);

    // Update state when value prop changes
    useEffect(() => {
        if (value) {
            const hours = value.getHours();
            const minutes = value.getMinutes();

            setHour(hours === 0 ? 12 : hours > 12 ? hours - 12 : hours);
            setMinute(minutes);
            setPeriod(hours >= 12 ? 'PM' : 'AM');
        }
    }, [value]);

    // Generate hours (1-12)
    const hours = Array.from({ length: 12 }, (_, i) => i + 1);

    // Generate minutes (00-59)
    const minutes = Array.from({ length: 60 }, (_, i) => i);

    // Format time for display
    const formattedTime = value
        ? `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${period}`
        : 'Select time';

    // Handle time selection
    const handleTimeSelect = (selectedHour: number, selectedMinute: number) => {
        const newDate = value || new Date();
        newDate.setHours(
            period === 'PM'
                ? selectedHour === 12
                    ? 12
                    : selectedHour + 12
                : selectedHour === 12
                  ? 0
                  : selectedHour,
            selectedMinute,
        );
        onChange(newDate);
        setIsOpen(false);
    };

    // Handle period change
    // Handle period change
    const handlePeriodChange = () => {
        const newPeriod = period === 'AM' ? 'PM' : 'AM';
        setPeriod(newPeriod);

        if (value) {
            const newDate = new Date(value);
            const currentHour = newDate.getHours();

            // Convert the current hour based on the new period without resetting to 12
            if (newPeriod === 'PM' && currentHour < 12) {
                newDate.setHours(currentHour + 12);
            } else if (newPeriod === 'AM' && currentHour >= 12) {
                newDate.setHours(currentHour - 12);
            }

            onChange(newDate);
        }
    };

    // Scroll to selected hour/minute when opened
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => {
                if (hourRef.current) {
                    const hourElement = hourRef.current.querySelector(
                        `[data-value="${hour}"]`,
                    );
                    if (hourElement) {
                        hourElement.scrollIntoView({
                            block: 'center',
                            behavior: 'auto',
                        });
                    }
                }

                if (minuteRef.current) {
                    const minuteElement = minuteRef.current.querySelector(
                        `[data-value="${minute}"]`,
                    );
                    if (minuteElement) {
                        minuteElement.scrollIntoView({
                            block: 'center',
                            behavior: 'auto',
                        });
                    }
                }
            }, 100);
        }
    }, [isOpen, hour, minute]);

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant='outline'
                    className={cn(
                        'w-full text-dark-gray justify-start text-left font-normal',
                        className,
                    )}
                >
                    <Clock className='mr-2 h-4 w-4' />
                    {formattedTime}
                </Button>
            </PopoverTrigger>
            <PopoverContent className='w-[240px] p-0 z-[9999]'>
                <div className='flex flex-col'>
                    <div className='flex justify-between items-center border-b p-1 px-2'>
                        <div className='text-sm font-medium'>Select Time</div>
                        <Button
                            variant='ghost'
                            size='sm'
                            onClick={handlePeriodChange}
                            className='h-8 text-xs font-medium'
                        >
                            {period}
                        </Button>
                    </div>

                    <div className='flex h-[200px] overflow-hidden'>
                        {/* Hours */}
                        <div
                            ref={hourRef}
                            className='flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-gray-300 border-r'
                        >
                            <div className='py-2'>
                                {hours.map((h) => (
                                    <div
                                        key={h}
                                        data-value={h}
                                        className={cn(
                                            'py-2 px-3 text-center cursor-pointer hover:bg-muted transition-colors',
                                            hour === h
                                                ? 'bg-primary/10 text-primary font-medium'
                                                : '',
                                        )}
                                        onClick={() => setHour(h)}
                                    >
                                        {h.toString().padStart(2, '0')}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Minutes */}
                        <div
                            ref={minuteRef}
                            className='flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-gray-300'
                        >
                            <div className='py-2'>
                                {minutes.map((m) => (
                                    <div
                                        key={m}
                                        data-value={m}
                                        className={cn(
                                            'py-2 px-3 text-center cursor-pointer hover:bg-muted transition-colors',
                                            minute === m
                                                ? 'bg-primary/10 text-primary font-medium'
                                                : '',
                                        )}
                                        onClick={() => setMinute(m)}
                                    >
                                        {m.toString().padStart(2, '0')}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className='border-t p-3 flex justify-end'>
                        <Button
                            size='sm'
                            onClick={() => handleTimeSelect(hour, minute)}
                        >
                            Done
                        </Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
