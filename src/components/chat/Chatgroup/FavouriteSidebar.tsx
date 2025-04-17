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
import { Button } from '@/components/ui/button';

// Lucide Icons
import {
    Search,
    Lock,
    Loader2,
    SlidersHorizontal,
    CheckCircle2,
    AtSign,
    BellOff,
    CheckCheck,
    Check,
    Pin,
    ChevronDown,
} from 'lucide-react';

import { useAppSelector } from '@/redux/hooks';
import {
    useGetChatsQuery,
    useGetOnlineUsersQuery,
} from '@/redux/api/chats/chatApi';
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
    files?: Array<any>;
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
        notification: {
            isOn: boolean;
        };
    };
    typingData?: {
        isTyping: boolean;
        user?: {
            firstName: string;
        };
    };
}

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
        return dateObj.format('MMM DD, YY');
    } else {
        return 'N/A';
    }
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

function FavouriteSidebar() {
    const { user } = useAppSelector((state: any) => state.auth);
    const { chatMessages } = useAppSelector((state) => state.chat);
    const { data: chats = [], isLoading: isChatsLoading } = useGetChatsQuery();
    const { data: onlineUsers = [] } = useGetOnlineUsersQuery();
    const [records, setRecords] = useState<any[]>([]);
    const [favourites, setFavourites] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [visibleCount, setVisibleCount] = useState<number>(20);
    const params = useParams();

    const handleChangeSearch = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            setSearchQuery(value);

            if (value) {
                const filteredChats = favourites.filter(
                    (c) =>
                        c?.name?.toLowerCase().includes(value.toLowerCase()) ||
                        (c?.otherUser?.fullName &&
                            c?.otherUser?.fullName
                                .toLowerCase()
                                .includes(value.toLowerCase())),
                );
                setRecords(filteredChats);
                // Reset visible count when searching
                setVisibleCount(20);
            } else {
                setRecords(favourites);
            }
        },
        [favourites],
    );

    const handleLoadMore = useCallback(() => {
        setVisibleCount((prevCount) => prevCount + 20);
    }, []);

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

    // Get only the visible records
    const visibleRecords = sortByLatestMessage(records).slice(0, visibleCount);
    const hasMoreToLoad = records.length > visibleRecords.length;

    return (
        <>
            {/* Search input - Fixed */}
            <div className='pb-2 border-b'>
                <div className='relative flex flex-row items-center gap-2'>
                    <Input
                        className='pl-8 bg-background'
                        onChange={handleChangeSearch}
                        value={searchQuery}
                        type='search'
                        placeholder='Search favourites...'
                    />
                    <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray' />
                </div>
            </div>

            {isLoading ? (
                <div className='flex justify-center py-8'>
                    <Loader2 className='h-8 w-8 animate-spin text-primary' />
                </div>
            ) : (
                <div className='h-[calc(100vh-162px)] overflow-y-auto'>
                    {isChatsLoading &&
                        Array.from({ length: 10 }).map((_, index) => (
                            <ChatSkeletonList key={index} />
                        ))}
                    {visibleRecords?.map((chat, i) => {
                        const isActive = params?.chatid === chat?._id;
                        const hasUnread = chat?.unreadCount > 0;

                        const hasMention = (() => {
                            // If there are no unread messages, return false
                            if (chat?.unreadCount === 0) {
                                return false;
                            }

                            const chatId = chat?._id;
                            const messages = chatMessages[chatId] || [];
                            return messages.some((msg) => {
                                if (!msg.text) {
                                    return false;
                                }

                                // Look for mention pattern: @[Name](userId)
                                const mentionRegex = /@\[.*?\]\((.*?)\)/g;
                                let match;

                                while (
                                    (match = mentionRegex.exec(msg.text)) !==
                                    null
                                ) {
                                    // match[1] contains the user ID in parentheses
                                    if (match[1] === user?._id) {
                                        return true;
                                    }
                                }

                                return false;
                            });
                        })();
                        const isMuted = chat?.myData?.mute?.isMute;
                        const isNotification = chat?.myData?.notification?.isOn;
                        const isPinned = chat?.myData?.isFavourite;
                        const isDelivered =
                            chat?.latestMessage?.sender?._id === user?._id;
                        const isRead =
                            chat?.latestMessage?.sender?._id === user?._id;
                        const isUnRead = chat?.unreadCount !== 0;

                        return (
                            <Link
                                key={i}
                                href={`/chat/${chat?._id}?tab=favourites`}
                                className={`block border-l-[2px] ${
                                    isActive
                                        ? 'bg-blue-700/20 border-l-[2px] border-blue-800'
                                        : 'hover:bg-blue-700/20 border-b hover:border-b-0 hover:border-l-[2px] hover:border-blue-800'
                                }`}
                            >
                                <div className='flex items-start p-2 gap-3'>
                                    {/* Avatar */}
                                    <div className='relative flex-shrink-0'>
                                        <Avatar className='h-10 w-10'>
                                            <AvatarImage
                                                src={
                                                    chat.isChannel
                                                        ? chat?.avatar ||
                                                          '/chat/group.svg'
                                                        : chat?.otherUser
                                                                ?.type === 'bot'
                                                          ? '/chat/bot.png'
                                                          : chat?.otherUser
                                                                ?.profilePicture ||
                                                            '/chat/user.svg'
                                                }
                                                alt={
                                                    chat?.isChannel
                                                        ? `${chat?.name}`
                                                        : chat?.otherUser
                                                              ?.fullName ||
                                                          'User'
                                                }
                                            />
                                            <AvatarFallback>
                                                {chat?.isChannel
                                                    ? chat?.name?.charAt(0)
                                                    : chat?.otherUser?.firstName?.charAt(
                                                          0,
                                                      ) || 'U'}
                                            </AvatarFallback>
                                        </Avatar>

                                        {/* Online indicator */}
                                        <span
                                            className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
                                                chat?.isChannel
                                                    ? 'bg-green-500'
                                                    : onlineUsers?.find(
                                                            (x) =>
                                                                x?._id ===
                                                                chat?.otherUser
                                                                    ?._id,
                                                        )
                                                      ? 'bg-green-500'
                                                      : 'bg-gray-500'
                                            }`}
                                        ></span>
                                    </div>

                                    {/* Chat content */}
                                    <div className='flex-1 min-w-0'>
                                        <div className='flex justify-between items-start gap-1'>
                                            <div className='font-medium flex flex-row items-center gap-1 text-sm truncate'>
                                                {chat?.isChannel && (
                                                    <span className='mr-1'>
                                                        {chat?.isPublic ? (
                                                            '#'
                                                        ) : (
                                                            <Lock className='inline h-3 w-3' />
                                                        )}
                                                    </span>
                                                )}
                                                <span className='truncate flex flex-row items-center gap-1'>
                                                    {chat?.isChannel
                                                        ? chat?.name
                                                        : chat?.otherUser
                                                              ?.fullName ||
                                                          'User'}
                                                    {chat?.otherUser?.type ===
                                                        'verified' && (
                                                        <CheckCircle2 className='inline h-3 w-3 ml-1 text-blue-500' />
                                                    )}
                                                    {/* Pin icon */}
                                                    <Pin className='h-4 w-4 text-primary rotate-45' />
                                                </span>
                                            </div>
                                            <span className='text-xs text-gray whitespace-nowrap'>
                                                {formatDate(
                                                    chat?.latestMessage
                                                        ?.createdAt,
                                                )}
                                            </span>
                                        </div>

                                        {/* Message preview */}
                                        <div className='flex justify-between items-center mt-1'>
                                            <div className='flex items-center gap-1 flex-1 w-[calc(100%-50px)]'>
                                                {/* Message status for sent messages */}
                                                {chat?.latestMessage?.sender
                                                    ?._id === user?._id && (
                                                    <>
                                                        {isRead ? (
                                                            <CheckCheck className='h-3 w-3 text-blue-500 flex-shrink-0' />
                                                        ) : isDelivered ? (
                                                            <CheckCheck className='h-3 w-3 text-gray-400 flex-shrink-0' />
                                                        ) : (
                                                            <Check className='h-3 w-3 text-gray-400 flex-shrink-0' />
                                                        )}
                                                    </>
                                                )}

                                                <p className='text-xs text-gray-500 truncate max-w-[80%]'>
                                                    {chat?.myData?.isBlocked ? (
                                                        <span className='bg-red-500 text-white text-xs px-2 py-0.5 rounded'>
                                                            Blocked
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
                                                        <span>New chat</span>
                                                    ) : chat.latestMessage
                                                          ?.type ===
                                                      'activity' ? (
                                                        <span className='italic'>
                                                            Activity message
                                                        </span>
                                                    ) : chat.latestMessage
                                                          ?.files?.length >
                                                      0 ? (
                                                        <span>
                                                            {chat?.latestMessage
                                                                ?.sender
                                                                ?._id !==
                                                            user?._id
                                                                ? '• '
                                                                : ''}
                                                            Sent a file
                                                        </span>
                                                    ) : (
                                                        <p
                                                            className={`flex flex-row items-center ${isUnRead ? 'font-semibold text-dark-black' : 'font-normal text-gray'}`}
                                                        >
                                                            {chat?.latestMessage
                                                                ?.sender
                                                                ?._id !==
                                                            user?._id
                                                                ? '• '
                                                                : ''}

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
                                                                            hasUnread
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
                                                </p>
                                            </div>

                                            {/* Right side indicators */}
                                            <div className='flex items-center gap-1'>
                                                {/* Mention icon */}
                                                {hasMention && (
                                                    <AtSign className='h-4 w-4 text-blue-500' />
                                                )}

                                                {/* Bell icon (muted or not) */}
                                                {!isNotification && (
                                                    <BellOff className='h-4 w-4 text-gray-400' />
                                                )}

                                                {/* Unread indicator */}
                                                {hasUnread &&
                                                    chat?.latestMessage?.sender
                                                        ?._id !== user?._id && (
                                                        <span className='flex-shrink-0 h-5 w-5 bg-primary rounded-full flex items-center justify-center text-[10px] text-white font-medium'>
                                                            {chat.unreadCount}
                                                        </span>
                                                    )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}

                    {records.length === 0 && (
                        <div className='p-4 text-center text-gray-500'>
                            No favourite chats found
                        </div>
                    )}

                    {records.length > 0 && hasMoreToLoad && (
                        <div className='p-2 text-center flex flex-row items-center gap-1'>
                            <div className='w-full h-[2px] bg-border'></div>
                            <Button
                                variant='primary_light'
                                size='sm'
                                className='text-xs rounded-3xl text-primary'
                                onClick={handleLoadMore}
                            >
                                View More{' '}
                                <ChevronDown size={16} className='text-gray' />
                            </Button>
                            <div className='w-full h-[2px] bg-border'></div>
                        </div>
                    )}
                </div>
            )}
        </>
    );
}

export default FavouriteSidebar;
