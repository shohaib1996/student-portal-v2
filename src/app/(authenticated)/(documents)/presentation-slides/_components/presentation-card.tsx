'use client';

import { TdUser } from '@/components/global/TdUser';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { formatDateToCustomString } from '@/lib/formatDateToCustomString';
import { TSlide } from '@/types';
import { Eye, Layers, Lock } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

interface PresentationCardProps {
    presentation: TSlide;
    index?: number;
}

const PresentationCard = ({ presentation, index }: PresentationCardProps) => {
    return (
        <div className='border rounded-lg overflow-hidden bg-foreground'>
            <div className='relative'>
                {presentation ? (
                    <Image
                        src={'/program/program-card-image.png'}
                        alt={presentation?.title}
                        width={300}
                        height={200}
                        className='w-full h-[150px] object-cover'
                    />
                ) : (
                    <div className='w-full h-[150px] bg-muted flex items-center justify-center'>
                        <svg
                            xmlns='http://www.w3.org/2000/svg'
                            className='h-12 w-12 text-muted-foreground'
                            fill='none'
                            viewBox='0 0 24 24'
                            stroke='currentColor'
                        >
                            <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
                            />
                        </svg>
                    </div>
                )}
                {/* <div className='absolute top-2 left-2 z-50'>
                    <span className='rounded-full px-4 py-1 bg-foreground text-xs'>
                        {presentation?. || 'Overview'}
                    </span>
                </div> */}

                {/* {(index === 3 || index === 6) && (
                    <div className='absolute inset-0 bg-slate-900/30 flex items-center justify-center'>
                        <Lock className='text-foreground dark:text-gray-300 h-12 w-12' />``
                    </div>
                )} */}
            </div>
            <div className='p-4'>
                <h3 className='font-semibold text-lg mb-1 line-clamp-1'>
                    {presentation.title}
                </h3>
                <div className='flex items-center gap-2 my2'>
                    <Avatar className='h-5 w-5'>
                        <AvatarImage
                            src={presentation?.createdBy?.profilePicture}
                            alt={presentation?.createdBy?.fullName}
                        />
                        <AvatarFallback>
                            {presentation?.createdBy?.fullName?.charAt(0)}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <p className='text-sm font-medium'>
                            {presentation?.createdBy?.fullName || 'Author'}
                        </p>
                        <p className='text-xs text-muted-foreground'>
                            {presentation?.role || 'Admin'}
                        </p>
                        {/* <TdUser user={presentation?.createdBy} /> */}
                    </div>
                    <div className='flex items-center gap-1 ml-auto'>
                        <Layers className='h-4 w-4' />
                        <span className='text-xs'>
                            Total Slides: {presentation?.slides?.length || 0}
                        </span>
                    </div>
                </div>
                <div className='grid grid-cols-2 gap-2 text-xs my-3'>
                    <div>
                        <p className='text-muted-foreground'>Uploaded Date</p>
                        <p>
                            {formatDateToCustomString(presentation?.createdAt)}
                        </p>
                    </div>
                    <div>
                        <p className='text-muted-foreground'>Last Update</p>
                        <p>
                            {formatDateToCustomString(presentation?.updatedAt)}
                        </p>
                    </div>
                </div>
                <div className='flex items-center justify-center'>
                    <Link href={`/presentation-slides/${presentation._id}`}>
                        <Button
                            // disabled={index === 3 || index === 6}
                            variant='default'
                            size='sm'
                            className='text-xs px-3 w-full'
                        >
                            <Eye className='h-3 w-3' /> View
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PresentationCard;
