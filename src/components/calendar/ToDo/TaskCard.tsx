'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
    AlertTriangle,
    Bell,
    Calendar as CalendarIcon,
    ChevronRight,
    Clock,
    GripVertical,
    History,
    Loader,
    MoreHorizontal,
    Pencil,
    Trash,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { memo, useState } from 'react';
import GlobalDropdown from '@/components/global/GlobalDropdown';
import { TEvent } from '@/components/calendar/types/calendarTypes';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
    useDeleteEventMutation,
    useUpdateEventMutation,
} from '@/components/calendar/api/calendarApi';
import dayjs from 'dayjs';
import { toast } from 'sonner';
import { EventPopoverTrigger } from '../CreateEvent/EventPopover';
import GlobalDeleteModal from '@/components/global/GlobalDeleteModal';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { isBefore } from 'date-fns';
import { renderPlainText } from '@/components/lexicalEditor/renderer/renderPlainText';

interface TaskCardProps {
    task: TEvent;
}

const TaskCard = memo(({ task }: TaskCardProps) => {
    const [updateTask, { isLoading: isUpdating }] = useUpdateEventMutation();
    const [deleteEvent, { isLoading: isDeleting }] = useDeleteEventMutation();

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: task._id,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    // Get priority badge color
    const getPriorityColor = (priority: TEvent['priority']) => {
        switch (priority) {
            case 'high':
                return 'text-red-800 dark:text-red-400';
            case 'medium':
                return 'text-amber-800 dark:text-amber-400';
            case 'low':
                return 'text-green-800 dark:text-green-400';
            default:
                return 'text-gray-800 dark:text-gray-400';
        }
    };

    const handleSelect = (val: Date) => {
        handleUpdate(val.toISOString());
    };

    const handleUpdate = async (date: string) => {
        try {
            const res = await updateTask({
                id: task._id,
                changes: {
                    startTime: date,
                    endTime: date,
                    isAllDay: true,
                },
                updateOption: 'thisEvent',
            }).unwrap();
            if (res) {
                toast.success('Task updated successfully');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const [deleteOpen, setDeleteOpen] = useState(false);

    const handleDelete = async () => {
        try {
            const res = await deleteEvent({
                id: task?._id as string,
                deleteOption: 'thisEvent',
            }).unwrap();
            if (res) {
                toast.success('Event deleted successfully');
                setDeleteOpen(false);
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                'group bg-foreground rounded-md relative cursor-grab border shadow-sm',
                isDragging && 'opacity-50 shadow-md',
            )}
        >
            <Collapsible defaultOpen className='group/collapsible'>
                {/* Header */}
                <CollapsibleTrigger className='flex items-center w-full justify-between p-2 border-b'>
                    <div className='flex items-center gap-2'>
                        <GripVertical
                            className='h-5 w-5 text-muted-foreground cursor-grab'
                            {...attributes}
                            {...listeners}
                        />
                        <h3
                            className={cn('font-medium text-lg', {
                                'line-through': task.status === 'cancelled',
                            })}
                        >
                            {task.title}
                        </h3>
                    </div>
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className='flex items-center gap-2'
                    >
                        <GlobalDropdown
                            className='w-40'
                            dropdownRender={
                                <div className='flex flex-col p-2 gap-2'>
                                    {!isBefore(
                                        new Date(task.startTime),
                                        new Date(),
                                    ) && (
                                        <EventPopoverTrigger
                                            updateId={task?._id}
                                        >
                                            <Button
                                                className='w-full h-8'
                                                variant={'primary_light'}
                                                icon={<Pencil size={16} />}
                                            >
                                                Edit
                                            </Button>
                                        </EventPopoverTrigger>
                                    )}
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button
                                                className='w-full h-8'
                                                variant={'danger_light'}
                                                icon={<Trash size={18} />}
                                            >
                                                Delete
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent className='z-[99999]'>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle className='text-center text-red'>
                                                    Are you absolutely sure?
                                                </AlertDialogTitle>
                                                <AlertDialogDescription className='text-center'>
                                                    This action cannot be
                                                    undone. This will
                                                    permanently delete your item
                                                    and remove your data from
                                                    our servers.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <div className='flex w-full justify-center'>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel className='bg-primary text-pure-white hover:bg-primary hover:text-pure-white'>
                                                        Cancel
                                                    </AlertDialogCancel>
                                                    <AlertDialogAction
                                                        className='bg-danger/20 hover:bg-danger/25 text-danger '
                                                        onClick={handleDelete}
                                                    >
                                                        {isDeleting ? (
                                                            <Loader className='animate-spin' />
                                                        ) : (
                                                            'Delete'
                                                        )}
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </div>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            }
                        >
                            <div className='flex'>
                                <MoreHorizontal className='h-5 w-5 text-muted-foreground' />
                            </div>
                        </GlobalDropdown>
                        <ChevronRight
                            size={16}
                            className='ml-auto text-dark-gray transition-transform group-data-[state=open]/collapsible:rotate-90'
                        />
                    </div>
                </CollapsibleTrigger>

                <CollapsibleContent className='p-2 space-y-2'>
                    {/* Due date and priority */}
                    <div className='flex items-center flex-wrap gap-2 justify-between'>
                        <div className='flex items-center gap-1 text-xs text-dark-gray'>
                            <span className='text-black font-semibold'>
                                Due:
                            </span>
                            <span>
                                {dayjs(task?.endTime).format(
                                    'MMM DD, YYYY [at] hh:mm A',
                                )}
                            </span>
                        </div>
                        <div className='flex items-center gap-1'>
                            <span className='text-xs text-black font-semibold'>
                                Priority:
                            </span>
                            <div className='flex items-center gap-1'>
                                <AlertTriangle
                                    className={cn(
                                        'h-4 w-4',
                                        getPriorityColor(task.priority),
                                    )}
                                />
                                <span
                                    className={cn(
                                        'text-sm font-medium',
                                        getPriorityColor(task.priority),
                                    )}
                                >
                                    {task.priority}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* <div>
                        <span className='text-xs font-semibold text-black'>
                            Purpose:{' '}
                        </span>
                        <span className='text-xs text-gray'>
                            {task.description}
                        </span>
                    </div> */}

                    {task?.reminders && (
                        <div className='flex items-center gap-1 text-xs text-dark-gray'>
                            <Bell className='h-4 w-4' />
                            <p>
                                {task?.reminders?.map((r, i) => (
                                    <span key={r.offsetMinutes}>
                                        {r.offsetMinutes}
                                        {i > task?.reminders!.length && ','}
                                    </span>
                                ))}{' '}
                                minutes before
                            </p>
                        </div>
                    )}

                    {/* Description */}
                    <div className='p-2 border border-forground-border rounded-md bg-foreground'>
                        <h3 className='text-xs text-black font-semibold'>
                            Description:
                        </h3>

                        <p className='text-xs text-gray'>
                            {task?.description
                                ? renderPlainText({
                                      text: task?.description,
                                      lineClamp: 3,
                                  })
                                : 'N/A'}
                        </p>
                    </div>

                    {/* Action buttons */}
                    <div className='flex gap-2'>
                        <Button
                            disabled={isUpdating}
                            tooltip='Set to today'
                            variant='primary_light'
                            size='sm'
                            onClick={() => handleUpdate(dayjs().toISOString())}
                        >
                            Today
                        </Button>
                        <Button
                            disabled={isUpdating}
                            tooltip='Set to tomorrow'
                            variant='primary_light'
                            size='sm'
                            onClick={() =>
                                handleUpdate(
                                    dayjs().add(1, 'day').toISOString(),
                                )
                            }
                        >
                            Tomorrow
                        </Button>
                        <Popover>
                            <PopoverTrigger>
                                <Button
                                    disabled={isUpdating}
                                    variant='primary_light'
                                    size='sm'
                                    icon={
                                        <CalendarIcon className='h-3.5 w-3.5' />
                                    }
                                >
                                    <span>Date & Time</span>
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent>
                                <Calendar
                                    mode='single'
                                    selected={new Date(task.startTime)}
                                    onSelect={(val) =>
                                        handleSelect(val as Date)
                                    }
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </CollapsibleContent>
            </Collapsible>
        </div>
    );
});

TaskCard.displayName = 'TaskCard';

export default TaskCard;
