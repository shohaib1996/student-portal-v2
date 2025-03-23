'use client';

import type React from 'react';
import { useCallback, useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
// import { updateChats } from '../../store/reducer/chatReducer';
import { toast } from 'sonner';

// Lucide Icons
import {
    User,
    Users,
    Pin,
    UserCheck,
    Archive,
    Search,
    Bot,
    UserMinus,
    MessageSquareText,
} from 'lucide-react';
import { instance } from '@/lib/axios/axiosInstance';
import GlobalTooltip from '../global/GlobalTooltip';
import { useGetChatsQuery } from '@/redux/api/chats/chatApi';

interface SideNavigationProps {
    setActive: (section: string) => void;
    active: string;
}

interface Chat {
    _id: string;
    isChannel: boolean;
    unreadCount: number;
    // Add other chat properties as needed
}

interface RootState {
    chat: {
        chats: Chat[];
    };
    theme: {
        displayMode: string;
    };
}

const SideNavigation: React.FC<SideNavigationProps> = ({
    setActive,
    active,
}) => {
    const { data: chats = [], isLoading: isChatsLoading } = useGetChatsQuery();
    const router = useRouter();
    const dispatch = useDispatch();

    // const { chats } = useSelector((state: RootState) => state.chat);
    const [unread, setUnread] = useState<any[]>([]);

    useEffect(() => {
        const channels =
            chats?.filter((x) => x?.isChannel && (x?.unreadCount ?? 0) > 0) ||
            [];
        setUnread(channels); // Add this line to store the result in state
    }, [chats]);

    const handleCreateChat = useCallback(
        (id: string) => {
            // TODO: Replace with RTK query in the future
            instance
                .post(`/chat/findorcreate/${id}`)
                .then((res) => {
                    const filtered = chats.filter(
                        (c) => c._id === res.data.chat._id,
                    );
                    if (filtered.length > 0) {
                        router.push(`/chat/${res.data.chat._id}`);
                    } else {
                        // dispatch(updateChats(res.data.chat));
                        router.push(`/chat/${res.data.chat._id}`);
                    }
                })
                .catch((err) => {
                    toast.error(
                        err?.response?.data?.error || 'Failed to create chat',
                    );
                });
        },
        [chats, dispatch, router],
    );

    const getButtonClass = useCallback(
        (section: string) => {
            return active === section
                ? 'bg-primary text-pure-white'
                : 'bg-transparent text-dark-gray';
        },
        [active],
    );
    console.log({ active: active });
    return (
        <div className='flex flex-col h-full w-[50px]'>
            <div className='flex flex-col items-center gap-3'>
                <GlobalTooltip tooltip='All Chats' side='right'>
                    <div
                        onClick={() => setActive('chats')}
                        className={`bg-transparent hover:bg-primary group text-dark-gray hover:text-pure-white cursor-pointer h-12 w-12 flex items-center justify-center rounded-md duration-200 ${getButtonClass('chats')}`}
                    >
                        <User className='h-6 w-6 text-dark-gray group-hover:text-pure-white' />
                    </div>
                </GlobalTooltip>

                <GlobalTooltip tooltip='Crowds' side='right'>
                    <div
                        onClick={() => setActive('crowds')}
                        className={`bg-transparent hover:bg-primary group text-dark-gray hover:text-pure-white cursor-pointer h-12 w-12 flex items-center justify-center rounded-md duration-200 ${getButtonClass('crowds')}`}
                    >
                        <Users className='h-6 w-6 text-dark-gray group-hover:text-pure-white' />
                    </div>
                </GlobalTooltip>

                <GlobalTooltip tooltip='Unread' side='right'>
                    <div
                        onClick={() => setActive('unread')}
                        className={`bg-transparent hover:bg-primary group text-dark-gray hover:text-pure-white cursor-pointer h-12 w-12 flex items-center justify-center rounded-md duration-200 ${getButtonClass('unread')}`}
                    >
                        <div className='relative'>
                            <MessageSquareText className='h-6 w-6 text-dark-gray group-hover:text-pure-white' />
                            {unread.length > 0 && (
                                <>
                                    <span className='absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-red-500'></span>
                                    <span className='absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-red-500 animate-ping'></span>
                                </>
                            )}
                        </div>
                    </div>
                </GlobalTooltip>

                <GlobalTooltip tooltip='Pinned' side='right'>
                    <div
                        onClick={() => setActive('favourites')}
                        className={`bg-transparent hover:bg-primary text-dark-gray group hover:text-pure-white cursor-pointer h-12 w-12 flex items-center justify-center rounded-md duration-200 ${getButtonClass('favourites')}`}
                    >
                        <Pin className='h-6 w-6 text-dark-gray group-hover:text-pure-white' />
                    </div>
                </GlobalTooltip>

                <GlobalTooltip tooltip='Online Users' side='right'>
                    <div
                        onClick={() => setActive('onlines')}
                        className={`bg-transparent hover:bg-primary text-dark-gray group hover:text-pure-white cursor-pointer h-12 w-12 flex items-center justify-center rounded-md duration-200 ${getButtonClass('onlines')}`}
                    >
                        <UserCheck className='h-6 w-6 text-dark-gray group-hover:text-pure-white' />
                    </div>
                </GlobalTooltip>

                <GlobalTooltip tooltip='Archived' side='right'>
                    <div
                        onClick={() => setActive('archived')}
                        className={`bg-transparent hover:bg-primary text-dark-gray group hover:text-pure-white cursor-pointer h-12 w-12 flex items-center justify-center rounded-md duration-200 ${getButtonClass('archived')}`}
                    >
                        <Archive className='h-6 w-6 text-dark-gray group-hover:text-pure-white' />
                    </div>
                </GlobalTooltip>

                <GlobalTooltip tooltip='Search' side='right'>
                    <div
                        onClick={() => setActive('search')}
                        className={`bg-transparent hover:bg-primary text-dark-gray group hover:text-pure-white cursor-pointer h-12 w-12 flex items-center justify-center rounded-md duration-200 ${getButtonClass('search')}`}
                    >
                        <Search className='h-6 w-6 text-dark-gray group-hover:text-pure-white' />
                    </div>
                </GlobalTooltip>

                <Suspense
                    fallback={
                        <div className='h-12 w-12 animate-pulse bg-muted rounded-full'></div>
                    }
                >
                    {process.env.NEXT_PUBLIC_AI_BOT_ID && (
                        <GlobalTooltip tooltip='AI Bot' side='right'>
                            <div
                                onClick={() => {
                                    setActive('ai');
                                    handleCreateChat(
                                        process.env
                                            .NEXT_PUBLIC_AI_BOT_ID as string,
                                    );
                                }}
                                className={`bg-transparent hover:bg-primary text-dark-gray group hover:text-pure-white cursor-pointer h-12 w-12 flex items-center justify-center rounded-md duration-200 ${getButtonClass('ai')}`}
                            >
                                <Bot className='h-6 w-6 text-dark-gray group-hover:text-pure-white' />
                            </div>
                        </GlobalTooltip>
                    )}
                </Suspense>

                <GlobalTooltip tooltip='Blocked Users' side='right'>
                    <div
                        onClick={() => setActive('blocked')}
                        className={`bg-transparent hover:bg-primary text-dark-gray group hover:text-pure-white cursor-pointer h-12 w-12 flex items-center justify-center rounded-md duration-200 ${getButtonClass('blocked')}`}
                    >
                        <UserMinus className='h-6 w-6 text-dark-gray group-hover:text-pure-white' />
                    </div>
                </GlobalTooltip>
            </div>
        </div>
    );
};

export default SideNavigation;
