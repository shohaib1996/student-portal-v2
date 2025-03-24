'use client';

import { useDispatch } from 'react-redux';
import { Button } from '@/components/ui/button';
import { openModal } from '@/redux/features/selectionModalSlice';
import { CombinedSelectionModal } from '../combined-selection-modal';

interface Props {
    title?: string;
    icon?: React.ReactNode;
}

export default function CourseSectionOpenButton({ title, icon }: Props) {
    const dispatch = useDispatch();

    const handleOpenCourse = () => {
        dispatch(openModal('course'));
    };

    return (
        <>
            <Button variant='outline' onClick={handleOpenCourse} className=''>
                {icon} {title || 'Select Course'}
            </Button>

            <CombinedSelectionModal />
        </>
    );
}
