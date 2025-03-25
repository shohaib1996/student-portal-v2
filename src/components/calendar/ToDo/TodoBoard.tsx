'use client';
import React, { Dispatch, SetStateAction, useCallback, useState } from 'react';
import {
    DndContext,
    type DragEndEvent,
    type DragOverEvent,
    DragOverlay,
    type DragStartEvent,
    MeasuringStrategy,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { createPortal } from 'react-dom';
import TodoColumn from './TodoColumn';
import TaskCard from './TaskCard';
import {
    useGetMyEventsQuery,
    useUpdateEventMutation,
} from '@/redux/api/calendar/calendarApi';
import { DateRange } from 'react-day-picker';
import { endOfMonth, startOfMonth } from 'date-fns';
import { TEvent } from '@/types/calendar/calendarTypes';

export interface TaskType {
    id: string;
    title: string;
    description: string;
    status: string;
    priority: string;
}

type TProps = {
    tasks: TEvent[];
    setTasks: Dispatch<SetStateAction<TEvent[]>>;
};

const TodoBoard = ({ tasks, setTasks }: TProps) => {
    const [activeTask, setActiveTask] = useState<TEvent | null>(null);
    const [updateEvent] = useUpdateEventMutation();

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
    );

    console.log(tasks);

    const statuses: TEvent['status'][] = [
        'todo',
        'inprogress',
        'completed',
        'cancelled',
    ];

    function handleDragStart(event: DragStartEvent) {
        const { active } = event;
        const activeTask = tasks.find((task) => task._id === active.id);
        if (activeTask) {
            setActiveTask(activeTask);
        }
    }

    const handleDragOver = useCallback(
        (event: DragOverEvent) => {
            const { active, over } = event;
            if (!over) {
                return;
            }

            const activeId = active.id as string;
            const overId = over.id as string;

            // Skip if same ID
            if (activeId === overId) {
                return;
            }

            const activeTaskIndex = tasks.findIndex((t) => t._id === activeId);
            if (activeTaskIndex === -1) {
                return;
            }

            const activeTask = tasks[activeTaskIndex];

            // If over a column, update status
            if (statuses.includes(overId as TEvent['status'])) {
                // Skip if already in this status
                if (activeTask.status === overId) {
                    return;
                }

                // Just update the status, keeping the same relative position
                setTasks((prev) => {
                    const newTasks = [...prev];
                    newTasks[activeTaskIndex] = {
                        ...activeTask,
                        status: overId as TEvent['status'],
                    };
                    return newTasks;
                });
                setActiveTask(
                    (prev) => ({ ...prev, status: overId }) as TEvent,
                );
                return;
            }

            // Over another task
            const overTaskIndex = tasks.findIndex((t) => t._id === overId);
            if (overTaskIndex === -1) {
                return;
            }

            const overTask = tasks[overTaskIndex];

            // Handle differently based on whether in same column
            if (activeTask.status !== overTask.status) {
                // Different status (cross-column)
                setTasks((prev) => {
                    const newTasks = [...prev];
                    // Remove from current position
                    newTasks.splice(activeTaskIndex, 1);
                    // Update status
                    const updatedTask = {
                        ...activeTask,
                        status: overTask.status,
                    };
                    // Find insertion point
                    const insertAt = newTasks.findIndex(
                        (t) => t._id === overId,
                    );
                    // Insert
                    if (insertAt >= 0) {
                        newTasks.splice(insertAt, 0, updatedTask);
                    } else {
                        // Fallback: append to end
                        newTasks.push(updatedTask);
                    }
                    return newTasks;
                });

                setActiveTask(
                    (prev) => ({ ...prev, status: overTask.status }) as TEvent,
                );
            } else {
                // Same status - just reorder
                if (activeTaskIndex !== overTaskIndex) {
                    setTasks((prev) =>
                        arrayMove(prev, activeTaskIndex, overTaskIndex),
                    );
                }
            }
        },
        [tasks, statuses],
    );

    const handleDragEnd = useCallback(
        async (event: DragEndEvent) => {
            try {
                const res = await updateEvent({
                    id: activeTask?._id as string,
                    changes: {
                        status: activeTask?.status,
                    },
                    updateOption: 'thisEvent',
                }).unwrap();
                setActiveTask(null);
            } catch (err) {
                console.log(err);
            }
        },
        [tasks],
    );

    return (
        <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            measuring={{
                droppable: {
                    strategy: MeasuringStrategy.Always,
                },
            }}
        >
            <div className='overflow-x-auto'>
                <div className='grid mt-2 w-full min-w-[1400px] lg:grid-cols-4 gap-2'>
                    {statuses.map((status, i) => (
                        <TodoColumn
                            index={i}
                            key={status}
                            status={status}
                            tasks={tasks.filter(
                                (task) => task.status === status,
                            )}
                        />
                    ))}
                </div>
            </div>

            {typeof document !== 'undefined' &&
                createPortal(
                    <DragOverlay>
                        {activeTask && <TaskCard task={activeTask} />}
                    </DragOverlay>,
                    document.body,
                )}
        </DndContext>
    );
};

export default TodoBoard;
