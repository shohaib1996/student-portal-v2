'use client';

import { useCallback, useState } from 'react';
import {
    format,
    addDays,
    startOfWeek,
    endOfWeek,
    isSameDay,
    addWeeks,
    subWeeks,
    isToday,
} from 'date-fns';
import {
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Calendar,
    CheckSquare,
    Clock,
    User,
    SendIcon,
    Send,
    SquareChartGantt,
    CalendarFold,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import AcceptedIcon from './svgs/calendar/AcceptedIcon';
import PendingIcon from './svgs/calendar/PendingIcon';
import DeniedIcon from './svgs/calendar/DeniedIcon';
import ProposeTimeIcon from './svgs/calendar/ProposeTimeIcon';
import FinishedIcon from './svgs/calendar/FinishedIcon';
import InProgressIcon from './svgs/calendar/InProgressIcon';
import TodoIcon from './svgs/calendar/TodoIcon';
import HolidayIcon from './svgs/calendar/HolidayIcon';
import EventsIcon from './svgs/calendar/EventsIcon';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
    setEventFilter,
    setHolidayFilter,
    setPriorityFilter,
    setRolesFilter,
    setTodoFilter,
    setTypeFilter,
} from '@/components/calendar/reducer/calendarReducer';
import { useGetMyEventsQuery } from '@/components/calendar/api/calendarApi';
import { TEvent } from '@/components/calendar/types/calendarTypes';
import dayjs from 'dayjs';
import { Skeleton } from '../ui/skeleton';
import Link from 'next/link';

interface CalendarAccordionsProps {
    currentDate: Date;
    onDateSelect: (date: Date) => void;
}

export const eventOptions: {
    value: 'accepted' | 'pending' | 'denied' | 'finished' | 'proposedTime';
    label: string;
    icon: any;
}[] = [
    {
        value: 'accepted',
        label: 'Accepted',
        icon: <AcceptedIcon />,
    },
    {
        value: 'pending',
        label: 'Pending',
        icon: <PendingIcon />,
    },
    {
        value: 'denied',
        label: 'Denied',
        icon: <DeniedIcon />,
    },
    {
        value: 'proposedTime',
        label: 'Proposed New Time',
        icon: <ProposeTimeIcon />,
    },
    {
        value: 'finished',
        label: 'Finished',
        icon: <FinishedIcon />,
    },
];
export const todoOptions: {
    value: 'confirmed' | 'cancelled' | 'todo' | 'inprogress' | 'completed';
    label: string;
    icon: any;
}[] = [
    {
        value: 'inprogress',
        label: 'In-Progress',
        icon: <InProgressIcon />,
    },
    {
        value: 'completed',
        label: 'Completed',
        icon: <PendingIcon />,
    },
    {
        value: 'cancelled',
        label: 'Cancelled',
        icon: <DeniedIcon />,
    },
];
export const priorityOptions: {
    value: 'low' | 'medium' | 'high';
    label: string;
}[] = [
    {
        value: 'low',
        label: 'Low',
    },
    {
        value: 'medium',
        label: 'Medium',
    },
    {
        value: 'high',
        label: 'High',
    },
];

export const typeOptions: {
    value: 'event' | 'task';
    label: string;
}[] = [
    {
        value: 'event',
        label: 'Event',
    },
    {
        value: 'task',
        label: 'Task',
    },
];

