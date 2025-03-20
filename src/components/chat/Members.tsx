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
                opened={userRemoveOpened}
                close={() => setUserRemoveOpened(false)}
                handleConfirm={handleRemoveConfirm}
                text='Are you sure you want to remove this member?'
                subtitle='This action cannot be undone.'
                icon={
                    <div className='bg-red-500/20 rounded-full p-2'>
                        <svg
                            width='60'
                            height='60'
                            viewBox='0 0 62 62'
                            fill='none'
                            xmlns='http://www.w3.org/2000/svg'
                        >
                            <g clipPath='url(#clip0_1_29949)'>
                                <path
                                    d='M29.1306 29.1323C34.1377 29.1323 38.1968 25.0733 38.1968 20.0662C38.1968 15.0591 34.1377 11 29.1306 11C24.1235 11 20.0645 15.0591 20.0645 20.0662C20.0645 25.0733 24.1235 29.1323 29.1306 29.1323Z'
                                    fill='#DF2B2B'
                                />
                                <path
                                    d='M42.3313 37.1289C42.1139 37.2918 41.8961 37.4547 41.7146 37.6548H41.6965C40.6814 36.6207 39.3215 36.0585 37.8527 36.0585C36.402 36.0585 35.042 36.6207 34.0266 37.6548C31.9234 39.7399 31.9052 43.1671 34.0085 45.3425C33.5047 45.8462 33.1176 46.4224 32.86 47.0457C32.8054 47.1778 32.6835 47.2646 32.5404 47.2646H20.0647C17.2169 47.2646 14.756 45.0696 14.6336 42.2244C14.4105 37.0388 18.5541 32.7588 23.6911 32.7588H34.5705C37.8526 32.7586 40.7353 34.517 42.3313 37.1289Z'
                                    fill='#DF2B2B'
                                />
                                <path
                                    d='M46.8461 47.8998C47.5535 48.6072 47.5535 49.7671 46.8461 50.4744C46.4835 50.8188 46.0302 51.0004 45.5587 51.0004C45.0872 51.0004 44.634 50.8189 44.2714 50.4744L41.7144 47.9175L39.1398 50.4744C38.7954 50.8188 38.324 51.0004 37.8707 51.0004C37.3992 51.0004 36.9459 50.8189 36.5829 50.4744C35.876 49.767 35.876 48.6072 36.5829 47.8998L39.1399 45.3429L36.5829 42.7868C35.876 42.0608 35.876 40.9187 36.5829 40.2112C37.2904 39.5038 38.4325 39.5038 39.1399 40.2112L41.7145 42.7682L44.2715 40.2112C44.9784 39.5038 46.1387 39.5038 46.8461 40.2112C47.5535 40.9187 47.5535 42.0608 46.8461 42.7868L44.2891 45.3429L46.8461 47.8998Z'
                                    fill='#DF2B2B'
                                />
                            </g>
                            <defs>
                                <clipPath id='clip0_1_29949'>
                                    <rect
                                        width='40'
                                        height='40'
                                        fill='white'
                                        transform='translate(11 11)'
                                    />
                                </clipPath>
                            </defs>
                        </svg>
                    </div>
                }
            />
        </>
    );
};

export default Members;
