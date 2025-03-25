'use client';
import React, { useEffect, useState } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    ColumnDef,
    flexRender,
    Table,
} from '@tanstack/react-table';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { cn } from '@/lib/utils';
import { Button } from '../../ui/button';
import ColumnSettingsModal from './ColumnSettingsModal';
import SimpleBar from 'simplebar-react';
import { EllipsisVertical, PlusCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { array } from 'zod';
import EmptyData from '../EmptyData';
import { setColumnSizing } from '@/redux/features/tableReducer';

function TableBody<T>({
    table,
    isLoading,
    limit,
    totalColumn,
}: {
    table: Table<T>;
    isLoading?: boolean;
    limit?: number;
    totalColumn: number;
}) {
    const [totalWidth, setTotalWidth] = useState(table.getTotalSize());
    const { tableSizeData } = useAppSelector((s) => s.table);

    useEffect(() => {
        setTotalWidth(table.getTotalSize());
    }, [table, tableSizeData]);

    return (
        <div
            {...{
                className: 'tbody',
            }}
        >
            {isLoading ? (
                <div className=''>
                    {Array.from({ length: limit || 0 }, (_, i: number) => (
                        <div
                            key={i}
                            className='flex items-center space-x-4 w-full h-14 border-b border-forground-border '
                        >
                            {Array.from(
                                { length: totalColumn },
                                (_, i: number) => {
                                    const randomWidth =
                                        Math.floor(
                                            Math.random() * (150 - 100 + 1),
                                        ) + 100;
                                    return (
                                        <div
                                            key={i}
                                            className='flex-1 overflow-hidden flex items-center border-r border-forground-border h-full'
                                        >
                                            <div
                                                className='h-6 bg-foreground rounded-md relative overflow-hidden'
                                                style={{
                                                    width: `${randomWidth}px`,
                                                }}
                                            >
                                                <div className='absolute inset-0 bg-gradient-to-r from-foreground via-background to-foreground animate-[shimmer_1.5s_infinite]'></div>
                                            </div>
                                        </div>
                                    );
                                },
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <>
                    {table.getRowModel().rows.map((row) => {
                        const visibleCells = row.getVisibleCells();
                        const lastCellIndex = visibleCells.length - 1;

                        return (
                            <div
                                key={row.id}
                                className='flex group min-h-[50px]'
                            >
                                {visibleCells.map((cell, i) => {
                                    const isLastCell = i === lastCellIndex;
                                    const column = table.getColumn(
                                        cell.column.id,
                                    );
                                    if (!column) {
                                        return null;
                                    }
                                    const columnWidth = isLastCell
                                        ? `calc(100% - ${totalWidth - column?.getSize() || 0}px)`
                                        : `calc(var(--col-${cell.column.id}-size) * 1px)`;

                                    return (
                                        <div
                                            key={cell.id}
                                            className={cn(
                                                'border-b border-r border-forground-border transition-colors duration-150 group-hover:bg-sidebar p-3 flex items-center first-of-type:border-l-0',
                                                isLastCell && 'border-r-0 pr-2',
                                                {
                                                    'pr-0':
                                                        cell.id === 'action',
                                                },
                                            )}
                                            style={{ width: columnWidth }}
                                        >
                                            <div className='truncate w-full text-sm text-black'>
                                                {flexRender(
                                                    cell.column.columnDef
                                                        .cell || '-',
                                                    cell.getContext(),
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })}
                </>
            )}
        </div>
    );
}

export const MemoizedTableBody = React.memo(
    TableBody,
    (prev, next) => prev.table.options.data === next.table.options.data,
) as typeof TableBody;

export type TCustomColumnDef<T> = ColumnDef<T> & {
    visible: boolean;
    canHide?: boolean;
    id: string;
    accessorKey: string;
};
interface GlobalTableProps<T> {
    tableName: string;
    defaultColumns: TCustomColumnDef<T>[];
    data: T[];
    height?: string;
    isLoading?: boolean;
    limit?: number;
}

const GlobalTable = <T,>({
    tableName,
    defaultColumns,
    isLoading,
    data,
    height,
    limit,
}: GlobalTableProps<T>) => {
    const [columnSettingsOpen, setCollumnSettings] = useState(false);
    const { tableSizeData } = useAppSelector((s) => s.table);
    const dispatch = useAppDispatch();

    const storeColumnSizing = tableSizeData.find(
        (d) => d.tableName === tableName,
    );

    const mergedColumns = React.useMemo(() => {
        // Create a lookup for store columns by id
        const storeColumnsMap = new Map(
            storeColumnSizing?.columns?.map((col: TCustomColumnDef<any>) => [
                col.id,
                col,
            ]),
        );

        // Map default columns, apply store settings, and filter out invisible ones
        return defaultColumns
            .map((col) => {
                if (storeColumnsMap.has(col.id)) {
                    return {
                        ...col,
                        ...storeColumnsMap.get(col.id), // apply stored settings
                    };
                }
                return { ...col, visible: true }; // Ensure new columns are visible by default
            })
            .filter((col) => col.visible !== false); // Remove columns where visible is false
    }, [storeColumnSizing, defaultColumns]);

    const table = useReactTable({
        data,
        columns: mergedColumns,
        defaultColumn: {
            minSize: 100,
            maxSize: 600,
        },
        state: {
            columnSizing: storeColumnSizing?.columnSizing || {},
        },
        onColumnSizingChange: (updater) => {
            dispatch(
                setColumnSizing({
                    tableName,
                    columnSizing:
                        typeof updater === 'function'
                            ? updater(storeColumnSizing?.columnSizing || {})
                            : updater,
                    columns:
                        (storeColumnSizing?.columns as TCustomColumnDef<any>[]) ||
                        [],
                }),
            );
        },
        columnResizeMode: 'onChange',
        getCoreRowModel: getCoreRowModel(),
        debugTable: true,
        debugHeaders: true,
        debugColumns: true,
    });

    useEffect(() => {
        if (!storeColumnSizing) {
            dispatch(
                setColumnSizing({
                    tableName,
                    columnSizing: table.getState().columnSizing,
                    columns: defaultColumns.map((c) => ({
                        ...c,
                        visible: true,
                    })),
                }),
            );
        }
    }, []);

    const columnSizeVars = React.useMemo(() => {
        const headers = table?.getFlatHeaders();
        const colSizes: { [key: string]: number } = {};
        for (let i = 0; i < headers.length; i++) {
            const header = headers[i]!;
            colSizes[`--header-${header.id}-size`] = header.getSize();
            colSizes[`--col-${header.column.id}-size`] =
                header.column.getSize();
        }
        return colSizes;
    }, [table.getState().columnSizingInfo, table.getState().columnSizing]);

    const enableMemo = React.useRef(true);

    return (
        <SimpleBar
            className={cn(' max-h-[calc(100vh-178px)] min-h-48', height)}
        >
            <div>
                <div
                    className='min-w-full'
                    {...{
                        style: {
                            ...columnSizeVars,
                            width: table.getTotalSize(),
                        },
                    }}
                >
                    <div className='thead sticky top-0 bg-background shadow-sm z-50'>
                        <div className='relative flex'>
                            {table.getHeaderGroups().map((headerGroup, i) => (
                                <div key={headerGroup.id} className='h-12 flex'>
                                    {headerGroup.headers.map((header) => (
                                        <div
                                            key={header.id}
                                            className={
                                                'flex items-center h-full text-dark-gray text-sm relative p-2 '
                                            }
                                            style={{
                                                width:
                                                    i === 5
                                                        ? '100%'
                                                        : `calc(var(--header-${header?.id}-size) * 1px)`,
                                            }}
                                        >
                                            <div className='w-full truncate text-start capitalize'>
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                          header.column
                                                              .columnDef.header,
                                                          header.getContext(),
                                                      )}
                                            </div>
                                            <div
                                                className={cn(
                                                    'hover:border-r-2 hover:border-primary border-forground-border absolute w-2 top-0 h-full right-0 cursor-col-resize select-none touch-none truncate',
                                                    header.column.getIsResizing()
                                                        ? 'opacity-100 border-primary'
                                                        : '',
                                                )}
                                                {...{
                                                    onDoubleClick: () =>
                                                        header.column.resetSize(),
                                                    onMouseDown:
                                                        header.getResizeHandler(),
                                                    onTouchStart:
                                                        header.getResizeHandler(),
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            ))}

                            <div className='sticky right-0 top-0 flex justify-end w-full'>
                                <Button
                                    onClick={() => setCollumnSettings(true)}
                                    variant={'plain'}
                                    className='bg-background border-none rounded-none w-9 z-40 justify-center h-12 flex items-center'
                                >
                                    <PlusCircle size={18} />
                                </Button>
                            </div>
                        </div>
                    </div>
                    {/* When resizing any column we will render this special memoized version of our table body */}

                    <>
                        {!isLoading && table.getRowModel().rows.length === 0 ? (
                            <div className='w-[calc(100%)] py-4 flex justify-center'>
                                <EmptyData />
                            </div>
                        ) : table.getState().columnSizingInfo
                              .isResizingColumn && enableMemo ? (
                            <MemoizedTableBody
                                totalColumn={defaultColumns?.length}
                                isLoading={isLoading}
                                table={table}
                                limit={limit}
                            />
                        ) : (
                            <TableBody
                                totalColumn={defaultColumns?.length}
                                isLoading={isLoading}
                                table={table}
                                limit={limit}
                            />
                        )}
                    </>
                </div>

                <ColumnSettingsModal
                    table={table}
                    tableName={tableName}
                    open={columnSettingsOpen}
                    setOpen={setCollumnSettings}
                />
            </div>
        </SimpleBar>
    );
};

export default GlobalTable;
