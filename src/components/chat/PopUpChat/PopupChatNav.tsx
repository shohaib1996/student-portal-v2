'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
    Search,
    Lock,
    CheckCheck,
    Check,
    AtSign,
    BellOff,
    Pin,
    SlidersHorizontal,
    ChevronDown,
    Edit,
    PenSquare,
    UsersIcon,
    MoreVertical,
    CheckCircle2,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { useAppSelector } from '@/redux/hooks';
import { getText } from '@/helper/utilities';
import { instance } from '@/lib/axios/axiosInstance';
import { toast } from 'sonner';

// Import data
import chats from '../chats.json';
import onlineUsers from '../onlineUsers.json';
import drafts from '../drafts.json';

// Import side navigation
import PopupSideNavigation from './PopupSideNavigation';
import GlobalTooltip from '@/components/global/GlobalTooltip';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Import CreateCrowd component
import CreateCrowd from '../Chatgroup/CreateCrowd';

// Initialize dayjs
dayjs.extend(relativeTime);
dayjs.extend(isSameOrBefore);

// Loading skeleton
const ChatListSkeleton = () => (
    <div className='space-y-3 p-3'>
        {Array(5)
            .fill(0)
            .map((_, i) => (
                <div key={i} className='flex items-center space-x-3'>
                    <Skeleton className='h-10 w-10 rounded-full' />
                    <div className='space-y-2 flex-1'>
                        <Skeleton className='h-4 w-3/4 rounded-md' />
                        <Skeleton className='h-3 w-full rounded-md' />
                    </div>
                </div>
            ))}
    </div>
);

/**
 * Format date for chat messages
 */
interface DateFormats {
    'h:mm A': string;
    'MMM DD, YY': string;
}

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
    } else {
        return dateObj.format('MMM DD, YY');
    }
};

/**
 * Sort chats by latest message timestamp
 */
interface ChatMessage {
    createdAt?: string;
    type?: string;
    status?: string;
    _id?: string;
    sender?: {
        profilePicture: string;
        lastName: string;
        type?: string;
        _id: string;
        firstName: string;
        fullName: string;
    };
    text?: string;
    files?: any[];
    emoji?: any[];
}

interface Chat {
    _id: string;
    isChannel: boolean;
    isPublic: boolean | string;
    isReadOnly: boolean;
    isArchived: boolean;
    organization: string;
    memberScope: string;
    latestMessage?: ChatMessage;
    name?: string;
    membersCount?: number;
    unreadCount?: number;
    avatar?: string | null;
    myData?: {
        user: string;
        isFavourite: boolean;
        isBlocked: boolean;
        role: string;
        _id: string;
        notification: {
            isOn: boolean;
        };
        mute: {
            isMuted: boolean;
        };
    };
    otherUser?:
        | {
              firstName?: string;
              lastName?: string;
              fullName?: string;
              profilePicture?: string;
              type?: string;
              _id?: string;
          }
        | string;
}

const sortByLatestMessage = (data: Chat[]): Chat[] => {
    return data.slice().sort((a: Chat, b: Chat) => {
        const dateA = a.latestMessage?.createdAt
            ? new Date(a.latestMessage.createdAt)
            : new Date(0);
        const dateB = b.latestMessage?.createdAt
            ? new Date(b.latestMessage.createdAt)
            : new Date(0);
        return dateB.getTime() - dateA.getTime();
    });
};

interface PopupChatNavProps {
    onSelectChat: (chatId: string) => void;
    selectedChatId?: string | null;
    onClose?: () => void;
    setCreateNew?: (value: boolean) => void;
}

