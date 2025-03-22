// components/SelectionPreview.tsx
'use client';

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { openModal } from '@/redux/features/selectionModalSlice';
import { RootState } from '@/redux/store';
import { CombinedSelectionModal } from './combined-selection-modal';

export default function CourseSectionOpenButton() {
    const dispatch = useDispatch();

    const handleOpenCourse = () => {
        dispatch(openModal('course'));
    };

    return (
        <>
            <Button variant='outline' onClick={handleOpenCourse} className=''>
                Select Course
            </Button>

            {/* Include the CombinedSelectionModal */}
            <CombinedSelectionModal />
        </>
    );
}
