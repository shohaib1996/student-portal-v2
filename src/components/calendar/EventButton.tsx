'use client';
import { cn } from '@/lib/utils';
import { TEvent } from '@/components/calendar/types/calendarTypes';
import { useRouter } from 'next/navigation';
import React, { memo } from 'react';
import GlobalTooltip from '../global/GlobalTooltip';
import AcceptedIcon from './svgs/calendar/AcceptedIcon';
import PendingIcon from './svgs/calendar/PendingIcon';
import DeniedIcon from './svgs/calendar/DeniedIcon';
import FinishedIcon from './svgs/calendar/FinishedIcon';
import TodoIcon from './svgs/calendar/TodoIcon';
import { useAppSelector } from '@/redux/hooks';
import { Repeat } from 'lucide-react';
import InProgressIcon from './svgs/calendar/InProgressIcon';

const EventButton = memo(
    ({ event, className }: { event: TEvent; className?: string }) => {
        const { user } = useAppSelector((s) => s.auth);
        const renderStatus = (
            status?:
                | 'accepted'
                | 'needsAction'
                | 'denied'
                | 'canceled'
                | 'finished',
        ) => {
            switch (status) {
                case 'accepted':
                    return <AcceptedIcon />;
                case 'needsAction':
                    return <PendingIcon />;
                case 'denied':
                    return <DeniedIcon />;
                default:
                    return <FinishedIcon />;
            }
        };

        const router = useRouter();

        const myParticipantData = event.attendees?.find(
            (at) => at.user?._id === user?._id,
        );

        return (
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/calendar?detail=${event._id}`);
                }}
                key={event._id}
                className={cn(
                    'flex w-full max-w-48 items-center h-fit gap-1 text-gray text-sm px-1 rounded-sm py-1 bg-background justify-start font-normal',
                    className,
                )}
            >
                {}
                <p>
                    {event.type === 'task' ? (
                        <GlobalTooltip tooltip='Task'>
                            <TodoIcon />
                        </GlobalTooltip>
                    ) : (
                        renderStatus(myParticipantData?.responseStatus)
                    )}
                </p>
                <GlobalTooltip tooltip={event?.title}>
                    <h2 className='truncate'>{event?.title}</h2>
                </GlobalTooltip>
                {event.type === 'event' &&
                    (event.recurrence?.isRecurring || event.seriesId) && (
                        <GlobalTooltip tooltip='This is a recurring event'>
                            <Repeat className='ml-auto' size={14} />
                        </GlobalTooltip>
                    )}
                {event.type === 'task' && <InProgressIcon />}
            </button>
        );
    },
);

EventButton.displayName = 'EventButton';

export default EventButton;
