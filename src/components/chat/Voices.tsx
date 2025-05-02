'use client';

import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Loader2, Search } from 'lucide-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import AudioCard from './TextEditor/AudioCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useGetChatMediaQuery } from '@/redux/api/chats/chatApi';
import GlobalPagination from '@/components/global/GlobalPagination';

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
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const divRef = useRef<HTMLDivElement>(null);

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Use RTK Query hook to fetch media data with server-side filtering and pagination
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
            limit: itemsPerPage,
            query: debouncedQuery, // Pass the query to the server
        },
        {
            // Only fetch if chat ID exists
            skip: !chat._id,
        },
    );

    // Handle search input change
    const handleSearch = (query: string) => {
        setSearchQuery(query);
        setCurrentPage(1); // Reset to first page when search changes
    };

    // Page change handler for pagination
    const handlePageChange = (page: number, limit: number) => {
        setCurrentPage(page);
        setItemsPerPage(limit);
    };

    // Error handling
    useEffect(() => {
        if (error) {
            console.error('Error fetching audio files:', error);
            toast.error('Failed to fetch audio files');
        }
    }, [error]);

    // Reset search
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

    // Render content conditionally
    const renderContent = () => {
        if (isLoading) {
            return (
                <div className='flex justify-center items-center py-16'>
                    <Loader2 className='h-8 w-8 text-primary animate-spin' />
                </div>
            );
        }

        if (!mediaData?.medias || mediaData.medias.length === 0) {
            return (
                <div className='flex justify-center items-center flex-col py-16'>
                    <div className='rounded-full bg-background p-4 mb-4'>
                        <Search className='h-8 w-8 text-gray' />
                    </div>
                    <h4 className='text-center text-gray font-medium'>
                        {debouncedQuery
                            ? `No audio files found for "${debouncedQuery}"`
                            : 'No audio files available'}
                    </h4>
                    {debouncedQuery && (
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
                {mediaData.medias.map((media, i) => (
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
                            <div className=''>
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
            <div className='pb-2 mb-2 pt-[2px]'>
                <div className='relative flex flex-row items-center gap-2'>
                    <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray' />
                    <Input
                        type='search'
                        placeholder='Search by filename or text...'
                        className='pl-10 py-2 pr-4 w-full border bg-background rounded-md focus:border-primary-light focus:ring-primary-light'
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Main content area with audio files */}
            <div ref={divRef} className='relative'>
                <div className='h-[calc(100vh-250px)] overflow-y-auto border-b border-forground-border'>
                    {renderContent()}
                </div>

                {/* Pagination component */}
                {!isLoading && mediaData && mediaData.totalCount > 0 && (
                    <GlobalPagination
                        totalItems={mediaData.totalCount}
                        itemsPerPage={itemsPerPage}
                        currentPage={currentPage}
                        onPageChange={handlePageChange}
                    />
                )}
            </div>
        </div>
    );
};

export default Voices;
