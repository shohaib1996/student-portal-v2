// components/SelectionPreview.tsx
'use client';

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { openModal } from '@/redux/features/selectionModalSlice';
import { RootState } from '@/redux/store';
import { CombinedSelectionModal } from '../combined-selection-modal';
import Cookies from 'js-cookie';

export default function UniversitySectionOpenButton() {
    const dispatch = useDispatch();
    const { isOpen, activeView, selectedUniversityId, selectedCourseId } =
        useSelector((state: RootState) => state.selectionModal);
    const { companies, activeCompany } = useSelector(
        (state: RootState) => state.company,
    );

    const selectedUniversity = companies.find(
        (company) =>
            company._id ===
            (selectedUniversityId || Cookies.get('activeCompany')),
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
                {selectedUniversity
                    ? selectedUniversity.name
                    : 'Select University'}
            </Button>
            <CombinedSelectionModal />
        </>
    );
}
