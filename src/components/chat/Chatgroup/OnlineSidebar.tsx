'use client';

import type React from 'react';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

// ShadCN UI components
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Lucide Icons
import {
    Search,
    Loader2,
    MessageCircle,
    ChevronDown,
    Pin,
    BellOff,
    Check,
    CheckCheck,
} from 'lucide-react';
import { useAppSelector } from '@/redux/hooks';
import { instance } from '@/lib/axios/axiosInstance';
import { useGetOnlineUsersQuery } from '@/redux/api/chats/chatApi';
import { ChatSkeletonList } from '../chat-skeleton';
import { renderPlainText } from '@/components/lexicalEditor/renderer/renderPlainText';

// Initialize dayjs plugins
dayjs.extend(relativeTime);

// Skeleton component for UserCard
function UserCardSkeleton() {
    return (
        <div className='flex items-center justify-between p-2 border-b border-gray-200 dark:border-gray-700'>
            <div className='flex items-center space-x-3'>
                <Skeleton className='h-10 w-10 rounded-full' />
                <div className='space-y-1'>
                    <Skeleton className='h-3 w-[150px]' />
                    <Skeleton className='h-3 w-[100px]' />
                </div>
            </div>
            <Skeleton className='h-8 w-8 rounded-full' />
        </div>
    );
}

