import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define interfaces for the state
interface UploadFile {
    file?: File | null;
    url?: string;
    status?: string;
    [key: string]: any;
}

interface Draft {
    chat: string;
    message: string;
    uploadFiles: UploadFile[];
}

interface TypingData {
    userId: string;
    username: string;
    isTyping: boolean;
}

export interface Message {
    _id: string;
    chat: string;
    text?: string;
    sender?: User;
    createdAt: string;
    updatedAt?: string;
    parentMessage?: string;
    replies?: Message[];
    replyCount?: number;
    forwardedFrom?: string;
    [key: string]: any;
}

interface User {
    _id: string;
    fullName?: string;
    [key: string]: any;
}

export interface Chat {
    _id: string;
    name?: string;
    isChannel?: boolean;
    membersCount?: number;
    unreadCount?: number | null;
    latestMessage?: Message;
    typingData?: TypingData;
    myData?: {
        [key: string]: any;
    };
    [key: string]: any;
}

interface Bot {
    _id: string;
    [key: string]: any;
}

interface ChatMessages {
    [chatId: string]: Message[];
}

interface MessageCounts {
    [chatId: string]: number;
}
interface ChatState {
    chats: Chat[];
    onlineUsers: User[];
    chatMessages: ChatMessages;
    bots: Bot[];
    fetchingMore: boolean;
    currentPage: number;
    drafts: Draft[];
    fetchedMore: boolean;
    messageCounts: MessageCounts;
    pinnedMessages?: {
        // Add this line
        [chatId: string]: Message[];
    };
}

const initialState: ChatState = {
    chats: [],
    onlineUsers: [],
    chatMessages: {},
    bots: [],
    fetchingMore: false,
    currentPage: 1,
    drafts: [],
    fetchedMore: false,
    messageCounts: {},
    pinnedMessages: {},
};

