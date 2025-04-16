'use client';

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
import { TContent } from '@/types';

const LessionActionMenu = ({
    lessonId,
    courseId,
    item,
    setVideoData,
    videoData,
}: {
    lessonId: string;
    courseId: string;
    item: TContent;
    setVideoData: any;
    videoData: any;
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isPinned, setIsPinned] = useState(item.isPinned || false);
    const [isCompleted, setIsCompleted] = useState(item.isCompleted || false);
    const [isFocused, setIsFocused] = useState(item.isFocused || false);

    // Use a ref to track if the effect has already run
    const initialUpdateDone = useRef(false);

    const [trackChapter] = useTrackChapterMutation();
    const updateVideoData = (updates: Partial<TContent | any>) => {
        setVideoData((prev: any) => {
            // Only update if it's actually different to prevent loops
            if (
                prev?.item?.isPinned === updates.isPinned &&
                prev?.item?.isCompleted === updates.isCompleted &&
                prev?.item?.isFocused === updates.isFocused
            ) {
                return prev;
            }

            return {
                ...prev,
                item: {
                    ...prev.item,
                    courseId,
                    chapterId: lessonId,
                    ...updates,
                },
            };
        });
    };

    // Only run this effect once on component mount
    useEffect(() => {
        if (!initialUpdateDone.current) {
            updateVideoData({
                isPinned: item.isPinned || false,
                isCompleted: item.isCompleted || false,
                isFocused: item.isFocused || false,
                courseId,
                chapterId: lessonId,
            });
            initialUpdateDone.current = true;
        }
    }, []);

    // Update when state changes, but with proper dependency array
    useEffect(() => {
        // Skip the first render to avoid duplicate updates
        if (initialUpdateDone.current) {
            updateVideoData({
                isPinned,
                isCompleted,
                isFocused,
                courseId,
                chapterId: lessonId,
            });
        }
    }, [isPinned, isCompleted, isFocused, courseId, lessonId, videoData]);

    // Update component state when item props change
    useEffect(() => {
        setIsPinned(item.isPinned || false);
        setIsCompleted(item.isCompleted || false);
        setIsFocused(item.isFocused || false);
    }, [item.isPinned, item.isCompleted, item.isFocused]);

    const handleAction = async (action: string) => {
        setIsLoading(true);
        try {
            await trackChapter({ courseId, action, chapterId: lessonId });

            const actionMap: Record<string, () => void> = {
                focus: () => setIsFocused(true),
                unfocus: () => setIsFocused(false),
                pin: () => setIsPinned(true),
                unpin: () => setIsPinned(false),
                complete: () => setIsCompleted(true),
                incomplete: () => setIsCompleted(false),
            };

            actionMap[action]?.();

            toast.success(
                `${action.charAt(0).toUpperCase() + action.slice(1)} has been successful`,
            );
        } catch (error) {
            toast.error('Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const commingSoon = () => toast.success('Coming Soon...');

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
                        className='fixed inset-0 z-40'
                        onClick={(e) => e.stopPropagation()}
                    ></div>

                    <div className='relative z-50 space-y-2'>
                        {/* Focus / Unfocus */}
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

                        {/* Pin / Unpin */}
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

                        {/* Complete / Incomplete */}
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

                        {/* Coming soon items */}
                        <DropdownMenuItem
                            className='w-full flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-foreground text-dark-gray'
                            disabled={isLoading}
                            onClick={commingSoon}
                        >
                            <Share className='h-4 w-4' />
                            <span>Share</span>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                            className='w-full flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-foreground text-dark-gray'
                            disabled={isLoading}
                            onClick={commingSoon}
                        >
                            <Calendar className='h-4 w-4' />
                            <span>Add to Calendar</span>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                            className='w-full flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-foreground text-dark-gray'
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