function OnlineSidebar() {
    const { user } = useAppSelector((state) => state.auth);
    const { chats } = useAppSelector((state) => state.chat);
    const router = useRouter();

    const { data: onlineUsers } = useGetOnlineUsersQuery();
    const [filteredOnlineUsers, setFilteredOnlineUsers] = useState<any[]>([]);
    const [filteredChats, setFilteredChats] = useState<any[]>([]);
    const [allRecentChats, setAllRecentChats] = useState<any[]>([]);
    const [allOnlineUsers, setAllOnlineUsers] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [activeTab, setActiveTab] = useState<string>('online');
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
    const [onlineLimit, setOnlineLimit] = useState<number>(20);
    const [chatLimit, setChatLimit] = useState<number>(20);

    useEffect(() => {
        try {
            // Make sure we have the online users data
            if (onlineUsers && onlineUsers.length > 0) {
                // Filter out current user
                const filteredUsers = onlineUsers.filter(
                    (u) => u?._id !== user?._id,
                );
                setAllOnlineUsers(filteredUsers);
                setFilteredOnlineUsers(filteredUsers.slice(0, onlineLimit));
            } else {
                setAllOnlineUsers([]);
                setFilteredOnlineUsers([]);
            }

            // Get chats sorted by latest message
            if (chats && chats.length > 0) {
                const sortedChats = [...chats].sort((a, b) => {
                    const dateA = a.latestMessage?.createdAt
                        ? new Date(a.latestMessage.createdAt).getTime()
                        : 0;
                    const dateB = b.latestMessage?.createdAt
                        ? new Date(b.latestMessage.createdAt).getTime()
                        : 0;
                    return dateB - dateA;
                });
                setAllRecentChats(sortedChats);
                setFilteredChats(sortedChats.slice(0, chatLimit));
            }
        } catch (error) {
            console.error('Error setting initial data:', error);
            toast.error('Failed to load data');
        } finally {
            setIsLoading(false);
        }
    }, [onlineUsers, chats, user?._id, onlineLimit, chatLimit]);

    // Handle search functionality
    const handleChangeSearch = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            try {
                const value = e.target.value;
                setSearchQuery(value);

                if (value) {
                    // Filter online users
                    if (allOnlineUsers.length > 0) {
                        const filteredUsers = allOnlineUsers.filter(
                            (user) =>
                                user._id !== user?._id &&
                                ((user.fullName &&
                                    user.fullName
                                        .toLowerCase()
                                        .includes(value.toLowerCase())) ||
                                    (user.firstName &&
                                        user.firstName
                                            .toLowerCase()
                                            .includes(value.toLowerCase())) ||
                                    (user.lastName &&
                                        user.lastName
                                            .toLowerCase()
                                            .includes(value.toLowerCase()))),
                        );
                        setFilteredOnlineUsers(
                            filteredUsers.slice(0, onlineLimit),
                        );
                    }

                    // Filter chats
                    if (allRecentChats.length > 0) {
                        const filteredChats = allRecentChats
                            .filter((chat) => {
                                if (chat.isChannel) {
                                    return (chat?.name ?? '')
                                        .toLowerCase()
                                        .includes(value.toLowerCase());
                                } else {
                                    return (
                                        (chat.otherUser?.fullName &&
                                            chat.otherUser.fullName
                                                .toLowerCase()
                                                .includes(
                                                    value.toLowerCase(),
                                                )) ||
                                        (chat.otherUser?.firstName &&
                                            chat.otherUser.firstName
                                                .toLowerCase()
                                                .includes(
                                                    value.toLowerCase(),
                                                )) ||
                                        (chat.otherUser?.lastName &&
                                            chat.otherUser.lastName
                                                .toLowerCase()
                                                .includes(value.toLowerCase()))
                                    );
                                }
                            })
                            .slice(0, chatLimit);
                        setFilteredChats(filteredChats);
                    }
                } else {
                    // Reset to original data with limits
                    setFilteredOnlineUsers(
                        allOnlineUsers.slice(0, onlineLimit),
                    );
                    setFilteredChats(allRecentChats.slice(0, chatLimit));
                }
            } catch (error) {
                console.error('Error filtering data:', error);
                toast.error('Failed to filter data');
            }
        },
        [allOnlineUsers, allRecentChats, user?._id, onlineLimit, chatLimit],
    );

    // Handle creating a new chat with a user
    const handleCreateChat = useCallback(
        (id: string) => {
            setSelectedUserId(id);
            instance
                .post(`/chat/findorcreate/${id}`)
                .then((res) => {
                    router.push(`/chat/${res.data.chat._id}`);
                })
                .catch((err) => {
                    setSelectedUserId(null);
                    toast.error(
                        err?.response?.data?.error || 'Failed to create chat',
                    );
                });
        },
        [router],
    );

    // Handle navigating to an existing chat
    const handleNavigateToChat = useCallback(
        (chatId: string) => {
            setSelectedChatId(chatId);
            router.push(`/chat/${chatId}?tab=onlines`);
        },
        [router],
    );

    // Format message preview text
    const formatMessagePreview = (text: string) => {
        if (!text) {
            return '';
        }
        // Remove markdown links
        const withoutLinks = text.replace(/\[([^\]]+)\]$$[^)]+$$/g, '$1');
        // Truncate if needed
        return withoutLinks.length > 25
            ? `${withoutLinks.substring(0, 25)}...`
            : withoutLinks;
    };

    // Format date for chat messages
    const formatDate = (date: string | undefined): string => {
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

    return (
        <div className='flex flex-col h-full'>
            {/* Search input */}
            <div className='pb-2 border-b pt-[2px]'>
                <div className='relative flex flex-row items-center gap-2'>
                    <Input
                        className='pl-8 bg-background'
                        onChange={handleChangeSearch}
                        value={searchQuery}
                        type='search'
                        placeholder='Search...'
                    />
                    <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray' />
                </div>
            </div>

            {/* Tabs */}
            <Tabs
                defaultValue='online'
                className='flex-1 flex flex-col'
                value={activeTab}
                onValueChange={setActiveTab}
            >
                <TabsList className='grid grid-cols-2 bg-transparent px-0'>
                    <TabsTrigger
                        value='online'
                        className={`border-b-[2px] ${
                            activeTab === 'online'
                                ? 'border-primary-white !text-primary-white'
                                : 'border-forground-border text-gray'
                        } !bg-transparent rounded-none !shadow-none`}
                    >
                        Online Now
                    </TabsTrigger>
                    <TabsTrigger
                        value='recent'
                        className={`border-b-[2px] ${
                            activeTab === 'recent'
                                ? 'border-primary-white !text-primary-white'
                                : 'border-forground-border text-gray'
                        } !bg-transparent rounded-none !shadow-none`}
                    >
                        Recent Chats
                    </TabsTrigger>
                </TabsList>

                {/* Online Now Tab */}
                <TabsContent
                    value='online'
                    className='flex-1 overflow-y-auto -mt-1'
                >
                    {isLoading ? (
                        Array.from({ length: 10 }).map((_, index) => (
                            <ChatSkeletonList key={index} />
                        ))
                    ) : (
                        <Suspense
                            fallback={
                                <div className='space-y-2 p-2'>
                                    {Array(5)
                                        .fill(0)
                                        .map((_, i) => (
                                            <UserCardSkeleton key={i} />
                                        ))}
                                </div>
                            }
                        >
                            {filteredOnlineUsers.length === 0 ? (
                                <div className='p-4 text-center text-gray'>
                                    <p>No online users found</p>
                                    {searchQuery && (
                                        <p className='text-xs mt-1'>
                                            Try a different search term
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <div className='h-[calc(100vh-163px)] overflow-y-auto'>
                                    {filteredOnlineUsers.map((user) => (
                                        <div
                                            key={user._id}
                                            className={`block border-l-[2px] ${
                                                selectedUserId === user._id
                                                    ? 'bg-blue-700/20 border-l-[2px] border-blue-800 cursor-pointer'
                                                    : 'hover:bg-blue-700/20 border-b hover:border-b-0 hover:border-l-[2px] hover:border-blue-800 cursor-pointer'
                                            }`}
                                            onClick={() =>
                                                setSelectedUserId(user._id)
                                            }
                                        >
                                            <div className='flex items-start p-2 gap-2'>
                                                <div className='relative flex-shrink-0'>
                                                    <Avatar className='h-10 w-10'>
                                                        <AvatarImage
                                                            src={
                                                                user.profilePicture ||
                                                                '/chat/user.svg'
                                                            }
                                                            alt={user.fullName}
                                                        />
                                                        <AvatarFallback>
                                                            {user.firstName?.charAt(
                                                                0,
                                                            ) || 'U'}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span className='absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white'></span>
                                                </div>
                                                <div className='flex-1 min-w-0'>
                                                    <div className='flex justify-between items-start'>
                                                        <h3 className='font-medium text-sm truncate'>
                                                            {user.fullName}
                                                        </h3>
                                                    </div>
                                                    <p className='text-xs text-primary-white'>
                                                        Active Now
                                                    </p>
                                                </div>
                                                <Button
                                                    variant={
                                                        selectedUserId ===
                                                        user._id
                                                            ? 'default'
                                                            : 'primary_light'
                                                    }
                                                    size='icon'
                                                    className='h-8 w-8 rounded-full text-primary'
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleCreateChat(
                                                            user._id,
                                                        );
                                                    }}
                                                >
                                                    <MessageCircle className='h-4 w-4' />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                    {allOnlineUsers.length >
                                        filteredOnlineUsers.length && (
                                        <div className='p-2 text-center flex flex-row items-center gap-1'>
                                            <div className='w-full h-[2px] bg-border'></div>
                                            <Button
                                                variant='primary_light'
                                                size='sm'
                                                className='text-xs rounded-3xl text-primary'
                                                onClick={() =>
                                                    setOnlineLimit(
                                                        (prev) => prev + 5,
                                                    )
                                                }
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
                            )}
                        </Suspense>
                    )}
                </TabsContent>

                {/* Recent Chats Tab */}
                <TabsContent
                    value='recent'
                    className='flex-1 overflow-y-auto -mt-1'
                >
                    {isLoading ? (
                        <div className='space-y-2 p-2'>
                            {Array(5)
                                .fill(0)
                                .map((_, i) => (
                                    <ChatSkeletonList key={i} />
                                ))}
                        </div>
                    ) : filteredChats.length === 0 ? (
                        <div className='p-4 text-center text-gray'>
                            <p>No recent chats found</p>
                            <p className='text-xs mt-1'>
                                Start a conversation with someone to see them
                                here
                            </p>
                        </div>
                    ) : (
                        <div className='h-[calc(100vh-163px)] overflow-y-auto'>
                            {filteredChats.map((chat) => {
                                const isRead =
                                    chat?.latestMessage?.sender?._id ===
                                    user?._id;
                                const hasUnread = chat?.unreadCount > 0;
                                const isUnRead = chat?.unreadCount !== 0;
                                return (
                                    <div
                                        key={chat._id}
                                        className={`block border-l-[2px] ${
                                            selectedChatId === chat._id
                                                ? 'bg-blue-700/20 border-l-[2px] border-blue-800 cursor-pointer'
                                                : 'hover:bg-blue-700/20 border-b hover:border-b-0 hover:border-l-[2px] hover:border-blue-800 cursor-pointer'
                                        }`}
                                        onClick={() =>
                                            handleNavigateToChat(chat._id)
                                        }
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
                                                              ) || 'U'}
                                                    </AvatarFallback>
                                                </Avatar>

                                                {/* Online indicator */}
                                                {!chat?.isChannel &&
                                                    onlineUsers?.find(
                                                        (x) =>
                                                            x?._id ===
                                                            chat?.otherUser
                                                                ?._id,
                                                    ) && (
                                                        <span className='absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white'></span>
                                                    )}
                                            </div>

                                            {/* Chat content */}
                                            <div className='flex-1 min-w-0'>
                                                <div className='flex justify-between items-start gap-1'>
                                                    <div className='font-medium flex flex-row items-center gap-1 text-sm truncate'>
                                                        <span className='truncate'>
                                                            {chat?.isChannel
                                                                ? chat?.name
                                                                : chat
                                                                      ?.otherUser
                                                                      ?.fullName ||
                                                                  'User'}
                                                        </span>
                                                        {/* Pin icon */}
                                                        {chat?.myData
                                                            ?.isFavourite && (
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
                                                    <div className='flex items-center gap-1 flex-1 w-[calc(100%-50px)]'>
                                                        {/* Message status for sent messages */}
                                                        {chat?.latestMessage
                                                            ?.sender?._id ===
                                                            user?._id && (
                                                            <>
                                                                {chat
                                                                    ?.latestMessage
                                                                    ?.status ===
                                                                'read' ? (
                                                                    <CheckCheck className='h-3 w-3 text-blue-500 flex-shrink-0' />
                                                                ) : chat
                                                                      ?.latestMessage
                                                                      ?.status ===
                                                                  'delivered' ? (
                                                                    <CheckCheck className='h-3 w-3 text-gray flex-shrink-0' />
                                                                ) : (
                                                                    <Check className='h-3 w-3 text-gray flex-shrink-0' />
                                                                )}
                                                            </>
                                                        )}

                                                        <p className='text-xs text-gray truncate max-w-[80%]'>
                                                            {chat?.latestMessage
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
                                                                <span
                                                                    className={` ${
                                                                        hasUnread
                                                                            ? 'text-black'
                                                                            : 'text-gray'
                                                                    }`}
                                                                >
                                                                    {chat
                                                                        ?.latestMessage
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
                                                                    {chat
                                                                        ?.latestMessage
                                                                        ?.sender &&
                                                                    chat
                                                                        ?.latestMessage
                                                                        ?.sender
                                                                        ?._id !==
                                                                        user?._id
                                                                        ? `${chat?.isChannel ? `${chat?.latestMessage?.sender?.firstName}: ` : ''}`
                                                                        : chat
                                                                              ?.latestMessage
                                                                              ?.sender &&
                                                                          'You: '}

                                                                    <div className='w-[180px] overflow-hidden text-ellipsis whitespace-nowrap ml-1'>
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
                                                        {/* Bell icon (muted or not) */}
                                                        {chat?.myData
                                                            ?.notification
                                                            ?.isOn ===
                                                            false && (
                                                            <BellOff className='h-4 w-4 text-gray' />
                                                        )}

                                                        {/* Unread indicator */}
                                                        {chat.unreadCount > 0 &&
                                                            chat?.latestMessage
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
                                    </div>
                                );
                            })}

                            {allRecentChats.length > filteredChats.length && (
                                <div className='p-2 text-center flex flex-row items-center gap-1'>
                                    <div className='w-full h-[2px] bg-border'></div>
                                    <Button
                                        variant='primary_light'
                                        size='sm'
                                        className='text-xs rounded-3xl text-primary'
                                        onClick={() =>
                                            setChatLimit((prev) => prev + 5)
                                        }
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
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}

export default OnlineSidebar;
