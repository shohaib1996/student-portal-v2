'use client';

import type React from 'react';
import { useCallback, useState, Suspense } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios'; // TODO: Replace with RTK query in the future
import dynamic from 'next/dynamic';
import { toast } from 'sonner';

// ShadCN UI components
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

// Lucide Icons
import { Search, Loader2 } from 'lucide-react';

// Dynamic imports
const UserCard = dynamic(() => import('./UserCard'), {
    loading: () => <UserCardSkeleton />,
    ssr: false,
});

interface User {
    _id: string;
    firstName: string;
    lastName: string;
    fullName: string;
    profilePicture?: string;
    email: string;
    // Add other user properties as needed
}

interface RootState {
    chat: {
        chats: any[];
    };
    theme?: {
        displayMode: string;
    };
}

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

function SearchSidebar() {
    const [users, setUsers] = useState<User[]>([]);
    const [isUserLoading, setIsUserLoading] = useState<boolean>(false);

    // Using useCallback to memoize the search function
    const handleSearchUser = useCallback((value: string) => {
        const timeoutId = setTimeout(() => {
            setIsUserLoading(true);

            // TODO: Replace with RTK query in the future
            axios
                .get(`/chat/searchuser?query=${value?.trim() || ''}`)
                .then((res) => {
                    setUsers(res.data.users);
                    setIsUserLoading(false);
                })
                .catch((err) => {
                    setIsUserLoading(false);
                    toast.error('Failed to search users');
                    console.error('Search error:', err);
                    // console.log(err) // Keeping commented console.log as in original
                });
        }, 200);

        return () => clearTimeout(timeoutId); // Clean up timeout on component unmount or value change
    }, []);

    return (
        <>
            <div className='filter-group'>
                <div className='relative'>
                    <Input
                        className='search-input bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                        onFocus={(e: React.FocusEvent<HTMLInputElement>) =>
                            handleSearchUser(e.target.value)
                        }
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            handleSearchUser(e.target.value)
                        }
                        type='search'
                        placeholder='Type Name...'
                    />
                    <span className='absolute right-3 top-1/2 transform -translate-y-1/2'>
                        <Search className='h-4 w-4 text-muted-foreground' />
                    </span>
                </div>
            </div>
            <div className='nav-body'>
                <div className='scrollbar-container'>
                    {isUserLoading ? (
                        <div className='flex justify-center py-8'>
                            <div className='flex flex-col items-center space-y-4'>
                                <Loader2 className='h-8 w-8 animate-spin text-primary dark:text-primary-foreground' />
                                <span className='text-sm text-muted-foreground dark:text-gray-300'>
                                    Searching...
                                </span>
                            </div>
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
                                {users?.map((user, i) => (
                                    <UserCard
                                        source={'search'}
                                        user={user}
                                        key={i}
                                    />
                                ))}
                            </ul>
                        </Suspense>
                    )}
                </div>
            </div>
        </>
    );
}

export default SearchSidebar;
