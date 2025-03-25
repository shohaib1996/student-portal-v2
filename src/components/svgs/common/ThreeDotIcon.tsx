import { cn } from '@/lib/utils';
import React from 'react';

const ThreeDotIcon = ({ className }: { className?: string }) => {
    return (
        <svg
            className={cn('size-7 fill-white stroke-white', className)}
            viewBox='0 0 26 26'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
        >
            <path
                d='M13.0026 14.0409C13.5779 14.0409 14.0443 13.5745 14.0443 12.9992C14.0443 12.424 13.5779 11.9576 13.0026 11.9576C12.4273 11.9576 11.9609 12.424 11.9609 12.9992C11.9609 13.5745 12.4273 14.0409 13.0026 14.0409Z'
                strokeWidth='1.5'
                strokeLinecap='round'
                strokeLinejoin='round'
            />
            <path
                d='M13.0026 6.75075C13.5779 6.75075 14.0443 6.28438 14.0443 5.70909C14.0443 5.13379 13.5779 4.66742 13.0026 4.66742C12.4273 4.66742 11.9609 5.13379 11.9609 5.70909C11.9609 6.28438 12.4273 6.75075 13.0026 6.75075Z'
                strokeWidth='1.5'
                strokeLinecap='round'
                strokeLinejoin='round'
            />
            <path
                d='M13.0026 21.3333C13.5779 21.3333 14.0443 20.867 14.0443 20.2917C14.0443 19.7164 13.5779 19.25 13.0026 19.25C12.4273 19.25 11.9609 19.7164 11.9609 20.2917C11.9609 20.867 12.4273 21.3333 13.0026 21.3333Z'
                strokeWidth='1.5'
                strokeLinecap='round'
                strokeLinejoin='round'
            />
        </svg>
    );
};

export default ThreeDotIcon;
