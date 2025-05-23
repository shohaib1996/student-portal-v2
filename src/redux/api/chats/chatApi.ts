import { socket } from '@/helper/socketManager';
import { baseApi } from '../baseApi';
import {
    loadChatsFromStorage,
    saveChatsToStorage,
    loadChatMessagesFromStorage,
    saveChatMessagesToStorage,
    loadOnlineUsersFromStorage,
    saveOnlineUsersToStorage,
    updateMessageInStorage,
    addMessageToStorage,
    updateChatInStorage,
    isDataStale,
} from '@/utils/chatLocalStorage';
import { tagTypes } from '../tagType/tagTypes';

// Define types
export interface ChatMessage {
    _id: string;
    sender: {
        _id: string;
        firstName?: string;
        lastName?: string;
        fullName?: string;
        profilePicture?: string;
    };
    chat: string;
    text: string;
    createdAt: string | number;
    status?: string;
    type?: string;
    files?: any[];
    emoji?: any[];
    parentMessage?: string;
    replyCount?: number;
    replies?: ChatMessage[];
}

// Add these types to your existing interface section
export interface MediaItem {
    _id: string;
    name?: string;
    type: string;
    url: string;
    size?: number;
    messageId?: string;
    text?: string;
    createdAt: string;
    sender: {
        _id: string;
        firstName?: string;
        lastName?: string;
        profilePicture?: string;
    };
}

