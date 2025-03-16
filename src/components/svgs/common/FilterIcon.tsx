import { cn } from '@/lib/utils';
import React from 'react';

const FilterIcon = ({ className }: { className?: string }) => {
    return (
        <svg
            viewBox='0 0 20 20'
            fill='none'
            className={cn('size-5 stroke-white', className)}
            xmlns='http://www.w3.org/2000/svg'
        >
            <path
                d='M18.3333 14.5833H12.5'
                strokeWidth='1.5'
                strokeMiterlimit='10'
                strokeLinecap='round'
                strokeLinejoin='round'
            />
            <path
                d='M4.16602 14.5833H1.66602'
                strokeWidth='1.5'
                strokeMiterlimit='10'
                strokeLinecap='round'
                strokeLinejoin='round'
            />
            <path
                d='M18.334 5.41666H15.834'
                strokeWidth='1.5'
                strokeMiterlimit='10'
                strokeLinecap='round'
                strokeLinejoin='round'
            />
            <path
                d='M7.49935 5.41666H1.66602'
                strokeWidth='1.5'
                strokeMiterlimit='10'
                strokeLinecap='round'
                strokeLinejoin='round'
            />
            <path
                d='M5.83268 12.0833H10.8327C11.7493 12.0833 12.4993 12.5 12.4993 13.75V15.4167C12.4993 16.6667 11.7493 17.0833 10.8327 17.0833H5.83268C4.91602 17.0833 4.16602 16.6667 4.16602 15.4167V13.75C4.16602 12.5 4.91602 12.0833 5.83268 12.0833Z'
                strokeWidth='1.5'
                strokeMiterlimit='10'
                strokeLinecap='round'
                strokeLinejoin='round'
            />
            <path
                d='M9.16667 2.91666H14.1667C15.0833 2.91666 15.8333 3.33332 15.8333 4.58332V6.24999C15.8333 7.49999 15.0833 7.91666 14.1667 7.91666H9.16667C8.25 7.91666 7.5 7.49999 7.5 6.24999V4.58332C7.5 3.33332 8.25 2.91666 9.16667 2.91666Z'
                strokeWidth='1.5'
                strokeMiterlimit='10'
                strokeLinecap='round'
                strokeLinejoin='round'
            />
        </svg>
    );
};

export default FilterIcon;
