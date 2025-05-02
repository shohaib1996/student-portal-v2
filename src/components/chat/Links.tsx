'use client';

import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Loader2, Search, LinkIcon, ExternalLink } from 'lucide-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import LinkPreviewCard from './LinkPreviewCard';
import Link from 'next/link';
import { useGetChatMediaQuery } from '@/redux/api/chats/chatApi';
import { renderPlainText } from '../lexicalEditor/renderer/renderPlainText';
import GlobalPagination from '@/components/global/GlobalPagination';

// Initialize dayjs plugins
dayjs.extend(relativeTime);

interface LinksProps {
    chat: {
        _id: string;
        membersCount?: number;
        name?: string;
    };
}

// URL cleaning utility function
const cleanUrl = (inputUrl: string) => {
    // Handle the specific format 'https://example.com](https://example.com)'
    if (inputUrl.includes('](')) {
        // Just take the first part before the ']('
        const firstPart = inputUrl.split('](')[0];

        // Remove any surrounding quotes
        const cleanFirstPart = firstPart.replace(/^['"]|['"]$/g, '');

        return cleanFirstPart;
    }

    // For regular URLs, just return them as is
    return inputUrl;
};

const Links: React.FC<LinksProps> = ({ chat }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(12);
    const divRef = useRef<HTMLDivElement>(null);

    // Set up debounced search query to prevent excessive API calls
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Use RTK Query hook to fetch media data with server-side filtering
    const {
        data: mediaData,
        isLoading,
        error,
    } = useGetChatMediaQuery(
        {
            chatId: chat._id,
            type: 'link',
            page: currentPage,
            limit: itemsPerPage,
            query: debouncedQuery, // Send the query to the server
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
            console.error('Error fetching links:', error);
            toast.error('Failed to fetch links');
        }
    }, [error]);

    // Clear search and reset
    const handleClearSearch = () => {
        setSearchQuery('');
    };

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

    // Process links to clean URLs
    const processedLinks = mediaData?.medias
        ? mediaData.medias.map((link) => ({
              ...link,
              cleanedUrl: cleanUrl(link.url),
          }))
        : [];

    // Render content conditionally
    const renderContent = () => {
        if (isLoading) {
            return (
                <div className='flex justify-center items-center py-16'>
                    <Loader2 className='h-8 w-8 text-blue-600 animate-spin' />
                </div>
            );
        }

        if (!processedLinks || processedLinks.length === 0) {
            return (
                <div className='flex justify-center items-center flex-col py-16'>
                    <div className='rounded-full bg-background p-4 mb-4'>
                        <LinkIcon className='h-8 w-8 text-gray' />
                    </div>
                    <h4 className='text-center text-gray font-medium'>
                        {debouncedQuery
                            ? `No links found for "${debouncedQuery}"`
                            : 'No links available'}
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
            <div className='flex flex-col gap-4'>
                {processedLinks.map((link, i) => (
                    <div key={link._id || i} className='flex flex-row gap-2'>
                        <Image
                            src={link.sender?.profilePicture || '/avatar.png'}
                            height={60}
                            width={60}
                            alt={
                                `${link.sender?.firstName || ''} ${link.sender?.lastName || ''}`.trim() ||
                                'User'
                            }
                            className='w-10 h-10 rounded-full border object-cover'
                        />
                        <div className='flex flex-col w-[calc(100%-50px)] bg-background hover:bg-primary-light duration-300 border hover:border-blue-500/30 p-2 rounded-lg'>
                            <div className='flex flex-row items-center gap-2 mb-1'>
                                <div className='name max-w-200 truncate text-black text-sm font-medium'>
                                    {`${link.sender?.firstName || ''} ${link.sender?.lastName || ''}`.trim() ||
                                        'Unknown User'}
                                </div>
                                <div className='name max-w-200 truncate text-gray text-xs'>
                                    {formatDate(link.createdAt)}
                                </div>
                            </div>

                            {/* Display message text if available */}
                            {link.text && (
                                <p className='text-sm text-gray mb-2 w-full'>
                                    {renderPlainText({
                                        text: link.text,
                                        lineClamp: 2,
                                        textColor: 'text-gray',
                                        width: 'w-full',
                                    })}
                                </p>
                            )}

                            <LinkPreviewCard url={link.url} />
                            <Link
                                href={link.cleanedUrl || link.url}
                                target='_blank'
                            >
                                <u className='text-xs text-primary mt-1 flex items-center gap-1 cursor-pointer'>
                                    <ExternalLink className='h-3 w-3 text-primary' />
                                    <span className='text-xs text-primary truncate'>
                                        {link.cleanedUrl || link.url}
                                    </span>
                                </u>
                            </Link>
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
                        placeholder='Search by link text'
                        className='pl-8 py-2 pr-4 w-full border bg-background rounded-md focus:border-primary-light focus:ring-primary-light'
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Main content area with links */}
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

export default Links;
