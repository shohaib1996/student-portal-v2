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

interface TodoColumnProps {
    status: string;
    tasks: TaskType[];
}

const TodoColumn = ({ status, tasks }: TodoColumnProps) => {
    const { setNodeRef, isOver } = useDroppable({
        id: status,
    });

    // Format the status for display
    const getStatusName = (status: string) => {
        switch (status) {
            case 'started':
                return 'Started';
            case 'in-progress':
                return 'In Progress';
            case 'completed':
                return 'Completed';
            case 'cancel':
                return 'Cancelled';
            default:
                return status;
        }
    };

    // Get color based on status
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'started':
                return 'bg-blue-500';
            case 'in-progress':
                return 'bg-amber-500';
            case 'completed':
                return 'bg-green-500';
            case 'cancel':
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
            <div className='flex items-center gap-2 mb-2 p-3 bg-primary-light rounded-md'>
                <div
                    className={cn(
                        'w-3 h-3 rounded-full',
                        getStatusColor(status),
                    )}
                />
                <h3 className='font-medium'>{getStatusName(status)}</h3>
                <div className='ml-auto bg-muted text-muted-foreground text-sm px-2 py-0.5 rounded-full'>
                    {tasks.length}
                </div>
            </div>

            <SortableContext
                items={tasks.map((task) => task.id)}
                strategy={verticalListSortingStrategy}
            >
                <div className='flex flex-col h-[calc(100vh-190px)] overflow-y-auto bg-primary-light rounded-md p-2 gap-2 min-h-[200px]'>
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
                        <TaskCard key={task.id} task={task} />
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
