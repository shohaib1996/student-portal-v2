'use client';
import Calendar from '@/components/calendar/Calendar';
import FilterModal from '@/components/global/FilterModal/FilterModal';
import GlobalHeader from '@/components/global/GlobalHeader';
import AvailabilityIcon from '@/components/svgs/calendar/Availability';
import MyInvitationsIcon from '@/components/svgs/calendar/MyInvitationsIcon';
import { Button } from '@/components/ui/button';
import { Plus, UserRoundPlus } from 'lucide-react';
import React from 'react';

const CalendarPage = () => {
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
            <Calendar />
        </div>
    );
};

export default CalendarPage;
