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
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import AcceptedIcon from '../svgs/calendar/AcceptedIcon';
import PendingIcon from '../svgs/calendar/PendingIcon';
import DeniedIcon from '../svgs/calendar/DeniedIcon';
import ProposeTimeIcon from '../svgs/calendar/ProposeTimeIcon';
import FinishedIcon from '../svgs/calendar/FinishedIcon';
import InProgressIcon from '../svgs/calendar/InProgressIcon';
import TodoIcon from '../svgs/calendar/TodoIcon';
import HolidayIcon from '../svgs/calendar/HolidayIcon';
import EventsIcon from '../svgs/calendar/EventsIcon';

interface CalendarAccordionsProps {
    currentDate: Date;
    onDateSelect: (date: Date) => void;
}

const eventOptions = [
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
const todoOptions = [
    {
        value: 'inProgress',
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
const holidayOptions = [
    {
        value: 'holidays',
        label: 'Holidays',
    },
    {
        value: 'weekends',
        label: 'Weekends',
    },
];

interface Event {
    id: string;
    title: string;
    date: Date;
    time: string;
    duration: string;
    attendees: string[];
    color: string;
    completed?: boolean;
    isTodo?: boolean;
}

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
    });

    const [eventFilter, setEventFilter] = useState<string[]>([]);
    const [todoFilter, setTodoFilter] = useState<string[]>([]);
    const [holidayFilter, setHolidayFilter] = useState<string[]>([]);
    const [sentFilter, setSentFilter] = useState('');

    const [selectedWeek, setSelectedWeek] = useState(startOfWeek(currentDate));

    // Sample events and todos
    const [items] = useState<Event[]>([
        {
            id: '1',
            title: 'Review meeting',
            date: new Date(2025, 1, 15, 10, 30),
            time: '10:30 AM',
            duration: '30 min',
            attendees: ['smith.wilson23@gmail.com'],
            color: 'border-l-4 border-green-500',
        },
        {
            id: '2',
            title: 'Executive team sync up meeting',
            date: new Date(2025, 1, 15, 12, 30),
            time: '12:30 PM',
            duration: '30 min',
            attendees: ['sarah.johnson@example.com'],
            color: 'border-l-4 border-blue-500',
        },
        {
            id: '3',
            title: 'Development team',
            date: new Date(2025, 1, 16, 14, 0),
            time: '2:00 PM',
            duration: '1 hr',
            attendees: ['dev.team@example.com'],
            color: 'border-l-4 border-purple-500',
        },
        {
            id: '4',
            title: 'Complete project proposal',
            date: new Date(2025, 1, 15, 9, 0),
            time: '9:00 AM',
            duration: '2 hrs',
            attendees: [],
            color: 'border-l-4 border-yellow-500',
            isTodo: true,
        },
        {
            id: '5',
            title: 'Review code PR',
            date: new Date(2025, 1, 16, 11, 0),
            time: '11:00 AM',
            duration: '1 hr',
            attendees: [],
            color: 'border-l-4 border-yellow-500',
            isTodo: true,
            completed: true,
        },
        {
            id: '6',
            title: 'Prepare presentation',
            date: new Date(2025, 1, 17, 13, 0),
            time: '1:00 PM',
            duration: '3 hrs',
            attendees: [],
            color: 'border-l-4 border-yellow-500',
            isTodo: true,
        },
    ]);

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

    // Get events for the selected week
    const getEventsForWeek = () => {
        const weekEnd = endOfWeek(selectedWeek);

        return items.filter((item) => {
            const itemDate = new Date(item.date);
            return (
                !item.isTodo && itemDate >= selectedWeek && itemDate <= weekEnd
            );
        });
    };

    // Group events by day
    const groupEventsByDay = (events: Event[]) => {
        const grouped: Record<string, Event[]> = {};

        events.forEach((event) => {
            const dateKey = format(event.date, 'yyyy-MM-dd');
            if (!grouped[dateKey]) {
                grouped[dateKey] = [];
            }
            grouped[dateKey].push(event);
        });

        return grouped;
    };

    const weekEvents = getEventsForWeek();
    const groupedWeekEvents = groupEventsByDay(weekEvents);

    const isFilterActive = useCallback(
        (type: 'event' | 'holiday' | 'todo', value: string) => {
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
                const exist = (holidayFilter as string[]).find(
                    (f) => f === value,
                );
                if (exist) {
                    return true;
                } else {
                    return false;
                }
            }
        },
        [eventFilter, todoFilter, holidayFilter],
    );

    return (
        <div className='w-full border-l flex flex-col h-full overflow-y-auto md:min-w-[270px] xl:min-w-[380px]'>
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
                        <div className='space-y-3'>
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
                                            {dayEvents.map((event) => (
                                                <div
                                                    key={event.id}
                                                    className={cn(
                                                        'p-2 mb-1 rounded bg-gray-50 text-xs',
                                                        event.color,
                                                    )}
                                                >
                                                    <div className='font-medium'>
                                                        {event.title}
                                                    </div>
                                                    <div className='text-gray-500'>
                                                        {event.time}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ))
                            ) : (
                                <div className='text-center text-gray-500 text-xs py-2'>
                                    No events this week
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Events Accordion */}
            <div className='border-b'>
                <button
                    className='flex items-center justify-between w-full p-3 text-sm font-medium text-left'
                    onClick={() => toggleSection('events2')}
                >
                    <div className='flex gap-1 items-center w-full text-dark-gray'>
                        <ChevronDown
                            className={cn(
                                'h-4 w-4 transition-transform',
                                expanded.events2 ? 'rotate-180' : '',
                            )}
                        />
                        <EventsIcon />
                        <span>Events (as an organizer)</span>
                    </div>
                </button>

                {expanded.events2 && (
                    <div className='p-3 pt-0 space-y-2'>
                        <div className='flex justify-between items-center'>
                            <div className='flex gap-2 items-center text-sm text-gray'>
                                <Send size={16} className='text-primary' />
                                Sent
                            </div>
                            <Checkbox
                                checked={sentFilter === 'sent'}
                                onCheckedChange={(val) =>
                                    setSentFilter(val === true ? 'sent' : '')
                                }
                            />
                        </div>
                    </div>
                )}
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
                            onCheckedChange={(val) =>
                                setEventFilter((prev) =>
                                    val === true
                                        ? eventOptions.map((op) => op.value)
                                        : [],
                                )
                            }
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
                                        setEventFilter((prev) =>
                                            val === true
                                                ? [...prev, item.value]
                                                : prev.filter(
                                                    (f) => f !== item.value,
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
                                setTodoFilter((prev) =>
                                    val === true
                                        ? todoOptions.map((op) => op.value)
                                        : [],
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
                                        setTodoFilter((prev) =>
                                            val === true
                                                ? [...prev, item.value]
                                                : prev.filter(
                                                    (f) => f !== item.value,
                                                ),
                                        )
                                    }
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {/* Holiday Accordion */}
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
                        <span className='ps-2'>Holidays</span>
                        <Checkbox
                            onClick={(e) => e.stopPropagation()}
                            className='ms-auto'
                            checked={holidayFilter.length === 2}
                            onCheckedChange={(val) =>
                                setHolidayFilter((prev) =>
                                    val === true
                                        ? holidayOptions.map((op) => op.value)
                                        : [],
                                )
                            }
                        />
                    </div>
                </button>

                {expanded.holiday && (
                    <div className='p-3 pt-0 space-y-2'>
                        {holidayOptions.map((item) => (
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
                                        setHolidayFilter((prev) =>
                                            val === true
                                                ? [...prev, item.value]
                                                : prev.filter(
                                                    (f) => f !== item.value,
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