export interface MediaResponse {
    success: boolean;
    query?: string;
    medias: MediaItem[];
    totalCount: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface MediaParams {
    chatId: string;
    type?: 'image' | 'voice' | 'file' | 'link';
    page?: number;
    limit?: number;
    query?: string;
}
export interface ChatUser {
    _id: string;
    name?: string;
    avatar?: string;
    firstName?: string;
    lastName?: string;
    fullName?: string;
    profilePicture?: string;
    lastActive?: string;
    type?: string;
    isBlocked?: boolean;
    isArchived?: boolean;
    isPublic?: boolean;
    isChannel?: boolean;
    latestMessage?: any;
    unreadCount?: number;
    otherUser?: any;
    myData?: {
        user: string;
        isFavourite: boolean;
        isBlocked: boolean;
        role: string;
        _id: string;
        notification: {
            isOn: boolean;
        };
        mute: {
            isMuted: boolean;
        };
    };
}

export interface ChatData {
    _id: string;
    isChannel: boolean;
    isPublic: boolean;
    isReadOnly: boolean;
    isArchived: boolean;
    organization: string;
    memberScope: string;
    latestMessage: Record<string, any>;
    membersCount: number;
    unreadCount: number;
    otherUser: {
        profilePicture: string;
        lastName: string;
        type: string;
        _id: string;
        firstName: string;
        lastActive: string;
        fullName: string;
    };
    name: string;
    avatar: string | null;
    myData: {
        user: string;
        isFavourite: boolean;
        isBlocked: boolean;
        role: string;
        _id: string;
        notification: {
            isOn: boolean;
        };
        mute: {
            isMuted: boolean;
        };
    };
}

export interface MessageParams {
    page: number;
    limit: number;
    chat: string;
    query?: string;
}

export interface SendMessageParams {
    chat: string;
    message: string;
    files?: any[];
    parentMessage?: string;
}

export interface UpdateMessageStatusParams {
    messageId: string;
    status: string;
}

export interface FavoriteParams {
    chat: string;
    isFavourite: boolean;
}

export interface ChatResponse {
    chats: ChatData[];
}

export interface MessagesResponse {
    chat: ChatData;
    messages: ChatMessage[];
    count: number;
    typingUsers?: boolean;
}

// Add this interface to your existing types section
export interface NotificationUpdateParams {
    member: string;
    selectedOption: number;
    dateUntil: string | null;
    chat: string;
    actionType: 'mutenoti' | 'unmutenoti';
}
export interface MentionedUserDetails {
    success: boolean;
    user: {
        _id: string;
        firstName: string;
        lastName: string;
        fullName: string;
        profilePicture: string;
        email: string;
        lastActive: string;
        phone?: {
            isVerified: boolean;
            number: string;
            countryCode: string;
        };
        personalData?: {
            address?: {
                country: string;
                city: string;
                street: string;
                postalCode: string;
                state: string;
            };
            socialMedia?: {
                facebook: string;
                twitter: string;
                linkedin: string;
                instagram: string;
                github: string;
            };
            resume?: string;
            bio?: string;
        };
    };
    enrollments?: Array<{
        status: string;
        _id: string;
        branch: {
            _id: string;
            name: string;
        };
        program: {
            _id: string;
            title: string;
        };
        session: string;
        id: string;
    }>;
    groups?: Array<{
        activeStatus: {
            isActive: boolean;
            activeUntill: string;
        };
        description: string | null;
        _id: string;
        title: string;
    }>;
}
// Add these types to your existing types section in chatApi.ts
export interface MembersParams {
    chatId: string;
    limit?: number;
    page?: number;
    query?: string;
    lastId?: string;
}

export interface ChatMember {
    _id: string;
    user: any;
    role: string;
    notification: {
        isOn: boolean;
    };
    mute: {
        isMuted: boolean;
    };
}

export interface MembersResponse {
    results: ChatMember[];
    pagination: {
        total: number;
        currentPage: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
        limit: number;
    };
}
// RTK Query API definition
export const chatApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        // Send message endpoint following the existing pattern
        sendMessageCustom: build.mutation<ChatMessage, SendMessageParams>({
            query: (messageData) => ({
                url: `/chat/sendmessage/${messageData.chat}`,
                method: 'PUT',
                data: {
                    text: messageData.message || '',
                    files: messageData.files || [],
                    ...(messageData.parentMessage
                        ? { parentMessage: messageData.parentMessage }
                        : {}),
                },
            }),
            // Optimistically update the UI
            async onQueryStarted(
                { chat, message, parentMessage, files },
                { dispatch, queryFulfilled },
            ) {
                // Temporary ID for optimistic update
                const tempId = `temp-${Date.now()}`;

                const patchResult = dispatch(
                    chatApi.util.updateQueryData(
                        'getChatMessages',
                        { page: 1, limit: 20, chat },
                        (draft) => {
                            const tempMessage: ChatMessage = {
                                _id: tempId,
                                text: message,
                                chat,
                                sender: {
                                    _id: 'currentUser', // Will be replaced with actual user
                                },
                                createdAt: Date.now(),
                                status: 'sending',
                                type: 'message',
                                ...(files ? { files } : {}),
                            };

                            if (parentMessage) {
                                // Handle reply messages
                                const parentMsg = draft.messages.find(
                                    (m) => m._id === parentMessage,
                                );
                                if (parentMsg) {
                                    parentMsg.replies = parentMsg.replies || [];
                                    parentMsg.replies.push(tempMessage);
                                    parentMsg.replyCount =
                                        (parentMsg.replyCount || 0) + 1;
                                }
                            } else {
                                // Regular messages
                                draft.messages.push(tempMessage);
                            }
                        },
                    ),
                );

                try {
                    // Wait for the actual response
                    const { data } = await queryFulfilled;

                    // Update chats list with the latest message
                    dispatch(
                        chatApi.util.updateQueryData(
                            'getChats',
                            undefined,
                            (draft) => {
                                const chatToUpdate = draft.find(
                                    (c) => c._id === chat,
                                );
                                if (chatToUpdate && !parentMessage) {
                                    chatToUpdate.latestMessage = data;
                                }
                            },
                        ),
                    );
                } catch {
                    // Revert optimistic update on error
                    patchResult.undo();
                }
            },
            // Invalidate relevant cache tags
            invalidatesTags: (result, error, { chat, parentMessage }) => [
                { type: 'Messages' as const, id: chat },
                // Only invalidate chat list if it's a top-level message
                ...(parentMessage
                    ? []
                    : [{ type: 'Chats' as const, id: 'LIST' }]),
            ],
        }),

        // File upload endpoint
        uploadFile: build.mutation<
            {
                file: {
                    name: string;
                    type: string;
                    size: number;
                    location: string;
                };
            },
            FormData
        >({
            query: (formData) => ({
                url: '/chat/file',
                method: 'POST',
                data: formData,
            }),
        }),

        // Update message endpoint
        updateMessage: build.mutation<
            ChatMessage,
            {
                messageId: string;
                data: {
                    text?: string;
                    files?: Array<{
                        name: string;
                        type: string;
                        size: number;
                        url: string;
                    }>;
                };
            }
        >({
            query: ({ messageId, data }) => ({
                url: `/chat/update/message/${messageId}`,
                method: 'PATCH',
                data,
            }),
            // Optimistically update the UI
            async onQueryStarted(
                { messageId, data },
                { dispatch, queryFulfilled },
            ) {
                const patchResult = dispatch(
                    chatApi.util.updateQueryData(
                        'getChatMessages',
                        { page: 1, limit: 20, chat: 'relevantChatId' }, // You'll need to pass the chat ID
                        (draft) => {
                            const messageIndex = draft.messages.findIndex(
                                (m) => m._id === messageId,
                            );

                            if (messageIndex >= 0) {
                                // Merge the updated data
                                draft.messages[messageIndex] = {
                                    ...draft.messages[messageIndex],
                                    ...data,
                                };
                            }
                        },
                    ),
                );

                try {
                    await queryFulfilled;
                } catch {
                    patchResult.undo();
                }
            },
            // Invalidate relevant cache tags
            invalidatesTags: (result, error, { messageId }) =>
                result ? [{ type: 'Messages' as const, id: messageId }] : [],
        }),

