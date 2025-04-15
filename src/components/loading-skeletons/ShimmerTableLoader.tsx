import { cn } from '@/lib/utils';

interface ShimmerTableLoaderProps {
    rows?: number;
    columns?: number;
    bgColor?: 'background' | 'foreground';
    showHeader?: boolean;
    density?: 'compact' | 'default' | 'comfortable';
    className?: string;
}

export function ShimmerTableLoader({
    rows = 5,
    columns = 7,
    bgColor = 'background',
    showHeader = true,
    density = 'default',
    className,
}: ShimmerTableLoaderProps) {
    // Generate array of rows and columns
    const rowsArray = Array.from({ length: rows }, (_, i) => i);
    const columnsArray = Array.from({ length: columns }, (_, i) => i);

    // Determine background colors based on bgColor
    const containerBg =
        bgColor === 'background' ? 'bg-background' : 'bg-foreground';
    const headerBg =
        bgColor === 'background' ? 'bg-muted/30' : 'bg-background/30';
    const rowBg = bgColor === 'background' ? 'bg-background' : 'bg-foreground';
    const altRowBg =
        bgColor === 'background' ? 'bg-muted/10' : 'bg-background/10';
    const borderColor =
        bgColor === 'background' ? 'border-border' : 'border-background/20';

    // Determine padding based on density
    const cellPadding =
        density === 'compact'
            ? 'py-1.5 px-2'
            : density === 'comfortable'
              ? 'py-4 px-4'
              : 'py-2.5 px-3';

    // Column widths - make them more realistic
    const getColumnWidth = (index: number) => {
        if (index === 0) {
            return 'flex-[1.5]';
        } // Name column
        if (index === 1) {
            return 'flex-[1.2]';
        } // User column
        if (index === 2 || index === 3) {
            return 'flex-1';
        } // Date columns
        if (index === columns - 1) {
            return 'flex-[0.5]';
        } // Actions column
        return 'flex-1';
    };

    // Shimmer effect styles
    const shimmerBase =
        'relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r';
    const shimmerColors =
        bgColor === 'background'
            ? 'before:from-transparent before:via-muted/80 before:to-transparent'
            : 'before:from-transparent before:via-background/30 before:to-transparent';

    return (
        <div
            className={cn(
                'w-full overflow-hidden rounded-md border shadow-sm',
                borderColor,
                containerBg,
                className,
            )}
        >
            {/* Table header */}
            {showHeader && (
                <div
                    className={cn(
                        'flex w-full border-b',
                        borderColor,
                        headerBg,
                        cellPadding,
                    )}
                >
                    {columnsArray.map((col) => (
                        <div
                            key={`header-${col}`}
                            className={cn('px-1', getColumnWidth(col))}
                        >
                            <div
                                className={cn(
                                    'h-5 rounded',
                                    col === 0 ? 'w-[70%]' : 'w-[80%]',
                                    bgColor === 'background'
                                        ? 'bg-muted/50'
                                        : 'bg-background/50',
                                    shimmerBase,
                                    shimmerColors,
                                )}
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* Table rows */}
            <div className='w-full'>
                {rowsArray.map((row) => (
                    <div
                        key={`row-${row}`}
                        className={cn(
                            'flex w-full items-center border-b',
                            row % 2 === 0 ? rowBg : altRowBg,
                            borderColor,
                            cellPadding,
                            'last:border-0',
                            'animate-in fade-in duration-300',
                            { 'delay-100': row === 0 },
                            { 'delay-150': row === 1 },
                            { 'delay-200': row === 2 },
                            { 'delay-250': row === 3 },
                            { 'delay-300': row === 4 },
                        )}
                    >
                        {/* Document name column */}
                        <div className={cn('px-1', getColumnWidth(0))}>
                            <div className='flex items-center gap-2'>
                                <div
                                    className={cn(
                                        'h-8 w-8 rounded-md',
                                        bgColor === 'background'
                                            ? 'bg-muted/50'
                                            : 'bg-background/50',
                                        shimmerBase,
                                        shimmerColors,
                                    )}
                                />
                                <div
                                    className={cn(
                                        'h-5 w-[85%] max-w-[180px] rounded',
                                        bgColor === 'background'
                                            ? 'bg-muted/50'
                                            : 'bg-background/50',
                                        shimmerBase,
                                        shimmerColors,
                                    )}
                                />
                            </div>
                        </div>

                        {/* Created by column with avatar and name */}
                        <div
                            className={cn(
                                'flex items-center gap-2 px-1',
                                getColumnWidth(1),
                            )}
                        >
                            <div
                                className={cn(
                                    'h-8 w-8 rounded-full',
                                    bgColor === 'background'
                                        ? 'bg-muted/50'
                                        : 'bg-background/50',
                                    shimmerBase,
                                    shimmerColors,
                                )}
                            />
                            <div className='space-y-1.5'>
                                <div
                                    className={cn(
                                        'h-4 w-24 rounded',
                                        bgColor === 'background'
                                            ? 'bg-muted/50'
                                            : 'bg-background/50',
                                        shimmerBase,
                                        shimmerColors,
                                    )}
                                />
                                <div
                                    className={cn(
                                        'h-3 w-16 rounded',
                                        bgColor === 'background'
                                            ? 'bg-muted/50'
                                            : 'bg-background/50',
                                        shimmerBase,
                                        shimmerColors,
                                    )}
                                />
                            </div>
                        </div>

                        {/* Date columns */}
                        <div className={cn('px-1', getColumnWidth(2))}>
                            <div className='space-y-1.5'>
                                <div
                                    className={cn(
                                        'h-4 w-[90%] rounded',
                                        bgColor === 'background'
                                            ? 'bg-muted/50'
                                            : 'bg-background/50',
                                        shimmerBase,
                                        shimmerColors,
                                    )}
                                />
                                <div
                                    className={cn(
                                        'h-3 w-[60%] rounded',
                                        bgColor === 'background'
                                            ? 'bg-muted/50'
                                            : 'bg-background/50',
                                        shimmerBase,
                                        shimmerColors,
                                    )}
                                />
                            </div>
                        </div>

                        <div className={cn('px-1', getColumnWidth(3))}>
                            <div className='space-y-1.5'>
                                <div
                                    className={cn(
                                        'h-4 w-[90%] rounded',
                                        bgColor === 'background'
                                            ? 'bg-muted/50'
                                            : 'bg-background/50',
                                        shimmerBase,
                                        shimmerColors,
                                    )}
                                />
                                <div
                                    className={cn(
                                        'h-3 w-[60%] rounded',
                                        bgColor === 'background'
                                            ? 'bg-muted/50'
                                            : 'bg-background/50',
                                        shimmerBase,
                                        shimmerColors,
                                    )}
                                />
                            </div>
                        </div>

                        {/* Priority column */}
                        <div className={cn('px-1', getColumnWidth(4))}>
                            <div
                                className={cn(
                                    'h-5 w-16 rounded-full',
                                    bgColor === 'background'
                                        ? 'bg-muted/50'
                                        : 'bg-background/50',
                                    shimmerBase,
                                    shimmerColors,
                                )}
                            />
                        </div>

                        {/* Description column */}
                        <div className={cn('px-1', getColumnWidth(5))}>
                            <div className='space-y-1.5'>
                                <div
                                    className={cn(
                                        'h-4 w-[95%] rounded',
                                        bgColor === 'background'
                                            ? 'bg-muted/50'
                                            : 'bg-background/50',
                                        shimmerBase,
                                        shimmerColors,
                                    )}
                                />
                                <div
                                    className={cn(
                                        'h-3 w-[75%] rounded',
                                        bgColor === 'background'
                                            ? 'bg-muted/50'
                                            : 'bg-background/50',
                                        shimmerBase,
                                        shimmerColors,
                                    )}
                                />
                            </div>
                        </div>

                        {/* Actions column */}
                        <div
                            className={cn(
                                'flex justify-center px-1',
                                getColumnWidth(6),
                            )}
                        >
                            <div
                                className={cn(
                                    'h-8 w-8 rounded-full',
                                    bgColor === 'background'
                                        ? 'bg-muted/50'
                                        : 'bg-background/50',
                                    shimmerBase,
                                    shimmerColors,
                                )}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
