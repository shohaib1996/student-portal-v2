import Image from 'next/image';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { cn } from '@/lib/utils';
import { TUser } from '@/types/auth';
import { useAppSelector } from '@/redux/hooks';

// Extend dayjs with relative time plugin
dayjs.extend(relativeTime);

export function TdUser({
    user,
    className,
    showStatus = true,
}: {
    user: TUser;
    className?: string;
    showStatus?: boolean;
}) {
    const { onlineUsers } = useAppSelector((s) => s.chat);

    // Determine user's active status based on last activity
    const getUserActiveStatus = () => {
        if (!user.lastActive) {
            return {
                isActive: false,
                activityBadge: '',
            };
        }

        // Check if user is in online users list or recently active
        const now = dayjs();
        const lastActive = dayjs(user.lastActive);
        const diffSeconds = now.diff(lastActive, 'second');
        const diffMinutes = now.diff(lastActive, 'minute');
        const diffHours = now.diff(lastActive, 'hour');
        const diffDays = now.diff(lastActive, 'day');
        const diffWeeks = now.diff(lastActive, 'week');
        const diffMonths = now.diff(lastActive, 'month');
        const diffYears = now.diff(lastActive, 'year');

        const isOnlineUser = onlineUsers?.find((u) => u?._id === user?._id);

        // Consider user active if in online users or within 5 minutes
        if (isOnlineUser || diffMinutes <= 5) {
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
            activityBadge = `${diffMonths} mo`;
        } else {
            activityBadge = `${diffYears}y`;
        }

        return {
            isActive: false,
            activityBadge,
        };
    };

    const { isActive, activityBadge } = getUserActiveStatus();

    return (
        <div className={cn('flex items-center gap-3', className)}>
            <div className='relative inline-block'>
                <div className='size-10 rounded-full overflow-hidden'>
                    <Image
                        src={user?.profilePicture || '/avatar.png'}
                        alt={`${user?.firstName}'s avatar`}
                        width={40}
                        height={40}
                        className='object-cover'
                    />
                </div>

                {showStatus && (
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
            <div className='flex flex-col text-start'>
                <span className='text-sm font-medium text-black'>
                    {user?.fullName}
                </span>
                <span className={cn('text-xs text-gray')}>
                    {/* {isActive
                        ? 'Active Now'
                        : `Last active ${activityBadge} ago`} */}
                    {user?.email}
                </span>
            </div>
        </div>
    );
}
