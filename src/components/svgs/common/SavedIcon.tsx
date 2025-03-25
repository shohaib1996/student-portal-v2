import { cn } from '@/lib/utils';
import React from 'react';

const SavedIcon = ({ className }: { className?: string }) => {
    return (
        <svg
            className={cn('size-4', className)}
            viewBox='0 0 20 20'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
        >
            <path
                d='M14.0166 1.66666H5.98327C4.20827 1.66666 2.7666 3.11666 2.7666 4.88332V16.625C2.7666 18.125 3.8416 18.7583 5.15827 18.0333L9.22493 15.775C9.65827 15.5333 10.3583 15.5333 10.7833 15.775L14.8499 18.0333C16.1666 18.7667 17.2416 18.1333 17.2416 16.625V4.88332C17.2333 3.11666 15.7916 1.66666 14.0166 1.66666Z'
                strokeWidth='1.5'
                strokeLinecap='round'
                strokeLinejoin='round'
            />
            <path
                d='M7.99121 9.16668L9.24121 10.4167L12.5745 7.08334'
                strokeWidth='1.5'
                strokeLinecap='round'
                strokeLinejoin='round'
            />
        </svg>
    );
};

export default SavedIcon;
