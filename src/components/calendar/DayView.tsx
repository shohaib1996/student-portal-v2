'use client';

import { useState } from 'react';
import { format, isToday } from 'date-fns';

import { cn } from '@/lib/utils';
import dayjs, { Dayjs } from 'dayjs';
import { toast } from 'sonner';
import GlobalTooltip from '../global/GlobalTooltip';
import { renderStatus } from './monthView';

import { TEvent } from '@/types/calendar/calendarTypes';

const staticEvents = '/calendarData.json';

interface DayViewProps {
    currentDate: Date;
    onChange?: (_: Dayjs) => void;
}

export function DayView({ currentDate, onChange }: DayViewProps) {
    const events: TEvent[] = (staticEvents as unknown as TEvent[]) || [];

    const handleHourClick = (hour: number) => {
        console.log('Hour clicked:', hour);
        // You can implement custom logic here, like opening a modal to add an event
        const date = dayjs(currentDate);
        const updatedDate = date.hour(hour).minute(0).second(0).millisecond(0);
        if (dayjs(updatedDate).isBefore(dayjs(), 'minute')) {
            return toast.warning('Please select future date and time');
        }
        onChange?.(updatedDate);
    };

    // Generate hours (0-23)
    const hours = Array.from({ length: 24 }, (_, i) => i);

    // Get events for a specific hour
    const getEventsForHour = (hour: number) => {
        // Create a dayjs object for the current date
        const current = dayjs(currentDate);

        return events.filter((event) => {
            // Parse the event start date
            const eventTime = dayjs(event.start);

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
                        <div
                            onClick={(e) => e.stopPropagation()}
                            className='mt-1 flex flex-wrap gap-2'
                        >
                            {getEventsForHour(hour).map((event) => (
                                <button
                                    key={event._id}
                                    className={cn(
                                        'w-fit h-fit flex items-center gap-1 text-gray text-sm px-1 rounded-sm py-1 bg-foreground justify-start font-normal',
                                    )}
                                >
                                    {}
                                    <p>
                                        {renderStatus(
                                            event?.myParticipantData?.status,
                                        )}
                                    </p>
                                    <GlobalTooltip tooltip={event?.title}>
                                        <h2 className='truncate'>
                                            {event?.title}
                                        </h2>
                                    </GlobalTooltip>
                                </button>
                            ))}
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
