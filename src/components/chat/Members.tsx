'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import axios from 'axios';
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
    Loader2,
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { updateChats, updateMembersCount } from '@/redux/features/chatReducer';
import chats from './chats.json';
import onlineUsers from './onlineUsers.json';

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
    chat: Chat;
}

// Initialize dayjs plugins
dayjs.extend(relativeTime);

const Members: React.FC<MembersProps> = ({ chat }) => {
    const [members, setMembers] = useState<Member[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedMute, setSelectedMute] = useState<Member | null>(null);
    const [selectedRole, setSelectedRole] = useState<Member | null>(null);
    const [selectedBlock, setSelectedBlock] = useState<Member | null>(null);
    const [selectedRemoveUser, setSelectedRemoveUser] = useState<Member | null>(
        null,
    );
    const [creating, setCreating] = useState(false);
    const router = useRouter();

    // Redux state and dispatch
    const dispatch = useAppDispatch();
    // const { chats, onlineUsers } = useAppSelector((state: any) => state.chat);
    const { user } = useAppSelector((state) => state.auth);

    const divRef = useRef<HTMLDivElement>(null);

    const fetchMembers = useCallback(
        (options: { limit: number; lastId?: string }) => {
            console.log(chat?._id);

            if (!chat?._id) {
                return;
            }
            setIsLoading(true);
            axios
                .post(`/chat/members/${chat?._id}`, options)
                .then((res) => {
                    setMembers(res.data?.results || []);
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
                axios
                    .post(`/chat/members/${chat?._id}`, { lastId, limit: 50 })
                    .then((res) => {
                        setMembers((prev) => [
                            ...prev,
                            ...(res.data?.results || []),
                        ]);
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
        [chat],
    );

    useEffect(() => {
        if (chat) {
            fetchMembers({ limit: 50 });
        }
    }, [chat, fetchMembers]);

    const handleRemoveUser = useCallback(
        (member: Member) => {
            const data = {
                member,
            };

            axios
                .patch(`/chat/channel/remove-user/${chat._id}`, data)
                .then((res) => {
                    setMembers((prev) =>
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

    const handleUpdateCallback = useCallback(
        (member: any) => {
            const arr = [...members];
            const index = arr.findIndex((x) => x._id === member?._id);

            if (index !== -1) {
                arr[index] = { ...arr[index], ...member };
                setMembers(arr);
            }

            setSelectedMute(null);
        },
        [members],
    );

    // Modal states
    const [chatRoleOpened, setChatRoleOpened] = useState(false);
    const [muteOptionOpened, setMuteOptionOpened] = useState(false);
    const [userBlockOpened, setUserBlockOpened] = useState(false);
    const [userRemoveOpened, setUserRemoveOpened] = useState(false);

    const handleChatClose = useCallback(() => {
        setSelectedRole(null);
        setChatRoleOpened(false);
    }, []);

    const handleOpenRole = useCallback((member: Member) => {
        setSelectedRole(member);
        setChatRoleOpened(true);
    }, []);

    const handleOpenMute = useCallback((member: Member) => {
        console.log(member);
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
            axios
                .post(`/chat/findorcreate/${id}`)
                .then((res) => {
                    const filtered = chats.filter(
                        (c: any) => c._id === res.data.chat._id,
                    );

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
        [chats, router, dispatch],
    );

    const findOnlineUser = useCallback((time?: string) => {
        if (!time) {
            return '';
        }
        const userTime = dayjs(time).fromNow();
        const nowTime = dayjs(new Date()).fromNow();

        return userTime === nowTime ? 'Active' : userTime || '';
    }, []);

    return (
        <>
            <div
                ref={divRef}
                className='max-h-[400px] overflow-y-auto space-y-1 pr-1'
                onScroll={() =>
                    handleScroll({ lastId: members[members?.length - 1]?._id })
                }
            >
                {isLoading ? (
                    <div className='flex justify-center items-center py-5'>
                        <Loader2 className='h-6 w-6 text-primary animate-spin' />
                    </div>
                ) : members?.length === 0 ? (
                    <div className='text-center py-5'>
                        <h2 className='text-muted-foreground'>
                            {`Don't have any members!`}
                        </h2>
                    </div>
                ) : (
                    [...members].map((member, i) => (
                        <div
                            key={i}
                            className='flex items-center justify-between p-3 border-b border-border last:border-0 members-card'
                        >
                            <div className='flex items-start gap-3 side-content'>
                                <div
                                    className='relative cursor-pointer'
                                    onClick={() =>
                                        handleCreateChat(member?.user?._id)
                                    }
                                >
                                    <Avatar className='h-9 w-9 avater avater-hover'>
                                        <AvatarImage
                                            src={
                                                member?.user.profilePicture ||
                                                '/chat/user.png'
                                            }
                                            alt='avatar'
                                        />
                                        <AvatarFallback>
                                            {member?.user?.fullName?.charAt(
                                                0,
                                            ) || 'U'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span
                                        className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ${
                                            onlineUsers?.find(
                                                (x: any) =>
                                                    x?._id ===
                                                    member?.user?._id,
                                            )
                                                ? 'bg-green-500'
                                                : 'bg-gray-500'
                                        }`}
                                    />
                                </div>

                                <div className='content-wrapper'>
                                    <div>
                                        <h4 className='text-sm font-medium flex items-center flex-wrap gap-1'>
                                            {user?._id === member?.user?._id ? (
                                                `${member?.user?.firstName || member?.user?.fullName} (Me)`
                                            ) : (
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <span
                                                                className='cursor-pointer'
                                                                onClick={() =>
                                                                    handleCreateChat(
                                                                        member
                                                                            ?.user
                                                                            ?._id,
                                                                    )
                                                                }
                                                            >
                                                                {member?.user?.fullName?.slice(
                                                                    0,
                                                                    30,
                                                                ) ||
                                                                    'TS4U User (deleted)'}
                                                            </span>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>
                                                                {
                                                                    member?.user
                                                                        ?.fullName
                                                                }
                                                            </p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            )}

                                            {member?.role &&
                                                member?.role !== 'member' && (
                                                    <Badge
                                                        variant='outline'
                                                        className='bg-primary/10 text-xs font-medium flex items-center gap-1'
                                                    >
                                                        {member?.role ===
                                                        'owner' ? (
                                                            <>
                                                                <Crown className='h-3 w-3 text-amber-500' />
                                                                <span>
                                                                    Owner
                                                                </span>
                                                            </>
                                                        ) : member?.role ===
                                                          'admin' ? (
                                                            <>
                                                                <ShieldCheck className='h-3 w-3 text-blue-600' />
                                                                <span>
                                                                    Admin
                                                                </span>
                                                            </>
                                                        ) : member?.role ===
                                                          'moderator' ? (
                                                            <>
                                                                <Shield className='h-3 w-3 text-blue-500' />
                                                                <span>
                                                                    Moderator
                                                                </span>
                                                            </>
                                                        ) : null}
                                                    </Badge>
                                                )}
                                        </h4>
                                    </div>

                                    {member?.isBlocked ? (
                                        <Badge
                                            variant='destructive'
                                            className='mt-1 text-xs'
                                        >
                                            Blocked
                                        </Badge>
                                    ) : dayjs(member?.user?.lastActive).diff(
                                          dayjs(),
                                          'months',
                                      ) <= -2 ? (
                                        <p className='text-xs text-muted-foreground mt-1 last-seen'>
                                            Not Applicable
                                        </p>
                                    ) : (
                                        <p className='text-xs text-muted-foreground mt-1 last-seen'>
                                            {onlineUsers?.find(
                                                (x: any) =>
                                                    x?._id ===
                                                    member?.user?._id,
                                            ) ? (
                                                <span className='text-green-500'>
                                                    Active now
                                                </span>
                                            ) : (
                                                dayjs(
                                                    member?.user?.lastActive,
                                                ).fromNow()
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
                                            <button className='p-1 rounded-md hover:bg-muted transition-colors action-btn'>
                                                <MoreVertical className='h-4 w-4 text-muted-foreground' />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent
                                            align='end'
                                            className='w-48 member-card-menu'
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
                                                        className='flex items-center gap-2 member-card-item'
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
                                                        className='flex items-center gap-2 member-card-item'
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
                                                        className='flex items-center gap-2 member-card-item'
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
                                                        handleOpenMute(member)
                                                    }
                                                    className='flex items-center gap-2 member-card-item'
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

            <ChatRole
                opened={chatRoleOpened}
                close={handleChatClose}
                chat={chat?._id}
                handleUpdateCallback={handleUpdateCallback}
                member={selectedRole}
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
