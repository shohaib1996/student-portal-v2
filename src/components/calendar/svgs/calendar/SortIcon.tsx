import { cn } from '@/lib/utils';
import React from 'react';

const SortIcon = ({ className }: { className?: string }) => {
    return (
        <svg
            width='20'
            height='21'
            viewBox='0 0 20 21'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
            className={cn('size-5 stroke-white', className)}
        >
            <path
                d='M2.5 6.91672L6.25 3.16672M6.25 3.16672L10 6.91672M6.25 3.16672L6.25 14.4167M17.5 14.4167L13.75 18.1667M13.75 18.1667L10 14.4167M13.75 18.1667L13.75 6.91672'
                strokeWidth='1.5'
                strokeLinecap='round'
                strokeLinejoin='round'
            />
        </svg>
    );
};

export default SortIcon;
