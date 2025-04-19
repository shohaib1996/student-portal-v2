import React from 'react';

const LoadingIndicator: React.FC = () => (
    <div className='flex w-full items-center justify-center py-4 text-center text-primary'>
        <p>Loading...</p>
        <svg
            xmlns='http://www.w3.org/2000/svg'
            width='24'
            height='24'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth={2}
            strokeLinecap='round'
            strokeLinejoin='round'
            className='animate-spin stroke-primary ml-2'
        >
            <path d='M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z' />
            <path d='M21 12a9 9 0 0 1-9 9' />
        </svg>
    </div>
);

// Memoize
const MemoizedLoadingIndicator = React.memo(LoadingIndicator);

// Add display name for better debugging and to satisfy eslint rule
MemoizedLoadingIndicator.displayName = 'LoadingIndicator';

export default MemoizedLoadingIndicator;
