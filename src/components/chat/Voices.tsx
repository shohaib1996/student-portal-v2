'use client';

import type React from 'react';
import { useEffect, useRef, useState, useMemo } from 'react';
import { toast } from 'sonner';
import { Loader2, Search, ChevronDown, SlidersHorizontal } from 'lucide-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import AudioCard from './TextEditor/AudioCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useGetChatMediaQuery } from '@/redux/api/chats/chatApi';

// Initialize dayjs plugins
dayjs.extend(relativeTime);

interface VoicesProps {
    chat: {
        _id: string;
        membersCount?: number;
        name?: string;
    };
}

const Voices: React.FC<VoicesProps> = ({ chat }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [allMedias, setAllMedias] = useState<any[]>([]);
    const [hasMoreToFetch, setHasMoreToFetch] = useState(true);
    const divRef = useRef<HTMLDivElement>(null);
    const pageLimit = 10; // Audio files per page

    // Use RTK Query hook to fetch all media data
    const {
        data: mediaData,
        isLoading,
        isFetching,
        error,
    } = useGetChatMediaQuery(
        {
            chatId: chat._id,
            type: 'voice',
            page: currentPage,
            limit: pageLimit,
            // We'll handle the search filtering client-side
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
        }
    }, [mediaData, isLoading, currentPage]);

    // Apply filtering for both sender name and text content
    const filteredMedias = useMemo(() => {
        if (!searchQuery.trim()) {
            return allMedias;
        }

        const searchLower = searchQuery.toLowerCase();
        return allMedias.filter((media) => {
            // Check sender name
            const firstName = media.sender?.firstName || '';
            const lastName = media.sender?.lastName || '';
            const fullName = `${firstName} ${lastName}`.trim().toLowerCase();
            const hasNameMatch = fullName.includes(searchLower);

            // Check media text
            const text = media.text?.toLowerCase() || '';
            const hasTextMatch = text.includes(searchLower);

            // Return true if either matches
            return hasNameMatch || hasTextMatch;
        });
    }, [allMedias, searchQuery]);

    // Handle search input change
    const handleSearch = (query: string) => {
        setSearchQuery(query);
    };

    // Load more audio files
    const loadMoreAudio = () => {
        if (hasMoreToFetch && !isFetching) {
            setCurrentPage((prev) => prev + 1);
        }
    };

    // Error handling
    useEffect(() => {
        if (error) {
            console.error('Error fetching audio files:', error);
            toast.error('Failed to fetch audio files');
        }
    }, [error]);

    // Reset search and reload first page
    const handleClearSearch = () => {
        setSearchQuery('');
    };

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

    const isLoadingMore = isFetching && !isLoading;

    // Should show "View More" button if there are more items on the server
    // and either no search is happening, or search has results
    const showViewMoreButton =
        hasMoreToFetch &&
        (!searchQuery || (searchQuery && filteredMedias.length > 0));

    // Render content conditionally
    const renderContent = () => {
        if (isLoading && allMedias.length === 0) {
            return (
                <div className='flex justify-center items-center py-16'>
                    <Loader2 className='h-8 w-8 text-primary animate-spin' />
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
                            ? `No audio files found for "${searchQuery}"`
                            : 'No audio files available'}
                    </h4>
                    {searchQuery && (
                        <Button
                            variant='ghost'
                            className='mt-2 text-blue-600 hover:text-blue-700'
                            onClick={handleClearSearch}
                        >
                            Clear search
                        </Button>
                    )}
                </div>
            );
        }

        return (
            <div className='space-y-2'>
                {filteredMedias.map((media, i) => (
                    <div
                        key={media._id || i}
                        className='bg-primary-light rounded-lg border shadow-sm overflow-hidden'
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
                                                `${media.sender?.firstName || ''} ${media.sender?.lastName || ''}`.trim() ||
                                                'User'
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
                                                {`${media.sender?.firstName || ''} ${media.sender?.lastName || ''}`.trim() ||
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
                            {media.text && (
                                <p className='text-sm text-gray mb-2'>
                                    {media.text}
                                </p>
                            )}

                            {/* Audio player */}
                            <div className='w-fit'>
                                <AudioCard audioUrl={media.url} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className='w-full'>
            {/* Search bar */}
            <div className='pb-3 mb-2'>
                <div className='relative flex flex-row items-center gap-2'>
                    <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray' />
                    <Input
                        type='search'
                        placeholder='Search by sender name or text...'
                        className='pl-10 py-2 pr-4 w-full border bg-background rounded-md focus:border-primary-light focus:ring-primary-light'
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Main content area with audio files */}
            <div ref={divRef} className='relative'>
                {renderContent()}

                {/* View More button */}
                {showViewMoreButton && (
                    <div className='mt-2'>
                        <div className='flex fex-row items-center gap-1 pb-2 pt-2 relative z-10'>
                            <div className='h-[2px] bg-border w-full'></div>
                            <Button
                                variant='primary_light'
                                className='h-7 rounded-full'
                                onClick={loadMoreAudio}
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
                            <div className='h-[2px] bg-border w-full'></div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Voices;
