'use client';

import Image from 'next/image';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { cn } from '@/lib/utils';

// Extend dayjs with relative time plugin
dayjs.extend(relativeTime);

// Define user type with all possible properties
interface User {
    _id?: string;
    firstName?: string;
    lastName?: string;
    fullName?: string;
    profilePicture?: string;
    lastActive?: string;
    email?: string;
    type?: string;
    isBlocked?: boolean;
}

// Avatar component props
interface GlobalAvatarProps {
    user: User;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    showBadge?: boolean;
    className?: string;
    fallbackClassName?: string;
}

// Utility function to get user's active status
const getUserActiveStatus = (lastActive?: string) => {
    if (!lastActive) {
        return {
            isActive: false,
            activityBadge: '',
        };
    }

    const now = dayjs();
    const lastActiveTime = dayjs(lastActive);
    const diffSeconds = now.diff(lastActiveTime, 'second');
    const diffMinutes = now.diff(lastActiveTime, 'minute');
    const diffHours = now.diff(lastActiveTime, 'hour');
    const diffDays = now.diff(lastActiveTime, 'day');
    const diffWeeks = now.diff(lastActiveTime, 'week');
    const diffMonths = now.diff(lastActiveTime, 'month');
    const diffYears = now.diff(lastActiveTime, 'year');

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

// Main Avatar Component
export function GlobalAvatar({
    user,
    size = 'md',
    showBadge = true,
    className,
    fallbackClassName,
}: GlobalAvatarProps) {
    // Determine avatar size classes
    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-10 h-10',
        lg: 'w-12 h-12',
        xl: 'w-16 h-16',
    };

    // Get user's active status
    const { isActive, activityBadge } = getUserActiveStatus(user.lastActive);

    // Determine fallback text
    const fallbackText = user.firstName
        ? user.firstName.charAt(0).toUpperCase()
        : user.fullName
          ? user.fullName.charAt(0).toUpperCase()
          : 'U';

    // Determine image source
    const imageSrc = user.profilePicture || '/avatar.png';

    return (
        <div className={cn('relative inline-block', className)}>
            <div
                className={cn(
                    'rounded-full overflow-hidden',
                    sizeClasses[size],
                )}
            >
                <Image
                    src={imageSrc}
                    alt={user.fullName || 'User Avatar'}
                    width={64}
                    height={64}
                    className='object-cover w-full h-full'
                />
            </div>

            {/* Badge for blocked or active/recent status */}
            {showBadge && (
                <>
                    {user.isBlocked ? (
                        <div
                            className='absolute inset-0 bg-black/50 rounded-full flex items-center justify-center'
                            title='Blocked User'
                        >
                            <span className='text-red-500'>🚫</span>
                        </div>
                    ) : (
                        <div
                            className={cn(
                                'absolute bottom-0 right-0 h-3 min-w-[12px] w-fit rounded-full border-[1px] text-[8px] px-1',
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
                </>
            )}
        </div>
    );
}

// Export as default for easier importing
export default GlobalAvatar;
