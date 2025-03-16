import { cn } from '@/lib/utils';
import React from 'react';

const ExportIcon = ({ className }: { className?: string }) => {
    return (
        <svg
            viewBox='0 0 20 21'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
            className={cn('size-5 stroke-white', className)}
        >
            <path
                d='M7.50033 19H12.5003C16.667 19 18.3337 17.3333 18.3337 13.1666V8.16665C18.3337 3.99998 16.667 2.33331 12.5003 2.33331H7.50033C3.33366 2.33331 1.66699 3.99998 1.66699 8.16665V13.1666C1.66699 17.3333 3.33366 19 7.50033 19Z'
                strokeWidth='1.5'
                strokeLinecap='round'
                strokeLinejoin='round'
            />
            <path
                d='M7.5 8.59164L10 6.09164L12.5 8.59164'
                strokeWidth='1.5'
                strokeLinecap='round'
                strokeLinejoin='round'
            />
            <path
                d='M10 6.09164V12.7583'
                strokeWidth='1.5'
                strokeLinecap='round'
                strokeLinejoin='round'
            />
            <path
                d='M5 14.425C8.24167 15.5083 11.7583 15.5083 15 14.425'
                strokeWidth='1.5'
                strokeLinecap='round'
                strokeLinejoin='round'
            />
        </svg>
    );
};

export default ExportIcon;
