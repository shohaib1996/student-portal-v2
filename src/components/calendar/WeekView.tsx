'use client';

import { MouseEvent, useState } from 'react';
import {
    addDays,
    format,
    isToday,
    startOfWeek,
    isSameDay,
    endOfWeek,
} from 'date-fns';

import { cn } from '@/lib/utils';
import GlobalTooltip from '../global/GlobalTooltip';
import { TEvent } from '@/components/calendar/types/calendarTypes';
import dayjs from 'dayjs';
import GlobalDropdown from '../global/GlobalDropdown';
import { useGetMyEventsQuery } from '@/components/calendar/api/calendarApi';
import {
    EventPopoverTrigger,
    useEventPopover,
} from './CreateEvent/EventPopover';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setCurrentDate } from '@/components/calendar/reducer/calendarReducer';
import EventButton from './EventButton';

interface WeekViewProps {
    currentDate: Date;
    hoursView: string;
}

export function WeekView({ currentDate, hoursView }: WeekViewProps) {
    const { eventFilter, todoFilter, priorityFilter, rolesFilter, typeFilter } =
        useAppSelector((s) => s.calendar);

    const { data } = useGetMyEventsQuery({
        from: startOfWeek(currentDate).toISOString(),
        to: endOfWeek(currentDate).toISOString(),
        statuses: eventFilter,
        states: todoFilter,
        priorities: priorityFilter,
        roles: rolesFilter,
        type: typeFilter,
    });
    const dispatch = useAppDispatch();
    const { openPopover } = useEventPopover();
    const events: TEvent[] = (data?.events as TEvent[]) || [];
    const handleCellClick = (
        e: MouseEvent<HTMLDivElement>,
        day: Date,
        hour: number,
        i: number,
    ) => {
        const dateTime = dayjs(day).hour(hour).minute(0).second(0).toDate();
        dispatch(setCurrentDate(dateTime));
        openPopover(
            e.currentTarget.getBoundingClientRect(),
            i <= 3 ? 'right' : 'left',
        );
        // You can implement custom logic here, like opening a modal to add an event
    };

    // Generate week days
    const weekStart = startOfWeek(currentDate);
    const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    // Generate hours (0-23)
    const hours = Array.from({ length: 24 }, (_, i) => i);

    // Filter hours based on view preference
    const displayHours =
        hoursView === 'business hours'
            ? hours.filter((hour) => hour >= 8 && hour <= 18)
            : hours;

    // Get events for a specific day and hour
    const getEventsForCell = (day: Date, hour: number) => {
        return events.filter(
            (event) =>
                isSameDay(event.startTime, day) &&
                hour === dayjs(event.endTime).hour(),
        );
    };

    // Format the day header
    const formatDayHeader = (day: Date) => {
        const dayName = format(day, 'EEE').substring(0, 2);
        const dayNumber = format(day, 'd');
        return `${dayName} ${dayNumber}`;
    };

    return (
        <div className='flex-1 overflow-auto'>
            <div className='min-w-full'>
                {/* Day headers */}
                <div className='grid grid-cols-[60px_repeat(7,minmax(0,1fr))] border-b sticky top-0 bg-background z-10'>
                    <div className='p-2 text-center border-r'></div>
                    {days.map((day, index) => (
                        <div
                            key={index}
                            className={cn(
                                'p-2 text-center overflow-hidden border-r last:border-r-0',
                                isToday(day) && 'bg-primary-light',
                            )}
                        >
                            <div className='text-sm font-medium'>
                                {formatDayHeader(day)}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Hour rows */}
                {displayHours.map((hour) => (
                    <div
                        key={hour}
                        className='grid grid-cols-[60px_repeat(7,minmax(0,1fr))] border-b min-h-[60px]'
                    >
                        {/* Time column */}
                        <div className='p-2 text-right text-sm text-muted-foreground border-r'>
                            {hour === 0
                                ? '12 AM'
                                : hour < 12
                                  ? `${hour} AM`
                                  : hour === 12
                                    ? '12 PM'
                                    : `${hour - 12} PM`}
                        </div>

                        {/* Day columns */}
                        {days.map((day, dayIndex) => (
                            <div
                                key={dayIndex}
                                className={cn(
                                    'border-r w-full last:border-r-0 p-1 relative cursor-pointer',
                                    isToday(day) && 'bg-primary-light',
                                )}
                                onClick={(e) =>
                                    handleCellClick(e, day, hour, dayIndex)
                                }
                            >
                                <div
                                    onClick={(e) => e.stopPropagation()}
                                    className='mt-1 space-y-1 cursor-pointer'
                                >
                                    {getEventsForCell(day, hour)
                                        .slice(0, 3)
                                        .map((event) => (
                                            <EventButton
                                                key={event._id}
                                                event={event}
                                            />
                                        ))}
                                    {getEventsForCell(day, hour)?.length >
                                        3 && (
                                        <GlobalDropdown
                                            dropdownRender={
                                                <div className='space-y-1 bg-foreground p-2'>
                                                    {getEventsForCell(day, hour)
                                                        .slice(3)
                                                        .map((event) => (
                                                            <EventButton
                                                                key={event._id}
                                                                event={event}
                                                            />
                                                        ))}
                                                </div>
                                            }
                                        >
                                            <button className='h-4 text-sm font-semibold text-center w-full border-none text-primary-white'>
                                                +
                                                {getEventsForCell(day, hour)
                                                    .length - 3}{' '}
                                                more
                                            </button>
                                        </GlobalDropdown>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}
