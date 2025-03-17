'use client';

import type React from 'react';
import Image from 'next/image';
import emptyChat from '/public/chat/empty_chat.svg';

const ChatEmpty: React.FC = () => {
    return (
        <div className='inbox-container chat-empty bg-white dark:bg-gray-900 rounded-md shadow-sm'>
            <div className='empty-img flex justify-center items-center h-full p-8'>
                <Image
                    src={emptyChat || '/placeholder.svg'}
                    alt='Empty Inbox'
                    width={400}
                    height={300}
                    className='max-w-full h-auto'
                    priority
                />
            </div>
        </div>
    );
};

export default ChatEmpty;
