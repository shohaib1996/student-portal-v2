import { cn } from '@/lib/utils';
import React from 'react';

const RightArrowCircle = ({ className }: { className?: string }) => {
    return (
        <svg
            className={cn('size-5 stroke-dark-gray', className)}
            viewBox='0 0 20 20'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
        >
            <rect x='0.5' y='0.5' width='19' height='19' rx='9.5' />
            <path
                d='M8.59473 12.81L11.4047 10L8.59473 7.19'
                strokeLinecap='round'
                strokeLinejoin='round'
            />
        </svg>
    );
};

export default RightArrowCircle;
