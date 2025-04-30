'use client';

import {
    CalendarDays,
    Eye,
    Gauge,
    User,
    Paperclip,
    BarChart,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from './status-badge';
import { useState, useEffect } from 'react';
import dayjs from 'dayjs';

export type TaskStatus =
    | 'not_answered'
    | 'completed'
    | 'pending'
    | 'rejected'
    | 'accepted';

export interface Task {
    id: string;
    title: string;
    marks: number;
    deadline: string;
    workshop: string;
    status: TaskStatus;
    category?: string;
    attachments?: number;
    obtainedMark?: number;
}

interface TaskCardProps {
    task: Task;
    onTestNow?: () => void;
    onSeeResult?: () => void;
}

export default function TaskCard({
    task,
    onTestNow,
    onSeeResult,
}: TaskCardProps) {
    const [isMobile, setIsMobile] = useState(false);

    // Check for mobile screen size
    useEffect(() => {
        const checkForMobile = () => {
            setIsMobile(window.innerWidth < 640);
        };

        // Initial check
        checkForMobile();

        // Add event listener for window resize
        window.addEventListener('resize', checkForMobile);

        // Cleanup
        return () => window.removeEventListener('resize', checkForMobile);
    }, []);

    return (
        <Card className='rounded-lg border border-foreground shadow-none p-2.5 bg-foreground'>
            <div>
                <div className='flex justify-between gap-2'>
                    <h3 className='flex-1 text-lg font-semibold text-black leading-normal line-clamp-2'>
                        {task.title}
                    </h3>
                    <div className=''>
                        <StatusBadge status={task.status} />
                    </div>
                </div>

                <p className='font-medium text-black my-2 text-sm'>
                    ID:{' '}
                    <span className='text-gray font-normal'>#{task.id}</span>
                </p>

                <div className='space-y-1'>
                    <p
                        className={`text-xs font-medium text-gray ${isMobile ? 'grid grid-cols-2' : 'grid grid-cols-3'} gap-2`}
                    >
                        <span className='flex items-center gap-1'>
                            <Gauge className='h-3.5 w-3.5' />
                            Total Marks:
                        </span>
                        <span
                            className={`text-black font-semibold ${isMobile ? '' : 'col-span-2'}`}
                        >
                            {task.marks}
                        </span>
                    </p>

                    {/* Show obtained mark if available */}
                    {task.obtainedMark !== undefined && (
                        <p
                            className={`text-xs font-medium text-gray ${isMobile ? 'grid grid-cols-2' : 'grid grid-cols-3'} gap-2`}
                        >
                            <span className='flex items-center gap-1'>
                                <BarChart className='h-3.5 w-3.5' />
                                Obtained:
                            </span>
                            <span
                                className={`text-black font-semibold ${isMobile ? '' : 'col-span-2'}`}
                            >
                                {task.obtainedMark}
                            </span>
                        </p>
                    )}

                    {/* Show attachments if available */}
                    {task.attachments !== undefined && task.attachments > 0 && (
                        <p
                            className={`text-xs font-medium text-gray ${isMobile ? 'grid grid-cols-2' : 'grid grid-cols-3'} gap-2`}
                        >
                            <span className='flex items-center gap-1'>
                                <Paperclip className='h-3.5 w-3.5' />
                                Attachments:
                            </span>
                            <span
                                className={`text-black font-semibold ${isMobile ? '' : 'col-span-2'}`}
                            >
                                {task.attachments}
                            </span>
                        </p>
                    )}

                    <p
                        className={`text-xs font-medium text-gray ${isMobile ? 'grid grid-cols-2' : 'grid grid-cols-3'} gap-2`}
                    >
                        <span className='flex items-center gap-1'>
                            <CalendarDays className='h-3.5 w-3.5' />
                            Deadline:
                        </span>
                        <span
                            className={`text-black font-semibold ${isMobile ? '' : 'col-span-2'}`}
                        >
                            {task?.deadline
                                ? dayjs(task.deadline).format(
                                      'MMM DD, YYYY [at] hh:mm A',
                                  )
                                : 'Not defined'}
                        </span>
                    </p>
                </div>

                <div className='border-t border-foreground pt-2 mt-2'>
                    <div
                        className={`${isMobile ? 'flex flex-col' : 'flex justify-between'} gap-2 items-center`}
                    >
                        <Button
                            variant={
                                task.status === 'completed' ||
                                task.status === 'pending' ||
                                task.status === 'rejected' ||
                                task.status === 'accepted'
                                    ? 'outline'
                                    : 'default'
                            }
                            disabled={
                                task.status === 'completed' ||
                                task.status === 'pending' ||
                                task.status === 'rejected' ||
                                task.status === 'accepted'
                            }
                            onClick={onTestNow}
                            className={`hover:bg-primary-light rounded-md px-3.5 py-2 h-auto ${isMobile ? 'w-full' : ''}`}
                        >
                            {isMobile ? 'Test' : 'Test Now'}{' '}
                            <span className='ml-1'>→</span>
                        </Button>
                        <Button
                            disabled={task.status === 'not_answered'}
                            onClick={onSeeResult}
                            variant='ghost'
                            className={`rounded-md px-3 py-2 h-auto flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-black ${
                                isMobile ? 'w-full' : ''
                            }`}
                        >
                            <Eye className='h-5 w-5' />
                            {!isMobile && 'See Result'}
                        </Button>
                    </div>
                </div>
            </div>
        </Card>
    );
}
