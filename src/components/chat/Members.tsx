'use client';

import type React from 'react';
import { useEffect, useRef, useState, useCallback } from 'react';
import { toast } from 'sonner';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useRouter } from 'next/navigation';
import ChatRole from './ChatForm/ChatRole';
import MuteOption from './ChatForm/MuteOption';
import UserBlock from './ChatForm/UserBlock';
import ConfirmModal from './ChatForm/ConfirmModal';
import {
    Shield,
    ShieldCheck,
    Crown,
    MoreVertical,
    UserPlus,
    Ban,
    Trash2,
    VolumeX,
    Search,
    SlidersHorizontal,
    Plus,
    ChevronDown,
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { updateChats, updateMembersCount } from '@/redux/features/chatReducer';
import { instance } from '@/lib/axios/axiosInstance';
import GlobalTooltip from '../global/GlobalTooltip';
import AddUserModal from './AddUserModal';

// Shared types for chat-related components
export interface User {
    _id: string;
    firstName?: string;
    fullName?: string;
    profilePicture?: string;
    lastActive?: string;
}

export interface Mute {
    isMuted?: boolean;
    date?: string;
    note?: string;
}

export interface Notification {
    isOn?: boolean;
    dateUntil?: string;
}

export interface Member {
    _id: string;
    user: User;
    role?: string;
    isBlocked?: boolean;
    isMuted?: boolean;
    muteExpires?: string;
    mute?: Mute;
    notification?: Notification;
}

export interface Chat {
    _id: string;
    name?: string;
    avatar?: string;
    isChannel?: boolean;
    description?: string;
    membersCount?: number;
    isArchived?: boolean;
    myData?: {
        role?: string;
        user?: string;
        notification?: Notification;
    };
    otherUser?: User;
}

interface MembersProps {
    chat: any;
}

// Initialize dayjs plugins
dayjs.extend(relativeTime);

const Members: React.FC<MembersProps> = ({ chat }) => {
    const [members, setMembers] = useState<Member[]>([]);
    const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMute, setSelectedMute] = useState<Member | null>(null);
    const [selectedRole, setSelectedRole] = useState<Member | null>(null);
    const [selectedBlock, setSelectedBlock] = useState<Member | null>(null);
    const [selectedRemoveUser, setSelectedRemoveUser] = useState<Member | null>(
        null,
    );
    const [creating, setCreating] = useState(false);
    const [showAll, setShowAll] = useState(false);
    const router = useRouter();

    // Redux state and dispatch
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);
    const { onlineUsers } = useAppSelector((state: any) => state.chat);

    const divRef = useRef<HTMLDivElement>(null);

    const fetchMembers = useCallback(
        (options: { limit: number; lastId?: string }) => {
            if (!chat?._id) {
                return;
            }
            setIsLoading(true);
            instance
                .post(`/chat/members/${chat?._id}`, options)
                .then((res) => {
                    const membersData = res.data?.results || [];
                    setMembers(membersData);
                    setFilteredMembers(membersData);
                    setIsLoading(false);
                })
                .catch((err) => {
                    setIsLoading(false);
                    console.log(err);
                    toast.error(
                        err?.response?.data?.error || 'Failed to fetch members',
                    );
                });
        },
        [chat],
    );

    const handleScroll = useCallback(
        ({ lastId }: { lastId?: string }) => {
            const div = divRef.current;

            if (
                div &&
                div.scrollTop + div.clientHeight >= div.scrollHeight - 1
            ) {
                instance
                    .post(`/chat/members/${chat?._id}`, { lastId, limit: 50 })
                    .then((res) => {
                        const newMembers = res.data?.results || [];
                        setMembers((prev) => [...prev, ...newMembers]);

                        // Also update filtered members if search is active
                        if (searchQuery) {
                            const newFiltered = newMembers.filter(
                                (member: any) =>
                                    member.user.fullName
                                        ?.toLowerCase()
                                        .includes(searchQuery.toLowerCase()),
                            );
                            setFilteredMembers((prev) => [
                                ...prev,
                                ...newFiltered,
                            ]);
                        } else {
                            setFilteredMembers((prev) => [
                                ...prev,
                                ...newMembers,
                            ]);
                        }
                    })
                    .catch((err) => {
                        console.log(err);
                        toast.error(
                            err?.response?.data?.error ||
                                'Failed to load more members',
                        );
                    });
            }
        },
        [chat, searchQuery],
    );

    useEffect(() => {
        if (chat) {
            fetchMembers({ limit: 50 });
        }
    }, [chat, fetchMembers]);

    // Search functionality
    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredMembers(members);
        } else {
            const filtered = members.filter((member) =>
                member.user.fullName
                    ?.toLowerCase()
                    .includes(searchQuery.toLowerCase()),
            );
            setFilteredMembers(filtered);
        }
    }, [searchQuery, members]);

    const handleRemoveUser = useCallback(
        (member: Member) => {
            const data = {
                member,
            };

            instance
                .patch(`/chat/channel/remove-user/${chat._id}`, data)
                .then((res) => {
                    setMembers((prev) =>
                        prev.filter((m) => m._id !== member?._id),
                    );
                    setFilteredMembers((prev) =>
                        prev.filter((m) => m._id !== member?._id),
                    );

                    // Update members count in Redux
                    dispatch(
                        updateMembersCount({
                            chatId: chat?._id,
                            membersCount: (chat?.membersCount || 0) - 1,
                        }),
                    );

                    toast.success('Member removed successfully');
                })
                .catch((err) => {
                    console.log(err);
                    toast.error(
                        err?.response?.data?.error || 'Failed to remove member',
                    );
                });
        },
        [chat, dispatch],
    );

    const handleUpdateCallback = useCallback((member: any) => {
        const updateMembersList = (list: Member[]) => {
            const arr = [...list];
            const index = arr.findIndex((x) => x._id === member?._id);

            if (index !== -1) {
                arr[index] = { ...arr[index], ...member };
                return arr;
            }
            return list;
        };

        setMembers(updateMembersList);
        setFilteredMembers(updateMembersList);
        setSelectedMute(null);
    }, []);

    // Modal states
    const [chatRoleOpened, setChatRoleOpened] = useState(false);
    const [muteOptionOpened, setMuteOptionOpened] = useState(false);
    const [userBlockOpened, setUserBlockOpened] = useState(false);
    const [userRemoveOpened, setUserRemoveOpened] = useState(false);
    const [opened, setOpened] = useState(false);
    const handleChatClose = useCallback(() => {
        setSelectedRole(null);
        setChatRoleOpened(false);
    }, []);

    const handleOpenRole = useCallback((member: Member) => {
        setSelectedRole(member);
        setChatRoleOpened(true);
    }, []);

    const handleOpenMute = useCallback((member: Member) => {
        setSelectedMute(member);
        setMuteOptionOpened(true);
    }, []);

    const handleMuteClose = useCallback(() => {
        setSelectedMute(null);
        setMuteOptionOpened(false);
    }, []);

    const handleBlockOpen = useCallback((member: Member) => {
        setSelectedBlock(member);
        setUserBlockOpened(true);
    }, []);

    const handleBlockClose = useCallback(() => {
        setSelectedBlock(null);
        setUserBlockOpened(false);
    }, []);

    const handleUserRemoveOpen = useCallback((member: Member) => {
        setUserRemoveOpened(true);
        setSelectedRemoveUser(member);
    }, []);

    const handleRemoveConfirm = useCallback(() => {
        if (selectedRemoveUser) {
            handleRemoveUser(selectedRemoveUser);
        }
        setUserRemoveOpened(false);
    }, [selectedRemoveUser, handleRemoveUser]);

    // Handle open chat box
    const handleCreateChat = useCallback(
        (id: string) => {
            setCreating(true);
            instance
                .post(`/chat/findorcreate/${id}`)
                .then((res) => {
                    const filtered =
                        (window as any).chats?.filter(
                            (c: any) => c._id === res.data.chat._id,
                        ) || [];

                    if (filtered.length > 0) {
                        router.push(`/chat/${res.data.chat._id}`);
                    } else {
                        // Update Redux store with the new chat
                        dispatch(updateChats(res.data.chat));
                        router.push(`/chat/${res.data.chat._id}`);
                    }
                    setCreating(false);
                })
                .catch((err) => {
                    setCreating(false);
                    console.log(err.message);
                    toast.error(
                        err?.response?.data?.error || 'Failed to create chat',
                    );
                });
        },
        [router, dispatch],
    );

    // Display limited members or all based on showAll state
    const displayMembers = showAll
        ? filteredMembers
        : filteredMembers.slice(0, 15);

    // Skeleton loading component
    const MemberSkeleton = () => (
        <div className='flex items-center justify-between p-3 border-b border-border'>
            <div className='flex items-start gap-3'>
                <Skeleton className='h-9 w-9 rounded-full' />
                <div>
                    <Skeleton className='h-4 w-32 mb-2' />
                    <Skeleton className='h-3 w-20' />
                </div>
            </div>
            <Skeleton className='h-8 w-8 rounded-full' />
        </div>
    );

    return (
        <>
            <div className='space-y-3'>
                {/* Search and filter header */}
                <div className='flex items-center gap-2'>
                    <div className='relative flex-1'>
                        <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
                        <Input
                            type='text'
                            placeholder='Search Members...'
                            className='pl-7 h-9 bg-foreground'
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button variant='secondary' size='icon' className='h-9 w-9'>
                        <SlidersHorizontal className='h-4 w-4' />
                    </Button>
                    <GlobalTooltip tooltip='Add member'>
                        <Button
                            variant='secondary'
                            size='icon'
                            className='h-9 w-9 text-primary'
                            onClick={() => setOpened(true)}
                        >
                            <Plus className='h-4 w-4' />
                        </Button>
                    </GlobalTooltip>
                </div>

                {/* Members list */}
                <div
                    ref={divRef}
                    className='max-h-[500px] overflow-y-auto space-y-0.5 !mt-0 pr-1'
                    onScroll={() =>
                        handleScroll({
                            lastId: members[members?.length - 1]?._id,
                        })
                    }
                >
                    {isLoading ? (
                        // Skeleton loading state
                        Array(6)
                            .fill(0)
                            .map((_, i) => <MemberSkeleton key={i} />)
                    ) : filteredMembers?.length === 0 ? (
                        <div className='text-center py-5'>
                            <h2 className='text-muted-foreground'>
                                {searchQuery
                                    ? 'No members found matching your search'
                                    : 'No members found'}
                            </h2>
                        </div>
                    ) : (
                        displayMembers.map((member, i) => (
                            <div
                                key={i}
                                className={`flex items-center justify-between py-2 px-1 ${i !== displayMembers?.length - 1 && 'border-b'} pb-2`}
                            >
                                <div className='flex items-center gap-3'>
                                    <div
                                        className='relative cursor-pointer'
                                        onClick={() =>
                                            handleCreateChat(member?.user?._id)
                                        }
                                    >
                                        <Avatar className='h-9 w-9'>
                                            <AvatarImage
                                                src={
                                                    member?.user
                                                        .profilePicture ||
                                                    '/chat/user.png'
                                                }
                                                alt={
                                                    member?.user?.fullName ||
                                                    'User'
                                                }
                                            />
                                            <AvatarFallback>
                                                {member?.user?.fullName?.charAt(
                                                    0,
                                                ) || 'U'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span
                                            className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background ${
                                                onlineUsers?.find(
                                                    (x: any) =>
                                                        x?._id ===
                                                        member?.user?._id,
                                                )
                                                    ? 'bg-green-500'
                                                    : 'bg-gray-400'
                                            }`}
                                        />
                                    </div>

                                    <div>
                                        <div className='flex items-center'>
                                            <span className='text-sm font-medium'>
                                                {member?.user?.fullName ||
                                                    'User'}
                                            </span>

                                            {member?.role && (
                                                <Badge className='text-xs text-gray bg-transparent font-normal h-5 px-1.5 shadow-none'>
                                                    {member?.role ===
                                                    'owner' ? (
                                                        <span className='flex items-center gap-0.5'>
                                                            <Crown className='h-3 w-3 text-amber-500' />
                                                            Owner
                                                        </span>
                                                    ) : member?.role ===
                                                      'admin' ? (
                                                        <span className='flex items-center gap-0.5'>
                                                            <ShieldCheck className='h-3 w-3 text-blue-600' />
                                                            Admin
                                                        </span>
                                                    ) : member?.role ===
                                                      'moderator' ? (
                                                        <span className='flex items-center gap-0.5'>
                                                            <Shield className='h-3 w-3 text-blue-500' />
                                                            Moderator
                                                        </span>
                                                    ) : (
                                                        <span className='flex items-center gap-0.5'>
                                                            <Shield className='h-3 w-3 text-gray-500' />
                                                            Member
                                                        </span>
                                                    )}
                                                </Badge>
                                            )}
                                        </div>

                                        {member?.isBlocked ? (
                                            <Badge
                                                variant='destructive'
                                                className='mt-1 text-xs'
                                            >
                                                Blocked Member
                                            </Badge>
                                        ) : (
                                            <p className='text-xs text-muted-foreground mt-0.5'>
                                                {onlineUsers?.find(
                                                    (x: any) =>
                                                        x?._id ===
                                                        member?.user?._id,
                                                ) ? (
                                                    <span className='text-green-500'>
                                                        Active Now
                                                    </span>
                                                ) : (
                                                    `${dayjs(member?.user?.lastActive).fromNow()}`
                                                )}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {['owner', 'admin', 'moderator'].includes(
                                    chat?.myData?.role || '',
                                ) &&
                                    member?.user?._id !== chat?.myData?.user &&
                                    member?.role !== 'owner' && (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant='ghost'
                                                    size='icon'
                                                    className='h-8 w-8'
                                                >
                                                    <MoreVertical className='h-4 w-4' />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent
                                                align='end'
                                                className='w-48'
                                            >
                                                {['owner', 'admin'].includes(
                                                    chat?.myData?.role || '',
                                                ) && (
                                                    <>
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                handleOpenRole(
                                                                    member,
                                                                )
                                                            }
                                                            className='flex items-center gap-2'
                                                        >
                                                            <UserPlus className='h-4 w-4' />
                                                            <span>Role</span>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                handleBlockOpen(
                                                                    member,
                                                                )
                                                            }
                                                            className='flex items-center gap-2'
                                                        >
                                                            <Ban className='h-4 w-4' />
                                                            <span>
                                                                {member?.isBlocked
                                                                    ? 'Unblock'
                                                                    : 'Block'}
                                                            </span>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                handleUserRemoveOpen(
                                                                    member,
                                                                )
                                                            }
                                                            className='flex items-center gap-2'
                                                        >
                                                            <Trash2 className='h-4 w-4' />
                                                            <span>Remove</span>
                                                        </DropdownMenuItem>
                                                    </>
                                                )}
                                                {[
                                                    'owner',
                                                    'admin',
                                                    'moderator',
                                                ].includes(
                                                    chat?.myData?.role || '',
                                                ) && (
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            handleOpenMute(
                                                                member,
                                                            )
                                                        }
                                                        className='flex items-center gap-2'
                                                    >
                                                        <VolumeX className='h-4 w-4' />
                                                        <span>Mute</span>
                                                    </DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    )}
                            </div>
                        ))
                    )}
                </div>

                {/* View more button */}
                {!isLoading && filteredMembers.length > 15 && !showAll && (
                    <Button
                        variant='ghost'
                        className='w-full text-primary text-sm'
                        onClick={() => setShowAll(true)}
                    >
                        View More <ChevronDown className='h-4 w-4 ml-1' />
                    </Button>
                )}
            </div>

            {/* Modals */}
            <ChatRole
                opened={chatRoleOpened}
                close={handleChatClose}
                chat={chat?._id}
                handleUpdateCallback={handleUpdateCallback}
                member={selectedRole}
            />
            <AddUserModal
                channel={chat}
                opened={opened}
                handleCancel={() => setOpened(false)}
            />
            <MuteOption
                opened={muteOptionOpened}
                close={handleMuteClose}
                chat={chat?._id}
                handleUpdateCallback={handleUpdateCallback}
                member={selectedMute}
            />

            <UserBlock
                opened={userBlockOpened}
                close={handleBlockClose}
                chat={chat?._id}
                member={selectedBlock}
                handleUpdateCallback={handleUpdateCallback}
            />

            <ConfirmModal
                text={'Are you sure you want to remove this member?'}
                opened={userRemoveOpened}
                close={() => setUserRemoveOpened(false)}
                confirmText={'Remove'}
                handleConfirm={handleRemoveConfirm}
            />
        </>
    );
};

export default Members;
