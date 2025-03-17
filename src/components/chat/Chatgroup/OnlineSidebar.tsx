'use client';

import type React from 'react';
import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSelector } from 'react-redux';
import dynamic from 'next/dynamic';
import { toast } from 'sonner';

// ShadCN UI components
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

// Lucide Icons
import { Search, Loader2 } from 'lucide-react';
import chats from '../chats.json';
import onlineUsers from '../onlineUsers.json';
// Dynamic imports with loading state
const UserCard = dynamic(() => import('./UserCard'), {
    loading: () => <UserCardSkeleton />,
    ssr: false,
});

// Skeleton component for UserCard
function UserCardSkeleton() {
    return (
        <div className='flex items-center space-x-4 p-4 border-b border-gray-200 dark:border-gray-700'>
            <Skeleton className='h-12 w-12 rounded-full' />
            <div className='space-y-2'>
                <Skeleton className='h-4 w-[200px]' />
                <Skeleton className='h-4 w-[150px]' />
            </div>
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
    const { user } = useSelector((state: RootState) => state.auth);
    const [records, setRecords] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

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
                if (e.target.value) {
                    const filteredUsers = onlineUsers.filter((user) =>
                        user?.fullName
                            .toLowerCase()
                            .includes(e.target.value.toLowerCase()),
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

    return (
        <>
            <div className='filter-group'>
                <div className='relative'>
                    <Input
                        className='search-input bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                        onChange={handleChangeSearch}
                        type='search'
                        placeholder='Search Online Users'
                    />
                    <span className='absolute right-3 top-1/2 transform -translate-y-1/2'>
                        <Search className='h-4 w-4 text-muted-foreground' />
                    </span>
                </div>
            </div>
            <div className='nav-body'>
                <div className='scrollbar-container'>
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
                            <ul className='list-group'>
                                {records?.map(
                                    (u, i) =>
                                        u._id !== user._id && (
                                            <UserCard user={u} key={i} />
                                        ),
                                )}
                            </ul>
                        </Suspense>
                    )}
                </div>
            </div>
        </>
    );
}

export default OnlineSidebar;
