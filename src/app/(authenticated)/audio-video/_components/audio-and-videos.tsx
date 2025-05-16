'use client';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useMyAudioVideoQuery } from '@/redux/api/audio-video/audioVideos';
import { TMediaItem } from '@/types/audio-videos/audio-videos';
import Fuse from 'fuse.js';
import {
    Loader,
    Search,
    MonitorPlayIcon as TvMinimalPlay,
    Volume2,
} from 'lucide-react';
import { useState } from 'react';
import AudioVideosCard from './AudioVideosCard';
import SpinIcon from '@/components/svgs/common/SpinIcon';
import { Input } from '@/components/ui/input';
import { TConditions } from '@/components/global/FilterModal/QueryBuilder';
import GlobalHeader from '@/components/global/GlobalHeader';
import FilterModal from '@/components/global/FilterModal/FilterModal';
import GlobalPagination from '@/components/global/GlobalPagination';

const AudioAndVideos = () => {
    const [isAudio, setIsAudio] = useState(true);
    const [limit, setLimit] = useState<number>(10);
    const [filterData, setFilterData] = useState<TConditions[]>([]);
    const [query, setQuery] = useState('');
    const [date, setDate] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const { data, error, isLoading } = useMyAudioVideoQuery({
        page: currentPage,
        limit: limit,
        query,
        createdAt: date,
    });

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

    // Filter items based on media type first
    const typeFilteredItems = medias.filter((media) => {
        // Check if the media type matches the selected type (audio or video)
        return isAudio
            ? media.mediaType === 'audio'
            : media.mediaType === 'video';
    });

    // Fuse.js configuration for search
    const fuse = new Fuse(typeFilteredItems, {
        keys: ['title', 'description'],
        threshold: 0.3,
    });

    // Filtered items based on search query
    const filteredItems = searchQuery
        ? fuse.search(searchQuery).map((result) => result.item)
        : typeFilteredItems;

    const totalItems = filteredItems.length;

    // Get current page items
    const startIndex = (currentPage - 1) * limit;
    const endIndex = startIndex + limit;
    const currentItems = filteredItems.slice(startIndex, endIndex);

    // Handle filter changes
    const handleFilter = (
        conditions: TConditions[],
        queryObj: Record<string, string>,
    ) => {
        setFilterData(conditions);
        setQuery(queryObj['query'] || '');
        setDate(queryObj['date'] || '');
    };

    const handlePageChange = (page: number, newLimit: number) => {
        setCurrentPage(page);
        setLimit(newLimit);
    };

    return (
        <div>
            <GlobalHeader
                title='Audio & Videos'
                subTitle='These audios and videos only shared with you'
                buttons={
                    <FilterModal
                        value={filterData}
                        onChange={handleFilter}
                        columns={[
                            {
                                label: 'Search (Name/Creator)',
                                value: 'query',
                            },
                            {
                                label: 'Creation Date',
                                value: 'date',
                            },
                        ]}
                    />
                }
            />
            <div className='flex flex-col sm:flex-row sm:items-center justify-between mb-4'>
                <div className='flex items-center gap-1 mb-4 sm:mb-0'>
                    <Button
                        variant='ghost'
                        onClick={() => setIsAudio(true)}
                        className={cn(
                            'rounded-none flex items-center gap-1',
                            isAudio
                                ? 'text-primary border-b-2 border-primary'
                                : '',
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

                <div className='relative w-full sm:w-64 md:w-80 h-12 flex items-center justify-center'>
                    <Input
                        type='text'
                        placeholder='Search media...'
                        value={searchQuery}
                        className='pl-8 bg-foreground'
                    />
                    <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
                </div>
            </div>

            <div>
                {currentItems.length === 0 ? (
                    <div className='flex flex-col items-center justify-center py-12'>
                        <p className='text-gray-500 mb-2'>
                            No {isAudio ? 'audio' : 'video'} content found
                        </p>
                        <p className='text-sm text-gray-400'>
                            Try adjusting your search or filters
                        </p>
                    </div>
                ) : (
                    <div className='my-common grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4'>
                        {currentItems.map((media: TMediaItem) => (
                            <AudioVideosCard
                                key={media._id}
                                media={media}
                                isAudio={isAudio}
                            />
                        ))}
                    </div>
                )}

                {totalItems > 0 && (
                    <GlobalPagination
                        currentPage={currentPage}
                        totalItems={totalItems || 0}
                        itemsPerPage={limit}
                        onPageChange={() => {}}
                    />
                )}
            </div>
        </div>
    );
};

export default AudioAndVideos;
