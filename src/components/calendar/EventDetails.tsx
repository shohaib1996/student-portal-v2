'use client';
import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card';
import {
    Bell,
    BookmarkCheck,
    Calendar,
    ChevronDown,
    ChevronRight,
    Copy,
    Edit,
    Trash2,
    XCircle,
} from 'lucide-react';
import { TEvent } from '@/types/calendar/calendarTypes';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '../ui/collapsible';
import { ScrollArea } from '../ui/scroll-area';
import { Button } from '../ui/button';
import { EventPopover, EventPopoverTrigger } from './CreateEvent/EventPopover';
import GlobalModal from '../global/GlobalModal';
import { useAppSelector } from '@/redux/hooks';
import dayjs from 'dayjs';
import GuestIcon from '../svgs/calendar/GuestIcon';
import { TdUser } from '../global/TdUser';
import { TUser } from '@/types/auth';
import GlobalMarkDownPreview from '../global/Community/MarkDown/GlobalMarkDownPreview';
import { Checkbox } from '../ui/checkbox';
import {
    useDeleteEventMutation,
    useGetSingleEventQuery,
    useUpdateInvitationMutation,
} from '@/redux/api/calendar/calendarApi';
import GlobalDeleteModal from '../global/GlobalDeleteModal';
import { toast } from 'sonner';
import { updateOptionsOptions } from './CreateEvent/CreateEventModal';
import { copyToClipboard } from '@/utils/common';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import ProposeTimeModal from './ProposeTimeModal';
import EventDetailsSkeleton from './EventDetailSkeleton';

