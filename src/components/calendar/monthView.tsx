'use client';

import { useState } from 'react';
import {
    addDays,
    endOfMonth,
    format,
    getDay,
    isToday,
    startOfMonth,
    subDays,
} from 'date-fns';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface MonthViewProps {
    currentDate: Date;
}

interface CalendarEvent {
    id: string;
    title: string;
    date: Date;
    color: string;
}

export function MonthView({ currentDate }: MonthViewProps) {
    // Sample events - in a real app, these would come from a database or API
    const [events] = useState<CalendarEvent[]>([
        {
            id: '1',
            title: 'Team Meeting',
            date: new Date(
                currentDate.getFullYear(),
                currentDate.getMonth(),
                10,
            ),
            color: 'bg-blue-500',
        },
        {
            id: '2',
            title: 'Product Launch',
            date: new Date(
                currentDate.getFullYear(),
                currentDate.getMonth(),
                15,
            ),
            color: 'bg-green-500',
        },
        {
            id: '3',
            title: 'Client Call',
            date: new Date(
                currentDate.getFullYear(),
                currentDate.getMonth(),
                20,
            ),
            color: 'bg-purple-500',
        },
    ]);

    const handleDayClick = (day: Date) => {
        console.log('Day clicked:', format(day, 'yyyy-MM-dd'));
        // You can implement custom logic here, like opening a modal to add an event
    };

    // Generate calendar days
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = subDays(monthStart, getDay(monthStart));
    const days = [];
    let day = startDate;

    // Create 6 weeks (42 days) to ensure we have enough rows for any month
    for (let i = 0; i < 42; i++) {
        days.push(day);
        day = addDays(day, 1);
    }

    // Get events for a specific day
    const getEventsForDay = (day: Date) => {
        return events.filter(
            (event) =>
                format(event.date, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd'),
        );
    };

    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className='flex-1 flex flex-col border border-t-0 border-forground-border'>
            <div className='grid grid-cols-7 border-b'>
                {weekdays.map((day) => (
                    <div
                        key={day}
                        className='p-2 font-medium border-r border-forground-border text-muted-foreground'
                    >
                        {day}
                    </div>
                ))}
            </div>
            <div className='flex-1 grid grid-cols-7 grid-rows-6'>
                {days.map((day, index) => {
                    const isCurrentMonth =
                        day.getMonth() === currentDate.getMonth();
                    const dayEvents = getEventsForDay(day);

                    return (
                        <div
                            key={index}
                            className={cn(
                                'min-h-[100px] p-1 border-r border-forground-border border-b',
                                !isCurrentMonth && 'bg-muted/30',
                            )}
                            onClick={() => handleDayClick(day)}
                        >
                            <div className='flex justify-between items-start'>
                                <span
                                    className={cn(
                                        'inline-flex h-6 w-6 items-center justify-center rounded-full text-sm',
                                        isToday(day) &&
                                            'bg-primary text-primary-foreground font-medium',
                                        !isCurrentMonth &&
                                            'text-muted-foreground',
                                    )}
                                >
                                    {format(day, 'd')}
                                </span>
                            </div>
                            <div className='mt-1 space-y-1 max-h-[80px] overflow-y-auto'>
                                {dayEvents.map((event) => (
                                    <Badge
                                        key={event.id}
                                        className={cn(
                                            'w-full justify-start font-normal',
                                            event.color,
                                        )}
                                    >
                                        {event.title}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
