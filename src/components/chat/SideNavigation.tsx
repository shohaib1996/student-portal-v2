'use client';

import type React from 'react';
import { useCallback, useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios'; // TODO: Replace with RTK query in the future
// import { updateChats } from '../../store/reducer/chatReducer';
import { toast } from 'sonner';

// ShadCN UI components
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';

// Lucide Icons
import {
    User,
    Users,
    MessageSquare,
    Pin,
    UserCheck,
    Archive,
    Search,
    Bot,
    UserMinus,
} from 'lucide-react';
import chats from './chats.json';
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
    const router = useRouter();
    const dispatch = useDispatch();

    // const { chats } = useSelector((state: RootState) => state.chat);
    const [unread, setUnread] = useState<Chat[]>([]);

    useEffect(() => {
        const channels =
            chats?.filter((x) => x.isChannel && x.unreadCount > 0) || [];
        setUnread(channels);
    }, [chats]);

    const handleCreateChat = useCallback(
        (id: string) => {
            // TODO: Replace with RTK query in the future
            axios
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
            return `icon-nav ${active === section ? 'active-btn' : ''} ${
                active === section ? 'bg-gray-800' : ''
            }`;
        },
        [active],
    );

    return (
        <>
            <div className='side-wrapper'>
                <div className='list-container'>
                    <div className='chatbar-list'>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        onClick={() => setActive('chats')}
                                        className={getButtonClass('chats')}
                                        variant='ghost'
                                        size='icon'
                                    >
                                        <User className='h-5 w-5 text-white' />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side='right'>
                                    All Chats
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        onClick={() => setActive('crowds')}
                                        className={getButtonClass('crowds')}
                                        variant='ghost'
                                        size='icon'
                                    >
                                        <Users className='h-5 w-5 text-[#27AC1F]' />
                                        {/* Preserved commented SVG code converted to Lucide Icon:
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      className="text-white"
                    >
                      <path
                        d="M14.6668 2H1.3335L6.66683 8.30667V12.6667L9.3335 14V8.30667L14.6668 2Z"
                        stroke="currentColor"
                        strokeWidth="1.3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    */}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side='right'>
                                    Crowds
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        onClick={() => setActive('unread')}
                                        className={getButtonClass('unread')}
                                        variant='ghost'
                                        size='icon'
                                    >
                                        <div className='relative'>
                                            <MessageSquare className='h-5 w-5' />
                                            {unread.length > 0 && (
                                                <span className='absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500 animate-pulse'></span>
                                            )}
                                        </div>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side='right'>
                                    Unread
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        onClick={() => setActive('favourites')}
                                        className={getButtonClass('favourites')}
                                        variant='ghost'
                                        size='icon'
                                    >
                                        <Pin className='h-5 w-5' />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side='right'>
                                    Pinned
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        onClick={() => setActive('onlines')}
                                        className={getButtonClass('onlines')}
                                        variant='ghost'
                                        size='icon'
                                    >
                                        <UserCheck className='h-5 w-5 text-[#27AC1F]' />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side='right'>
                                    Onlines
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        onClick={() => setActive('archived')}
                                        className={getButtonClass('archived')}
                                        variant='ghost'
                                        size='icon'
                                    >
                                        <Archive className='h-5 w-5' />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side='right'>
                                    Archived
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        onClick={() => setActive('search')}
                                        className={getButtonClass('search')}
                                        variant='ghost'
                                        size='icon'
                                    >
                                        <Search className='h-5 w-5 text-[#27AC1F]' />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side='right'>
                                    Search
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        <Suspense
                            fallback={
                                <div className='h-10 w-10 animate-pulse bg-gray-200 rounded-full'></div>
                            }
                        >
                            {process.env.NEXT_PUBLIC_AI_BOT_ID && (
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                onClick={() => {
                                                    setActive('ai');
                                                    handleCreateChat(
                                                        process.env
                                                            .NEXT_PUBLIC_AI_BOT_ID as string,
                                                    );
                                                }}
                                                className={getButtonClass('ai')}
                                                variant='ghost'
                                                size='icon'
                                            >
                                                <Bot className='h-5 w-5 text-[#27AC1F]' />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent side='right'>
                                            AI Bot
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )}
                        </Suspense>

                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        onClick={() => setActive('blocked')}
                                        className={getButtonClass('blocked')}
                                        variant='ghost'
                                        size='icon'
                                    >
                                        <UserMinus className='h-5 w-5' />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side='right'>
                                    Blocked Users
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SideNavigation;
