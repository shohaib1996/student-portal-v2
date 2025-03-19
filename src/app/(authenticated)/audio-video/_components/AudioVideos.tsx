'use client';

import Fuse from 'fuse.js';
import { useState } from 'react';
import { GlobalPagination } from '@/components/global/global-pagination';

import { TMediaItem } from '@/types/audio-videos/audio-videos';
import { useMyAudioVideoQuery } from '@/redux/api/audio-video/audioVideos';

import AudioVideosCard from './AudioVideosCard';
import MediaCardSkeleton from './MediaCardSkeleton';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const ITEMS_PER_PAGE = 8;

const AudioVideos = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [audioVideo, setAudioVideo] = useState(true);
    const { data, error, isLoading } = useMyAudioVideoQuery({});

    if (error) {
        return <p>Error</p>;
    }

    if (isLoading) {
        return (
            <div className='mt-11 rounded-md bg-background p-4'>
                <div className='grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4'>
                    <MediaCardSkeleton />
                    <MediaCardSkeleton />
                    <MediaCardSkeleton />
                    <MediaCardSkeleton />
                </div>
            </div>
        );
    }

    const medias: TMediaItem[] = data.medias;

    // Fuse.js configuration
    const fuse = new Fuse(medias, {
        keys: ['title'],
        threshold: 0.3,
    });

    // Filtered items based on search query
    const filteredItems = searchQuery
        ? fuse.search(searchQuery).map((result) => result.item)
        : medias;

    const totalItems = filteredItems.length;
    const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);

    // Get current page items
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentItems = filteredItems.slice(startIndex, endIndex);

    return (
        <div className=''>
            <div className='flex items-center gap-1'>
                <Button
                    variant='ghost'
                    onClick={() => setAudioVideo(true)}
                    className={cn(
                        'rounded-none',
                        audioVideo
                            ? 'text-primary border-b-2 border-primary'
                            : '',
                    )}
                >
                    Audios
                </Button>
                <Button
                    variant='ghost'
                    onClick={() => setAudioVideo(false)}
                    className={cn(
                        'rounded-none',
                        audioVideo === false
                            ? 'text-primary border-b-2 border-primary'
                            : '',
                    )}
                >
                    Videos
                </Button>
            </div>
            <div className=''>
                {/* Search Input */}
                {/* <input
                    type='text'
                    placeholder='Search by title...'
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1);
                    }}
                    className='mb-4 w-full rounded-md border p-2'
                /> */}

                <div className='my-common grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4'>
                    {currentItems.map((media: TMediaItem) => (
                        <AudioVideosCard
                            key={media._id}
                            media={media}
                            isAudio={audioVideo}
                        />
                    ))}
                </div>

                <GlobalPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    itemsPerPage={ITEMS_PER_PAGE}
                    onLimitChange={(number) => {
                        setCurrentPage(number);
                    }}
                    baseUrl='/audio-videos'
                />
            </div>
        </div>
    );
};

export default AudioVideos;
