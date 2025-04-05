'use client';

import { GlobalPagination } from '@/components/global/global-pagination';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useMyAudioVideoQuery } from '@/redux/api/audio-video/audioVideos';
import { TMediaItem } from '@/types/audio-videos/audio-videos';
import Fuse from 'fuse.js';
import { Loader, TvMinimalPlay, Volume2 } from 'lucide-react';
import { useState } from 'react';
import AudioVideosCard from './AudioVideosCard';
import SpinIcon from '@/components/svgs/common/SpinIcon';

const AudioAndVideos = () => {
    const [isAudio, setIsAudio] = useState(true);

    const ITEMS_PER_PAGE = 8;
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const { data, error, isLoading } = useMyAudioVideoQuery({});

    if (error) {
        return <p>Error</p>;
    }

    if (isLoading) {
        return (
            <div className='flex items-center justify-center h-screen'>
                <Loader className='animate-spin' />
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
        <div>
            <div className='flex items-center gap-1'>
                <Button
                    variant='ghost'
                    onClick={() => setIsAudio(true)}
                    className={cn(
                        'rounded-none flex items-center gap-1',
                        isAudio ? 'text-primary border-b-2 border-primary' : '',
                    )}
                >
                    <Volume2 /> Audios
                </Button>
                <Button
                    variant='ghost'
                    onClick={() => setIsAudio(false)}
                    className={cn(
                        'rounded-none flex items-center gap-1',
                        isAudio === false
                            ? 'text-primary border-b-2 border-primary'
                            : '',
                    )}
                >
                    <TvMinimalPlay />
                    Videos
                </Button>
            </div>

            <div>
                <div className='my-common grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4'>
                    {currentItems.map((media: TMediaItem) => (
                        <AudioVideosCard
                            key={media._id}
                            media={media}
                            isAudio={isAudio}
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

export default AudioAndVideos;
