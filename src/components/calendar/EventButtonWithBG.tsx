import { cn } from '@/lib/utils';
import { TEvent } from '@/components/calendar/types/calendarTypes';
import dayjs from 'dayjs';
import React from 'react';

const EventButtonWithBG = ({ event }: { event: TEvent }) => {
    return (
        <div
            key={event._id}
            style={{
                borderColor: event.eventColor,
            }}
            className={cn(
                'p-2 w-full mb-1 rounded flex gap-2 relative border-l-4 bg-foreground text-xs',
                event.eventColor,
            )}
        >
            <div
                style={{
                    backgroundColor: event.eventColor,
                    opacity: 0.1,
                }}
                className='absolute size-full top-0 left-0 z-10'
            ></div>
            <div className='text-dark-gray text-[10px] whitespace-nowrap'>
                <p>{dayjs(event?.startTime).format('hh:mm A')}</p>
                <p>
                    {dayjs(event.endTime).diff(
                        dayjs(event.startTime),
                        'minutes',
                    )}{' '}
                    min
                </p>
            </div>
            <div className='font-medium truncate'>
                <p>{event.title}</p>
                <p>{event.organizer?.email}</p>
            </div>
            <div className='text-gray'></div>
        </div>
    );
};

export default EventButtonWithBG;
