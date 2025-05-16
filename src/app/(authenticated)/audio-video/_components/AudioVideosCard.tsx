'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import {
    Calendar,
    Clock,
    Eye,
    MonitorPlayIcon as TvMinimalPlay,
    Volume2,
} from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import MediaModal from './MediaModal';
import { formatDateToCustomString } from '@/lib/formatDateToCustomString';

// Define the media item type if not already defined
type TMediaItem = {
    _id: string;
    title: string;
    url: string;
    createdAt: string;
    createdBy: {
        fullName: string;
        profilePicture: string;
        role?: string;
    };
    thumbnail?: string;
    description?: string;
    duration?: string;
};

type TAudioVideosCardProps = {
    media: TMediaItem;
    isAudio?: boolean;
};

const AudioVideosCard = ({ media, isAudio }: TAudioVideosCardProps) => {
    const [showModal, setShowModal] = useState<boolean>(false);

    const handleMedia = () => {
        setShowModal(true);
    };

    // Format duration or use default
    const duration = media.duration;

    return (
        <>
            <Card className='overflow-hidden rounded-lg border shadow-sm hover:shadow-md transition-shadow'>
                <CardContent className='p-0'>
                    {/* Media type badge */}
                    <div className='absolute top-3 left-3 z-10'>
                        <div className='flex items-center gap-1 bg-white px-2 py-1 rounded-md shadow-sm'>
                            {isAudio ? (
                                <>
                                    <Volume2 className='h-4 w-4 text-primary' />
                                    <span className='text-xs font-medium text-primary'>
                                        Audios
                                    </span>
                                </>
                            ) : (
                                <>
                                    <TvMinimalPlay className='h-4 w-4 text-primary' />
                                    <span className='text-xs font-medium text-primary'>
                                        Videos
                                    </span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Duration badge */}
                    <div className='absolute top-3 right-3 z-10'>
                        <div className='flex items-center gap-1 bg-black/80 backdrop-blur-sm px-2 py-1 rounded-md'>
                            <Clock className='h-3 w-3 text-gray' />
                            <span className='text-xs font-medium text-gray'>
                                {duration}
                            </span>
                        </div>
                    </div>

                    {/* Media thumbnail */}
                    <div className='relative h-[180px] w-full bg-background'>
                        {/* Background image */}
                        <Image
                            src={media.thumbnail || '/default_image.png'}
                            alt={media.title}
                            fill
                            className='object-cover'
                        />

                        {/* Black overlay with 30% opacity */}
                        <div className='absolute inset-0 bg-pure-black/30'></div>

                        {/* Play button overlay */}
                        <div className='absolute inset-0 flex items-center justify-center'>
                            <Button
                                variant='secondary'
                                size='icon'
                                className='h-12 w-12 rounded-full border border-pure-white bg-pure-white/40 shadow-md hover:bg-foreground'
                                onClick={handleMedia}
                            >
                                {isAudio ? (
                                    <Volume2 className='h-5 w-5 text-pure-white' />
                                ) : (
                                    <TvMinimalPlay className='h-5 w-5 text-pure-white' />
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Content section */}
                    <div className='p-2'>
                        {/* Date and time */}
                        <div className='flex items-center justify-between gap-2 mb-2'>
                            <div className='flex flex-row items-center gap-1'>
                                <Calendar className='h-4 w-4 text-gray' />
                                <p className='text-xs text-gray'>
                                    {formatDateToCustomString(media.createdAt)}
                                </p>
                            </div>
                            {duration && (
                                <div className='flex flex-row items-center gap-1'>
                                    <Clock className='h-3 w-3 text-gray' />
                                    <span className='text-xs font-medium text-gray'>
                                        {duration}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Title */}
                        <h2 className='text-base font-semibold mb-2 line-clamp-1 truncate capitalize'>
                            {media.title}
                        </h2>

                        {/* Author info */}
                        <div className='flex items-center gap-2'>
                            <div className='relative h-8 w-8'>
                                <Image
                                    src={
                                        media.createdBy?.profilePicture ||
                                        '/default_image.png'
                                    }
                                    alt={
                                        media.createdBy?.fullName ||
                                        'Instructor'
                                    }
                                    className='rounded-full object-cover'
                                    fill
                                />
                            </div>
                            <div>
                                <p className='text-sm font-medium leading-tight'>
                                    {media.createdBy?.fullName}
                                </p>
                                <p className='text-xs text-gray'>
                                    {media.createdBy?.role || 'Instructor'}
                                </p>
                            </div>
                        </div>
                        <div className='mt-2 pt-2 border-t'>
                            <Button
                                className='w-full hover:text-primary/90 hover:bg-primary/5 border-blue-700/50'
                                onClick={handleMedia}
                            >
                                <Eye className='h-4 w-4 mr-2' />
                                View
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Modal */}
            <MediaModal
                showModal={showModal}
                setShowModal={setShowModal}
                media={media}
            />
        </>
    );
};

export default AudioVideosCard;
