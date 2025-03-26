'use client';

import type React from 'react';
import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';
import { useParams } from 'next/navigation';

// Dynamic imports with loading fallbacks
const ChatNav = dynamic(() => import('./ChatNav'), {
    loading: () => (
        <div className='h-screen w-full bg-background rounded-md animate-pulse'></div>
    ),
    ssr: false,
});

const ChatEmpty = dynamic(() => import('./ChatEmpty'), {
    loading: () => (
        <div className='h-screen w-full bg-background rounded-md animate-pulse'></div>
    ),
    ssr: false,
});

const Chatbox: React.FC = () => {
    const params = useParams();
    const chatId = params?.chatid;

    return (
        <div className=''>
            <div className='grid grid-cols-1 lg:grid-cols-12'>
                {/* Chat Navigation - Hidden on small screens when chat is selected */}
                <div
                    className={`${chatId ? 'hidden lg:block' : ''} lg:col-span-4 3xl:col-span-3 lg:col-start-1 col-span-12 h-full`}
                >
                    <Suspense
                        fallback={
                            <div className='h-screen w-full bg-background rounded-md animate-pulse'></div>
                        }
                    >
                        <ChatNav />
                    </Suspense>
                </div>

                {/* Chat Empty state or content - Always visible but takes full width on small screens when chat is selected */}
                <div
                    className={`col-span-12 ${chatId ? 'block' : 'hidden lg:block'} lg:col-span-8 3xl:col-span-9 h-full`}
                >
                    <Suspense
                        fallback={
                            <div className='flex justify-center items-center h-[calc(100vh-60px)] w-full'>
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
