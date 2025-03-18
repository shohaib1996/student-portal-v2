'use client';

import type React from 'react';
import { useCallback, useEffect, useState, Suspense } from 'react';
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
import { Skeleton } from '@/components/ui/skeleton';

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
import chats from '../chats.json';

interface Chat {
    _id: string;
    isChannel: boolean;
    isPublic?: boolean;
    isBlocked?: boolean;
    name?: string;
    avatar?: string;
    unreadCount: number;
    latestMessage?: {
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
    };
    otherUser?: {
        _id: string;
        type?: string;
        firstName?: string;
        fullName?: string;
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

        return dateB.getTime() - dateA.getTime();
    });
}

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
        return dateObj.format('MMM DD, YY');
    } else {
        return 'N/A';
    }
}

function UnRead() {
    const { user } = useAppSelector((state: any) => state.auth);
    const [records, setRecords] = useState<any[]>([]);
    const [channels, setChannels] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(true);
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
            const unreadChannels =
                chats?.filter((x) => (x.unreadCount ?? 0) > 0) || [];
            setChannels(unreadChannels);
            setRecords(unreadChannels);
        } catch (error) {
            toast.error('Failed to load unread channels');
            console.error('Error loading unread channels:', error);
        } finally {
            setIsLoading(false);
        }
    }, [chats]);

    return (
        <>
            {/* Search input - Fixed */}
            <div className='pb-2 border-b'>
                <div className='relative flex flex-row items-center gap-2'>
                    <Input
                        className='pl-10 bg-foreground'
                        onChange={handleChangeSearch}
                        value={searchQuery}
                        type='search'
                        placeholder='Search unread chats...'
                    />
                    <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray' />
                    <Button variant='secondary' size='icon'>
                        <SlidersHorizontal className='h-4 w-4 text-gray' />
                    </Button>
                </div>
            </div>

            {isLoading ? (
                <div className='flex justify-center py-8'>
                    <Loader2 className='h-8 w-8 animate-spin text-primary' />
                </div>
            ) : (
                <div className='divide-y divide-gray-200'>
                    {sortByLatestMessage(records)?.map((chat, i) => {
                        const isActive = params?.chatid === chat?._id;
                        const hasUnread = (chat?.unreadCount ?? 0) > 0;

                        // For demo purposes - in real app, these would come from the chat data
                        const hasMention = i % 3 === 0;
                        const isMuted =
                            chat?.myData?.notification?.isOn === false ||
                            i % 4 === 0;
                        const isPinned =
                            chat?.myData?.isFavourite || i % 5 === 0;
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
                                                    : 'bg-gray-500'
                                            }`}
                                        ></span>
                                    </div>

                                    {/* Chat content */}
                                    <div className='flex-1 min-w-0'>
                                        <div className='flex justify-between items-start'>
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
                                            </div>
                                            <span className='text-xs text-gray-500 whitespace-nowrap'>
                                                {formatDate(
                                                    chat?.latestMessage
                                                        ?.createdAt,
                                                )}
                                            </span>
                                        </div>

                                        {/* Message preview */}
                                        <div className='flex justify-between items-center mt-1'>
                                            <div className='flex items-center gap-1 flex-1 w-full'>
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
                                                          ?.type ===
                                                      'delete' ? (
                                                        <span className='italic'>
                                                            Message deleted
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
                                                        <>
                                                            {chat?.latestMessage
                                                                ?.sender
                                                                ?._id !==
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
                            No unread chats found
                        </div>
                    )}

                    {records.length > 0 && (
                        <div className='p-2 text-center flex flex-row items-center gap-1'>
                            <div className='w-full h-[2px] bg-border'></div>
                            <Button
                                variant='primary_light'
                                size='sm'
                                className='text-xs rounded-3xl text-primary'
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

export default UnRead;
