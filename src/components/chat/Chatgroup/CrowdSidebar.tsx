'use client';

import type React from 'react';
import { useCallback, useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

// Initialize dayjs plugins
dayjs.extend(relativeTime);
dayjs.extend(isSameOrBefore);

// ShadCN UI components
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// Lucide Icons
import {
    Search,
    Lock,
    Filter,
    CheckCircle2,
    AtSign,
    BellOff,
    CheckCheck,
    Check,
    Pin,
    SlidersHorizontal,
    ChevronDown,
} from 'lucide-react';
import { getText, replaceMentionToNode } from '@/helper/utilities';
import { useAppSelector } from '@/redux/hooks';
import {
    useGetChatsQuery,
    useGetOnlineUsersQuery,
} from '@/redux/api/chats/chatApi';

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

/**
 * Format date for chat messages
 */
const formatDate = (date: string | Date | undefined): string => {
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
};

function CrowdSidebar() {
    const { data: chats = [], isLoading: isChatsLoading } = useGetChatsQuery();
    const { data: onlineUsers = [] } = useGetOnlineUsersQuery();
    const { chatMessages } = useAppSelector((state) => state.chat);
    const { user } = useAppSelector((state: any) => state.auth);
    const [records, setRecords] = useState<any[]>([]);
    const [channels, setChannels] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [visibleCount, setVisibleCount] = useState<number>(20);
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
                // Reset visible count when searching
                setVisibleCount(20);
            } else {
                setRecords(channels);
            }
        },
        [channels],
    );

    const handleLoadMore = useCallback(() => {
        setVisibleCount((prevCount) => prevCount + 20);
    }, []);

    useEffect(() => {
        const channelList = chats?.filter((x) => x.isChannel) || [];
        setChannels(channelList);
        setRecords(channelList);
    }, [chats]);

    // Sort and slice the records to show only the visible ones
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
                        placeholder='Search crowds...'
                    />
                    <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray' />
                </div>
            </div>

            <div className='divide-y divide-gray-200'>
                {visibleRecords?.map((chat, i) => {
                    const isActive = params?.chatid === chat?._id;
                    const hasUnread = chat?.unreadCount > 0;

                    // For demo purposes - in real app, these would come from the chat data
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
                                (match = mentionRegex.exec(msg.text)) !== null
                            ) {
                                // match[1] contains the user ID in parentheses
                                if (match[1] === user?._id) {
                                    return true;
                                }
                            }

                            return false;
                        });
                    })();
                    const isMuted =
                        chat?.myData?.notification?.isOn === false ||
                        i % 4 === 0;
                    const isPinned = chat?.myData?.isFavourite || i % 5 === 0;
                    const isDelivered =
                        chat?.latestMessage?.sender?._id === user?._id &&
                        i % 2 === 0;
                    const isRead =
                        chat?.latestMessage?.sender?._id === user?._id &&
                        i % 5 === 0;

                    return (
                        <Link
                            key={i}
                            href={`/chat/${chat?._id}`}
                            className={`block border-l-[2px] ${
                                isActive
                                    ? 'bg-blue-700/20 border-blue-800'
                                    : 'hover:bg-blue-700/20 border-transparent hover:border-blue-800'
                            }`}
                        >
                            <div className='flex items-start p-4 gap-3'>
                                {/* Avatar */}
                                <div className='relative flex-shrink-0'>
                                    <Avatar className='h-10 w-10'>
                                        <AvatarImage
                                            src={
                                                chat.isChannel
                                                    ? chat?.avatar ||
                                                      '/chat/group.svg'
                                                    : chat?.otherUser?.type ===
                                                        'bot'
                                                      ? '/chat/bot.png'
                                                      : chat?.otherUser
                                                            ?.profilePicture ||
                                                        '/chat/user.svg'
                                            }
                                            alt={
                                                chat?.isChannel
                                                    ? `${chat?.name}`
                                                    : chat?.otherUser
                                                          ?.fullName || 'User'
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
                                    {chat?.isChannel ||
                                    onlineUsers?.find(
                                        (x) => x?._id === chat?.otherUser?._id,
                                    ) ? (
                                        <span className='absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white'></span>
                                    ) : null}
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
                                                          ?.fullName || 'User'}
                                                {chat?.otherUser?.type ===
                                                    'verified' && (
                                                    <CheckCircle2 className='inline h-3 w-3 ml-1 text-blue-500' />
                                                )}
                                                {/* Pin icon */}
                                                {isPinned && (
                                                    <Pin className='h-4 w-4 text-dark-gray rotate-45' />
                                                )}
                                            </span>
                                        </div>
                                        <span className='text-xs text-gray-500 whitespace-nowrap'>
                                            {formatDate(
                                                chat?.latestMessage?.createdAt,
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
                                                {chat?.latestMessage?.type ===
                                                'activity' ? (
                                                    <span className='italic'>
                                                        Activity message
                                                    </span>
                                                ) : chat?.latestMessage
                                                      ?.type === 'delete' ? (
                                                    <span className='italic'>
                                                        Message deleted
                                                    </span>
                                                ) : chat?.latestMessage?.files
                                                      ?.length > 0 ? (
                                                    <span>
                                                        {chat?.latestMessage
                                                            ?.sender?._id !==
                                                        user?._id
                                                            ? '• '
                                                            : ''}
                                                        Sent a file
                                                    </span>
                                                ) : (
                                                    <>
                                                        {chat?.latestMessage
                                                            ?.sender?._id !==
                                                        user?._id
                                                            ? '• '
                                                            : ''}
                                                        {getText(
                                                            replaceMentionToNode(
                                                                chat
                                                                    ?.latestMessage
                                                                    ?.text ||
                                                                    'New conversation',
                                                            ),
                                                        )}
                                                    </>
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
                                            {isMuted && (
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
                        No crowds found
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
        </>
    );
}

export default CrowdSidebar;
