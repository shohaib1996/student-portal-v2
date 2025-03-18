'use client';

import Image from 'next/image';
import { Upload, Calendar } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export interface GlobalDetailsBannerProps {
    title: string;
    author: string;
    uploadDate: string;
    lastUpdate: string;
    tags: string[];
    imageUrl?: string; // Optional, with a default fallback
    avatarUrl?: string; // Optional avatar image URL
}

export function GlobalDetailsBanner({
    title,
    author,
    uploadDate,
    lastUpdate,
    tags,
    imageUrl = '/images/documents-and-labs-thumbnail.png', // Default fallback
    avatarUrl = '/placeholder.svg?height=20&width=20', // Default avatar fallback
}: GlobalDetailsBannerProps) {
    return (
        <div className='relative mb-4 overflow-hidden rounded-lg border'>
            <Image
                src={imageUrl}
                alt={title}
                width={800}
                height={400}
                className='h-auto w-full object-cover'
            />
            <div className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-800/80 to-transparent p-4 text-white'>
                <h2 className='text-2xl font-bold'>{title}</h2>
                <div className='mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm'>
                    <div className='flex items-center gap-1'>
                        <Avatar className='h-5 w-5'>
                            <AvatarImage src={avatarUrl} alt={author} />
                            <AvatarFallback>{author[0]}</AvatarFallback>
                        </Avatar>
                        <span>{author}</span>
                    </div>
                    <div className='flex items-center gap-1'>
                        <Upload className='h-4 w-4' />
                        <span>Uploaded: {uploadDate}</span>
                    </div>
                    <div className='flex items-center gap-1'>
                        <Calendar className='h-4 w-4' />
                        <span>Last Update: {lastUpdate}</span>
                    </div>
                </div>
                <div className='mt-2 flex flex-wrap gap-1'>
                    {tags.map((tag, index) => (
                        <Badge
                            key={index}
                            variant='secondary'
                            className='bg-white/50 hover:bg-white/70 rounded-full'
                        >
                            {tag}
                        </Badge>
                    ))}
                </div>
            </div>
        </div>
    );
}
