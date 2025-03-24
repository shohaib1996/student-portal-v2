import { socket } from '@/helper/socketManager';
import {
    addMessageToStorage,
    updateMessageInStorage,
    updateChatInStorage,
    saveOnlineUsersToStorage,
    loadChatsFromStorage,
    loadChatMessagesFromStorage,
    saveChatsToStorage,
} from '@/utils/chatLocalStorage';
import {
    chatApi,
    ChatMessage,
    ChatData,
    UpdateMessageStatusParams,
} from '@/redux/api/chats/chatApi';
import { store } from '@/redux/store';
import { AnyAction } from '@reduxjs/toolkit';

// Type for our store dispatch
type AppDispatch = typeof store.dispatch;

/**
 * Setup socket listeners that integrate with RTK Query and localForage
 * @returns Cleanup function to remove listeners
 */
const setupSocketListeners = () => {
    if (!socket) {
        return () => {};
    }

    const audio = new Audio('/noti2.mp3');
    const userId = store.getState()?.auth?.user?._id;

    if (!userId) {
        return () => {};
    }

    // Helper to get dispatch
    const dispatch: AppDispatch = store.dispatch;

    // When server requests online status
    socket.on('join_online', () => {
        socket?.emit('online', { id: userId });
    });

    // New message received
    socket.on(
        'newmessage',
        async (data: { chat?: { _id: string }; message?: ChatMessage }) => {
            console.log({ NewMessage: data?.message });

            const isSoundOnOrOff = store.getState()?.notification
                ?.isSoundOnOrOff as string;
            const chatId = data.chat?._id;
            const message = data.message;

            if (!chatId || !message) {
                return;
            }

            // If message is from another user, mark as delivered
            // if (message.sender?._id !== userId) {
            //     // Update message status on server - use as any to bypass type checking
            //     dispatch(
            //         chatApi.endpoints.updateMessageStatus.initiate({
            //             messageId: message._id,
            //             status: 'delivered',
            //         } as UpdateMessageStatusParams) as unknown as AnyAction,
            //     );

            //     // Play notification sound if enabled
            //     if (isSoundOnOrOff === 'on') {
            //         audio.play();
            //     }
            // }

            try {
                // Add message to RTK Query cache
                dispatch(
                    chatApi.util.updateQueryData(
                        'getChatMessages',
                        { page: 1, limit: 20, chat: chatId },
                        (draft) => {
                            // Check if message already exists
                            const exists = draft.messages.some(
                                (m) => m._id === message._id,
                            );
                            if (!exists) {
                                if (message.parentMessage) {
                                    // Handle reply messages
                                    const parentMsg = draft.messages.find(
                                        (m) => m._id === message.parentMessage,
                                    );
                                    if (parentMsg) {
                                        parentMsg.replies =
                                            parentMsg.replies || [];
                                        parentMsg.replies.push(message);
                                        parentMsg.replyCount =
                                            (parentMsg.replyCount || 0) + 1;
                                    }
                                } else {
                                    // Regular messages
                                    draft.messages.push(message);

                                    // Update in localForage (async)
                                    addMessageToStorage(chatId, message).catch(
                                        (err) =>
                                            console.error(
                                                'Error adding message to storage:',
                                                err,
                                            ),
                                    );
                                }
                            }
                        },
                    ) as unknown as AnyAction,
                );

                // Update latest message in chat list
                if (!message.parentMessage) {
                    dispatch(
                        chatApi.util.updateQueryData(
                            'getChats',
                            undefined,
                            (draft: ChatData[]) => {
                                const chatToUpdate = draft.find(
                                    (c) => c._id === chatId,
                                );
                                if (chatToUpdate) {
                                    chatToUpdate.latestMessage = message;

                                    // Increment unread count if not from current user
                                    if (message.sender._id !== userId) {
                                        chatToUpdate.unreadCount =
                                            (chatToUpdate.unreadCount || 0) + 1;
                                    }

                                    // Update chat in localForage
                                    updateChatInStorage(chatToUpdate).catch(
                                        (err) =>
                                            console.error(
                                                'Error updating chat in storage:',
                                                err,
                                            ),
                                    );
                                }
                            },
                        ) as unknown as AnyAction,
                    );
                }
            } catch (error) {
                console.error('Error handling new message event:', error);
            }
        },
    );

    // Message updated
    socket.on(
        'updatemessage',
        (data: { chat?: { _id: string }; message?: ChatMessage }) => {
            const chatId = data.chat?._id;
            const message = data.message;

            if (!chatId || !message) {
                return;
            }

            try {
                // Update message in RTK Query cache
                dispatch(
                    chatApi.util.updateQueryData(
                        'getChatMessages',
                        { page: 1, limit: 20, chat: chatId },
                        (draft) => {
                            if (message.parentMessage) {
                                // Update a reply
                                const parentMsg = draft.messages.find(
                                    (m) => m._id === message.parentMessage,
                                );
                                if (parentMsg && parentMsg.replies) {
                                    const replyIndex =
                                        parentMsg.replies.findIndex(
                                            (r) => r._id === message._id,
                                        );
                                    if (replyIndex >= 0) {
                                        parentMsg.replies[replyIndex] = {
                                            ...parentMsg.replies[replyIndex],
                                            ...message,
                                        };
                                    }
                                }
                            } else {
                                // Update a regular message
                                const messageIndex = draft.messages.findIndex(
                                    (m) => m._id === message._id,
                                );
                                if (messageIndex >= 0) {
                                    draft.messages[messageIndex] = {
                                        ...draft.messages[messageIndex],
                                        ...message,
                                    };

                                    // Update in localForage
                                    updateMessageInStorage(
                                        chatId,
                                        message,
                                    ).catch((err) =>
                                        console.error(
                                            'Error updating message in storage:',
                                            err,
                                        ),
                                    );
                                }
                            }
                        },
                    ) as unknown as AnyAction,
                );
            } catch (error) {
                console.error('Error handling update message event:', error);
            }
        },
    );

    // Chat updated
    socket.on('updatechat', (data: { chat?: ChatData }) => {
        const chat = data.chat;
        if (!chat) {
            return;
        }

        try {
            // Update chat in RTK Query cache
            dispatch(
                chatApi.util.updateQueryData(
                    'getChats',
                    undefined,
                    (draft: ChatData[]) => {
                        const index = draft.findIndex(
                            (c) => c._id === chat._id,
                        );
                        if (index >= 0) {
                            draft[index] = { ...draft[index], ...chat };

                            // Update in localForage
                            updateChatInStorage(draft[index]).catch((err) =>
                                console.error(
                                    'Error updating chat in storage:',
                                    err,
                                ),
                            );
                        } else {
                            // New chat, add it to the list
                            draft.unshift(chat);

                            // Join the chat room
                            socket?.emit('join-chat-room', {
                                chatId: chat._id,
                            });

                            // Update chats in localForage
                            saveChatsToStorage(draft).catch((err) =>
                                console.error(
                                    'Error saving chats to storage:',
                                    err,
                                ),
                            );
                        }
                    },
                ) as unknown as AnyAction,
            );
        } catch (error) {
            console.error('Error handling update chat event:', error);
        }
    });

    // Push message (for system messages)
    socket.on(
        'pushmessage',
        (data: { chat?: string; message?: ChatMessage }) => {
            const chatId = data.chat;
            const message = data.message;

            if (!chatId || !message) {
                return;
            }

            try {
                // Add message to RTK Query cache
                dispatch(
                    chatApi.util.updateQueryData(
                        'getChatMessages',
                        { page: 1, limit: 20, chat: chatId },
                        (draft) => {
                            // Check if message already exists
                            const exists = draft.messages.some(
                                (m) => m._id === message._id,
                            );
                            if (!exists) {
                                draft.messages.push(message);

                                // Update in localForage
                                addMessageToStorage(chatId, message).catch(
                                    (err) =>
                                        console.error(
                                            'Error adding message to storage:',
                                            err,
                                        ),
                                );
                            }
                        },
                    ) as unknown as AnyAction,
                );
            } catch (error) {
                console.error('Error handling push message event:', error);
            }
        },
    );

    // New notification
    socket.on(
        'newnotification',
        (data: {
            notification?: {
                categories?: string[];
            };
        }) => {
            // Handle notification
            if (
                data?.notification?.categories?.includes('student') ||
                data?.notification?.categories?.includes('global')
            ) {
                try {
                    // Update notifications in RTK Query or use a separate notification API
                    // For now, we'll trigger a refetch of unread notifications
                    dispatch(
                        chatApi.endpoints.getChats.initiate(undefined, {
                            forceRefetch: true,
                        }) as unknown as AnyAction,
                    );
                } catch (error) {
                    console.error(
                        'Error handling new notification event:',
                        error,
                    );
                }
            }
        },
    );

    // User comes online
    socket.on('addOnlineUser', (data: { user?: { _id: string } }) => {
        const user = data.user;
        if (!user) {
            return;
        }

        try {
            // Update online users in RTK Query
            dispatch(
                chatApi.util.updateQueryData(
                    'getOnlineUsers',
                    undefined,
                    (draft) => {
                        // Check if user already in the list
                        const exists = draft.some((u) => u._id === user._id);
                        if (!exists) {
                            draft.push(user);

                            // Update localForage
                            saveOnlineUsersToStorage(draft).catch((err) =>
                                console.error(
                                    'Error saving online users to storage:',
                                    err,
                                ),
                            );
                        }
                    },
                ) as unknown as AnyAction,
            );
        } catch (error) {
            console.error('Error handling add online user event:', error);
        }
    });

    // User goes offline
    socket.on('removeOnlineUser', (data: { user?: { _id: string } }) => {
        const user = data.user;
        if (!user) {
            return;
        }

        try {
            // Update online users in RTK Query
            dispatch(
                chatApi.util.updateQueryData(
                    'getOnlineUsers',
                    undefined,
                    (draft) => {
                        const index = draft.findIndex(
                            (u) => u._id === user._id,
                        );
                        if (index >= 0) {
                            draft.splice(index, 1);

                            // Update localForage
                            saveOnlineUsersToStorage(draft).catch((err) =>
                                console.error(
                                    'Error saving online users to storage:',
                                    err,
                                ),
                            );
                        }
                    },
                ) as unknown as AnyAction,
            );
        } catch (error) {
            console.error('Error handling remove online user event:', error);
        }
    });

    // Typing indicator
    socket.on('istyping', (data: { chatId?: string; typingData?: any }) => {
        const chatId = data?.chatId;
        const typingData = data?.typingData;

        if (!chatId) {
            return;
        }

        try {
            // Update typing state in RTK Query
            dispatch(
                chatApi.util.updateQueryData(
                    'getChatMessages',
                    { page: 1, limit: 20, chat: chatId },
                    (draft) => {
                        // Add typing data to the chat
                        draft.typingUsers = typingData;
                    },
                ) as unknown as AnyAction,
            );
        } catch (error) {
            console.error('Error handling typing event:', error);
        }
    });

    // New chat event (chat created or added to)
    socket.on('newchatevent', (data: { chat?: { _id: string } }) => {
        const chat = data?.chat;
        if (!chat?._id) {
            return;
        }

        try {
            // Join the new chat room
            socket?.emit('join-chat-room', { chatId: chat._id });

            // Refresh chats list in RTK Query
            dispatch(
                chatApi.endpoints.getChats.initiate(undefined, {
                    forceRefetch: true,
                }) as unknown as AnyAction,
            );
        } catch (error) {
            console.error('Error handling new chat event:', error);
        }
    });

    // Return cleanup function
    return () => {
        socket?.off('join_online');
        socket?.off('newmessage');
        socket?.off('updatemessage');
        socket?.off('updatechat');
        socket?.off('pushmessage');
        socket?.off('newnotification');
        socket?.off('addOnlineUser');
        socket?.off('removeOnlineUser');
        socket?.off('istyping');
        socket?.off('newchatevent');
    };
};

