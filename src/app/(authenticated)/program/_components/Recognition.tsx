'use client';
import type React from 'react';
import Image from 'next/image';
import { useMediaQuery } from 'react-responsive';
import { cn } from '@/lib/utils';
import MessagePreview from '@/components/chat/Message/MessagePreview';

interface RoleData {
    title?: string;
    description?: string;
}

interface RecognitionProps {
    data: RoleData;
    index: number;
    className?: string;
}

const Recognition: React.FC<RecognitionProps> = ({
    data,
    index,
    className,
}) => {
    const isMobile = useMediaQuery({
        query: '(max-width: 768px)',
    });

    if (!data?.title && !data?.description) {
        return null;
    }

    return (
        <section
            className={cn(
                'xl:py-10 py-8 px-4 bg-gradient-to-br dark:from-slate-950 dark:to-amber-950 from-slate-100 to-amber-100',
                className,
            )}
        >
            <div className='my-container'>
                <div
                    className={cn(
                        'grid lg:grid-cols-2 gap-12 lg:gap-16 items-center',
                        index % 2 === 0 && !isMobile
                            ? 'lg:[&>div:first-child]:order-last'
                            : '',
                    )}
                >
                    <div className='space-y-6'>
                        {data?.title && (
                            <div className='relative'>
                                <div className='absolute -left-3 top-0 bottom-0 w-1 bg-emerald-500 rounded-full'></div>
                                <h2 className='text-xl md:text-2xl font-bold text-black leading-tight'>
                                    {data.title}
                                </h2>
                            </div>
                        )}

                        {data?.description && (
                            <div className='max-w-none text-dark-gray lg:text-lg'>
                                <MessagePreview text={data.description} />
                            </div>
                        )}
                    </div>

                    <div
                        className={cn(
                            'relative bg-background rounded-lg',
                            isMobile ? 'order-first' : '',
                        )}
                    >
                        <div className='absolute inset-0 bg-gradient-to-tr dark:from-emerald-900 dark:to-sky-950 from-emerald-100 to-sky-100 rounded-3xl transform -rotate-2 opacity-70'></div>
                        <div className='relative group bg-foreground rounded-lg'>
                            <div className='absolute inset-0 bg-emerald-100 dark:bg-emerald-900 rounded-3xl transform rotate-3 group-hover:rotate-1 transition-transform duration-300'></div>
                            <div className='relative overflow-hidden rounded-2xl shadow-lg'>
                                <Image
                                    width={1080}
                                    height={720}
                                    className='w-full h-auto max-h-96 object-contain transition-transform duration-500 group-hover:scale-105'
                                    src='/program/recognition.png'
                                    alt='What you will learn'
                                />
                            </div>
                        </div>

                        {/* Decorative elements */}
                        <div className='absolute -bottom-6 -right-6 w-24 h-24 bg-emerald-500/20 rounded-full blur-xl'></div>
                        <div className='absolute -top-4 -left-4 w-16 h-16 bg-blue-500/20 rounded-full blur-lg'></div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Recognition;
