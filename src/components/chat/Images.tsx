'use client';

import type React from 'react';
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { Loader2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useGetChatMediaQuery } from '@/redux/api/chats/chatApi';
import GlobalPagination from '@/components/global/GlobalPagination'; // Import pagination component

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
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const divRef = useRef<HTMLDivElement>(null);
    const [debouncedQuery, setDebouncedQuery] = useState('');

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Use RTK Query hook with server-side pagination and filtering
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
            limit: itemsPerPage,
            query: debouncedQuery, // Use the debounced query value
        },
        {
            // Only fetch if chat ID exists
            skip: !chat._id,
        },
    );

    // Update media count when data changes
    useEffect(() => {
        if (mediaData?.totalCount !== undefined) {
            setMediaCount(mediaData.totalCount);
        }
    }, [mediaData, setMediaCount]);

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
            console.error('Error fetching media:', error);
            toast.error('Failed to fetch images');
        }
    }, [error]);

    // Render content conditionally
    const renderContent = () => {
        if (isLoading) {
            return (
                <div className='flex justify-center items-center py-16'>
                    <Loader2 className='h-8 w-8 text-blue-600 animate-spin' />
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
                            ? `No images found matching "${debouncedQuery}"`
                            : 'No images available'}
                    </h4>
                    {debouncedQuery && (
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
            <>
                <div className='grid grid-cols-2 md:grid-cols-3 gap-2'>
                    {mediaData.medias.map((media, i) => (
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
            </>
        );
    };

    return (
        <div className='w-full'>
            {/* Search bar */}
            <div className='pb-3 mb-3'>
                <div className='relative flex flex-row items-center gap-2'>
                    <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray' />
                    <Input
                        type='search'
                        placeholder='Search by message or file name'
                        className='pl-8 py-2 pr-4 w-full border bg-background rounded-md focus:border-blue-500 focus:ring-blue-500'
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Main content area with images */}
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

export default Images;
