'use client';
import GlobalHeader from '@/components/global/GlobalHeader';
import NotesGridView from '@/components/my-notes/NotesGridView';
import NotesListView from '@/components/my-notes/NotesListView';
import { Button } from '@/components/ui/button';
import { Grid2X2, List, ListChecks, Plus } from 'lucide-react';
import React, { useState } from 'react';
import staticData from '../../../components/my-notes/staticNotes.json';

export type TNote = {
    id: number;
    title: string;
    date: string; // Format: YYYY-MM-DD
    description: string;
    purpose: {
        type: 'module' | 'video' | 'document' | 'presentation';
        title: string;
    };
};

const MyNotesPage = () => {
    const [view, setView] = useState<'list' | 'grid'>('grid');

    return (
        <div className='py-2'>
            <GlobalHeader
                title={'My Notes'}
                subTitle='All My Notes in One Place'
                buttons={
                    <div className='flex items-center gap-2'>
                        <Button
                            tooltip='Grid View'
                            size={'icon'}
                            variant={'secondary'}
                        >
                            <Grid2X2 size={18} />
                        </Button>
                        <Button
                            tooltip='List View'
                            size={'icon'}
                            variant={'secondary'}
                        >
                            <ListChecks size={18} />
                        </Button>
                        <Button>
                            <Plus size={18} />
                            Add Note
                        </Button>
                    </div>
                }
            />

            <div className='bg-foreground p-2 mt-2 rounded-lg h-[calc(100vh-132px)]'>
                {view === 'grid' ? (
                    <NotesGridView data={staticData as TNote[]}></NotesGridView>
                ) : (
                    <NotesListView data={staticData as TNote[]}></NotesListView>
                )}
            </div>
        </div>
    );
};

export default MyNotesPage;
