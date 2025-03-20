'use client';

import type * as React from 'react';
import type { TooltipProps } from 'recharts';
import type {
    NameType,
    ValueType,
} from 'recharts/types/component/DefaultTooltipContent';

import { cn } from '@/lib/utils';

export type ChartConfig = Record<
    string,
    {
        label: string;
        color?: string;
        formatter?: (value: number) => string;
    }
>;

interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
    config: ChartConfig;
}

export function ChartContainer({
    config,
    children,
    className,
    ...props
}: ChartContainerProps) {
    return (
        <div
            className={cn('space-y-4', className)}
            style={
                {
                    '--chart-1': '215 25% 27%',
                    '--chart-2': '142 72% 29%',
                    '--chart-3': '37 92% 50%',
                    '--chart-4': '0 84% 60%',
                    '--chart-5': '183 74% 44%',
                    '--color-chrome': 'hsl(215 25% 27%)',
                    '--color-safari': 'hsl(142 72% 29%)',
                    '--color-firefox': 'hsl(37 92% 50%)',
                    '--color-edge': 'hsl(0 84% 60%)',
                    '--color-other': 'hsl(183 74% 44%)',
                } as React.CSSProperties
            }
            {...props}
        >
            {children}
        </div>
    );
}

interface ChartTooltipContentProps {
    active?: boolean;
    payload?: {
        name: string;
        value: number;
        payload: {
            fill: string;
            name: string;
            value: number;
        };
    }[];
    label?: string;
    config?: ChartConfig;
    className?: string;
    formatter?: (value: number) => string;
    hideLabel?: boolean;
}

export function ChartTooltipContent({
    active,
    payload,
    label,
    config,
    className,
    formatter,
    hideLabel = false,
}: ChartTooltipContentProps) {
    if (!active || !payload?.length) {
        return null;
    }

    const { name, value } = payload[0];
    const { fill, name: payloadName } = payload[0].payload;

    return (
        <div
            className={cn(
                'rounded-lg border bg-background px-3 py-1.5 shadow-md',
                className,
            )}
        >
            {!hideLabel && (
                <div className='text-xs text-muted-foreground'>{label}</div>
            )}
            <div className='flex items-center gap-1.5'>
                <div
                    className='h-2 w-2 rounded-full'
                    style={{
                        backgroundColor: fill,
                    }}
                />
                <div className='font-medium'>
                    {config?.[payloadName]?.label ?? name}
                </div>
                <div>
                    {config?.[payloadName]?.formatter
                        ? config[payloadName].formatter?.(value)
                        : formatter
                          ? formatter(value)
                          : value}
                </div>
            </div>
        </div>
    );
}

export function ChartTooltip(props: TooltipProps<ValueType, NameType>) {
    return <ChartTooltipContent {...props} />;
}