/**
 * Initialize chat system with optimized loading from cache
 * Ensures seamless loading when app starts
 */
export const initChatSystem = async (): Promise<() => void> => {
    try {
        // 1. Try to load cached data immediately for instant display
        const cachedChats = await loadChatsFromStorage();
        if (cachedChats && cachedChats.length > 0) {
            try {
                // Immediately update RTK Query cache with cached data
                store.dispatch(
                    chatApi.util.updateQueryData(
                        'getChats',
                        undefined,
                        () => cachedChats,
                    ) as unknown as AnyAction,
                );

                // Also join chat rooms for existing chats
                cachedChats.forEach((chat) => {
                    if (socket) {
                        socket.emit('join-chat-room', { chatId: chat._id });
                    }
                });
            } catch (error) {
                console.error(
                    'Error updating RTK cache with cached chats:',
                    error,
                );
            }
        }

        // 2. Setup socket listeners for real-time updates
        const cleanup = setupSocketListeners();

        // 3. Trigger RTK Query to fetch fresh data in background
        try {
            store.dispatch(
                chatApi.endpoints.getChats.initiate(undefined, {
                    forceRefetch: true,
                }) as unknown as AnyAction,
            );
        } catch (error) {
            console.error('Error fetching fresh chat data:', error);
        }

        return cleanup;
    } catch (error) {
        console.error('Error initializing chat system:', error);
        return () => {};
    }
};

/**
 * Preload selected chat messages from cache
 * Call this when a user selects a chat to see messages immediately
 */
export const preloadChatMessages = async (chatId: string): Promise<void> => {
    try {
        const cachedMessages = await loadChatMessagesFromStorage(chatId);
        if (cachedMessages) {
            try {
                // Update RTK Query cache with cached messages
                store.dispatch(
                    chatApi.util.updateQueryData(
                        'getChatMessages',
                        { page: 1, limit: 20, chat: chatId },
                        () => cachedMessages,
                    ) as unknown as AnyAction,
                );
            } catch (error) {
                console.error(
                    `Error updating RTK cache with cached messages for chat ${chatId}:`,
                    error,
                );
            }
        }

        // Trigger a fresh fetch in background
        try {
            store.dispatch(
                chatApi.endpoints.getChatMessages.initiate(
                    { page: 1, limit: 20, chat: chatId },
                    { forceRefetch: true },
                ) as unknown as AnyAction,
            );
        } catch (error) {
            console.error(
                `Error fetching fresh messages for chat ${chatId}:`,
                error,
            );
        }
    } catch (error) {
        console.error(`Error preloading messages for chat ${chatId}:`, error);
    }
};

export default setupSocketListeners;