        // Fetch all chats
        getChats: build.query<ChatData[], void>({
            async queryFn(_arg, _queryApi, _extraOptions, fetchWithBQ) {
                try {
                    // First check local storage
                    const cachedChats = await loadChatsFromStorage();
                    const isStale = await isDataStale('chats_list');

                    // If we have cached chats and they're not stale, use them immediately
                    if (cachedChats && !isStale) {
                        return { data: cachedChats };
                    }

                    // In the background or if no cache, fetch from API
                    const response = await fetchWithBQ({
                        url: '/chat/mychats',
                        method: 'GET',
                    });

                    if (response.data) {
                        const chats = (response.data as ChatResponse).chats;
                        // Save to local storage
                        await saveChatsToStorage(chats);
                        return { data: chats };
                    }

                    // If API fails but we have cached data, return that
                    if (response.error && cachedChats) {
                        return { data: cachedChats };
                    }

                    return response.error
                        ? { error: response.error }
                        : {
                              error: {
                                  status: 500,
                                  data: 'Failed to fetch chats',
                              },
                          };
                } catch (error) {
                    // If anything goes wrong and we have cached data, return that
                    const cachedChats = await loadChatsFromStorage();
                    if (cachedChats) {
                        return { data: cachedChats };
                    }

                    return {
                        error: {
                            status: 500,
                            data:
                                error instanceof Error
                                    ? error.message
                                    : 'Failed to fetch chats',
                        },
                    };
                }
            },
            // Keep cached data for 5 minutes
            keepUnusedDataFor: 300,
            // Provide tags for cache invalidation
            providesTags: (result) =>
                result
                    ? [
                          ...result.map(({ _id }) => ({
                              type: 'Chats' as const,
                              id: _id,
                          })),
                          { type: 'Chats', id: 'LIST' },
                      ]
                    : [{ type: 'Chats', id: 'LIST' }],
        }),

        // Get online users
        getOnlineUsers: build.query<ChatUser[], void>({
            async queryFn(_arg, _queryApi, _extraOptions, fetchWithBQ) {
                try {
                    // First check local storage
                    const cachedUsers = await loadOnlineUsersFromStorage();
                    const isStale = await isDataStale(
                        'chat_online_users',
                        60 * 1000,
                    ); // 1 minute stale time for online users

                    // If we have cached users and they're not stale, use them immediately
                    if (cachedUsers && !isStale) {
                        return { data: cachedUsers };
                    }

                    // In the background or if no cache, fetch from API
                    interface OnlineUsersResponse {
                        users: ChatUser[];
                    }

                    const response = await fetchWithBQ({
                        url: '/user/online',
                        method: 'GET',
                    });

                    if (response.data) {
                        const users = (response.data as OnlineUsersResponse)
                            .users;
                        // Save to local storage
                        await saveOnlineUsersToStorage(users);
                        return { data: users };
                    }

                    // If API fails but we have cached data, return that
                    if (response.error && cachedUsers) {
                        return { data: cachedUsers };
                    }

                    return response.error
                        ? { error: response.error }
                        : {
                              error: {
                                  status: 500,
                                  data: 'Failed to fetch online users',
                              },
                          };
                } catch (error) {
                    // If anything goes wrong and we have cached data, return that
                    const cachedUsers = await loadOnlineUsersFromStorage();
                    if (cachedUsers) {
                        return { data: cachedUsers };
                    }

                    return {
                        error: {
                            status: 500,
                            data:
                                error instanceof Error
                                    ? error.message
                                    : 'Failed to fetch online users',
                        },
                    };
                }
            },
            keepUnusedDataFor: 60, // Short cache time as online status changes frequently
            providesTags: [{ type: 'OnlineUsers', id: 'LIST' }],
        }),

