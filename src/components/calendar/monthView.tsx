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
import { useGetMyEventsQuery } from '@/redux/api/calendar/calendarApi';
import { TEvent } from '@/types/calendar/calendarTypes';

import staticEvents from '../../../public/calendarData.json';
import GlobalDropdown from '../global/GlobalDropdown';
import { Button } from '../ui/button';
import AcceptedIcon from '../svgs/calendar/AcceptedIcon';
import PendingIcon from '../svgs/calendar/PendingIcon';
import DeniedIcon from '../svgs/calendar/DeniedIcon';
import GlobalTooltip from '../global/GlobalTooltip';
import FinishedIcon from '../svgs/calendar/FinishedIcon';
import { EventPopover, EventPopoverTrigger, useEventPopover } from './CreateEvent/EventPopover';
import { useRouter } from 'next/navigation';

interface MonthViewProps {
    currentDate: Date;
}

export const renderStatus = (
    status: 'accepted' | 'pending' | 'denied' | 'canceled' | 'finished',
) => {
    switch (status) {
        case 'accepted':
            return <AcceptedIcon />;
        case 'pending':
            return <PendingIcon />;
        case 'denied':
            return <DeniedIcon />;
        default:
            return <FinishedIcon />;
    }
};

export function MonthView({ currentDate }: MonthViewProps) {
    // Generate calendar days
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = subDays(monthStart, getDay(monthStart));
    const { isOpen, openPopover } = useEventPopover()
    const days = [];
    let day = startDate;
    const router = useRouter()

    const { data } = useGetMyEventsQuery({
        queryDate: {
            from: monthStart.toISOString(),
            to: monthEnd.toISOString(),
        },
    });

    console.log(data)

    const handleDayClick = (day: Date) => {
        console.log('Day clicked:', format(day, 'yyyy-MM-dd'));
        // You can implement custom logic here, like opening a modal to add an event
    };

    const events: TEvent[] = (data?.events as TEvent[]) || [];

    // Create 6 weeks (42 days) to ensure we have enough rows for any month
    for (let i = 0; i < 42; i++) {
        days.push(day);
        day = addDays(day, 1);
    }

    // Get events for a specific day
    const getEventsForDay = (day: Date) => {
        return events.filter(
            (event) =>
                format(new Date(event?.startTime), 'yyyy-MM-dd') ===
                format(day, 'yyyy-MM-dd'),
        );
    };

    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const dayPopup = (day: Date) => {
        return <div className='h-[400px]'>hello</div>;
    };

    const validIndexes = [
        0, 1, 2, 7, 8, 9, 14, 15, 16, 21, 22, 23, 28, 29, 30, 35, 36, 37,
    ];

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
                        <EventPopoverTrigger
                            key={index}
                            side={
                                validIndexes.includes(index) ? 'right' : 'left'
                            }
                        >
                            <div
                                key={index}
                                className={cn(
                                    'min-h-[190px] cursor-pointer p-1 border-r border-forground-border border-b',
                                    !isCurrentMonth && 'bg-muted/30',
                                )}
                                onClick={() => handleDayClick(day)}
                            >
                                <div className='flex justify-between items-start'>
                                    <span
                                        className={cn(
                                            'inline-flex h-6 w-6 text-dark-gray font-semibold items-center justify-center rounded-full text-base',
                                            isToday(day) &&
                                            'bg-primary text-primary-foreground font-medium',
                                            !isCurrentMonth &&
                                            'text-gray font-medium',
                                        )}
                                    >
                                        {format(day, 'd')}
                                    </span>
                                </div>
                                <div
                                    // onClick={(e) => e.stopPropagation()}
                                    className='mt-1 space-y-1 max-h-[80px]'
                                >
                                    {dayEvents.slice(0, 4).map((event) => (
                                        <button
                                            onClick={() => {
                                                // openPopover(true)
                                                router.push(`/calendar?detail=${event._id}`)
                                            }}
                                            key={event._id}
                                            className={cn(
                                                'w-full flex items-center gap-1 text-gray text-sm px-1 rounded-sm py-1 bg-foreground justify-start font-normal',
                                            )}
                                        >
                                            { }
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
                                    {dayEvents?.length > 4 && (
                                        <GlobalDropdown
                                            dropdownRender={
                                                <div className='space-y-1 bg-foreground p-2'>
                                                    {dayEvents
                                                        .slice(4)
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
                                                +{dayEvents.length - 4} more
                                            </button>
                                        </GlobalDropdown>
                                    )}
                                </div>
                            </div>
                        </EventPopoverTrigger>
                    );
                })}
            </div>
        </div>
    );
}
