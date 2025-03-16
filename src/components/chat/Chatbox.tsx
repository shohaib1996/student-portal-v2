'use client';

import type React from 'react';
import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

// Dynamic imports with loading fallbacks
const ChatNav = dynamic(() => import('./ChatNav'), {
    loading: () => (
        <div className='h-screen w-full bg-gray-100 dark:bg-gray-800 rounded-md animate-pulse'></div>
    ),
    ssr: false,
});

const ChatEmpty = dynamic(() => import('./ChatEmpty'), {
    loading: () => (
        <div className='h-screen w-full bg-gray-100 dark:bg-gray-800 rounded-md animate-pulse'></div>
    ),
    ssr: false,
});

const Chatbox: React.FC = () => {
    return (
        <div className='p-2 sm:p-3 md:p-5'>
            <div className='grid grid-cols-1 lg:grid-cols-12 gap-2 sm:gap-3 md:gap-5'>
                <div className='lg:col-span-5 col-span-12'>
                    <Suspense
                        fallback={
                            <div className='h-screen w-full bg-gray-100 dark:bg-gray-800 rounded-md animate-pulse'></div>
                        }
                    >
                        <ChatNav />
                    </Suspense>
                </div>

                <div className='lg:col-span-7 col-span-12'>
                    <Suspense
                        fallback={
                            <div className='flex justify-center items-center h-screen w-full'>
                                <Loader2 className='h-8 w-8 animate-spin text-primary' />
                            </div>
                        }
                    >
                        <ChatEmpty />
                    </Suspense>
                </div>
            </div>
        </div>
    );
};

export default Chatbox;
