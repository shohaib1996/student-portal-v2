import { cn } from '@/lib/utils';
import React from 'react';

const ImportIcon = ({ className }: { className?: string }) => {
    return (
        <svg
            className={cn('size-5 stroke-white', className)}
            viewBox='0 0 20 21'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
        >
            <path
                d='M7.50033 19H12.5003C16.667 19 18.3337 17.3333 18.3337 13.1666V8.16665C18.3337 3.99998 16.667 2.33331 12.5003 2.33331H7.50033C3.33366 2.33331 1.66699 3.99998 1.66699 8.16665V13.1666C1.66699 17.3333 3.33366 19 7.50033 19Z'
                strokeWidth='1.5'
                strokeLinecap='round'
                strokeLinejoin='round'
            />
            <path
                d='M8.8252 11.7833H12.3585V8.25'
                strokeWidth='1.5'
                strokeLinecap='round'
                strokeLinejoin='round'
            />
            <path
                d='M12.3583 11.7833L7.6416 7.06665'
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

export default ImportIcon;
