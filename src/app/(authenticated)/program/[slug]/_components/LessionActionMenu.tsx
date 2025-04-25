'use client';

import type React from 'react';

import { useState, useEffect, useRef } from 'react';
import {
    Eye,
    Pin,
    Share,
    Calendar,
    MessageSquare,
    MoreVertical,
    CheckCircle,
    CircleCheckBig,
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
import type { TContent } from '@/types';

const LessionActionMenu = ({
    lessonId,
    courseId,
    item,
    setVideoData,
    setIsPinnedEyeOpen,
    videoData,
    onProgressUpdate,
}: {
    lessonId: string;
    courseId: string;
    item: TContent;
    setVideoData: any;
    videoData: any;
    setIsPinnedEyeOpen: React.Dispatch<React.SetStateAction<boolean>>;
    onProgressUpdate?: (lessonId: string, isCompleted: boolean) => void;
}) => {
    if (!item) {
        return <div>Loading...</div>;
    }

    const [isLoading, setIsLoading] = useState(false);
    const [isPinned, setIsPinned] = useState(item.isPinned ?? false);
    const [isCompleted, setIsCompleted] = useState(item.isCompleted ?? false);
    const [isFocused, setIsFocused] = useState(item.isFocused ?? false);

    const initialUpdateDone = useRef(false);

    const [trackChapter] = useTrackChapterMutation();

    useEffect(() => {
        // Only update local state from props when the item changes
        setIsPinned(item.isPinned ?? false);
        setIsCompleted(item.isCompleted ?? false);
        setIsFocused(item.isFocused ?? false);
    }, [item]);

    const handleAction = async (action: string) => {
        setIsLoading(true);
        try {
            // Start optimistic UI update first
            const isCompletingAction = action === 'complete';
            const isUncompletingAction = action === 'incomplete';
            const isPinningAction = action === 'pin';
            const isUnpinningAction = action === 'unpin';

            // Update local state immediately for UI responsiveness
            const actionMap: Record<string, () => void> = {
                focus: () => setIsFocused(true),
                unfocus: () => setIsFocused(false),
                pin: () => {
                    setIsPinned(true);
                    // Update pin status in VideoContent component
                    setIsPinnedEyeOpen(true);

                    // Update the videoData if this is the current active item
                    if (videoData?.contentId === lessonId) {
                        setVideoData((prev: any) => ({
                            ...prev,
                            item: {
                                ...prev.item,
                                isPinned: true,
                            },
                        }));
                    }
                },
                unpin: () => {
                    setIsPinned(false);
                    // Update pin status in VideoContent component
                    setIsPinnedEyeOpen(false);

                    // Update the videoData if this is the current active item
                    if (videoData?.contentId === lessonId) {
                        setVideoData((prev: any) => ({
                            ...prev,
                            item: {
                                ...prev.item,
                                isPinned: false,
                            },
                        }));
                    }
                },
                complete: () => setIsCompleted(true),
                incomplete: () => setIsCompleted(false),
            };

            actionMap[action]?.();

            // If this is a completion action, update the parent component immediately
            if (
                (isCompletingAction || isUncompletingAction) &&
                onProgressUpdate
            ) {
                onProgressUpdate(lessonId, isCompletingAction);
            }

            // Make the API call to update the backend
            await trackChapter({ courseId, action, chapterId: lessonId });

            toast.success(
                `The item has been marked as ${action.charAt(0).toUpperCase() + action.slice(1)} `,
            );
        } catch (error) {
            // If API call fails, revert the local state
            const revertActionMap: Record<string, () => void> = {
                focus: () => setIsFocused(false),
                unfocus: () => setIsFocused(true),
                pin: () => {
                    setIsPinned(false);
                    setIsPinnedEyeOpen(false);

                    // Revert videoData if needed
                    if (videoData?.contentId === lessonId) {
                        setVideoData((prev: any) => ({
                            ...prev,
                            item: {
                                ...prev.item,
                                isPinned: false,
                            },
                        }));
                    }
                },
                unpin: () => {
                    setIsPinned(true);
                    setIsPinnedEyeOpen(true);

                    // Revert videoData if needed
                    if (videoData?.contentId === lessonId) {
                        setVideoData((prev: any) => ({
                            ...prev,
                            item: {
                                ...prev.item,
                                isPinned: true,
                            },
                        }));
                    }
                },
                complete: () => setIsCompleted(false),
                incomplete: () => setIsCompleted(true),
            };

            revertActionMap[action]?.();

            // Revert the parent component state as well
            if (action === 'complete' && onProgressUpdate) {
                onProgressUpdate(lessonId, false);
            } else if (action === 'incomplete' && onProgressUpdate) {
                onProgressUpdate(lessonId, true);
            }

            toast.error('Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const commingSoon = () => toast.warning('Coming Soon...');
    return (
        <>
            <div className='flex items-center gap-3'>
                {isCompleted && (
                    <CircleCheckBig className='h-4 w-4 text-primary-white' />
                )}
                {isPinned && <Pin className='h-4 w-4 stroke-primary-white' />}
                {isFocused && <Eye className='h-4 w-4 stroke-primary-white' />}
            </div>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button
                        className='focus:outline-none'
                        onClick={(e) => e.stopPropagation()}
                    >
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
                        className='fixed inset-0 z-40'
                        onClick={(e) => e.stopPropagation()}
                    ></div>

                    <div className='relative z-50 space-y-2'>
                        {/* Focus / Unfocus */}
                        <DropdownMenuItem
                            onClick={(e) => {
                                e.stopPropagation();
                                handleAction(isFocused ? 'unfocus' : 'focus');
                            }}
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

                        {/* Pin / Unpin */}
                        <DropdownMenuItem
                            onClick={(e) => {
                                e.stopPropagation();
                                handleAction(isPinned ? 'unpin' : 'pin');
                            }}
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

                        {/* Complete / Incomplete */}
                        <DropdownMenuItem
                            onClick={(e) => {
                                e.stopPropagation();
                                handleAction(
                                    isCompleted ? 'incomplete' : 'complete',
                                );
                            }}
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

                        {/* Coming soon items */}
                        <DropdownMenuItem
                            className='w-full flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-foreground text-dark-gray'
                            disabled={isLoading}
                            onClick={(e) => {
                                e.stopPropagation();
                                commingSoon();
                            }}
                        >
                            <Share className='h-4 w-4' />
                            <span>Share</span>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                            className='w-full flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-foreground text-dark-gray'
                            disabled={isLoading}
                            onClick={(e) => {
                                e.stopPropagation();
                                commingSoon();
                            }}
                        >
                            <Calendar className='h-4 w-4' />
                            <span>Add to Calendar</span>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                            className='w-full flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-foreground text-dark-gray'
                            disabled={isLoading}
                            onClick={(e) => {
                                e.stopPropagation();
                                commingSoon();
                            }}
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
