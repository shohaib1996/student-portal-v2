'use client';
import { updateOptionsOptions } from '@/components/calendar/CreateEvent/CreateEventModal';
import { EventPopoverTrigger } from '@/components/calendar/CreateEvent/EventPopover';
import { RangePickerCL } from '@/components/calendar/dateRangePicker/RangePickerCL';
import ProposeTimeModal, {
    TProposeTime,
} from '@/components/calendar/ProposeTimeModal';
import GlobalMarkDownPreview from '@/components/global/Community/MarkDown/GlobalMarkDownPreview';
import { DateRangePicker } from '@/components/global/DateRangePicker';
import FilterModal from '@/components/global/FilterModal/FilterModal';
import { TConditions } from '@/components/global/FilterModal/QueryBuilder';
import GlobalHeader from '@/components/global/GlobalHeader';
import GlobalModal from '@/components/global/GlobalModal';
import GlobalPagination from '@/components/global/GlobalPagination';
import GlobalTable, {
    TCustomColumnDef,
} from '@/components/global/GlobalTable/GlobalTable';
import SortMenu from '@/components/global/SortMenu';
import TdDate from '@/components/global/TdDate';
import { TdUser } from '@/components/global/TdUser';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    useGetMyEventsQuery,
    useUpdateInvitationMutation,
} from '@/redux/api/calendar/calendarApi';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { TUser } from '@/types/auth';
import { TEvent } from '@/types/calendar/calendarTypes';
import { endOfMonth, startOfMonth } from 'date-fns';
import dayjs from 'dayjs';
import {
    BookmarkCheck,
    CheckCircle,
    Eye,
    PlusCircle,
    Timer,
    X,
    XCircle,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React, { useMemo, useState } from 'react';
import { DateRange } from 'react-day-picker';
import { toast } from 'sonner';

const zoomImg = '/calendar/zoom.png';
const meetImg = '/calendar/meet.png';
const phoneImg = '/calendar/phone.png';
const customImg = '/calendar/custom.png';

const MyInvitations = () => {
    const [sortData, setSortData] = useState<Record<string, number>>({});
    const [date, setDate] = useState<DateRange>({
        from: startOfMonth(new Date()),
        to: endOfMonth(new Date()),
    });
    const [filterData, setFilterData] = useState<TConditions[]>([]);
    const [limit, setLimit] = useState(20);
    const [event, setEvent] = useState<TEvent | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const { data, isLoading } = useGetMyEventsQuery({
        from: date.from?.toISOString(),
        to: date.to?.toISOString(),
    });
    const { user } = useAppSelector((s) => s.auth);

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
    const [proproseTime, setProposeTime] = useState<TProposeTime>({
        start: event?.startTime || '',
        end: event?.endTime || '',
        reason: '',
    });

    const events: TEvent[] =
        (data?.events as TEvent[])?.filter(
            (e) => e?.organizer?._id !== user?._id,
        ) || [];
    const totalPages = Math.ceil(events.length / limit);

    const handleFilter = (
        val: TConditions[],
        queryObj: Record<string, string>,
    ) => {
        setFilterData(val);
        // setSelectedProgram(queryObj['program'] ?? '');
        // setSelectedSession(queryObj['session'] ?? '');
        // setQuery(queryObj['query'] ?? '');
        // setDate(queryObj['date'] ?? '');
    };

    const formatDuration = (startDate: string, endDate: string) => {
        const diff = dayjs(endDate).diff(dayjs(startDate), 'seconds'); // Get difference in seconds
        const dur = dayjs.duration(diff, 'seconds');

        if (dur.asDays() >= 1) {
            return `${Math.floor(dur.asDays())} days`;
        } else if (dur.asHours() >= 1) {
            return `${Math.floor(dur.asHours())} hours`;
        } else {
            return `${Math.floor(dur.asMinutes())} minutes`;
        }
    };

    const pathName = usePathname();
    const router = useRouter();

    const getLocationDetails = (location: TEvent['location']) => {
        switch (location?.type) {
            case 'meet':
                return {
                    icon: (
                        <Image
                            className='size-9 object-contain'
                            src={meetImg}
                            height={60}
                            width={60}
                            alt='zoom'
                        />
                    ),
                    label: 'Google Meet',
                };
            case 'zoom':
                return {
                    icon: (
                        <Image
                            className='size-9 object-contain'
                            src={zoomImg}
                            height={60}
                            width={60}
                            alt='zoom'
                        />
                    ),
                    label: 'Zoom',
                };
            case 'call':
                return {
                    icon: (
                        <Image
                            className='size-9 object-contain'
                            src={phoneImg}
                            height={60}
                            width={60}
                            alt='zoom'
                        />
                    ),
                    label: 'Phone Call',
                };
            case 'custom':
                return {
                    icon: (
                        <Image
                            className='size-9 object-contain'
                            src={customImg}
                            height={60}
                            width={60}
                            alt='zoom'
                        />
                    ),
                    label: location?.link,
                };
            default:
                return {
                    icon: (
                        <Image
                            className='size-9 object-contain'
                            src={customImg}
                            height={60}
                            width={60}
                            alt='zoom'
                        />
                    ),
                    label: 'Unknown',
                };
        }
    };

    const paginatedEvents = useMemo(() => {
        const startIndex = (currentPage - 1) * limit;
        const endIndex = startIndex + limit;
        return events.slice(startIndex, endIndex);
    }, [events, currentPage, limit]);

    const handlePageChange = (page: number, newLimit?: number) => {
        // Ensure the page is within valid range
        const validPage = Math.max(1, Math.min(page, totalPages));

        setCurrentPage(validPage);

        // Update limit if provided
        if (newLimit) {
            setLimit(newLimit);
            // Recalculate current page to maintain relative position
            const newStartIndex = (validPage - 1) * newLimit;
            const newCurrentPage = Math.floor(newStartIndex / newLimit) + 1;
            setCurrentPage(newCurrentPage);
        }
    };

    const [selectedEvents, setSelectedEvents] = useState<string[]>([]);

    const defaultColumns: TCustomColumnDef<TEvent>[] = [
        {
            accessorKey: 'select',
            header: '',
            cell: ({ row }) => {
                return (
                    <Checkbox
                        checked={selectedEvents.includes(row.original._id)}
                        onCheckedChange={(val) => {
                            if (val === false) {
                                setSelectedEvents((prev) =>
                                    prev.filter(
                                        (id) => id !== row.original._id,
                                    ),
                                );
                            } else {
                                setSelectedEvents((prev) => [
                                    ...prev,
                                    row.original._id,
                                ]);
                            }
                        }}
                    />
                );
            },
            footer: (data) => data.column.id,
            id: 'select',
            visible: true,
            canHide: false,
        },
        {
            accessorKey: 'title',
            header: 'Meeting Title',
            footer: (data) => data.column.id,
            id: 'title',
            visible: true,
            canHide: false,
        },
        {
            accessorKey: 'organizer',
            header: 'Event Host',
            cell: ({ row }) => {
                return <TdUser user={row.original.organizer as TUser} />;
            },
            footer: (data) => data.column.id,
            id: 'organizer',
            visible: true,
            canHide: false,
        },
        {
            accessorKey: 'startTime',
            header: 'Meeting Schedule',
            cell: ({ row }) => {
                return <TdDate date={row.original.startTime} />;
            },
            footer: (data) => data.column.id,
            id: 'startTime',
            visible: true,
            canHide: false,
        },
        {
            accessorKey: 'startTime',
            header: 'Duration',
            cell: ({ row }) => {
                const start = row.original.startTime;
                const end = row.original.endTime;
                return <h2>{formatDuration(start, end)}</h2>;
            },
            footer: (data) => data.column.id,
            id: 'duration',
            visible: true,
            canHide: false,
        },
        {
            accessorKey: 'guests',
            header: 'Guests',
            cell: ({ row }) => {
                return <h2>{row.original?.attendeeCount}</h2>;
            },
            footer: (data) => data.column.id,
            id: 'guests',
            visible: true,
            canHide: false,
        },
        {
            accessorKey: 'location',
            header: 'Location',
            cell: ({ row }) => {
                const location = row.original.location;
                const { icon, label } = getLocationDetails(location);
                return (
                    <div className='flex items-center gap-2'>
                        {icon}
                        {location?.link ? (
                            <a
                                href={location?.link}
                                target='_blank'
                                rel='noopener noreferrer'
                                className='text-blue-500 hover:underline'
                            >
                                {label}
                            </a>
                        ) : (
                            <span>{label ?? '-'}</span>
                        )}
                    </div>
                );
            },
            footer: (data) => data.column.id,
            id: 'location',
            visible: true,
            canHide: false,
        },
        {
            accessorKey: 'actions',
            header: 'Actions',
            cell: ({ row }) => {
                const event = row.original;
                return (
                    <div className='flex items-center gap-2'>
                        <Link href={`${pathName}?detail=${row.original._id}`}>
                            <Button
                                tooltip='View'
                                variant={'plain'}
                                className='bg-foreground size-8'
                                icon={<Eye size={18} />}
                                size={'icon'}
                            ></Button>
                        </Link>

                        {row.original.myResponseStatus === 'needsAction' && (
                            <>
                                <Button
                                    onClick={() => {
                                        if (
                                            event?.recurrence?.isRecurring ||
                                            event?.seriesId
                                        ) {
                                            setUpdateOpen(true);
                                            setResponseStatus('accepted');
                                            setEvent(row.original);
                                        } else {
                                            handleUpdateInvitation({
                                                status: 'accepted',
                                                event: row.original,
                                            });
                                        }
                                    }}
                                    isLoading={
                                        isUpdating &&
                                        responseStatus === 'accepted'
                                    }
                                    tooltip='Accept'
                                    variant={'plain'}
                                    className='bg-foreground size-8'
                                    icon={<CheckCircle size={18} />}
                                    size={'icon'}
                                ></Button>
                                <Button
                                    isLoading={
                                        isUpdating &&
                                        responseStatus === 'proposedNewTime'
                                    }
                                    onClick={() => {
                                        setProposeModalOpen(true);
                                        setProposeTime({
                                            start: dayjs(
                                                event.startTime,
                                            ).toISOString(),
                                            end: dayjs(
                                                event.endTime,
                                            ).toISOString(),
                                            reason: '',
                                        });
                                        setEvent(row.original);
                                        setResponseStatus('proposedNewTime');
                                    }}
                                    tooltip='Propose New Time'
                                    variant={'plain'}
                                    className='bg-foreground size-8'
                                    icon={<Timer size={18} />}
                                    size={'icon'}
                                ></Button>
                                <Button
                                    isLoading={
                                        isUpdating &&
                                        responseStatus === 'declined'
                                    }
                                    onClick={() => {
                                        if (
                                            event?.recurrence?.isRecurring ||
                                            event?.seriesId
                                        ) {
                                            setUpdateOpen(true);
                                            setEvent(row.original);
                                            setResponseStatus('declined');
                                        } else {
                                            handleUpdateInvitation({
                                                status: 'declined',
                                                event: row.original,
                                            });
                                        }
                                    }}
                                    tooltip='Decline'
                                    variant={'danger_light'}
                                    icon={<XCircle size={18} />}
                                    className='size-8'
                                    size={'icon'}
                                ></Button>
                            </>
                        )}
                    </div>
                );
            },
            footer: (data) => data.column.id,
            id: 'actions',
            visible: true,
            canHide: false,
        },
    ];

    const dispatch = useAppDispatch();

    const handleUpdateInvitation = async ({
        status,
        event,
    }: {
        status?: 'accepted' | 'declined' | 'proposedNewTime';
        event: TEvent | null;
    }) => {
        if (!status || !event) {
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
                setUpdateOpen(false);
                setProposeModalOpen(false);
                setEvent(null);
            }
        } catch (err: any) {
            console.log(err);
            toast.error(err?.data?.error || 'Failed to update invitation');
        }
    };

    return (
        <div className='pt-2'>
            <GlobalHeader
                title={<div>My Invitations</div>}
                subTitle='Check out all your incoming invitations'
                buttons={
                    <div className='flex items-center gap-2'>
                        {selectedEvents.length > 0 && (
                            <>
                                <Button
                                    onClick={() => setSelectedEvents([])}
                                    variant={'primary_light'}
                                >
                                    {selectedEvents.length} Selected Events
                                    <X size={18} />
                                </Button>
                                <Button
                                    onClick={() => toast.info('Comming Soon')}
                                    variant={'primary_light'}
                                >
                                    Accept All
                                </Button>
                                <Button
                                    onClick={() => toast.info('Comming Soon')}
                                    variant={'danger_light'}
                                >
                                    Reject All
                                </Button>
                            </>
                        )}
                        <RangePickerCL value={date} onChange={setDate} />
                    </div>
                }
            />

            <div className='h-[calc(100vh-120px)] flex flex-col justify-between'>
                <GlobalTable
                    isLoading={isLoading}
                    limit={limit}
                    data={paginatedEvents}
                    defaultColumns={defaultColumns}
                    tableName='my-invitations-table'
                />
                <GlobalPagination
                    currentPage={currentPage}
                    totalItems={events.length}
                    itemsPerPage={limit}
                    onPageChange={handlePageChange}
                />
            </div>

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
                                    event,
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
                            event,
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

export default MyInvitations;
