'use client';
import React, { useCallback, useState } from 'react';
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
import staticTodo from '../../../../public/calendar/staticTodo.json';

export interface TaskType {
    id: string;
    title: string;
    description: string;
    status: string;
    priority: string;
}

const initialTasks: TaskType[] = [
    {
        id: '1',
        title: 'Research competitors',
        description: 'Look into what our competitors are doing',
        status: 'started',
        priority: 'high',
    },
    {
        id: '2',
        title: 'Design new landing page',
        description: 'Create wireframes for the new landing page',
        status: 'in-progress',
        priority: 'medium',
    },
    {
        id: '3',
        title: 'Fix navigation bug',
        description: 'The dropdown menu is not working on mobile',
        status: 'started',
        priority: 'high',
    },
    {
        id: '4',
        title: 'Update documentation',
        description: 'Update the API documentation with new endpoints',
        status: 'completed',
        priority: 'low',
    },
    {
        id: '5',
        title: 'Implement authentication',
        description: 'Add OAuth login functionality',
        status: 'in-progress',
        priority: 'high',
    },
    {
        id: '6',
        title: 'Refactor CSS',
        description: 'Convert old CSS to Tailwind classes',
        status: 'cancel',
        priority: 'medium',
    },
];

const TodoBoard = () => {
    const [tasks, setTasks] = useState<TaskType[]>(initialTasks as TaskType[]);
    const [activeTask, setActiveTask] = useState<TaskType | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
    );

    const statuses = ['started', 'in-progress', 'completed', 'cancel'];

    function handleDragStart(event: DragStartEvent) {
        const { active } = event;
        const activeTask = tasks.find((task) => task.id === active.id);
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

            const activeTaskIndex = tasks.findIndex((t) => t.id === activeId);
            if (activeTaskIndex === -1) {
                return;
            }

            const activeTask = tasks[activeTaskIndex];

            // If over a column, update status
            if (statuses.includes(overId)) {
                // Skip if already in this status
                if (activeTask.status === overId) {
                    return;
                }

                // Just update the status, keeping the same relative position
                setTasks((prev) => {
                    const newTasks = [...prev];
                    newTasks[activeTaskIndex] = {
                        ...activeTask,
                        status: overId,
                    };
                    return newTasks;
                });
                return;
            }

            // Over another task
            const overTaskIndex = tasks.findIndex((t) => t.id === overId);
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
                    const insertAt = newTasks.findIndex((t) => t.id === overId);
                    // Insert
                    if (insertAt >= 0) {
                        newTasks.splice(insertAt, 0, updatedTask);
                    } else {
                        // Fallback: append to end
                        newTasks.push(updatedTask);
                    }
                    return newTasks;
                });
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
        (event: DragEndEvent) => {
            setActiveTask(null);
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
            <div className='grid mt-2 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2'>
                {statuses.map((status) => (
                    <TodoColumn
                        key={status}
                        status={status}
                        tasks={tasks.filter((task) => task.status === status)}
                    />
                ))}
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
