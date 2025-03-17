'use client';

import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
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
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

// Lucide Icons
import { Search, Lock, Loader2 } from 'lucide-react';

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
        isFavourite: boolean;
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
        chats: Chat[];
        onlineUsers: any[];
    };
    theme: {
        displayMode: string;
    };
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
                in this channel{' '}
            </>
        );
    } else if (activity?.type === 'leave') {
        return (
            <>
                {' '}
                <>{message.activity?.user?.fullName}</> <strong>left</strong>{' '}
                this channel{' '}
            </>
        );
    } else {
        return <>N/A</>;
    }
};

function formatDate(date: string | Date | undefined): string {
    if (!date) {
        return 'N/A';
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

function sortByLatestMessage(data: Chat[]): Chat[] {
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

function FavouriteSidebar() {
    const { chats, onlineUsers } = useSelector(
        (state: RootState) => state.chat,
    );
    const { displayMode } = useSelector((state: RootState) => state.theme);

    const [records, setRecords] = useState<Chat[]>([]);
    const [favourites, setFavourites] = useState<Chat[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const params = useParams();

    const handleChangeSearch = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            if (e.target.value) {
                const filteredChats = favourites.filter(
                    (c) =>
                        c?.name
                            ?.toLowerCase()
                            .includes(e.target.value.toLowerCase()) ||
                        (c?.otherUser?.fullName &&
                            c?.otherUser?.fullName
                                .toLowerCase()
                                .includes(e.target.value.toLowerCase())),
                );
                setRecords(filteredChats);
            } else {
                setRecords(favourites);
            }
        },
        [favourites],
    );

    useEffect(() => {
        setIsLoading(true);
        try {
            const favs = chats?.filter((x) => x?.myData?.isFavourite) || [];
            setFavourites(favs);
            setRecords(favs);
        } catch (error) {
            toast.error('Failed to load favourite chats');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, [chats]);

    if (isLoading) {
        return (
            <div className='flex justify-center items-center h-full p-4'>
                <Loader2 className='h-8 w-8 animate-spin text-primary' />
            </div>
        );
    }

    return (
        <>
            <div className='filter-group'>
                <div className='relative'>
                    <Input
                        className='search-input bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                        onChange={handleChangeSearch}
                        type='search'
                        placeholder='Search Favourite'
                    />
                    <span className='absolute right-3 top-1/2 transform -translate-y-1/2'>
                        <Search className='h-4 w-4 text-muted-foreground' />
                    </span>
                </div>
            </div>
            <div className='nav-body'>
                <div className='scrollbar-container'>
                    <ul className='list-group'>
                        {records.length > 0 ? (
                            sortByLatestMessage(records)?.map((chat, i) => {
                                return (
                                    <Link key={i} href={`/chat/${chat?._id}`}>
                                        <li
                                            className={`list-group-item border-b border-gray-200 dark:border-gray-700 ${
                                                params?.chatid === chat?._id
                                                    ? 'bg-gray-100 dark:bg-gray-800'
                                                    : ''
                                            } ${
                                                params?.chatid === chat?._id &&
                                                (displayMode === 'dark'
                                                    ? 'darkActive'
                                                    : 'active')
                                            } ${chat?.unreadCount > 0 ? 'new-msg' : ''}`}
                                        >
                                            <div>
                                                <div className='relative'>
                                                    <Avatar className='h-[34px] w-[34px]'>
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
                                                                      'TS4U User (deleted)'
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
                                                    <span
                                                        className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
                                                            chat?.isChannel
                                                                ? 'bg-[rgba(0,193,119,1)]'
                                                                : onlineUsers?.find(
                                                                        (x) =>
                                                                            x?._id ===
                                                                            chat
                                                                                ?.otherUser
                                                                                ?._id,
                                                                    )
                                                                  ? 'bg-[rgba(0,193,119,1)]'
                                                                  : 'bg-[rgba(0,0,0,0.5)]'
                                                        }`}
                                                    ></span>
                                                </div>
                                            </div>
                                            <div className='user-list-body'>
                                                <div className='name'>
                                                    <p className='title text-gray-900 dark:text-gray-100'>
                                                        {chat?.isChannel && (
                                                            <>
                                                                {chat?.isPublic ? (
                                                                    '#'
                                                                ) : (
                                                                    <Lock className='mr-1 h-4 w-4 inline' />
                                                                )}
                                                            </>
                                                        )}
                                                        {chat?.isChannel
                                                            ? `${chat?.name}`
                                                            : chat?.otherUser
                                                                  ?.fullName ||
                                                              'TS4U User (deleted)'}
                                                    </p>

                                                    <small className='time text-gray-500 dark:text-gray-400'>
                                                        {formatDate(
                                                            chat?.latestMessage
                                                                ?.createdAt,
                                                        )}
                                                    </small>
                                                </div>
                                                <div className='message_preview'>
                                                    <p className='text-gray-500 dark:text-gray-400'>
                                                        {chat?.myData
                                                            ?.isBlocked ? (
                                                            <Badge variant='destructive'>
                                                                Blocked
                                                            </Badge>
                                                        ) : chat?.typingData
                                                              ?.isTyping ? (
                                                            <p className='text-green-500'>
                                                                {
                                                                    chat
                                                                        ?.typingData
                                                                        ?.user
                                                                        ?.firstName
                                                                }{' '}
                                                                is typing...
                                                            </p>
                                                        ) : !chat.latestMessage
                                                              ?._id ? (
                                                            <>New chat</>
                                                        ) : chat.latestMessage
                                                              ?.type ===
                                                          'activity' ? (
                                                            generateActivityText(
                                                                chat.latestMessage,
                                                            )
                                                        ) : (
                                                            <span className='text'>
                                                                {`${chat.latestMessage.sender?.firstName}: ${getText(
                                                                    replaceMentionToNode(
                                                                        chat
                                                                            ?.latestMessage
                                                                            ?.text,
                                                                    ),
                                                                )}`}
                                                            </span>
                                                        )}
                                                    </p>
                                                    {chat?.unreadCount > 0 &&
                                                        chat?.unreadCount !==
                                                            0 && (
                                                            <small className='count'>
                                                                {
                                                                    chat?.unreadCount
                                                                }
                                                            </small>
                                                        )}
                                                </div>
                                            </div>
                                        </li>
                                    </Link>
                                );
                            })
                        ) : (
                            <div className='flex justify-center p-8'>
                                <Card className='w-full max-w-md'>
                                    <CardHeader className='text-center'>
                                        <CardTitle>
                                            No Favourite Chats
                                        </CardTitle>
                                        <CardDescription>
                                            No favourite chats found
                                        </CardDescription>
                                    </CardHeader>
                                </Card>
                            </div>
                        )}
                    </ul>
                </div>
            </div>
        </>
    );
}

export default FavouriteSidebar;
