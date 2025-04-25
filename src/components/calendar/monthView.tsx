'use client';

import {
    addDays,
    format,
    getDay,
    isBefore,
    isToday,
    startOfDay,
    startOfMonth,
    subDays,
} from 'date-fns';

import { cn } from '@/lib/utils';
import { useGetMyEventsQuery } from '@/components/calendar/api/calendarApi';
import { TEvent } from '@/components/calendar/types/calendarTypes';

import GlobalDropdown from '../global/GlobalDropdown';
import { useMediaQuery } from 'react-responsive';
import { EventPopoverTrigger } from './CreateEvent/EventPopover';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setCurrentDate } from '@/components/calendar/reducer/calendarReducer';
import EventButton from './EventButton';
import { useCallback } from 'react';
import Fuse from 'fuse.js';
import { toast } from 'sonner';

interface MonthViewProps {
    currentDate: Date;
}

export function MonthView({ currentDate }: MonthViewProps) {
    // Generate calendar days
    const monthStart = startOfMonth(currentDate);
    const startDate = subDays(monthStart, getDay(monthStart));
    const days: Date[] = [];
    let day = startDate;
    const dispatch = useAppDispatch();

    // Create 6 weeks (42 days) to ensure we have enough rows for any month
    for (let i = 0; i < 42; i++) {
        days.push(day);
        day = addDays(day, 1);
    }

    const {
        eventFilter,
        todoFilter,
        priorityFilter,
        rolesFilter,
        typeFilter,
        query,
    } = useAppSelector((s) => s.calendar);

    const { data } = useGetMyEventsQuery({
        from: days[0]?.toISOString(),
        to: days[41]?.toISOString(),
        statuses: eventFilter,
        states: todoFilter,
        priorities: priorityFilter,
        roles: rolesFilter,
        type: typeFilter,
    });

    const handleDayClick = (day: Date) => {
        dispatch(setCurrentDate(day));
    };

    const events: TEvent[] = (data?.events as TEvent[]) || [];

    const searchedEvents = useCallback(() => {
        if (!query) {
            return events;
        } else {
            const fuse = new Fuse(events, {
                keys: ['title', 'organizer.fullName', 'priority'],
                threshold: 0.3,
            });
            const results = fuse.search(query);
            return results.map((result) => result.item);
        }
    }, [query, events]);

    // Get events for a specific day
    const getEventsForDay = (day: Date) => {
        return searchedEvents().filter(
            (event) =>
                format(new Date(event?.startTime), 'yyyy-MM-dd') ===
                format(day, 'yyyy-MM-dd'),
        );
    };

    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const validIndexes = [
        0, 1, 2, 7, 8, 9, 14, 15, 16, 21, 22, 23, 28, 29, 30, 35, 36, 37,
    ];

    const isMobile = useMediaQuery({
        query: '(max-width: 1024px)',
    });

    return (
        <div className='flex-1 flex flex-col border border-t-0 border-forground-border'>
            <div className='grid grid-cols-7 border-b'>
                {weekdays.map((day) => (
                    <div
                        key={day}
                        className='p-2 sm:text-base text-sm font-medium border-r border-forground-border text-muted-foreground'
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
                                    'lg:min-h-[190px] min-h-[120px] cursor-pointer p-1 border-r border-forground-border border-b',
                                    !isCurrentMonth && 'bg-muted/30',
                                )}
                                onClick={(e) => {
                                    if (isBefore(day, startOfDay(new Date()))) {
                                        toast.warning(
                                            'Please select a future date',
                                        );
                                        e.stopPropagation();
                                        return;
                                    }
                                    handleDayClick(day);
                                }}
                            >
                                <div className='flex justify-between items-start'>
                                    <span
                                        className={cn(
                                            'inline-flex h-6 w-6 text-dark-gray font-semibold items-center justify-center rounded-full sm:text-base  text-sm',
                                            isToday(day) &&
                                                'bg-primary text-pure-white font-medium',
                                            !isCurrentMonth &&
                                                'text-gray font-medium',
                                        )}
                                    >
                                        {format(day, 'd')}
                                    </span>
                                </div>
                                <div
                                    onClick={(e) => e.stopPropagation()}
                                    className='mt-1 space-y-1 max-h-[80px]'
                                >
                                    {dayEvents
                                        .slice(0, isMobile ? 2 : 4)
                                        .map((event) => (
                                            <EventButton
                                                key={event._id}
                                                event={event}
                                            />
                                        ))}
                                    {dayEvents?.length > (isMobile ? 2 : 4) && (
                                        <GlobalDropdown
                                            className='max-w-48'
                                            dropdownRender={
                                                <div className='space-y-1 bg-foreground p-2'>
                                                    {dayEvents
                                                        .slice(isMobile ? 2 : 4)
                                                        .map((event) => (
                                                            <EventButton
                                                                className='max-w-full'
                                                                key={event._id}
                                                                event={event}
                                                            />
                                                        ))}
                                                </div>
                                            }
                                        >
                                            <button className='h-4 md:text-sm text-xs font-semibold text-center w-full border-none text-primary-white'>
                                                +
                                                {dayEvents.length -
                                                    (isMobile ? 2 : 4)}{' '}
                                                more
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
