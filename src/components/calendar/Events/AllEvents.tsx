'use client';
import MyInvitationsIcon from '../svgs/calendar/MyInvitationsIcon';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { useGetMyEventsQuery } from '../api/calendarApi';
import { TEvent } from '../types/calendarTypes';
import { endOfMonth, startOfMonth } from 'date-fns';
import { Bell, ChevronDown, Clock, Ellipsis, Plus, Users } from 'lucide-react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import React, { useState } from 'react';
import {
    EventPopoverProvider,
    EventPopoverTrigger,
} from '../CreateEvent/EventPopover';
import Link from 'next/link';
import { DateRange } from 'react-day-picker';
import { RangePickerCL } from '../dateRangePicker/RangePickerCL';
import dayjs from 'dayjs';
import CalendarHeader from '../ui/CalendarHeader';
import CalendarPagination from '../ui/CalendarPagination';
import { renderPlainText } from '@/components/lexicalEditor/renderer/renderPlainText';

const AllEvents = () => {
    const [limit, setLimit] = useState(10);
    const [date, setDate] = useState<DateRange>({
        from: startOfMonth(new Date()),
        to: endOfMonth(new Date()),
    });

    const [currentPage, setCurrentPage] = useState<number>(1);
    const { data } = useGetMyEventsQuery({
        from: date.from,
        to: date.to,
    });

    const events: TEvent[] =
        (data?.events as TEvent[])?.filter((ev) => ev.type !== 'task') || [];

    const pathName = usePathname();
    const router = useRouter();

    return (
        <div className='pt-2'>
            <CalendarHeader
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
                            tooltip='My Invitations'
                        >
                            <Link href={'/calendar/my-invitations'}>
                                My Invitations
                            </Link>
                        </Button>
                        <RangePickerCL value={date} onChange={setDate} />
                        {/* <FilterModal
                            value={[]}
                            columns={[]}
                            onChange={() => null}
                        /> */}
                        <EventPopoverTrigger>
                            <Button icon={<Plus size={18} />}>
                                Create New
                            </Button>
                        </EventPopoverTrigger>
                    </div>
                }
            />
            <div className='h-[calc(100vh-120px)] flex flex-col justify-between'>
                <div className='grid overflow-y-auto grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-2 mt-2'>
                    {events.map((event, i) => (
                        <div
                            key={event._id}
                            className='bg-foreground rounded-lg border border-border-primary-light py-2 px-2.5'
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
                                <div className='flex flex-col md:flex-row flex-wrap justify-between items-start'>
                                    <div className='flex items-center gap-1'>
                                        <Clock
                                            size={12}
                                            className='text-dark-gray'
                                        />

                                        <div className='flex text-xs text-dark-gray items-center gap-1'>
                                            {/* <h2>{dayjs(event?.startTime).format('dddd')}, </h2> */}
                                            <h2>
                                                {dayjs(event?.startTime).format(
                                                    'MMM MM, YYYY',
                                                )}
                                            </h2>
                                            <h2>
                                                at{' '}
                                                {dayjs(event?.startTime).format(
                                                    'HH:mm A',
                                                )}
                                            </h2>
                                        </div>
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

                                <div className='flex flex-col md:flex-row justify-between items-start'>
                                    <div className='flex items-start gap-1'>
                                        <span className=' text-dark-gray  whitespace-break-spaces  text-xs font-semibold'>
                                            Agenda:
                                        </span>
                                        <div className='text-xs break-all line-clamp-2 overflow-x-hidden'>
                                            {renderPlainText({
                                                text: event.description || '',
                                                textSize: 'text-xs',
                                                textColor: 'text-dark-gray',
                                                // truncate: true,
                                                lineClamp: 2,
                                                width: 'w-full',
                                            })}
                                        </div>
                                    </div>
                                    <div className='flex items-center font-medium gap-1'>
                                        <Bell
                                            size={12}
                                            className='text-dark-gray'
                                        />
                                        <span className='text-dark-gray text-xs text-nowrap'>
                                            {
                                                event?.reminders?.[0]
                                                    ?.offsetMinutes
                                            }{' '}
                                            min before
                                        </span>
                                    </div>
                                </div>

                                <div className='flex flex-col md:flex-row justify-between items-start'>
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
                                            className='text-dark-gray font-semibold underline text-xs break-all line-clamp-2 overflow-ellipsis lg:max-w-64'
                                        >
                                            {event.location?.link}
                                        </a>
                                    </div>
                                    <div className='flex -space-x-2 text-xs text-dark-gray font-medium gap-1'>
                                        <Users size={14} />{' '}
                                        {event.attendeeCount} invited users
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <CalendarPagination
                    totalItems={events.length || 0}
                    currentPage={currentPage}
                    itemsPerPage={limit}
                    onPageChange={(page, newLimit) => {
                        setCurrentPage(page);
                        setLimit(newLimit);
                    }}
                />
            </div>
        </div>
    );
};

export default AllEvents;
