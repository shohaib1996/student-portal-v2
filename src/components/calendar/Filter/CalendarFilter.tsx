'use client';
import EventsIcon from '../svgs/calendar/EventsIcon';
import FilterIcon from '../svgs/calendar/FilterIcon';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import {
    setEventFilter,
    setPriorityFilter,
    setRolesFilter,
    setTodoFilter,
    setTypeFilter,
} from '../reducer/calendarReducer';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import React, { useCallback, useState } from 'react';
import {
    eventOptions,
    priorityOptions,
    todoOptions,
    typeOptions,
} from '../CalendarSidebar';
import { CalendarFold, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import TodoIcon from '../svgs/calendar/TodoIcon';
import HolidayIcon from '../svgs/calendar/HolidayIcon';
import useResponsive from '@/hooks/useResponsive';

const CalendarFilter = () => {
    const {
        eventFilter,
        rolesFilter,
        holidayFilter,
        priorityFilter,
        todoFilter,
        typeFilter,
    } = useAppSelector((s) => s.calendar);

    const dispatch = useAppDispatch();
    const isMobile = useResponsive('max-width: 740px');
    console.log(isMobile);

    const [eventOpen, setEventOpen] = useState(false);
    const [todoOpen, setTodoOpen] = useState(false);
    const [priorityOpen, setPriorityOpen] = useState(false);
    const [typeOpen, setTypeOpen] = useState(false);

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
                const exist = (priorityFilter as string[]).find(
                    (f) => f === value,
                );
                if (exist) {
                    return true;
                } else {
                    return false;
                }
            }
        },
        [eventFilter, todoFilter, priorityFilter],
    );

    return (
        <div>
            <Popover>
                <PopoverTrigger>
                    <Button className='text-dark-gray' variant={'secondary'}>
                        <FilterIcon className='stroke-dark-gray' />
                        Filters
                    </Button>
                </PopoverTrigger>
                <PopoverContent className='p-1' side='bottom'>
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

                    <Popover open={eventOpen} onOpenChange={setEventOpen}>
                        <PopoverTrigger className='w-full'>
                            <button className='flex items-center justify-between w-full p-3 text-sm font-medium text-left'>
                                <ChevronDown
                                    className={cn(
                                        'h-4 w-4 transition-transform',
                                        eventOpen ? 'rotate-90' : '',
                                    )}
                                />
                                <div className='flex gap-1 ps-1 items-center w-full text-dark-gray'>
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
                                                        ? eventOptions.map(
                                                              (op) => op.value,
                                                          )
                                                        : [],
                                                ),
                                            );
                                        }}
                                    />
                                </div>
                            </button>
                        </PopoverTrigger>
                        <PopoverContent side={isMobile ? 'bottom' : 'right'}>
                            <div className='p-3 py-0 space-y-2'>
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
                                                                      f !==
                                                                      item.value,
                                                              ),
                                                    ),
                                                )
                                            }
                                        />
                                    </div>
                                ))}
                            </div>
                        </PopoverContent>
                    </Popover>

                    <Popover open={todoOpen} onOpenChange={setTodoOpen}>
                        <PopoverTrigger className='w-full'>
                            <button className='flex items-center justify-between w-full p-3 text-sm font-medium text-left'>
                                <ChevronDown
                                    className={cn(
                                        'h-4 w-4 transition-transform',
                                        todoOpen ? 'rotate-90' : '',
                                    )}
                                />
                                <div className='flex gap-1 ps-1 items-center w-full text-dark-gray'>
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
                                                        ? todoOptions.map(
                                                              (op) => op.value,
                                                          )
                                                        : [],
                                                ),
                                            )
                                        }
                                    />
                                </div>
                            </button>
                        </PopoverTrigger>
                        <PopoverContent side={isMobile ? 'bottom' : 'right'}>
                            <div className='p-3 py-0 space-y-2'>
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
                                            checked={isFilterActive(
                                                'todo',
                                                item.value,
                                            )}
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
                                                                      f !==
                                                                      item.value,
                                                              ),
                                                    ),
                                                )
                                            }
                                        />
                                    </div>
                                ))}
                            </div>
                        </PopoverContent>
                    </Popover>

                    <Popover open={priorityOpen} onOpenChange={setPriorityOpen}>
                        <PopoverTrigger className='w-full'>
                            <button className='flex items-center justify-between w-full p-3 text-sm font-medium text-left'>
                                <ChevronDown
                                    className={cn(
                                        'h-4 w-4 transition-transform',
                                        priorityOpen ? 'rotate-90' : '',
                                    )}
                                />
                                <div className='flex ps-1 items-center gap-1 w-full text-dark-gray'>
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
                        </PopoverTrigger>
                        <PopoverContent side={isMobile ? 'bottom' : 'right'}>
                            <div className='p-3 py-0 space-y-2'>
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
                                                                      f !==
                                                                      item.value,
                                                              ),
                                                    ),
                                                )
                                            }
                                        />
                                    </div>
                                ))}
                            </div>
                        </PopoverContent>
                    </Popover>

                    <Popover open={typeOpen} onOpenChange={setTypeOpen}>
                        <PopoverTrigger className='w-full'>
                            <button className='flex items-center justify-between w-full p-3 text-sm font-medium text-left'>
                                <ChevronDown
                                    className={cn(
                                        'h-4 w-4 transition-transform',
                                        typeOpen ? 'rotate-90' : '',
                                    )}
                                />
                                <div className='flex items-center gap-1 w-full text-dark-gray'>
                                    <CalendarFold
                                        // size={18}
                                        className='text-gray'
                                    />
                                    <span className='ps-2'>Type</span>
                                </div>
                            </button>
                        </PopoverTrigger>
                        <PopoverContent side={isMobile ? 'bottom' : 'right'}>
                            <div className='p-3 py-0 space-y-2'>
                                {typeOptions.map((item) => (
                                    <div
                                        className='flex justify-between items-center'
                                        key={item.value}
                                    >
                                        <div className='flex gap-2 items-center text-sm text-gray'>
                                            {item.label}
                                        </div>
                                        <Checkbox
                                            checked={typeFilter === item.value}
                                            onCheckedChange={(val) =>
                                                dispatch(
                                                    setTypeFilter(item.value),
                                                )
                                            }
                                        />
                                    </div>
                                ))}
                            </div>
                        </PopoverContent>
                    </Popover>
                </PopoverContent>
            </Popover>
        </div>
    );
};

export default CalendarFilter;
