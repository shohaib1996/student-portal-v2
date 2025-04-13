import AllEvents from '@/components/calendar/Events/AllEvents';
import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'All Events | BootcampsHub Portal',
    description:
        'Plan, Organize, and Stay On Track with all events of BootcampsHub Portal',
};

const page = () => {
    return (
        <div>
            <AllEvents />
        </div>
    );
};

export default page;
