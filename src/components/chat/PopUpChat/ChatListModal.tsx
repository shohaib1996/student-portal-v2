'use client';

import React, { useState, useCallback } from 'react';
import ChatModal from './ChatModal';
import { useChatModals } from './ChatModalsContext';
import PopupChatNav from './PopupChatNav';

interface ChatListModalProps {
    position: number;
}

const ChatListModal: React.FC<ChatListModalProps> = ({ position }) => {
    const { closeListModal, openChatModal } = useChatModals();
    const [overflow, setOverflow] = useState(false);

    // Handler for selecting a chat
    const handleSelectChat = useCallback(
        (chatId: string) => {
            openChatModal(chatId);
            // Note: We don't close the list modal anymore
        },
        [openChatModal],
    );

    return (
        <ChatModal
            title={<h3 className='font-semibold'>Chats</h3>}
            position={position}
            onClose={closeListModal}
            width={360}
            maxWidth={500}
        >
            <div className='flex flex-col h-full'>
                <div
                    className={`flex-1 ${overflow ? 'overflow-y-auto overflow-x-hidden' : 'overflow-hidden'}`}
                >
                    <PopupChatNav
                        setCreateNew={(val) => setOverflow(val)}
                        onSelectChat={handleSelectChat}
                        selectedChatId={null}
                        onClose={() => {}} // No-op since we don't close the modal on selection
                    />
                </div>
            </div>
        </ChatModal>
    );
};

export default ChatListModal;
