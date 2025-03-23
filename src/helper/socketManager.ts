import { io, Socket } from 'socket.io-client';
import Cookies from 'js-cookie';
import storage from '@/utils/storage';
import { toast } from 'sonner';
import { setupSocketWithRTK } from '@/redux/api/chats/chatApi';
import { store } from '@/redux/store';

export let socket: Socket | null = null;

/**
 * Connect to the socket server and setup event handlers
 * @returns The socket connection
 */
export const connectSocket = async () => {
    try {
        const enroll = await storage.getItem('active_enrolment');
        const enrollId = enroll?._id;

        if (!socket) {
            const options = {
                rememberUpgrade: true,
                transports: ['websocket'],
                secure: true,
                rejectUnauthorized: false,
                query: {
                    token: Cookies.get(
                        process.env.NEXT_PUBLIC_AUTH_TOKEN_NAME as string,
                    ),
                    enrollment: enrollId,
                    organization: Cookies.get('activeCompany'),
                },
            };

            socket = io(process.env.NEXT_PUBLIC_API_SOCKET as string, options);

            // Setup base socket event handlers
            setupBaseSocketEvents();

            // Setup RTK Query integration
            setupSocketWithRTK(store);

            // Emit online status
            const userId = store.getState().auth?.user?._id;
            if (userId) {
                socket.emit('online', { id: userId });
            }

            console.log('Socket connected successfully');
        }

        return socket;
    } catch (error) {
        console.error('Socket connection error:', error);
        toast.error('Could not connect to chat server. Please try refreshing.');
        return null;
    }
};

/**
 * Setup basic socket event handlers not related to RTK Query
 */
const setupBaseSocketEvents = () => {
    if (!socket) {
        return;
    }

    // Handle reconnection
    socket.on('connect', () => {
        console.log('Socket reconnected');

        // Rejoin all chat rooms
        const userId = store.getState().auth?.user?._id;
        if (userId) {
            socket?.emit('online', { id: userId });
        }
    });

    // Handle connection errors
    socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
    });

    // Handle disconnect
    socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
    });
};

/**
 * Send a typing indicator
 * @param chatId The chat ID
 * @param isTyping Whether the user is typing
 */
export const sendTypingEvent = (chatId: string, isTyping: boolean) => {
    if (socket) {
        socket.emit('typing', { chatId, isTyping });
    }
};

/**
 * Join a chat room
 * @param chatId The chat ID to join
 */
export const joinChatRoom = (chatId: string) => {
    if (socket) {
        socket.emit('join-chat-room', { chatId });
    }
};

/**
 * Leave a chat room
 * @param chatId The chat ID to leave
 */
export const leaveChatRoom = (chatId: string) => {
    if (socket) {
        socket.emit('leave-chat-room', { chatId });
    }
};

/**
 * Disconnect the socket
 */
export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
        console.log('Socket disconnected');
    }
};

/**
 * Check if socket is connected
 * @returns Boolean indicating connection status
 */
export const isSocketConnected = (): boolean => {
    return socket?.connected || false;
};
