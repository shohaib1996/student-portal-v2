import { useGetSingleNoteQuery } from '@/redux/api/notes/notesApi';
import { TNote } from '@/types';
import { useRouter, useSearchParams } from 'next/navigation';
import React from 'react';
import GlobalModal from '../global/GlobalModal';
import GlobalHeader from '../global/GlobalHeader';
import { ArrowLeft, BookOpen, CalendarIcon, CircleDot } from 'lucide-react';
import { cn } from '@/lib/utils';
import dayjs from 'dayjs';
import { AddNoteModal } from './AddNoteModal';

const EditNoteModal = () => {
    const searchParams = useSearchParams();
    const mode = searchParams.get('mode');
    const id = searchParams.get('detail');
    const router = useRouter();

    const { data, isLoading } = useGetSingleNoteQuery(id as string, {
        skip: !id,
    });

    const note = data?.note as TNote;
    return (
        <AddNoteModal
            documentId=''
            isOpen={mode === 'edit' && id !== null}
            onClose={() => router.push('/my-notes')}
            defaultValues={note}
        />
    );
};

export default EditNoteModal;
