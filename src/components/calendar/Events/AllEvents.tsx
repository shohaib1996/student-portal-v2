'use client';
import FilterModal from '@/components/global/FilterModal/FilterModal';
import GlobalHeader from '@/components/global/GlobalHeader';
import GlobalPagination from '@/components/global/GlobalPagination';
import AvailabilityIcon from '@/components/svgs/calendar/Availability';
import MyInvitationsIcon from '@/components/svgs/calendar/MyInvitationsIcon';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useGetMyEventsQuery } from '@/redux/api/calendar/calendarApi';
import { TEvent } from '@/types/calendar/calendarTypes';
import { endOfMonth, startOfMonth } from 'date-fns';
import { Bell, ChevronDown, Clock, Ellipsis, Plus } from 'lucide-react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import React, { useState } from 'react';
import EventDetails from '../EventDetails';
import {
    EventPopoverProvider,
    EventPopoverTrigger,
} from '../CreateEvent/EventPopover';
import CreateEventModal from '../CreateEvent/CreateEventModal';
import Link from 'next/link';

const AllEvents = () => {
    const [limit, setLimit] = useState(10);
    const monthStart = startOfMonth(new Date());
    const monthEnd = endOfMonth(new Date());

    const [currentPage, setCurrentPage] = useState<number>(1);
    const { data } = useGetMyEventsQuery({
        from: monthStart.toISOString(),
        to: monthEnd.toISOString(),
    });

    const events: TEvent[] = data?.events || [];

    const pathName = usePathname();
    const router = useRouter();

    return (
        <>
            <GlobalHeader
                title={
                    <div>
                        All Events{' '}
                        <span className='text-primary-white'>
                            (as an attendee)
                        </span>
                    </div>
                }
                subTitle='Plan, Organize, and Stay On Track with all events.'
                buttons={
                    <div className='flex gap-2'>
                        <Button
                            className='text-dark-gray fill-none stroke-none'
                            variant={'secondary'}
                            icon={<MyInvitationsIcon />}
                        >
                            <Link href={'/calendar/my-invitations'}>
                                My Invitaions
                            </Link>
                        </Button>
                        <Button
                            size={'icon'}
                            tooltip='My Availability'
                            className='text-dark-gray fill-none stroke-none'
                            icon={<AvailabilityIcon />}
                            variant={'secondary'}
                        ></Button>
                        <FilterModal
                            value={[]}
                            columns={[]}
                            onChange={() => null}
                        />
                        <EventPopoverTrigger>
                            <Button icon={<Plus size={18} />}>
                                Create New
                            </Button>
                        </EventPopoverTrigger>
                    </div>
                }
            />
            <div className='h-[calc(100vh-120px)] flex flex-col justify-between'>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mt-2'>
                    {events.map((event, i) => (
                        <div
                            key={event._id}
                            className='bg-foreground rounded-lg border border-border-primary-light overflow-hidden py-2 px-2.5'
                        >
                            {/* Card Header */}
                            <div
                                className='flex justify-between items-center cursor-pointer'
                                onClick={() =>
                                    router.push(
                                        `${pathName}?detail=${event._id}`,
                                    )
                                }
                            >
                                <h3 className='text-sm font-medium text-black'>
                                    {event.title}
                                </h3>
                                {/* <div className='flex items-center gap-1'>
                                <Ellipsis
                                    size={18}
                                    className='text-gray cursor-pointer'
                                />
                                <ChevronDown
                                    size={18}
                                    className='text-gray cursor-pointer'
                                />
                            </div> */}
                            </div>

                            {/* Divider */}
                            <Separator className='mt-1 mb-2' />

                            {/* Card Content */}
                            <div className='space-y-2'>
                                <div className='flex justify-between items-start'>
                                    <div className='flex items-center gap-1'>
                                        <Clock
                                            size={12}
                                            className='text-dark-gray'
                                        />
                                        <span className='text-dark-gray text-xs text-nowrap'>
                                            {/* Due: {event.date} at {event.time} */}
                                        </span>
                                    </div>
                                    <div className='flex flex-col items-end'>
                                        <div className='flex items-center gap-2'>
                                            <span className='text-dark-gray text-xs font-semibold'>
                                                Priority:
                                            </span>
                                            {event.priority === 'high' && (
                                                <span className='text-red-500 flex items-center gap-1 text-xs font-medium'>
                                                    <Image
                                                        src='/calendar/events/high.png'
                                                        alt='High Priority'
                                                        width={12}
                                                        height={12}
                                                    />
                                                    High
                                                </span>
                                            )}
                                            {event.priority === 'medium' && (
                                                <span className='text-amber-500 flex items-center gap-1 text-xs font-medium'>
                                                    <Image
                                                        src='/calendar/events/medium.png'
                                                        alt='Medium Priority'
                                                        width={12}
                                                        height={12}
                                                    />
                                                    Medium
                                                </span>
                                            )}
                                            {event.priority === 'low' && (
                                                <span className='text-green-500 flex items-center gap-1 text-xs font-medium'>
                                                    <Image
                                                        src='/calendar/events/low.png'
                                                        alt='Low Priority'
                                                        width={12}
                                                        height={12}
                                                    />
                                                    Low
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className='flex justify-between items-start'>
                                    <div className='flex items-start gap-1'>
                                        <span className='text-dark-gray text-xs font-semibold'>
                                            Purpose:
                                        </span>
                                        {i % 3 === 0 ? (
                                            <a
                                                href='#'
                                                className='text-primary-white text-xs font-semibold underline'
                                            >
                                                {/* {event.purpose} */}
                                            </a>
                                        ) : (
                                            <p className='text-dark-gray text-xs'>
                                                {/* {event.purpose} */}
                                            </p>
                                        )}
                                    </div>
                                    <div className='flex items-start gap-1'>
                                        <Bell
                                            size={12}
                                            className='text-dark-gray'
                                        />
                                        <span className='text-dark-gray text-xs text-nowrap'>
                                            30 min before
                                        </span>
                                    </div>
                                </div>

                                <div className='flex justify-between items-center'>
                                    <div className='flex items-center gap-1'>
                                        <Image
                                            src='/calendar/events/meet.png'
                                            alt='High Priority'
                                            width={12}
                                            height={12}
                                        />
                                        <a
                                            href='https://meet.google.com/vtq-qjwd-lmn'
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            className='text-dark-gray font-semibold underline text-xs'
                                        >
                                            {event.location?.link}
                                        </a>
                                    </div>
                                    <div className='flex -space-x-2'>
                                        {event?.attendees?.map((at, i) => (
                                            <div
                                                key={i}
                                                className='w-8 h-8 rounded-full border-2 border-border overflow-hidden'
                                            >
                                                <Image
                                                    src={
                                                        at?.user
                                                            ?.profilePicture ||
                                                        '/images/author.png'
                                                    }
                                                    alt={`Attendee ${i}`}
                                                    width={32}
                                                    height={32}
                                                    className='object-cover'
                                                />
                                            </div>
                                        ))}
                                        <div className='w-8 h-8 rounded-full bg-primary text-pure-white flex items-center justify-center text-xs font-medium border-2 border-border-primary-light'>
                                            +5
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <GlobalPagination
                    totalItems={events.length || 0}
                    currentPage={currentPage}
                    itemsPerPage={limit}
                    onPageChange={(page, newLimit) => {
                        setCurrentPage(page);
                        setLimit(newLimit);
                    }}
                />
            </div>
        </>
    );
};

export default AllEvents;
