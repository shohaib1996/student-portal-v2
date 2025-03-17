'use client';

import type React from 'react';
import { useEffect, useRef, useState, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'next/navigation';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import dynamic from 'next/dynamic';
import Image from 'next/image';

// Initialize dayjs plugins
dayjs.extend(relativeTime);
dayjs.extend(isSameOrBefore);

// Redux actions
// import { loadChats } from '../../action/initialActions';
// import { setCurrentPage } from '../../store/reducer/chatReducer';

// Utilities
import { getText } from '@/helper/utilities';

// ShadCN UI components
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

// Lucide Icons
import {
    Search,
    User,
    Users,
    Pin,
    UserSearch,
    Star,
    Bot,
    Eye,
    Archive,
    Lock,
    MessageSquareMore,
    Filter,
} from 'lucide-react';

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

interface Chat {
    _id: string;
    isChannel: boolean;
    isArchived?: boolean;
    isPublic?: boolean;
    name?: string;
    avatar?: string;
    unreadCount: number;
    myData?: {
        isBlocked: boolean;
    };
    otherUser?: {
        _id: string;
        type?: string;
        firstName?: string;
        lastName?: string;
        fullName?: string;
        profilePicture?: string;
    };
    latestMessage?: {
        _id?: string;
        createdAt?: string;
        type?: string;
        text?: string;
        files?: Array<{
            type?: string;
        }>;
        emoji?: Array<{
            symbol: string;
        }>;
        sender?: {
            _id: string;
            firstName?: string;
            fullName?: string;
        };
        activity?: {
            type: string;
            user: {
                fullName: string;
            };
        };
    };
    typingData?: {
        isTyping: boolean;
        user?: {
            firstName: string;
        };
    };
}

interface UserType {
    _id: string;
    firstName?: string;
    lastName?: string;
    profilePicture?: string;
}

interface RootState {
    chat: {
        chats: Chat[];
        onlineUsers: UserType[];
        fetchingMore: boolean;
        drafts: Array<{
            chat: string;
            message: string;
        }>;
    };
    auth: {
        user: UserType;
    };
    theme: {
        displayMode: string;
    };
}

/**
 * Sort chats by latest message timestamp
 */
const sortByLatestMessage = (data: Chat[]): Chat[] => {
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
        return dateObj.format('MM/DD/YY');
    } else {
        return 'N/A';
    }
};

/**
 * Generate text for activity messages
 */
