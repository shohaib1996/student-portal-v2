'use client';

import React, { useEffect, useState } from 'react';
import { useChatModals } from './ChatModalsContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion } from 'framer-motion';
import { Maximize2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import chats from '../chats.json';

const MinimizedChatTabs: React.FC = () => {
    const { openModals, restoreChatModal, closeChatModal } = useChatModals();
    const [minimizedChats, setMinimizedChats] = useState<
        { id: string; chatId: string; name: string; avatar: string }[]
    >([]);

    // Find minimized chats from the context
    useEffect(() => {
        const minimized = openModals
            .filter(
                (modal) =>
                    modal.type === 'conversation' &&
                    modal.minimized &&
                    modal.chatId,
            )
            .map((modal) => {
                const chatData = chats.find((c) => c._id === modal.chatId);
                return {
                    id: modal.id,
                    chatId: modal.chatId!,
                    name: chatData?.isChannel
                        ? chatData.name || 'Chat'
                        : typeof chatData?.otherUser === 'object'
                          ? chatData.otherUser.fullName || 'User'
                          : 'User',
                    avatar: chatData?.isChannel
                        ? chatData.avatar || '/chat/group.svg'
                        : typeof chatData?.otherUser === 'object'
                          ? chatData.otherUser.profilePicture ||
                            '/chat/user.svg'
                          : '/chat/user.svg',
                };
            });

        setMinimizedChats(minimized);
    }, [openModals]);

    if (minimizedChats.length === 0) {
        return null;
    }

    return (
        <div className='fixed -bottom-2 right-20 z-40 gap-2 p-2 hidden lg:flex'>
            {minimizedChats.map((chat) => (
                <motion.div
                    key={chat.id}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 20, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className='flex flex-col overflow-visible'
                >
                    {/* Polygon shape for buttons */}
                    <div className='flex items-end justify-end w-full'>
                        <div className='relative'>
                            {/* Border element with slightly larger clip path */}
                            <div
                                className='h-[20px] w-fit -mb-[1px]
                                        bg-transparent
                                        shadow-[0px_-6px_15px_0px_rgba(0,0,0,0.75)] rounded-t-lg z-[9]'
                                style={{
                                    clipPath:
                                        'polygon(10% 0, 90% 0, 100% 100%, 0% 100%)',
                                    borderTopLeftRadius: '8px',
                                    borderTopRightRadius: '8px',
                                }}
                            ></div>

                            {/* Background & content element */}
                            <div
                                className='absolute top-0 right-0 h-[20px] w-fit 
                                        bg-secondary dark:bg-primary-light flex items-center justify-center rounded-t-lg z-10'
                                style={{
                                    clipPath:
                                        'polygon(11% 0, 89% 0, 100% 100%, 0% 100%)',
                                    borderTopLeftRadius: '8px',
                                    borderTopRightRadius: '8px',
                                }}
                            >
                                <div className='flex items-center gap-1 px-2'>
                                    <Button
                                        variant='ghost'
                                        size='icon'
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            restoreChatModal(chat.chatId);
                                        }}
                                        className='h-7 w-7 rounded-full hover:bg-primary-dark bg-transparent'
                                    >
                                        <Maximize2 className='h-3.5 w-3.5 text-dark-gray' />
                                    </Button>
                                    <Button
                                        variant='ghost'
                                        size='icon'
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            closeChatModal(chat.chatId);
                                        }}
                                        className='h-7 w-7 rounded-full hover:bg-primary-dark bg-transparent'
                                    >
                                        <X className='h-3.5 w-3.5 text-danger' />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Chat tab content */}
                    <div
                        className='bg-background dark:bg-primary-light border rounded-tl-lg shadow-[0px_2px_25px_0px_rgba(0,0,0,0.75)] flex items-center px-3 py-1.5 cursor-pointer hover:border-primary min-w-[160px] max-w-[180px]'
                        onClick={() => restoreChatModal(chat.chatId)}
                    >
                        <Avatar className='h-8 w-8 mr-2 flex-shrink-0'>
                            <AvatarImage src={chat.avatar} alt={chat.name} />
                            <AvatarFallback>
                                {chat.name.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                        <span className='text-sm font-medium truncate'>
                            {chat.name}
                        </span>
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

export default MinimizedChatTabs;
