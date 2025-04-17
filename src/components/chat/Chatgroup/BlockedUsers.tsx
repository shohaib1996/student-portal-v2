'use client';

import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { toast } from 'sonner';

// Initialize dayjs plugins
dayjs.extend(relativeTime);
dayjs.extend(isSameOrBefore);

import { getText, replaceMentionToNode } from '@/helper/utilities';

// ShadCN UI components
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Lucide Icons
import {
    Search,
    Lock,
    Loader2,
    Clock,
    SlidersHorizontal,
    CircleOff,
} from 'lucide-react';
import { useGetChatsQuery } from '@/redux/api/chats/chatApi';
import { ChatSkeletonList } from '../chat-skeleton';
import { renderPlainText } from '@/components/lexicalEditor/renderer/renderPlainText';

interface Message {
    _id?: string;
    createdAt?: string;
    type?: string;
    text?: string;
    sender?: {
        _id: string;
        firstName: string;
        fullName: string;
    };
    activity?: {
        type: string;
        user: {
            fullName: string;
        };
    };
}

interface Chat {
    _id: string;
    isChannel: boolean;
    isBlocked: boolean;
    isPublic?: boolean;
    name?: string;
    avatar?: string;
    unreadCount: number;
    latestMessage?: Message;
    otherUser?: {
        _id: string;
        type?: string;
        firstName?: string;
        fullName: string;
        profilePicture?: string;
    };
    myData?: {
        isBlocked: boolean;
    };
    typingData?: {
        isTyping: boolean;
        user?: {
            firstName: string;
        };
    };
}

interface RootState {
    chat: {
        chats: any[];
        onlineUsers: any[];
    };
    theme: {
        displayMode: string;
    };
}

function sortByLatestMessage(data: any[]): any[] {
    return data.slice().sort((a, b) => {
        const dateA =
            a.latestMessage && a.latestMessage.createdAt
                ? new Date(a.latestMessage.createdAt)
                : new Date(0);
        const dateB =
            b.latestMessage && b.latestMessage.createdAt
                ? new Date(b.latestMessage.createdAt)
                : new Date(0);

        return dateB.getTime() - dateA.getTime(); // For descending order
    });
}

const generateActivityText = (message: Message) => {
    const activity = message.activity;
    if (activity?.type === 'add') {
        return (
            <b>
                <>{message.sender?.fullName}</> <strong>added</strong>{' '}
                <b>{message.activity?.user?.fullName}</b>{' '}
            </b>
        );
    } else if (activity?.type === 'remove') {
        return (
            <>
                <>{message.sender?.fullName}</> <strong>removed</strong>{' '}
                <b>{message.activity?.user?.fullName}</b>{' '}
            </>
        );
    } else if (activity?.type === 'join') {
        return (
            <>
                {' '}
                <>{message.activity?.user?.fullName}</> <strong>joined</strong>{' '}
                in this crowd{' '}
            </>
        );
    } else if (activity?.type === 'leave') {
        return (
            <>
                {' '}
                <>{message.activity?.user?.fullName}</> <strong>left</strong>{' '}
                this crowd{' '}
            </>
        );
    } else {
        return <>N/A</>;
    }
};

function formatDate(date: string | Date | undefined): string {
    if (!date) {
        return '';
    }

    const today = dayjs().startOf('day');
    const yesterday = dayjs().subtract(1, 'day').startOf('day');
    const dateObj = dayjs(date);

    if (dateObj.isSame(today, 'day')) {
        return dateObj.format('h:mm A');
    } else if (dateObj.isSame(yesterday, 'day')) {
        return 'yesterday';
    } else if (date) {
        return dateObj.format('MM/DD/YYYY');
    } else {
        return 'N/A';
    }
}

