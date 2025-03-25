'use client';

import type React from 'react';
import { useEffect, useRef, useState, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Loader2, Search, ChevronDown, SlidersHorizontal } from 'lucide-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import AudioCard from './TextEditor/AudioCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

// Initialize dayjs plugins
dayjs.extend(relativeTime);

interface User {
    _id: string;
    firstName?: string;
    lastName?: string;
    fullName?: string;
    profilePicture?: string;
    type?: string;
}

interface Media {
    _id: string;
    url: string;
    type: string;
    name?: string;
    size?: number;
    createdAt: string;
    // For future implementation
    message?: string;
    sender?: User;
}

interface VoicesProps {
    chat: {
        _id: string;
        membersCount?: number;
        name?: string;
    };
}

// Mock users for demonstration until sender data is available
const mockUsers: User[] = [
    {
        _id: '1',
        firstName: 'Jane',
        lastName: 'Cooper',
        fullName: 'Jane Cooper',
        profilePicture:
            'https://ts4uportal-all-files-upload.nyc3.digitaloceanspaces.com/1736416051986-Shuvajit_Maitra',
        type: 'admin',
    },
    {
        _id: '2',
        firstName: 'Wade',
        lastName: 'Warren',
        fullName: 'Wade Warren',
        profilePicture: '/avatar/wade-warren.jpg',
        type: 'user',
    },
    {
        _id: '3',
        firstName: 'Shuvajit',
        lastName: 'Maitra',
        fullName: 'Shuvajit Maitra',
        profilePicture:
            'https://ts4uportal-all-files-upload.nyc3.digitaloceanspaces.com/1736416051986-Shuvajit_Maitra',
        type: 'marketing',
    },
    {
        _id: '4',
        firstName: 'Pilot',
        lastName: 'Demo',
        fullName: 'Pilot Demo',
        profilePicture:
            'https://ts4uportal-all-files-upload.nyc3.digitaloceanspaces.com/1740085425370-Demo.JPEG',
        type: 'marketing',
    },
];

// Mock messages for demonstration
const mockMessages = [
    "Here's the audio recording of today's meeting.",
    'Listen to this voice note I recorded for the project update.',
    'I recorded this audio feedback for your review.',
    'Voice note for your consideration.',
    'Recorded instructions about the upcoming feature.',
    'Audio summary of our discussion.',
    '',
    'Quick voice note about the changes.',
];

