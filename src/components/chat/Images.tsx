'use client';

import type React from 'react';
import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Loader2, Search, ChevronDown, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

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
    createdAt?: string;
    // For future integration
    createdBy?: User;
}

interface ImagesProps {
    chat: {
        _id: string;
        membersCount?: number;
        name?: string;
    };
}

// Mock users for demonstration until createdBy is available in the media data
const mockUsers: User[] = [
    {
        _id: '1',
        firstName: 'Jane',
        lastName: 'Cooper',
        fullName: 'Jane Cooper',
        profilePicture: '/avatar/jane-cooper.jpg',
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
        firstName: 'Stan',
        lastName: 'Smith',
        fullName: 'Stan Smith',
        profilePicture: '/avatar/stan-smith.jpg',
        type: 'user',
    },
    {
        _id: '4',
        firstName: 'Anthony',
        lastName: 'Pool',
        fullName: 'Anthony Pool',
        profilePicture: '/avatar/anthony-pool.jpg',
        type: 'user',
    },
    {
        _id: '5',
        firstName: 'Travis',
        lastName: 'Barker',
        fullName: 'Travis Barker',
        profilePicture: '/avatar/travis-barker.jpg',
        type: 'user',
    },
    {
        _id: '6',
        firstName: 'Vivienne',
        lastName: 'Westwood',
        fullName: 'Vivienne W.',
        profilePicture: '/avatar/vivienne-westwood.jpg',
        type: 'user',
    },
    {
        _id: '7',
        firstName: 'George',
        lastName: 'Orwell',
        fullName: 'George Orwell',
        profilePicture: '/avatar/george-orwell.jpg',
        type: 'user',
    },
    {
        _id: '8',
        firstName: 'Robert',
        lastName: 'Parker',
        fullName: 'Robert Parker',
        profilePicture: '/avatar/robert-parker.jpg',
        type: 'user',
    },
];

