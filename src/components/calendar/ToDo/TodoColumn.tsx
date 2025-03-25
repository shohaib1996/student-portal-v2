import {
    SortableContext,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import React from 'react';
import { TaskType } from './TodoBoard';
import { useDroppable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';
import TaskCard from './TaskCard';
import { Virtuoso, VirtuosoProps } from 'react-virtuoso';
import { TEvent } from '@/types/calendar/calendarTypes';

interface TodoColumnProps {
    index: number;
    status: TEvent['status'];
    tasks: TEvent[];
}

const TodoColumn = ({ status, tasks, index }: TodoColumnProps) => {
    const { setNodeRef, isOver } = useDroppable({
        id: status,
    });

    // Format the status for display
    const getStatusName = (status: TEvent['status']) => {
        switch (status) {
            case 'todo':
                return 'Todo';
            case 'inprogress':
                return 'In Progress';
            case 'completed':
                return 'Completed';
            case 'cancelled':
                return 'Cancelled';
            default:
                return status;
        }
    };

    // Get color based on status
    const getStatusColor = (status: TEvent['status']) => {
        switch (status) {
            case 'todo':
                return 'bg-blue-500';
            case 'inprogress':
                return 'bg-amber-500';
            case 'completed':
                return 'bg-green-500';
            case 'cancelled':
                return 'bg-red-500';
            default:
                return 'bg-gray-500';
        }
    };

    const HeightPreservingItem = React.memo(
        ({ children, ...props }: VirtuosoProps<TaskType, unknown>) => {
            return (
                <div
                    {...props}
                    className='height-preserving-container'
                    style={
                        {
                            '--child-height': '50px', // Custom CSS property
                        } as React.CSSProperties
                    }
                >
                    {children}
                </div>
            );
        },
    );

    HeightPreservingItem.displayName = 'HeightPreservingItem';

    return (
        <div
            ref={setNodeRef}
            className={cn('flex flex-col', isOver && 'ring-2 ring-primary/20')}
        >
            <div
                className={`flex items-center gap-2 mb-2 p-3 rounded-md 
                ${index === 0 && 'bg-emerald-100/50 dark:bg-emerald-900/15 text-emerald-600'}
                ${index === 1 && 'bg-orange-100/50 dark:bg-orange-900/15 text-orange-600'}
                ${index === 2 && 'bg-blue-100/50 dark:bg-blue-900/15 text-blue-600'}
                ${index === 3 && 'bg-red-100/50 dark:bg-red-900/15 text-red-600'}
                `}
            >
                <div
                    className={cn(
                        'w-3 h-3 rounded-full',
                        getStatusColor(status),
                    )}
                />
                <h3 className='font-medium text-inherit'>
                    {getStatusName(status)}
                </h3>
                <div className='ml-auto bg-foreground text-muted-foreground text-sm px-2 py-0.5 rounded-full'>
                    {tasks.length}
                </div>
            </div>

            <SortableContext
                items={tasks.map((task) => task._id)}
                strategy={verticalListSortingStrategy}
            >
                <div
                    className={`flex flex-col h-[calc(100vh-190px)] overflow-y-auto rounded-md p-2 gap-2 min-h-[200px]
                ${index === 0 && 'bg-emerald-100/50 dark:bg-emerald-900/15 '}
                ${index === 1 && 'bg-orange-100/50 dark:bg-orange-900/15 '}
                ${index === 2 && 'bg-blue-100/50 dark:bg-blue-900/15'}
                ${index === 3 && 'bg-red-100/50 dark:bg-red-900/15'}
                    `}
                >
                    {/* <Virtuoso
                        totalCount={tasks.length}
                        components={{
                            Item: HeightPreservingItem
                        }}
                        itemContent={(index) => {
                            const task = tasks[index]
                            return <TaskCard key={task.id} task={task} />

                        }}
                    /> */}
                    {tasks.map((task) => (
                        <TaskCard key={task._id} task={task} />
                    ))}
                    {tasks.length === 0 && (
                        <div className='flex items-center bg-background border-forground-border justify-center h-44 border border-dashed rounded-lg'>
                            <p className='text-sm text-muted-foreground'>
                                Drop tasks here
                            </p>
                        </div>
                    )}
                </div>
            </SortableContext>
        </div>
    );
};

export default TodoColumn;
