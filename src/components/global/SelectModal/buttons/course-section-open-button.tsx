'use client';

import { useDispatch } from 'react-redux';
import { Button } from '@/components/ui/button';
import { openModal } from '@/redux/features/selectionModalSlice';
import { CombinedSelectionModal } from '../combined-selection-modal';
import { useMyProgramQuery } from '@/redux/api/myprogram/myprogramApi';
import { TProgram, TProgramMain } from '@/types';
import { useRouter } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import storage from '@/utils/storage';
import { useEffect, useState } from 'react';
interface Props {
    title?: string;
    icon?: React.ReactNode;
}

export default function CourseSectionOpenButton({ title, icon }: Props) {
    const dispatch = useDispatch();
    const router = useRouter();

    const handleOpenCourse = () => {
        dispatch(openModal('course'));

        // router.push('/dashboard/program');
    };

    const [enrollment, setEnrollment] = useState<TProgramMain | null>(null);

    useEffect(() => {
        const fetchEnrollment = async () => {
            const activeEnrollment = await storage.getItem('active_enrolment');
            if (activeEnrollment) {
                setEnrollment(activeEnrollment);
            }
        };

        fetchEnrollment();
    }, [storage]);

    return (
        <>
            <Button
                tooltip='Select a course to view'
                variant='outline'
                onClick={handleOpenCourse}
                className='rounded-full font-semibold text-muted-foreground size-9 md:size-auto '
            >
                {icon}{' '}
                <p className='hidden lg:inline truncate w-full max-w-36'>
                    {enrollment?.program?.title || 'Select Course'}{' '}
                </p>
                <ChevronDown className='lg:block hidden' size={16} />
            </Button>
        </>
    );
}
