import localforage from 'localforage';
import {
    ChatData,
    ChatMessage,
    ChatUser,
    MessagesResponse,
} from '@/redux/api/chats/chatApi';

// Local storage keys
const CHATS_KEY = 'chats_list';
const MESSAGES_KEY_PREFIX = 'chat_messages_';
const ONLINE_USERS_KEY = 'chat_online_users';
const LAST_UPDATED_KEY = 'chat_last_updated_timestamps';

/**
 * Save chats list to IndexedDB
 * @param chats The list of chats to save
 */
export const saveChatsToStorage = async (chats: ChatData[]): Promise<void> => {
    try {
        await localforage.setItem(CHATS_KEY, chats);
        // Update last updated timestamp
        const timestamps =
            (await localforage.getItem<Record<string, number>>(
                LAST_UPDATED_KEY,
            )) || {};
        timestamps[CHATS_KEY] = Date.now();
        await localforage.setItem(LAST_UPDATED_KEY, timestamps);
    } catch (error) {
        console.error('Error saving chats to local storage:', error);
    }
};

/**
 * Load chats list from IndexedDB
 * @returns The list of chats or undefined if not found
 */
export const loadChatsFromStorage = async (): Promise<
    ChatData[] | undefined
> => {
    try {
        const chats = await localforage.getItem<ChatData[]>(CHATS_KEY);
        return chats || undefined;
    } catch (error) {
        console.error('Error loading chats from local storage:', error);
        return undefined;
    }
};

/**
 * Save chat messages to IndexedDB
 * @param chatId The chat ID
 * @param response The messages response data
 */
export const saveChatMessagesToStorage = async (
    chatId: string,
    response: MessagesResponse,
): Promise<void> => {
    try {
        const key = `${MESSAGES_KEY_PREFIX}${chatId}`;
        await localforage.setItem(key, response);

        // Update last updated timestamp
        const timestamps =
            (await localforage.getItem<Record<string, number>>(
                LAST_UPDATED_KEY,
            )) || {};
        timestamps[key] = Date.now();
        await localforage.setItem(LAST_UPDATED_KEY, timestamps);
    } catch (error) {
        console.error(
            `Error saving messages for chat ${chatId} to local storage:`,
            error,
        );
    }
};

/**
 * Load chat messages from IndexedDB
 * @param chatId The chat ID
 * @returns The messages response or undefined if not found
 */
export const loadChatMessagesFromStorage = async (
    chatId: string,
): Promise<MessagesResponse | undefined> => {
    try {
        const key = `${MESSAGES_KEY_PREFIX}${chatId}`;
        const messages = await localforage.getItem<MessagesResponse>(key);
        return messages || undefined;
    } catch (error) {
        console.error(
            `Error loading messages for chat ${chatId} from local storage:`,
            error,
        );
        return undefined;
    }
};

/**
 * Save online users to IndexedDB
 * @param users The list of online users
 */
export const saveOnlineUsersToStorage = async (
    users: ChatUser[],
): Promise<void> => {
    try {
        await localforage.setItem(ONLINE_USERS_KEY, users);

        // Update last updated timestamp
        const timestamps =
            (await localforage.getItem<Record<string, number>>(
                LAST_UPDATED_KEY,
            )) || {};
        timestamps[ONLINE_USERS_KEY] = Date.now();
        await localforage.setItem(LAST_UPDATED_KEY, timestamps);
    } catch (error) {
        console.error('Error saving online users to local storage:', error);
    }
};

/**
 * Load online users from IndexedDB
 * @returns The list of online users or undefined if not found
 */
export const loadOnlineUsersFromStorage = async (): Promise<
    ChatUser[] | undefined
> => {
    try {
        const users = await localforage.getItem<ChatUser[]>(ONLINE_USERS_KEY);
        return users || undefined;
    } catch (error) {
        console.error('Error loading online users from local storage:', error);
        return undefined;
    }
};

/**
 * Update a message in a chat's stored messages
 * @param chatId The chat ID
 * @param message The updated message
 */
