'use client';

import React, { ReactNode } from 'react';
import { ChatModalsProvider } from './ChatModalsContext';

interface ChatModalsWrapperProps {
    children: ReactNode;
}

const ChatModalsWrapper: React.FC<ChatModalsWrapperProps> = ({ children }) => {
    return <ChatModalsProvider>{children}</ChatModalsProvider>;
};

export default ChatModalsWrapper;
