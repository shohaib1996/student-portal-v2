'use client';

import React, { useCallback } from 'react';
import dayjs from 'dayjs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PopoverContent } from '@/components/ui/popover';
import {
    BookOpen,
    Briefcase,
    CalendarDays,
    Clock,
    ExternalLink,
    Mail,
    MapPin,
    MessageSquare,
    MessageSquareDashed,
    Phone,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '../ui/separator';
import {
    MentionedUserDetails,
    useFindOrCreateChatMutation,
} from '@/redux/api/chats/chatApi';
import { useRouter } from 'nextjs-toploader/app';
import { toast } from 'sonner';
import GlobalTooltip from '@/components/global/GlobalTooltip';
import { useAppSelector } from '@/redux/hooks';

interface MentionedUserPopoverProps {
    userData: MentionedUserDetails | undefined;
    isLoading: boolean;
    userName: string;
    userId: string;
    align?: 'start' | 'center' | 'end';
}
type TGroup = {
    activeStatus: {
        isActive: boolean;
        activeUntill: string;
    };
    description: string | null;
    _id: string;
    title: string;
};
type TEnrollment = {
    status: string;
    _id: string;
    branch: {
        _id: string;
        name: string;
    };
    program: {
        _id: string;
        title: string;
    };
    session: string;
    id: string;
};
const MentionedUserPopover: React.FC<MentionedUserPopoverProps> = ({
    userData,
    isLoading,
    userName,
    align = 'start',
    userId,
}) => {
    // Format date helper
    const { user } = useAppSelector((state) => state.auth);
    const loggedInUser = user;
    console.log({ userId });
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return dayjs(date).format('MMMM YYYY');
    };

    // Create a className for the moving gradient border
    const gradientBorderClass = 'relative gradient-border overflow-hidden';
    const [findOrCreateChat] = useFindOrCreateChatMutation();
    const router = useRouter();
    const handleCreateChat = useCallback(
        (id: string) => {
            findOrCreateChat(id)
                .unwrap()
                .then((res) => {
                    router.push(`/chat/${res.chat._id}`);
                })
                .catch((err) => {
                    toast.error(err?.data?.error || 'Failed to create chat');
                });
        },
        [findOrCreateChat, router],
    );
    return (
        <PopoverContent
            className={`w-fit max-w-[350px] p-0 bg-background shadow-lg ${gradientBorderClass}`}
            align={align}
            sideOffset={5}
        >
            {/* Animated gradient border effect */}
            <style jsx global>{`
                .gradient-border::before {
                    content: '';
                    position: absolute;
                    top: -2px;
                    left: -2px;
                    right: -2px;
                    bottom: -2px;
                    background: linear-gradient(
                        45deg,
                        var(--primary),
                        #a855f7,
                        #eab308,
                        var(--primary)
                    );
                    background-size: 400% 400%;
                    z-index: -1;
                    animation: gradient 3s ease infinite;
                    border-radius: inherit;
                }
                @keyframes gradient {
                    0% {
                        background-position: 0% 50%;
                    }
                    50% {
                        background-position: 100% 50%;
                    }
                    100% {
                        background-position: 0% 50%;
                    }
                }
                .content-container {
                    background: var(--background);
                    border-radius: inherit;
                    margin: 2px;
                    overflow: hidden;
                }
            `}</style>

            <div className='content-container'>
                {isLoading ? (
                    <div className='p-4 flex items-center justify-center h-20'>
                        <div className='animate-pulse flex space-x-4'>
                            <div className='rounded-full bg-muted h-10 w-10'></div>
                            <div className='flex-1 space-y-2 py-1'>
                                <div className='h-2 bg-muted rounded w-3/4'></div>
                                <div className='h-2 bg-muted rounded w-1/2'></div>
                            </div>
                        </div>
                    </div>
                ) : userData && userData.success ? (
                    <div className='flex flex-col'>
                        {/* Extract user data from response */}
                        {(() => {
                            const user = userData.user;
                            const enrollments = userData.enrollments || [];
                            const groups = userData.groups || [];

                            // Get current program if exists
                            const currentProgram =
                                enrollments.length > 0
                                    ? enrollments[0].program.title
                                    : null;

                            // Get active groups as "roles"
                            const activeGroups = groups
                                .filter((g: any) => g.activeStatus.isActive)
                                .map((g) => g.title);

                            // Format location from address if exists
                            const address = user.personalData?.address;
                            const location =
                                address &&
                                (address.city ||
                                    address.state ||
                                    address.country)
                                    ? [
                                          address.city,
                                          address.state,
                                          address.country,
                                      ]
                                          .filter(Boolean)
                                          .join(', ')
                                    : null;

                            // Get social media links
                            const socialMedia = user.personalData?.socialMedia;
                            const hasSocialMedia =
                                socialMedia &&
                                Object.values(socialMedia).some((val) => val);

                            // Check if user is recently active (within 5 minutes)
                            const isRecentlyActive =
                                new Date(user.lastActive) >
                                new Date(Date.now() - 5 * 60 * 1000);

                            return (
                                <>
                                    {/* Header with background */}
                                    <div className='bg-gradient-to-r from-primary/10 to-primary/5 p-3 relative flex flex-row gap-3 justify-between'>
                                        <div className='flex items-start gap-3'>
                                            <div className='relative'>
                                                <Avatar className='h-16 w-16 border-2 border-primary shadow-sm'>
                                                    <AvatarImage
                                                        src={
                                                            user.profilePicture ||
                                                            '/avatar.png'
                                                        }
                                                        alt={
                                                            user.fullName ||
                                                            userName
                                                        }
                                                    />
                                                    <AvatarFallback className='text-lg'>
                                                        {(
                                                            user
                                                                .firstName?.[0] ||
                                                            userName[0]
                                                        ).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                {isRecentlyActive && (
                                                    <div className='absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-green-500' />
                                                )}
                                            </div>
                                            <div className='flex-1 space-y-1'>
                                                <div className='flex items-center justify-between'>
                                                    <h3 className='font-semibold text-lg leading-tight'>
                                                        {user.fullName}
                                                    </h3>
                                                </div>
                                                {activeGroups.length > 0 && (
                                                    <p className='text-sm font-medium text-gray'>
                                                        {activeGroups[0]}
                                                    </p>
                                                )}
                                                {activeGroups.length > 1 && (
                                                    <p className='text-xs text-gray flex items-center gap-1'>
                                                        <Briefcase className='h-3 w-3' />
                                                        {activeGroups[1]}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        {loggedInUser?._id !== user?._id && (
                                            <GlobalTooltip
                                                tooltip={`Click to chat with ${user.fullName}`}
                                            >
                                                <Button
                                                    size='icon'
                                                    className=' text-xs rounded-full !text-pure-white'
                                                    onClick={() =>
                                                        handleCreateChat(userId)
                                                    }
                                                >
                                                    <MessageSquare />
                                                </Button>
                                            </GlobalTooltip>
                                        )}
                                    </div>

                                    {/* User details */}
                                    <div className='p-3 space-y-3'>
                                        <div className='grid grid-cols-1 gap-2 text-sm'>
                                            {location && (
                                                <div className='flex items-center gap-2 text-gray'>
                                                    <MapPin className='h-3.5 w-3.5' />
                                                    <span className='max-w-[280px] truncate'>
                                                        {location}
                                                    </span>
                                                </div>
                                            )}
                                            {user.email && (
                                                <div className='flex items-center gap-2 text-gray'>
                                                    <Mail className='h-3.5 w-3.5' />
                                                    <span className='max-w-[280px] truncate'>
                                                        {user.email}
                                                    </span>
                                                </div>
                                            )}
                                            {user.phone?.number && (
                                                <div className='flex items-center gap-2 text-gray'>
                                                    <Phone className='h-3.5 w-3.5' />
                                                    <span className='max-w-[280px] truncate'>
                                                        +
                                                        {user.phone.countryCode}{' '}
                                                        {user.phone.number}
                                                    </span>
                                                </div>
                                            )}
                                            {currentProgram && (
                                                <div className='flex items-center gap-2 text-gray'>
                                                    <BookOpen className='h-3.5 w-3.5' />
                                                    <span className='max-w-[280px] truncate'>
                                                        {currentProgram}
                                                    </span>
                                                </div>
                                            )}
                                            {enrollments.length > 0 &&
                                                enrollments[0].branch && (
                                                    <div className='flex items-center gap-2 text-gray'>
                                                        <CalendarDays className='h-3.5 w-3.5' />
                                                        <span className='max-w-[280px] truncate'>
                                                            {
                                                                enrollments[0]
                                                                    .branch.name
                                                            }
                                                        </span>
                                                    </div>
                                                )}
                                            {user.lastActive && (
                                                <div className='flex items-center gap-2 text-gray'>
                                                    <Clock className='h-3.5 w-3.5' />
                                                    <span className='max-w-[280px] truncate'>
                                                        Joined{' '}
                                                        {formatDate(
                                                            user.lastActive,
                                                        )}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        {/* Enrollment Status
                                        {enrollments.length > 0 && (
                                            <>
                                                <Separator />
                                                <div className='flex flex-row items-center gap-3 justify-between'>
                                                    <h4 className='text-xs font-medium text-dark-gray mb-2'>
                                                        ENROLLMENT
                                                    </h4>
                                                    <div className='flex flex-wrap gap-1.5'>
                                                        {enrollments.map(
                                                            (
                                                                enrollment: TEnrollment,
                                                            ) => (
                                                                <Badge
                                                                    key={
                                                                        enrollment._id
                                                                    }
                                                                    variant='outline'
                                                                    className={`text-xs ${enrollment.status === 'approved' ? 'bg-green-500/10 text-green-600' : 'bg-yellow-500/10 text-yellow-600'}`}
                                                                >
                                                                    {enrollment.status
                                                                        .charAt(
                                                                            0,
                                                                        )
                                                                        .toUpperCase() +
                                                                        enrollment.status.slice(
                                                                            1,
                                                                        )}
                                                                </Badge>
                                                            ),
                                                        )}
                                                    </div>
                                                </div>
                                            </>
                                        )} */}
                                        {/* Groups */}
                                        {groups.length > 0 && (
                                            <>
                                                <Separator />
                                                <div>
                                                    <h4 className='text-xs font-medium text-dark-gray mb-2'>
                                                        GROUPS
                                                    </h4>
                                                    <div className='flex flex-wrap gap-1.5 text-gray'>
                                                        {groups.map(
                                                            (group: TGroup) => (
                                                                <Badge
                                                                    key={
                                                                        group._id
                                                                    }
                                                                    variant='secondary'
                                                                    className={`text-xs ${group.activeStatus.isActive ? 'bg-foreground' : 'bg-foreground/50'}`}
                                                                >
                                                                    {
                                                                        group.title
                                                                    }
                                                                    {group.description && (
                                                                        <span className='ml-1 text-gray-400 text-xs'>
                                                                            (
                                                                            {
                                                                                group.description
                                                                            }
                                                                            )
                                                                        </span>
                                                                    )}
                                                                </Badge>
                                                            ),
                                                        )}
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                        {/* Social Media */}
                                        {hasSocialMedia && (
                                            <>
                                                <Separator />
                                                <div>
                                                    <h4 className='text-xs font-medium text-dark-gray mb-2'>
                                                        SOCIAL
                                                    </h4>
                                                    <div className='flex flex-wrap gap-2'>
                                                        {socialMedia?.github && (
                                                            <a
                                                                href={`${socialMedia.github}`}
                                                                target='_blank'
                                                                rel='noopener noreferrer'
                                                                className='text-gray hover:text-primary'
                                                            >
                                                                <svg
                                                                    className='h-4 w-4'
                                                                    viewBox='0 0 24 24'
                                                                    fill='currentColor'
                                                                >
                                                                    <path d='M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z' />
                                                                </svg>
                                                            </a>
                                                        )}
                                                        {socialMedia?.linkedin && (
                                                            <a
                                                                href={`${socialMedia.linkedin}`}
                                                                target='_blank'
                                                                rel='noopener noreferrer'
                                                                className='text-gray hover:text-primary'
                                                            >
                                                                <svg
                                                                    className='h-4 w-4'
                                                                    viewBox='0 0 24 24'
                                                                    fill='currentColor'
                                                                >
                                                                    <path d='M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z' />
                                                                </svg>
                                                            </a>
                                                        )}
                                                        {socialMedia?.twitter && (
                                                            <a
                                                                href={`${socialMedia.twitter}`}
                                                                target='_blank'
                                                                rel='noopener noreferrer'
                                                                className='text-gray hover:text-primary'
                                                            >
                                                                <svg
                                                                    className='h-4 w-4'
                                                                    viewBox='0 0 24 24'
                                                                    fill='currentColor'
                                                                >
                                                                    <path d='M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z' />
                                                                </svg>
                                                            </a>
                                                        )}
                                                        {socialMedia?.facebook && (
                                                            <a
                                                                href={`${socialMedia.facebook}`}
                                                                target='_blank'
                                                                rel='noopener noreferrer'
                                                                className='text-gray hover:text-primary'
                                                            >
                                                                <svg
                                                                    className='h-4 w-4'
                                                                    viewBox='0 0 24 24'
                                                                    fill='currentColor'
                                                                >
                                                                    <path d='M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z' />
                                                                </svg>
                                                            </a>
                                                        )}
                                                        {socialMedia?.instagram && (
                                                            <a
                                                                href={`${socialMedia.instagram}`}
                                                                target='_blank'
                                                                rel='noopener noreferrer'
                                                                className='text-gray hover:text-primary'
                                                            >
                                                                <svg
                                                                    className='h-4 w-4'
                                                                    viewBox='0 0 24 24'
                                                                    fill='currentColor'
                                                                >
                                                                    <path d='M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z' />
                                                                </svg>
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                        {/* Bio section - moved after skills as requested */}
                                        {user.personalData?.bio && (
                                            <>
                                                <Separator />
                                                <div>
                                                    <h4 className='text-xs font-medium text-dark-gray mb-1'>
                                                        BIO
                                                    </h4>
                                                    <p className='text-sm line-clamp-3 text-gray'>
                                                        {user.personalData.bio}
                                                    </p>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </>
                            );
                        })()}
                    </div>
                ) : (
                    <div className='p-4 text-center'>
                        <p className='text-sm text-gray'>User not found</p>
                    </div>
                )}
            </div>
        </PopoverContent>
    );
};

export default MentionedUserPopover;
