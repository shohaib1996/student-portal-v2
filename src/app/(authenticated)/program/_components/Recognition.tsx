'use client';
import type React from 'react';
import { cn } from '@/lib/utils';
import MessagePreview from '@/components/lexicalEditor/renderer/MessagePreview';

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
                <div className='max-w-2xl mx-auto'>
                    <div className='space-y-6'>
                        {data?.title && (
                            <div className='relative text-center'>
                                <h2 className='text-xl md:text-2xl font-bold text-black leading-tight'>
                                    {data.title}
                                </h2>
                                <div className='h-1 w-20 bg-emerald-500 mt-2 mx-auto rounded-full'></div>
                            </div>
                        )}

                        {data?.description && (
                            <div className='max-w-none text-dark-gray lg:text-lg'>
                                <MessagePreview text={data.description} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Recognition;
