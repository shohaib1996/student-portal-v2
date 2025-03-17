'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { toast } from 'sonner';
// Initialize dayjs plugins
dayjs.extend(relativeTime);

// API instance

// Redux actions
// import { updateChats } from "../../../store/reducer/chatReducer"

// ShadCN UI components
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

// Lucide Icons
import { MessageSquare, Loader2 } from 'lucide-react';
import axios from 'axios';
import { useAppSelector } from '@/redux/hooks';
import chats from '../chats.json';

interface User {
    _id: string;
    fullName?: string;
    profilePicture?: string;
    lastActive?: string;
}

interface UserCardProps {
    user: User;
    source?: string;
}

interface RootState {
    chat: {
        chats: any[];
    };
    theme: {
        displayMode: string;
    };
}

function UserCard({ user, source }: UserCardProps) {
    // const { chats } = useAppSelector((state) => state.chat);
    const dispatch = useDispatch();
    const router = useRouter();

    const [creating, setCreating] = useState<boolean>(false);

    const handleCreateChat = useCallback(
        (id: string) => {
            setCreating(true);

            axios
                .post(`/chat/findorcreate/${id}`)
                .then((res) => {
                    const filtered = chats.filter(
                        (c) => c._id === res.data.chat._id,
                    );

                    if (filtered.length > 0) {
                        router.push(`/chat/${res.data.chat._id}`);
                    } else {
                        console.log(res.data.chat);
                        // dispatch(updateChats(res.data.chat))
                        router.push(`/chat/${res.data.chat._id}`);
                    }
                    setCreating(false);
                })
                .catch((err: any) => {
                    setCreating(false);
                    toast.error(
                        err?.response?.data?.error || 'Failed to create chat',
                    );
                });
        },
        [chats, dispatch, router],
    );

    return (
        <div className='list-group'>
            <li
                className='list-group-item border-b border-gray-200 dark:border-gray-700'
                // onClick={() => handleCreateChat(user?._id)}
            >
                <div>
                    <Avatar className='h-[34px] w-[34px]'>
                        <AvatarImage
                            src={user.profilePicture || '/chat/user.svg'}
                            alt={user.fullName || 'User'}
                        />
                        <AvatarFallback>
                            {user.fullName?.charAt(0) || 'U'}
                        </AvatarFallback>
                    </Avatar>
                </div>
                <div className='user-list-body'>
                    <div className='name'>
                        <p className='title text-gray-900 dark:text-gray-100'>
                            {user?.fullName || 'Schools Hub User (deleted)'}
                        </p>
                    </div>
                    <div className='message_preview'>
                        <p className='text-green-500'>
                            {source === 'search' ? (
                                <>
                                    {user?.lastActive
                                        ? dayjs(user?.lastActive).fromNow()
                                        : 'N/A'}
                                </>
                            ) : (
                                'Active Now'
                            )}
                        </p>
                    </div>
                </div>
                <div className='user-notification'>
                    <small className='time message-icons'>
                        {creating ? (
                            <Loader2 className='h-4 w-4 animate-spin text-primary' />
                        ) : (
                            <Button
                                variant='ghost'
                                size='icon'
                                className='h-8 w-8 p-0 text-green-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-gray-800'
                                onClick={() => handleCreateChat(user?._id)}
                            >
                                <MessageSquare className='h-5 w-5' />
                            </Button>
                        )}
                    </small>
                </div>
            </li>
        </div>
    );
}

export default UserCard;
