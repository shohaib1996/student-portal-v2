'use client';

import React, { useState, useCallback, Suspense } from 'react';
import ChatModal from './ChatModal';
import { useChatModals } from './ChatModalsContext';
import PopupInbox from './PopupInbox';

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
        </ChatModal>
    );
};

export default ChatConversationModal;
