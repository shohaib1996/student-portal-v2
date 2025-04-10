import localforage from 'localforage';
import {
    ChatData,
    ChatMessage,
    ChatUser,
    MessagesResponse,
} from '@/redux/api/chats/chatApi';

// Local storage keys
export const CHATS_KEY = 'chats_list';
export const MESSAGES_KEY_PREFIX = 'chat_messages_';
export const ONLINE_USERS_KEY = 'chat_online_users';
export const LAST_UPDATED_KEY = 'chat_last_updated_timestamps';

// Get the localforage instance
let instance: LocalForage;

// Make sure localforage is initialized
try {
    instance = localforage.createInstance({
        name: 'multischool_portal_data',
        storeName: 'chat_data',
        description: 'Chat data for offline access',
        driver: [localforage.INDEXEDDB, localforage.LOCALSTORAGE],
    });
} catch (error) {
    console.error('Error creating localForage instance:', error);
    instance = localforage;
}

// Debugging function to check localForage state
export const debugLocalForage = async (): Promise<void> => {
    try {
        const drivers = localforage.supports(localforage.INDEXEDDB)
            ? 'IndexedDB supported'
            : 'IndexedDB NOT supported';
        const keys = await instance.keys();
        const hasChatsKey = keys.includes(CHATS_KEY);
        if (hasChatsKey) {
            const chatsData = await instance.getItem(CHATS_KEY);
        }
        const timestamps = await instance.getItem(LAST_UPDATED_KEY);
        const estimate =
            navigator.storage && navigator.storage.estimate
                ? await navigator.storage.estimate()
                : 'Storage estimation not supported';
    } catch (error) {
        console.error('Error debugging localForage:', error);
    }
};

// Save chats list to IndexedDB
export const saveChatsToStorage = async (chats: ChatData[]): Promise<void> => {
    if (!chats || !Array.isArray(chats)) {
        console.error('Invalid chats data to save:', chats);
        return;
    }

    try {
        await instance.setItem(CHATS_KEY, chats);
        const timestamps =
            (await instance.getItem<Record<string, number>>(
                LAST_UPDATED_KEY,
            )) || {};
        timestamps[CHATS_KEY] = Date.now();
        await instance.setItem(LAST_UPDATED_KEY, timestamps);
        const savedChats = await instance.getItem<ChatData[]>(CHATS_KEY);
    } catch (error) {
        console.error('Error saving chats to local storage:', error);
    }
};

// Load chats list from IndexedDB
export const loadChatsFromStorage = async (): Promise<
    ChatData[] | undefined
> => {
    try {
        const chats = await instance.getItem<ChatData[]>(CHATS_KEY);

        if (chats && Array.isArray(chats)) {
            return chats;
        } else {
            return undefined;
        }
    } catch (error) {
        console.error('Error loading chats from local storage:', error);
        return undefined;
    }
};

// Save chat messages to IndexedDB
export const saveChatMessagesToStorage = async (
    chatId: string,
    response: MessagesResponse,
): Promise<void> => {
    if (!chatId || !response) {
        console.error('Invalid data for saving chat messages:', {
            chatId,
            response,
        });
        return;
    }

    try {
        const key = `${MESSAGES_KEY_PREFIX}${chatId}`;

        await instance.setItem(key, response);
        const timestamps =
            (await instance.getItem<Record<string, number>>(
                LAST_UPDATED_KEY,
            )) || {};
        timestamps[key] = Date.now();
        await instance.setItem(LAST_UPDATED_KEY, timestamps);
    } catch (error) {
        console.error(
            `Error saving messages for chat ${chatId} to local storage:`,
            error,
        );
    }
};

// Load chat messages from IndexedDB
export const loadChatMessagesFromStorage = async (
    chatId: string,
): Promise<MessagesResponse | undefined> => {
    if (!chatId) {
        console.error('Invalid chatId for loading messages');
        return undefined;
    }

    try {
        const key = `${MESSAGES_KEY_PREFIX}${chatId}`;

        const messages = await instance.getItem<MessagesResponse>(key);

        if (messages && messages.messages) {
            return messages;
        } else {
            return undefined;
        }
    } catch (error) {
        console.error(
            `Error loading messages for chat ${chatId} from local storage:`,
            error,
        );
        return undefined;
    }
};

// Save online users to IndexedDB
export const saveOnlineUsersToStorage = async (
    users: ChatUser[],
): Promise<void> => {
    if (!users || !Array.isArray(users)) {
        console.error('Invalid users data to save:', users);
        return;
    }

    try {
        await instance.setItem(ONLINE_USERS_KEY, users);
        const timestamps =
            (await instance.getItem<Record<string, number>>(
                LAST_UPDATED_KEY,
            )) || {};
        timestamps[ONLINE_USERS_KEY] = Date.now();
        await instance.setItem(LAST_UPDATED_KEY, timestamps);
    } catch (error) {
        console.error('Error saving online users to local storage:', error);
    }
};

// Load online users from IndexedDB
export const loadOnlineUsersFromStorage = async (): Promise<
    ChatUser[] | undefined
> => {
    try {
        const users = await instance.getItem<ChatUser[]>(ONLINE_USERS_KEY);

        if (users && Array.isArray(users)) {
            return users;
        } else {
            return undefined;
        }
    } catch (error) {
        console.error('Error loading online users from local storage:', error);
        return undefined;
    }
};