export const updateMessageInStorage = async (
    chatId: string,
    message: ChatMessage,
): Promise<void> => {
    try {
        const key = `${MESSAGES_KEY_PREFIX}${chatId}`;
        const messagesResponse =
            await localforage.getItem<MessagesResponse>(key);

        if (messagesResponse && messagesResponse.messages) {
            // Find and update the message
            const updatedMessages = messagesResponse.messages.map((msg) =>
                msg._id === message._id ? { ...msg, ...message } : msg,
            );

            // Save the updated messages
            await localforage.setItem(key, {
                ...messagesResponse,
                messages: updatedMessages,
            });

            // Update last updated timestamp
            const timestamps =
                (await localforage.getItem<Record<string, number>>(
                    LAST_UPDATED_KEY,
                )) || {};
            timestamps[key] = Date.now();
            await localforage.setItem(LAST_UPDATED_KEY, timestamps);
        }
    } catch (error) {
        console.error(
            `Error updating message in chat ${chatId} in local storage:`,
            error,
        );
    }
};

/**
 * Add a new message to a chat's stored messages
 * @param chatId The chat ID
 * @param message The new message
 */
export const addMessageToStorage = async (
    chatId: string,
    message: ChatMessage,
): Promise<void> => {
    try {
        const key = `${MESSAGES_KEY_PREFIX}${chatId}`;
        const messagesResponse =
            await localforage.getItem<MessagesResponse>(key);

        if (messagesResponse && messagesResponse.messages) {
            // Check if message already exists
            const exists = messagesResponse.messages.some(
                (msg) => msg._id === message._id,
            );

            if (!exists) {
                // Add the new message
                const updatedMessages = [...messagesResponse.messages, message];

                // Save the updated messages
                await localforage.setItem(key, {
                    ...messagesResponse,
                    messages: updatedMessages,
                });

                // Update last updated timestamp
                const timestamps =
                    (await localforage.getItem<Record<string, number>>(
                        LAST_UPDATED_KEY,
                    )) || {};
                timestamps[key] = Date.now();
                await localforage.setItem(LAST_UPDATED_KEY, timestamps);
            }
        }
    } catch (error) {
        console.error(
            `Error adding message to chat ${chatId} in local storage:`,
            error,
        );
    }
};

/**
 * Update a chat in the stored chats list
 * @param updatedChat The updated chat
 */
export const updateChatInStorage = async (
    updatedChat: ChatData,
): Promise<void> => {
    try {
        const chats = await localforage.getItem<ChatData[]>(CHATS_KEY);

        if (chats) {
            // Find and update the chat
            const updatedChats = chats.map((chat) =>
                chat._id === updatedChat._id
                    ? { ...chat, ...updatedChat }
                    : chat,
            );

            // Save the updated chats
            await localforage.setItem(CHATS_KEY, updatedChats);

            // Update last updated timestamp
            const timestamps =
                (await localforage.getItem<Record<string, number>>(
                    LAST_UPDATED_KEY,
                )) || {};
            timestamps[CHATS_KEY] = Date.now();
            await localforage.setItem(LAST_UPDATED_KEY, timestamps);
        }
    } catch (error) {
        console.error(`Error updating chat in local storage:`, error);
    }
};

/**
 * Check if stored data is stale (older than maxAge)
 * @param key The storage key to check
 * @param maxAge Maximum age in milliseconds (default: 5 minutes)
 * @returns True if data is stale or doesn't exist, false otherwise
 */
export const isDataStale = async (
    key: string,
    maxAge: number = 5 * 60 * 1000,
): Promise<boolean> => {
    try {
        const timestamps =
            await localforage.getItem<Record<string, number>>(LAST_UPDATED_KEY);
        if (!timestamps || !timestamps[key]) {
            return true;
        }

        const now = Date.now();
        return now - timestamps[key] > maxAge;
    } catch (error) {
        console.error(`Error checking if data is stale for key ${key}:`, error);
        return true;
    }
};

/**
 * Clear all chat data from storage
 */
export const clearChatStorage = async (): Promise<void> => {
    try {
        // Get all keys
        const keys = await localforage.keys();

        // Delete all chat-related keys
        for (const key of keys) {
            if (
                key === CHATS_KEY ||
                key === ONLINE_USERS_KEY ||
                key === LAST_UPDATED_KEY ||
                key.startsWith(MESSAGES_KEY_PREFIX)
            ) {
                await localforage.removeItem(key);
            }
        }
    } catch (error) {
        console.error('Error clearing chat storage:', error);
    }
};
