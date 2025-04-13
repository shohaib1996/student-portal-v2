'use client';

import { useState } from 'react';
import {
    Eye,
    Pin,
    Share,
    Calendar,
    MessageSquare,
    MoreVertical,
    CheckCircle,
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useTrackChapterMutation } from '@/redux/api/course/courseApi';
import { toast } from 'sonner';
import { instance } from '@/lib/axios/axiosInstance';
import { TContent } from '@/types';

const LessionActionMenu = ({
    lessonId,
    courseId,
    item,
}: {
    lessonId: string;
    courseId: string;
    item: TContent;
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isPinned, setIsPinned] = useState(item.isPinned || false);
    const [isCompleted, setIsCompleted] = useState(item.isCompleted || false);
    const [isFocused, setIsFocused] = useState(item.isFocused || false);
    const [trackChapter] = useTrackChapterMutation();

    const handleAction = async (action: string) => {
        setIsLoading(true);
        try {
            // await instance.post(`/course/chapterv2/track/${courseId}`, {
            //     action: action,
            //     chapterId: lessonId,
            // });
            trackChapter({ courseId, action, chapterId: lessonId });
            // Update local state based on the action
            if (action === 'focus') {
                setIsFocused(true);
            } else if (action === 'unfocus') {
                setIsFocused(false);
            } else if (action === 'pin') {
                setIsPinned(true);
            } else if (action === 'unpin') {
                setIsPinned(false);
            } else if (action === 'complete') {
                setIsCompleted(true);
            } else if (action === 'incomplete') {
                setIsCompleted(false);
            }

            toast.success(
                `${action.charAt(0).toUpperCase() + action.slice(1)} has been successful`,
            );
        } catch (error) {
            toast.error('Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const commingSoon = () => {
        toast.success('Coming Soon...');
    };

    return (
        <>
            {' '}
            <span>
                {isPinned && <Pin className='h-4 w-4 text-primary-white' />}
            </span>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button className='focus:outline-none'>
                        <MoreVertical className='h-5 w-5 text-dark-gray' />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    className={cn(
                        'absolute right-0 top-full mt-1 z-50 bg-foreground rounded-md shadow-md border border-border w-[200px] py-1 overflow-hidden',
                    )}
                    align='end'
                    side='bottom'
                >
                    <div
                        className='fixed inset-0 z-40 '
                        onClick={(e) => e.stopPropagation()}
                    ></div>
                    <div className='relative z-50 space-y-2'>
                        <DropdownMenuItem
                            onClick={() =>
                                handleAction(isFocused ? 'unfocus' : 'focus')
                            }
                            className={cn(
                                'w-full flex items-center gap-2 px-3 py-2 text-sm cursor-pointer',
                                isFocused
                                    ? 'bg-primary-light text-primary-white'
                                    : 'hover:bg-foreground text-dark-gray',
                            )}
                            disabled={isLoading}
                        >
                            <Eye className='h-4 w-4' />
                            <span>{isFocused ? 'Unfocus' : 'Focus'}</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() =>
                                handleAction(isPinned ? 'unpin' : 'pin')
                            }
                            className={cn(
                                'w-full flex items-center gap-2 px-3 py-2 text-sm cursor-pointer',
                                isPinned
                                    ? 'bg-primary-light text-primary-white'
                                    : 'hover:bg-foreground text-dark-gray',
                            )}
                            disabled={isLoading}
                        >
                            <Pin className='h-4 w-4' />
                            <span>{isPinned ? 'Unpin' : 'Pin'}</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() =>
                                handleAction(
                                    isCompleted ? 'incomplete' : 'complete',
                                )
                            }
                            className={cn(
                                'w-full flex items-center gap-2 px-3 py-2 text-sm cursor-pointer',
                                isCompleted
                                    ? 'bg-primary-light text-primary-white'
                                    : 'hover:bg-foreground text-dark-gray',
                            )}
                            disabled={isLoading}
                        >
                            <CheckCircle className='h-4 w-4' />
                            <span>
                                {isCompleted ? 'Incomplete' : 'Complete'}
                            </span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className={cn(
                                'w-full flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-foreground text-dark-gray',
                            )}
                            disabled={isLoading}
                            onClick={commingSoon}
                        >
                            <Share className='h-4 w-4' />
                            <span>Share</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className={cn(
                                'w-full flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-foreground text-dark-gray',
                            )}
                            disabled={isLoading}
                            onClick={commingSoon}
                        >
                            <Calendar className='h-4 w-4' />
                            <span>Add to Calendar</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className={cn(
                                'w-full flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-foreground text-dark-gray',
                            )}
                            disabled={isLoading}
                            onClick={commingSoon}
                        >
                            <MessageSquare className='h-4 w-4' />
                            <span>Add to Chat</span>
                        </DropdownMenuItem>
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
};

export default LessionActionMenu;
