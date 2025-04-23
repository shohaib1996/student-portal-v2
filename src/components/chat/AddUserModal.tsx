'use client';

import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Check, Loader2, Search, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

// Using RTK but keeping the same naming convention as requested
import { updateMembersCount } from '@/redux/features/chatReducer';
import { useAppDispatch } from '@/redux/hooks';
import GlobalDialog from '../global/GlobalDialogModal/GlobalDialog';
import { instance } from '@/lib/axios/axiosInstance';

interface User {
    _id: string;
    fullName: string;
    profilePicture?: string;
    email?: string;
}

interface ChannelMember {
    user: {
        _id: string;
        fullName?: string;
        profilePicture?: string;
    };
}

interface Channel {
    _id: string;
    membersCount: number;
}

interface AddUserModalProps {
    opened: boolean;
    handleCancel: () => void;
    channel: Channel;
    onUserAdded?: () => void;
}

function AddUserModal({
    opened,
    handleCancel,
    channel,
    onUserAdded,
}: AddUserModalProps) {
    const searchRef = useRef<HTMLInputElement>(null);
    const [searchedUser, setSearchedUser] = useState<User[]>([]);
    const [isUserLoading, setIsUserLoading] = useState(false);
    const [addingList, setAddingList] = useState<string[]>([]);
    const [addedUsers, setAddedUsers] = useState<ChannelMember[]>([]);
    const [users, setUsers] = useState<ChannelMember[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    const dispatch = useAppDispatch();

    // Reset state when modal opens
    useEffect(() => {
        if (opened) {
            setSearchedUser([]);
            setSearchQuery('');
            fetchMembers(channel);
        }
    }, [opened, channel]);

    const fetchMembers = useCallback((channel: Channel) => {
        if (!channel?._id) {
            return;
        }
        setIsUserLoading(true);

        instance
            .post(`/chat/members/${channel?._id}`)
            .then((res) => {
                setAddedUsers(res.data?.results || []);
                setIsUserLoading(false);
            })
            .catch((err) => {
                setIsUserLoading(false);
                console.error(err);
                toast.error(
                    err?.response?.data?.error || 'Failed to fetch members',
                );
            });
    }, []);

    const adduserChannel = useCallback(
        (userId: string) => {
            const data = {
                user: userId,
            };
            setAddingList((prev) => [...prev, userId]);
            instance
                .patch(`/chat/channel/adduser/${channel._id}`, data)
                .then((res) => {
                    const newUser = searchedUser.find((u) => u._id === userId);
                    toast.success(`${newUser?.fullName || 'User'} is added`);
                    setAddingList((prev) => prev.filter((id) => id !== userId));
                    dispatch(
                        updateMembersCount({
                            chatId: channel._id,
                            membersCount: channel.membersCount + 1,
                        }),
                    );
                    if (newUser) {
                        setAddedUsers((prev) => [
                            ...prev,
                            {
                                user: {
                                    _id: userId,
                                    fullName: newUser.fullName,
                                    profilePicture: newUser.profilePicture,
                                },
                            },
                        ]);
                    }
                    setUsers((prev) => [...prev, { user: { _id: userId } }]);
                    onUserAdded?.();
                })
                .catch((err) => {
                    setAddingList((prev) => prev.filter((id) => id !== userId));
                    toast.error(
                        err?.response?.data?.error || 'Failed to add user',
                    );
                });
        },
        [channel, dispatch, searchedUser, onUserAdded],
    );

    const handleSearchUser = useCallback(
        (value: string) => {
            setSearchQuery(value);
            setIsUserLoading(true);

            // Clear previous timeout if exists
            const timeoutId = setTimeout(() => {
                instance
                    .get(`/chat/searchuser?query=${value?.trim() || ''}`)
                    .then((res) => {
                        // Filter out users who are already added
                        const filteredUsers = res.data.users.filter(
                            (user: User) =>
                                !addedUsers.some(
                                    (addedUser) =>
                                        addedUser?.user?._id === user._id,
                                ),
                        );
                        setSearchedUser(filteredUsers);
                        setIsUserLoading(false);
                    })
                    .catch((err) => {
                        setIsUserLoading(false);
                        console.error(err);
                        toast.error(
                            err?.response?.data?.error ||
                                'Failed to search users',
                        );
                    });
            }, 300);

            return () => clearTimeout(timeoutId);
        },
        [addedUsers],
    );

    // User skeleton loading component
    const UserSkeleton = () => (
        <div className='flex justify-between items-center p-3 rounded-lg bg-card/50'>
            <div className='flex items-center gap-3'>
                <Skeleton className='h-10 w-10 rounded-full' />
                <Skeleton className='h-4 w-32' />
            </div>
            <Skeleton className='h-8 w-8 rounded-full' />
        </div>
    );

    return (
        <GlobalDialog
            title='Add Member'
            open={opened}
            setOpen={() => handleCancel()}
        >
            <div className='py-4'>
                <div className='relative'>
                    <Search className='absolute left-3 top-2.5 h-4 w-4 text-muted-foreground' />
                    <Input
                        ref={searchRef}
                        placeholder='Search users...'
                        className='pl-9 pr-4'
                        value={searchQuery}
                        onChange={(e) => handleSearchUser(e.target.value)}
                        autoFocus
                    />
                    {searchQuery && (
                        <button
                            onClick={() => handleSearchUser('')}
                            className='absolute right-3 top-2.5 text-muted-foreground hover:text-foreground'
                        >
                            <X className='h-4 w-4' />
                        </button>
                    )}
                </div>

                <div className='mt-4 max-h-[300px] overflow-y-auto space-y-2'>
                    {isUserLoading ? (
                        // Show skeletons while loading
                        Array(3)
                            .fill(0)
                            .map((_, i) => <UserSkeleton key={i} />)
                    ) : searchedUser.length > 0 ? (
                        // Show search results
                        searchedUser.map((user, i) => (
                            <div
                                className='flex justify-between items-center p-3 rounded-lg bg-card/50 hover:bg-card transition-colors'
                                key={i}
                            >
                                <div className='flex items-center gap-3'>
                                    <Avatar className='h-10 w-10'>
                                        <AvatarImage
                                            src={
                                                user.profilePicture ||
                                                '/placeholder.svg'
                                            }
                                            alt={user.fullName}
                                        />
                                        <AvatarFallback>
                                            {user.fullName?.charAt(0) || 'U'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h3 className='text-sm font-medium'>
                                            {user.fullName}
                                        </h3>
                                        {user.email && (
                                            <p className='text-xs text-muted-foreground'>
                                                {user.email}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <Button
                                    size='icon'
                                    variant={
                                        users.some(
                                            (u) => u?.user?._id === user._id,
                                        ) || addingList.includes(user._id)
                                            ? 'default'
                                            : 'outline'
                                    }
                                    className='h-8 w-8 rounded-full'
                                    disabled={
                                        users.some(
                                            (u) => u?.user?._id === user._id,
                                        ) || addingList.includes(user._id)
                                    }
                                    onClick={() => adduserChannel(user._id)}
                                >
                                    {addingList.includes(user._id) ? (
                                        <Loader2 className='h-4 w-4 animate-spin' />
                                    ) : users.some(
                                          (u) => u?.user?._id === user._id,
                                      ) ? (
                                        <Check className='h-4 w-4' />
                                    ) : (
                                        <Plus className='h-4 w-4' />
                                    )}
                                </Button>
                            </div>
                        ))
                    ) : searchQuery ? (
                        // No results message
                        <div className='text-center py-8'>
                            <p className='text-muted-foreground'>
                                {` No users found matching "${searchQuery}"`}
                            </p>
                        </div>
                    ) : (
                        // Initial state message
                        <div className='text-center py-8'>
                            <p className='text-muted-foreground'>
                                Search for users to add to this channel
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* <div className='flex justify-end mt-4'>
                <Button variant='outline' onClick={handleCancel}>
                    Close
                </Button>
            </div> */}
        </GlobalDialog>
    );
}

export default AddUserModal;
