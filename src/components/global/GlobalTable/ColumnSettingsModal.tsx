import React, {
    Dispatch,
    ReactNode,
    SetStateAction,
    useEffect,
    useState,
} from 'react';
import GlobalModal from '../GlobalModal';
import { Button } from '@/components/ui/button';
import CrossCircle from '@/components/svgs/common/CrossCircle';
import SaveIcon from '@/components/svgs/common/SavedIcon';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import ThreeDotIcon from '@/components/svgs/common/ThreeDotIcon';
import { ColumnDef, ColumnSizingState, Table } from '@tanstack/react-table';
import RightArrowCircle from '@/components/svgs/common/RightArrowCircle';
import {
    closestCenter,
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    KeyboardSensor,
    PointerSensor,
    TouchSensor,
    useDroppable,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import DragIcon from '@/components/svgs/common/DragIcon';
import { motion } from 'framer-motion';

import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setColumnSizing } from '@/redux/features/tableReducer';
import { cn } from '@/lib/utils';
import { CSS } from '@dnd-kit/utilities';
import { EyeOff } from 'lucide-react';
import { TCustomColumnDef } from './GlobalTable';

type TProps = {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    tableName: string;
    table: Table<any>;
};

type ColumnProps = {
    id: string;
    children: ReactNode;
};

function Column({ id, children }: ColumnProps) {
    const { setNodeRef, isOver } = useDroppable({
        id: id,
    });

    return (
        <div
            ref={setNodeRef}
            className={`rounded-lg h-full w-full transition-colors`}
        >
            {children}
        </div>
    );
}

const DraggableItem = ({
    col,
    preview = false,
    onClick,
}: {
    col: ColumnDef<any>;
    preview?: boolean;
    onClick?: () => void;
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transition,
        isDragging,
        transform,
    } = useSortable({
        id: col.id as string,
        data: {
            type: 'column',
            col,
        },
    });

    const style = {
        transition,
        transform: CSS.Transform.toString(transform),
    };

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className='h-10 w-full flex gap-3 transition-all duration-200'
            >
                <div className='size-6'></div>
                <div className='bg-row-line h-full w-full rounded-lg'></div>
                <div className='size-3'></div>
            </div>
        );
    }

    return (
        <div
            style={style}
            {...attributes}
            ref={setNodeRef}
            className={cn(
                'flex gap-3 w-full items-center h-10 overflow-y-auto',
            )}
        >
            <Button variant={'plain'} className='w-2' {...listeners}>
                <DragIcon className='fill-dark-gray' />
            </Button>
            <p
                className={cn(
                    'bg-background-foreground w-full flex items-center p-3 rounded-lg border border-forground-border text-sm text-dark-gray h-full',
                    isDragging && 'bg-row-line shadow-md',
                    preview && 'border-primary',
                )}
            >
                {typeof col.header === 'function' ? '' : col.header}
            </p>
            <Button onClick={onClick} variant={'plain'} size={'icon'}>
                <CrossCircle />
            </Button>
        </div>
    );
};

