'use client';
import { cn } from '@/lib/utils';
import { TEvent } from '@/types/calendar/calendarTypes';
import { useRouter } from 'next/navigation';
import React, { memo } from 'react';
import GlobalTooltip from '../global/GlobalTooltip';
import AcceptedIcon from '../svgs/calendar/AcceptedIcon';
import PendingIcon from '../svgs/calendar/PendingIcon';
import DeniedIcon from '../svgs/calendar/DeniedIcon';
import FinishedIcon from '../svgs/calendar/FinishedIcon';
import TodoIcon from '../svgs/calendar/TodoIcon';
import { useAppSelector } from '@/redux/hooks';

const EventButton = memo(({ event }: { event: TEvent }) => {
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
                router.push(`/calendar?detail=${event._id}`);
            }}
            key={event._id}
            className={cn(
                'w-full flex items-center gap-1 text-gray text-sm px-1 rounded-sm py-1 bg-foreground justify-start font-normal',
            )}
        >
            {}
            <p>
                {event.type === 'task' ? (
                    <TodoIcon />
                ) : (
                    renderStatus(myParticipantData?.responseStatus)
                )}
            </p>
            <GlobalTooltip tooltip={event?.title}>
                <h2 className='truncate'>{event?.title}</h2>
            </GlobalTooltip>
        </button>
    );
});

EventButton.displayName = 'EventButton';

export default EventButton;
