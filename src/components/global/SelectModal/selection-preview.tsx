// components/SelectionPreview.tsx
'use client';

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { openModal } from '@/redux/features/selectionModalSlice';
import { RootState } from '@/redux/store';
import { CombinedSelectionModal } from './combined-selection-modal';

export default function SelectionPreview() {
    const dispatch = useDispatch();
    const { isOpen, activeView } = useSelector(
        (state: RootState) => state.selectionModal,
    );

    const handleOpenUniversity = () => {
        dispatch(openModal('university'));
    };

    const handleOpenCourse = () => {
        dispatch(openModal('course'));
    };

    return (
        <div className='min-h-screen bg-background flex flex-col items-center justify-center gap-4'>
            <div className='flex gap-4'>
                <Button
                    variant='default'
                    onClick={handleOpenUniversity}
                    className='bg-[#0736d1] hover:bg-[#0736d1]/90'
                >
                    Select University
                </Button>
                <Button
                    variant='default'
                    onClick={handleOpenCourse}
                    className='bg-[#0736d1] hover:bg-[#0736d1]/90'
                >
                    Select Course
                </Button>
            </div>

            {/* Display current modal state for debugging */}
            <div className='text-sm text-muted-foreground'>
                Modal State: {isOpen ? 'Open' : 'Closed'} | Active View:{' '}
                {activeView}
            </div>

            {/* Include the CombinedSelectionModal */}
            <CombinedSelectionModal />
        </div>
    );
}
