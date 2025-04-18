'use client';

import React, { useState, useCallback, Suspense } from 'react';
import ChatModal from './ChatModal';
import { useChatModals } from './ChatModalsContext';
import PopupInbox from './PopupInbox';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import ChatInfo from '../ChatInfo';

// Loading fallback
const LoadingFallback = () => (
    <div className='flex items-center justify-center p-4'>
        <div className='h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent'></div>
    </div>
);

interface ChatConversationModalProps {
    position: number;
    chatId: string;
}

const ChatConversationModal: React.FC<ChatConversationModalProps> = ({
    position,
    chatId,
}) => {
    const { closeChatModal, openListModal, minimizeChatModal } =
        useChatModals();
    const [profileInfoShow, setProfileInfoShow] = useState(false);
    const [reloading, setReloading] = useState(false);

    // Handler for back button
    const handleBack = useCallback(() => {
        // Instead of going back to the list,
        // we ensure the list is open but don't close this modal
        openListModal();
    }, [openListModal]);

    // Handler for close button
    const handleClose = useCallback(() => {
        closeChatModal(chatId);
    }, [closeChatModal, chatId]);

    // Handler for minimize button
    const handleMinimize = useCallback(() => {
        minimizeChatModal(chatId);
    }, [minimizeChatModal, chatId]);

    // Handler for toggling profile info
    const handleToggleProfileInfo = useCallback(() => {
        setProfileInfoShow((prev) => !prev);
    }, []);

    return (
        <ChatModal
            position={position}
            onClose={handleClose}
            onMinimize={handleMinimize}
            width={360}
            maxWidth={500}
        >
            <Suspense fallback={<LoadingFallback />}>
                <PopupInbox
                    chatId={chatId}
                    onBack={handleBack}
                    onClose={handleClose}
                    handleToggleInfo={handleToggleProfileInfo}
                    setProfileInfoShow={setProfileInfoShow}
                    profileInfoShow={profileInfoShow}
                    setReloading={setReloading}
                    reloading={reloading}
                />
            </Suspense>
            {/* Chat Info as a right-side drawer */}
            <Sheet open={profileInfoShow} onOpenChange={setProfileInfoShow}>
                <SheetContent
                    className='w-full sm:min-w-[500px] sm:w-[500px] md:min-w-[600px] md:w-[600px] p-0 border-l'
                    side='right'
                >
                    <Suspense fallback={<LoadingFallback />}>
                        <ChatInfo
                            handleToggleInfo={handleToggleProfileInfo}
                            chatId={chatId}
                        />
                    </Suspense>
                </SheetContent>
            </Sheet>
        </ChatModal>
    );
};

export default ChatConversationModal;
