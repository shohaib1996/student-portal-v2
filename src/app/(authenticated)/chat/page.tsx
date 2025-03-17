'use client';

import type React from 'react';
import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

// Dynamic import with loading fallback
const Chatbox = dynamic(() => import('@/components/chat/Chatbox'), {
    loading: () => (
        <div className='flex justify-center items-center h-[calc(100vh-7rem)] w-full'>
            <Loader2 className='h-8 w-8 animate-spin text-primary' />
        </div>
    ),
    ssr: false,
});

const Chat: React.FC = () => {
    return (
        <div className='bg-white dark:bg-gray-900 min-h-screen'>
            {/* Main chat container */}
            <div className='chat-container bg-gray-50 dark:bg-gray-800'>
                <Suspense
                    fallback={
                        <div className='flex justify-center items-center h-[calc(100vh-7rem)] w-full'>
                            <Loader2 className='h-8 w-8 animate-spin text-primary' />
                        </div>
                    }
                >
                    <Chatbox />
                </Suspense>
            </div>
        </div>
    );
};

export default Chat;
