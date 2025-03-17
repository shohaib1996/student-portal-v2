'use client';

import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import Image from 'next/image';
import { toast } from 'sonner';
import { useCallback } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Plus, Check, Loader } from 'lucide-react';

// Using RTK but keeping the same naming convention as requested
import { updateMembersCount } from '@/redux/features/chatReducer';
import { useAppDispatch } from '@/redux/hooks';

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
}

function AddUserModal({ opened, handleCancel, channel }: AddUserModalProps) {
    const searchRef = useRef<HTMLInputElement>(null);
    const [searchedUser, setSearchedUser] = useState<User[]>([]);
    const [isUserLoading, setIsUserLoading] = useState(false);
    const [addingList, setAddingList] = useState<string[]>([]);
    const [addedUsers, setAddedUsers] = useState<ChannelMember[]>([]);
    const [users, setUsers] = useState<ChannelMember[]>([]);

    const dispatch = useAppDispatch();

    useEffect(() => {
        fetchMembers(channel);
    }, [channel]);

    const fetchMembers = useCallback((channel: Channel) => {
        if (!channel?._id) {
            return;
        }
        setIsUserLoading(true);

        axios
            .post(`/chat/members/${channel?._id}`)
            .then((res) => {
                setAddedUsers(res.data?.results || []);
                setIsUserLoading(false);
            })
            .catch((err) => {
                setIsUserLoading(false);
                console.log(err);
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
            axios
                .patch(`/chat/channel/adduser/${channel._id}`, data)
                .then((res) => {
                    toast.success('Added successfully');
                    setAddingList((prev) => prev.filter((id) => id !== userId));
                    dispatch(
                        updateMembersCount({
                            chatId: channel._id,
                            membersCount: channel.membersCount + 1,
                        }),
                    );
                    setUsers((prev) => [...prev, { user: { _id: userId } }]);
                })
                .catch((err) => {
                    setAddingList((prev) => prev.filter((id) => id !== userId));
                    toast.error(
                        err?.response?.data?.error || 'Failed to add user',
                    );
                });
        },
        [channel, dispatch],
    );

    const handleSearchUser = useCallback(
        (value?: string) => {
            console.log(value, 'value');
            setTimeout(() => {
                setIsUserLoading(true);
                axios
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
                        console.log(err, '---->error');
                        toast.error(
                            err?.response?.data?.error ||
                                'Failed to search users',
                        );
                    });
            }, 200);
        },
        [addedUsers],
    );

    console.log('addedUsers: ', addedUsers);

    return (
        <Dialog open={opened} onOpenChange={() => handleCancel()}>
            <DialogContent className='sm:max-w-[600px]'>
                <DialogHeader>
                    <DialogTitle className='text-xl font-medium'>
                        Add user
                    </DialogTitle>
                </DialogHeader>
                <div className='select-wrapper bg-background text-foreground'>
                    <div className='select-container'>
                        <Input
                            ref={searchRef}
                            placeholder='Search user'
                            className='w-full'
                            onFocus={() => handleSearchUser()}
                            onChange={(e) => handleSearchUser(e.target.value)}
                        />
                    </div>
                    {searchedUser.length > 0 && (
                        <div className='user-list-wrapper bg-muted rounded-lg p-2 mt-4'>
                            {searchedUser.map((user, i) => (
                                <div
                                    className='user-item flex justify-between items-center mb-2 bg-card p-2 rounded-lg'
                                    key={i}
                                >
                                    <div className='flex items-center gap-3'>
                                        <Image
                                            width={50}
                                            height={50}
                                            alt={user.fullName}
                                            className='rounded-full'
                                            src={
                                                user.profilePicture ||
                                                '/placeholder2.jpg'
                                            }
                                        />
                                        <div className='info'>
                                            <h3 className='name text-sm font-medium'>
                                                {user.fullName}
                                            </h3>
                                            {/* <span className="email">{user.email}</span> */}
                                        </div>
                                    </div>
                                    <button
                                        disabled={
                                            users.some(
                                                (u) =>
                                                    u?.user?._id === user._id,
                                            ) || addingList.includes(user._id)
                                        }
                                        onClick={() => adduserChannel(user._id)}
                                        className={`h-8 w-8 rounded-full flex items-center justify-center ${
                                            users.some(
                                                (u) =>
                                                    u?.user?._id === user._id,
                                            ) || addingList.includes(user._id)
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors'
                                        }`}
                                    >
                                        {addingList.includes(user._id) ? (
                                            <Loader className='h-4 w-4 animate-spin' />
                                        ) : users.some(
                                              (u) => u?.user?._id === user._id,
                                          ) ? (
                                            <Check className='h-4 w-4' />
                                        ) : (
                                            <Plus className='h-4 w-4' />
                                        )}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default AddUserModal;
