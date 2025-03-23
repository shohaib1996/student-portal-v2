'use client';

import React, { useState, useCallback, Suspense, useEffect } from 'react';
import { MessageCircle, MessageCircleMore } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Import our new context
import { useChatModals } from './ChatModalsContext';
import ChatListModal from './ChatListModal';
import ChatConversationModal from './ChatConversationModal';
import MinimizedChatTabs from './MinimizedChatTabs';

// Import data
import chats from '../chats.json';

// Loading fallback
const LoadingFallback = () => (
    <div className='flex items-center justify-center p-4'>
        <div className='h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent'></div>
    </div>
);

const ChatPopup = () => {
    const { isListOpen, openModals, openListModal, closeListModal } =
        useChatModals();

    const [hasUnreadMessages, setHasUnreadMessages] = useState(false);

    // Check for unread messages
    useEffect(() => {
        // Check if there are any chats with unread messages
        const unreadCount = chats.reduce(
            (total, chat) => total + (chat.unreadCount || 0),
            0,
        );
        setHasUnreadMessages(unreadCount > 0);
    }, []);

    // Toggle chat list
    const toggleChatList = useCallback(() => {
        if (isListOpen) {
            closeListModal();
        } else {
            openListModal();
        }
    }, [isListOpen, openListModal, closeListModal]);

    return (
        <>
            {/* Chat button */}
            <div className='fixed bottom-4 right-4 z-50 hidden lg:block'>
                <Button
                    tooltip='Chat Head'
                    onClick={toggleChatList}
                    className='rounded-full h-12 w-12 p-2 shadow-lg relative hover:bg-primary hover:text-pure-white'
                >
                    <MessageCircleMore className='h-6 w-6' />

                    {/* Unread messages indicator with ping effect */}
                    {hasUnreadMessages && (
                        <div className='absolute top-0 right-3.5'>
                            {/* Ping animation */}
                            <span className='absolute h-4 w-4 rounded-full animate-ping bg-danger opacity-75'></span>
                            {/* Static dot */}
                            <span className='absolute h-4 w-4 bg-danger rounded-full border-2 border-white'></span>
                        </div>
                    )}
                </Button>
            </div>

            {/* Chat modals - rendered based on openModals from context */}
            <Suspense fallback={<LoadingFallback />}>
                {openModals
                    .filter((modal) => !modal.minimized)
                    .map((modal) =>
                        modal.type === 'list' ? (
                            <ChatListModal
                                key={modal.id}
                                position={modal.position}
                            />
                        ) : (
                            <ChatConversationModal
                                key={modal.id}
                                position={modal.position}
                                chatId={modal.chatId!}
                            />
                        ),
                    )}

                {/* Minimized chat tabs */}
                <MinimizedChatTabs />
            </Suspense>
        </>
    );
};

export default ChatPopup;