function BlockedUser() {
    const { data: chats = [] } = useGetChatsQuery();
    const [records, setRecords] = useState<any[]>([]);
    const [channels, setChannels] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const params = useParams();

    const handleChangeSearch = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            setSearchQuery(value);

            if (value) {
                const filteredChats = channels.filter(
                    (c) =>
                        c?.name?.toLowerCase().includes(value.toLowerCase()) ||
                        (c?.otherUser?.fullName &&
                            c?.otherUser?.fullName
                                .toLowerCase()
                                .includes(value.toLowerCase())),
                );
                setRecords(filteredChats);
            } else {
                setRecords(channels);
            }
        },
        [channels],
    );

    useEffect(() => {
        setIsLoading(true);
        try {
            const blockedChannels =
                chats?.filter((x) => x?.isChannel && x?.myData?.isBlocked) ||
                [];
            setChannels(blockedChannels);
            setRecords(blockedChannels);
        } catch (error) {
            toast.error('Failed to load blocked channels');
            console.error('Error loading blocked channels:', error);
        } finally {
            setIsLoading(false);
        }
    }, [chats]);

    return (
        <div className='flex flex-col h-full'>
            {/* Search input */}
            <div className='relative flex flex-row items-center gap-2 pb-2 border-b border-b-border'>
                <div className='relative flex-1'>
                    <Input
                        className='pl-8 bg-background'
                        onChange={handleChangeSearch}
                        value={searchQuery}
                        type='search'
                        placeholder='Search blocked users...'
                    />
                    <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray' />
                </div>
            </div>

            {/* Blocked users list */}
            <div className='flex-1 overflow-y-auto'>
                {isLoading ? (
                    Array.from({ length: 10 }).map((_, index) => (
                        <ChatSkeletonList key={index} />
                    ))
                ) : records.length > 0 ? (
                    <div className='h-[calc(100vh-162px)] overflow-y-auto'>
                        {sortByLatestMessage(records)?.map((chat, i) => (
                            <Link
                                key={i}
                                href={`/chat/${chat?._id}?tab=blocked`}
                            >
                                <div
                                    className={`flex items-center p-4 border-l-[2px] transition-colors duration-200 ${
                                        params?.chatid === chat?._id
                                            ? 'bg-blue-700/20 border-l-[2px] border-blue-800'
                                            : 'hover:bg-blue-700/20 border-b hover:border-b-0 hover:border-l-[2px] hover:border-blue-800'
                                    }`}
                                >
                                    <div className='flex items-center w-full'>
                                        <div className='relative mr-3'>
                                            <div className='relative'>
                                                <Avatar className='h-12 w-12'>
                                                    <AvatarImage
                                                        src={
                                                            chat.isChannel
                                                                ? chat?.avatar ||
                                                                  '/chat/group.svg'
                                                                : chat
                                                                        ?.otherUser
                                                                        ?.type ===
                                                                    'bot'
                                                                  ? '/chat/bot.png'
                                                                  : chat
                                                                        ?.otherUser
                                                                        ?.profilePicture ||
                                                                    '/chat/user.svg'
                                                        }
                                                        alt={
                                                            chat?.isChannel
                                                                ? `${chat?.name}`
                                                                : chat
                                                                      ?.otherUser
                                                                      ?.fullName ||
                                                                  'User (deleted)'
                                                        }
                                                    />
                                                    <AvatarFallback>
                                                        {chat?.isChannel
                                                            ? chat?.name?.charAt(
                                                                  0,
                                                              )
                                                            : chat?.otherUser?.firstName?.charAt(
                                                                  0,
                                                              ) || 'U'}
                                                    </AvatarFallback>
                                                </Avatar>

                                                {/* Dark overlay with red clock for blocked users */}
                                                <div className='absolute inset-0 bg-pure-black/50 rounded-full flex items-center justify-center'>
                                                    <CircleOff className='h-6 w-6 text-red-500' />
                                                </div>
                                            </div>
                                        </div>

                                        <div className='flex-1 min-w-0'>
                                            <div className='flex justify-between items-start'>
                                                <div className='font-medium text-sm truncate'>
                                                    {chat?.isChannel && (
                                                        <span className='mr-1'>
                                                            {chat?.isPublic ? (
                                                                '#'
                                                            ) : (
                                                                <Lock className='inline h-3 w-3' />
                                                            )}
                                                        </span>
                                                    )}
                                                    {chat?.isChannel
                                                        ? `${chat?.name}`
                                                        : chat?.otherUser
                                                              ?.fullName ||
                                                          'User (deleted)'}
                                                </div>
                                                <span className='text-xs text-gray whitespace-nowrap'>
                                                    {formatDate(
                                                        chat?.latestMessage
                                                            ?.createdAt,
                                                    )}
                                                </span>
                                            </div>

                                            <div className='flex justify-between items-center mt-1'>
                                                <div className='text-xs text-gray-500 truncate max-w-[80%]'>
                                                    {chat?.myData?.isBlocked ? (
                                                        <span className='text-red-500 font-medium'>
                                                            You blocked this
                                                            contact
                                                        </span>
                                                    ) : chat?.typingData
                                                          ?.isTyping ? (
                                                        <span className='text-green-500'>
                                                            {
                                                                chat?.typingData
                                                                    ?.user
                                                                    ?.firstName
                                                            }{' '}
                                                            is typing...
                                                        </span>
                                                    ) : !chat.latestMessage
                                                          ?._id ? (
                                                        <>New conversation</>
                                                    ) : chat.latestMessage
                                                          ?.type ===
                                                      'activity' ? (
                                                        <span className='italic'>
                                                            {generateActivityText(
                                                                chat.latestMessage,
                                                            )}
                                                        </span>
                                                    ) : (
                                                        <p
                                                            className={`flex flex-row items-center ${chat?.unreadCount !== 0 ? 'font-semibold text-dark-black' : 'font-normal text-gray'}`}
                                                        >
                                                            {
                                                                chat
                                                                    ?.latestMessage
                                                                    ?.sender
                                                                    ?.firstName
                                                            }

                                                            <div className='w-[180px] overflow-hidden text-ellipsis whitespace-nowrap'>
                                                                {renderPlainText(
                                                                    {
                                                                        text:
                                                                            chat
                                                                                ?.latestMessage
                                                                                ?.text ||
                                                                            'New conversation',
                                                                        textSize:
                                                                            'text-xs',
                                                                        textColor:
                                                                            chat?.unreadCount >
                                                                            0
                                                                                ? 'text-black'
                                                                                : 'text-gray',
                                                                        truncate:
                                                                            true,
                                                                        width: 'w-full',
                                                                    },
                                                                )}
                                                            </div>
                                                        </p>
                                                    )}
                                                </div>

                                                {chat?.unreadCount > 0 && (
                                                    <span className='flex-shrink-0 h-5 w-5 bg-primary rounded-full flex items-center justify-center text-[10px] text-white font-medium'>
                                                        {chat.unreadCount}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className='p-4 text-center'>
                        <Card className='w-full max-w-md mx-auto bg-background'>
                            <CardHeader className='text-center'>
                                <CardTitle>No Blocked Chats</CardTitle>
                                <CardDescription>
                                    {`You haven't blocked any users or chats yet`}
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
}

export default BlockedUser;
