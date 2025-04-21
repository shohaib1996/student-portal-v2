// socketHandler.ts

import { instance } from '@/lib/axios/axiosInstance';
import { store } from '@/redux/store';
import { socket } from './socketManager';
import {
    addOnlineUser,
    Message,
    pushMessage,
    removeOnlineUser,
    setTyping,
    updateChats,
    updateLatestMessage,
    updateMessage,
    updateRepliesCount,
} from '@/redux/features/chatReducer';
import { handleMessageNoti } from './utilities';
import { newNotification } from '@/redux/features/notificationReducer';
import { loadChats } from '@/actions/initialActions';

// Define TypeScript interfaces
interface User {
    _id: string;
    fullName?: string;
    [key: string]: any;
}

interface Chat {
    _id: string;
    [key: string]: any;
}

interface NotificationData {
    notification: {
        _id: string;
        categories: string[];
        notificationType?: string;
        userFrom?: User;
        entityId?: string;
        text?: string;
        [key: string]: any;
    };
    message?: string;
}

interface MessageData {
    chat?: {
        _id?: string;
        name?: string;
        isChannel?: boolean;
    };
    message: Message;
}

export interface TypingData {
    chatId: string;
    typingData: {
        isTyping: boolean;
        userId: string;
        username: string;
        user?: { _id: string; fullName: string };
    };
}

interface ChatEventData {
    chat: Chat;
}

interface OnlineUserData {
    user: any;
}

const updateStatus = (messageId: string, status: string): void => {
    instance
        .patch(`/chat/update-status/${messageId}`, { status })
        .then((res) => {})
        .catch((err) => {
            console.error(err);
        });
};

const setupSocketListeners = (api?: any): (() => void) => {
    const audio = new Audio('/noti2.mp3');
    const user = store.getState()?.auth?.user as User | undefined;

    if (!socket || !user?._id) {
        return () => {};
    }

    socket.on('join_online', (data: any) => {
        socket?.emit('online', { id: user?._id });
    });

    socket.on('newmessage', (data: MessageData) => {
        console.log('newmessage', data);
        const isSoundOnOrOff = store.getState()?.notification?.isSoundOnOrOff;

        if (data.message.forwardedFrom) {
            store.dispatch(
                updateLatestMessage({
                    chatId: data?.message?.chat,
                    latestMessage: data.message,
                    counter: 1,
                }),
            );
        }
        if (data.message?.sender?._id !== user._id) {
            updateStatus(data?.message?._id, 'delivered');
            store.dispatch(
                pushMessage({
                    message: data.message,
                }),
            );

            const result = handleMessageNoti(data, user._id);

            if (result?.isSent && isSoundOnOrOff === 'on') {
                audio.play();
            }
        }

        if (!data?.message?.parentMessage) {
            store.dispatch(
                updateLatestMessage({
                    chatId:
                        typeof data.chat === 'string'
                            ? data.chat
                            : data.chat?._id || '',
                    latestMessage: data.message,
                    counter: 1,
                }),
            );
            store.dispatch(updateRepliesCount({ message: data.message }));
        }
        // for activity message
        if (data?.message?.type === 'activity') {
            store.dispatch(
                updateLatestMessage({
                    chatId:
                        typeof data.chat === 'string'
                            ? data.chat
                            : data.chat?._id || '',
                    latestMessage: data.message,
                    counter: 1,
                }),
            );
            store.dispatch(updateRepliesCount({ message: data.message }));
            store.dispatch(
                pushMessage({
                    message: data.message,
                }),
            );
        }
    });

    socket.on('updatemessage', (data: MessageData) => {
        store.dispatch(
            updateMessage({
                // chat:
                //     typeof data.chat === 'string' ? data.chat : data.chat?._id,
                message: data.message,
            }),
        );
    });

    socket.on('updatechat', (data: ChatEventData) => {
        if (data?.chat) {
            store.dispatch(updateChats(data?.chat));
        }
    });

    socket.on('pushmessage', (data: MessageData) => {
        store.dispatch(
            pushMessage({
                // chat:
                //     typeof data.chat === 'string' ? data.chat : data.chat?._id,
                message: data.message,
            }),
        );
    });

    socket.on('newnotification', (data: NotificationData) => {
        if (
            data?.notification?.categories?.includes('student') ||
            data?.notification?.categories?.includes('global')
        ) {
            store.dispatch(
                newNotification({ ...data.notification, opened: false }),
            );
        }

        // Commented notification code in original JS version
        // if (data?.notification?.notificationType === "thread") {
        //     audio.play();
        //     notification.success({
        //         message: `${data?.notification?.userFrom?.fullName} replied in a thread`,
        //         description: data?.message,
        //         duration: 10,
        //         onClick: () => {
        //             window.location.href = `/chat/${data?.notification?.entityId}?message=${data?.notification?.text}`
        //         },
        //     });
        // }
    });

    socket.on('addOnlineUser', (data: OnlineUserData) => {
        store.dispatch(addOnlineUser(data.user));
    });

    socket.on('removeOnlineUser', (data: OnlineUserData) => {
        store.dispatch(removeOnlineUser(data.user));
    });
    socket.on('istyping', (data: TypingData) => {
        store.dispatch(
            setTyping({
                chatId: data?.chatId,
                typingData: {
                    isTyping: data?.typingData.isTyping,
                    userId: data?.typingData?.user?._id as string,
                    username: data?.typingData?.user?.fullName || '',
                },
            }),
        );
    });
    socket.on('newchatevent', (data: ChatEventData) => {
        store.dispatch(loadChats() as any);
        socket?.emit('join-chat-room', { chatId: data?.chat?._id });
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

export default setupSocketListeners;
