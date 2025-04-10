'use client';

import type React from 'react';
import { useCallback, useState, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { toast } from 'sonner';

// ShadCN UI components
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

// Lucide Icons
import { Search, Loader2, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { instance } from '@/lib/axios/axiosInstance';

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
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [visibleCount, setVisibleCount] = useState<number>(10);

    // Function to remove duplicate users based on _id
    const removeDuplicateUsers = (usersList: User[]): User[] => {
        const uniqueUsers = new Map();

        usersList.forEach((user) => {
            if (!uniqueUsers.has(user._id)) {
                uniqueUsers.set(user._id, user);
            }
        });

        return Array.from(uniqueUsers.values());
    };

    // Handle loading more users
    const handleLoadMore = useCallback(() => {
        setVisibleCount((prevCount) => prevCount + 10);
    }, []);

    // Using useCallback to memoize the search function
    const handleSearchUser = useCallback((value: string) => {
        setSearchQuery(value);
        // Reset visible count when performing a new search
        setVisibleCount(10);

        const timeoutId = setTimeout(() => {
            setIsUserLoading(true);

            // TODO: Replace with RTK query in the future
            instance
                .get(`/chat/searchuser?query=${value?.trim() || ''}`)
                .then((res) => {
                    // Remove duplicate users before setting state
                    const uniqueUsers = removeDuplicateUsers(res.data.users);
                    setUsers(uniqueUsers);
                    setIsUserLoading(false);
                })
                .catch((err) => {
                    setIsUserLoading(false);
                    toast.error('Failed to search users');
                    console.error('Search error:', err);
                });
        }, 200);

        return () => clearTimeout(timeoutId); // Clean up timeout on component unmount or value change
    }, []);

    // Get visible users for pagination
    const visibleUsers = users.slice(0, visibleCount);
    const hasMoreToLoad = users.length > visibleCount;

    return (
        <div className='flex flex-col h-full'>
            {/* Search input */}
            <div className='relative flex flex-row items-center gap-2 w-full border-b border-b-border pb-2'>
                <Input
                    className='pl-8 bg-background'
                    value={searchQuery}
                    onFocus={(e: React.FocusEvent<HTMLInputElement>) =>
                        handleSearchUser(e.target.value)
                    }
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleSearchUser(e.target.value)
                    }
                    type='search'
                    placeholder='Search users...'
                />
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray' />
            </div>

            {/* Search results */}
            <div className='flex-1 overflow-y-auto'>
                {isUserLoading ? (
                    <div className='flex justify-center py-8'>
                        <div className='flex flex-col items-center space-y-4'>
                            <Loader2 className='h-8 w-8 animate-spin text-primary' />
                            <span className='text-sm text-muted-foreground'>
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
                        {users?.length === 0 ? (
                            <div className='p-8 text-center text-gray-500'>
                                {searchQuery
                                    ? 'No users found'
                                    : 'Type a name to search for users'}
                            </div>
                        ) : (
                            <div className='divide-y divide-border'>
                                {visibleUsers.map((user, i) => (
                                    <div
                                        key={user._id}
                                        className={`flex items-center justify-between p-4 border-l-[2px] transition-colors duration-200 ${
                                            selectedUserId === user._id
                                                ? 'bg-primary-light border-l-primary'
                                                : 'border-l-transparent hover:bg-primary-light hover:border-l-primary'
                                        }`}
                                        onClick={() =>
                                            setSelectedUserId(user._id)
                                        }
                                    >
                                        <UserCard
                                            source={'search'}
                                            user={user}
                                            isSelected={
                                                selectedUserId === user._id
                                            }
                                            onSelect={() =>
                                                setSelectedUserId(user._id)
                                            }
                                        />
                                    </div>
                                ))}

                                {hasMoreToLoad && (
                                    <div className='p-2 text-center flex flex-row items-center gap-1'>
                                        <div className='w-full h-[2px] bg-border'></div>
                                        <Button
                                            variant='primary_light'
                                            size='sm'
                                            className='text-xs rounded-3xl text-primary'
                                            onClick={handleLoadMore}
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
            </div>
        </div>
    );
}

export default SearchSidebar;
