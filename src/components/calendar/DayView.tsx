'use client';

import { useState } from 'react';
import { format, isToday } from 'date-fns';

import { cn } from '@/lib/utils';
import dayjs, { Dayjs } from 'dayjs';

interface DayViewProps {
    currentDate: Date;
    onChange?: (_: Dayjs) => void;
}

interface CalendarEvent {
    id: string;
    title: string;
    date: Date;
    startHour: number;
    endHour: number;
    color: string;
}

export function DayView({ currentDate, onChange }: DayViewProps) {
    // Sample events - in a real app, these would come from a database or API
    const [events] = useState<CalendarEvent[]>([
        {
            id: '1',
            title: 'Team Meeting',
            date: currentDate,
            startHour: 10,
            endHour: 11,
            color: 'bg-blue-500',
        },
        {
            id: '2',
            title: 'Lunch Break',
            date: currentDate,
            startHour: 12,
            endHour: 13,
            color: 'bg-green-500',
        },
        {
            id: '3',
            title: 'Client Call',
            date: currentDate,
            startHour: 15,
            endHour: 16,
            color: 'bg-purple-500',
        },
    ]);

    const handleHourClick = (hour: number) => {
        console.log('Hour clicked:', hour);
        // You can implement custom logic here, like opening a modal to add an event
        const date = dayjs(currentDate);
        const updatedDate = date.hour(hour).minute(0).second(0).millisecond(0);
        onChange?.(updatedDate);
    };

    // Generate hours (0-23)
    const hours = Array.from({ length: 24 }, (_, i) => i);

    // Get events for a specific hour
    const getEventsForHour = (hour: number) => {
        return events.filter(
            (event) =>
                format(event.date, 'yyyy-MM-dd') ===
                    format(currentDate, 'yyyy-MM-dd') &&
                hour >= event.startHour &&
                hour < event.endHour,
        );
    };

    // Get current hour
    const currentHour = new Date().getHours();

    return (
        <div className='flex-1 overflow-y-auto'>
            <div className='min-w-full'>
                {hours.map((hour) => (
                    <div
                        key={hour}
                        className={cn(
                            'flex border-b cursor-pointer min-h-[60px]',
                            isToday(currentDate) &&
                                hour === currentHour &&
                                'bg-muted/20',
                        )}
                        onClick={() => handleHourClick(hour)}
                    >
                        <div className='w-16 p-2 text-right text-sm text-muted-foreground border-r sticky left-0 bg-background'>
                            {hour === 0
                                ? '12 AM'
                                : hour < 12
                                  ? `${hour} AM`
                                  : hour === 12
                                    ? '12 PM'
                                    : `${hour - 12} PM`}
                        </div>
                        <div className='flex-1 p-1 relative'>
                            {getEventsForHour(hour).map((event) => (
                                <div
                                    key={event.id}
                                    className={cn(
                                        'p-2 rounded text-white text-sm absolute left-1 right-1',
                                        event.color,
                                        hour === event.startHour
                                            ? 'top-1'
                                            : 'top-0 border-t-0 rounded-t-none',
                                        hour === event.endHour - 1
                                            ? 'bottom-1'
                                            : 'bottom-0 border-b-0 rounded-b-none',
                                    )}
                                    style={{
                                        zIndex: 10,
                                    }}
                                >
                                    {hour === event.startHour && (
                                        <>
                                            <div className='font-medium'>
                                                {event.title}
                                            </div>
                                            <div className='text-xs'>
                                                {event.startHour === 0
                                                    ? '12 AM'
                                                    : event.startHour < 12
                                                      ? `${event.startHour} AM`
                                                      : event.startHour === 12
                                                        ? '12 PM'
                                                        : `${event.startHour - 12} PM`}{' '}
                                                -
                                                {event.endHour === 0
                                                    ? '12 AM'
                                                    : event.endHour < 12
                                                      ? `${event.endHour} AM`
                                                      : event.endHour === 12
                                                        ? '12 PM'
                                                        : `${event.endHour - 12} PM`}
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