const Voices: React.FC<VoicesProps> = ({ chat }) => {
    const [medias, setMedias] = useState<Media[]>([]);
    const [filteredMedias, setFilteredMedias] = useState<Media[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const divRef = useRef<HTMLDivElement>(null);
    const initialLimit = 10; // Show 10 audio files initially

    // Fetch media items
    const fetchMedias = useCallback(
        (options: { limit: number; type: string; lastId?: string }) => {
            setIsLoading(true);
            axios
                .post(`/chat/media/${chat?._id}`, options)
                .then((res) => {
                    const mediaData = res.data?.medias || [];

                    // Enhance media data with mock user and message data
                    const enhancedMedias = mediaData.map((media: Media) => {
                        const randomUserIndex = Math.floor(
                            Math.random() * mockUsers.length,
                        );
                        const randomMessageIndex = Math.floor(
                            Math.random() * mockMessages.length,
                        );
                        return {
                            ...media,
                            sender: mockUsers[randomUserIndex],
                            message: mockMessages[randomMessageIndex],
                        };
                    });

                    setMedias(enhancedMedias);
                    setFilteredMedias(enhancedMedias);
                    setHasMore(mediaData.length === options.limit);
                    setIsLoading(false);
                })
                .catch((err) => {
                    setIsLoading(false);
                    console.error(err);
                    toast.error(
                        err?.response?.data?.error ||
                            'Failed to fetch audio files',
                    );
                });
        },
        [chat],
    );

    // Load more media items
    const loadMoreAudio = useCallback(() => {
        if (!hasMore || loadingMore) {
            return;
        }

        setLoadingMore(true);
        const lastId = medias[medias.length - 1]?._id;

        axios
            .post(`/chat/media/${chat?._id}`, {
                lastId,
                limit: initialLimit,
                type: 'voice',
            })
            .then((res) => {
                const mediaData = res.data?.medias || [];

                // Enhance media data with mock user and message data
                const enhancedMedias = mediaData.map((media: Media) => {
                    const randomUserIndex = Math.floor(
                        Math.random() * mockUsers.length,
                    );
                    const randomMessageIndex = Math.floor(
                        Math.random() * mockMessages.length,
                    );
                    return {
                        ...media,
                        sender: mockUsers[randomUserIndex],
                        message: mockMessages[randomMessageIndex],
                    };
                });

                const updatedMedias = [...medias, ...enhancedMedias];
                setMedias(updatedMedias);

                // Apply search filter to new results too
                if (searchQuery) {
                    handleSearch(searchQuery, updatedMedias);
                } else {
                    setFilteredMedias(updatedMedias);
                }

                setHasMore(mediaData.length === initialLimit);
                setLoadingMore(false);
            })
            .catch((err) => {
                setLoadingMore(false);
                console.error(err);
                toast.error(
                    err?.response?.data?.error ||
                        'Failed to load more audio files',
                );
            });
    }, [chat, medias, hasMore, loadingMore, searchQuery]);

    // Handle search functionality
    const handleSearch = useCallback(
        (query: string, mediaList?: Media[]) => {
            const dataToSearch = mediaList || medias;
            setSearchQuery(query);

            if (!query.trim()) {
                setFilteredMedias(dataToSearch);
                return;
            }

            const filtered = dataToSearch.filter((media) =>
                media.sender?.fullName
                    ?.toLowerCase()
                    .includes(query.toLowerCase()),
            );

            setFilteredMedias(filtered);
        },
        [medias],
    );

    // Initial data fetch
    useEffect(() => {
        if (chat?._id) {
            fetchMedias({ limit: initialLimit, type: 'voice' });
        }
    }, [chat, fetchMedias]);

    // Format date for display
    const formatDate = (dateString: string) => {
        const date = dayjs(dateString);
        const today = dayjs();

        if (date.isSame(today, 'day')) {
            return `Today, ${date.format('h:mm A')}`;
        } else if (date.isSame(today.subtract(1, 'day'), 'day')) {
            return `Yesterday, ${date.format('h:mm A')}`;
        } else {
            return date.format('MMM D, YYYY, h:mm A');
        }
    };

    // Render content conditionally
    const renderContent = () => {
        if (isLoading && medias.length === 0) {
            return (
                <div className='flex justify-center items-center py-16'>
                    <Loader2 className='h-8 w-8 text-primary animate-spin' />
                </div>
            );
        }

        if (filteredMedias.length === 0) {
            return (
                <div className='flex justify-center items-center flex-col py-16'>
                    <div className='rounded-full bg-gray-100 p-4 mb-4'>
                        <Search className='h-8 w-8 text-gray-400' />
                    </div>
                    <h4 className='text-center text-gray-500 font-medium'>
                        {searchQuery
                            ? `No audio files found for "${searchQuery}"`
                            : 'No audio files available'}
                    </h4>
                    {searchQuery && (
                        <Button
                            variant='ghost'
                            className='mt-2 text-blue-600 hover:text-blue-700'
                            onClick={() => {
                                setSearchQuery('');
                                setFilteredMedias(medias);
                            }}
                        >
                            Clear search
                        </Button>
                    )}
                </div>
            );
        }

        return (
            <div className='space-y-2 '>
                {filteredMedias.map((media, i) => (
                    <div
                        key={media._id || i}
                        className='bg-primary-light rounded-lg border  shadow-sm overflow-hidden'
                    >
                        <div className='p-3'>
                            {/* Header with user info and date */}
                            <div className='flex items-center gap-2 mb-2'>
                                <div className='flex items-center gap-3'>
                                    <Avatar className='h-8 w-8 border'>
                                        <AvatarImage
                                            src={
                                                media.sender?.profilePicture ||
                                                '/placeholder-avatar.png'
                                            }
                                            alt={
                                                media.sender?.fullName || 'User'
                                            }
                                        />
                                        <AvatarFallback className='bg-primary-light text-dark-gray'>
                                            {media.sender?.firstName?.charAt(
                                                0,
                                            ) || 'U'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className='flex items-center gap-2'>
                                            <span className='font-semibold text-dark-gray'>
                                                {media.sender?.fullName ||
                                                    'Unknown User'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <span className='text-xs text-gray'>
                                    {formatDate(media.createdAt)}
                                </span>
                            </div>

                            {/* Message (if any) */}
                            {media.message && (
                                <p className='text-sm text-gray mb-2'>
                                    {media.message}
                                </p>
                            )}

                            {/* Audio player */}
                            <AudioCard audioUrl={media.url} />
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className='w-full'>
            {/* Search bar */}
            <div className=' pb-3 mb-2'>
                <div className='relative flex flex-row items-center gap-2'>
                    <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray' />
                    <Input
                        type='search'
                        placeholder='Search by username...'
                        className='pl-10 py-2 pr-4 w-full border bg-foreground rounded-md focus:border-primary-light focus:ring-primary-light'
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                    <Button variant='secondary' size='icon' className='h-9 w-9'>
                        <SlidersHorizontal className='h-4 w-4' />
                    </Button>
                </div>
            </div>

            {/* Main content area with audio files */}
            <div ref={divRef} className='relative '>
                {renderContent()}

                {/* Gradient overlay and View More button */}
                {filteredMedias.length > 0 && hasMore && (
                    <div className=' mt-2'>
                        <div className='flex fex-row items-center gap-1 pb-2 pt-2 relative z-10'>
                            <div className='h-[2px] bg-border w-full'></div>
                            <Button
                                variant='primary_light'
                                className='h-7 rounded-full'
                                onClick={loadMoreAudio}
                                disabled={loadingMore}
                            >
                                {loadingMore ? (
                                    <>
                                        <Loader2 className='h-4 w-4 mr-1 animate-spin' />
                                        Loading...
                                    </>
                                ) : (
                                    <>
                                        View More
                                        <ChevronDown className='h-4 w-4' />
                                    </>
                                )}
                            </Button>
                            <div className='h-[2px] bg-border w-full'></div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Voices;
