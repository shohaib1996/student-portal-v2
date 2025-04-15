import Image from 'next/image';
import React from 'react';

const CardLoader = () => {
    return (
        <div className='overflow-hidden rounded-lg border bg-foreground shadow-sm relative'>
            {/* Badge placeholder (Document) */}
            <div className='absolute left-2 top-2 z-10'>
                <div className='h-6 w-20 rounded-full bg-background opacity-20 overflow-hidden relative'>
                    <div className='skeleton-shine' />
                </div>
            </div>

            {/* Image placeholder */}
            <div className='h-36 w-full bg-background relative overflow-hidden'>
                <div className='absolute inset-0 bg-white/70 dark:bg-pure-black/70 z-10'></div>
                <Image
                    src='/default_image.png'
                    height={720}
                    width={1080}
                    alt='image skeleton'
                    className='h-full w-full object-cover'
                />
            </div>

            {/* Content area */}
            <div className='p-3 space-y-3'>
                {/* Date and read time */}
                <div className='flex items-center justify-between'>
                    <div className='h-4 w-24 rounded bg-background relative overflow-hidden'>
                        <div className='skeleton-shine' />
                    </div>
                    <div className='h-4 w-20 rounded bg-background relative overflow-hidden'>
                        <div className='skeleton-shine' />
                    </div>
                </div>

                {/* Title placeholder */}
                <div className='h-5 w-full rounded bg-background relative overflow-hidden'>
                    <div className='skeleton-shine' />
                </div>

                {/* Description placeholder - two lines */}
                <div className='space-y-2'>
                    <div className='h-4 w-full rounded bg-background relative overflow-hidden'>
                        <div className='skeleton-shine' />
                    </div>
                    <div className='h-4 w-3/4 rounded bg-background relative overflow-hidden'>
                        <div className='skeleton-shine' />
                    </div>
                </div>

                {/* Read more button placeholder */}
                <div className='h-4 w-24 rounded bg-background relative overflow-hidden'>
                    <div className='skeleton-shine' />
                </div>
            </div>
        </div>
    );
};

export default CardLoader;