        // Get messages for a specific chat
        getChatMessages: build.query<MessagesResponse, MessageParams>({
            async queryFn(arg, _queryApi, _extraOptions, fetchWithBQ) {
                try {
                    const chatId = arg.chat;
                    // Only check cache for first page with no search
                    const isFirstPage = arg.page === 1;
                    const hasSearch = !!arg.query;

                    // Check local storage for first page without search
                    if (isFirstPage && !hasSearch) {
                        const cachedMessages =
                            await loadChatMessagesFromStorage(chatId);
                        const isStale = await isDataStale(
                            `chat_messages_${chatId}`,
                        );

                        // If we have cached messages and they're not stale, use them immediately
                        if (cachedMessages && !isStale) {
                            return { data: cachedMessages };
                        }
                    }

                    // In the background or if no cache, fetch from API
                    const response = await fetchWithBQ({
                        url: '/chat/messages',
                        method: 'POST',
                        data: arg,
                    });

                    if (response.data) {
                        const messagesResponse =
                            response.data as MessagesResponse;
                        // Save first page to local storage
                        if (isFirstPage && !hasSearch) {
                            await saveChatMessagesToStorage(
                                chatId,
                                messagesResponse,
                            );
                        }
                        return { data: messagesResponse };
                    }

                    // If API fails but we have cached data, return that (only for first page without search)
                    if (response.error && isFirstPage && !hasSearch) {
                        const cachedMessages =
                            await loadChatMessagesFromStorage(chatId);
                        if (cachedMessages && 'chat' in cachedMessages) {
                            return { data: cachedMessages as MessagesResponse };
                        }
                    }

                    return response.error
                        ? { error: response.error }
                        : {
                              error: {
                                  status: 500,
                                  data: 'Failed to fetch messages',
                              },
                          };
                } catch (error) {
                    // If anything goes wrong and we have cached data, try to use it
                    if (arg.page === 1 && !arg.query) {
                        const cachedMessages =
                            await loadChatMessagesFromStorage(arg.chat);
                        if (cachedMessages) {
                            return { data: cachedMessages };
                        }
                    }

                    return {
                        error: {
                            status: 500,
                            data:
                                error instanceof Error
                                    ? error.message
                                    : 'Failed to fetch messages',
                        },
                    };
                }
            },
            // Keep cached messages for 5 minutes
            keepUnusedDataFor: 300,
            providesTags: (result, error, arg) =>
                result
                    ? [
                          ...result.messages.map(({ _id }) => ({
                              type: 'Messages' as const,
                              id: _id,
                          })),
                          { type: 'Messages', id: arg.chat },
                      ]
                    : [{ type: 'Messages', id: arg.chat }],
        }),

        // Send a new message
        sendMessage: build.mutation<ChatMessage, SendMessageParams>({
            query: (messageData) => ({
                url: '/chat/message/send',
                method: 'POST',
                data: messageData,
            }),
            // Optimistically update the UI
            async onQueryStarted(
                { chat, message, parentMessage },
                { dispatch, queryFulfilled },
            ) {
                // Optimistic update with temporary ID
                const tempId = `temp-${Date.now()}`;
                const patchResult = dispatch(
                    chatApi.util.updateQueryData(
                        'getChatMessages',
                        { page: 1, limit: 20, chat },
                        (draft) => {
                            const tempMessage: ChatMessage = {
                                _id: tempId,
                                text: message,
                                chat,
                                sender: {
                                    _id: 'currentUser', // Will be replaced with actual user
                                },
                                createdAt: Date.now(),
                                status: 'sending',
                                type: 'message',
                            };

                            if (parentMessage) {
                                // Handle reply messages
                                const parentMsg = draft.messages.find(
                                    (m) => m._id === parentMessage,
                                );
                                if (parentMsg) {
                                    parentMsg.replies = parentMsg.replies || [];
                                    parentMsg.replies.push(tempMessage);
                                    parentMsg.replyCount =
                                        (parentMsg.replyCount || 0) + 1;
                                }
                            } else {
                                // Regular messages
                                draft.messages.push(tempMessage);
                            }
                        },
                    ),
                );

                try {
                    // Wait for the actual response
                    const { data } = await queryFulfilled;

                    // Update local storage
                    if (!parentMessage) {
                        await addMessageToStorage(chat, data);
                    }

                    // Update chats list with the latest message
                    dispatch(
                        chatApi.util.updateQueryData(
                            'getChats',
                            undefined,
                            (draft) => {
                                const chatToUpdate = draft.find(
                                    (c) => c._id === chat,
                                );
                                if (chatToUpdate && !parentMessage) {
                                    chatToUpdate.latestMessage = data;

                                    // Update chat in local storage
                                    updateChatInStorage(chatToUpdate);
                                }
                            },
                        ),
                    );
                } catch {
                    // Revert optimistic update on error
                    patchResult.undo();
                }
            },
            invalidatesTags: (result, error, { chat, parentMessage }) =>
                result
                    ? [
                          { type: 'Messages' as const, id: chat },
                          // Only invalidate chat list if it's a top-level message
                          ...(parentMessage
                              ? []
                              : [{ type: 'Chats' as const, id: 'LIST' }]),
                      ]
                    : [],
        }),

