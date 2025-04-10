'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CustomTimePickerProps {
    value: Date | null;
    onChange: (date: Date | null) => void;
    className?: string;
}

const CustomTimePicker: React.FC<CustomTimePickerProps> = ({
    value,
    onChange,
    className,
}) => {
    // All useState hooks first
    const [hours, setHours] = useState<number>(() => {
        if (!value) {
            return 12;
        }

        let h = value.getHours();
        if (h > 12) {
            h -= 12;
        } else if (h === 0) {
            h = 12;
        }

        return h;
    });

    const [minutes, setMinutes] = useState<number>(() =>
        value ? value.getMinutes() : 0,
    );

    const [ampm, setAmpm] = useState<'AM' | 'PM'>(() =>
        value ? (value.getHours() >= 12 ? 'PM' : 'AM') : 'PM',
    );

    // All useRef hooks next
    const hoursRef = useRef<HTMLDivElement>(null);
    const minutesRef = useRef<HTMLDivElement>(null);
    const ampmRef = useRef<HTMLDivElement>(null);
    const lastScrollTime = useRef<number>(0);

    // All useCallback hooks next
    const incrementHours = useCallback(() => {
        setHours((prev) => (prev === 12 ? 1 : prev + 1));
    }, []);

    const decrementHours = useCallback(() => {
        setHours((prev) => (prev === 1 ? 12 : prev - 1));
    }, []);

    const incrementMinutes = useCallback(() => {
        setMinutes((prev) => (prev === 59 ? 0 : prev + 1));
    }, []);

    const decrementMinutes = useCallback(() => {
        setMinutes((prev) => (prev === 0 ? 59 : prev - 1));
    }, []);

    const toggleAmPm = useCallback(() => {
        setAmpm((prev) => (prev === 'AM' ? 'PM' : 'AM'));
    }, []);

    const handleHoursScroll = useCallback(
        (e: WheelEvent) => {
            e.preventDefault();

            // Throttle scroll events
            const now = Date.now();
            if (now - lastScrollTime.current < 50) {
                return;
            }
            lastScrollTime.current = now;

            if (e.deltaY < 0) {
                incrementHours();
            } else {
                decrementHours();
            }
        },
        [incrementHours, decrementHours],
    );

    const handleMinutesScroll = useCallback(
        (e: WheelEvent) => {
            e.preventDefault();

            // Throttle scroll events
            const now = Date.now();
            if (now - lastScrollTime.current < 50) {
                return;
            }
            lastScrollTime.current = now;

            if (e.deltaY < 0) {
                incrementMinutes();
            } else {
                decrementMinutes();
            }
        },
        [incrementMinutes, decrementMinutes],
    );

    const handleAmPmScroll = useCallback(
        (e: WheelEvent) => {
            e.preventDefault();

            // Throttle scroll events
            const now = Date.now();
            if (now - lastScrollTime.current < 50) {
                return;
            }
            lastScrollTime.current = now;

            toggleAmPm();
        },
        [toggleAmPm],
    );

    const updateTimeValue = useCallback(() => {
        const newDate = new Date();
        let hoursValue = hours;

        // Convert 12-hour to 24-hour format for the Date object
        if (ampm === 'PM' && hours < 12) {
            hoursValue = hours + 12;
        } else if (ampm === 'AM' && hours === 12) {
            hoursValue = 0;
        }

        newDate.setHours(hoursValue, minutes, 0, 0);
        onChange(newDate);
    }, [hours, minutes, ampm, onChange]);

    // All useEffect hooks last
    // Update the time when any of the values change
    useEffect(() => {
        updateTimeValue();
    }, [updateTimeValue]);

    // Update from props when value changes externally
    useEffect(() => {
        if (value) {
            let h = value.getHours();
            const isPM = h >= 12;

            // Convert 24-hour format to 12-hour format
            if (h > 12) {
                h -= 12;
            } else if (h === 0) {
                h = 12;
            }

            setHours(h);
            setMinutes(value.getMinutes());
            setAmpm(isPM ? 'PM' : 'AM');
        }
    }, [value]);

    // Set up scroll event listeners
    useEffect(() => {
        const hoursElement = hoursRef.current;
        const minutesElement = minutesRef.current;
        const ampmElement = ampmRef.current;

        if (hoursElement) {
            hoursElement.addEventListener('wheel', handleHoursScroll, {
                passive: false,
            });
        }

        if (minutesElement) {
            minutesElement.addEventListener('wheel', handleMinutesScroll, {
                passive: false,
            });
        }

        if (ampmElement) {
            ampmElement.addEventListener('wheel', handleAmPmScroll, {
                passive: false,
            });
        }

        return () => {
            if (hoursElement) {
                hoursElement.removeEventListener('wheel', handleHoursScroll);
            }
            if (minutesElement) {
                minutesElement.removeEventListener(
                    'wheel',
                    handleMinutesScroll,
                );
            }
            if (ampmElement) {
                ampmElement.removeEventListener('wheel', handleAmPmScroll);
            }
        };
    }, [handleHoursScroll, handleMinutesScroll, handleAmPmScroll]);

    return (
        <div
            className={cn(
                'flex items-center p-2 gap-4 justify-center',
                className,
            )}
        >
            {/* Hours */}
            <div className='flex flex-col items-center bg-background rounded-xl'>
                <Button
                    variant='ghost'
                    size='sm'
                    className='p-1 h-8 w-8'
                    onClick={incrementHours}
                    type='button'
                >
                    <ChevronUp size={18} />
                </Button>
                <div
                    className='text-2xl font-semibold w-12 text-center cursor-pointer select-none bg-foreground mx-2 rounded-md'
                    ref={hoursRef}
                >
                    {hours.toString().padStart(2, '0')}
                </div>
                <Button
                    variant='ghost'
                    size='sm'
                    className='p-1 h-8 w-8'
                    onClick={decrementHours}
                    type='button'
                >
                    <ChevronDown size={18} />
                </Button>
            </div>

            <div className='text-2xl font-semibold mx-1'>:</div>

            {/* Minutes */}
            <div className='flex flex-col items-center bg-background rounded-xl'>
                <Button
                    variant='ghost'
                    size='sm'
                    className='p-1 h-8 w-8'
                    onClick={incrementMinutes}
                    type='button'
                >
                    <ChevronUp size={18} />
                </Button>
                <div
                    className='text-2xl font-semibold w-12 text-center cursor-pointer select-none bg-foreground mx-2 rounded-md'
                    ref={minutesRef}
                >
                    {minutes.toString().padStart(2, '0')}
                </div>
                <Button
                    variant='ghost'
                    size='sm'
                    className='p-1 h-8 w-8'
                    onClick={decrementMinutes}
                    type='button'
                >
                    <ChevronDown size={18} />
                </Button>
            </div>

            {/* AM/PM */}
            <div className='flex flex-col items-center ml-2 bg-background rounded-xl'>
                <Button
                    variant='ghost'
                    size='sm'
                    className='p-1 h-8 w-8'
                    onClick={toggleAmPm}
                    type='button'
                >
                    <ChevronUp size={18} />
                </Button>
                <div
                    className='text-lg font-semibold w-12 text-center cursor-pointer select-none bg-foreground mx-2 rounded-md'
                    ref={ampmRef}
                >
                    {ampm}
                </div>
                <Button
                    variant='ghost'
                    size='sm'
                    className='p-1 h-8 w-8'
                    onClick={toggleAmPm}
                    type='button'
                >
                    <ChevronDown size={18} />
                </Button>
            </div>
        </div>
    );
};

export default CustomTimePicker;
