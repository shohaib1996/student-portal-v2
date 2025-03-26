'use client';
import Calendar from '@/components/calendar/Calendar';
import { CalendarSidebar } from '@/components/calendar/CalendarSidebar';
import CreateEventModal from '@/components/calendar/CreateEvent/CreateEventModal';
import FilterModal from '@/components/global/FilterModal/FilterModal';
import GlobalHeader from '@/components/global/GlobalHeader';
import AvailabilityIcon from '@/components/svgs/calendar/Availability';
import MyInvitationsIcon from '@/components/svgs/calendar/MyInvitationsIcon';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetHeader,
    SheetOverlay,
    SheetPortal,
    SheetTrigger,
} from '@/components/ui/sheet';
import { CalendarIcon, Plus, X } from 'lucide-react';
import React, { useState } from 'react';

import * as SheetPrimitive from '@radix-ui/react-dialog';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import EventDetails from '@/components/calendar/EventDetails';
import { EventPopoverProvider } from '@/components/calendar/CreateEvent/EventPopover';
import Link from 'next/link';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import FilterIcon from '@/components/svgs/common/FilterIcon';
import CalendarFilter from '@/components/calendar/Filter/CalendarFilter';

interface CustomSheetContentProps
    extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content> {
    className?: string;
}

const CustomSheetContent = React.forwardRef<
    React.ComponentRef<typeof SheetPrimitive.Content>,
    CustomSheetContentProps
>(({ className, children, ...props }, ref) => (
    <SheetPortal>
        <SheetOverlay />
        <SheetPrimitive.Content
            ref={ref}
            className={cn(
                'fixed z-50 gap-4 bg-background p-6 transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out',
                'inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm',
                className,
            )}
            {...props}
        >
            {children}
        </SheetPrimitive.Content>
    </SheetPortal>
));
CustomSheetContent.displayName = 'CustomSheetContent';

const CalendarPage = () => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const router = useRouter();
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
                            <Link href={'/calendar/my-invitations'}>
                                My Invitaions
                            </Link>
                        </Button>
                        <Button
                            onClick={() =>
                                router.push('/calendar/availability')
                            }
                            size={'icon'}
                            tooltip='My Availability'
                            className='text-dark-gray fill-none stroke-none'
                            icon={<AvailabilityIcon />}
                            variant={'secondary'}
                        ></Button>
                        <CalendarFilter />
                        <Button icon={<Plus size={18} />}>Create New</Button>
                    </div>
                }
            />
            <>
                <Sheet>
                    <div className='flex gap-2 h-[calc(100vh-120px)]'>
                        <Calendar />
                        <div className='min-[1000px]:block hidden'>
                            <CalendarSidebar
                                currentDate={currentDate}
                                onDateSelect={setCurrentDate}
                            />
                        </div>
                        <CustomSheetContent className='p-0'>
                            <ScrollArea className='h-full'>
                                <div className='mx-auto w-full max-w-sm p-4 max-[1000px]:p-0'>
                                    <SheetHeader className='flex-row items-center justify-between w-full p-2 border-b border-forground-border'>
                                        <h2 className='text-dark-gray font-semibold'>
                                            Calendar Filters
                                        </h2>
                                        <SheetClose asChild>
                                            <Button
                                                variant='ghost'
                                                size='icon'
                                                className='h-8 w-8'
                                            >
                                                <X className='h-4 w-4' />
                                                <span className='sr-only'>
                                                    Close
                                                </span>
                                            </Button>
                                        </SheetClose>
                                    </SheetHeader>
                                    <CalendarSidebar
                                        currentDate={currentDate}
                                        onDateSelect={setCurrentDate}
                                    />
                                </div>
                            </ScrollArea>
                        </CustomSheetContent>
                    </div>
                </Sheet>
            </>
        </div>
    );
};

export default CalendarPage;
