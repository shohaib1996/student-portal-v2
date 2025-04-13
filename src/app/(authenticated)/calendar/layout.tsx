import CreateEventModal from '@/components/calendar/CreateEvent/CreateEventModal';
import { EventPopoverProvider } from '@/components/calendar/CreateEvent/EventPopover';
import EventDetails from '@/components/calendar/EventDetails';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Calendar | BootcampsHub Portal',
    description:
        'Plan, Organize, and Stay On Track with Schedule of BootcampsHub Portal',
};

export default function CalendarLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <EventPopoverProvider>
            {children}
            <CreateEventModal />
            <EventDetails />
        </EventPopoverProvider>
    );
}
