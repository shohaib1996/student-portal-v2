'use client';

import type React from 'react';
import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface Media {
    _id: string;
    url: string;
    type: string;
}

interface ImagesProps {
    chat: {
        _id: string;
    };
}

const Images: React.FC<ImagesProps> = ({ chat }) => {
    const [medias, setMedias] = useState<Media[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const divRef = useRef<HTMLDivElement>(null);

    const fetchMedias = useCallback(
        (options: { limit: number; type: string; lastId?: string }) => {
            setIsLoading(true);
            axios
                .post(`/chat/media/${chat?._id}`, options)
                .then((res) => {
                    setMedias(res.data?.medias || []);
                    setIsLoading(false);
                })
                .catch((err) => {
                    setIsLoading(false);
                    console.log(err);
                    toast.error(
                        err?.response?.data?.error || 'Failed to fetch media',
                    );
                });
        },
        [chat],
    );

    const handleScroll = useCallback(
        ({ lastId }: { lastId?: string }) => {
            const div = divRef.current;

            if (
                div &&
                div.scrollTop + div.clientHeight >= div.scrollHeight - 1
            ) {
                axios
                    .post(`/chat/media/${chat?._id}`, {
                        lastId,
                        limit: 50,
                        type: 'image',
                    })
                    .then((res) => {
                        setMedias((prev) => [
                            ...prev,
                            ...(res.data?.medias || []),
                        ]);
                    })
                    .catch((err) => {
                        console.log(err);
                        toast.error(
                            err?.response?.data?.error ||
                                'Failed to load more images',
                        );
                    });
            }
        },
        [chat],
    );

    useEffect(() => {
        if (chat) {
            fetchMedias({ limit: 50, type: 'image' });
        }
    }, [chat, fetchMedias]);

    return (
        <div className='w-full'>
            <div
                ref={divRef}
                className='max-h-[400px] overflow-y-auto'
                onScroll={() =>
                    handleScroll({ lastId: medias[medias.length - 1]?._id })
                }
            >
                {isLoading ? (
                    <div className='flex justify-center items-center py-5'>
                        <Loader2 className='h-6 w-6 text-primary animate-spin' />
                    </div>
                ) : medias?.length === 0 ? (
                    <div>
                        <h4 className='text-center py-5 text-muted-foreground'>
                            {`Don't have any images!`}
                        </h4>
                    </div>
                ) : (
                    <div className='grid grid-cols-3 gap-2'>
                        {medias.map((media, i) => (
                            <div
                                key={media._id || i}
                                className='aspect-square overflow-hidden rounded-md'
                            >
                                <img
                                    className='w-full h-full object-cover'
                                    src={media?.url || '/chat/user.png'}
                                    alt={`Media ${i}`}
                                    loading='lazy'
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Images;
