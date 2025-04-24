'use client';

import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Loader2, Search } from 'lucide-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import FileCard from './FileCard';
import Image from 'next/image';
import { useGetChatMediaQuery } from '@/redux/api/chats/chatApi';
import GlobalPagination from '@/components/global/GlobalPagination';

// Initialize dayjs plugins
dayjs.extend(relativeTime);

interface FilesProps {
    chat: {
        _id: string;
        membersCount?: number;
        name?: string;
    };
}

const Files: React.FC<FilesProps> = ({ chat }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(15);
    const divRef = useRef<HTMLDivElement>(null);

    // Set up debounced search query to prevent excessive API calls
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchQuery);
            // Don't reset page here - we'll do it in handleSearch
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Use RTK Query hook to fetch media data with filename filtering
    const {
        data: mediaData,
        isLoading,
        error,
    } = useGetChatMediaQuery(
        {
            chatId: chat._id,
            type: 'file',
            page: currentPage,
            limit: itemsPerPage,
            query: debouncedQuery, // This is used for filename and text filtering
        },
        {
            // Only fetch if chat ID exists
            skip: !chat._id,
        },
    );

    // Handle search input change
    const handleSearch = (query: string) => {
        setSearchQuery(query);
        setCurrentPage(1); // Reset to first page on new search
    };

    // Page change handler for pagination
    const handlePageChange = (page: number, limit: number) => {
        setCurrentPage(page);
        setItemsPerPage(limit);
    };

    // Error handling
    useEffect(() => {
        if (error) {
            console.error('Error fetching files:', error);
            toast.error('Failed to fetch files');
        }
    }, [error]);

    // Format date for display
    const formatDate = (dateString?: string) => {
        if (!dateString) {
            return 'N/A';
        }

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

    const files = mediaData?.medias || [];

    // Render content conditionally
    const renderContent = () => {
        if (isLoading) {
            return (
                <div className='flex justify-center items-center py-16'>
                    <Loader2 className='h-8 w-8 text-blue-600 animate-spin' />
                </div>
            );
        }

        if (files.length === 0) {
            return (
                <div className='flex justify-center items-center flex-col py-16'>
                    <div className='rounded-full bg-background p-4 mb-4'>
                        <Search className='h-8 w-8 text-gray' />
                    </div>
                    <h4 className='text-center text-gray font-medium'>
                        {debouncedQuery
                            ? `No files found for "${debouncedQuery}"`
                            : 'No files available'}
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
            <div className='flex flex-col gap-2'>
                {files.map((file, i) => (
                    <div key={file._id || i} className='flex flex-row gap-2'>
                        <Image
                            src={file.sender?.profilePicture || '/avatar.png'}
                            height={60}
                            width={60}
                            alt={
                                `${file.sender?.firstName || ''} ${file.sender?.lastName || ''}`.trim() ||
                                'User'
                            }
                            className='w-10 h-10 rounded-full border object-cover'
                        />
                        <div className='bg-foreground p-2 rounded-md flex flex-col w-full'>
                            <div className='flex flex-row items-center gap-2 mb-1'>
                                <div className='name max-w-200 truncate text-dark-gray text-sm font-medium'>
                                    {`${file.sender?.firstName || ''} ${file.sender?.lastName || ''}`.trim() ||
                                        'Unknown User'}
                                </div>
                                <div className='name max-w-200 truncate text-gray text-xs'>
                                    {formatDate(file.createdAt)}
                                </div>
                            </div>
                            <FileCard file={file} index={i} />
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className='w-full'>
            {/* Search bar for filename and text filtering */}
            <div className='pb-2 mb-2'>
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

            {/* Main content area with files */}
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

export default Files;
