import React, { useState, useEffect } from 'react';
import ChatFooter from '../ChatFooter';
import { parseMentionToEdit } from '@/helper/utilities';
import GlobalDialog from '@/components/global/GlobalDialogModal/GlobalDialog';

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
        <GlobalDialog
            open={Boolean(selectedMessage)}
            setOpen={(isOpen) => {
                if (!isOpen) {
                    handleCloseEdit();
                }
            }}
            title='Edit Message'
            className='edit-message-modal max-w-[600px]'
            showCloseButton={true}
            allowFullScreen={false}
        >
            <div className='inbox-container p-3'>
                <ChatFooter
                    reply={true}
                    selectedMessage={selectedMessage}
                    onSentCallback={handleCloseEdit}
                    className={`chat_${chat?._id}`}
                    // initialText={text}
                    sendTypingIndicator={sendTypingIndicator}
                />
            </div>
        </GlobalDialog>
    );
};

export default EditMessageModal;
