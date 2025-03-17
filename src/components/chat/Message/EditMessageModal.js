import React, { useState, useEffect } from 'react';
import {
    parseMentionToEdit,
    replaceNodeToMention,
} from '../../../helper/utilitis';
import ChatFooter from '../ChatFooter';
import { Modal } from '@mantine/core';
import { useTheme } from '../../../context/ThemeContext';

function EditMessageModal({ selectedMessage, chat, handleCloseEdit }) {
    const [text, setText] = useState('');

    useEffect(() => {
        if (selectedMessage) {
            let newString = parseMentionToEdit(selectedMessage?.text || '');
            setText(newString);
        }
    }, [selectedMessage]);
    const Colors = useTheme();

    return (
        <Modal
            size={'xl'}
            title={<span style={{ color: Colors.Heading }}>Edit Message</span>}
            className='thread-modal'
            centered
            opened={Boolean(selectedMessage)}
            onClose={handleCloseEdit}
            onCancel={handleCloseEdit}
            style={{ padding: 0 }}
        >
            <div className='inbox-container treadEditor'>
                <ChatFooter
                    reply={true}
                    chatId={chat?._id}
                    selectedMessage={selectedMessage}
                    onSentCallback={handleCloseEdit}
                    className={`chat_${chat?._id}`}
                />
            </div>
        </Modal>
    );
}

export default EditMessageModal;
