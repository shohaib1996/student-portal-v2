'use client';

import type { FC } from 'react';
import { useEffect, useRef, useState, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import dynamic from 'next/dynamic';
import { toast } from 'sonner';

// Initialize dayjs plugins
dayjs.extend(relativeTime);
dayjs.extend(isSameOrBefore);

// Utilities
import { getText } from '@/helper/utilities';
import { instance } from '@/lib/axios/axiosInstance';

// ShadCN UI components
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import GlobalTooltip from '../global/GlobalTooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Replace local JSON with RTK Query
import {
    useChats,
    useChatMessages,
    useTypingIndicator,
    useDraftMessages,
} from '@/redux/hooks/chat/chatHooks';

// Lucide Icons
import {
    Search,
    Lock,
    Filter,
    MoreVertical,
    CheckCircle2,
    AtSign,
    BellOff,
    CheckCheck,
    Check,
    Pin,
    Edit,
    PenSquare,
    Users as UsersIcon,
    SlidersHorizontal,
    ChevronDown,
    User,
    Users,
    MessageSquareMore,
    UserCheck,
    Archive,
    Bot,
    UserMinus,
} from 'lucide-react';
import { useAppSelector } from '@/redux/hooks';
import { useFindOrCreateChatMutation } from '@/redux/api/chats/chatApi';

// Dynamic imports for better performance
const MessagePreview = dynamic(() => import('./Message/MessagePreview'), {
    ssr: false,
});

const SideNavigation = dynamic(() => import('./SideNavigation'), {
    ssr: false,
});

// Lazy load sidebar components
const CrowdSidebar = dynamic(() => import('./Chatgroup/CrowdSidebar'), {
    loading: () => <SidebarSkeleton />,
    ssr: false,
});

const FavouriteSidebar = dynamic(() => import('./Chatgroup/FavouriteSidebar'), {
    loading: () => <SidebarSkeleton />,
    ssr: false,
});

const OnlineSidebar = dynamic(() => import('./Chatgroup/OnlineSidebar'), {
    loading: () => <SidebarSkeleton />,
    ssr: false,
});

const SearchSidebar = dynamic(() => import('./Chatgroup/SearchSidebar'), {
    loading: () => <SidebarSkeleton />,
    ssr: false,
});

const ReadOnly = dynamic(() => import('./Chatgroup/ReadOnly'), {
    loading: () => <SidebarSkeleton />,
    ssr: false,
});

const UnRead = dynamic(() => import('./Chatgroup/UnRead'), {
    loading: () => <SidebarSkeleton />,
    ssr: false,
});

const BlockedUser = dynamic(() => import('./Chatgroup/BlockedUsers'), {
    loading: () => <SidebarSkeleton />,
    ssr: false,
});

const Archived = dynamic(() => import('./Chatgroup/Archived'), {
    loading: () => <SidebarSkeleton />,
    ssr: false,
});

// Dynamic import for CreateCrowd
const CreateCrowd = dynamic(() => import('./Chatgroup/CreateCrowd'), {
    loading: () => <SidebarSkeleton />,
    ssr: false,
});

// Skeleton component for loading states
const SidebarSkeleton = () => (
    <div className='p-4 space-y-4'>
        <Skeleton className='h-10 w-full rounded-md' />
        <div className='space-y-3'>
            {Array(5)
                .fill(0)
                .map((_, i) => (
                    <div key={i} className='flex items-center space-x-4'>
                        <Skeleton className='h-10 w-10 rounded-full' />
                        <div className='space-y-2 flex-1'>
                            <Skeleton className='h-4 w-3/4 rounded-md' />
                            <Skeleton className='h-3 w-full rounded-md' />
                        </div>
                    </div>
                ))}
        </div>
    </div>
);

export interface TChat {
    isArchived: boolean;
    membersCount: number;
    organization: string;
    otherUser?: any;
    latestMessage: {
        type: string;
        status: string;
        _id: string;
        activity?: any;
        sender: {
            profilePicture: string;
            lastName: string;
            type: string | undefined;
            _id: string;
            firstName: string;
            fullName: string;
        };
        text: string;
        chat: string;
        files: Array<any>;
        organization: string;
        parentMessage?: string;
        emoji: Array<any>;
        createdAt: string;
        updatedAt: string;
        id: number;
        __v: number;
    };
    isChannel: boolean;
    _id: string;
    description: string;
    isPublic: boolean;
    avatar?: string | undefined;
    name: string;
    isReadOnly: boolean;
    memberScope: string;
    unreadCount: number;
    myData: {
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
}

interface UserType {
    _id: string;
    firstName?: string;
    lastName?: string;
    profilePicture?: string;
}

/**
 * Sort chats by latest message timestamp
 */
const sortByLatestMessage = (data: any[]): any[] => {
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
};

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

interface ChatNavProps {
    reloading?: boolean;
}

const ChatNav: FC<ChatNavProps> = ({ reloading }) => {
    const fetchingMore = false;
    const params = useParams();
    const { user } = useAppSelector((state) => state.auth);
    console.log({ user });
    const router = useRouter();
    const { chats, onlineUsers, chatMessages } = useAppSelector(
        (state) => state.chat,
    );
    console.log({ chatMessages });
    // Replace direct API call with RTK mutation
    const [findOrCreateChat, { isLoading: isCreatingChat }] =
        useFindOrCreateChatMutation();
    const [hoveredChatId, setHoveredChatId] = useState<string | null>(null);
    const [records, setRecords] = useState<any[]>([]);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [active, setActive] = useState<string>('chats');
    const [displayCount, setDisplayCount] = useState<number>(10);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [createCrowdOpen, setCreateCrowdOpen] = useState<boolean>(false);

    const scrollContainerRef = useRef<HTMLDivElement | null>(null);
    console.log({ records });
    // Update records when chats change - now using RTK Query data
    useEffect(() => {
        if (chats && chats.length > 0) {
            setRecords(sortByLatestMessage(chats).slice(0, 20)); // Load initial chats
        }
    }, [chats]);
    // Handle scroll to load more chats
    const handleScroll = useCallback(() => {
        if (!scrollContainerRef.current) {
            return;
        }
        const { scrollTop, clientHeight, scrollHeight } =
            scrollContainerRef.current;
        if (scrollTop + clientHeight >= scrollHeight - 10) {
            // Near bottom
            fetchMoreData();
        }
    }, []);

    // Fetch more data when scrolling
    const fetchMoreData = useCallback(() => {
        if (records.length >= chats.length) {
            setHasMore(false);
            return;
        }
        const newRecords = sortByLatestMessage(chats).slice(
            0,
            records.length + 10,
        );
        setRecords(newRecords);
    }, [chats, records]);

    // Handle search input change
    const handleChangeSearch = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            setSearchQuery(value);

            if (value) {
                const filteredChats = chats.filter(
                    (c: any) =>
                        c?.name?.toLowerCase().includes(value.toLowerCase()) ||
                        `${c?.otherUser?.firstName || ''} ${c?.otherUser?.lastName || ''}`
                            .toLowerCase()
                            .includes(value.toLowerCase()),
                );
                setRecords(filteredChats);
            } else {
                setRecords(sortByLatestMessage(chats).slice(0, 10));
            }
        },
        [],
    );

    // Handle navigation click
    const handleNavClick = useCallback(() => {
        // Will be implemented with RTK
    }, []);

    // Handle create chat with RTK mutation
    const handleCreateChat = useCallback(
        (id: string) => {
            findOrCreateChat(id)
                .unwrap()
                .then((res) => {
                    router.push(`/chat/${res.chat._id}`);
                })
                .catch((err) => {
                    toast.error(err?.data?.error || 'Failed to create chat');
                });
        },
        [findOrCreateChat, router],
    );

    const loadMoreChats = useCallback(() => {
        const newRecords = sortByLatestMessage(chats).slice(
            0,
            records.length + 10,
        );
        setRecords(newRecords);
        if (newRecords.length >= chats.length) {
            setHasMore(false);
        }
    }, [chats, records]);

    // Add loading state handling
    // if (isChatsLoading && chats.length === 0) {
    //     return (
    //         <div className='w-full h-full flex items-center justify-center'>
    //             <div className='h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent'></div>
    //         </div>
    //     );
    // }
    return (
        <div className='chat-nav h-full'>
            <div className='flex flex-row h-full border-r'>
                {/* Side Navigation - Fixed */}
                <div className='lg:hidden 3xl:block bg-primary-light p-1 border border-primary h-[calc(100vh-60px)]'>
                    <SideNavigation active={active} setActive={setActive} />
                </div>

                {/* Chat List Container or Create Crowd Interface */}
                {createCrowdOpen ? (
                    <div className='w-[calc(100%-50px)] lg:w-full 3xl:w-[calc(100%-60px)] bg-foreground'>
                        <CreateCrowd
                            isOpen={createCrowdOpen}
                            onClose={() => setCreateCrowdOpen(false)}
                        />
                    </div>
                ) : (
                    <div className='w-[calc(100%-50px)] lg:w-full 3xl:w-[calc(100%-60px)] bg-foreground chat-list flex flex-col h-[calc(100vh-60px)]'>
                        {/* Header with title and actions - Fixed */}
                        <div className='flex items-center justify-between p-2'>
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
                                <GlobalTooltip
                                    tooltip='New Chat/Crowd'
                                    side='bottom'
                                >
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant='ghost'
                                                size='icon'
                                                className='text-dark-gray'
                                            >
                                                <Edit className='h-5 w-5 text-dark-gray' />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align='end'>
                                            <DropdownMenuLabel>
                                                Create New
                                            </DropdownMenuLabel>
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    setActive('search')
                                                }
                                                className='flex items-center gap-2'
                                            >
                                                <PenSquare className='h-4 w-4' />
                                                <span>New Chat</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    setCreateCrowdOpen(true)
                                                }
                                                className='flex items-center gap-2'
                                            >
                                                <UsersIcon className='h-4 w-4' />
                                                <span>New Crowd</span>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </GlobalTooltip>

                                {/* <Button variant='ghost' size='icon'>
                                    <MoreVertical className='h-5 w-5 text-gray-500' />
                                </Button> */}
                            </div>
                        </div>

                        {/* Chat list - Scrollable */}
                        <div
                            className='flex-1 overflow-y-auto h-[calc(100vh-140px)] px-2'
                            ref={scrollContainerRef}
                            onScroll={handleScroll}
                        >
                            {active === 'chats' || active === 'ai' ? (
                                <>
                                    {/* Search input - Fixed */}
                                    <div className='pb-2 border-b'>
                                        <div className='relative flex flex-row items-center gap-2'>
                                            <Input
                                                className='pl-8 bg-background'
                                                onChange={handleChangeSearch}
                                                value={searchQuery}
                                                type='search'
                                                placeholder='Search Chat...'
                                            />
                                            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray' />
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant='secondary'
                                                        size='icon'
                                                        className='bg-background w-10 min-w-10'
                                                    >
                                                        <SlidersHorizontal className='h-4 w-4 text-gray' />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent
                                                    align='end'
                                                    className='w-56'
                                                >
                                                    <DropdownMenuLabel>
                                                        Filter Chats
                                                    </DropdownMenuLabel>

                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            setActive('chats')
                                                        }
                                                        className='flex items-center gap-2'
                                                    >
                                                        <User className='h-4 w-4' />
                                                        <span>All Chats</span>
                                                    </DropdownMenuItem>

                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            setActive('crowds')
                                                        }
                                                        className='flex items-center gap-2'
                                                    >
                                                        <Users className='h-4 w-4' />
                                                        <span>Crowds</span>
                                                    </DropdownMenuItem>

                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            setActive('unread')
                                                        }
                                                        className='flex items-center gap-2'
                                                    >
                                                        <MessageSquareMore className='h-4 w-4' />
                                                        <span>
                                                            Unread Messages
                                                        </span>
                                                    </DropdownMenuItem>

                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            setActive(
                                                                'favourites',
                                                            )
                                                        }
                                                        className='flex items-center gap-2'
                                                    >
                                                        <Pin className='h-4 w-4' />
                                                        <span>Pinned</span>
                                                    </DropdownMenuItem>

                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            setActive('onlines')
                                                        }
                                                        className='flex items-center gap-2'
                                                    >
                                                        <UserCheck className='h-4 w-4' />
                                                        <span>
                                                            Online Users
                                                        </span>
                                                    </DropdownMenuItem>

                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            setActive(
                                                                'archived',
                                                            )
                                                        }
                                                        className='flex items-center gap-2'
                                                    >
                                                        <Archive className='h-4 w-4' />
                                                        <span>Archived</span>
                                                    </DropdownMenuItem>

                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            setActive('search')
                                                        }
                                                        className='flex items-center gap-2'
                                                    >
                                                        <Search className='h-4 w-4' />
                                                        <span>Search</span>
                                                    </DropdownMenuItem>

                                                    {process.env
                                                        .NEXT_PUBLIC_AI_BOT_ID && (
                                                        <DropdownMenuItem
                                                            onClick={() => {
                                                                setActive('ai');
                                                                handleCreateChat(
                                                                    process.env
                                                                        .NEXT_PUBLIC_AI_BOT_ID as string,
                                                                );
                                                            }}
                                                            className='flex items-center gap-2'
                                                        >
                                                            <Bot className='h-4 w-4' />
                                                            <span>AI Bot</span>
                                                        </DropdownMenuItem>
                                                    )}

                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            setActive('blocked')
                                                        }
                                                        className='flex items-center gap-2'
                                                    >
                                                        <UserMinus className='h-4 w-4' />
                                                        <span>
                                                            Blocked Users
                                                        </span>
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                    <div className='divide-y divide-gray-200 h-[calc(100vh-162px)] overflow-y-auto'>
                                        {sortByLatestMessage(records)?.map(
                                            (chat, i) => {
                                                const isActive =
                                                    params?.chatid ===
                                                    chat?._id;
                                                const hasUnread =
                                                    chat?.unreadCount > 0;

                                                const hasMention = (() => {
                                                    // If there are no unread messages, return false
                                                    if (
                                                        chat?.unreadCount === 0
                                                    ) {
                                                        return false;
                                                    }

                                                    const chatId = chat?._id;
                                                    const messages =
                                                        chatMessages[chatId] ||
                                                        [];
                                                    return messages.some(
                                                        (msg) => {
                                                            if (!msg.text) {
                                                                return false;
                                                            }

                                                            // Look for mention pattern: @[Name](userId)
                                                            const mentionRegex =
                                                                /@\[.*?\]\((.*?)\)/g;
                                                            let match;

                                                            while (
                                                                (match =
                                                                    mentionRegex.exec(
                                                                        msg.text,
                                                                    )) !== null
                                                            ) {
                                                                // match[1] contains the user ID in parentheses
                                                                if (
                                                                    match[1] ===
                                                                    user?._id
                                                                ) {
                                                                    return true;
                                                                }
                                                            }

                                                            return false;
                                                        },
                                                    );
                                                })();
                                                const isMuted =
                                                    chat?.myData?.notification
                                                        ?.isOn === false ||
                                                    i % 4 === 0;
                                                const isPinned =
                                                    chat?.myData?.isFavourite ||
                                                    i % 5 === 0;
                                                const isDelivered =
                                                    chat?.latestMessage?.sender
                                                        ?._id === user?._id &&
                                                    i % 2 === 0;
                                                const isRead =
                                                    chat?.latestMessage?.sender
                                                        ?._id === user?._id &&
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
                                                        onClick={handleNavClick}
                                                    >
                                                        <div className='flex items-start p-2 gap-2'>
                                                            {/* Avatar */}
                                                            <div className='relative flex-shrink-0'>
                                                                <Avatar className='h-10 w-10'>
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
                                                                                  'User'
                                                                        }
                                                                    />
                                                                    <AvatarFallback>
                                                                        {chat?.isChannel
                                                                            ? chat?.name?.charAt(
                                                                                  0,
                                                                              )
                                                                            : chat?.otherUser?.firstName?.charAt(
                                                                                  0,
                                                                              ) ||
                                                                              'U'}
                                                                    </AvatarFallback>
                                                                </Avatar>

                                                                {/* Online indicator */}
                                                                {chat?.isChannel ||
                                                                onlineUsers?.find(
                                                                    (x) =>
                                                                        x?._id ===
                                                                        chat
                                                                            ?.otherUser
                                                                            ?._id,
                                                                ) ? (
                                                                    <span className='absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white'></span>
                                                                ) : (
                                                                    <span className='absolute bottom-0 right-0 h-3 w-fit rounded-full bg-green-900 text-pure-white border border-green-500 text-[8px] px-1'>
                                                                        {chat
                                                                            ?.otherUser
                                                                            ?.lastActive &&
                                                                            (() => {
                                                                                const now =
                                                                                    dayjs();
                                                                                const active =
                                                                                    dayjs(
                                                                                        chat
                                                                                            ?.otherUser
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

                                                                                if (
                                                                                    diffSeconds <
                                                                                    60
                                                                                ) {
                                                                                    return `${diffSeconds}s`;
                                                                                }
                                                                                if (
                                                                                    diffMinutes <
                                                                                    60
                                                                                ) {
                                                                                    return `${diffMinutes}m`;
                                                                                }
                                                                                if (
                                                                                    diffHours <
                                                                                    24
                                                                                ) {
                                                                                    return `${diffHours}h`;
                                                                                }
                                                                                if (
                                                                                    diffDays <
                                                                                    30
                                                                                ) {
                                                                                    return `${diffDays}d`;
                                                                                }
                                                                                if (
                                                                                    diffMonths <
                                                                                    12
                                                                                ) {
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
                                                                        <span className='truncate'>
                                                                            {chat?.isChannel
                                                                                ? chat?.name
                                                                                : chat
                                                                                      ?.otherUser
                                                                                      ?.fullName ||
                                                                                  'User'}
                                                                            {chat
                                                                                ?.otherUser
                                                                                ?.type ===
                                                                                'verified' && (
                                                                                <CheckCircle2 className='inline h-3 w-3 ml-1 text-blue-500' />
                                                                            )}
                                                                        </span>
                                                                        {/* Pin icon */}
                                                                        {isPinned && (
                                                                            <Pin className='h-4 w-4 text-dark-gray rotate-45' />
                                                                        )}
                                                                    </div>
                                                                    <span className='text-xs text-gray-500 whitespace-nowrap'>
                                                                        {formatDate(
                                                                            chat
                                                                                ?.latestMessage
                                                                                ?.createdAt,
                                                                        )}
                                                                    </span>
                                                                </div>

                                                                {/* Message preview */}
                                                                <div className='flex justify-between items-center mt-1'>
                                                                    <div className='flex items-center gap-1 flex-1 w-[calc(100%-50px)]'>
                                                                        {/* Message status for sent messages */}
                                                                        {chat
                                                                            ?.latestMessage
                                                                            ?.sender
                                                                            ?._id ===
                                                                            user?._id && (
                                                                            <>
                                                                                {isRead ? (
                                                                                    <CheckCheck className='h-3 w-3 text-blue-500 flex-shrink-0' />
                                                                                ) : isDelivered ? (
                                                                                    <CheckCheck className='h-3 w-3 text-gray flex-shrink-0' />
                                                                                ) : (
                                                                                    <Check className='h-3 w-3 text-gray flex-shrink-0' />
                                                                                )}
                                                                            </>
                                                                        )}

                                                                        <p className='text-xs text-gray-500 truncate max-w-[80%]'>
                                                                            {chat
                                                                                ?.latestMessage
                                                                                ?.type ===
                                                                            'activity' ? (
                                                                                <span className='italic'>
                                                                                    Activity
                                                                                    message
                                                                                </span>
                                                                            ) : chat
                                                                                  ?.latestMessage
                                                                                  ?.type ===
                                                                              'delete' ? (
                                                                                <span className='italic'>
                                                                                    Message
                                                                                    deleted
                                                                                </span>
                                                                            ) : chat
                                                                                  ?.latestMessage
                                                                                  ?.files
                                                                                  ?.length >
                                                                              0 ? (
                                                                                <span>
                                                                                    {chat
                                                                                        ?.latestMessage
                                                                                        ?.sender
                                                                                        ?._id !==
                                                                                    user?._id
                                                                                        ? '• '
                                                                                        : ''}
                                                                                    Sent
                                                                                    a
                                                                                    file
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
                                                                            <BellOff className='h-4 w-4 text-gray' />
                                                                        )}

                                                                        {/* Unread indicator */}
                                                                        {hasUnread &&
                                                                            chat
                                                                                ?.latestMessage
                                                                                ?.sender
                                                                                ?._id !==
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
                                                    </Link>
                                                );
                                            },
                                        )}

                                        {records.length === 0 && (
                                            <div className='p-4 text-center text-gray-500'>
                                                No conversations found
                                            </div>
                                        )}

                                        {hasMore && fetchingMore && (
                                            <div className='p-4 text-center'>
                                                <Skeleton className='h-10 w-10 rounded-full mx-auto' />
                                            </div>
                                        )}

                                        {records.length > 0 && (
                                            <div className='p-2 text-center flex flex-row items-center gap-1'>
                                                <div className='w-full h-[2px] bg-border'></div>
                                                <Button
                                                    variant='primary_light'
                                                    size='sm'
                                                    className='text-xs rounded-3xl text-primary'
                                                    onClick={loadMoreChats}
                                                >
                                                    View More{' '}
                                                    <ChevronDown
                                                        size={16}
                                                        className='text-gray'
                                                    />
                                                </Button>
                                                <div className='w-full h-[2px] bg-border'></div>
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <Suspense fallback={<SidebarSkeleton />}>
                                    {active === 'crowds' ? (
                                        <CrowdSidebar />
                                    ) : active === 'favourites' ? (
                                        <FavouriteSidebar />
                                    ) : active === 'onlines' ? (
                                        <OnlineSidebar />
                                    ) : active === 'search' ? (
                                        <SearchSidebar />
                                    ) : active === 'readOnly' ? (
                                        <ReadOnly />
                                    ) : active === 'unread' ? (
                                        <UnRead />
                                    ) : active === 'blocked' ? (
                                        <BlockedUser />
                                    ) : active === 'archived' ? (
                                        <Archived />
                                    ) : (
                                        <></>
                                    )}
                                </Suspense>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatNav;
