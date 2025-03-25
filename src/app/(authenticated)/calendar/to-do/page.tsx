'use client';
import { EventPopoverTrigger } from '@/components/calendar/CreateEvent/EventPopover';
import { RangePickerCL } from '@/components/calendar/dateRangePicker/RangePickerCL';
import TodoBoard from '@/components/calendar/ToDo/TodoBoard';
import FilterModal from '@/components/global/FilterModal/FilterModal';
import GlobalHeader from '@/components/global/GlobalHeader';
import MyInvitationsIcon from '@/components/svgs/calendar/MyInvitationsIcon';
import { Button } from '@/components/ui/button';
import { useGetMyEventsQuery } from '@/redux/api/calendar/calendarApi';
import { TEvent } from '@/types/calendar/calendarTypes';
import { endOfMonth, startOfMonth } from 'date-fns';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { DateRange } from 'react-day-picker';

const TodoPage = () => {
    const [date, setDate] = useState<DateRange>({
        from: startOfMonth(new Date()),
        to: endOfMonth(new Date()),
    });
    const { data } = useGetMyEventsQuery({
        from: date.from,
        to: date.to,
    });

    const [tasks, setTasks] = useState<TEvent[]>([]);

    useEffect(() => {
        if (data?.events) {
            setTasks(data?.events?.filter((e) => e.type === 'task') || []);
        }
    }, [data?.events]);

    return (
        <div className='py-2'>
            <GlobalHeader
                title='All To-Do'
                subTitle='Plan, Organize, and Stay On Track with all task'
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
                        <RangePickerCL value={date} onChange={setDate} />
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
            <TodoBoard tasks={tasks} setTasks={setTasks} />
        </div>
    );
};

export default TodoPage;
