import React from 'react';

const EmptyState: React.FC = () => (
    <p className='py-4 text-center text-primary'>No content available</p>
);

const MemoizedEmptyState = React.memo(EmptyState);
MemoizedEmptyState.displayName = 'EmptyState';

export default MemoizedEmptyState;
