'use client';

import type React from 'react';
import { useEffect, useRef, useState, useMemo } from 'react';
import { toast } from 'sonner';
import {
    Loader2,
    Search,
    ChevronDown,
    SlidersHorizontal,
    LinkIcon,
    ExternalLink,
} from 'lucide-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import LinkPreviewCard from './LinkPreviewCard';
import Link from 'next/link';
import { useGetChatMediaQuery } from '@/redux/api/chats/chatApi';
import MessagePreview from './Message/MessagePreview';

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
    const [currentPage, setCurrentPage] = useState(1);
    const [allLinks, setAllLinks] = useState<any[]>([]);
    const [hasMoreToFetch, setHasMoreToFetch] = useState(true);
    const divRef = useRef<HTMLDivElement>(null);
    const pageLimit = 12; // Links per page

    // Use RTK Query hook to fetch all media data
    const {
        data: mediaData,
        isLoading,
        isFetching,
        error,
    } = useGetChatMediaQuery(
        {
            chatId: chat._id,
            type: 'link',
            page: currentPage,
            limit: pageLimit,
        },
        {
            // Only fetch if chat ID exists
            skip: !chat._id,
        },
    );

    // Update all links when new data arrives
    useEffect(() => {
        if (mediaData?.medias && !isLoading) {
            // Process URLs in the incoming data
            const processedLinks = mediaData.medias.map((link) => ({
                ...link,
                cleanedUrl: cleanUrl(link.url),
            }));

            // For the first page, replace all; for subsequent pages, append
            if (currentPage === 1) {
                setAllLinks(processedLinks);
            } else {
                setAllLinks((prev) => [...prev, ...processedLinks]);
            }

            // Update has more flag
            setHasMoreToFetch(currentPage < mediaData.totalPages);
        }
    }, [mediaData, isLoading, currentPage]);

    // Apply comprehensive filtering for sender name, URL, and text/title
    const filteredLinks = useMemo(() => {
        if (!searchQuery.trim()) {
            return allLinks;
        }

        const searchLower = searchQuery.toLowerCase();
        return allLinks.filter((link) => {
            // Check sender name
            const firstName = link.sender?.firstName || '';
            const lastName = link.sender?.lastName || '';
            const fullName = `${firstName} ${lastName}`.trim().toLowerCase();
            const hasNameMatch = fullName.includes(searchLower);

            // Check link URL
            const url = link.cleanedUrl?.toLowerCase() || '';
            const hasUrlMatch = url.includes(searchLower);

            // Check link title/name
            const name = link.name?.toLowerCase() || '';
            const hasNameUrlMatch = name.includes(searchLower);

            // Check message text
            const text = link.text?.toLowerCase() || '';
            const hasTextMatch = text.includes(searchLower);

            // Return true if any field matches
            return (
                hasNameMatch || hasUrlMatch || hasNameUrlMatch || hasTextMatch
            );
        });
    }, [allLinks, searchQuery]);

    // Handle search input change
    const handleSearch = (query: string) => {
        setSearchQuery(query);
    };

    // Load more links
    const loadMoreLinks = () => {
        if (hasMoreToFetch && !isFetching) {
            setCurrentPage((prev) => prev + 1);
        }
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

    // Get user role badge - can be enabled when role/type data is available
    const getUserRoleBadge = (type?: string) => {
        switch (type) {
            case 'admin':
                return (
                    <Badge
                        variant='outline'
                        className='bg-blue-50 text-blue-700 border-blue-200 text-xs'
                    >
                        Admin
                    </Badge>
                );
            case 'marketing':
                return (
                    <Badge
                        variant='outline'
                        className='bg-green-50 text-green-700 border-green-200 text-xs'
                    >
                        Marketing
                    </Badge>
                );
            default:
                return (
                    <Badge
                        variant='outline'
                        className='bg-gray-50 text-gray-700 border-gray-200 text-xs'
                    >
                        Member
                    </Badge>
                );
        }
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

    const isLoadingMore = isFetching && !isLoading;

    // Should show "View More" button if there are more items on the server
    // and either no search is happening, or search has results
    const showViewMoreButton =
        hasMoreToFetch &&
        (!searchQuery || (searchQuery && filteredLinks.length > 0));

    // Render content conditionally
    const renderContent = () => {
        if (isLoading && allLinks.length === 0) {
            return (
                <div className='flex justify-center items-center py-16'>
                    <Loader2 className='h-8 w-8 text-blue-600 animate-spin' />
                </div>
            );
        }

        if (filteredLinks.length === 0) {
            return (
                <div className='flex justify-center items-center flex-col py-16'>
                    <div className='rounded-full bg-background p-4 mb-4'>
                        <LinkIcon className='h-8 w-8 text-gray' />
                    </div>
                    <h4 className='text-center text-gray font-medium'>
                        {searchQuery
                            ? `No links found for "${searchQuery}"`
                            : 'No links available'}
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
            <div className='flex flex-col gap-4'>
                {filteredLinks.map((link, i) => (
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
                                {/* User role badge can be uncommented when the data includes role/type */}
                                {/* <div className='ml-2'>
                                    {getUserRoleBadge(link.sender?.type)}
                                </div> */}
                                <div className='name max-w-200 truncate text-gray text-xs'>
                                    {formatDate(link.createdAt)}
                                </div>
                            </div>

                            {/* Display message text if available */}
                            {link.text && (
                                <p className='text-sm text-gray mb-2'>
                                    <MessagePreview
                                        searchQuery={searchQuery}
                                        text={link?.text || ''}
                                    />
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
            <div className='pb-2 mb-2'>
                <div className='relative flex flex-row items-center gap-2'>
                    <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray' />
                    <Input
                        type='search'
                        placeholder='Search by sender, link URL, title, or message...'
                        className='pl-8 py-2 pr-4 w-full border bg-background rounded-md focus:border-primary-light focus:ring-primary-light'
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Main content area with links */}
            <div ref={divRef} className='relative'>
                {renderContent()}

                {/* View More button */}
                {showViewMoreButton && (
                    <div className='relative mt-2'>
                        <div className='flex flex-row items-center gap-1 pb-2 pt-2 relative z-10'>
                            <div className='w-full h-[2px] bg-border'></div>
                            <Button
                                variant='primary_light'
                                className='h-7 rounded-full'
                                onClick={loadMoreLinks}
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
                            <div className='w-full h-[2px] bg-border'></div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Links;