const Images: React.FC<ImagesProps> = ({ chat }) => {
    const [medias, setMedias] = useState<Media[]>([]);
    const [filteredMedias, setFilteredMedias] = useState<Media[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const divRef = useRef<HTMLDivElement>(null);
    const initialLimit = 20; // Show 20 images initially

    // Fetch media items
    const fetchMedias = useCallback(
        (options: { limit: number; type: string; lastId?: string }) => {
            setIsLoading(true);
            axios
                .post(`/chat/media/${chat?._id}`, options)
                .then((res) => {
                    const mediaData = res.data?.medias || [];

                    // Assign random mock users to each media for demonstration
                    const mediasWithUser = mediaData.map((media: Media) => {
                        const randomUserIndex = Math.floor(
                            Math.random() * mockUsers.length,
                        );
                        return {
                            ...media,
                            createdBy: mockUsers[randomUserIndex],
                        };
                    });

                    setMedias(mediasWithUser);
                    setFilteredMedias(mediasWithUser);
                    setHasMore(mediaData.length === options.limit);
                    setIsLoading(false);
                })
                .catch((err) => {
                    setIsLoading(false);
                    console.log(err);
                    toast.error(
                        err?.response?.data?.error || 'Failed to fetch media',
                    );
                });
        },
        [chat],
    );

    // Load more media items
    const loadMoreImages = useCallback(() => {
        if (!hasMore || loadingMore) {
            return;
        }

        setLoadingMore(true);
        const lastId = medias[medias.length - 1]?._id;

        axios
            .post(`/chat/media/${chat?._id}`, {
                lastId,
                limit: initialLimit,
                type: 'image',
            })
            .then((res) => {
                const mediaData = res.data?.medias || [];

                // Assign random mock users to each media for demonstration
                const mediasWithUser = mediaData.map((media: Media) => {
                    const randomUserIndex = Math.floor(
                        Math.random() * mockUsers.length,
                    );
                    return {
                        ...media,
                        createdBy: mockUsers[randomUserIndex],
                    };
                });

                setMedias((prev) => [...prev, ...mediasWithUser]);

                // Apply search filter to new results too
                if (searchQuery) {
                    handleSearch(searchQuery, [...medias, ...mediasWithUser]);
                } else {
                    setFilteredMedias((prev) => [...prev, ...mediasWithUser]);
                }

                setHasMore(mediaData.length === initialLimit);
                setLoadingMore(false);
            })
            .catch((err) => {
                setLoadingMore(false);
                console.log(err);
                toast.error(
                    err?.response?.data?.error || 'Failed to load more images',
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
                media.createdBy?.fullName
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
            fetchMedias({ limit: initialLimit, type: 'image' });
        }
    }, [chat, fetchMedias]);

    // Render content conditionally
    const renderContent = () => {
        if (isLoading && medias.length === 0) {
            return (
                <div className='flex justify-center items-center py-16'>
                    <Loader2 className='h-8 w-8 text-blue-600 animate-spin' />
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
                            ? `No images found for "${searchQuery}"`
                            : 'No images available'}
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
            <div className='h-[calc(100vh-200px)] overflow-y-auto'>
                <div className='grid grid-cols-2 md:grid-cols-3 gap-2 h-full'>
                    {filteredMedias.map((media, i) => (
                        <div
                            key={media._id || i}
                            className='h-[180px] w-full relative aspect-square overflow-hidden rounded-md border border-gray-200 bg-gray-50'
                        >
                            <img
                                className=' w-full h-full object-cover'
                                src={media?.url || '/placeholder-image.png'}
                                alt={`Media ${i + 1}`}
                                loading='lazy'
                            />

                            {/* User info with gradient background */}
                            <div className='absolute bottom-0 left-0 right-0 h-[60px] bg-gradient-to-t from-black to-transparent p-2 flex items-end'>
                                <div className='flex items-center gap-2 text-white'>
                                    <Avatar className='h-8 w-8 border border-white/30'>
                                        <AvatarImage
                                            src={
                                                media.createdBy
                                                    ?.profilePicture ||
                                                '/placeholder-avatar.png'
                                            }
                                            alt={
                                                media.createdBy?.fullName ||
                                                'User'
                                            }
                                        />
                                        <AvatarFallback className='bg-primary text-white'>
                                            {media.createdBy?.firstName?.charAt(
                                                0,
                                            ) || 'U'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className='flex flex-col'>
                                        <div
                                            className='truncate text-pure-white text-sm font-medium'
                                            style={{ lineHeight: 1 }}
                                        >
                                            {media.createdBy?.fullName ||
                                                'Unknown User'}
                                        </div>
                                        <div
                                            className='truncate text-xs text-pure-white/70 font-medium'
                                            style={{ lineHeight: 1 }}
                                        >
                                            {media.createdBy?.type ||
                                                'Unknown role'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className='w-full'>
            {/* Search bar */}
            <div className='pb-3 mb-3'>
                <div className='relative flex flex-row items-center gap-2'>
                    <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
                    <Input
                        type='search'
                        placeholder='Search by username...'
                        className='pl-8 py-2 pr-4 w-full border bg-foreground rounded-md focus:border-blue-500 focus:ring-blue-500'
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        height={720}
                        width={1080}
                    />
                    <Button variant='secondary' size='icon' className='h-9 w-9'>
                        <SlidersHorizontal className='h-4 w-4' />
                    </Button>
                </div>
            </div>

            {/* Main content area with images */}
            <div ref={divRef} className='relative'>
                {renderContent()}

                {/* Gradient overlay and View More button container */}
                {filteredMedias.length > 0 && hasMore && (
                    <div className='relative mt-2'>
                        <div className='absolute bottom-0 left-0 right-0 h-[60px] bg-gradient-to-t from-black dark:from-gray-950 to-transparent'></div>
                        <div className='flex justify-center pb-4 pt-8 relative z-10'>
                            <Button
                                variant='outline'
                                className='flex items-center gap-1 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700'
                                onClick={loadMoreImages}
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
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Images;
