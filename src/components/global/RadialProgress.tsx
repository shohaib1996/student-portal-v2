'use client';

import type * as React from 'react';
import { cn } from '@/lib/utils';

interface RadialProgressProps extends React.HTMLAttributes<HTMLDivElement> {
    value: number;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    thickness?: 'thin' | 'medium' | 'thick';
    showValue?: boolean;
    valuePrefix?: string;
    valueSuffix?: string;
    color?:
        | 'default'
        | 'primary'
        | 'secondary'
        | 'success'
        | 'warning'
        | 'danger';
}

export function RadialProgress({
    value,
    size = 'md',
    thickness = 'medium',
    showValue = true,
    valuePrefix = '',
    valueSuffix = '%',
    color = 'primary',
    className,
    ...props
}: RadialProgressProps) {
    // Ensure value is between 0 and 100
    const normalizedValue = Math.min(Math.max(value, 0), 100);

    // Calculate the circumference of the circle
    const radius = 50 - getThicknessValue(thickness) / 2;
    const circumference = 2 * Math.PI * radius;

    // Calculate the stroke-dasharray and stroke-dashoffset
    const strokeDasharray = circumference;
    const strokeDashoffset =
        circumference - (normalizedValue / 100) * circumference;

    // Size mappings
    const sizeMap = {
        sm: 'w-12 h-12 text-xs',
        md: 'w-16 h-16 text-sm',
        lg: 'w-24 h-24 text-base',
        xl: 'w-32 h-32 text-lg',
    };

    // Color mappings
    const colorMap = {
        default:
            'text-primary stroke-gray-200 [&>circle:nth-child(2)]:stroke-gray-600',
        primary:
            'text-primary stroke-blue-100 [&>circle:nth-child(2)]:stroke-blue-600',
        secondary:
            'text-secondary stroke-purple-100 [&>circle:nth-child(2)]:stroke-purple-600',
        success:
            'text-green-600 stroke-green-100 [&>circle:nth-child(2)]:stroke-green-600',
        warning:
            'text-amber-600 stroke-amber-100 [&>circle:nth-child(2)]:stroke-amber-600',
        danger: 'text-red-600 stroke-red-100 [&>circle:nth-child(2)]:stroke-red-600',
    };

    return (
        <div
            className={cn(
                'relative inline-flex items-center justify-center',
                sizeMap[size],
                className,
            )}
            {...props}
        >
            <svg
                className={cn('w-full h-full -rotate-90', colorMap[color])}
                viewBox='0 0 100 100'
            >
                <circle
                    cx='50'
                    cy='50'
                    r={radius}
                    fill='none'
                    strokeWidth={getThicknessValue(thickness)}
                />
                <circle
                    cx='50'
                    cy='50'
                    r={radius}
                    fill='none'
                    strokeWidth={getThicknessValue(thickness)}
                    strokeLinecap='round'
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                />
            </svg>

            {showValue && (
                <div className='absolute inset-0 flex items-center justify-center font-medium'>
                    {valuePrefix}
                    {Math.round(normalizedValue)}
                    {valueSuffix}
                </div>
            )}
        </div>
    );
}

function getThicknessValue(thickness: 'thin' | 'medium' | 'thick'): number {
    switch (thickness) {
        case 'thin':
            return 6;
        case 'medium':
            return 10;
        case 'thick':
            return 14;
        default:
            return 10;
    }
}
