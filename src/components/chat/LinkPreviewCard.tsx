'use client';

import type React from 'react';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ExternalLink, Loader2 } from 'lucide-react';
import { getLinkPreview } from 'link-preview-js';
import { Card, CardContent } from '@/components/ui/card';

interface LinkPreviewCardProps {
    url: string;
}

interface LinkPreviewData {
    title?: string;
    description?: string;
    images?: string[];
    siteName?: string;
    favicon?: string;
}

const LinkPreviewCard: React.FC<LinkPreviewCardProps> = ({ url }) => {
    const [previewData, setPreviewData] = useState<LinkPreviewData | null>(
        null,
    );
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchLinkPreview = async () => {
            try {
                setLoading(true);
                setError(false);

                const data: any = await getLinkPreview(url, {
                    headers: {
                        'Accept-Language': 'en-US',
                    },
                    timeout: 5000,
                });

                setPreviewData({
                    title: data.title,
                    description: data.description,
                    images: Array.isArray(data.images) ? data.images : [],
                    siteName: data.siteName,
                    favicon: data.favicons?.[0],
                });
            } catch (err) {
                console.error('Error fetching link preview:', err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        if (url) {
            fetchLinkPreview();
        }
    }, [url]);

    const handleClick = () => {
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    if (loading) {
        return (
            <Card className='w-full overflow-hidden border border-gray-200 hover:border-gray-300 transition-colors cursor-pointer'>
                <CardContent className='p-3 flex items-center justify-center h-24'>
                    <Loader2 className='h-5 w-5 text-gray-400 animate-spin' />
                </CardContent>
            </Card>
        );
    }

    if (error || !previewData) {
        return (
            <div
                className='w-full bg-background rounded-lg overflow-hidden border border-gray-200 hover:border-gray-300 transition-colors cursor-pointer'
                onClick={handleClick}
            >
                <div className='p-3'>
                    <div className='flex items-center gap-2'>
                        <ExternalLink className='h-4 w-4 text-blue-600' />
                        <a
                            href={url}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='text-blue-600 hover:underline text-sm truncate'
                        >
                            {url}
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className='w-full overflow-hidden border rounded-lg bg-background transition-colors cursor-pointer duration-300'
            onClick={handleClick}
        >
            <div className='flex flex-col sm:flex-row'>
                {previewData.images && previewData.images.length > 0 && (
                    <div className='relative w-full sm:w-1/3 bg-foreground object-cover'>
                        <Image
                            src={previewData.images[0] || '/placeholder.svg'}
                            alt={previewData.title || 'Link preview'}
                            fill
                            className='object-cover'
                        />
                    </div>
                )}
                <div
                    className={`p-3 flex flex-col ${previewData.images && previewData.images.length > 0 ? 'sm:w-2/3' : 'w-full'}`}
                >
                    {previewData.siteName && (
                        <div className='flex items-center gap-2 mb-1'>
                            {previewData.favicon && (
                                <Image
                                    src={
                                        previewData.favicon ||
                                        '/placeholder.svg'
                                    }
                                    width={16}
                                    height={16}
                                    alt={previewData.siteName}
                                    className='rounded-sm'
                                />
                            )}
                            <span className='text-xs text-gray-500'>
                                {previewData.siteName}
                            </span>
                        </div>
                    )}

                    <h3 className='font-medium text-sm line-clamp-2 mb-1'>
                        {previewData.title || url}
                    </h3>

                    {previewData.description && (
                        <p className='text-xs text-gray-600 line-clamp-2 mb-2'>
                            {previewData.description}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LinkPreviewCard;
