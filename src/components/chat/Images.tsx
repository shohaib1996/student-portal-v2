'use client';

import type React from 'react';
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import {
    Loader2,
    Search,
    Maximize2,
    X,
    ChevronLeft,
    ChevronRight,
    Fullscreen,
} from 'lucide-react';
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

interface Media {
    _id: string;
    url: string;
    sender?: {
        firstName?: string;
        lastName?: string;
        profilePicture?: string;
    };
    createdAt?: string;
}

const Images: React.FC<ImagesProps> = ({ chat, setMediaCount }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const divRef = useRef<HTMLDivElement>(null);
    const [debouncedQuery, setDebouncedQuery] = useState('');

    // State for full-screen preview
    const [previewOpen, setPreviewOpen] = useState(false);
    const [currentImage, setCurrentImage] = useState<Media | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);

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

    // Open full-screen preview
    const openPreview = (media: Media, index: number) => {
        setCurrentImage(media);
        setCurrentIndex(index);
        setPreviewOpen(true);

        // Add class to body to prevent scrolling
        document.body.classList.add('overflow-hidden');
    };

    // Close full-screen preview
    const closePreview = () => {
        setPreviewOpen(false);
        setCurrentImage(null);

        // Remove class from body to allow scrolling again
        document.body.classList.remove('overflow-hidden');
    };

    // Navigate to previous image
    const prevImage = () => {
        if (!mediaData?.medias) {
            return;
        }

        const newIndex =
            currentIndex > 0 ? currentIndex - 1 : mediaData.medias.length - 1;
        setCurrentIndex(newIndex);
        setCurrentImage(mediaData.medias[newIndex]);
    };

    // Navigate to next image
    const nextImage = () => {
        if (!mediaData?.medias) {
            return;
        }

        const newIndex =
            currentIndex < mediaData.medias.length - 1 ? currentIndex + 1 : 0;
        setCurrentIndex(newIndex);
        setCurrentImage(mediaData.medias[newIndex]);
    };

    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!previewOpen) {
                return;
            }

            switch (e.key) {
                case 'ArrowLeft':
                    prevImage();
                    break;
                case 'ArrowRight':
                    nextImage();
                    break;
                case 'Escape':
                    closePreview();
                    break;
                default:
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [previewOpen, currentIndex]);

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
                            className='h-[180px] w-full relative aspect-square overflow-hidden rounded-md border bg-foreground group'
                        >
                            <img
                                className='w-full h-full object-cover'
                                src={media?.url || '/default_image.png'}
                                alt={`Media ${i + 1}`}
                                loading='lazy'
                            />

                            {/* View icon overlay on hover */}
                            <div className='absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center'>
                                <button
                                    className='bg-pure-white/80 p-2 rounded-full hover:bg-pure-white transition-colors'
                                    onClick={() => openPreview(media, i)}
                                    aria-label='View full screen'
                                >
                                    <Fullscreen className='h-5 w-5 text-gray-800' />
                                </button>
                            </div>

                            {/* User info with gradient background */}
                            <div className='absolute bottom-0 left-0 right-0 h-[60px] flex items-end'>
                                <div className='flex items-center gap-2 text-white'>
                                    <Avatar className='h-8 w-8 border border-white/30'>
                                        <AvatarImage
                                            src={
                                                media.sender?.profilePicture ||
                                                '/avatar.png'
                                            }
                                            alt={
                                                `${media.sender?.firstName || ''} ${media.sender?.lastName || ''}`.trim() ||
                                                'User'
                                            }
                                        />
                                        <AvatarFallback className=' text-white'>
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
            <div className='pb-2 mb-2 pt-[2px]'>
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

            {/* Full-screen image preview modal */}
            {previewOpen && currentImage && (
                <div className='fixed inset-0 z-50 bg-pure-black flex items-center justify-center'>
                    {/* Close button */}
                    <Button
                        className='absolute top-4 right-4 bg-danger h-10 w-10 p-2 rounded-full  transition-colors z-10'
                        onClick={closePreview}
                        aria-label='Close preview'
                    >
                        <X className='h-6 w-6 text-white' />
                    </Button>

                    {/* Navigation buttons */}
                    <Button
                        className='absolute left-4 bg-primary h-10 w-10 p-2 rounded-full  transition-colors z-10'
                        onClick={prevImage}
                        aria-label='Previous image'
                    >
                        <ChevronLeft className='h-6 w-6 text-white' />
                    </Button>

                    <Button
                        className='absolute right-4 bg-primary h-10 w-10 p-2 rounded-full  transition-colors z-10'
                        onClick={nextImage}
                        aria-label='Next image'
                    >
                        <ChevronRight className='h-6 w-6 text-white' />
                    </Button>

                    {/* Image container */}
                    <div className='w-full h-full flex items-center justify-center p-4'>
                        <img
                            src={currentImage.url || '/placeholder.svg'}
                            alt='Full-screen preview'
                            className='max-h-full max-w-full object-contain'
                        />
                    </div>

                    {/* Image info footer */}
                    <div className='absolute bottom-0 left-0 right-0 bg-black/70 p-4 text-white'>
                        <div className='flex items-center gap-3'>
                            <Avatar className='h-10 w-10 border border-white/30'>
                                <AvatarImage
                                    src={
                                        currentImage.sender?.profilePicture ||
                                        '/avatar.png'
                                    }
                                    alt={
                                        `${currentImage.sender?.firstName || ''} ${currentImage.sender?.lastName || ''}`.trim() ||
                                        'User'
                                    }
                                />
                                <AvatarFallback className='bg-primary text-white'>
                                    {currentImage.sender?.firstName?.charAt(
                                        0,
                                    ) || 'U'}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <div className='font-medium'>
                                    {`${currentImage.sender?.firstName || ''} ${currentImage.sender?.lastName || ''}`.trim() ||
                                        'Unknown User'}
                                </div>
                                <div className='text-sm text-white/70'>
                                    {currentImage.createdAt
                                        ? new Date(
                                              currentImage.createdAt,
                                          ).toLocaleString()
                                        : ''}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Images;
