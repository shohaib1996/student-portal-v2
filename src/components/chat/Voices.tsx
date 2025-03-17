'use client';

import type React from 'react';
import { useEffect, useRef, useState, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import AudioCard from './TextEditor/AudioCard';

// Initialize dayjs plugins
dayjs.extend(relativeTime);

interface Media {
    _id: string;
    url: string;
    type: string;
    createdAt: string;
}

interface VoicesProps {
    chat: {
        _id: string;
    };
}

const Voices: React.FC<VoicesProps> = ({ chat }) => {
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
                    console.log(res?.data);
                    setIsLoading(false);
                })
                .catch((err) => {
                    setIsLoading(false);
                    toast.error(
                        err?.response?.data?.error ||
                            'Failed to fetch audio files',
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
                        type: 'voice',
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
                                'Failed to load more audio files',
                        );
                    });
            }
        },
        [chat],
    );

    useEffect(() => {
        if (chat) {
            fetchMedias({ limit: 50, type: 'voice' });
        }
    }, [chat, fetchMedias]);

    return (
        <div
            className='max-h-[400px] overflow-y-auto space-y-4 p-2'
            ref={divRef}
            onScroll={() =>
                handleScroll({ lastId: medias[medias?.length - 1]?._id })
            }
        >
            {isLoading ? (
                <div className='flex justify-center items-center py-5'>
                    <Loader2 className='h-6 w-6 text-primary animate-spin' />
                </div>
            ) : medias?.length === 0 ? (
                <div>
                    <h4 className='text-center py-5 text-muted-foreground'>
                        {`Don't have any audios!`}
                    </h4>
                </div>
            ) : (
                medias.map((media, i) => (
                    <div key={i} className='rounded-lg bg-muted p-3'>
                        <AudioCard audioUrl={media?.url} />
                        <span className='block text-xs text-muted-foreground mt-2'>
                            {dayjs(media?.createdAt).fromNow()}
                        </span>
                    </div>
                ))
            )}
        </div>
    );
};

export default Voices;
