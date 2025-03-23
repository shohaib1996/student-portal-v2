'use client';

import type React from 'react';
import { useCallback, useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
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
import GlobalTooltip from '@/components/global/GlobalTooltip';
import { useGetChatsQuery } from '@/redux/api/chats/chatApi';

interface PopupSideNavigationProps {
    setActive: (section: string) => void;
    active: string;
    isPopup?: boolean;
    directChatSelect?: (chatId: string) => void; // Add this prop for direct chat selection
}

const PopupSideNavigation: React.FC<PopupSideNavigationProps> = ({
    setActive,
    active,
    isPopup = true,
    directChatSelect,
}) => {
    const { data: chats = [], isLoading: isChatsLoading } = useGetChatsQuery();
    const router = useRouter();

    // State for unread messages
    const [unread, setUnread] = useState<any[]>([]);

    useEffect(() => {
        const channels =
            chats?.filter((x) => x?.isChannel && (x?.unreadCount ?? 0) > 0) ||
            [];
        setUnread(channels);
    }, []);

    // Handle chat creation without URL navigation for popup mode
    const handleCreateChat = useCallback(
        (id: string) => {
            instance
                .post(`/chat/findorcreate/${id}`)
                .then((res) => {
                    if (isPopup && directChatSelect) {
                        // In popup mode, use the callback instead of navigation
                        directChatSelect(res.data.chat._id);
                    } else {
                        // In regular mode, use routing
                        const filtered = chats.filter(
                            (c) => c._id === res.data.chat._id,
                        );
                        if (filtered.length > 0) {
                            router.push(`/chat/${res.data.chat._id}`);
                        } else {
                            router.push(`/chat/${res.data.chat._id}`);
                        }
                    }
                })
                .catch((err) => {
                    toast.error(
                        err?.response?.data?.error || 'Failed to create chat',
                    );
                });
        },
        [router, isPopup, directChatSelect],
    );

    const getButtonClass = useCallback(
        (section: string) => {
            return active === section
                ? 'bg-primary text-pure-white'
                : 'bg-transparent text-dark-gray';
        },
        [active],
    );

    // For popup mode, we'll create a horizontal layout instead of vertical
    if (isPopup) {
        return (
            <div className='flex flex-col items-center p-2 border bg-primary-light border-blue-600/20 rounded-lg'>
                <GlobalTooltip tooltip='All Chats' side='bottom'>
                    <div
                        onClick={() => setActive('chats')}
                        className={`bg-transparent hover:bg-primary group text-dark-gray hover:text-pure-white cursor-pointer h-10 w-10 flex items-center justify-center rounded-md duration-200 ${getButtonClass('chats')}`}
                    >
                        <User className='h-5 w-5 text-dark-gray group-hover:text-pure-white' />
                    </div>
                </GlobalTooltip>

                <GlobalTooltip tooltip='Crowds' side='bottom'>
                    <div
                        onClick={() => setActive('crowds')}
                        className={`bg-transparent hover:bg-primary group text-dark-gray hover:text-pure-white cursor-pointer h-10 w-10 flex items-center justify-center rounded-md duration-200 ${getButtonClass('crowds')}`}
                    >
                        <Users className='h-5 w-5 text-dark-gray group-hover:text-pure-white' />
                    </div>
                </GlobalTooltip>

                <GlobalTooltip tooltip='Unread' side='bottom'>
                    <div
                        onClick={() => setActive('unread')}
                        className={`bg-transparent hover:bg-primary group text-dark-gray hover:text-pure-white cursor-pointer h-10 w-10 flex items-center justify-center rounded-md duration-200 ${getButtonClass('unread')}`}
                    >
                        <div className='relative'>
                            <MessageSquareText className='h-5 w-5 text-dark-gray group-hover:text-pure-white' />
                            {unread.length > 0 && (
                                <>
                                    <span className='absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-red-500'></span>
                                    <span className='absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-red-500 animate-ping'></span>
                                </>
                            )}
                        </div>
                    </div>
                </GlobalTooltip>

                <GlobalTooltip tooltip='Pinned' side='bottom'>
                    <div
                        onClick={() => setActive('favourites')}
                        className={`bg-transparent hover:bg-primary text-dark-gray group hover:text-pure-white cursor-pointer h-10 w-10 flex items-center justify-center rounded-md duration-200 ${getButtonClass('favourites')}`}
                    >
                        <Pin className='h-5 w-5 text-dark-gray group-hover:text-pure-white' />
                    </div>
                </GlobalTooltip>

                <GlobalTooltip tooltip='Online Users' side='bottom'>
                    <div
                        onClick={() => setActive('onlines')}
                        className={`bg-transparent hover:bg-primary text-dark-gray group hover:text-pure-white cursor-pointer h-10 w-10 flex items-center justify-center rounded-md duration-200 ${getButtonClass('onlines')}`}
                    >
                        <UserCheck className='h-5 w-5 text-dark-gray group-hover:text-pure-white' />
                    </div>
                </GlobalTooltip>

                <Suspense
                    fallback={
                        <div className='h-10 w-10 animate-pulse bg-muted rounded-full'></div>
                    }
                >
                    {process.env.NEXT_PUBLIC_AI_BOT_ID && (
                        <GlobalTooltip tooltip='AI Bot' side='bottom'>
                            <div
                                onClick={() => {
                                    setActive('ai');
                                    handleCreateChat(
                                        process.env
                                            .NEXT_PUBLIC_AI_BOT_ID as string,
                                    );
                                }}
                                className={`bg-transparent hover:bg-primary text-dark-gray group hover:text-pure-white cursor-pointer h-10 w-10 flex items-center justify-center rounded-md duration-200 ${getButtonClass('ai')}`}
                            >
                                <Bot className='h-5 w-5 text-dark-gray group-hover:text-pure-white' />
                            </div>
                        </GlobalTooltip>
                    )}
                </Suspense>
            </div>
        );
    }

    // Original layout for non-popup mode
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

export default PopupSideNavigation;
