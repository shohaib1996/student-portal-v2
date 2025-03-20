'use client';

import type React from 'react';
import { useEffect, useRef, useState, useCallback } from 'react';
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

interface Link {
    _id: string;
    url: string;
    type: string;
    name?: string;
    size?: number;
    createdAt?: string;
    sender?: User;
}

interface LinksProps {
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

// Mock links for demonstration
const mockLinks: Link[] = [
    {
        _id: '1',
        url: 'https://nextjs.org',
        type: 'link',
        name: 'Next.js - The React Framework',
        createdAt: new Date().toISOString(),
        sender: mockUsers[0],
    },
    {
        _id: '2',
        url: 'https://vercel.com',
        type: 'link',
        name: 'Vercel: Develop. Preview. Ship.',
        createdAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
        sender: mockUsers[1],
    },
    {
        _id: '3',
        url: 'https://tailwindcss.com',
        type: 'link',
        name: 'Tailwind CSS - Rapidly build modern websites',
        createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        sender: mockUsers[2],
    },
    {
        _id: '4',
        url: 'https://nextjs.org',
        type: 'link',
        name: 'Next.js - The React Framework',
        createdAt: new Date().toISOString(),
        sender: mockUsers[0],
    },
    {
        _id: '5',
        url: 'https://vercel.com',
        type: 'link',
        name: 'Vercel: Develop. Preview. Ship.',
        createdAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
        sender: mockUsers[1],
    },
    {
        _id: '6',
        url: 'https://tailwindcss.com',
        type: 'link',
        name: 'Tailwind CSS - Rapidly build modern websites',
        createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        sender: mockUsers[2],
    },
];

const Links: React.FC<LinksProps> = ({ chat }) => {
    const [links, setLinks] = useState<Link[]>([]);
    const [filteredLinks, setFilteredLinks] = useState<Link[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const divRef = useRef<HTMLDivElement>(null);
    const initialLimit = 12;

    // Fetch link items
    const fetchLinks = useCallback(
        (options: { limit: number; type: string; lastId?: string }) => {
            setIsLoading(true);

            // For demonstration, we'll use mock data
            // In a real app, you would use the axios call below
            setTimeout(() => {
                setLinks(mockLinks);
                setFilteredLinks(mockLinks);
                setHasMore(false);
                setIsLoading(false);
            }, 1000);

            // Uncomment for real API call
            /*
            axios
                .post(`/chat/media/${chat?._id}`, { ...options, type: 'link' })
                .then((res) => {
                    const linkData = res.data?.medias || [];

                    // Enhance link data with mock user data for demonstration
                    const enhancedLinks = linkData.map((link: Link) => {
                        const randomUserIndex = Math.floor(
                            Math.random() * mockUsers.length,
                        );
                        return {
                            ...link,
                            sender: mockUsers[randomUserIndex],
                        };
                    });

                    setLinks(enhancedLinks);
                    setFilteredLinks(enhancedLinks);
                    setHasMore(linkData.length === options.limit);
                    setIsLoading(false);
                })
                .catch((err) => {
                    setIsLoading(false);
                    console.log(err);
                    toast.error(
                        err?.response?.data?.error || 'Failed to fetch links',
                    );
                });
            */
        },
        [chat],
    );

    // Load more link items
    const loadMoreLinks = useCallback(() => {
        if (!hasMore || loadingMore) {
            return;
        }

        setLoadingMore(true);
        const lastId = links[links.length - 1]?._id;

        // For demonstration, we'll use mock data
        // In a real app, you would use the axios call
        setTimeout(() => {
            setLoadingMore(false);
            setHasMore(false);
        }, 1000);

        // Uncomment for real API call
        /*
        axios
            .post(`/chat/media/${chat?._id}`, {
                lastId,
                limit: initialLimit,
                type: 'link',
            })
            .then((res) => {
                const linkData = res.data?.medias || [];

                // Enhance link data with mock user data for demonstration
                const enhancedLinks = linkData.map((link: Link) => {
                    const randomUserIndex = Math.floor(
                        Math.random() * mockUsers.length,
                    );
                    return {
                        ...link,
                        sender: mockUsers[randomUserIndex],
                    };
                });

                const updatedLinks = [...links, ...enhancedLinks];
                setLinks(updatedLinks);

                // Apply search filter to new results too
                if (searchQuery) {
                    handleSearch(searchQuery, updatedLinks);
                } else {
                    setFilteredLinks(updatedLinks);
                }

                setHasMore(linkData.length === initialLimit);
                setLoadingMore(false);
            })
            .catch((err) => {
                setLoadingMore(false);
                console.log(err);
                toast.error(
                    err?.response?.data?.error || 'Failed to load more links',
                );
            });
        */
    }, [chat, links, hasMore, loadingMore, searchQuery]);

    // Handle search functionality
    const handleSearch = useCallback(
        (query: string, linkList?: Link[]) => {
            const dataToSearch = linkList || links;
            setSearchQuery(query);

            if (!query.trim()) {
                setFilteredLinks(dataToSearch);
                return;
            }

            const filtered = dataToSearch.filter(
                (link) =>
                    link.url.toLowerCase().includes(query.toLowerCase()) ||
                    (link.name &&
                        link.name.toLowerCase().includes(query.toLowerCase())),
            );

            setFilteredLinks(filtered);
        },
        [links],
    );

    // Get user role badge
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

    // Initial data fetch
    useEffect(() => {
        if (chat?._id) {
            fetchLinks({ limit: initialLimit, type: 'link' });
        }
    }, [chat, fetchLinks]);

    // Render content conditionally
    const renderContent = () => {
        if (isLoading && links.length === 0) {
            return (
                <div className='flex justify-center items-center py-16'>
                    <Loader2 className='h-8 w-8 text-blue-600 animate-spin' />
                </div>
            );
        }

        if (filteredLinks.length === 0) {
            return (
                <div className='flex justify-center items-center flex-col py-16'>
                    <div className='rounded-full bg-gray-100 p-4 mb-4'>
                        <LinkIcon className='h-8 w-8 text-gray-400' />
                    </div>
                    <h4 className='text-center text-gray-500 font-medium'>
                        {searchQuery
                            ? `No links found for "${searchQuery}"`
                            : 'No links available'}
                    </h4>
                    {searchQuery && (
                        <Button
                            variant='ghost'
                            className='mt-2 text-blue-600 hover:text-blue-700'
                            onClick={() => {
                                setSearchQuery('');
                                setFilteredLinks(links);
                            }}
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
                            alt={link.sender?.fullName || 'User'}
                            className='w-10 h-10 rounded-full border object-cover'
                        />
                        <div className='flex flex-col w-full bg-foreground hover:bg-primary-light duration-300 border hover:border-blue-500/30 p-2 rounded-lg'>
                            <div className='flex flex-row items-center gap-2 mb-1'>
                                <div className='name max-w-200 truncate text-black text-sm font-medium'>
                                    {link.sender?.fullName || 'Unknown User'}
                                </div>
                                <div className='name max-w-200 truncate text-gray text-xs'>
                                    {formatDate(link.createdAt)}
                                </div>
                            </div>
                            <LinkPreviewCard url={link.url} />
                            <Link href={link?.url} target='_blank'>
                                <u className='text-xs text-primary mt-1 flex items-center gap-1 cursor-pointer'>
                                    <ExternalLink className='h-3 w-3 text-primary' />
                                    <span className='text-xs text-primary truncate'>
                                        {link?.url}
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
                    <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
                    <Input
                        type='search'
                        placeholder='Search by link or title...'
                        className='pl-8 py-2 pr-4 w-full border bg-foreground rounded-md focus:border-primary-light focus:ring-primary-light'
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                    <Button variant='secondary' size='icon' className='h-9 w-9'>
                        <SlidersHorizontal className='h-4 w-4' />
                    </Button>
                </div>
            </div>

            {/* Main content area with links */}
            <div ref={divRef} className='relative'>
                {renderContent()}

                {/* Gradient overlay and View More button */}
                {filteredLinks.length > 0 && hasMore && (
                    <div className='relative mt-2'>
                        <div className='absolute bottom-0 left-0 right-0 h-[60px] bg-gradient-to-t from-black to-transparent'></div>
                        <div className='flex flex-row items-center gap-1 pb-2 pt-2 relative z-10'>
                            <div className='w-full h-[2px] bg-border'></div>
                            <Button
                                variant='primary_light'
                                className='h-7 rounded-full'
                                onClick={loadMoreLinks}
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
                            <div className='w-full h-[2px] bg-border'></div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Links;
