'use client';

import { useState } from 'react';
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
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

interface CalendarAccordionsProps {
    currentDate: Date;
    onDateSelect: (date: Date) => void;
}

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
        todo: true,
    });

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

    // Get all events
    const getAllEvents = () => {
        return items.filter((item) => !item.isTodo);
    };

    // Get all todos
    const getAllTodos = () => {
        return items.filter((item) => item.isTodo);
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
    const allEvents = getAllEvents();
    const allTodos = getAllTodos();

    return (
        <div className='w-full border-l flex flex-col h-full overflow-y-auto'>
            {/* Month Accordion */}
            <div className='border-b'>
                <button
                    className='flex items-center justify-between w-full p-3 text-sm font-medium text-left'
                    onClick={() => toggleSection('month')}
                >
                    <span>{format(currentDate, 'MMMM yyyy')}</span>
                    <ChevronDown
                        className={cn(
                            'h-4 w-4 transition-transform',
                            expanded.month ? 'rotate-180' : '',
                        )}
                    />
                </button>

                {expanded.month && (
                    <div className='p-3 pt-0'>
                        {/* Week navigation */}
                        <div className='flex justify-between items-center mb-3'>
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
                    onClick={() => toggleSection('events')}
                >
                    <div className='flex items-center'>
                        <Calendar className='h-4 w-4 mr-2' />
                        <span>Events</span>
                    </div>
                    <ChevronDown
                        className={cn(
                            'h-4 w-4 transition-transform',
                            expanded.events ? 'rotate-180' : '',
                        )}
                    />
                </button>

                {expanded.events && (
                    <div className='p-3 pt-0'>
                        {allEvents.length > 0 ? (
                            <div className='space-y-2'>
                                {allEvents.map((event) => (
                                    <div
                                        key={event.id}
                                        className={cn(
                                            'p-2 rounded bg-gray-50 text-xs',
                                            event.color,
                                        )}
                                    >
                                        <div className='flex items-center justify-between mb-1'>
                                            <div className='font-medium'>
                                                {event.title}
                                            </div>
                                            <div className='text-gray-500 text-[10px]'>
                                                {format(event.date, 'MMM d')}
                                            </div>
                                        </div>
                                        <div className='flex items-center text-gray-500 mb-1'>
                                            <Clock className='h-3 w-3 mr-1' />
                                            <span>
                                                {event.time} ({event.duration})
                                            </span>
                                        </div>
                                        {event.attendees.length > 0 && (
                                            <div className='flex items-center text-gray-500'>
                                                <User className='h-3 w-3 mr-1' />
                                                <span className='truncate'>
                                                    {event.attendees[0]}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className='text-center text-gray-500 text-xs py-2'>
                                No events
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Todo Accordion */}
            <div className='border-b'>
                <button
                    className='flex items-center justify-between w-full p-3 text-sm font-medium text-left'
                    onClick={() => toggleSection('todo')}
                >
                    <div className='flex items-center'>
                        <CheckSquare className='h-4 w-4 mr-2' />
                        <span>Todo</span>
                    </div>
                    <ChevronDown
                        className={cn(
                            'h-4 w-4 transition-transform',
                            expanded.todo ? 'rotate-180' : '',
                        )}
                    />
                </button>

                {expanded.todo && (
                    <div className='p-3 pt-0'>
                        {allTodos.length > 0 ? (
                            <div className='space-y-2'>
                                {allTodos.map((todo) => (
                                    <div
                                        key={todo.id}
                                        className={cn(
                                            'p-2 rounded bg-gray-50 text-xs flex items-start gap-2',
                                            todo.color,
                                        )}
                                    >
                                        <Checkbox
                                            id={`todo-${todo.id}`}
                                            className='mt-0.5'
                                            defaultChecked={todo.completed}
                                        />
                                        <div className='flex-1'>
                                            <label
                                                htmlFor={`todo-${todo.id}`}
                                                className={cn(
                                                    'font-medium block mb-1',
                                                    todo.completed &&
                                                        'line-through text-gray-500',
                                                )}
                                            >
                                                {todo.title}
                                            </label>
                                            <div className='flex items-center text-gray-500 mb-1'>
                                                <Clock className='h-3 w-3 mr-1' />
                                                <span>
                                                    {format(todo.date, 'MMM d')}{' '}
                                                    at {todo.time} (
                                                    {todo.duration})
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className='text-center text-gray-500 text-xs py-2'>
                                No todos
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