const ColumnSettingsModal = ({ open, setOpen, tableName }: TProps) => {
    const { tableSizeData } = useAppSelector((s) => s.table);
    const dispatch = useAppDispatch();
    const columnData = tableSizeData.find((d) => d.tableName === tableName);
    const [localColumns, setLocalColumns] = useState(columnData?.columns || []);
    const [activeColumn, setActiveColumn] =
        useState<TCustomColumnDef<any> | null>(null);
    const [isdragging, setIsDragging] = useState(false);

    const findIndex = (id: string | number) => {
        const index = localColumns.findIndex((c) => c.id === id);
        return index;
    };

    const handleDragEnd = (e: DragEndEvent) => {
        setIsDragging(false);
        const { active, over } = e;
        if (active.id === over?.id) {
            return;
        }

        if (over?.id === 'hidden') {
            setLocalColumns((prev) =>
                prev.map((c) => {
                    if (c.id === active.id) {
                        return {
                            ...c,
                            visible: false,
                        };
                    } else {
                        return c;
                    }
                }),
            );

            return;
        }

        if (!over) {
            return;
        }

        const pos = findIndex(active.id);
        const newPos = findIndex(over?.id);

        const newColumns = arrayMove(localColumns, pos, newPos);

        setLocalColumns(newColumns);
    };

    const handleSave = () => {
        dispatch(
            setColumnSizing({
                tableName: tableName,
                columnSizing:
                    (columnData?.columnSizing as ColumnSizingState) || [],
                columns: localColumns,
            }),
        );
        setOpen(false);
    };

    useEffect(() => {
        if (columnData?.columns) {
            setLocalColumns(columnData?.columns);
        }
    }, [columnData?.columns]);

    const sensors = useSensors(
        useSensor(TouchSensor),
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    const handleDragStart = (e: DragStartEvent) => {
        setIsDragging(true);
        setActiveColumn(e.active.data?.current?.col);
    };

    return (
        <GlobalModal
            className='xl:min-w-[50vw] lg:min-w-[60vw] md:min-w-[70vw] sm:min-w-[90vw] h-[60vh]'
            title={'Customize Columns '}
            subTitle='Adjust and organize columns'
            buttons={
                <div className='flex gap-2 items-center'>
                    <Button
                        className='text-gray stroke-gray'
                        variant={'secondary'}
                        onClick={() => setOpen(false)}
                    >
                        <CrossCircle />
                        Cancel
                    </Button>
                    <Button onClick={handleSave} variant={'default'}>
                        <SaveIcon className='stroke-pure-white' />
                        Save Changes
                    </Button>
                </div>
            }
            open={open}
            setOpen={(v) => setOpen(v)}
        >
            <DndContext
                sensors={sensors}
                onDragEnd={handleDragEnd}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
            >
                <div className='grid grid-cols-1 md:grid-cols-2 md:gap-0 gap-3 pt-3 h-full'>
                    <Column id='hidden'>
                        <SortableContext
                            items={localColumns
                                .filter((c) => c.visible === false)
                                .map((d) => ({
                                    ...d,
                                    id: d.id as string,
                                }))}
                            strategy={verticalListSortingStrategy}
                        >
                            <div key={'left'} className='h-full'>
                                {isdragging ? (
                                    <div className='bg-sidebar flex gap-1 items-center justify-center text-dark-gray text-sm h-full mr-3 border-2 border-spacing-1 border-secondary-border rounded-md border-dotted'>
                                        <EyeOff size={18} /> Hide Column
                                    </div>
                                ) : (
                                    <>
                                        <h3 className='text-sm text-black font-medium'>
                                            Hidden Fields
                                        </h3>

                                        <div className='md:pr-2 pt-1'>
                                            {localColumns
                                                .filter(
                                                    (c) => c.visible === false,
                                                )
                                                ?.map((col, i) => (
                                                    <motion.div
                                                        initial={{
                                                            opacity: 0,
                                                            y: -10,
                                                        }}
                                                        animate={{
                                                            opacity: 1,
                                                            y: 0,
                                                        }}
                                                        exit={{
                                                            opacity: 0,
                                                            y: -10,
                                                        }}
                                                        transition={{
                                                            duration: 0.3,
                                                        }}
                                                        key={i}
                                                        className='flex justify-between items-center text-dark-gray text-sm'
                                                    >
                                                        <p>
                                                            {typeof col.header ===
                                                            'function'
                                                                ? ''
                                                                : col.header}
                                                        </p>
                                                        <Button
                                                            variant={'plain'}
                                                            className='border-0'
                                                            onClick={() =>
                                                                setLocalColumns(
                                                                    (prev) =>
                                                                        prev.map(
                                                                            (
                                                                                c,
                                                                            ) => {
                                                                                if (
                                                                                    c.id ===
                                                                                    col.id
                                                                                ) {
                                                                                    return {
                                                                                        ...col,
                                                                                        visible:
                                                                                            true,
                                                                                    };
                                                                                } else {
                                                                                    return c;
                                                                                }
                                                                            },
                                                                        ),
                                                                )
                                                            }
                                                        >
                                                            <RightArrowCircle />
                                                        </Button>
                                                    </motion.div>
                                                ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </SortableContext>
                    </Column>

                    <Column id='visible'>
                        <SortableContext
                            items={localColumns
                                .filter((c) => c.visible === true)
                                .map((d) => ({
                                    ...d,
                                    id: d.id as string,
                                }))}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className='md:border-l md:ps-3 border-forground-border w-full h-full'>
                                <h3 className='text-sm text-black font-medium pb-3'>
                                    Visible Fields
                                </h3>

                                <div className='space-y-2'>
                                    <div className='space-y-2 pb-3'>
                                        {localColumns
                                            .filter(
                                                (c) =>
                                                    c.visible === true &&
                                                    c.canHide === false,
                                            )
                                            .map((col) => (
                                                <div
                                                    key={col.id}
                                                    className='h-10 flex gap-3 items-center'
                                                >
                                                    <div className='size-7'></div>
                                                    <p
                                                        className={cn(
                                                            'bg-background-foreground w-full flex items-center p-3 rounded-lg border border-forground-border text-sm text-dark-gray h-full',
                                                        )}
                                                    >
                                                        {typeof col.header ===
                                                        'function'
                                                            ? ''
                                                            : col.header}
                                                    </p>
                                                    <div className='size-9'></div>
                                                </div>
                                            ))}
                                    </div>
                                    {localColumns
                                        .filter(
                                            (c) =>
                                                c.visible === true &&
                                                c.canHide !== false,
                                        )
                                        ?.map((col) => {
                                            return (
                                                <DraggableItem
                                                    onClick={() =>
                                                        setLocalColumns(
                                                            (prev) =>
                                                                prev.map(
                                                                    (c) => {
                                                                        if (
                                                                            c.id ===
                                                                            col.id
                                                                        ) {
                                                                            return {
                                                                                ...col,
                                                                                visible:
                                                                                    false,
                                                                            };
                                                                        } else {
                                                                            return c;
                                                                        }
                                                                    },
                                                                ),
                                                        )
                                                    }
                                                    key={col.id}
                                                    col={col}
                                                />
                                            );
                                        })}
                                </div>
                            </div>
                        </SortableContext>
                    </Column>
                </div>

                <DragOverlay>
                    {activeColumn && (
                        <DraggableItem preview={true} col={activeColumn} />
                    )}
                </DragOverlay>
            </DndContext>
        </GlobalModal>
    );
};

export default ColumnSettingsModal;
