'use client';

import { useState } from 'react';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { CalendarIcon, ChevronLeft, ChevronRight, Search } from 'lucide-react';

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

type CalendarView = 'day' | 'week' | 'month';

export default function Calendar() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState<CalendarView>('month');
    const [hoursView, setHoursView] = useState<string>('24 hours view');

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
            <div className='flex flex-wrap gap-2 items-center justify-between py-2 border-b border-forground-border bg-background'>
                <div className='flex items-center gap-2'>
                    <div className='flex items-center gap-1'>
                        <Button
                            variant={'plain'}
                            size='icon'
                            className='h-8 w-8 rounded-full'
                            onClick={navigateToPrevious}
                        >
                            <ChevronLeft className='h-4 w-4' />
                        </Button>
                        <Button
                            variant='plain'
                            size='icon'
                            className='h-8 w-8 rounded-full'
                            onClick={navigateToNext}
                        >
                            <ChevronRight className='h-4 w-4' />
                        </Button>
                    </div>
                    <h3 className='text-base text-dark-gray font-medium'>
                        {getHeaderText()}
                    </h3>
                    <Select
                        value={view}
                        onValueChange={(value) =>
                            setView(value as CalendarView)
                        }
                    >
                        <SelectTrigger className='w-[100px] h-8'>
                            <SelectValue placeholder='Select view' />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value='day'>Day</SelectItem>
                            <SelectItem value='week'>Week</SelectItem>
                            <SelectItem value='month'>Month</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button
                        variant='outline'
                        size='sm'
                        className='h-8'
                        onClick={navigateToToday}
                    >
                        Today
                    </Button>
                </div>
                <div className='flex items-center gap-3'>
                    <Select value={hoursView} onValueChange={setHoursView}>
                        <SelectTrigger className='w-[150px] h-8'>
                            <SelectValue placeholder='Hours view' />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value='24 hours view'>
                                24 hours view
                            </SelectItem>
                            <SelectItem value='business hours'>
                                Business hours
                            </SelectItem>
                        </SelectContent>
                    </Select>

                    <div className='relative'>
                        <Search className='absolute left-2.5 top-2 h-4 w-4 text-muted-foreground' />
                        <Input
                            type='search'
                            placeholder='Search people/events/status...'
                            className='pl-8 h-8 w-[220px]'
                        />
                    </div>
                    <SheetTrigger className='min-[1000px]:hidden' asChild>
                        <Button variant="outline" size="icon">
                            <CalendarIcon className="h-4 w-4" />
                            <span className="sr-only">Open calendar sidebar</span>
                        </Button>
                    </SheetTrigger>
                </div>
            </div>

            <div
                className={cn(
                    'flex-1 overflow-auto',
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
