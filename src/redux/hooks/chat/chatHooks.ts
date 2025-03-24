import { useEffect, useState } from 'react';
import {
    useGetChatsQuery,
    useGetChatMessagesQuery,
    useMarkChatAsReadMutation,
    ChatMessage,
} from '@/redux/api/chats/chatApi';
import { socket } from '@/helper/socketManager';

/**
 * Custom hook to fetch and manage chat data with optimized behavior
 * This hook handles initial loading and polling
 */
export const useChats = () => {
    const {
        data: chats = [],
        isLoading,
        isError,
        error,
        refetch,
    } = useGetChatsQuery(undefined, {
        // Poll for new chats every 60 seconds
        pollingInterval: 60000,
        // Skip polling if the window is not visible
        skip: typeof document !== 'undefined' && document.hidden,
    });

    // Ensure we're connected to chat rooms
    useEffect(() => {
        if (chats.length > 0 && socket) {
            // Join all chat rooms
            chats.forEach((chat) => {
                socket?.emit('join-chat-room', { chatId: chat._id });
            });
        }
    }, [chats]);

    return {
        chats,
        isLoading,
        isError,
        error,
        refetch,
    };
};

/**
 * Custom hook to fetch and manage chat messages
 * Handles read receipts and message pagination
 */
export const useChatMessages = (chatId: string, limit: number = 20) => {
    const [page, setPage] = useState(1);
    const [allMessages, setAllMessages] = useState<ChatMessage[]>([]);
    const [markAsRead] = useMarkChatAsReadMutation();

    const { data, isLoading, isFetching, isError, error, refetch } =
        useGetChatMessagesQuery(
            {
                chat: chatId,
                page,
                limit,
            },
            {
                // Don't refetch data on window focus
                refetchOnFocus: false,
                // Skip if no chatId is provided
                skip: !chatId,
            },
        );

    // Update allMessages when data changes
    useEffect(() => {
        if (data?.messages) {
            if (page === 1) {
                // First page - replace all messages
                setAllMessages(data.messages);
            } else {
                // Subsequent pages - add to existing messages
                // Remove duplicates by ID
                const existingIds = new Set(allMessages.map((msg) => msg._id));
                const newMessages = data.messages.filter(
                    (msg) => !existingIds.has(msg._id),
                );
                setAllMessages((prev) => [...newMessages, ...prev]);
            }

            // Mark chat as read when messages are loaded
            if (chatId && data.messages.length > 0) {
                markAsRead(chatId);
            }
        }
    }, [data, page, chatId, markAsRead]);

    // Load more messages
    const loadMoreMessages = () => {
        setPage((prev) => prev + 1);
    };

    // Reset pagination when chatId changes
    useEffect(() => {
        setPage(1);
        setAllMessages([]);
    }, [chatId]);

    return {
        messages: allMessages,
        totalCount: data?.count || 0,
        chatInfo: data?.chat,
        isLoading,
        isFetchingMore: isFetching && page > 1,
        isError,
        error,
        loadMoreMessages,
        refetch,
        hasMore: allMessages.length < (data?.count || 0),
    };
};

/**
 * Custom hook to manage typing indicators for a chat
 */
export const useTypingIndicator = (chatId: string) => {
    const [isTyping, setIsTyping] = useState(false);

    // Emit typing event
    const sendTypingIndicator = () => {
        if (socket && chatId) {
            socket.emit('typing', {
                chatId,
                isTyping: true,
            });
            setIsTyping(true);

            // Auto-reset typing indicator after 3 seconds
            setTimeout(() => {
                if (socket) {
                    socket.emit('typing', {
                        chatId,
                        isTyping: false,
                    });
                    setIsTyping(false);
                }
            }, 3000);
        }
    };

    return {
        isTyping,
        sendTypingIndicator,
    };
};

/**
 * Custom hook to manage draft messages
 */
export const useDraftMessages = () => {
    const [drafts, setDrafts] = useState<{
        [chatId: string]: { text: string; files: any[] };
    }>({});

    // Save draft message
    const saveDraft = (chatId: string, text: string, files: any[] = []) => {
        setDrafts((prev) => ({
            ...prev,
            [chatId]: { text, files },
        }));
    };

    // Get draft message for a chat
    const getDraft = (chatId: string) => {
        return drafts[chatId] || { text: '', files: [] };
    };

    // Clear draft message
    const clearDraft = (chatId: string) => {
        setDrafts((prev) => {
            const newDrafts = { ...prev };
            delete newDrafts[chatId];
            return newDrafts;
        });
    };

    return {
        drafts,
        saveDraft,
        getDraft,
        clearDraft,
    };
};