        // Update message status (delivered, read)
        updateMessageStatus: build.mutation<void, UpdateMessageStatusParams>({
            query: ({ messageId, status }) => ({
                url: `/chat/update-status/${messageId}`,
                method: 'PATCH',
                data: { status },
            }),
            invalidatesTags: (result, error, { messageId }) =>
                result ? [{ type: 'Messages', id: messageId }] : [],
        }),

        // Mark chat as read
        markChatAsRead: build.mutation<void, string>({
            query: (chatId) => ({
                url: `/chat/markread/${chatId}`,
                method: 'PATCH',
            }),
            // Optimistically update UI
            async onQueryStarted(chatId, { dispatch, queryFulfilled }) {
                const patchResult = dispatch(
                    chatApi.util.updateQueryData(
                        'getChats',
                        undefined,
                        (draft) => {
                            const chatToUpdate = draft.find(
                                (c) => c._id === chatId,
                            );
                            if (chatToUpdate) {
                                chatToUpdate.unreadCount = 0;

                                // Update in local storage
                                updateChatInStorage(chatToUpdate);
                            }
                        },
                    ),
                );

                try {
                    await queryFulfilled;
                } catch {
                    patchResult.undo();
                }
            },
            invalidatesTags: (result, error, chatId) =>
                result ? [{ type: 'Chats', id: chatId }] : [],
        }),

        // Toggle favorite/pin status
        toggleFavorite: build.mutation<void, FavoriteParams>({
            query: (data) => ({
                url: '/chat/favourite',
                method: 'PUT',
                data,
            }),
            // Optimistically update UI
            async onQueryStarted(
                { chat, isFavourite },
                { dispatch, queryFulfilled },
            ) {
                const patchResult = dispatch(
                    chatApi.util.updateQueryData(
                        'getChats',
                        undefined,
                        (draft) => {
                            const chatToUpdate = draft.find(
                                (c) => c._id === chat,
                            );
                            if (chatToUpdate && chatToUpdate.myData) {
                                chatToUpdate.myData.isFavourite = isFavourite;

                                // Update in local storage
                                updateChatInStorage(chatToUpdate);
                            }
                        },
                    ),
                );

                try {
                    await queryFulfilled;
                } catch {
                    patchResult.undo();
                }
            },
            invalidatesTags: (result, error, { chat }) =>
                result ? [{ type: 'Chats', id: chat }] : [],
        }),

