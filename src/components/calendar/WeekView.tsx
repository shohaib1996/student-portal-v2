'use client';

import { useState } from 'react';
import { addDays, format, isToday, startOfWeek, isSameDay } from 'date-fns';

import { cn } from '@/lib/utils';

interface WeekViewProps {
    currentDate: Date;
    hoursView: string;
}

interface CalendarEvent {
    id: string;
    title: string;
    date: Date;
    startHour: number;
    startMinute: number;
    endHour: number;
    endMinute: number;
    color: string;
}

export function WeekView({ currentDate, hoursView }: WeekViewProps) {
    // Sample events - in a real app, these would come from a database or API
    const [events] = useState<CalendarEvent[]>([
        {
            id: '1',
            title: 'First Phase Interview',
            date: addDays(startOfWeek(currentDate), 1), // Tuesday
            startHour: 9,
            startMinute: 0,
            endHour: 10,
            endMinute: 0,
            color: 'bg-red-100 text-red-800 border-red-300',
        },
        {
            id: '2',
            title: 'First Phase Interview',
            date: addDays(startOfWeek(currentDate), 1), // Tuesday
            startHour: 7,
            startMinute: 0,
            endHour: 8,
            endMinute: 0,
            color: 'bg-red-100 text-red-800 border-red-300',
        },
        {
            id: '3',
            title: 'Warm Up Class',
            date: addDays(startOfWeek(currentDate), 1), // Tuesday
            startHour: 15,
            startMinute: 0,
            endHour: 16,
            endMinute: 0,
            color: 'bg-orange-100 text-orange-800 border-orange-300',
        },
        {
            id: '4',
            title: 'Warm Up Class',
            date: addDays(startOfWeek(currentDate), 2), // Wednesday
            startHour: 13,
            startMinute: 0,
            endHour: 14,
            endMinute: 0,
            color: 'bg-orange-100 text-orange-800 border-orange-300',
        },
        {
            id: '5',
            title: 'First Phase Interview',
            date: addDays(startOfWeek(currentDate), 2), // Wednesday
            startHour: 8,
            startMinute: 0,
            endHour: 9,
            endMinute: 0,
            color: 'bg-red-100 text-red-800 border-red-300',
        },
        {
            id: '6',
            title: 'First Phase Interview',
            date: addDays(startOfWeek(currentDate), 4), // Friday
            startHour: 9,
            startMinute: 0,
            endHour: 10,
            endMinute: 0,
            color: 'bg-red-100 text-red-800 border-red-300',
        },
        {
            id: '7',
            title: 'Bootcamp Hub Skills',
            date: addDays(startOfWeek(currentDate), 1), // Tuesday
            startHour: 10,
            startMinute: 0,
            endHour: 11,
            endMinute: 0,
            color: 'bg-red-100 text-red-800 border-red-300',
        },
        {
            id: '8',
            title: 'First Phase Interview',
            date: addDays(startOfWeek(currentDate), 5), // Saturday
            startHour: 8,
            startMinute: 0,
            endHour: 9,
            endMinute: 0,
            color: 'bg-blue-100 text-blue-800 border-blue-300',
        },
    ]);

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
            (event) => isSameDay(event.date, day) && hour === event.startHour,
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
                                isToday(day) && 'bg-blue-50',
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
                                    isToday(day) && 'bg-blue-50/30',
                                )}
                                onClick={() => handleCellClick(day, hour)}
                            >
                                {getEventsForCell(day, hour).map((event) => (
                                    <div
                                        key={event.id}
                                        className={cn(
                                            'p-1 rounded text-sm border',
                                            event.color,
                                        )}
                                    >
                                        <div className='flex items-center gap-1'>
                                            <div className='w-2 h-2 rounded-full bg-current'></div>
                                            <div className='font-medium truncate'>
                                                {event.title}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}
