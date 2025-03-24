// components/SelectionPreview.tsx
'use client';

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { openModal } from '@/redux/features/selectionModalSlice';
import { RootState } from '@/redux/store';
import { CombinedSelectionModal } from '../combined-selection-modal';

export default function UniversitySectionOpenButton() {
    const dispatch = useDispatch();
    const { isOpen, activeView } = useSelector(
        (state: RootState) => state.selectionModal,
    );

    const handleOpenUniversity = () => {
        dispatch(openModal('university'));
    };

    return (
        <>
            <Button
                variant='outline'
                onClick={handleOpenUniversity}
                className='w-full'
            >
                Select University
            </Button>
            <CombinedSelectionModal />
        </>
    );
}
