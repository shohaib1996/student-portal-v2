'use client';

import { useState } from 'react';
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
import { renderStatus } from './monthView';
import { TEvent } from '@/types/calendar/calendarTypes';
import dayjs from 'dayjs';
import GlobalDropdown from '../global/GlobalDropdown';
import { useGetMyEventsQuery } from '@/redux/api/calendar/calendarApi';

interface WeekViewProps {
    currentDate: Date;
    hoursView: string;
}

export function WeekView({ currentDate, hoursView }: WeekViewProps) {
    const { data } = useGetMyEventsQuery({
        from: startOfWeek(currentDate).toISOString(), // Start of the day (00:00:00)
        to: endOfWeek(currentDate).toISOString(), // End of the day (23:59:59.999)
    });
    const events: TEvent[] = (data?.events as TEvent[]) || [];
    const handleCellClick = (day: Date, hour: number) => {
        console.log('Cell clicked:', format(day, 'yyyy-MM-dd'), hour);
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
                <div className='grid grid-cols-[60px_1fr_1fr_1fr_1fr_1fr_1fr_1fr] border-b sticky top-0 bg-background z-10'>
                    <div className='p-2 text-center border-r'></div>
                    {days.map((day, index) => (
                        <div
                            key={index}
                            className={cn(
                                'p-2 text-center border-r last:border-r-0',
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
                        className='grid grid-cols-[60px_1fr_1fr_1fr_1fr_1fr_1fr_1fr] border-b min-h-[60px]'
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
                                    'border-r last:border-r-0 p-1 relative',
                                    isToday(day) && 'bg-primary-light',
                                )}
                                onClick={() => handleCellClick(day, hour)}
                            >
                                <div
                                    onClick={(e) => e.stopPropagation()}
                                    className='mt-1 space-y-1 cursor-pointer'
                                >
                                    {getEventsForCell(day, hour)
                                        .slice(0, 3)
                                        .map((event) => (
                                            <button
                                                key={event._id}
                                                className={cn(
                                                    'w-full flex items-center gap-1 text-gray text-sm px-1 rounded-sm py-1 bg-foreground justify-start font-normal',
                                                )}
                                            >
                                                {}
                                                <p>
                                                    {renderStatus(
                                                        event?.myParticipantData
                                                            ?.status,
                                                    )}
                                                </p>
                                                <GlobalTooltip
                                                    tooltip={event?.title}
                                                >
                                                    <h2 className='truncate'>
                                                        {event?.title}
                                                    </h2>
                                                </GlobalTooltip>
                                            </button>
                                        ))}
                                    {getEventsForCell(day, hour)?.length >
                                        3 && (
                                        <GlobalDropdown
                                            dropdownRender={
                                                <div className='space-y-1 bg-foreground p-2'>
                                                    {getEventsForCell(day, hour)
                                                        .slice(3)
                                                        .map((event) => (
                                                            <button
                                                                key={event._id}
                                                                className={cn(
                                                                    'w-full flex items-center gap-1 text-gray text-sm px-1 rounded-sm py-1 bg-background justify-start font-normal',
                                                                )}
                                                            >
                                                                <p>
                                                                    {renderStatus(
                                                                        event
                                                                            ?.myParticipantData
                                                                            ?.status,
                                                                    )}
                                                                </p>
                                                                <p className='truncate'>
                                                                    {
                                                                        event?.title
                                                                    }
                                                                </p>
                                                            </button>
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
