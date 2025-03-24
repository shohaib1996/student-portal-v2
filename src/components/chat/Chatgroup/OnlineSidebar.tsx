'use client';

import type React from 'react';
import { useState, useEffect, useCallback, Suspense } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

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
    SlidersHorizontal,
    MessageCircle,
    ChevronDown,
} from 'lucide-react';
import { useAppSelector } from '@/redux/hooks';
import { instance } from '@/lib/axios/axiosInstance';
import { ChatUser, useGetOnlineUsersQuery } from '@/redux/api/chats/chatApi';

// Skeleton component for UserCard
function UserCardSkeleton() {
    return (
        <div className='flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700'>
            <div className='flex items-center space-x-4'>
                <Skeleton className='h-12 w-12 rounded-full' />
                <div className='space-y-2'>
                    <Skeleton className='h-4 w-[200px]' />
                    <Skeleton className='h-4 w-[150px]' />
                </div>
            </div>
            <Skeleton className='h-10 w-10 rounded-full' />
        </div>
    );
}

interface User {
    _id: string;
    firstName: string;
    lastName: string;
    fullName: string;
    profilePicture?: string;
    email?: string;
    // Add other user properties as needed
}

interface RootState {
    chat: {
        chats: any[];
        onlineUsers: User[];
    };
    auth: {
        user: User;
    };
    theme?: {
        displayMode: string;
    };
}

function OnlineSidebar() {
    const { user } = useAppSelector((state) => state.auth);
    const { data: onlineUsers = [] } = useGetOnlineUsersQuery();
    const router = useRouter();
    const [records, setRecords] = useState<ChatUser[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [activeTab, setActiveTab] = useState<string>('online');
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

    useEffect(() => {
        try {
            setRecords(onlineUsers);
        } catch (error) {
            console.error('Error setting online users:', error);
            toast.error('Failed to load online users');
        } finally {
            setIsLoading(false);
        }
    }, [onlineUsers]);

    // Using useCallback to memoize the search function
    const handleChangeSearch = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            try {
                const value = e.target.value;
                setSearchQuery(value);

                if (value) {
                    const filteredUsers = onlineUsers.filter(
                        (user) =>
                            user?.fullName ??
                            user?.firstName ??
                            'Unknown User'
                                .toLowerCase()
                                .includes(value.toLowerCase()),
                    );
                    setRecords(filteredUsers);
                } else {
                    setRecords(onlineUsers);
                }
            } catch (error) {
                console.error('Error filtering users:', error);
                toast.error('Failed to filter users');
            }
        },
        [onlineUsers],
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

    return (
        <div className='flex flex-col h-full'>
            {/* Search input */}
            <div className='relative flex flex-row items-center gap-2'>
                <div className='relative flex-1'>
                    <Input
                        className='pl-10 bg-foreground border'
                        onChange={handleChangeSearch}
                        value={searchQuery}
                        type='search'
                        placeholder='Search user...'
                    />
                    <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray' />
                </div>
                <Button variant='secondary' size='icon'>
                    <SlidersHorizontal className='h-4 w-4 text-gray' />
                </Button>
            </div>

            {/* Tabs */}
            <Tabs
                defaultValue='online'
                className='flex-1 flex flex-col'
                onValueChange={setActiveTab}
            >
                <TabsList className='grid grid-cols-2 bg-transparent '>
                    <TabsTrigger
                        value='recent'
                        className={`${activeTab === 'recent' ? 'border-b-[2px] border-b-primary !text-primary' : 'border-b-[2px] border-b-border'} bg-transparent rounded-none text-gray`}
                    >
                        Recent Chats
                    </TabsTrigger>
                    <TabsTrigger
                        value='online'
                        className={`${activeTab === 'online' ? 'border-b-[2px] border-b-primary !text-primary' : 'border-b-[2px] border-b-border'} bg-transparent rounded-none text-gray`}
                    >
                        Online Now
                    </TabsTrigger>
                </TabsList>

                {/* Recent Chats Tab */}
                <TabsContent value='recent' className='flex-1 overflow-y-auto'>
                    <div className='p-8 text-center text-gray-500'>
                        <p>No recent chats found</p>
                        <p className='text-sm mt-2'>
                            Start a conversation with someone to see them here
                        </p>
                    </div>
                </TabsContent>

                {/* Online Now Tab */}
                <TabsContent value='online' className='flex-1 overflow-y-auto'>
                    {isLoading ? (
                        <div className='flex justify-center py-8'>
                            <Loader2 className='h-8 w-8 animate-spin text-primary' />
                        </div>
                    ) : (
                        <Suspense
                            fallback={
                                <div className='space-y-4 p-4'>
                                    {Array(5)
                                        .fill(0)
                                        .map((_, i) => (
                                            <UserCardSkeleton key={i} />
                                        ))}
                                </div>
                            }
                        >
                            {records.length === 0 ? (
                                <div className='p-4 text-center text-gray-500'>
                                    No online users found
                                </div>
                            ) : (
                                <div className='divide-y divide-border'>
                                    {records?.map(
                                        (u, i) =>
                                            u._id !== user?._id && (
                                                <div
                                                    key={i}
                                                    className={`flex items-center justify-between p-4 border-l-[2px] transition-colors duration-200 ${
                                                        selectedUserId === u._id
                                                            ? 'bg-primary-light border-l-primary'
                                                            : 'border-l-transparent hover:bg-primary-light hover:border-l-primary'
                                                    }`}
                                                    onClick={() =>
                                                        setSelectedUserId(u._id)
                                                    }
                                                >
                                                    <div className='flex items-center space-x-3'>
                                                        <div className='relative'>
                                                            <Avatar className='h-12 w-12'>
                                                                <AvatarImage
                                                                    src={
                                                                        u.profilePicture ||
                                                                        '/chat/user.svg'
                                                                    }
                                                                    alt={
                                                                        u.fullName
                                                                    }
                                                                />
                                                                <AvatarFallback>
                                                                    {u.firstName?.charAt(
                                                                        0,
                                                                    )}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <span className='absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white'></span>
                                                        </div>
                                                        <div>
                                                            <h3 className='font-medium'>
                                                                {u.fullName}
                                                            </h3>
                                                            <p className='text-sm text-green-500'>
                                                                Active Now
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant={
                                                            selectedUserId ===
                                                            u._id
                                                                ? 'default'
                                                                : 'ghost'
                                                        }
                                                        size='icon'
                                                        className='rounded-full h-10 w-10 text-primary'
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleCreateChat(
                                                                u?._id,
                                                            );
                                                        }}
                                                    >
                                                        <MessageCircle className='h-5 w-5' />
                                                    </Button>
                                                </div>
                                            ),
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
            </Tabs>
        </div>
    );
}

export default OnlineSidebar;
