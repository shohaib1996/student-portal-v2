'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, ChevronDown } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface Event {
    id: string;
    title: string;
    description: string;
    image: string;
    date: {
        month: string;
        day: string;
    };
    interested?: boolean;
}

interface UpcomingEventsProps {
    setEvent?: (eventId: string) => void;
}

// Mock data for upcoming events
const mockEvents: Event[] = [
    {
        id: 'event1',
        title: 'Connect with our social media',
        description:
            "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's...",
        image: '/images/community/one.png',
        date: {
            month: 'March',
            day: '12',
        },
        interested: false,
    },
    {
        id: 'event2',
        title: 'Connect with our social media',
        description:
            "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's...",
        image: '/images/community/two.png',
        date: {
            month: 'March',
            day: '12',
        },
        interested: false,
    },
    {
        id: 'event3',
        title: 'Virtual Tech Meetup',
        description:
            'Join us for an exciting virtual meetup to discuss the latest trends in technology and innovation.',
        image: '/images/community/one.png',
        date: {
            month: 'April',
            day: '05',
        },
        interested: false,
    },
    {
        id: 'event4',
        title: 'Community Hackathon',
        description:
            'A 24-hour coding challenge to build innovative solutions for real-world problems.',
        image: '/images/community/two.png',
        date: {
            month: 'April',
            day: '15',
        },
        interested: false,
    },
    {
        id: 'event5',
        title: 'Networking Night',
        description:
            'An evening of networking with professionals and enthusiasts from various industries.',
        image: '/images/community/one.png',
        date: {
            month: 'May',
            day: '03',
        },
        interested: false,
    },
];

const UpcomingEvents = ({ setEvent }: UpcomingEventsProps) => {
    const [events, setEvents] = useState<Event[]>(mockEvents.slice(0, 2));
    const [isLoading, setIsLoading] = useState(false);
    const [showAllEvents, setShowAllEvents] = useState(false);

    useEffect(() => {
        if (showAllEvents) {
            setEvents(mockEvents);
        } else {
            setEvents(mockEvents.slice(0, 2));
        }
    }, [showAllEvents]);

    const toggleInterested = (eventId: string) => {
        setEvents(
            events.map((event) =>
                event.id === eventId
                    ? { ...event, interested: !event.interested }
                    : event,
            ),
        );
    };

    if (isLoading) {
        return <UpcomingEventsSkeleton />;
    }

    return (
        <Card className='overflow-hidden border-border bg-foreground shadow-sm mt-2 mr-2'>
            <CardHeader className='bg-foreground pl-0 pb-3 pt-4 mx-3 border-b border-border'>
                <h2 className='text-lg font-semibold text-black'>
                    Upcoming Events
                </h2>
            </CardHeader>
            <CardContent className='p-0 relative'>
                <div className=''>
                    {events.map((event, index) => (
                        <div
                            key={event.id}
                            className='my-2 ml-2.5 mr-3 bg-background p-2 border border-border rounded-lg'
                        >
                            <div className='relative'>
                                <div className='absolute left-0 top-0 bg-primary text-white text-center py-1 px-2 rounded w-14 flex flex-col'>
                                    <span className='text-xs font-medium'>
                                        {event.date.month}
                                    </span>
                                    <span className='text-lg font-bold leading-tight'>
                                        {event.date.day}
                                    </span>
                                </div>
                                <Image
                                    src={event.image || '/placeholder.svg'}
                                    alt={event.title}
                                    width={600}
                                    height={200}
                                    className='w-full h-48 object-cover'
                                />
                            </div>
                            <div className='px-4 pt-3'>
                                <h3 className='font-semibold text-black text-lg mb-1'>
                                    {event.title}
                                </h3>
                                <p className='text-sm text-gray mb-3'>
                                    {event.description}
                                </p>
                                <div className='flex justify-center'>
                                    {index === 0 ? (
                                        <Button
                                            variant='outline'
                                            size='sm'
                                            className='rounded-full px-4 bg-primary-light text-primary border-border-primary-light hover:bg-background hover:text-primary'
                                            onClick={() =>
                                                toggleInterested(event.id)
                                            }
                                        >
                                            <Star className='h-4 w-4 mr-1.5 fill-current' />
                                            Interested
                                        </Button>
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className='-mt-8 bg-background flex items-center justify-center mx-2.5 mb-2.5 pb-2.5'>
                    <div className='flex items-center w-full px-4'>
                        <div className='h-px bg-border flex-grow'></div>
                        <Button
                            onClick={() => setShowAllEvents(!showAllEvents)}
                            variant='outline'
                            size='sm'
                            className='mx-4 rounded-full px-4 bg-primary-light text-primary border-border-primary-light hover:bg-primary-light hover:text-primary'
                        >
                            {showAllEvents ? 'View Less' : 'View More'}
                            <ChevronDown className='h-4 w-4 ml-1' />
                        </Button>
                        <div className='h-px bg-border flex-grow'></div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

// Skeleton component for loading state
const UpcomingEventsSkeleton = () => {
    return (
        <Card className='overflow-hidden border-border bg-gray shadow-sm'>
            <CardHeader className='bg-gray pb-3 pt-4 px-4'>
                <Skeleton className='h-6 w-40' />
            </CardHeader>
            <CardContent className='p-0'>
                <div className='divide-y divide-borborder-border'>
                    {[1, 2].map((i) => (
                        <div key={i} className='pb-4'>
                            <Skeleton className='h-48 w-full' />
                            <div className='px-4 pt-3'>
                                <Skeleton className='h-6 w-3/4 mb-2' />
                                <Skeleton className='h-4 w-full mb-1' />
                                <Skeleton className='h-4 w-full mb-3' />
                                <div className='flex justify-center'>
                                    <Skeleton className='h-8 w-32 rounded-full' />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className='flex justify-center py-4'>
                    <Skeleton className='h-8 w-full mx-4' />
                </div>
            </CardContent>
        </Card>
    );
};

export default UpcomingEvents;