// Update a message in a chat's stored messages
export const updateMessageInStorage = async (
    chatId: string,
    message: ChatMessage,
): Promise<void> => {
    if (!chatId || !message || !message._id) {
        console.error('Invalid data for updating message:', {
            chatId,
            message,
        });
        return;
    }

    try {
        const key = `${MESSAGES_KEY_PREFIX}${chatId}`;

        const messagesResponse = await instance.getItem<MessagesResponse>(key);

        if (messagesResponse && messagesResponse.messages) {
            const updatedMessages = messagesResponse.messages.map((msg) =>
                msg?._id === message?._id ? { ...msg, ...message } : msg,
            );
            await instance.setItem(key, {
                ...messagesResponse,
                messages: updatedMessages,
            });
            const timestamps =
                (await instance.getItem<Record<string, number>>(
                    LAST_UPDATED_KEY,
                )) || {};
            timestamps[key] = Date.now();
            await instance.setItem(LAST_UPDATED_KEY, timestamps);
        } else {
            console.error(`No messages found for chat ${chatId} to update`);
        }
    } catch (error) {
        console.error(
            `Error updating message in chat ${chatId} in local storage:`,
            error,
        );
    }
};

// Add a new message to a chat's stored messages
export const addMessageToStorage = async (
    chatId: string,
    message: ChatMessage,
): Promise<void> => {
    if (!chatId || !message || !message?._id) {
        console.error('Invalid data for adding message:', { chatId, message });
        return;
    }

    try {
        const key = `${MESSAGES_KEY_PREFIX}${chatId}`;

        const messagesResponse = await instance.getItem<MessagesResponse>(key);

        if (messagesResponse && messagesResponse.messages) {
            const exists = messagesResponse.messages.some(
                (msg) => msg?._id === message?._id,
            );

            if (!exists) {
                const updatedMessages = [...messagesResponse.messages, message];
                await instance.setItem(key, {
                    ...messagesResponse,
                    messages: updatedMessages,
                });
                const timestamps =
                    (await instance.getItem<Record<string, number>>(
                        LAST_UPDATED_KEY,
                    )) || {};
                timestamps[key] = Date.now();
                await instance.setItem(LAST_UPDATED_KEY, timestamps);
            } else {
                console.error(
                    `Message ${message?._id} already exists in storage`,
                );
            }
        } else {
            console.error(
                `No existing messages for chat ${chatId}, creating new message list`,
            );
            const newMessageResponse: MessagesResponse = {
                chat: { _id: chatId } as ChatData,
                messages: [message],
                count: 1,
            };
            await instance.setItem(key, newMessageResponse);
            const timestamps =
                (await instance.getItem<Record<string, number>>(
                    LAST_UPDATED_KEY,
                )) || {};
            timestamps[key] = Date.now();
            await instance.setItem(LAST_UPDATED_KEY, timestamps);
        }
    } catch (error) {
        console.error(
            `Error adding message to chat ${chatId} in local storage:`,
            error,
        );
    }
};

// Update a chat in the stored chats list
export const updateChatInStorage = async (
    updatedChat: ChatData,
): Promise<void> => {
    if (!updatedChat || !updatedChat._id) {
        console.error('Invalid chat data to update:', updatedChat);
        return;
    }

    try {
        const chats = await instance.getItem<ChatData[]>(CHATS_KEY);

        if (chats && Array.isArray(chats)) {
            const chatExists = chats?.some(
                (chat) => chat?._id === updatedChat?._id,
            );
            let updatedChats: ChatData[];

            if (chatExists) {
                updatedChats = chats.map((chat) =>
                    chat?._id === updatedChat?._id
                        ? { ...chat, ...updatedChat }
                        : chat,
                );
            } else {
                updatedChats = [updatedChat, ...chats];
            }
            await instance.setItem(CHATS_KEY, updatedChats);
            const timestamps =
                (await instance.getItem<Record<string, number>>(
                    LAST_UPDATED_KEY,
                )) || {};
            timestamps[CHATS_KEY] = Date.now();
            await instance.setItem(LAST_UPDATED_KEY, timestamps);
        } else {
            await instance.setItem(CHATS_KEY, [updatedChat]);
            const timestamps =
                (await instance.getItem<Record<string, number>>(
                    LAST_UPDATED_KEY,
                )) || {};
            timestamps[CHATS_KEY] = Date.now();
            await instance.setItem(LAST_UPDATED_KEY, timestamps);
        }
    } catch (error) {
        console.error(`Error updating chat in local storage:`, error);
    }
};

// Check if stored data is stale (older than maxAge)
export const isDataStale = async (
    key: string,
    maxAge: number = 5 * 60 * 1000,
): Promise<boolean> => {
    if (!key) {
        console.error('Invalid key for checking staleness');
        return true;
    }
    try {
        const timestamps =
            await instance.getItem<Record<string, number>>(LAST_UPDATED_KEY);
        if (!timestamps || !timestamps[key]) {
            return true;
        }
        const now = Date.now();
        const isStale = now - timestamps[key] > maxAge;

        return isStale;
    } catch (error) {
        console.error(`Error checking if data is stale for key ${key}:`, error);
        return true;
    }
};

// Clear all chat data from storage
export const clearChatStorage = async (): Promise<void> => {
    try {
        // Get all keys
        const keys = await instance.keys();
        let deletedCount = 0;
        for (const key of keys) {
            if (
                key === CHATS_KEY ||
                key === ONLINE_USERS_KEY ||
                key === LAST_UPDATED_KEY ||
                key.startsWith(MESSAGES_KEY_PREFIX)
            ) {
                await instance.removeItem(key);
                deletedCount++;
            }
        }
    } catch (error) {
        console.error('Error clearing chat storage:', error);
    }
};

export default instance;