const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        setDraft: (
            state,
            action: PayloadAction<{
                chat: string;
                message?: string;
                uploadFiles?: UploadFile[];
            }>,
        ) => {
            const { chat, message, uploadFiles } = action.payload;
            const draft = state.drafts.find((d) => d.chat === chat);
            if (!message && !uploadFiles) {
                // Remove draft if both message and uploadFiles are not provided
                state.drafts = state.drafts.filter((f) => f.chat !== chat);
            } else {
                if (draft) {
                    // Update the existing draft
                    draft.message =
                        message !== undefined ? message : draft.message;
                    draft.uploadFiles =
                        uploadFiles !== undefined
                            ? [...draft.uploadFiles, ...uploadFiles]
                            : draft.uploadFiles;
                } else {
                    // Create a new draft
                    state.drafts.push({
                        chat,
                        message: message || '',
                        uploadFiles: uploadFiles || [],
                    });
                }
            }
        },
        updateDraftFiles: (
            state,
            action: PayloadAction<{
                chat: string;
                responseData: any;
                file: File;
            }>,
        ) => {
            const { chat, responseData, file } = action.payload;
            const draft = state.drafts.find((d) => d.chat === chat);
            if (draft) {
                draft.uploadFiles = draft.uploadFiles.map((f) =>
                    f.file === file ? { ...f, ...responseData } : f,
                );
            }
        },
        removeDraftFiles: (
            state,
            action: PayloadAction<{
                chat: string;
                file: File;
            }>,
        ) => {
            const { chat, file } = action.payload;
            const draft = state.drafts.find((d) => d.chat === chat);
            if (draft && file) {
                draft.uploadFiles = draft.uploadFiles.filter(
                    (f) => f.file !== file,
                );
            }
        },
        setFetchedMore: (state, action: PayloadAction<boolean>) => {
            state.fetchedMore = action.payload;
        },
        removeFromDraft: (state, action: PayloadAction<string>) => {
            state.drafts = state.drafts.filter(
                (f) => f.chat !== action.payload,
            );
        },
        setCurrentPage: (state, action: PayloadAction<number>) => {
            state.currentPage = action.payload;
        },
        setFetchingMore: (state, action: PayloadAction<boolean>) => {
            state.fetchingMore = action.payload;
        },
        setChats: (state, action: PayloadAction<Chat[]>) => {
            state.chats = action.payload;
        },
        setBots: (state, action: PayloadAction<Bot[]>) => {
            state.bots = action.payload;
        },
        removeChat: (state, action: PayloadAction<string>) => {
            state.chats = state.chats.filter((x) => x._id !== action.payload);
        },
        updateChats: (state, action: PayloadAction<Chat>) => {
            state.chats = updateArray(state.chats, action.payload);
        },
        setTyping: (
            state,
            action: PayloadAction<{
                chatId: string;
                typingData: TypingData;
            }>,
        ) => {
            const { chatId, typingData } = action.payload;
            const typingChatIndex = state.chats.findIndex(
                (x) => x._id === chatId,
            );
            if (typingChatIndex !== -1) {
                state.chats[typingChatIndex].typingData = typingData;
            }
        },
        updateMyData: (
            state,
            action: PayloadAction<{
                _id: string;
                field: string;
                value: any;
            }>,
        ) => {
            const { _id, field, value } = action.payload;
            const chatIndex = state.chats.findIndex((x) => x._id === _id);
            if (chatIndex !== -1) {
                state.chats[chatIndex].myData = {
                    ...state.chats[chatIndex].myData,
                    [field]: value,
                };
            }
        },
        updateRepliesCount: (
            state,
            action: PayloadAction<{ message: Message }>,
        ) => {
            const { message } = action.payload;
            const chatMessage = state.chatMessages[message.chat]?.find(
                (item) => item._id === message._id,
            );

            if (chatMessage) {
                const parentMessageIndex = state.chatMessages[
                    message.chat
                ]?.findIndex((item) => item._id === message.parentMessage);
                if (parentMessageIndex !== -1) {
                    state.chatMessages[message.chat][parentMessageIndex] = {
                        ...state.chatMessages[message.chat][parentMessageIndex],
                        replyCount:
                            (state.chatMessages[message.chat][
                                parentMessageIndex
                            ].replyCount || 0) + 1,
                    };
                }
            }
        },
        // 2. Add this reducer case in chatSlice.reducers:

        updateMessageStatus: (
            state,
            action: PayloadAction<{
                chatId: string;
                messageId: string;
                status: string;
            }>,
        ) => {
            const { chatId, messageId, status } = action.payload;
            if (!state.chatMessages[chatId]) {
                return;
            }

            const messageIndex = state.chatMessages[chatId].findIndex(
                (m) => m._id === messageId,
            );

            if (messageIndex !== -1) {
                state.chatMessages[chatId][messageIndex].status = status;
            }
        },

        updateLatestMessage: (
            state,
            action: PayloadAction<{
                chatId: string;
                latestMessage: Message;
                counter?: number | string;
            }>,
        ) => {
            console.log('updated latest message');
            const { chatId, latestMessage, counter } = action.payload;
            const chatIndex = state.chats.findIndex((x) => x._id === chatId);
            console.log({ chatIndex });
            if (chatIndex !== -1) {
                state.chats[chatIndex].latestMessage = latestMessage;
                state.chats[chatIndex].unreadCount = counter
                    ? parseInt(
                          state.chats[chatIndex].unreadCount?.toString() || '0',
                      ) + parseInt(counter.toString())
                    : null;
            }
        },
        // increase members count when adding a new member to a group
        updateMembersCount: (
            state,
            action: PayloadAction<{
                chatId: string;
                membersCount: number;
            }>,
        ) => {
            const { chatId, membersCount } = action.payload;
            const chatIndex = state.chats.findIndex((x) => x?._id === chatId);

            if (chatIndex !== -1) {
                state.chats[chatIndex].membersCount = membersCount;
            }
        },

        markRead: (state, action: PayloadAction<{ chatId: string }>) => {
            const { chatId } = action.payload;
            const chatIndex = state.chats.findIndex((x) => x._id === chatId);
            if (chatIndex !== -1) {
                state.chats[chatIndex].unreadCount = 0;
            }
        },
        setOnlineUsers: (state, action: PayloadAction<User[]>) => {
            state.onlineUsers = action.payload;
        },
        addOnlineUser: (state, action: PayloadAction<User>) => {
            state.onlineUsers = addToArray(state.onlineUsers, action.payload);
        },
        removeOnlineUser: (state, action: PayloadAction<User>) => {
            state.onlineUsers = removeFromArray(
                state.onlineUsers,
                action.payload,
                '_id',
            );
        },
        updateChatMessages: (
            state,
            action: PayloadAction<{
                chat: string;
                messages: Message[];
            }>,
        ) => {
            const { chat, messages } = action.payload;
            state.chatMessages[chat] = messages;
        },
        pushHistoryMessages: (
            state,
            action: PayloadAction<{
                chat: string;
                messages: Message[];
            }>,
        ) => {
            const { chat, messages } = action.payload;
            let messagesArray = state.chatMessages[chat] || [];

            // Create a Set of existing message IDs for quick lookup
            const existingMessageIds = new Set(
                messagesArray.map((message) => message._id),
            );

            // Filter out messages that already exist
            const newMessages = messages.filter(
                (message) => !existingMessageIds.has(message._id),
            );

            // Combine new messages with existing ones
            messagesArray = [...newMessages, ...messagesArray];

            state.chatMessages[chat] = messagesArray;
        },
        pushMessage: (
            state,
            action: PayloadAction<{
                message: Message;
            }>,
        ) => {
            const { message } = action.payload;
            const chatId = message.chat;
            let messagesArray = state.chatMessages[chatId] || [];

            const queryId = message.parentMessage
                ? message.parentMessage
                : chatId;

            const chatIndex = state.chats.findIndex((x) => x._id === queryId);

            if (chatIndex !== -1) {
                if (!state.chats[chatIndex].unreadCount) {
                    state.chats[chatIndex].unreadCount = 0;
                }
            }

            if (message.parentMessage) {
                if (chatIndex !== -1) {
                    if (!state.chats[chatIndex].unreadCount) {
                        state.chats[chatIndex].unreadCount = 0;
                    } else {
                        state.chats[chatIndex].unreadCount =
                            parseInt(
                                state.chats[
                                    chatIndex
                                ].unreadCount?.toString() || '0',
                            ) + 1;
                    }
                }
                const parentMessageIndex = messagesArray.findIndex(
                    (m) => m._id === message.parentMessage,
                );
                if (
                    parentMessageIndex !== -1 &&
                    messagesArray[parentMessageIndex]
                ) {
                    if (!messagesArray[parentMessageIndex].replies) {
                        messagesArray[parentMessageIndex].replies = [];
                    }
                    messagesArray[parentMessageIndex].replies?.push(message);
                    messagesArray[parentMessageIndex] = {
                        ...messagesArray[parentMessageIndex],
                        replyCount:
                            (messagesArray[parentMessageIndex].replyCount ||
                                0) + 1,
                    };
                }
            } else {
                const existingMessageIndex = messagesArray.findIndex(
                    (m) => m._id === message._id,
                );
                if (existingMessageIndex !== -1) {
                    messagesArray[existingMessageIndex] = {
                        ...messagesArray[existingMessageIndex],
                        ...message,
                    };
                } else {
                    messagesArray.push(message);
                    messagesArray = messagesArray.slice(
                        Math.max(messagesArray.length - 20, 0),
                        messagesArray.length,
                    );
                }
            }

            state.chatMessages[chatId] = messagesArray;
        },
        updateMessage: (
            state,
            action: PayloadAction<{
                message: Message;
            }>,
        ) => {
            const { message } = action.payload;
            const chatId = message.chat;
            const messagesArray = state.chatMessages[chatId] || [];

            if (message.parentMessage) {
                const messageIndex = messagesArray.findIndex(
                    (m) => m._id === message.parentMessage,
                );
                if (messageIndex !== -1) {
                    const replies = messagesArray[messageIndex]?.replies || [];
                    const replyIndex = replies?.findIndex(
                        (x) => x._id === message._id,
                    );
                    if (replyIndex !== -1) {
                        replies[replyIndex] = {
                            ...replies[replyIndex],
                            ...message,
                        };
                    }

                    messagesArray[messageIndex] = {
                        ...messagesArray[messageIndex],
                        replies,
                    };
                }
            } else {
                const messageIndex = messagesArray.findIndex(
                    (m) => m._id === message._id,
                );

                if (messageIndex !== -1) {
                    messagesArray[messageIndex] = {
                        ...messagesArray[messageIndex],
                        ...message,
                    };
                }
            }

            state.chatMessages[chatId] = messagesArray;
        },
        updateEmoji: (
            state,
            action: PayloadAction<{
                message: Message;
            }>,
        ) => {
            const { message } = action.payload;
            const chatId = message.chat;
            const messagesArray = state.chatMessages[chatId] || [];
            const messageIndex = messagesArray.findIndex(
                (m) => m._id === message._id,
            );

            if (messageIndex !== -1) {
                messagesArray[messageIndex] = {
                    ...messagesArray[messageIndex],
                    ...message,
                };
            }

            state.chatMessages[chatId] = messagesArray;
        },

        updateSendingInfo: (
            state,
            action: PayloadAction<{
                message: Message;
                trackingId: string;
            }>,
        ) => {
            const { message, trackingId } = action.payload;
            const chatId = message.chat;
            const messagesArray = state.chatMessages[chatId] || [];
            if (message.parentMessage) {
                const messageIndex = messagesArray.findIndex(
                    (m) => m._id === message.parentMessage,
                );

                if (messageIndex !== -1) {
                    const replies = messagesArray[messageIndex]?.replies || [];

                    const replyIndex = replies.findIndex(
                        (m) => m._id === trackingId,
                    );

                    if (replyIndex !== -1) {
                        replies[replyIndex] = {
                            ...replies[replyIndex],
                            ...message,
                        };
                    }

                    messagesArray[messageIndex] = {
                        ...messagesArray[messageIndex],
                        replies: replies || [],
                    };
                }
            } else {
                const messageIndex = messagesArray.findIndex(
                    (m) => m._id === trackingId,
                );
                if (messageIndex !== -1) {
                    messagesArray[messageIndex] = {
                        ...messagesArray[messageIndex],
                        ...message,
                    };
                }
            }

            state.chatMessages[chatId] = messagesArray;
        },
        // Add new action for message count
        setMessageCount: (
            state,
            action: PayloadAction<{
                chatId: string;
                count: number;
            }>,
        ) => {
            const { chatId, count } = action.payload;
            state.messageCounts[chatId] = count;
        },
        setPinnedMessages: (
            state,
            action: PayloadAction<{
                chatId: string;
                pinnedMessages: Message[];
            }>,
        ) => {
            // Initialize pinnedMessages if not exists
            if (!state.pinnedMessages) {
                state.pinnedMessages = {};
            }

            state.pinnedMessages[action.payload.chatId] =
                action.payload.pinnedMessages;
        },
        addPinnedMessage: (
            state,
            action: PayloadAction<{
                chatId: string;
                message: Message;
            }>,
        ) => {
            // Initialize pinnedMessages if not exists
            if (!state.pinnedMessages) {
                state.pinnedMessages = {};
            }

            const currentPinnedMessages =
                state.pinnedMessages[action.payload.chatId] || [];
            state.pinnedMessages[action.payload.chatId] = [
                action.payload.message,
                ...currentPinnedMessages,
            ];
        },

        removePinnedMessage: (
            state,
            action: PayloadAction<{
                chatId: string;
                messageId: string;
            }>,
        ) => {
            if (
                state.pinnedMessages &&
                state.pinnedMessages[action.payload.chatId]
            ) {
                state.pinnedMessages[action.payload.chatId] =
                    state.pinnedMessages[action.payload.chatId].filter(
                        (msg) => msg._id !== action.payload.messageId,
                    );
            }
        },
    },
});

