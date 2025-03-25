import { cn } from '@/lib/utils';
import React from 'react';

const ArrowDown = ({ className }: { className?: string }) => {
    return (
        <svg
            viewBox='0 0 12 8'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
            className={cn('h-2 w-3', className)}
        >
            <path
                d='M1 1.5L6 6.5L11 1.5'
                strokeWidth='1.5'
                strokeLinecap='round'
                strokeLinejoin='round'
            />
        </svg>
    );
};

export default ArrowDown;
