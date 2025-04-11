'use client';

import type React from 'react';
import { useState, useEffect, useRef, useMemo } from 'react';
import { toast } from 'sonner';
import { Loader2, Search, ChevronDown, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useGetChatMediaQuery } from '@/redux/api/chats/chatApi';

interface ImagesProps {
    chat: {
        _id: string;
        membersCount?: number;
        name?: string;
    };
    setMediaCount: (count: number) => void;
}

const Images: React.FC<ImagesProps> = ({ chat, setMediaCount }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [allMedias, setAllMedias] = useState<any[]>([]);
    const divRef = useRef<HTMLDivElement>(null);
    const [hasMoreToFetch, setHasMoreToFetch] = useState(true);

    // Use RTK Query hook to fetch all media data without filtering
    const {
        data: mediaData,
        isLoading,
        isFetching,
        error,
    } = useGetChatMediaQuery(
        {
            chatId: chat._id,
            type: 'image',
            page: currentPage,
            limit: 20,
        },
        {
            // Only fetch if chat ID exists
            skip: !chat._id,
        },
    );

    // Update all medias when new data arrives
    useEffect(() => {
        if (mediaData?.medias && !isLoading) {
            // For the first page, replace all; for subsequent pages, append
            if (currentPage === 1) {
                setAllMedias(mediaData.medias);
            } else {
                setAllMedias((prev) => [...prev, ...mediaData.medias]);
            }

            // Update has more flag
            setHasMoreToFetch(currentPage < mediaData.totalPages);

            // Update media count in parent component (total unfiltered count)
            setMediaCount(mediaData.totalCount);
        }
    }, [mediaData, isLoading, currentPage, setMediaCount]);

    // Apply the name filter
    const filteredMedias = useMemo(() => {
        if (!searchQuery.trim()) {
            return allMedias;
        }

        const searchLower = searchQuery.toLowerCase();
        return allMedias.filter((media) => {
            const firstName = media.sender?.firstName || '';
            const lastName = media.sender?.lastName || '';
            const fullName = `${firstName} ${lastName}`.trim().toLowerCase();

            return fullName.includes(searchLower);
        });
    }, [allMedias, searchQuery]);

    // Handle search input change
    const handleSearch = (query: string) => {
        setSearchQuery(query);
    };

    // Load more images
    const loadMoreImages = () => {
        if (hasMoreToFetch && !isFetching) {
            setCurrentPage((prev) => prev + 1);
        }
    };

    // Error handling
    useEffect(() => {
        if (error) {
            console.error('Error fetching media:', error);
            toast.error('Failed to fetch images');
        }
    }, [error]);

    const isLoadingMore = isFetching && !isLoading;

    // Render content conditionally
    const renderContent = () => {
        if (isLoading && allMedias.length === 0) {
            return (
                <div className='flex justify-center items-center py-16'>
                    <Loader2 className='h-8 w-8 text-blue-600 animate-spin' />
                </div>
            );
        }

        if (filteredMedias.length === 0) {
            return (
                <div className='flex justify-center items-center flex-col py-16'>
                    <div className='rounded-full bg-background p-4 mb-4'>
                        <Search className='h-8 w-8 text-gray' />
                    </div>
                    <h4 className='text-center text-gray font-medium'>
                        {searchQuery
                            ? `No images found for sender "${searchQuery}"`
                            : 'No images available'}
                    </h4>
                    {searchQuery && (
                        <Button
                            variant='ghost'
                            className='mt-2 text-blue-600 hover:text-blue-700'
                            onClick={() => {
                                setSearchQuery('');
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
                <div className='grid grid-cols-2 md:grid-cols-3 gap-2'>
                    {filteredMedias.map((media, i) => (
                        <div
                            key={media._id || i}
                            className='h-[180px] w-full relative aspect-square overflow-hidden rounded-md border bg-gray'
                        >
                            <img
                                className='w-full h-full object-cover'
                                src={media?.url || '/placeholder-image.png'}
                                alt={`Media ${i + 1}`}
                                loading='lazy'
                            />

                            {/* User info with gradient background */}
                            <div className='absolute bottom-0 left-0 right-0 h-[60px] bg-gradient-to-t from-pure-black to-transparent p-2 flex items-end'>
                                <div className='flex items-center gap-2 text-white'>
                                    <Avatar className='h-8 w-8 border border-white/30'>
                                        <AvatarImage
                                            src={
                                                media.sender?.profilePicture ||
                                                '/placeholder-avatar.png'
                                            }
                                            alt={
                                                `${media.sender?.firstName || ''} ${media.sender?.lastName || ''}`.trim() ||
                                                'User'
                                            }
                                        />
                                        <AvatarFallback className='bg-primary text-white'>
                                            {media.sender?.firstName?.charAt(
                                                0,
                                            ) || 'U'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className='flex flex-col'>
                                        <div
                                            className='truncate text-pure-white text-sm font-medium'
                                            style={{ lineHeight: 1 }}
                                        >
                                            {`${media.sender?.firstName || ''} ${media.sender?.lastName || ''}`.trim() ||
                                                'Unknown User'}
                                        </div>
                                        <div
                                            className='truncate text-xs text-pure-white/70 font-medium'
                                            style={{ lineHeight: 1 }}
                                        >
                                            {media.createdAt
                                                ? new Date(
                                                      media.createdAt,
                                                  ).toLocaleDateString()
                                                : ''}
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

    // Determine if we need to show the "View More" button
    // We should show it if there are more items to fetch from API or if the user is filtering
    const showViewMore =
        hasMoreToFetch &&
        // Only show when not filtering, or when filtering and there are filtered results
        (!searchQuery || (searchQuery && filteredMedias.length > 0));

    return (
        <div className='w-full'>
            {/* Search bar */}
            <div className='pb-3 mb-3'>
                <div className='relative flex flex-row items-center gap-2'>
                    <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray' />
                    <Input
                        type='search'
                        placeholder='Filter by sender name...'
                        className='pl-8 py-2 pr-4 w-full border bg-background rounded-md focus:border-blue-500 focus:ring-blue-500'
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Main content area with images */}
            <div ref={divRef} className='relative'>
                {renderContent()}

                {/* Gradient overlay and View More button container */}
                {showViewMore && (
                    <div className='relative mt-2'>
                        <div className='absolute bottom-0 left-0 right-0 h-[60px] bg-gradient-to-t from-black dark:from-gray-950 to-transparent'></div>
                        <div className='flex justify-center pb-4 pt-8 relative z-10'>
                            <Button
                                variant='outline'
                                className='flex items-center gap-1 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700'
                                onClick={loadMoreImages}
                                disabled={isLoadingMore}
                            >
                                {isLoadingMore ? (
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
