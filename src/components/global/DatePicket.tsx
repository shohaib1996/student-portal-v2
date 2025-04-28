'use client';

import * as React from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar, CalendarProps } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon, XIcon } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../ui/select';
import { format } from 'date-fns';

interface DatePickerDemoProps {
    value?: Dayjs | string | null;
    onChange?: (_: Dayjs | undefined) => void;
    className?: string;
    placeholder?: string;
    disabled?: boolean;
    bordered?: boolean;
    disableFuture?: boolean;
    allowDeselect?: boolean;
    calendarClassName?: string;
    yearSelection?: boolean;
    readOnly?: boolean;
    disabledDate?: (date: Date) => boolean;
}

export function DatePicker({
    value,
    onChange,
    className,
    placeholder = 'Pick a date',
    disabled = false,
    allowDeselect = true,
    bordered = false,
    disableFuture = false,
    yearSelection = false,
    calendarClassName,
    readOnly,
    disabledDate,
}: DatePickerDemoProps & CalendarProps) {
    const [date, setDate] = React.useState<Dayjs | undefined>(
        value ? dayjs(value) : dayjs(),
    );
    const [open, setOpen] = React.useState(false);

    // Add a new state to manage the calendar view month/year
    const [calendarDate, setCalendarDate] = React.useState<Date | undefined>(
        date ? date.toDate() : new Date(),
    );

    const handleDateSelect = (newDate: Date | undefined) => {
        if (readOnly) {
            return;
        }
        const dayjsDate = newDate ? dayjs(newDate) : undefined;
        setDate(dayjsDate);
        onChange?.(dayjsDate);
        setOpen(false);
    };

    const setMonth = (month: number) => {
        if (readOnly) {
            return;
        }
        const newDate = date ? date.month(month) : dayjs().month(month);

        // Update the calendar view date
        const newCalendarDate = new Date(
            calendarDate
                ? calendarDate.getFullYear()
                : new Date().getFullYear(),
            month,
            1,
        );
        setCalendarDate(newCalendarDate);

        // Only update selected date if there was already a date
        if (date) {
            setDate(newDate);
            onChange?.(newDate);
        }
    };

    const setYear = (year: number) => {
        if (readOnly) {
            return;
        }
        const newDate = date ? date.year(year) : dayjs().year(year);

        // Update the calendar view date
        const newCalendarDate = new Date(
            year,
            calendarDate ? calendarDate.getMonth() : new Date().getMonth(),
            1,
        );
        setCalendarDate(newCalendarDate);

        // Only update selected date if there was already a date
        if (date) {
            setDate(newDate);
            onChange?.(newDate);
        }
    };

    const currentYear = new Date().getFullYear();
    const defaultYearRange = { start: currentYear - 100, end: currentYear + 5 };
    const effectiveYearRange = defaultYearRange;

    const years = React.useMemo(() => {
        const length = effectiveYearRange.end - effectiveYearRange.start + 1;
        return Array.from({ length }, (_, i) => effectiveYearRange.start + i);
    }, [effectiveYearRange]);

    React.useEffect(() => {
        if (value) {
            const newDate = dayjs(value);
            setDate(newDate);
            setCalendarDate(newDate.toDate());
        } else {
            setDate(undefined);
            // Don't reset calendar date when clearing selected date
        }
    }, [value]);

    const isDateDisabled = (date: Date) => {
        // First check the disableFuture setting
        if (disableFuture && dayjs(date).isAfter(dayjs(), 'day')) {
            return true;
        }

        // Then check the custom disabledDate function if provided
        if (disabledDate && disabledDate(date)) {
            return true;
        }

        return false;
    };

    const handleClearDate = (e: React.MouseEvent<HTMLDivElement>) => {
        if (readOnly) {
            return;
        }
        e.stopPropagation();
        onChange?.(undefined);
        setDate(undefined);
        // Keep the calendar at current view
    };

    // Get current month and year for the Select components
    const currentViewMonth = calendarDate
        ? calendarDate.getMonth()
        : date
          ? date.month()
          : new Date().getMonth();
    const currentViewYear = calendarDate
        ? calendarDate.getFullYear()
        : date
          ? date.year()
          : new Date().getFullYear();

    const handleOpenChange = (newOpen: boolean) => {
        if (!readOnly) {
            setOpen(newOpen);
        }
    };

    return (
        <Popover open={open} onOpenChange={handleOpenChange}>
            <PopoverTrigger asChild className='border-forground-border'>
                <Button
                    variant={'plain'}
                    className={cn(
                        `relative min-h-10 w-full justify-start bg-background-foreground text-left text-sm font-normal text-gray`,
                        !date && 'text-muted-foreground',
                        readOnly && 'opacity-80 cursor-default',
                        className,
                    )}
                    onClick={(e) => {
                        if (readOnly) {
                            e.preventDefault();
                        }
                    }}
                    disabled={disabled}
                >
                    <CalendarIcon className='size-4 text-gray' />
                    {date ? (
                        date.format('MMM D, YYYY')
                    ) : (
                        <span className='text-gray'>{placeholder}</span>
                    )}

                    {date && !readOnly && allowDeselect && (
                        <div
                            onClick={handleClearDate}
                            className='absolute right-2 bg-transparent'
                        >
                            <XIcon size={18} />
                        </div>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className={`w-auto z-[999] border border-forground-border bg-foreground p-0 ${calendarClassName}`}
                align='start'
            >
                {yearSelection && (
                    <div className='flex justify-between p-2'>
                        <Select
                            value={String(currentViewMonth)}
                            onValueChange={(value) => {
                                setMonth(Number(value));
                            }}
                        >
                            <SelectTrigger className='h-8 w-[110px]'>
                                <SelectValue placeholder='Month' />
                            </SelectTrigger>
                            <SelectContent>
                                {Array.from({ length: 12 }, (_, i) => (
                                    <SelectItem key={i} value={i.toString()}>
                                        {format(new Date(0, i), 'MMMM')}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select
                            value={String(currentViewYear)}
                            onValueChange={(value) => {
                                setYear(Number(value));
                            }}
                        >
                            <SelectTrigger className='h-8 w-[80px]'>
                                <SelectValue placeholder='Year' />
                            </SelectTrigger>
                            <SelectContent className='max-h-[200px]'>
                                {years.map((year) => (
                                    <SelectItem
                                        key={year}
                                        value={year.toString()}
                                    >
                                        {year}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}
                <Calendar
                    className='bg-background rounded-md'
                    mode='single'
                    selected={date ? date?.toDate() : undefined}
                    onSelect={handleDateSelect}
                    initialFocus
                    month={calendarDate}
                    onMonthChange={setCalendarDate}
                    disabled={(date) => disabled || isDateDisabled(date)}
                />
            </PopoverContent>
        </Popover>
    );
}
