'use client';
import GlobalHeader from '@/components/global/GlobalHeader';
import NotesGridView from '@/components/my-notes/NotesGridView';
import NotesListView from '@/components/my-notes/NotesListView';
import { Button } from '@/components/ui/button';
import { Grid2X2, List, ListChecks, PanelLeft, Plus } from 'lucide-react';
import React, { useState } from 'react';
import { AddNoteModal } from '@/components/my-notes/AddNoteModal';
import { useGetNotesQuery } from '@/redux/api/notes/notesApi';
import { TNote } from '@/types';
import ViewNoteModal from '@/components/my-notes/ViewNoteModal';
import EditNoteModal from '@/components/my-notes/EditNoteModal';
import { Sheet, SheetTrigger } from '@/components/ui/sheet';

const MyNotesPage = () => {
    const [view, setView] = useState<'list' | 'grid'>('grid');
    const [isOpen, setIsOpen] = useState(false);

    const { data, isLoading } = useGetNotesQuery({});

    const notes = data?.notes || [];

    return (
        <div className='py-2'>
            <Sheet>
                <GlobalHeader
                    title={'My Notes'}
                    subTitle='All My Notes in One Place'
                    buttons={
                        <div className='flex items-center gap-2'>
                            <Button
                                tooltip='Grid View'
                                size={'icon'}
                                variant={
                                    view === 'grid' ? 'default' : 'secondary'
                                }
                                onClick={() => setView('grid')}
                            >
                                <Grid2X2 size={18} />
                            </Button>
                            <Button
                                onClick={() => setView('list')}
                                tooltip='List View'
                                size={'icon'}
                                variant={
                                    view === 'list' ? 'default' : 'secondary'
                                }
                            >
                                <ListChecks size={18} />
                            </Button>
                            <Button onClick={() => setIsOpen(true)}>
                                <Plus size={18} />
                                Add Note
                            </Button>
                            <SheetTrigger className='lg:hidden'>
                                <Button
                                    tooltip='Open Notes List'
                                    variant={'secondary'}
                                    size={'icon'}
                                >
                                    <PanelLeft size={18} />
                                </Button>
                            </SheetTrigger>
                        </div>
                    }
                />

                <div className='bg-foreground p-2 mt-2 rounded-lg h-[calc(100vh-132px)]'>
                    {view === 'grid' ? (
                        <NotesGridView
                            setIsOpen={setIsOpen}
                            isLoading={isLoading}
                            data={notes as TNote[]}
                        ></NotesGridView>
                    ) : (
                        <NotesListView data={notes as TNote[]}></NotesListView>
                    )}
                </div>

                <AddNoteModal
                    documentId=''
                    isOpen={isOpen}
                    onClose={() => setIsOpen(false)}
                />
                <ViewNoteModal />
                <EditNoteModal />
            </Sheet>
        </div>
    );
};

export default MyNotesPage;
