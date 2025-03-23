'use client';

import React, { useState, useCallback, Suspense, useEffect } from 'react';
import { MessageCircle, MessageCircleMore, X } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

// Import popup-specific components
import PopupChatNav from './PopupChatNav';
import PopupInbox from './PopupInbox';

import chats from '../chats.json';

// Loading fallback
const LoadingFallback = () => (
    <div className='flex items-center justify-center p-4'>
        <div className='h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent'></div>
    </div>
);

const ChatPopup = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
    const [profileInfoShow, setProfileInfoShow] = useState(false);
    const [reloading, setReloading] = useState(false);
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

    // Handle chat selection
    const handleSelectChat = useCallback((chatId: string) => {
        setSelectedChatId(chatId);
    }, []);

    // Go back to chat list
    const handleBackToList = useCallback(() => {
        setSelectedChatId(null);
    }, []);

    // Handle toggle profile info
    const handleToggleProfileInfo = useCallback(() => {
        setProfileInfoShow((prev) => !prev);
    }, []);

    const [overflow, setOverflow] = useState(false);

    return (
        <div className='fixed bottom-16 right-4 z-50'>
            {/* Ping animation effect */}
            {hasUnreadMessages && (
                <span className='absolute inset-0 rounded-full animate-ping bg-primary opacity-75'></span>
            )}

            <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
                <DropdownMenuTrigger asChild>
                    <Button
                        tooltip='Chat Head'
                        className='rounded-full h-14 w-14 p-2 shadow-lg relative hover:bg-primary hover:text-pure-white'
                    >
                        <MessageCircleMore className='h-6 w-6' />

                        {/* Unread messages indicator */}
                        {hasUnreadMessages && (
                            <span className='absolute top-0 right-0 h-4 w-4 bg-danger rounded-full border-2 border-white'></span>
                        )}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    className='p-2 rounded-lf shadow-[0px_0px_15px_0px_rgba(0,0,0,0.50)] border w-[360px] sm:w-[500px]'
                    style={{
                        position: 'fixed',
                        right: '20px',
                        top: '50%',
                        transform: 'translateY(-120%)',
                        height: '550px',
                        maxHeight: '70vh',
                        overflow: 'hidden',
                    }}
                >
                    {selectedChatId ? (
                        // Show message view with PopupInbox component
                        <div className='h-full'>
                            <Suspense fallback={<LoadingFallback />}>
                                <PopupInbox
                                    chatId={selectedChatId}
                                    onBack={handleBackToList}
                                    onClose={() => setIsOpen(false)}
                                    handleToggleInfo={handleToggleProfileInfo}
                                    setProfileInfoShow={setProfileInfoShow}
                                    profileInfoShow={profileInfoShow}
                                    setReloading={setReloading}
                                    reloading={reloading}
                                />
                            </Suspense>
                        </div>
                    ) : (
                        // Show chat list with PopupChatNav component
                        <div className='flex flex-col h-full'>
                            <div
                                className={`flex-1 ${overflow ? 'overflow-y-auto overflow-x-hidden' : 'overflow-hidden'}`}
                            >
                                <Suspense fallback={<LoadingFallback />}>
                                    <PopupChatNav
                                        setCreateNew={(val) => setOverflow(val)}
                                        onSelectChat={handleSelectChat}
                                        selectedChatId={selectedChatId}
                                        onClose={() => setIsOpen(false)}
                                    />
                                </Suspense>
                            </div>
                        </div>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
};

export default ChatPopup;