const generateActivityText = (message: Chat['latestMessage']) => {
    if (!message || !message.activity) {
        return <>N/A</>;
    }

    const activity = message.activity;
    if (activity?.type === 'add') {
        return (
            <div className='flex flex-row gap-1'>
                <>{message.sender?.fullName}</> <span>added</span>{' '}
                <>{message.activity?.user?.fullName}</>{' '}
            </div>
        );
    } else if (activity?.type === 'remove') {
        return (
            <>
                <>{message.sender?.fullName}</> <strong>removed</strong>{' '}
                <>{message.activity?.user?.fullName}</>{' '}
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

const ChatNav: React.FC = () => {
    const { chats, onlineUsers, fetchingMore, drafts } = useSelector(
        (state: RootState) => state.chat,
    );
    const { user } = useSelector((state: RootState) => state.auth);
    const { displayMode } = useSelector((state: RootState) => state.theme);

    const [hoveredChatId, setHoveredChatId] = useState<string | null>(null);
    const [records, setRecords] = useState<Chat[]>([]);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [active, setActive] = useState<string>('chats');
    const [displayCount, setDisplayCount] = useState<number>(10);

    const lastScrollTop = useRef<number>(0);
    const scrollContainerRef = useRef<HTMLDivElement | null>(null);
    const params = useParams();
    const dispatch = useDispatch();

    // Load chats on component mount
    useEffect(() => {
        // dispatch(loadChats());
    }, [dispatch]);

    // Update records when chats change
    useEffect(() => {
        setRecords(sortByLatestMessage(chats).slice(0, 10)); // Load initial chats
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
            if (e.target.value) {
                const filteredChats = chats.filter(
                    (c: Chat) =>
                        c?.name
                            ?.toLowerCase()
                            .includes(e.target.value.toLowerCase()) ||
                        `${c?.otherUser?.firstName || ''} ${c?.otherUser?.lastName || ''}`
                            .toLowerCase()
                            .includes(e.target.value.toLowerCase()),
                );
                setRecords(filteredChats);
            } else {
                setRecords(chats);
            }
        },
        [chats],
    );

    // Handle load more button click
    const handleLoadMore = useCallback(() => {
        setDisplayCount((prevDisplayCount) => prevDisplayCount + 10);
    }, []);

    // Handle navigation click
    const handleNavClick = useCallback(() => {
        // dispatch(setCurrentPage(1));
    }, [dispatch]);

    return (
        <div className='chat-nav'>
            <div
                className={`chat-sidebar ${displayMode === 'dark' ? 'bg-gray-900' : 'bg-white'}`}
            >
                <div className='first-bar'>
                    <SideNavigation active={active} setActive={setActive} />
                </div>
                <div className='second-bar bg-white dark:bg-gray-800'>
                    <Link href='/dashboard/my-profile' className='nav-header'>
                        <div>
                            <div className='relative'>
                                <Image
                                    width={50}
                                    height={50}
                                    src={
                                        user?.profilePicture ||
                                        '/placeholder.svg'
                                    }
                                    alt={user?.firstName || 'User'}
                                    className='rounded-full'
                                />
                                <div className='absolute bottom-0 right-0'>
                                    <div className='relative'>
                                        <span className='flex h-3 w-3'>
                                            <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75'></span>
                                            <span className='relative inline-flex rounded-full h-3 w-3 bg-green-500'></span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='name-title'>
                            <h4 className='text-gray-900 dark:text-gray-100'>
                                {user?.firstName} {user?.lastName}
                            </h4>
                            <span className='text-gray-500 dark:text-gray-400'>
                                Available
                            </span>
                        </div>
                    </Link>
                    <div className='nav-inner'>
                        {active === 'chats' || active === 'ai' ? (
                            <>
                                <div className='filter-group'>
                                    <div className='relative'>
                                        <Input
                                            className='search-input bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                                            onChange={handleChangeSearch}
                                            type='search'
                                            placeholder='Search Chat'
                                        />
                                        <span className='absolute right-3 top-1/2 transform -translate-y-1/2'>
                                            <Search className='h-4 w-4 text-muted-foreground' />
                                        </span>
                                    </div>

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button className='btn-fill filter-btn flex items-center gap-2 btn-primary'>
                                                <Filter className='h-4 w-4' />
                                                Filters
                                            </Button>
                                        </DropdownMenuTrigger>

                                        <DropdownMenuContent className='w-56'>
                                            <DropdownMenuLabel
                                                className={`text-base ${displayMode === 'dark' ? 'text-white' : ''}`}
                                            >
                                                Application
                                            </DropdownMenuLabel>
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    setActive('chats')
                                                }
                                                className={`${displayMode === 'dark' ? 'text-gray-300' : ''}`}
                                            >
                                                <User className='mr-2 h-4 w-4' />
                                                <span>All</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    setActive('unread')
                                                }
                                                className={`${displayMode === 'dark' ? 'text-gray-300' : ''}`}
                                            >
                                                <MessageSquareMore className='mr-2 h-4 w-4' />
                                                <span>Unread</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    setActive('readOnly')
                                                }
                                                className={`${displayMode === 'dark' ? 'text-gray-300' : ''}`}
                                            >
                                                <Eye className='mr-2 h-4 w-4' />
                                                <span>Read Only</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    setActive('archived')
                                                }
                                                className={`${displayMode === 'dark' ? 'text-gray-300' : ''}`}
                                            >
                                                <Archive className='mr-2 h-4 w-4' />
                                                <span>Archived</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    setActive('crowds')
                                                }
                                                className={`${displayMode === 'dark' ? 'text-gray-300' : ''}`}
                                            >
                                                <Users className='mr-2 h-4 w-4' />
                                                <span>Crowds</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    setActive('favourites')
                                                }
                                                className={`${displayMode === 'dark' ? 'text-gray-300' : ''}`}
                                            >
                                                <Pin className='mr-2 h-4 w-4' />
                                                <span>Pinned</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    setActive('onlines')
                                                }
                                                className={`${displayMode === 'dark' ? 'text-gray-300' : ''}`}
                                            >
                                                <Star className='mr-2 h-4 w-4' />
                                                <span>Onlines</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    setActive('search')
                                                }
                                                className={`${displayMode === 'dark' ? 'text-gray-300' : ''}`}
                                            >
                                                <UserSearch className='mr-2 h-4 w-4' />
                                                <span>Search</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => setActive('ai')}
                                                className={`${displayMode === 'dark' ? 'text-gray-300' : ''}`}
                                            >
                                                <Bot className='mr-2 h-4 w-4' />
                                                <span>AI Bot</span>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <div
                                    className='nav-body'
                                    ref={scrollContainerRef}
                                    onScroll={handleScroll}
                                    style={{ maxHeight: '100vh' }}
                                >
                                    <div className='scrollbar-container'>
                                        <ul className='list-group'>
                                            {sortByLatestMessage(records)?.map(
                                                (chat, i) => {
                                                    const draft = drafts?.find(
                                                        (f) =>
                                                            f.chat ===
                                                            chat?._id,
                                                    );
                                                    return (
                                                        <div
                                                            key={i}
                                                            style={{
                                                                pointerEvents:
                                                                    fetchingMore
                                                                        ? 'none'
                                                                        : 'auto',
                                                            }}
                                                            onClick={
                                                                handleNavClick
                                                            }
                                                        >
                                                            <Link
                                                                href={`${chat?.isArchived ? '/chat' : `/chat/${chat?._id}`}`}
                                                                style={{
                                                                    display:
                                                                        chat?.isArchived
                                                                            ? 'none'
                                                                            : 'block',
                                                                }}
                                                            >
                                                                <li
                                                                    className={`list-group-item border-b border-gray-200 dark:border-gray-700 
                                  ${
                                      params?.chatid === chat?._id
                                          ? 'bg-gray-100 dark:bg-gray-800'
                                          : hoveredChatId === chat?._id
                                            ? 'bg-gray-50 dark:bg-gray-800/50'
                                            : ''
                                  }
                                  ${params?.chatid === chat?._id && (displayMode === 'dark' ? 'darkActive' : 'active')}
                                  ${chat?.unreadCount > 0 ? 'new-msg' : ''}`}
                                                                    onMouseEnter={() =>
                                                                        setHoveredChatId(
                                                                            chat?._id,
                                                                        )
                                                                    }
                                                                    onMouseLeave={() =>
                                                                        setHoveredChatId(
                                                                            null,
                                                                        )
                                                                    }
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
                                                                                          ) ||
                                                                                          'U'}
                                                                                </AvatarFallback>
                                                                            </Avatar>
                                                                            <span
                                                                                className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
                                                                                    chat?.isChannel
                                                                                        ? 'bg-green-500'
                                                                                        : onlineUsers?.find(
                                                                                                (
                                                                                                    x,
                                                                                                ) =>
                                                                                                    x?._id ===
                                                                                                    chat
                                                                                                        ?.otherUser
                                                                                                        ?._id,
                                                                                            )
                                                                                          ? 'bg-green-500'
                                                                                          : 'bg-gray-500'
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
                                                                                    : chat
                                                                                          ?.otherUser
                                                                                          ?.fullName ||
                                                                                      'TS4U User (deleted)'}
                                                                            </p>
                                                                            <small className='time text-gray-500 dark:text-gray-400'>
                                                                                {formatDate(
                                                                                    chat
                                                                                        ?.latestMessage
                                                                                        ?.createdAt,
                                                                                )}
                                                                            </small>
                                                                        </div>
                                                                        <div className='message_preview'>
                                                                            <p className='text-gray-600 dark:text-gray-300'>
                                                                                {chat
                                                                                    ?.myData
                                                                                    ?.isBlocked ? (
                                                                                    <Badge variant='destructive'>
                                                                                        Blocked
                                                                                    </Badge>
                                                                                ) : chat
                                                                                      ?.typingData
                                                                                      ?.isTyping ? (
                                                                                    <p className='text-green-500'>
                                                                                        {
                                                                                            chat
                                                                                                ?.typingData
                                                                                                ?.user
                                                                                                ?.firstName
                                                                                        }{' '}
                                                                                        is
                                                                                        typing...
                                                                                    </p>
                                                                                ) : !chat
                                                                                      .latestMessage
                                                                                      ?._id ? (
                                                                                    <>
                                                                                        New
                                                                                        chat
                                                                                    </>
                                                                                ) : chat
                                                                                      .latestMessage
                                                                                      ?.type ===
                                                                                  'activity' ? (
                                                                                    generateActivityText(
                                                                                        chat.latestMessage,
                                                                                    )
                                                                                ) : chat
                                                                                      .latestMessage
                                                                                      .type ===
                                                                                  'delete' ? (
                                                                                    <span>
                                                                                        this
                                                                                        message
                                                                                        was
                                                                                        deleted
                                                                                    </span>
                                                                                ) : (
                                                                                    <>
                                                                                        {draft &&
                                                                                        params?.chatid !==
                                                                                            chat._id ? (
                                                                                            <span className='text text-primary font-medium'>
                                                                                                Draft:{' '}
                                                                                                {
                                                                                                    draft?.message
                                                                                                }
                                                                                            </span>
                                                                                        ) : (
                                                                                            <span className='text text-gray-600 dark:text-gray-300'>
                                                                                                {chat
                                                                                                    ?.latestMessage
                                                                                                    ?.files &&
                                                                                                chat
                                                                                                    .latestMessage
                                                                                                    .files
                                                                                                    .length >
                                                                                                    0 ? (
                                                                                                    chat
                                                                                                        .latestMessage
                                                                                                        .files
                                                                                                        .length >
                                                                                                    1 ? (
                                                                                                        `Documents`
                                                                                                    ) : chat.latestMessage.files[0]?.type?.split(
                                                                                                          '/',
                                                                                                      )[0] ===
                                                                                                      'audio' ? (
                                                                                                        `${
                                                                                                            chat
                                                                                                                .latestMessage
                                                                                                                .sender
                                                                                                                ?._id !==
                                                                                                            user?._id
                                                                                                                ? chat
                                                                                                                      .latestMessage
                                                                                                                      .sender
                                                                                                                      ?.firstName +
                                                                                                                  ': Sent audio'
                                                                                                                : 'You: Sent audio'
                                                                                                        } `
                                                                                                    ) : chat.latestMessage.files[0]?.type?.split(
                                                                                                          '/',
                                                                                                      )[0] ===
                                                                                                      'video' ? (
                                                                                                        `${
                                                                                                            chat
                                                                                                                .latestMessage
                                                                                                                .sender
                                                                                                                ?._id !==
                                                                                                            user?._id
                                                                                                                ? chat
                                                                                                                      .latestMessage
                                                                                                                      .sender
                                                                                                                      ?.firstName +
                                                                                                                  ': Sent video'
                                                                                                                : 'You: Sent video'
                                                                                                        } `
                                                                                                    ) : chat.latestMessage.files[0]?.type?.split(
                                                                                                          '/',
                                                                                                      )[0] ===
                                                                                                      'image' ? (
                                                                                                        `${
                                                                                                            chat
                                                                                                                .latestMessage
                                                                                                                .sender
                                                                                                                ?._id !==
                                                                                                            user?._id
                                                                                                                ? chat
                                                                                                                      .latestMessage
                                                                                                                      .sender
                                                                                                                      ?.firstName +
                                                                                                                  ': Sent image'
                                                                                                                : 'You: Sent image'
                                                                                                        } `
                                                                                                    ) : (
                                                                                                        'Document'
                                                                                                    )
                                                                                                ) : (chat
                                                                                                      .latestMessage
                                                                                                      .emoji
                                                                                                      ?.length ??
                                                                                                  0 >
                                                                                                      0) ? (
                                                                                                    chat.latestMessage.emoji?.map(
                                                                                                        (
                                                                                                            x,
                                                                                                        ) => (
                                                                                                            <span
                                                                                                                key={
                                                                                                                    x.symbol
                                                                                                                }
                                                                                                                className='text-gray-600 dark:text-gray-300'
                                                                                                            >
                                                                                                                {' '}
                                                                                                                {chat.latestMessage &&
                                                                                                                chat
                                                                                                                    .latestMessage
                                                                                                                    .sender
                                                                                                                    ?._id !==
                                                                                                                    user?._id
                                                                                                                    ? chat
                                                                                                                          .latestMessage
                                                                                                                          .sender
                                                                                                                          ?.firstName +
                                                                                                                      ':'
                                                                                                                    : 'You:'}{' '}
                                                                                                                Sent
                                                                                                                a{' '}
                                                                                                                {
                                                                                                                    x?.symbol
                                                                                                                }{' '}
                                                                                                                reaction
                                                                                                            </span>
                                                                                                        ),
                                                                                                    )
                                                                                                ) : (
                                                                                                    <div>
                                                                                                        <MessagePreview
                                                                                                            text={`${
                                                                                                                chat
                                                                                                                    .latestMessage
                                                                                                                    .sender
                                                                                                                    ?._id !==
                                                                                                                user?._id
                                                                                                                    ? chat
                                                                                                                          .latestMessage
                                                                                                                          .sender
                                                                                                                          ?.firstName
                                                                                                                    : 'You'
                                                                                                            }:
                                                ${
                                                    chat.latestMessage.type ===
                                                    'delete'
                                                        ? 'Delete message'
                                                        : getText(
                                                              chat
                                                                  ?.latestMessage
                                                                  ?.text,
                                                          )
                                                }`}
                                                                                                        />
                                                                                                    </div>
                                                                                                )}
                                                                                            </span>
                                                                                        )}
                                                                                    </>
                                                                                )}
                                                                            </p>
                                                                            {chat?.unreadCount >
                                                                                0 &&
                                                                                chat?.unreadCount !==
                                                                                    0 &&
                                                                                chat?.isArchived ===
                                                                                    false &&
                                                                                chat
                                                                                    ?.latestMessage
                                                                                    ?.sender
                                                                                    ?._id !==
                                                                                    user?._id && (
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
                                                        </div>
                                                    );
                                                },
                                            )}

                                            {/* Load more button - commented out but preserved
                      {displayCount < records.length ? (
                        <Button variant="ghost" className="load_more_button w-full" onClick={handleLoadMore}>
                          <RotateCw className="h-4 w-4 mr-2" />
                          Load More
                        </Button>
                      ) : (
                        <Button variant="ghost" className="load_more_button w-full" onClick={() => {setDisplayCount(10)}}>
                          <RotateCw className="h-4 w-4 mr-2" />
                          Load Less
                        </Button>
                      )} */}

                                            {/* Loading indicator - commented out but preserved
                      {hasMore && 
                        <div className="py-2 text-center text-gray-500">Loading more...</div>
                      } */}
                                        </ul>
                                    </div>
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
            </div>
        </div>
    );
};

export default ChatNav;
