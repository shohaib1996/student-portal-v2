'use client';

import { useEffect, useState } from 'react';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import {
    CalendarIcon,
    ChevronLeft,
    ChevronRight,
    PanelRightOpen,
    Search,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { MonthView } from './monthView';
import { WeekView } from './WeekView';
import { DayView } from './DayView';
import { SheetTrigger } from '../ui/sheet';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setEventQuery } from './reducer/calendarReducer';
import useDebounce from '@/hooks/useDebounce';

type CalendarView = 'day' | 'week' | 'month';

export default function Calendar() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState<CalendarView>('month');
    const [hoursView, setHoursView] = useState<string>('24 hours view');
    const { query } = useAppSelector((s) => s.calendar);
    const [searchValue, setSearchValue] = useState('');
    const dispatch = useAppDispatch();
    const debouncedSearchValue = useDebounce(searchValue, 300);

    useEffect(() => {
        dispatch(setEventQuery(debouncedSearchValue));
    }, [debouncedSearchValue]);

    const navigateToPrevious = () => {
        setCurrentDate((prev) => {
            const newDate = new Date(prev);
            if (view === 'day') {
                newDate.setDate(newDate.getDate() - 1);
            } else if (view === 'week') {
                newDate.setDate(newDate.getDate() - 7);
            } else {
                newDate.setMonth(newDate.getMonth() - 1);
            }
            return newDate;
        });
    };

    const navigateToNext = () => {
        setCurrentDate((prev) => {
            const newDate = new Date(prev);
            if (view === 'day') {
                newDate.setDate(newDate.getDate() + 1);
            } else if (view === 'week') {
                newDate.setDate(newDate.getDate() + 7);
            } else {
                newDate.setMonth(newDate.getMonth() + 1);
            }
            return newDate;
        });
    };

    const navigateToToday = () => {
        setCurrentDate(new Date());
    };

    const getHeaderText = () => {
        if (view === 'day') {
            return format(currentDate, 'EEEE, MMMM d, yyyy');
        } else if (view === 'week') {
            const start = startOfWeek(currentDate);
            const end = endOfWeek(currentDate);
            return `${format(start, 'MMM dd, yyyy')} - ${format(end, 'MMM dd, yyyy')}`;
        } else {
            return format(currentDate, 'MMMM yyyy');
        }
    };

    return (
        <div className='flex flex-col overflow-hidden w-full'>
            <div className='flex gap-2 flex-col 3xl:flex-row items-center justify-between py-2 border-b border-forground-border bg-background'>
                <div className='flex items-center 3xl:w-fit w-full gap-2'>
                    <div className='flex items-center gap-1'>
                        <Button
                            variant={'secondary'}
                            size='icon'
                            className='h-8 w-8 rounded-full'
                            onClick={navigateToPrevious}
                        >
                            <ChevronLeft className='h-4 w-4' />
                        </Button>
                        <Button
                            variant='secondary'
                            size='icon'
                            className='h-8 w-8 rounded-full'
                            onClick={navigateToNext}
                        >
                            <ChevronRight className='h-4 w-4' />
                        </Button>
                    </div>
                    <h3 className='text-base text-dark-gray font-medium truncate'>
                        {getHeaderText()}
                    </h3>
                    <Select
                        value={view}
                        onValueChange={(value) =>
                            setView(value as CalendarView)
                        }
                    >
                        <SelectTrigger className='w-[100px] ml-auto 3xl:ml-0 bg-foreground h-8'>
                            <SelectValue placeholder='Select view' />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value='day'>Day</SelectItem>
                            <SelectItem value='week'>Week</SelectItem>
                            <SelectItem value='month'>Month</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className='flex gap-1 items-center justify-between w-full'>
                    <Button
                        variant='secondary'
                        size='sm'
                        className='h-8'
                        onClick={navigateToToday}
                    >
                        Today
                    </Button>
                    <div className='flex items-center gap-3'>
                        <div className='relative'>
                            <Search className='absolute left-2.5 top-2 h-4 w-4 text-muted-foreground' />
                            <Input
                                defaultValue={query}
                                onChange={(e) => setSearchValue(e.target.value)}
                                type='search'
                                placeholder='Search people/events/status...'
                                className='pl-8 bg-foreground h-8 w-[220px]'
                            />
                        </div>
                    </div>
                    <SheetTrigger
                        className='min-[1000px]:hidden ms-auto'
                        asChild
                    >
                        <Button
                            variant='secondary'
                            className='h-8 text-dark-gray'
                            size='icon'
                        >
                            <PanelRightOpen className='h-4 w-4' />
                            <span className='sr-only'>
                                Open calendar sidebar
                            </span>
                        </Button>
                    </SheetTrigger>
                </div>
            </div>

            <div
                className={cn(
                    'flex-1 overflow-auto bg-foreground',
                    view === 'month' ? 'flex flex-col' : '',
                )}
            >
                {view === 'month' && <MonthView currentDate={currentDate} />}
                {view === 'week' && (
                    <WeekView currentDate={currentDate} hoursView={hoursView} />
                )}
                {view === 'day' && <DayView currentDate={currentDate} />}
            </div>
        </div>
    );
}