// Export actions generated by createSlice
export const {
    updateEmoji,
    setFetchingMore,
    setCurrentPage,
    setChats,
    setDraft,
    removeFromDraft,
    setBots,
    removeChat,
    updateChats,
    setTyping,
    updateMyData,
    updateLatestMessage,
    markRead,
    setOnlineUsers,
    addOnlineUser,
    removeOnlineUser,
    updateChatMessages,
    pushMessage,
    updateMessage,
    updateSendingInfo,
    updateMembersCount,
    pushHistoryMessages,
    setFetchedMore,
    updateDraftFiles,
    removeDraftFiles,
    setMessageCount,
    updateRepliesCount,
    updateMessageStatus,
    setPinnedMessages,
    addPinnedMessage,
    removePinnedMessage,
} = chatSlice.actions;

// Export the reducer
export default chatSlice.reducer;

// Helper functions
const updateArray = <T extends { [key: string]: any }>(
    array: T[],
    item: T,
    key: string = '_id',
): T[] => {
    const index = array.findIndex((el) => el[key] === item[key]);
    if (index === -1) {
        return [item, ...array];
    }
    const updatedArray = [...array];
    updatedArray[index] = { ...updatedArray[index], ...item };
    return updatedArray;
};

const addToArray = <T extends { _id: string }>(array: T[], item: T): T[] => {
    if (!array.find((el) => el._id === item._id)) {
        return [item, ...array];
    }
    return array;
};

const removeFromArray = <T extends { [key: string]: any }>(
    array: T[],
    item: T,
    key: string = '_id',
): T[] => {
    return array.filter((el) => el[key] !== item[key]);
};