        // Create or find a direct chat with another user
        findOrCreateChat: build.mutation<{ chat: ChatData }, string>({
            query: (userId) => ({
                url: `/chat/findorcreate/${userId}`,
                method: 'POST',
            }),
            // Add to local storage when successful
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;

                    // Update chats list in local storage
                    dispatch(
                        chatApi.util.updateQueryData(
                            'getChats',
                            undefined,
                            (draft) => {
                                const exists = draft.some(
                                    (c) => c._id === data.chat._id,
                                );
                                if (!exists) {
                                    draft.unshift(data.chat);

                                    // Update local storage
                                    saveChatsToStorage(draft);
                                }
                            },
                        ),
                    );
                } catch (error) {
                    console.error('Error in findOrCreateChat:', error);
                }
            },
            invalidatesTags: (result) =>
                result ? [{ type: 'Chats', id: 'LIST' }] : [],
        }),

        // Add this to your chatApi endpoints
        getChatMedia: build.query<MediaResponse, MediaParams>({
            query: ({ chatId, type, page = 1, limit = 5, query }) => {
                // Build query parameters
                let queryParams = `?page=${page}&limit=${limit}`;
                if (type) {
                    queryParams += `&type=${type}`;
                }
                if (query) {
                    queryParams += `&query=${encodeURIComponent(query)}`;
                }

                return {
                    url: `/chat/media/${chatId}${queryParams}`,
                    method: 'GET',
                };
            },
            // Keep cached media for 5 minutes
            keepUnusedDataFor: 300,
            // Provide tags for cache invalidation
            providesTags: (result, error, { chatId, type }) =>
                result
                    ? [
                          // Keep existing Message tags
                          ...result.medias.map(({ _id }) => ({
                              type: 'Messages' as const,
                              id: _id,
                          })),
                          {
                              type: 'Messages' as const,
                              id: `${chatId}-${type || 'all'}`,
                          },
                          // Add chatMedia tags using your enum
                          ...result.medias.map(({ _id }) => ({
                              type: tagTypes.chatMedia,
                              id: _id,
                          })),
                          {
                              type: tagTypes.chatMedia,
                              id: `${chatId}-${type || 'all'}`,
                          },
                          // Add a general tag for the chat
                          {
                              type: tagTypes.chatMedia,
                              id: chatId,
                          },
                      ]
                    : [
                          {
                              type: 'Messages' as const,
                              id: `${chatId}-${type || 'all'}`,
                          },
                          // Add ChatMedia tag for empty results
                          {
                              type: tagTypes.chatMedia,
                              id: `${chatId}-${type || 'all'}`,
                          },
                          {
                              type: tagTypes.chatMedia,
                              id: chatId,
                          },
                      ],
        }),

        // Search users
        searchUsers: build.query<ChatUser[], string>({
            query: (query) => ({
                url: '/user/filter',
                method: 'POST',
                data: { query, type: 'user' },
            }),
            transformResponse: (response: { users: ChatUser[] }) =>
                response.users,
            keepUnusedDataFor: 300,
        }),

        // Create a new group chat
        createGroup: build.mutation<{ chat: ChatData }, any>({
            query: (data) => ({
                url: '/chat/create-group',
                method: 'POST',
                data,
            }),
            // Add to local storage when successful
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;

                    // Update chats list in local storage
                    dispatch(
                        chatApi.util.updateQueryData(
                            'getChats',
                            undefined,
                            (draft) => {
                                const exists = draft.some(
                                    (c) => c._id === data.chat._id,
                                );
                                if (!exists) {
                                    draft.unshift(data.chat);

                                    // Update local storage
                                    saveChatsToStorage(draft);
                                }
                            },
                        ),
                    );
                } catch (error) {
                    console.error('Error in createGroup:', error);
                }
            },
            invalidatesTags: (result) =>
                result ? [{ type: 'Chats', id: 'LIST' }] : [],
        }),

        // Add this to the chatApi endpoints
        updateNotificationSettings: build.mutation<
            {
                member: {
                    notification: { isOn: boolean; dateUntil: string | null };
                };
            },
            NotificationUpdateParams
        >({
            query: (data) => ({
                url: '/chat/member/update',
                method: 'POST',
                data,
            }),
            // Optimistically update the UI
            async onQueryStarted(
                { chat, actionType },
                { dispatch, queryFulfilled },
            ) {
                const isOn = actionType === 'unmutenoti';

                // Update chats list optimistically
                const patchResult = dispatch(
                    chatApi.util.updateQueryData(
                        'getChats',
                        undefined,
                        (draft) => {
                            const chatToUpdate = draft.find(
                                (c) => c._id === chat,
                            );
                            if (chatToUpdate && chatToUpdate.myData) {
                                chatToUpdate.myData.notification = {
                                    ...chatToUpdate.myData.notification,
                                    isOn,
                                };

                                // Update in local storage
                                updateChatInStorage(chatToUpdate);
                            }
                        },
                    ),
                );

                try {
                    // Wait for the actual response
                    const { data: responseData } = await queryFulfilled;

                    // If the server response includes updated notification settings,
                    // update the store with the exact server values
                    if (
                        responseData &&
                        responseData.member &&
                        responseData.member.notification
                    ) {
                        dispatch(
                            chatApi.util.updateQueryData(
                                'getChats',
                                undefined,
                                (draft) => {
                                    const chatToUpdate = draft.find(
                                        (c) => c._id === chat,
                                    );
                                    if (chatToUpdate && chatToUpdate.myData) {
                                        chatToUpdate.myData.notification =
                                            responseData.member.notification;

                                        // Update in local storage
                                        updateChatInStorage(chatToUpdate);
                                    }
                                },
                            ),
                        );
                    }
                } catch {
                    // Revert optimistic update on error
                    patchResult.undo();
                }
            },
            invalidatesTags: (result, error, { chat }) =>
                result ? [{ type: 'Chats', id: chat }] : [],
        }),
        getMentionedUserDetails: build.query<MentionedUserDetails, string>({
            query: (userId) => ({
                url: `/user/details/${userId}`,
                method: 'GET',
            }),
            providesTags: (result, error, userId) =>
                result ? [{ type: 'User' as const, id: userId }] : [],
        }),
        // In your chatApi.ts file
        getChatMembers: build.query<MembersResponse, MembersParams>({
            query: ({ chatId, limit = 15, page = 1, query }) => {
                const data: any = {
                    limit,
                    page,
                };

                if (query) {
                    data.query = query;
                }

                return {
                    url: `/chat/members/${chatId}`,
                    method: 'POST',
                    data,
                };
            },
            // No need for transformResponse since the API response structure is fine
            keepUnusedDataFor: 300,
            providesTags: (result, error, { chatId }) =>
                result
                    ? [
                          ...result.results.map(({ _id }) => ({
                              type: tagTypes.members,
                              id: _id,
                          })),
                          { type: tagTypes.members, id: chatId },
                      ]
                    : [{ type: tagTypes.members, id: chatId }],
        }),
        // Add these to your chatApi endpoints object
        getChatMediaCounts: build.query<
            {
                imagesCount: number;
                voiceCount: number;
                fileCount: number;
                linksCount: number;
            },
            string
        >({
            query: (chatId) => ({
                url: `/chat/media-counts/${chatId}`,
                method: 'GET',
            }),
            providesTags: (result, error, chatId) =>
                result ? [{ type: tagTypes.mediaCounts, id: chatId }] : [],
        }),

        updateChannelInfo: build.mutation<
            { channel: ChatData },
            {
                chatId: string;
                data: Partial<{
                    name: string;
                    description: string;
                    isPublic: boolean;
                    isReadOnly: boolean;
                    avatar: string;
                }>;
            }
        >({
            query: ({ chatId, data }) => ({
                url: `/chat/channel/update/${chatId}`,
                method: 'PATCH',
                data,
            }),
            // Optimistically update UI
            async onQueryStarted(
                { chatId, data },
                { dispatch, queryFulfilled },
            ) {
                const patchResult = dispatch(
                    chatApi.util.updateQueryData(
                        'getChats',
                        undefined,
                        (draft) => {
                            const chatToUpdate = draft.find(
                                (c) => c._id === chatId,
                            );
                            if (chatToUpdate) {
                                Object.assign(chatToUpdate, data);
                                // Update in local storage
                                updateChatInStorage(chatToUpdate);
                            }
                        },
                    ),
                );

                try {
                    const { data: response } = await queryFulfilled;
                    // Update with server response if needed
                    if (response.channel) {
                        dispatch(
                            chatApi.util.updateQueryData(
                                'getChats',
                                undefined,
                                (draft) => {
                                    const chatToUpdate = draft.find(
                                        (c) => c._id === chatId,
                                    );
                                    if (chatToUpdate) {
                                        Object.assign(
                                            chatToUpdate,
                                            response.channel,
                                        );
                                        // Update in local storage
                                        updateChatInStorage(chatToUpdate);
                                    }
                                },
                            ),
                        );
                    }
                } catch {
                    patchResult.undo();
                }
            },
            invalidatesTags: (result, error, { chatId }) =>
                result
                    ? [
                          { type: 'Chats', id: chatId },
                          { type: 'Chats', id: 'LIST' },
                      ]
                    : [],
        }),

        archiveChannel: build.mutation<
            { success: boolean },
            { chatId: string; isArchived: boolean }
        >({
            query: ({ chatId, isArchived }) => ({
                url: `/chat/channel/archive/${chatId}`,
                method: 'PATCH',
                data: { isArchived },
            }),
            // Optimistically update UI
            async onQueryStarted(
                { chatId, isArchived },
                { dispatch, queryFulfilled },
            ) {
                const patchResult = dispatch(
                    chatApi.util.updateQueryData(
                        'getChats',
                        undefined,
                        (draft) => {
                            const chatToUpdate = draft.find(
                                (c) => c._id === chatId,
                            );
                            if (chatToUpdate) {
                                chatToUpdate.isArchived = isArchived;
                                // Update in local storage
                                updateChatInStorage(chatToUpdate);
                            }
                        },
                    ),
                );

                try {
                    await queryFulfilled;
                } catch {
                    patchResult.undo();
                }
            },
            invalidatesTags: (result, error, { chatId }) =>
                result
                    ? [
                          { type: 'Chats', id: chatId },
                          { type: 'Chats', id: 'LIST' },
                      ]
                    : [],
        }),

        leaveChannel: build.mutation<void, string>({
            query: (chatId) => ({
                url: `/chat/channel/leave/${chatId}`,
                method: 'PATCH',
            }),
            // We don't need optimistic updates here as we'll redirect after leaving
            invalidatesTags: (result) =>
                result ? [{ type: 'Chats', id: 'LIST' }] : [],
        }),

        uploadChannelAvatar: build.mutation<
            { url: string },
            { chatId: string; image: FormData }
        >({
            query: ({ image }) => ({
                url: '/settings/watermark-image',
                method: 'POST',
                data: image,
            }),
        }),
    }),
});

