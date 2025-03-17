'use client';
import Calendar from '@/components/calendar/Calendar';
import { CalendarSidebar } from '@/components/calendar/CalendarSidebar';
import { EventPopoverProvider } from '@/components/calendar/CreateEvent/EventPopover';
import FilterModal from '@/components/global/FilterModal/FilterModal';
import GlobalHeader from '@/components/global/GlobalHeader';
import AvailabilityIcon from '@/components/svgs/calendar/Availability';
import MyInvitationsIcon from '@/components/svgs/calendar/MyInvitationsIcon';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Plus, UserRoundPlus } from 'lucide-react';
import React, { useState } from 'react';

const CalendarPage = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    return (
        <div className='pt-2'>
            <GlobalHeader
                title='Calendar'
                subTitle='Plan, Organize, and Stay On Track with Schedule'
                buttons={
                    <div className='flex gap-2'>
                        <Button
                            className='text-dark-gray fill-none stroke-none'
                            variant={'secondary'}
                            icon={<MyInvitationsIcon />}
                        >
                            My Invitaions
                        </Button>
                        <Button
                            size={'icon'}
                            tooltip='My Availability'
                            className='text-dark-gray fill-none stroke-none'
                            icon={<AvailabilityIcon />}
                            variant={'secondary'}
                        ></Button>
                        <FilterModal
                            value={[]}
                            columns={[]}
                            onChange={() => null}
                        />
                        <Button icon={<Plus size={18} />}>Create New</Button>
                    </div>
                }
            />
            <EventPopoverProvider>
                <div className='grid grid-cols-[4fr_1fr] gap-2'>
                    <Calendar />
                    <CalendarSidebar
                        currentDate={currentDate}
                        onDateSelect={setCurrentDate}
                    />
                </div>
            </EventPopoverProvider>
        </div>
    );
};

export default CalendarPage;
