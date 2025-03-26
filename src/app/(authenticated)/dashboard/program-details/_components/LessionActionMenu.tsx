'use client';

import { useState } from 'react';
import {
    Eye,
    Pin,
    Share,
    Calendar,
    MessageSquare,
    MoreVertical,
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

const LessionActionMenu = ({
    lessonId,
    courseId,
}: {
    lessonId: string;
    courseId: string;
}) => {
    const [focused, setFocused] = useState(false);
    const [pinned, setPinned] = useState(false);
    const [trackChapter, { isLoading }] = useTrackChapterMutation();

    const handleAction = async (action: string) => {
        try {
            // await trackChapter({
            //     courseId,
            //     action,
            //     chapterId: lessonId,
            // }).unwrap();

            await instance.post(`/course/chapterv2/track/${courseId}`, {
                action: action,
                chapterId: lessonId,
            });

            if (action === 'focus') {
                setFocused(true);
            } else if (action === 'unfocus') {
                setFocused(false);
            } else if (action === 'pin') {
                setPinned(true);
            } else if (action === 'unpin') {
                setPinned(false);
            }

            toast.success(`${action} has been successful`);
        } catch (error) {
            toast.error('Something went wrong. Please try again.');
        }
    };
    const commingSoon = () => {
        toast.success('Fetures Coming Soon');
    };

    return (
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
                <div className='relative z-50'>
                    <DropdownMenuItem
                        onClick={() =>
                            handleAction(focused ? 'unfocus' : 'focus')
                        }
                        className={cn(
                            'w-full flex items-center gap-2 px-3 py-2 text-sm cursor-pointer',
                            focused
                                ? 'bg-primary-light text-primary-white'
                                : 'hover:bg-foreground text-dark-gray',
                        )}
                        disabled={isLoading}
                    >
                        <Eye className='h-4 w-4' />
                        <span>{focused ? 'Unfocus' : 'Focus'}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => handleAction(pinned ? 'unpin' : 'pin')}
                        className={cn(
                            'w-full flex items-center gap-2 px-3 py-2 text-sm cursor-pointer',
                            pinned
                                ? 'bg-primary-light text-primary-white'
                                : 'hover:bg-foreground text-dark-gray',
                        )}
                        disabled={isLoading}
                    >
                        <Pin className='h-4 w-4' />
                        <span>{pinned ? 'Unpin' : 'Pin'}</span>
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
    );
};

export default LessionActionMenu;
