'use client';

import { useDispatch } from 'react-redux';
import { Button } from '@/components/ui/button';
import { openModal } from '@/redux/features/selectionModalSlice';
import { CombinedSelectionModal } from '../combined-selection-modal';
import { useMyProgramQuery } from '@/redux/api/myprogram/myprogramApi';
import { TProgram, TProgramMain } from '@/types';
import { useRouter } from 'next/navigation';

interface Props {
    title?: string;
    icon?: React.ReactNode;
}

export default function CourseSectionOpenButton({ title, icon }: Props) {
    const dispatch = useDispatch();
    const router = useRouter();
    const { data, isLoading, isError, refetch } = useMyProgramQuery({});

    const handleOpenCourse = () => {
        dispatch(openModal('course'));
        refetch();
        router.push('/dashboard/program');
    };

    if (isLoading) {
        return (
            <Button variant='outline' onClick={handleOpenCourse} className=''>
                Program Loading
            </Button>
        );
    }
    if (isError) {
        return (
            <Button variant='outline' onClick={handleOpenCourse} className=''>
                Program Failed!
            </Button>
        );
    }
    const myProgram: TProgramMain = data;
    const program: TProgram = myProgram?.program;

    if (isLoading || isError) {
        return (
            <Button variant='outline' onClick={handleOpenCourse} className=''>
                Loading...
            </Button>
        );
    }

    console.log(program.title);

    return (
        <>
            <Button variant='outline' onClick={handleOpenCourse} className=''>
                {icon} {program?.title || 'Select Course'}
            </Button>

            <CombinedSelectionModal />
        </>
    );
}
