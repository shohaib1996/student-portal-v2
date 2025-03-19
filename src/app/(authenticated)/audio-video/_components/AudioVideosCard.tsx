'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Play, TvMinimalPlay, Volume2 } from 'lucide-react';
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

    return (
        <>
            <Card className='overflow-hidden rounded-lg border-0 shadow-md'>
                <CardContent className='relative p-0'>
                    {isAudio ? (
                        <div className='h-[281px] w-full bg-slate-500'></div>
                    ) : (
                        <Image
                            className='h-[281px] w-full object-cover'
                            src={
                                media.thumbnail ||
                                'https://img.freepik.com/premium-photo/inclusive-learning-technologies-accessible-content-all_964851-4137.jpg'
                            }
                            alt={media.title}
                            width={500}
                            height={270}
                        />
                    )}

                    {/* Play button overlay */}
                    <div className='absolute inset-0 flex justify-center z-50 pt-12'>
                        <Button
                            variant='secondary'
                            size='icon'
                            className='h-16 w-16 rounded-full bg-white shadow-lg transition-transform hover:scale-105'
                            onClick={handleMedia}
                        >
                            {isAudio ? (
                                <Volume2 className='h-7 w-7 text-gray-700' />
                            ) : (
                                <TvMinimalPlay className='h-7 w-7 text-gray-700' />
                            )}
                        </Button>
                    </div>

                    {/* Bottom info panel */}
                    <div className='m-2 rounded-lg absolute bottom-0 left-0 right-0 bg-[#1e3a8a]/90 p-4 text-white backdrop-blur-sm'>
                        <h2 className='mb-2 text-xl font-bold leading-tight line-clamp-1'>
                            {media.title}
                        </h2>

                        <div className=''>
                            {/* Instructor avatar and name */}
                            <div className='flex items-center gap-2'>
                                <div className='relative h-8 w-8'>
                                    <Image
                                        src={
                                            media.createdBy?.profilePicture ||
                                            '/placeholder.svg?height=32&width=32'
                                        }
                                        alt={
                                            media.createdBy?.fullName ||
                                            'Instructor'
                                        }
                                        className='rounded-full object-cover'
                                        fill
                                    />
                                    <span className='absolute bottom-0 right-0 h-2 w-2 rounded-full bg-green-500 ring-1 ring-white'></span>
                                </div>
                                <div>
                                    <p className='text-sm font-medium leading-tight'>
                                        {media.createdBy?.fullName}
                                    </p>
                                    <p className='text-xs text-gray-300'>
                                        {media.createdBy?.role || 'Instructor'}
                                    </p>
                                </div>
                            </div>

                            {/* Date with calendar icon */}
                            <div className='flex items-center gap-1 mt-2'>
                                <Calendar className='h-4 w-4' />
                                <p className='text-sm'>
                                    {formatDateToCustomString(media.createdAt)}
                                </p>
                            </div>
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