const EventDetails = () => {
    const { user } = useAppSelector((s) => s.auth);
    // openPopover(e.currentTarget.getBoundingClientRect(), validIndexes.includes(index) ? 'right' : 'left')

    const searchParams = useSearchParams();
    const id = searchParams.get('detail');

    const {
        data: eventDetails,
        isLoading,
        isFetching,
    } = useGetSingleEventQuery(id as string, {
        skip: !id,
    });

    const event: TEvent = eventDetails?.event;

    const pathName = usePathname();
    const router = useRouter();

    const setOpen = () => {
        router.push(pathName);
    };

    const myParticipantData = event?.attendees?.find(
        (at) => at.user?._id === user?._id,
    );
    const isMyEvent = event?.organizer?._id === user?._id;
    const premissions = event?.permissions;
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteEvent, { isLoading: isDeleting }] = useDeleteEventMutation();
    const [deleteOption, setDeleteOption] = useState<
        'thisEvent' | 'thisAndFollowing' | 'allEvents'
    >('thisEvent');
    const [updateOpen, setUpdateOpen] = useState(false);
    const [updateOption, setUpdateOption] = useState<
        'thisEvent' | 'thisAndFollowing' | 'allEvents'
    >('thisEvent');

    const [responseStatus, setResponseStatus] = useState<
        'accepted' | 'declined' | 'proposedNewTime'
    >();

    const [updateInvitation, { isLoading: isUpdating }] =
        useUpdateInvitationMutation();
    const [proposeModalOpen, setProposeModalOpen] = useState(false);
    const [proproseTime, setProposeTime] = useState({
        start: event?.startTime,
        end: event?.endTime,
        reason: '',
    });

    const handleDelete = async () => {
        try {
            const res = await deleteEvent({
                id: event?._id as string,
                deleteOption,
            }).unwrap();
            if (res) {
                toast.success('Event deleted successfully');
                setDeleteOption('thisEvent');
                setDeleteOpen(false);
                setOpen();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpdateInvitation = async ({
        status,
    }: {
        status?: 'accepted' | 'declined' | 'proposedNewTime';
    }) => {
        if (!status) {
            return;
        }

        const data: any = {
            responseStatus: status,
            responseOption: updateOption,
        };

        if (status === 'proposedNewTime') {
            data.proposedTime = proproseTime;
        } else {
            data.proposedTime = null;
        }

        try {
            const res = await updateInvitation({
                id: event?._id as string,
                data,
            }).unwrap();
            if (res) {
                toast.success('Invitation status updated successfully');
                setOpen();
                setUpdateOpen(false);
                setProposeModalOpen(false);
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (!event) {
        return <div></div>;
    }

    return (
        <div suppressHydrationWarning>
            <GlobalModal
                className='w-[550px] md:w-[550px] lg:w-[550px]'
                customTitle={
                    isLoading || isFetching ? (
                        <div className='p-4 flex items-center justify-between border-b'>
                            <div className='h-7 w-24 bg-muted rounded-md'></div>
                            <div className='flex gap-3'>
                                <div className='h-6 w-6 bg-muted rounded-md'></div>
                                <div className='h-6 w-6 bg-muted rounded-md'></div>
                                <div className='h-6 w-6 bg-muted rounded-md'></div>
                            </div>
                        </div>
                    ) : (
                        <div className='flex justify-between items-start p-5 pb-0'>
                            <h2 className='text-xl font-bold'>
                                {event?.title}
                            </h2>
                            <div className='flex space-x-2'>
                                {(isMyEvent ||
                                    premissions?.modifyEvent === true) && (
                                    <EventPopoverTrigger updateId={event?._id}>
                                        <Button
                                            onClick={() => setOpen()}
                                            variant='ghost'
                                            size='icon'
                                            className='h-8 w-8'
                                        >
                                            <Edit className='h-4 w-4' />
                                        </Button>
                                    </EventPopoverTrigger>
                                )}
                                <Button
                                    variant='ghost'
                                    size='icon'
                                    className='h-8 w-8'
                                >
                                    <Copy className='h-4 w-4' />
                                </Button>
                                {isMyEvent &&
                                    (event?.recurrence?.isRecurring ||
                                    event?.seriesId ? (
                                        <Button
                                            onClick={() => setDeleteOpen(true)}
                                            variant='ghost'
                                            size='icon'
                                            className='h-8 w-8 text-destructive'
                                        >
                                            <Trash2 className='h-4 w-4' />
                                        </Button>
                                    ) : (
                                        <GlobalDeleteModal
                                            customDelete={handleDelete}
                                            loading={isDeleting}
                                            isButton
                                            _id={event?._id as string}
                                            deleteFun={deleteEvent}
                                        />
                                    ))}
                            </div>
                        </div>
                    )
                }
                open={id !== null}
                setOpen={() => setOpen()}
            >
                {isLoading || isFetching ? (
                    <EventDetailsSkeleton />
                ) : (
                    <div className='w-full mx-auto'>
                        <div className='flex text-sm text-dark-gray items-center'>
                            <h2>{dayjs(event?.startTime).format('dddd')}, </h2>
                            <h2>
                                {' '}
                                {dayjs(event?.startTime).format('MMM, YYYY')}
                            </h2>
                            <p className='text-lg px-1'>•</p>
                            <h2>
                                {dayjs(event?.startTime).format('hh:mm A')} -{' '}
                                {dayjs(event?.endTime).format('hh:mm A')}
                            </h2>
                        </div>
                        <div className='flex items-center justify-between'>
                            <div className='flex items-center gap-2'>
                                <div className='bg-blue-100 p-1 rounded'>
                                    <svg
                                        width='24'
                                        height='24'
                                        viewBox='0 0 24 24'
                                        fill='none'
                                        xmlns='http://www.w3.org/2000/svg'
                                    >
                                        <rect
                                            width='24'
                                            height='24'
                                            rx='4'
                                            fill='#4285F4'
                                            fillOpacity='0.2'
                                        />
                                        <path
                                            d='M17.5 10.5V8.5C17.5 7.4 16.6 6.5 15.5 6.5H8.5C7.4 6.5 6.5 7.4 6.5 8.5V15.5C6.5 16.6 7.4 17.5 8.5 17.5H10.5'
                                            stroke='#4285F4'
                                            strokeWidth='1.5'
                                        />
                                        <path
                                            d='M13 11.5L14.5 13L18 9.5'
                                            stroke='#4285F4'
                                            strokeWidth='1.5'
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <a
                                        href={`https://${event?.location?.link}`}
                                        className='text-blue-600 hover:underline text-sm font-medium flex items-center'
                                    >
                                        Join with Google Meet
                                    </a>
                                    <span className='text-xs text-muted-foreground'>
                                        {event?.location?.link}
                                    </span>
                                </div>
                            </div>
                            <Button
                                onClick={() =>
                                    copyToClipboard(event?.location?.link || '')
                                }
                                variant='ghost'
                                size='icon'
                                className='h-8 w-8'
                            >
                                <Copy className='h-4 w-4' />
                            </Button>
                        </div>

                        {isMyEvent || premissions?.seeGuestList ? (
                            <Collapsible className='group/collapsible w-full'>
                                <CollapsibleTrigger className='w-full'>
                                    <div className='mt-1 flex items-center gap-2 w-full'>
                                        <GuestIcon />
                                        <div className='w-full'>
                                            <h2 className='text-base font-medium text-start'>
                                                {event?.attendees?.length}{' '}
                                                Invited Guests
                                            </h2>
                                            <div className='flex gap-3 w-full'>
                                                <h2 className='flex gap-1 items-center text-xs'>
                                                    <svg
                                                        width='12'
                                                        height='13'
                                                        viewBox='0 0 12 13'
                                                        fill='none'
                                                        xmlns='http://www.w3.org/2000/svg'
                                                    >
                                                        <path
                                                            d='M6 12.5C9.3 12.5 12 9.8 12 6.5C12 3.2 9.3 0.5 6 0.5C2.7 0.5 0 3.2 0 6.5C0 9.8 2.7 12.5 6 12.5Z'
                                                            fill='#0736D1'
                                                        />
                                                        <path
                                                            d='M6 12.5C9.3 12.5 12 9.8 12 6.5C12 3.2 9.3 0.5 6 0.5C2.7 0.5 0 3.2 0 6.5C0 9.8 2.7 12.5 6 12.5Z'
                                                            fill='black'
                                                            fill-opacity='0.2'
                                                        />
                                                        <path
                                                            d='M3.16406 6.7162L5.03742 8.7322L8.79076 4.7002'
                                                            stroke='white'
                                                            stroke-width='1.2'
                                                            stroke-linecap='round'
                                                            stroke-linejoin='round'
                                                        />
                                                    </svg>
                                                    {
                                                        event?.attendees?.filter(
                                                            (at) =>
                                                                at.responseStatus ===
                                                                'accepted',
                                                        ).length
                                                    }{' '}
                                                    Accepted
                                                </h2>
                                                <h2 className='flex gap-1 items-center text-xs'>
                                                    <svg
                                                        width='12'
                                                        height='13'
                                                        viewBox='0 0 12 13'
                                                        fill='none'
                                                        xmlns='http://www.w3.org/2000/svg'
                                                    >
                                                        <path
                                                            d='M6 11.4995C8.75 11.4995 11 9.24951 11 6.49951C11 3.74951 8.75 1.49951 6 1.49951C3.25 1.49951 1 3.74951 1 6.49951C1 9.24951 3.25 11.4995 6 11.4995Z'
                                                            fill='#F34141'
                                                        />
                                                        <path
                                                            d='M4.19922 8.30008L7.79812 4.70117'
                                                            stroke='white'
                                                            stroke-width='1.2'
                                                            stroke-linecap='round'
                                                            stroke-linejoin='round'
                                                        />
                                                        <path
                                                            d='M7.79812 8.30008L4.19922 4.70117'
                                                            stroke='white'
                                                            stroke-width='1.2'
                                                            stroke-linecap='round'
                                                            stroke-linejoin='round'
                                                        />
                                                    </svg>
                                                    {
                                                        event?.attendees?.filter(
                                                            (at) =>
                                                                at.responseStatus ===
                                                                'denied',
                                                        ).length
                                                    }{' '}
                                                    Denied
                                                </h2>
                                                <h2 className='flex gap-1 items-center text-xs'>
                                                    <svg
                                                        width='10'
                                                        height='11'
                                                        viewBox='0 0 10 11'
                                                        fill='none'
                                                        xmlns='http://www.w3.org/2000/svg'
                                                    >
                                                        <rect
                                                            y='0.5'
                                                            width='10'
                                                            height='10'
                                                            rx='5'
                                                            fill='#FF9900'
                                                        />
                                                        <g clip-path='url(#clip0_1_51857)'>
                                                            <path
                                                                d='M4.9987 2.30957C3.23685 2.30957 1.80859 3.73783 1.80859 5.49967C1.80859 7.26152 3.23685 8.68978 4.9987 8.68978C6.76055 8.68978 8.1888 7.26152 8.1888 5.49967C8.1888 3.73783 6.76054 2.30957 4.9987 2.30957ZM4.9987 8.16895C3.52685 8.16895 2.32943 6.97152 2.32943 5.49967C2.32943 4.02783 3.52685 2.8304 4.9987 2.8304C6.47054 2.8304 7.66797 4.02783 7.66797 5.49967C7.66797 6.97152 6.47054 8.16895 4.9987 8.16895Z'
                                                                fill='white'
                                                            />
                                                            <path
                                                                d='M5.14511 6.15918C5.05534 6.15918 4.96925 6.19484 4.90578 6.25832C4.8423 6.32179 4.80664 6.40788 4.80664 6.49765V6.58666C4.80664 6.67643 4.8423 6.76252 4.90578 6.82599C4.96925 6.88947 5.05534 6.92512 5.14511 6.92512C5.23487 6.92512 5.32096 6.88947 5.38444 6.82599C5.44791 6.76252 5.48357 6.67643 5.48357 6.58666V6.49765C5.48357 6.40788 5.44791 6.32179 5.38444 6.25831C5.32096 6.19484 5.23487 6.15918 5.14511 6.15918Z'
                                                                fill='white'
                                                            />
                                                            <path
                                                                d='M4.98851 3.49902C4.76197 3.4987 4.54193 3.57474 4.36393 3.71486C4.18592 3.85499 4.06034 4.05102 4.00746 4.2713C3.98646 4.35847 4.0009 4.45041 4.04762 4.52694C4.09434 4.60347 4.16951 4.65833 4.25664 4.67949C4.34377 4.70065 4.43574 4.68637 4.51235 4.63979C4.58896 4.59321 4.64397 4.51814 4.66528 4.43104C4.68429 4.35161 4.73188 4.28195 4.79896 4.23536C4.86605 4.18877 4.94793 4.16849 5.02901 4.17841C5.11008 4.18833 5.18467 4.22774 5.23854 4.28913C5.29242 4.35052 5.32181 4.42959 5.32112 4.51126C5.32098 4.58281 5.2981 4.65246 5.25579 4.71015C5.21347 4.76784 5.15392 4.81059 5.08572 4.83222C5.0848 4.83251 5.08391 4.83284 5.083 4.83314C5.00533 4.84761 4.93516 4.88879 4.88466 4.94956C4.83416 5.01032 4.80651 5.08683 4.8065 5.16584V5.61775C4.8065 5.70752 4.84216 5.79361 4.90563 5.85708C4.9691 5.92056 5.05519 5.95622 5.14496 5.95622C5.23473 5.95622 5.32082 5.92056 5.38429 5.85708C5.44777 5.79361 5.48343 5.70752 5.48343 5.61775V5.39319C5.60553 5.32412 5.71206 5.23057 5.79634 5.11842C5.90874 4.96811 5.97717 4.78951 5.99398 4.60257C6.01079 4.41563 5.97532 4.2277 5.89153 4.05974C5.80775 3.89179 5.67894 3.75042 5.51948 3.65141C5.36003 3.5524 5.1762 3.49964 4.98851 3.49902Z'
                                                                fill='white'
                                                            />
                                                        </g>
                                                        <defs>
                                                            <clipPath id='clip0_1_51857'>
                                                                <rect
                                                                    width='6.66667'
                                                                    height='6.66667'
                                                                    fill='white'
                                                                    transform='translate(1.66602 2.1665)'
                                                                />
                                                            </clipPath>
                                                        </defs>
                                                    </svg>
                                                    {
                                                        event?.attendees?.filter(
                                                            (at) =>
                                                                at.responseStatus ===
                                                                'needsAction',
                                                        ).length
                                                    }{' '}
                                                    Pending
                                                </h2>
                                            </div>
                                        </div>
                                        <ChevronRight className='ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90' />
                                    </div>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                    <div className='space-y-2 pt-1'>
                                        {event?.attendees?.map((at) => (
                                            <TdUser
                                                key={at.user?._id}
                                                user={at.user as TUser}
                                            />
                                        ))}
                                    </div>
                                </CollapsibleContent>
                            </Collapsible>
                        ) : (
                            <div className='mt-1 flex items-center gap-2 w-full'>
                                <GuestIcon />
                                <div className='w-full'>
                                    <h2 className='text-base font-medium text-start'>
                                        {event?.attendeeCount} Invited Guests
                                    </h2>
                                </div>
                            </div>
                        )}

                        <div className='flex items-center my-2 gap-2 text-base font-medium'>
                            <Bell className='h-4 w-4' />
                            <span>
                                Reminder {event?.reminders?.[0]?.offsetMinutes}{' '}
                                minutes before
                            </span>
                        </div>

                        <div className='flex items-center gap-2 text-base font-medium'>
                            <Calendar className='h-4 w-4' />
                            <span>{event.organizer?.email}</span>
                        </div>

                        <div className='mt-2'>
                            <h3 className='font-medium text-base pb-1'>
                                Meeting Agenda/Follow up/Action Item
                            </h3>
                            <ScrollArea className='h-24 bg-background rounded-md border'>
                                <GlobalMarkDownPreview
                                    text={event?.description || ''}
                                    className='text-sm text-muted-foreground'
                                ></GlobalMarkDownPreview>
                            </ScrollArea>
                        </div>

                        {!isMyEvent &&
                            event?.myResponseStatus === 'needsAction' && (
                                <div className='flex justify-between pt-4 border-t border-forground-border'>
                                    <div className='text-base text-black font-medium'>
                                        Going?
                                    </div>
                                    <div className='flex gap-2'>
                                        <Button
                                            onClick={() => {
                                                if (
                                                    event?.recurrence
                                                        ?.isRecurring ||
                                                    event?.seriesId
                                                ) {
                                                    setUpdateOpen(true);
                                                    setResponseStatus(
                                                        'accepted',
                                                    );
                                                } else {
                                                    handleUpdateInvitation({
                                                        status: 'accepted',
                                                    });
                                                }
                                            }}
                                        >
                                            Yes
                                        </Button>
                                        <Button
                                            variant='secondary'
                                            onClick={() => {
                                                if (
                                                    event?.recurrence
                                                        ?.isRecurring ||
                                                    event?.seriesId
                                                ) {
                                                    setUpdateOpen(true);
                                                    setResponseStatus(
                                                        'declined',
                                                    );
                                                } else {
                                                    handleUpdateInvitation({
                                                        status: 'declined',
                                                    });
                                                }
                                            }}
                                        >
                                            No
                                        </Button>
                                        <Button
                                            onClick={() =>
                                                setProposeModalOpen(true)
                                            }
                                            variant='secondary'
                                        >
                                            Proposed New Time
                                        </Button>
                                    </div>
                                </div>
                            )}
                    </div>
                )}
            </GlobalModal>

            <GlobalModal
                open={deleteOpen}
                setOpen={setDeleteOpen}
                className='w-[550px] md:w-[550px] lg:w-[550px]'
                allowFullScreen={false}
                buttons={
                    <div className='flex gap-2 items-center'>
                        <Button
                            isLoading={isUpdating}
                            onClick={() => setDeleteOpen(false)}
                            variant={'primary_light'}
                            icon={<XCircle size={18} />}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleDelete}
                            icon={<BookmarkCheck size={18} />}
                        >
                            Remove & Close
                        </Button>
                    </div>
                }
                subTitle='Select events to remove from the series.'
                title='Remove recurring event'
            >
                <div className='flex flex-col gap-2 py-2'>
                    {updateOptionsOptions.map((item) => (
                        <Button
                            onClick={() => setDeleteOption(item.value)}
                            key={item.value}
                            className='text-start bg-background flex justify-start gap-2'
                            variant={'secondary'}
                        >
                            <Checkbox
                                className='rounded-full'
                                checked={item.value === deleteOption}
                            />{' '}
                            {item.label}
                        </Button>
                    ))}
                </div>
            </GlobalModal>

            <GlobalModal
                open={updateOpen}
                setOpen={setUpdateOpen}
                className='w-[550px] md:w-[550px] lg:w-[550px]'
                allowFullScreen={false}
                buttons={
                    <div className='flex gap-2 items-center'>
                        <Button
                            onClick={() => setUpdateOpen(false)}
                            variant={'primary_light'}
                            icon={<XCircle size={18} />}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() =>
                                handleUpdateInvitation({
                                    status: responseStatus,
                                })
                            }
                            icon={<BookmarkCheck size={18} />}
                            isLoading={isUpdating}
                        >
                            Save & Close
                        </Button>
                    </div>
                }
                subTitle='Select events to update from the series.'
                title='Update recurring event'
            >
                <div className='flex flex-col gap-2 py-2'>
                    {updateOptionsOptions.map((item) => (
                        <Button
                            onClick={() => setUpdateOption(item.value)}
                            key={item.value}
                            className='text-start bg-background flex justify-start gap-2'
                            variant={'secondary'}
                        >
                            <Checkbox
                                className='rounded-full'
                                checked={item.value === updateOption}
                            />{' '}
                            {item.label}
                        </Button>
                    ))}
                </div>
            </GlobalModal>

            <ProposeTimeModal
                onSubmit={() => {
                    if (event?.recurrence?.isRecurring || event?.seriesId) {
                        setUpdateOpen(true);
                        setResponseStatus('proposedNewTime');
                    } else {
                        handleUpdateInvitation({
                            status: 'proposedNewTime',
                        });
                    }
                }}
                open={proposeModalOpen}
                setOpen={setProposeModalOpen}
                setProposeTime={setProposeTime}
                proproseTime={proproseTime}
            />
        </div>
    );
};

export default EventDetails;
