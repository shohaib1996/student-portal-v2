'use client';

import { MouseEvent, useState } from 'react';
import { format, isToday } from 'date-fns';

import { cn } from '@/lib/utils';
import dayjs, { Dayjs } from 'dayjs';
import { toast } from 'sonner';
import { TEvent } from '@/components/calendar/types/calendarTypes';
import { useGetMyEventsQuery } from '@/components/calendar/api/calendarApi';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { useEventPopover } from './CreateEvent/EventPopover';
import { setCurrentDate } from '@/components/calendar/reducer/calendarReducer';
import EventButton from './EventButton';
import EventButtonWithBG from './EventButtonWithBG';
interface DayViewProps {
    currentDate: Date;
    onModal?: boolean;
    onChange?: (_: Dayjs) => void;
}

export function DayView({ currentDate, onChange, onModal }: DayViewProps) {
    const { eventFilter, todoFilter, priorityFilter, rolesFilter, typeFilter } =
        useAppSelector((s) => s.calendar);
    const { data } = useGetMyEventsQuery({
        from: dayjs(currentDate).startOf('day').toISOString(), // Start of the day (00:00:00)
        to: dayjs(currentDate).endOf('day').toISOString(), // End of the day (23:59:59.999)
        statuses: eventFilter,
        states: todoFilter,
        priorities: priorityFilter,
        roles: rolesFilter,
        type: typeFilter,
    });

    const events: TEvent[] = (data?.events as TEvent[]) || [];
    const dispatch = useAppDispatch();
    const { openPopover } = useEventPopover();

    const handleHourClick = (e: MouseEvent<HTMLDivElement>, hour: number) => {
        // You can implement custom logic here, like opening a modal to add an event
        const date = dayjs(currentDate);
        const updatedDate = date.hour(hour).minute(0).second(0).millisecond(0);
        if (dayjs(updatedDate).isBefore(dayjs(), 'minute')) {
            return toast.warning('Please select future date and time');
        }

        console.log(onModal, date);

        const dateTime = dayjs(currentDate)
            .hour(hour)
            .minute(0)
            .second(0)
            .toDate();
        if (onModal) {
            onChange?.(updatedDate);
        } else {
            dispatch(setCurrentDate(dateTime));
            openPopover(e.currentTarget.getBoundingClientRect(), 'bottom');
        }
    };

    // Generate hours (0-23)
    const hours = Array.from({ length: 24 }, (_, i) => i);

    // Get events for a specific hour
    const getEventsForHour = (hour: number) => {
        // Create a dayjs object for the current date
        const current = dayjs(currentDate);

        return events.filter((event) => {
            // Parse the event start date
            const eventTime = dayjs(event.startTime);

            // Check if the event is on the same date as currentDate
            const sameDate = eventTime.isSame(current, 'day');

            // Check if the event is at the specified hour
            const sameHour = eventTime.hour() === hour;

            // Return true if both conditions are met
            return sameDate && sameHour;
        });
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
                            'flex border-b cursor-pointer min-h-[60px] w-full',
                            isToday(currentDate) &&
                                hour === currentHour &&
                                'bg-muted/20',
                        )}
                        onClick={(e) => handleHourClick(e, hour)}
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
                        <div
                            // onClick={(e) => e.stopPropagation()}
                            className={cn('mt-1 flex w-full flex-wrap gap-2', {
                                'flex-col': onModal,
                            })}
                        >
                            {getEventsForHour(hour).map((event) =>
                                onModal ? (
                                    <EventButtonWithBG
                                        key={event._id}
                                        event={event}
                                    />
                                ) : (
                                    <EventButton
                                        key={event._id}
                                        event={event}
                                    />
                                ),
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// {
//     hour === event.startHour && (
//         <>
//             <div className='font-medium'>
//                 {event.title}
//             </div>
//             <div className='text-xs'>
//                 {event.startHour === 0
//                     ? '12 AM'
//                     : event.startHour < 12
//                         ? `${event.startHour} AM`
//                         : event.startHour === 12
//                             ? '12 PM'
//                             : `${event.startHour - 12} PM`}{' '}
//                 -
//                 {event.endHour === 0
//                     ? '12 AM'
//                     : event.endHour < 12
//                         ? `${event.endHour} AM`
//                         : event.endHour === 12
//                             ? '12 PM'
//                             : `${event.endHour - 12} PM`}
//             </div>
//         </>
//     )
// }
