import CreateEventModal from '@/components/calendar/CreateEvent/CreateEventModal';
import { EventPopoverProvider } from '@/components/calendar/CreateEvent/EventPopover';
import EventDetails from '@/components/calendar/EventDetails';

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
