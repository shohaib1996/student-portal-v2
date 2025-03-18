'use client';

import type React from 'react';
import { useEffect, useRef, useState, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useDispatch } from 'react-redux';
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from '@/components/ui/dialog';
import GlobalTooltip from '../global/GlobalTooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import onlineUsers from './onlineUsers.json';
import drafts from './drafts.json';

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
} from 'lucide-react';
import { useAppSelector } from '@/redux/hooks';
import chats from './chats.json';

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
    loading: () => <div className='p-4 text-center'>Loading...</div>,
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

interface RootState {
    chat: {
        chats: any[];
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

const ChatNav: React.FC<ChatNavProps> = ({ reloading }) => {
    const fetchingMore = false;
    const { user } = useAppSelector((state: any) => state.auth);
    const router = useRouter();

    const [hoveredChatId, setHoveredChatId] = useState<string | null>(null);
    const [records, setRecords] = useState<any[]>([]);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [active, setActive] = useState<string>('chats');
    const [displayCount, setDisplayCount] = useState<number>(10);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [createCrowdOpen, setCreateCrowdOpen] = useState<boolean>(false);

    const scrollContainerRef = useRef<HTMLDivElement | null>(null);
    const params = useParams();
    const dispatch = useDispatch();

    // Update records when chats change
    useEffect(() => {
        if (chats.length > 0) {
            setRecords(sortByLatestMessage(chats).slice(0, 10)); // Load initial chats
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
        [chats],
    );

    // Handle navigation click
    const handleNavClick = useCallback(() => {
        // dispatch(setCurrentPage(1));
    }, [dispatch]);

    // Handle create chat
    const handleCreateChat = useCallback(
        (id: string) => {
            instance
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

    return (
        <div className='chat-nav h-full'>
            <div className='flex flex-row gap-2 h-full'>
                {/* Side Navigation - Fixed */}
                <div className='bg-primary-light p-2 border border-primary  h-[calc(100vh-60px)]'>
                    <SideNavigation active={active} setActive={setActive} />
                </div>

                {/* Chat List Container - Fixed layout with scrollable content */}
                <div className='w-full bg-background chat-list flex flex-col  h-[calc(100vh-60px)]'>
                    {/* Header with title and actions - Fixed */}
                    <div className='flex items-center justify-between py-2'>
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
                                            className='text-gray-500 hover:bg-blue-50'
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

                            <Button variant='ghost' size='icon'>
                                <MoreVertical className='h-5 w-5 text-gray-500' />
                            </Button>
                        </div>
                    </div>

                    {/* Chat list - Scrollable */}
                    <div
                        className='flex-1 overflow-y-auto  h-[calc(100vh-140px)]'
                        ref={scrollContainerRef}
                        onScroll={handleScroll}
                    >
                        {active === 'chats' || active === 'ai' ? (
                            <>
                                {' '}
                                {/* Search input - Fixed */}
                                <div className='pb-2 border-b'>
                                    <div className='relative flex flex-row items-center gap-2'>
                                        <Input
                                            className='pl-10 bg-foreground'
                                            onChange={handleChangeSearch}
                                            value={searchQuery}
                                            type='search'
                                            placeholder='Search Chat...'
                                        />
                                        <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray' />
                                        <Button
                                            variant='secondary'
                                            size='icon'
                                            className=''
                                        >
                                            <SlidersHorizontal className='h-4 w-4 text-gray' />
                                        </Button>
                                    </div>
                                </div>
                                <div className='divide-y divide-gray-200 h-[calc(100vh - 200px) overflow-y-auto]'>
                                    {sortByLatestMessage(records)?.map(
                                        (chat, i) => {
                                            const draft = (drafts as any)?.find(
                                                (f: any) =>
                                                    f.chat === chat?._id,
                                            );

                                            const isActive =
                                                params?.chatid === chat?._id;
                                            const hasUnread =
                                                chat?.unreadCount > 0;

                                            // For demo purposes - in real app, these would come from the chat data
                                            const hasMention = i % 3 === 0;
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
                                                    <div className='flex items-start p-4 gap-3'>
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
                                                                <div className='flex items-center gap-1 flex-1 w-full'>
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
                                                                                <CheckCheck className='h-3 w-3 text-gray-400 flex-shrink-0' />
                                                                            ) : (
                                                                                <Check className='h-3 w-3 text-gray-400 flex-shrink-0' />
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
                                                                        <BellOff className='h-4 w-4 text-gray-400' />
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
                                        <div className='p-2 text-center'>
                                            <Button
                                                variant='ghost'
                                                size='sm'
                                                className='text-xs text-primary'
                                            >
                                                View More
                                            </Button>
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
            </div>

            {/* Create Crowd Modal */}
            <Dialog open={createCrowdOpen} onOpenChange={setCreateCrowdOpen}>
                <DialogContent className='sm:max-w-md'>
                    <DialogHeader>
                        <DialogTitle>Create New Crowd</DialogTitle>
                        <DialogDescription>
                            Create a new group for team collaboration
                        </DialogDescription>
                    </DialogHeader>

                    <Tabs defaultValue='public' className='w-full'>
                        <TabsList className='grid w-full grid-cols-2'>
                            <TabsTrigger value='public'>Public</TabsTrigger>
                            <TabsTrigger value='private'>Private</TabsTrigger>
                        </TabsList>

                        <TabsContent value='public' className='mt-4'>
                            <div className='space-y-4'>
                                <div className='space-y-2'>
                                    <label
                                        htmlFor='crowd-name'
                                        className='text-sm font-medium'
                                    >
                                        Crowd Name
                                    </label>
                                    <Input
                                        id='crowd-name'
                                        placeholder='Enter crowd name'
                                    />
                                </div>
                                <div className='space-y-2'>
                                    <label
                                        htmlFor='crowd-description'
                                        className='text-sm font-medium'
                                    >
                                        Description
                                    </label>
                                    <Input
                                        id='crowd-description'
                                        placeholder='Describe this crowd'
                                    />
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value='private' className='mt-4'>
                            <div className='space-y-4'>
                                <div className='space-y-2'>
                                    <label
                                        htmlFor='private-crowd-name'
                                        className='text-sm font-medium'
                                    >
                                        Crowd Name
                                    </label>
                                    <Input
                                        id='private-crowd-name'
                                        placeholder='Enter crowd name'
                                    />
                                </div>
                                <div className='space-y-2'>
                                    <label
                                        htmlFor='private-crowd-description'
                                        className='text-sm font-medium'
                                    >
                                        Description
                                    </label>
                                    <Input
                                        id='private-crowd-description'
                                        placeholder='Describe this crowd'
                                    />
                                </div>
                                <div className='space-y-2'>
                                    <label className='text-sm font-medium'>
                                        Privacy
                                    </label>
                                    <p className='text-xs text-gray-500'>
                                        This crowd will be private and members
                                        can only join by invitation.
                                    </p>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>

                    <DialogFooter className='mt-4'>
                        <Button
                            variant='outline'
                            onClick={() => setCreateCrowdOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button type='submit'>Create Crowd</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ChatNav;
