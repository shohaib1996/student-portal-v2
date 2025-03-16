// socketManager.js
import { io, Socket } from 'socket.io-client';
import Cookies from 'js-cookie';
import storage from '../utils/storage';
export let socket: Socket | null;

export const connectSocket = async () => {
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
        socket = io(process.env.NEXT_PUBLIC_API_SOCKET, options);
    }
    return socket;
};

// test

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};
