'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Clock, MessagesSquare } from 'lucide-react';
import { instance } from '@/lib/axios/axiosInstance';
import { cn } from '@/lib/utils';

// Extend dayjs with relative time plugin
dayjs.extend(relativeTime);

interface User {
    _id: string;
    firstName: string;
    lastName: string;
    fullName: string;
    profilePicture?: string;
    email?: string;
    isBlocked?: boolean;
    lastActive?: string;
}

interface UserCardProps {
    user: User;
    source?: string;
    isSelected?: boolean;
    onSelect?: (id: string) => void;
}

function UserCard({
    user,
    source,
    isSelected = false,
    onSelect,
}: UserCardProps) {
    const router = useRouter();

    // Determine user's active status based on last activity
    const getUserActiveStatus = () => {
        if (!user.lastActive) {
            return {
                isActive: false,
                activityBadge: '',
            };
        }

        const now = dayjs();
        const lastActive = dayjs(user.lastActive);
        const diffSeconds = now.diff(lastActive, 'second');
        const diffMinutes = now.diff(lastActive, 'minute');
        const diffHours = now.diff(lastActive, 'hour');
        const diffDays = now.diff(lastActive, 'day');
        const diffWeeks = now.diff(lastActive, 'week');
        const diffMonths = now.diff(lastActive, 'month');
        const diffYears = now.diff(lastActive, 'year');

        // Consider user active if last activity was within 5 minutes
        if (diffMinutes <= 5) {
            return {
                isActive: true,
                activityBadge: '',
            };
        }

        // Calculate activity badge based on recent activity
        let activityBadge = '';
        if (diffSeconds < 60) {
            activityBadge = `${diffSeconds}s`;
        } else if (diffMinutes < 60) {
            activityBadge = `${diffMinutes}m`;
        } else if (diffHours < 24) {
            activityBadge = `${diffHours}h`;
        } else if (diffDays < 7) {
            activityBadge = `${diffDays}d`;
        } else if (diffWeeks < 4) {
            activityBadge = `${diffWeeks}w`;
        } else if (diffMonths < 12) {
            activityBadge = `${diffMonths}mo`;
        } else {
            activityBadge = `${diffYears}y`;
        }

        return {
            isActive: false,
            activityBadge,
        };
    };

    // Handle creating a new chat with a user
    const handleCreateChat = useCallback(() => {
        instance
            .post(`/chat/findorcreate/${user._id}`)
            .then((res) => {
                router.push(`/chat/${res.data.chat._id}`);
            })
            .catch((err) => {
                toast.error(
                    err?.response?.data?.error || 'Failed to create chat',
                );
            });
    }, [user._id, router]);

    const { isActive, activityBadge } = getUserActiveStatus();

    return (
        <div className='flex items-center justify-between w-full'>
            <div className='flex items-center space-x-3'>
                <div className='relative inline-block'>
                    <div className='w-12 h-12 rounded-full overflow-hidden'>
                        <Image
                            src={user.profilePicture || '/avatar.png'}
                            alt={user.fullName}
                            width={48}
                            height={48}
                            className='object-cover w-full h-full'
                        />
                    </div>

                    {/* User status indicator */}
                    {user.isBlocked ? (
                        <div className='absolute inset-0 bg-black/50 rounded-full flex items-center justify-center'>
                            <Clock className='h-6 w-6 text-red-500' />
                        </div>
                    ) : (
                        <div
                            className={cn(
                                'absolute bottom-0 right-0 h-3 min-w-[12px] w-fit rounded-full text-pure-white border-[1px] text-[8px] px-1',
                                isActive
                                    ? 'bg-green-500 border-pure-white'
                                    : activityBadge
                                      ? 'bg-green-900 text-pure-white border-green-500'
                                      : 'hidden',
                            )}
                        >
                            {!isActive && activityBadge}
                        </div>
                    )}
                </div>
                <div>
                    <h3 className='font-medium'>{user.fullName}</h3>
                    <p className='text-sm'>
                        {user.isBlocked ? (
                            <span className='text-red-500'>
                                You blocked this contact
                            </span>
                        ) : source === 'search' ? (
                            user.email
                        ) : (
                            <span
                                className={
                                    isActive
                                        ? 'text-green-500'
                                        : 'text-green-500/80'
                                }
                            >
                                {isActive
                                    ? 'Active Now'
                                    : `Last active ${activityBadge} ago`}
                            </span>
                        )}
                    </p>
                </div>
            </div>
            <Button
                variant={isSelected ? 'default' : 'primary_light'}
                size='icon'
                className='rounded-full h-10 w-10'
                onClick={(e) => {
                    e.stopPropagation();
                    handleCreateChat();
                }}
            >
                <MessagesSquare className='h-5 w-5' />
            </Button>
        </div>
    );
}

export default UserCard;
