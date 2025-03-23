'use client';

import type React from 'react';
import Image from 'next/image';
const emptyChat = '/chat/empty_chat.png';

const ChatEmpty: React.FC = () => {
    return (
        <div className='inbox-container chat-empty bg-foreground shadow-sm h-full'>
            <div className='empty-img flex flex-col justify-center items-center h-full p-8'>
                <Image
                    src={emptyChat || '/placeholder.svg'}
                    alt='Empty Inbox'
                    width={661}
                    height={301}
                    className='max-w-full h-auto'
                    priority
                />
                <div className='flex flex-col items-center mt-4'>
                    <p className='text-dark-gray font-semibold'>
                        To start conversation please
                    </p>
                    <p className='text-primary font-semibold'>
                        select a crowd!
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ChatEmpty;
