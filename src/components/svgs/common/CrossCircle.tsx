import { cn } from '@/lib/utils';
import React from 'react';

const CrossCircle = ({ className }: { className?: string }) => {
    return (
        <svg
            className={cn('size-4 stroke-dark-gray', className)}
            viewBox='0 0 20 20'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
        >
            <path
                d='M10.0003 18.3334C14.5837 18.3334 18.3337 14.5834 18.3337 10C18.3337 5.41669 14.5837 1.66669 10.0003 1.66669C5.41699 1.66669 1.66699 5.41669 1.66699 10C1.66699 14.5834 5.41699 18.3334 10.0003 18.3334Z'
                strokeWidth='1.5'
                strokeLinecap='round'
                strokeLinejoin='round'
            />
            <path
                d='M7.6416 12.3583L12.3583 7.64166'
                strokeWidth='1.5'
                strokeLinecap='round'
                strokeLinejoin='round'
            />
            <path
                d='M12.3583 12.3583L7.6416 7.64166'
                strokeWidth='1.5'
                strokeLinecap='round'
                strokeLinejoin='round'
            />
        </svg>
    );
};

export default CrossCircle;