// Export hooks for usage in components
export const {
    useSendMessageCustomMutation,
    useGetChatMediaQuery,
    useUploadFileMutation,
    useUpdateMessageMutation,
    useGetChatsQuery,
    useGetOnlineUsersQuery,
    useGetChatMessagesQuery,
    useSendMessageMutation,
    useUpdateMessageStatusMutation,
    useMarkChatAsReadMutation,
    useToggleFavoriteMutation,
    useFindOrCreateChatMutation,
    useSearchUsersQuery,
    useCreateGroupMutation,
    useUpdateNotificationSettingsMutation,
    useGetMentionedUserDetailsQuery,
    useGetChatMembersQuery,
    useGetChatMediaCountsQuery,
    useUpdateChannelInfoMutation,
    useArchiveChannelMutation,
    useLeaveChannelMutation,
    useUploadChannelAvatarMutation,
} = chatApi;

// Socket integration with RTK Query
export const setupSocketWithRTK = (store: any) => {
    if (!socket) {
        return;
    }

    // Helper to get dispatch
    const { dispatch } = store;

    // When a new message is received
    socket.on('newmessage', async (data) => {
        // Update message cache
        if (data.message && data.chat) {
            // First, mark the message as delivered
            if (data.message._id) {
                dispatch(
                    chatApi.endpoints.updateMessageStatus.initiate({
                        messageId: data.message._id,
                        status: 'delivered',
                    }),
                );
            }

            // Add the message to the chat
            dispatch(
                chatApi.util.updateQueryData(
                    'getChatMessages',
                    { page: 1, limit: 20, chat: data.chat._id },
                    (draft) => {
                        // Check if message already exists
                        const exists = draft.messages.some(
                            (m) => m._id === data.message._id,
                        );
                        if (!exists) {
                            if (data.message.parentMessage) {
                                // It's a reply
                                const parentMsg = draft.messages.find(
                                    (m) => m._id === data.message.parentMessage,
                                );
                                if (parentMsg) {
                                    parentMsg.replies = parentMsg.replies || [];
                                    parentMsg.replies.push(data.message);
                                    parentMsg.replyCount =
                                        (parentMsg.replyCount || 0) + 1;
                                }
                            } else {
                                // Regular message
                                draft.messages.push(data.message);

                                // Update in local storage
                                addMessageToStorage(
                                    data.chat._id,
                                    data.message,
                                );
                            }
                        }
                    },
                ),
            );

            // Update latest message in chat list (if not a reply)
            if (!data.message.parentMessage) {
                dispatch(
                    chatApi.util.updateQueryData(
                        'getChats',
                        undefined,
                        (draft) => {
                            const chatToUpdate = draft.find(
                                (c) => c._id === data.chat._id,
                            );
                            if (chatToUpdate) {
                                chatToUpdate.latestMessage = data.message;
                                // Increment unread count if not from current user
                                if (data.message.sender._id !== 'currentUser') {
                                    chatToUpdate.unreadCount =
                                        (chatToUpdate.unreadCount || 0) + 1;
                                }

                                // Update in local storage
                                updateChatInStorage(chatToUpdate);
                            }
                        },
                    ),
                );
            }
        }
    });

    // Handle other socket events (updatemessage, updatechat, etc.)
    socket.on('updatemessage', async (data) => {
        if (data.message && data.chat) {
            dispatch(
                chatApi.util.updateQueryData(
                    'getChatMessages',
                    { page: 1, limit: 20, chat: data.chat },
                    (draft) => {
                        if (data.message.parentMessage) {
                            // Update a reply
                            const parentMsg = draft.messages.find(
                                (m) => m._id === data.message.parentMessage,
                            );
                            if (parentMsg && parentMsg.replies) {
                                const replyIndex = parentMsg.replies.findIndex(
                                    (r) => r._id === data.message._id,
                                );
                                if (replyIndex >= 0) {
                                    parentMsg.replies[replyIndex] = {
                                        ...parentMsg.replies[replyIndex],
                                        ...data.message,
                                    };
                                }
                            }
                        } else {
                            // Update a regular message
                            const messageIndex = draft.messages.findIndex(
                                (m) => m._id === data.message._id,
                            );
                            if (messageIndex >= 0) {
                                draft.messages[messageIndex] = {
                                    ...draft.messages[messageIndex],
                                    ...data.message,
                                };

                                // Update in local storage
                                updateMessageInStorage(data.chat, data.message);
                            }
                        }
                    },
                ),
            );
        }
    });

    // Return cleanup function
    return () => {
        socket?.off('newmessage');
        socket?.off('updatemessage');
        socket?.off('updatechat');
        socket?.off('istyping');
        socket?.off('addOnlineUser');
        socket?.off('removeOnlineUser');
        socket?.off('newchatevent');
    };
};
