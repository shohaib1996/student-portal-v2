'use client';

import type React from 'react';
import { useState, useCallback, Suspense, useEffect, useRef } from 'react';
import { MessageCircleMore } from 'lucide-react';
import { Button } from '@/components/ui/button';
// Import our context
import { useChatModals } from './ChatModalsContext';
import ChatListModal from './ChatListModal';
import ChatConversationModal from './ChatConversationModal';
import MinimizedChatTabs from './MinimizedChatTabs';
import { useGetChatsQuery } from '@/redux/api/chats/chatApi';
import { useAppSelector } from '@/redux/hooks';
import { toast } from 'sonner';

// Loading fallback
const LoadingFallback = () => (
    <div className='flex items-center justify-center p-4'>
        <div className='h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent'></div>
    </div>
);

const ChatPopup = () => {
    const {
        isListOpen,
        openModals,
        openListModal,
        closeListModal,
        maxChatLimitReached,
        maxTotalLimitReached,
        resetMaxLimitWarning,
        resetTotalLimitWarning,
    } = useChatModals();
    // const { data: chats = [], isLoading: isChatsLoading } = useGetChatsQuery();
    const { chats = [] } = useAppSelector((state) => state.chat);
    const [hasUnreadMessages, setHasUnreadMessages] = useState(false);

    // State for button position
    const [buttonPosition, setButtonPosition] = useState({
        y: window.innerHeight - 100,
    });
    const [isDragging, setIsDragging] = useState(false);
    const [unReadCount, setUnReadCount] = useState(0);
    const buttonRef = useRef<HTMLDivElement>(null);

    // Check for unread messages
    useEffect(() => {
        // Check if there are any chats with unread messages
        const unreadCount = chats.reduce(
            (total, chat) => total + (chat.unreadCount || 0),
            0,
        );
        setUnReadCount(unreadCount);
        setHasUnreadMessages(unreadCount > 0);
    }, [chats]);
    // Add this effect to show toast when max limit is reached
    console.log({ maxChatLimitReached });

    // Handle visible modal limit reached
    useEffect(() => {
        if (maxChatLimitReached && !maxTotalLimitReached) {
            toast.error(
                'You can have maximum 4 visible chats at once. Please close or minimize some chats to open new ones.',
                {
                    duration: 5000,
                },
            );

            // Reset the flag after showing the toast
            resetMaxLimitWarning();
        }
    }, [maxChatLimitReached, maxTotalLimitReached, resetMaxLimitWarning]);

    // Handle total modal limit reached
    useEffect(() => {
        if (maxTotalLimitReached) {
            toast.error(
                'You can have maximum 10 chats open at once (including minimized). Please close some chats to open new ones.',
                {
                    duration: 5000,
                },
            );

            // Reset the flag after showing the toast
            resetTotalLimitWarning();

            // Also reset the regular limit flag since we're handling this case
            resetMaxLimitWarning();
        }
    }, [maxTotalLimitReached, resetTotalLimitWarning, resetMaxLimitWarning]);

    // Toggle chat list
    const toggleChatList = useCallback(() => {
        if (isListOpen) {
            closeListModal();
        } else {
            openListModal();
        }
    }, [isListOpen, openListModal, closeListModal]);

    // Handle drag start
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        // Only start dragging if it's not a button click
        if (
            e.target === buttonRef.current ||
            buttonRef.current?.contains(e.target as Node)
        ) {
            setIsDragging(true);
            // Prevent text selection during drag
            e.preventDefault();
        }
    }, []);

    // Handle dragging
    const handleMouseMove = useCallback(
        (e: MouseEvent) => {
            if (isDragging) {
                // Update position, keeping the button on the right side
                const newY = Math.max(
                    20,
                    Math.min(window.innerHeight - 80, e.clientY),
                );
                setButtonPosition({ y: newY });
            }
        },
        [isDragging],
    );

    // Handle drag end
    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    // Add and remove event listeners
    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, handleMouseMove, handleMouseUp]);
    const unreadChannels = chats?.filter((x) => (x.unreadCount ?? 0) > 0) || [];
    return (
        <>
            {/* Draggable Chat button */}
            <div
                ref={buttonRef}
                className={`fixed right-4 z-50 hidden lg:block cursor-${isDragging ? 'grabbing' : 'grab'}`}
                style={{ top: `${buttonPosition.y}px` }}
                onMouseDown={handleMouseDown}
            >
                <Button
                    onClick={toggleChatList}
                    className='rounded-full h-12 w-12 min-h-12 size-12 p-2 shadow-[0px_2px_20px_0px_rgba(0,0,0,0.50)] relative hover:bg-primary hover:text-pure-white'
                >
                    <MessageCircleMore className='h-6 w-6' />

                    {/* Unread messages indicator with ping effect */}
                    {hasUnreadMessages && (
                        <div className='absolute top-0 right-3.5'>
                            {/* Ping animation */}
                            <span className='absolute h-4 w-4 rounded-full animate-ping bg-danger opacity-75'></span>
                            {/* Static dot */}
                            <span className='absolute h-4 min-w-4 max-w-fit bg-danger rounded-full flex items-center justify-center p-1 text-xs'>
                                {unreadChannels.length > 99
                                    ? '99+'
                                    : unreadChannels.length}
                            </span>
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