export function CalendarSidebar({
    currentDate,
    onDateSelect,
}: CalendarAccordionsProps) {
    const [expanded, setExpanded] = useState({
        month: true,
        events: true,
        events2: true,
        todo: true,
        holiday: true,
        type: true,
    });

    const {
        eventFilter,
        holidayFilter,
        priorityFilter,
        rolesFilter,
        todoFilter,
        typeFilter,
    } = useAppSelector((s) => s.calendar);
    const dispatch = useAppDispatch();

    const [sentFilter, setSentFilter] = useState('');
    const [selectedWeek, setSelectedWeek] = useState(startOfWeek(currentDate));
    const { data, isLoading } = useGetMyEventsQuery({
        from: selectedWeek.toISOString(), // Start of the day (00:00:00)
        to: endOfWeek(selectedWeek).toISOString(), // End of the day (23:59:59.999)
    });
    const events: TEvent[] = (data?.events as TEvent[]) || [];
    const toggleSection = (section: keyof typeof expanded) => {
        setExpanded((prev) => ({
            ...prev,
            [section]: !prev[section],
        }));
    };

    const navigateToPreviousWeek = () => {
        setSelectedWeek((prev) => subWeeks(prev, 1));
    };

    const navigateToNextWeek = () => {
        setSelectedWeek((prev) => addWeeks(prev, 1));
    };

    // Get week days
    const weekDays = Array.from({ length: 7 }, (_, i) =>
        addDays(selectedWeek, i),
    );

    // Group events by day
    const groupEventsByDay = (events: TEvent[]) => {
        const grouped: Record<string, TEvent[]> = {};

        events.forEach((event) => {
            const dateKey = format(event.startTime, 'yyyy-MM-dd');
            if (!grouped[dateKey]) {
                grouped[dateKey] = [];
            }
            grouped[dateKey].push(event);
        });

        return grouped;
    };

    const groupedWeekEvents = groupEventsByDay(events);

    const isFilterActive = useCallback(
        (type: 'event' | 'holiday' | 'todo' | 'eventType', value: string) => {
            if (type === 'event') {
                const exist = (eventFilter as string[]).find(
                    (f) => f === value,
                );
                if (exist) {
                    return true;
                } else {
                    return false;
                }
            } else if (type === 'todo') {
                const exist = (todoFilter as string[]).find((f) => f === value);
                if (exist) {
                    return true;
                } else {
                    return false;
                }
            } else if (type === 'holiday') {
                const exist = (priorityFilter as string[]).find(
                    (f) => f === value,
                );
                if (exist) {
                    return true;
                } else {
                    return false;
                }
            } else if (type === 'eventType') {
                const exist = (typeFilter as string[]).find((f) => f === value);
                if (exist) {
                    return true;
                } else {
                    return false;
                }
            }
        },
        [eventFilter, todoFilter, priorityFilter, typeFilter],
    );

    return (
        <div className='w-full bg-foreground border-l flex flex-col h-full overflow-y-auto md:min-w-[270px] xl:min-w-[380px]'>
            {/* Month Accordion */}
            <div className='border-b'>
                <button
                    className='flex items-center text-dark-gray gap-1 w-full p-3 text-sm font-medium text-left'
                    onClick={() => toggleSection('month')}
                >
                    <ChevronDown
                        className={cn(
                            'h-4 w-4 transition-transform',
                            expanded.month ? 'rotate-180' : '',
                        )}
                    />
                    <span>{format(currentDate, 'MMMM yyyy')}</span>
                </button>

                {expanded.month && (
                    <div className='p-3 pt-0'>
                        {/* Week navigation */}
                        <div className='flex gap-1 justify-between items-center mb-3'>
                            <Button
                                variant='ghost'
                                size='icon'
                                className='h-6 w-6'
                                onClick={navigateToPreviousWeek}
                            >
                                <ChevronLeft className='h-4 w-4' />
                            </Button>
                            <span className='text-xs'>
                                {format(selectedWeek, 'MMM d')} -{' '}
                                {format(endOfWeek(selectedWeek), 'MMM d, yyyy')}
                            </span>
                            <Button
                                variant='ghost'
                                size='icon'
                                className='h-6 w-6'
                                onClick={navigateToNextWeek}
                            >
                                <ChevronRight className='h-4 w-4' />
                            </Button>
                        </div>

                        {/* Days of week */}
                        <div className='grid grid-cols-7 items-center gap-1 mb-3'>
                            {weekDays.map((day, i) => (
                                <button
                                    key={i}
                                    className={cn(
                                        'w-full border border-forground-border bg-secondary rounded-full flex flex-col items-center justify-center h-[72px]',
                                        isToday(day) && 'bg-primary text-',
                                        isSameDay(day, currentDate) &&
                                            !isToday(day) &&
                                            'bg-blue-100 text-pure-white',
                                    )}
                                    onClick={() => onDateSelect(day)}
                                >
                                    <div
                                        className={cn(
                                            'text-xs font-semibold mb-1',
                                            isToday(day)
                                                ? 'text-pure-white'
                                                : 'text-black',
                                            isSameDay(day, currentDate) &&
                                                !isToday(day) &&
                                                'text-blue-700',
                                        )}
                                    >
                                        {format(day, 'EEE').charAt(0)}
                                    </div>
                                    <div
                                        className={cn(
                                            'text-sm text-gray font-medium',
                                            {
                                                'text-pure-white': isToday(day),
                                            },
                                        )}
                                    >
                                        {format(day, 'd')}
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Events for selected week */}
                        <div className='space-y-3 max-h-[40vh] overflow-y-auto'>
                            {Object.keys(groupedWeekEvents).length > 0 ? (
                                Object.entries(groupedWeekEvents)
                                    .sort(
                                        ([dateA], [dateB]) =>
                                            new Date(dateA).getTime() -
                                            new Date(dateB).getTime(),
                                    )
                                    .map(([dateStr, dayEvents]) => (
                                        <div key={dateStr} className='text-sm'>
                                            <div className='font-medium mb-1'>
                                                {format(
                                                    new Date(dateStr),
                                                    'EEEE, MMM d',
                                                )}
                                            </div>
                                            {isLoading ? (
                                                <div className='space-y-1'>
                                                    {Array.from(
                                                        { length: 3 },
                                                        (_, i) => (
                                                            <div
                                                                key={i}
                                                                className='w-full h-12 bg-foreground rounded-md'
                                                            />
                                                        ),
                                                    )}
                                                </div>
                                            ) : (
                                                dayEvents.map((event) => (
                                                    <Link
                                                        key={event._id}
                                                        href={`/calendar?detail=${event._id}`}
                                                    >
                                                        <div
                                                            style={{
                                                                borderColor:
                                                                    event.eventColor,
                                                            }}
                                                            className={cn(
                                                                'p-2 mb-1 cursor-pointer rounded flex gap-2 relative border-l-4 bg-foreground text-xs',
                                                                event.eventColor,
                                                            )}
                                                        >
                                                            <div
                                                                style={{
                                                                    backgroundColor:
                                                                        event.eventColor,
                                                                    opacity: 0.1,
                                                                }}
                                                                className='absolute size-full top-0 left-0 z-10'
                                                            ></div>
                                                            <div className='text-dark-gray text-[10px] whitespace-nowrap'>
                                                                <p>
                                                                    {dayjs(
                                                                        event?.startTime,
                                                                    ).format(
                                                                        'hh:mm A',
                                                                    )}
                                                                </p>
                                                                <p>
                                                                    {dayjs(
                                                                        event.endTime,
                                                                    ).diff(
                                                                        dayjs(
                                                                            event.startTime,
                                                                        ),
                                                                        'minutes',
                                                                    )}{' '}
                                                                    min
                                                                </p>
                                                            </div>
                                                            <div className='font-medium truncate'>
                                                                <p>
                                                                    {
                                                                        event.title
                                                                    }
                                                                </p>
                                                                <p>
                                                                    {
                                                                        event
                                                                            .organizer
                                                                            ?.email
                                                                    }
                                                                </p>
                                                            </div>
                                                            <div className='text-gray'></div>
                                                        </div>
                                                    </Link>
                                                ))
                                            )}
                                        </div>
                                    ))
                            ) : (
                                <div className='text-center text-gray text-xs py-2'>
                                    No events this week
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Events Accordion */}
            <div className='border-b'>
                <button className='flex items-center justify-between w-full p-3 text-sm font-medium text-left'>
                    <div className='flex gap-1 items-center w-full text-dark-gray'>
                        <EventsIcon />
                        <span>Events (as an organizer)</span>
                        <Checkbox
                            onClick={(e) => e.stopPropagation()}
                            className='ms-auto'
                            checked={rolesFilter.includes('organizer')}
                            onCheckedChange={(val) =>
                                dispatch(
                                    setRolesFilter(
                                        val === true
                                            ? [...rolesFilter, 'organizer']
                                            : rolesFilter.filter(
                                                  (r) => r !== 'organizer',
                                              ),
                                    ),
                                )
                            }
                        />
                    </div>
                </button>
            </div>
            {/* Events Accordion */}
            <div className='border-b'>
                <button
                    className='flex items-center justify-between w-full p-3 text-sm font-medium text-left'
                    onClick={() => toggleSection('events')}
                >
                    <div className='flex gap-1 items-center w-full text-dark-gray'>
                        <ChevronDown
                            className={cn(
                                'h-4 w-4 transition-transform',
                                expanded.events ? 'rotate-180' : '',
                            )}
                        />
                        <EventsIcon />
                        <span>Events (as an attendee)</span>
                        <Checkbox
                            onClick={(e) => e.stopPropagation()}
                            className='ms-auto'
                            checked={eventFilter.length === 5}
                            onCheckedChange={(val) => {
                                dispatch(
                                    setEventFilter(
                                        val === true
                                            ? eventOptions.map((op) => op.value)
                                            : [],
                                    ),
                                );
                            }}
                        />
                    </div>
                </button>

                {expanded.events && (
                    <div className='p-3 pt-0 space-y-2'>
                        {eventOptions.map((item) => (
                            <div
                                className='flex justify-between items-center'
                                key={item.value}
                            >
                                <div className='flex gap-2 items-center text-sm text-gray'>
                                    {item.icon}
                                    {item.label}
                                </div>
                                <Checkbox
                                    checked={isFilterActive(
                                        'event',
                                        item.value,
                                    )}
                                    onCheckedChange={(val) =>
                                        dispatch(
                                            setEventFilter(
                                                val === true
                                                    ? [
                                                          ...eventFilter,
                                                          item.value,
                                                      ]
                                                    : eventFilter.filter(
                                                          (f) =>
                                                              f !== item.value,
                                                      ),
                                            ),
                                        )
                                    }
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Todo Accordion */}
            <div className='border-b'>
                <button
                    className='flex items-center justify-between w-full p-3 text-sm font-medium text-left'
                    onClick={() => toggleSection('todo')}
                >
                    <div className='flex gap-1 items-center w-full text-dark-gray'>
                        <ChevronDown
                            className={cn(
                                'h-4 w-4 transition-transform',
                                expanded.todo ? 'rotate-180' : '',
                            )}
                        />
                        <TodoIcon />
                        <span className='ps-2'>To-Do</span>
                        <Checkbox
                            onClick={(e) => e.stopPropagation()}
                            className='ms-auto'
                            checked={todoFilter.length === 3}
                            onCheckedChange={(val) =>
                                dispatch(
                                    setTodoFilter(
                                        val === true
                                            ? todoOptions.map((op) => op.value)
                                            : [],
                                    ),
                                )
                            }
                        />
                    </div>
                </button>

                {expanded.todo && (
                    <div className='p-3 pt-0 space-y-2'>
                        {todoOptions.map((item) => (
                            <div
                                className='flex justify-between items-center'
                                key={item.value}
                            >
                                <div className='flex gap-2 items-center text-sm text-gray'>
                                    {item.icon}
                                    {item.label}
                                </div>
                                <Checkbox
                                    checked={isFilterActive('todo', item.value)}
                                    onCheckedChange={(val) =>
                                        dispatch(
                                            setTodoFilter(
                                                val === true
                                                    ? [
                                                          ...todoFilter,
                                                          item.value,
                                                      ]
                                                    : todoFilter.filter(
                                                          (f) =>
                                                              f !== item.value,
                                                      ),
                                            ),
                                        )
                                    }
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {/* priority Accordion */}
            <div className='border-b'>
                <button
                    className='flex items-center justify-between w-full p-3 text-sm font-medium text-left'
                    onClick={() => toggleSection('holiday')}
                >
                    <div className='flex items-center gap-1 w-full text-dark-gray'>
                        <ChevronDown
                            className={cn(
                                'h-4 w-4 transition-transform',
                                expanded.holiday ? 'rotate-180' : '',
                            )}
                        />
                        <HolidayIcon />
                        <span className='ps-2'>Priority</span>
                        <Checkbox
                            onClick={(e) => e.stopPropagation()}
                            className='ms-auto'
                            checked={priorityFilter.length === 3}
                            onCheckedChange={(val) =>
                                dispatch(
                                    setPriorityFilter(
                                        val === true
                                            ? priorityOptions.map(
                                                  (op) => op.value,
                                              )
                                            : [],
                                    ),
                                )
                            }
                        />
                    </div>
                </button>

                {expanded.holiday && (
                    <div className='p-3 pt-0 space-y-2'>
                        {priorityOptions.map((item) => (
                            <div
                                className='flex justify-between items-center'
                                key={item.value}
                            >
                                <div className='flex gap-2 items-center text-sm text-gray'>
                                    {item.label}
                                </div>
                                <Checkbox
                                    checked={isFilterActive(
                                        'holiday',
                                        item.value,
                                    )}
                                    onCheckedChange={(val) =>
                                        dispatch(
                                            setPriorityFilter(
                                                val === true
                                                    ? [
                                                          ...priorityFilter,
                                                          item.value,
                                                      ]
                                                    : priorityFilter.filter(
                                                          (f) =>
                                                              f !== item.value,
                                                      ),
                                            ),
                                        )
                                    }
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* type accordinon */}
            <div>
                <button
                    onClick={() => toggleSection('type')}
                    className='flex items-center justify-between w-full p-3 text-sm font-medium text-left'
                >
                    <ChevronDown
                        className={cn(
                            'h-4 w-4 transition-transform',
                            expanded.type ? 'rotate-180' : '',
                        )}
                    />
                    <div className='flex items-center gap-1 w-full text-dark-gray'>
                        <CalendarFold className='text-gray' />
                        <span className='ps-2'>Type</span>
                        <Checkbox
                            onClick={(e) => e.stopPropagation()}
                            className='ms-auto'
                            checked={typeFilter.length === 2}
                            onCheckedChange={(val) =>
                                dispatch(
                                    setTypeFilter(
                                        val === true
                                            ? typeOptions.map((op) => op.value)
                                            : [],
                                    ),
                                )
                            }
                        />
                    </div>
                </button>

                {expanded.type && (
                    <div className='p-3 pt-0 space-y-2'>
                        {typeOptions.map((item) => (
                            <div
                                className='flex justify-between items-center'
                                key={item.value}
                            >
                                <div className='flex gap-2 items-center text-sm text-gray'>
                                    {item.label}
                                </div>
                                <Checkbox
                                    checked={isFilterActive(
                                        'eventType',
                                        item.value,
                                    )}
                                    onCheckedChange={(val) =>
                                        dispatch(
                                            setTypeFilter(
                                                val === true
                                                    ? [
                                                          ...typeFilter,
                                                          item.value,
                                                      ]
                                                    : typeFilter.filter(
                                                          (f) =>
                                                              f !== item.value,
                                                      ),
                                            ),
                                        )
                                    }
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
