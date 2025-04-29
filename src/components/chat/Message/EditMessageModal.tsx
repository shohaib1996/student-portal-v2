import React, { useState, useEffect } from 'react';
import ChatFooter from '../ChatFooter';
import { parseMentionToEdit } from '@/helper/utilities';
import GlobalModal from '@/components/global/GlobalModal'; // Changed import

interface EditMessageModalProps {
    selectedMessage: any;
    chat: any;
    handleCloseEdit: () => void;
}

const EditMessageModal: React.FC<EditMessageModalProps> = ({
    selectedMessage,
    chat,
    handleCloseEdit,
}) => {
    const [text, setText] = useState('');
    const [isTyping, setIsTyping] = useState<boolean>(false);

    useEffect(() => {
        if (selectedMessage) {
            const newString = parseMentionToEdit(selectedMessage?.text || '');
            setText(newString);
        }
    }, [selectedMessage]);

    // Function to send typing indicator
    const sendTypingIndicator = (isTyping: boolean) => {
        // You can implement the typing indicator logic here
        setIsTyping(isTyping);
    };

    return (
        <GlobalModal
            open={Boolean(selectedMessage)}
            setOpen={(isOpen) => {
                if (!isOpen) {
                    handleCloseEdit();
                }
            }}
            title='Edit Message'
            className='edit-message-modal max-w-[600px]'
            allowFullScreen={false}
        >
            <div className='inbox-container pt-4'>
                <ChatFooter
                    isEdit={true}
                    reply={true}
                    chat={chat}
                    selectedMessage={selectedMessage}
                    onSentCallback={handleCloseEdit}
                    className={`chat_${chat?._id}`}
                    // initialText={text}
                    sendTypingIndicator={sendTypingIndicator}
                />
            </div>
        </GlobalModal>
    );
};

export default EditMessageModal;
