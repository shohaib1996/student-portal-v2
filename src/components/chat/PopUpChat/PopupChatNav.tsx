'use client';

import React, {
    useState,
    useCallback,
    useEffect,
    useRef,
    useMemo,
} from 'react';
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
    User,
    Users,
    UserCheck,
    Archive,
    Bot,
    UserMinus,
    MessageSquareText,
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
import Fuse from 'fuse.js';

import GlobalTooltip from '@/components/global/GlobalTooltip';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

// Import CreateCrowd component
import CreateCrowd from '../Chatgroup/CreateCrowd';
import { useDraftMessages } from '@/redux/hooks/chat/chatHooks';
import { Chat } from '@/redux/features/chatReducer';
import { ChatSkeletonList } from '../chat-skeleton';
import { renderPlainText } from '@/components/lexicalEditor/renderer/renderPlainText';

// Initialize dayjs
dayjs.extend(relativeTime);
dayjs.extend(isSameOrBefore);

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
    const { chats, onlineUsers, chatMessages } = useAppSelector(
        (state) => state.chat,
    );
    const [searchQuery, setSearchQuery] = useState('');
    const [records, setRecords] = useState<Chat[]>([]);
    const [loading, setLoading] = useState(true);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [displayCount, setDisplayCount] = useState<number>(20);
    const [active, setActive] = useState('chats');
    const [createCrowdOpen, setCreateCrowdOpen] = useState<boolean>(false);
    const scrollContainerRef = useRef<HTMLDivElement | null>(null);
    const [unread, setUnread] = useState<any[]>([]);
    const previousChatsRef = useRef<Chat[]>([]);

    // Get unread channels for notification badge
    useEffect(() => {
        const channels =
            chats?.filter((x) => x?.isChannel && (x?.unreadCount ?? 0) > 0) ||
            [];
        setUnread(channels);
    }, [chats]);

    // Configure Fuse.js options
    const fuseOptions = {
        includeScore: true,
        threshold: 0.3,
        keys: [
            'name',
            'otherUser.firstName',
            'otherUser.lastName',
            'otherUser.fullName',
        ],
        shouldSort: true,
    };

    // Create fuse instance with filtered data
    const configureFuse = (data: Chat[]) => {
        return new Fuse(data, fuseOptions);
    };

    // Helper function to get title based on active filter
    const getActiveFilterTitle = () => {
        switch (active) {
            case 'crowds':
                return 'All Crowds';
            case 'favourites':
                return 'All Pinned Messages';
            case 'onlines':
                return 'All Online Users';
            case 'search':
                return 'Search User';
            case 'readOnly':
                return 'All Readonly Messages';
            case 'unread':
                return 'All Unread Messages';
            case 'blocked':
                return 'All Blocked Users';
            case 'archived':
                return 'All Archived Messages';
            case 'ai':
                return 'All AI Bots';
            default:
                return 'All Chats';
        }
    };

    // Helper function to get filtered data based on active tab and search query
    const getFilteredData = useCallback(() => {
        if (!chats || chats.length === 0) {
            return [];
        }

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
                filteredData = chats.filter((chat) => chat.myData?.isFavourite);
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
                filteredData = chats.filter((chat) => chat.myData?.isBlocked);
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

        // Apply search filter using Fuse.js if there's a search query
        if (searchQuery) {
            const fuse = configureFuse(filteredData);
            const searchResults = fuse.search(searchQuery);
            // Extract the items from the Fuse.js results
            filteredData = searchResults.map((result) => result.item);
        }

        return filteredData;
    }, [active, chats, onlineUsers, searchQuery]);

    // 1. Effect for handling tab changes
    useEffect(() => {
        if (active !== 'search' && searchQuery) {
            setSearchQuery('');
        }

        setDisplayCount(10);
        setHasMore(true);
        setLoading(true);

        const timer = setTimeout(() => {
            const filteredData = getFilteredData();
            const initialRecords = sortByLatestMessage(filteredData).slice(
                0,
                displayCount,
            );
            setRecords(initialRecords);
            setHasMore(initialRecords.length < filteredData.length);
            setLoading(false);
        }, 300);

        return () => clearTimeout(timer);
    }, [active]);

    // 2. Effect for handling search query changes
    useEffect(() => {
        if (searchQuery !== '') {
            setLoading(true);

            const timer = setTimeout(() => {
                const filteredData = getFilteredData();
                const initialRecords = sortByLatestMessage(filteredData).slice(
                    0,
                    displayCount,
                );
                setRecords(initialRecords);
                setHasMore(initialRecords.length < filteredData.length);
                setLoading(false);
            }, 300);

            return () => clearTimeout(timer);
        }
    }, [searchQuery]);

    // 3. Effect for real-time updates from Redux
    useEffect(() => {
        // Check if chats have actually changed to avoid unnecessary processing
        if (
            JSON.stringify(previousChatsRef.current) !== JSON.stringify(chats)
        ) {
            previousChatsRef.current = chats;

            // Don't show loading indicator for real-time updates
            const filteredData = getFilteredData();
            const updatedRecords = sortByLatestMessage(filteredData).slice(
                0,
                displayCount,
            );

            // Only update if we're not already loading (to avoid UI flashing)
            if (!loading) {
                setRecords(updatedRecords);
                setHasMore(updatedRecords.length < filteredData.length);
            }
        }
    }, [chats, onlineUsers, getFilteredData, displayCount, loading]);

    // 4. Effect for handling display count changes
    useEffect(() => {
        if (displayCount > 10) {
            // Only run if display count changed (not on initial load)
            const filteredData = getFilteredData();
            const updatedRecords = sortByLatestMessage(filteredData).slice(
                0,
                displayCount,
            );
            setRecords(updatedRecords);
            setHasMore(updatedRecords.length < filteredData.length);
        }
    }, [displayCount, getFilteredData]);

    // Handle search input change
    const handleChangeSearch = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            setSearchQuery(value);
        },
        [],
    );

    // Load more chats when View More button is clicked
    const loadMoreChats = useCallback(() => {
        // Increase display count
        const newDisplayCount = displayCount + 10;
        setDisplayCount(newDisplayCount);
    }, [displayCount]);

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
            <div className='w-full h-full bg-foreground'>
                <CreateCrowd
                    isOpen={createCrowdOpen}
                    onClose={() => setCreateCrowdOpen(false)}
                />
            </div>
        );
    }

    return (
        <div className='flex flex-col h-[580px] w-full px-2'>
            <div className='flex items-center justify-between'>
                <h1 className='text-lg font-semibold'>
                    {getActiveFilterTitle()}
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
                                    onClick={() => handleNavItemClick('search')}
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

                    {/* <Button variant='ghost' size='icon'>
                        <MoreVertical className='h-5 w-5 text-gray' />
                    </Button> */}
                </div>
            </div>

            {/* Search bar with Filter dropdown */}
            <div className='pb-2 border-b'>
                <div className='relative flex flex-row items-center gap-1'>
                    <Input
                        className='pl-8 bg-background h-9'
                        onChange={handleChangeSearch}
                        value={searchQuery}
                        type='search'
                        placeholder='Search Chat...'
                    />
                    <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray' />

                    {/* Filter Dropdown Button */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant='secondary'
                                size='icon'
                                className='h-9 w-9 min-w-9 bg-background'
                            >
                                <SlidersHorizontal className='h-4 w-4 text-gray' />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end' className='w-48'>
                            <DropdownMenuLabel>Filter Chats</DropdownMenuLabel>
                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                                onClick={() => handleNavItemClick('chats')}
                                className={`flex items-center gap-2 ${active === 'chats' ? 'bg-blue-50 text-blue-600' : ''}`}
                            >
                                <User className='h-4 w-4' />
                                <span>All Chats</span>
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                onClick={() => handleNavItemClick('crowds')}
                                className={`flex items-center gap-2 ${active === 'crowds' ? 'bg-blue-50 text-blue-600' : ''}`}
                            >
                                <Users className='h-4 w-4' />
                                <span>Crowds</span>
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                onClick={() => handleNavItemClick('unread')}
                                className={`flex items-center gap-2 ${active === 'unread' ? 'bg-blue-50 text-blue-600' : ''}`}
                            >
                                <div className='relative'>
                                    <MessageSquareText className='h-4 w-4' />
                                    {unread.length > 0 && (
                                        <span className='absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500'></span>
                                    )}
                                </div>
                                <span>Unread</span>
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                onClick={() => handleNavItemClick('favourites')}
                                className={`flex items-center gap-2 ${active === 'favourites' ? 'bg-blue-50 text-blue-600' : ''}`}
                            >
                                <Pin className='h-4 w-4' />
                                <span>Pinned</span>
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                onClick={() => handleNavItemClick('onlines')}
                                className={`flex items-center gap-2 ${active === 'onlines' ? 'bg-blue-50 text-blue-600' : ''}`}
                            >
                                <UserCheck className='h-4 w-4' />
                                <span>Online Users</span>
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                onClick={() => handleNavItemClick('archived')}
                                className={`flex items-center gap-2 ${active === 'archived' ? 'bg-blue-50 text-blue-600' : ''}`}
                            >
                                <Archive className='h-4 w-4' />
                                <span>Archived</span>
                            </DropdownMenuItem>

                            {process.env.NEXT_PUBLIC_AI_BOT_ID && (
                                <DropdownMenuItem
                                    onClick={() => handleNavItemClick('ai')}
                                    className={`flex items-center gap-2 ${active === 'ai' ? 'bg-blue-50 text-blue-600' : ''}`}
                                >
                                    <Bot className='h-4 w-4' />
                                    <span>AI Bot</span>
                                </DropdownMenuItem>
                            )}

                            <DropdownMenuItem
                                onClick={() => handleNavItemClick('blocked')}
                                className={`flex items-center gap-2 ${active === 'blocked' ? 'bg-blue-50 text-blue-600' : ''}`}
                            >
                                <UserMinus className='h-4 w-4' />
                                <span>Blocked Users</span>
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                onClick={() => handleNavItemClick('readOnly')}
                                className={`flex items-center gap-2 ${active === 'readOnly' ? 'bg-blue-50 text-blue-600' : ''}`}
                            >
                                <Lock className='h-4 w-4' />
                                <span>Read Only</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Chat list */}
            <div
                className='flex-1 overflow-y-auto overflow-x-hidden'
                ref={scrollContainerRef}
            >
                {loading ? (
                    Array.from({ length: 10 }).map((_, index) => (
                        <ChatSkeletonList key={index} />
                    ))
                ) : records.length > 0 ? (
                    records.map((chat, i) => {
                        const isActive = selectedChatId === chat?._id;
                        const hasUnread =
                            chat?.unreadCount && chat.unreadCount > 0;

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
                            <div
                                key={chat._id || i}
                                className={`block border-l-[2px] cursor-pointer ${
                                    isActive
                                        ? 'bg-blue-700/20 border-l-[2px] border-blue-800'
                                        : 'hover:bg-blue-700/20 border-b hover:border-b-0 hover:border-l-[2px] hover:border-blue-800'
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
                                                                ?.type === 'bot'
                                                          ? '/chat/bot.png'
                                                          : (typeof chat.otherUser ===
                                                                'object' &&
                                                                chat.otherUser
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
                                                x?._id === chat.otherUser?._id,
                                        ) ? (
                                            <span className='absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white'></span>
                                        ) : (
                                            <span className='absolute bottom-0 right-0 h-3 w-fit rounded-full bg-green-900 text-pure-white border border-green-500 text-[8px] px-1'>
                                                {chat?.otherUser?.lastActive &&
                                                    (() => {
                                                        const now = dayjs();
                                                        const active = dayjs(
                                                            chat?.otherUser
                                                                ?.lastActive,
                                                        );
                                                        const diffSeconds =
                                                            now.diff(
                                                                active,
                                                                'second',
                                                            );
                                                        const diffMinutes =
                                                            now.diff(
                                                                active,
                                                                'minute',
                                                            );
                                                        const diffHours =
                                                            now.diff(
                                                                active,
                                                                'hour',
                                                            );
                                                        const diffDays =
                                                            now.diff(
                                                                active,
                                                                'day',
                                                            );
                                                        const diffMonths =
                                                            now.diff(
                                                                active,
                                                                'month',
                                                            );
                                                        const diffYears =
                                                            now.diff(
                                                                active,
                                                                'year',
                                                            );

                                                        if (diffSeconds < 60) {
                                                            return `${diffSeconds}s`;
                                                        }
                                                        if (diffMinutes < 60) {
                                                            return `${diffMinutes}m`;
                                                        }
                                                        if (diffHours < 24) {
                                                            return `${diffHours}h`;
                                                        }
                                                        if (diffDays < 30) {
                                                            return `${diffDays}d`;
                                                        }
                                                        if (diffMonths < 12) {
                                                            return `${diffMonths}mo`;
                                                        }
                                                        return `${diffYears}yr`;
                                                    })()}
                                            </span>
                                        )}
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
                                                    ) : chat?.latestMessage
                                                          ?.files?.length >
                                                      0 ? (
                                                        <span>
                                                            {chat?.latestMessage
                                                                ?.sender
                                                                ?._id !==
                                                            user?._id
                                                                ? `${chat?.latestMessage?.sender?.firstName}: `
                                                                : 'You: '}
                                                            {(() => {
                                                                const files =
                                                                    chat
                                                                        ?.latestMessage
                                                                        ?.files ||
                                                                    [];

                                                                // Count occurrences of each file type
                                                                const fileTypes =
                                                                    {
                                                                        image: files.filter(
                                                                            (file: {
                                                                                type: string;
                                                                            }) =>
                                                                                file.type?.includes(
                                                                                    'image/',
                                                                                ),
                                                                        )
                                                                            .length,
                                                                        video: files.filter(
                                                                            (file: {
                                                                                type: string;
                                                                            }) =>
                                                                                file.type?.includes(
                                                                                    'video/',
                                                                                ),
                                                                        )
                                                                            .length,
                                                                        audio: files.filter(
                                                                            (file: {
                                                                                type: string;
                                                                            }) =>
                                                                                file.type?.includes(
                                                                                    'audio/',
                                                                                ),
                                                                        )
                                                                            .length,
                                                                        other: files.filter(
                                                                            (file: {
                                                                                type: string;
                                                                            }) =>
                                                                                !file.type?.includes(
                                                                                    'image/',
                                                                                ) &&
                                                                                !file.type?.includes(
                                                                                    'video/',
                                                                                ) &&
                                                                                !file.type?.includes(
                                                                                    'audio/',
                                                                                ),
                                                                        )
                                                                            .length,
                                                                    };

                                                                // Create appropriate message based on file counts
                                                                const fileMessages =
                                                                    [];

                                                                if (
                                                                    fileTypes.image >
                                                                    0
                                                                ) {
                                                                    fileMessages.push(
                                                                        `${fileTypes.image} ${fileTypes.image === 1 ? 'image' : 'images'}`,
                                                                    );
                                                                }

                                                                if (
                                                                    fileTypes.video >
                                                                    0
                                                                ) {
                                                                    fileMessages.push(
                                                                        `${fileTypes.video} ${fileTypes.video === 1 ? 'video' : 'videos'}`,
                                                                    );
                                                                }

                                                                if (
                                                                    fileTypes.audio >
                                                                    0
                                                                ) {
                                                                    fileMessages.push(
                                                                        `${fileTypes.audio} ${fileTypes.audio === 1 ? 'audio' : 'audios'}`,
                                                                    );
                                                                }

                                                                if (
                                                                    fileTypes.other >
                                                                    0
                                                                ) {
                                                                    fileMessages.push(
                                                                        `${fileTypes.other} ${fileTypes.other === 1 ? 'file' : 'files'}`,
                                                                    );
                                                                }

                                                                // Join the messages with commas and "and"
                                                                if (
                                                                    fileMessages.length ===
                                                                    0
                                                                ) {
                                                                    return 'Sent attachment';
                                                                } else if (
                                                                    fileMessages.length ===
                                                                    1
                                                                ) {
                                                                    return `Sent ${fileMessages[0]}`;
                                                                } else {
                                                                    const lastMessage =
                                                                        fileMessages.pop();
                                                                    return `Sent ${fileMessages.join(', ')} and ${lastMessage}`;
                                                                }
                                                            })()}
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
                            </div>
                        );
                    })
                ) : (
                    <div className='p-4 text-center text-gray'>
                        No conversations found
                    </div>
                )}

                {/* View more button - Only shown when there are more chats to load */}
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
    );
};

export default PopupChatNav;