const PopupChatNav: React.FC<PopupChatNavProps> = ({
    onSelectChat,
    selectedChatId,
    setCreateNew,
    onClose,
}) => {
    const { user } = useAppSelector((state) => state.auth);
    const [searchQuery, setSearchQuery] = useState('');
    const [records, setRecords] = useState<Chat[]>([]);
    const [loading, setLoading] = useState(true);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [displayCount, setDisplayCount] = useState<number>(10);
    const [active, setActive] = useState('chats');
    const [createCrowdOpen, setCreateCrowdOpen] = useState<boolean>(false);
    const scrollContainerRef = useRef<HTMLDivElement | null>(null);

    // Initialize chat list based on active tab
    useEffect(() => {
        // Reset search query when changing tabs
        setSearchQuery('');
        // Reset display count
        setDisplayCount(10);
        // Reset hasMore flag
        setHasMore(true);
        // Show loading state
        setLoading(true);

        const timer = setTimeout(() => {
            let filteredData: Chat[] = [];

            switch (active) {
                case 'chats':
                    // All chats
                    filteredData = chats;
                    break;
                case 'crowds':
                    // Only show channels/groups
                    filteredData = chats.filter((chat) => chat.isChannel);
                    break;
                case 'favourites':
                    // Only pinned chats
                    filteredData = chats.filter(
                        (chat) => chat.myData?.isFavourite,
                    );
                    break;
                case 'onlines':
                    // Only online users' chats
                    const onlineUserIds = onlineUsers.map((user) => user._id);
                    filteredData = chats.filter(
                        (chat) =>
                            !chat.isChannel &&
                            typeof chat.otherUser === 'object' &&
                            onlineUserIds.includes(chat.otherUser?._id || ''),
                    );
                    break;
                case 'readOnly':
                    // Only read-only chats
                    filteredData = chats.filter((chat) => chat.isReadOnly);
                    break;
                case 'unread':
                    // Only unread chats
                    filteredData = chats.filter(
                        (chat) => (chat.unreadCount || 0) > 0,
                    );
                    break;
                case 'blocked':
                    // Only blocked users
                    filteredData = chats.filter(
                        (chat) => chat.myData?.isBlocked,
                    );
                    break;
                case 'archived':
                    // Only archived chats
                    filteredData = chats.filter((chat) => chat.isArchived);
                    break;
                case 'ai':
                    // Only AI bot chats
                    filteredData = chats.filter(
                        (chat) =>
                            !chat.isChannel &&
                            typeof chat.otherUser === 'object' &&
                            chat.otherUser?.type === 'bot',
                    );
                    break;
                case 'search':
                    // In search mode, just show all chats and let the search query filter them
                    filteredData = chats;
                    break;
                default:
                    filteredData = chats;
            }

            // Apply search filter if there's a search query
            if (searchQuery) {
                filteredData = filteredData.filter(
                    (c) =>
                        c?.name
                            ?.toLowerCase()
                            .includes(searchQuery.toLowerCase()) ||
                        `${typeof c?.otherUser === 'object' ? c?.otherUser?.firstName || '' : ''} ${typeof c?.otherUser === 'object' ? c?.otherUser?.lastName || '' : ''}`
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase()),
                );
            }

            // Sort and limit the data
            setRecords(
                sortByLatestMessage(filteredData).slice(0, displayCount),
            );
            setLoading(false);
        }, 300);

        return () => clearTimeout(timer);
    }, [active, displayCount, searchQuery]);

    // Handle search input change
    const handleChangeSearch = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            setSearchQuery(value);
        },
        [],
    );

    // Handle load more when scrolling
    const handleScroll = useCallback(() => {
        if (!scrollContainerRef.current) {
            return;
        }

        const { scrollTop, clientHeight, scrollHeight } =
            scrollContainerRef.current;

        if (scrollTop + clientHeight >= scrollHeight - 20) {
            // Near bottom, load more
            loadMoreChats();
        }
    }, []);

    // Load more chats
    const loadMoreChats = useCallback(() => {
        if (records.length < chats.length) {
            setDisplayCount((prev) => prev + 10);
        } else {
            setHasMore(false);
        }
    }, [records.length]);

    // Handle AI bot chat creation without URL change
    const handleCreateChat = useCallback(
        (id: string) => {
            instance
                .post(`/chat/findorcreate/${id}`)
                .then((res) => {
                    // Instead of routing, just call the onSelectChat callback
                    onSelectChat(res.data.chat._id);
                })
                .catch((err) => {
                    toast.error(
                        err?.response?.data?.error || 'Failed to create chat',
                    );
                });
        },
        [onSelectChat],
    );

    // Custom handler for navigation item selection
    const handleNavItemClick = useCallback(
        (section: string) => {
            setActive(section);

            // For AI bot, create a chat without URL change
            if (section === 'ai' && process.env.NEXT_PUBLIC_AI_BOT_ID) {
                handleCreateChat(process.env.NEXT_PUBLIC_AI_BOT_ID as string);
            }
        },
        [handleCreateChat],
    );

    // If Create Crowd is open, show the CreateCrowd component
    if (createCrowdOpen) {
        setCreateNew?.(true);
        return (
            <div className='w-full h-full bg-background'>
                <CreateCrowd
                    isOpen={createCrowdOpen}
                    onClose={() => setCreateCrowdOpen(false)}
                />
            </div>
        );
    }

    return (
        <div className='flex flex-row h-full w-full '>
            {/* Add Side Navigation bar (horizontal for popup) */}
            <PopupSideNavigation
                active={active}
                setActive={handleNavItemClick}
                isPopup={true}
                directChatSelect={onSelectChat} // Pass the callback for direct chat selection
            />

            <div className='flex flex-col h-full w-[calc(100%-50px)] px-2'>
                <div className='flex items-center justify-between'>
                    <h1 className='text-lg font-semibold'>
                        {active === 'crowds' ? (
                            'All Crowds'
                        ) : active === 'favourites' ? (
                            'All Pinned Messages'
                        ) : active === 'onlines' ? (
                            'All Online Users'
                        ) : active === 'search' ? (
                            'Search User'
                        ) : active === 'readOnly' ? (
                            'All Readonly Mesages'
                        ) : active === 'unread' ? (
                            'All Unread Messages'
                        ) : active === 'blocked' ? (
                            'All Blocked Users'
                        ) : active === 'archived' ? (
                            'All Archived Message'
                        ) : active === 'ai' ? (
                            'All AI Bots'
                        ) : (
                            <>All Chats</>
                        )}
                    </h1>
                    <div className='flex items-center gap-2'>
                        {/* New Chat/Crowd Action Button */}
                        <GlobalTooltip tooltip='New Chat/Crowd' side='bottom'>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant='ghost'
                                        size='icon'
                                        className='text-gray hover:bg-blue-50'
                                    >
                                        <Edit className='h-5 w-5' />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align='end'>
                                    <DropdownMenuLabel>
                                        Create New
                                    </DropdownMenuLabel>
                                    <DropdownMenuItem
                                        onClick={() => setActive('search')}
                                        className='flex items-center gap-2'
                                    >
                                        <PenSquare className='h-4 w-4' />
                                        <span>New Chat</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => setCreateCrowdOpen(true)}
                                        className='flex items-center gap-2'
                                    >
                                        <UsersIcon className='h-4 w-4' />
                                        <span>New Crowd</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </GlobalTooltip>

                        <Button variant='ghost' size='icon'>
                            <MoreVertical className='h-5 w-5 text-gray' />
                        </Button>
                    </div>
                </div>
                {/* Search bar */}
                <div className='pb-2 border-b'>
                    <div className='relative flex flex-row items-center gap-2'>
                        <Input
                            className='pl-10 bg-foreground h-9'
                            onChange={handleChangeSearch}
                            value={searchQuery}
                            type='search'
                            placeholder='Search Chat...'
                        />
                        <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray' />
                        <Button
                            variant='secondary'
                            size='icon'
                            className='h-9 w-9'
                        >
                            <SlidersHorizontal className='h-4 w-4 text-gray' />
                        </Button>
                    </div>
                </div>

                {/* Chat list */}
                <div
                    className='flex-1 overflow-y-auto divide-y divide-gray-200 overflow-x-hidden'
                    ref={scrollContainerRef}
                    onScroll={handleScroll}
                >
                    {loading ? (
                        <ChatListSkeleton />
                    ) : records.length > 0 ? (
                        records.map((chat, i) => {
                            const draft = drafts?.find(
                                (f) => f?.chat === chat?._id,
                            );
                            const hasUnread =
                                chat?.unreadCount && chat.unreadCount > 0;
                            const hasMention = i % 3 === 0; // Just for demo
                            const isMuted =
                                chat?.myData?.notification?.isOn === false ||
                                i % 4 === 0;
                            const isPinned =
                                chat?.myData?.isFavourite || i % 5 === 0;
                            const isDelivered =
                                chat?.latestMessage?.sender?._id ===
                                    user?._id && i % 2 === 0;
                            const isRead =
                                chat?.latestMessage?.sender?._id ===
                                    user?._id && i % 5 === 0;
                            const isActive = selectedChatId === chat?._id;

                            return (
                                <div
                                    key={i}
                                    className={`block border-l-[2px] hover:bg-blue-700/20 cursor-pointer ${
                                        isActive
                                            ? 'bg-blue-700/20 border-blue-800'
                                            : 'border-transparent hover:border-blue-800'
                                    }`}
                                    onClick={() => onSelectChat(chat._id)}
                                >
                                    <div className='flex items-start p-3 gap-3'>
                                        {/* Avatar */}
                                        <div className='relative flex-shrink-0'>
                                            <Avatar className='h-10 w-10'>
                                                <AvatarImage
                                                    src={
                                                        chat.isChannel
                                                            ? chat?.avatar ||
                                                              '/chat/group.svg'
                                                            : typeof chat.otherUser ===
                                                                    'object' &&
                                                                chat.otherUser
                                                                    ?.type ===
                                                                    'bot'
                                                              ? '/chat/bot.png'
                                                              : (typeof chat.otherUser ===
                                                                    'object' &&
                                                                    chat
                                                                        .otherUser
                                                                        ?.profilePicture) ||
                                                                '/chat/user.svg'
                                                    }
                                                    alt={
                                                        chat?.isChannel
                                                            ? chat?.name
                                                            : (typeof chat.otherUser ===
                                                                  'object' &&
                                                                  chat.otherUser
                                                                      ?.fullName) ||
                                                              'User'
                                                    }
                                                />
                                                <AvatarFallback>
                                                    {chat?.isChannel
                                                        ? chat?.name?.charAt(0)
                                                        : (typeof chat.otherUser ===
                                                              'object' &&
                                                              chat.otherUser?.firstName?.charAt(
                                                                  0,
                                                              )) ||
                                                          'U'}
                                                </AvatarFallback>
                                            </Avatar>

                                            {/* Online indicator */}
                                            {chat?.isChannel ||
                                            onlineUsers?.find(
                                                (x) =>
                                                    typeof chat.otherUser ===
                                                        'object' &&
                                                    x?._id ===
                                                        chat.otherUser?._id,
                                            ) ? (
                                                <span className='absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white'></span>
                                            ) : null}
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
                                                        : (typeof chat.otherUser ===
                                                              'object' &&
                                                              chat.otherUser
                                                                  ?.fullName) ||
                                                          'User'}

                                                    {/* Verified indicator */}
                                                    {typeof chat.otherUser ===
                                                        'object' &&
                                                        chat.otherUser?.type ===
                                                            'verified' && (
                                                            <CheckCircle2 className='inline h-3 w-3 ml-1 text-blue-500' />
                                                        )}

                                                    {/* Pin icon */}
                                                    {isPinned && (
                                                        <Pin className='h-4 w-4 text-dark-gray rotate-45' />
                                                    )}
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

                                                    <p className='text-xs text-gray truncate max-w-[80%]'>
                                                        {chat?.latestMessage
                                                            ?.type ===
                                                        'activity' ? (
                                                            <span className='italic'>
                                                                Activity message
                                                            </span>
                                                        ) : chat?.latestMessage
                                                              ?.type ===
                                                          'delete' ? (
                                                            <span className='italic'>
                                                                Message deleted
                                                            </span>
                                                        ) : (chat?.latestMessage
                                                              ?.files?.length ??
                                                              0) > 0 ? (
                                                            <span>
                                                                {chat
                                                                    ?.latestMessage
                                                                    ?.sender
                                                                    ?._id !==
                                                                user?._id
                                                                    ? '• '
                                                                    : ''}
                                                                Sent a file
                                                            </span>
                                                        ) : (
                                                            <>
                                                                {chat
                                                                    ?.latestMessage
                                                                    ?.sender
                                                                    ?._id !==
                                                                user?._id
                                                                    ? '• '
                                                                    : ''}
                                                                {getText(
                                                                    chat
                                                                        ?.latestMessage
                                                                        ?.text ||
                                                                        'New conversation',
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
                                                        chat?.latestMessage
                                                            ?.sender?._id !==
                                                            user?._id && (
                                                            <span className='flex-shrink-0 h-5 w-5 bg-primary rounded-full flex items-center justify-center text-[10px] text-white font-medium'>
                                                                {
                                                                    chat.unreadCount
                                                                }
                                                            </span>
                                                        )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className='p-4 text-center text-gray'>
                            No conversations found
                        </div>
                    )}

                    {/* View more button */}
                    {records.length > 0 && hasMore && (
                        <div className='p-2 text-center flex flex-row items-center gap-1'>
                            <div className='w-full h-[2px] bg-border'></div>
                            <Button
                                variant='primary_light'
                                size='sm'
                                className='text-xs rounded-3xl text-primary'
                                onClick={loadMoreChats}
                            >
                                View More{' '}
                                <ChevronDown size={16} className='text-gray' />
                            </Button>
                            <div className='w-full h-[2px] bg-border'></div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PopupChatNav;
