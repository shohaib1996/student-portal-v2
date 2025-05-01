'use client';

import { renderText } from '@/components/lexicalEditor/renderer/renderText';
import { Button } from '@/components/ui/button';
import {
    useAddNoteMutation,
    useDeleteNoteMutation,
    useGetNotesQuery,
    useUpdateNoteMutation,
} from '@/redux/api/notes/notesApi';
import type { NoteResponse, TNote } from '@/types';
import { Pencil, Plus, Trash } from 'lucide-react';
import { useState, useEffect } from 'react';
import StickyNoteModal from './sticky-note-modal';
import { Card } from '@/components/ui/card';
import GlobalDeleteModal from '@/components/global/GlobalDeleteModal';
import { toast } from 'sonner';

const NewAddNote = ({ contentId }: { contentId: string }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [selectedNote, setSelectedNote] = useState<TNote | null>(null);
    const [activeNoteId, setActiveNoteId] = useState<string | null>(null);

    const {
        data: getAllNote,
        isLoading,
        refetch,
    } = useGetNotesQuery<{
        data: NoteResponse;
        isLoading: boolean;
    }>({
        refetchOnMountOrArgChange: true,
        refetchOnReconnect: true,
    });

    const notes: TNote[] =
        getAllNote?.notes?.filter(
            (note) => note?.purpose?.resourceId === contentId,
        ) || [];

    // Set the first note as active by default if there are notes and none is selected
    useEffect(() => {
        if (notes.length > 0 && !activeNoteId) {
            setActiveNoteId(notes[0]._id);
        }
    }, [notes, activeNoteId]);

    // Find the currently active note
    const activeNote = notes.find((note) => note._id === activeNoteId) || null;

    const [updateNote, { isLoading: isUpdating }] = useUpdateNoteMutation();
    const [addNote, { isLoading: isCreating }] = useAddNoteMutation();
    const [deleteNote, { isLoading: isDeleting }] = useDeleteNoteMutation();

    const handleOpenModal = (mode: 'create' | 'edit', note?: TNote) => {
        setModalMode(mode);
        setSelectedNote(mode === 'edit' ? note || null : null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedNote(null);
    };

    const handleSubmitNote = async (
        title: string,
        description: string,
        tags: string[],
    ) => {
        const payload = {
            title,
            description,
            tags,
            contentId,
            purpose: {
                category: '',
                resourceId: contentId,
            },
        };

        try {
            if (modalMode === 'edit' && selectedNote?._id) {
                const result = await updateNote({
                    id: selectedNote._id,
                    data: payload,
                }).unwrap();
                if (result?.note?._id) {
                    setActiveNoteId(result.note._id);
                    toast.success('Note update sussfully');
                }
            } else {
                const result = await addNote(payload).unwrap();
                // If this is the first note or we're adding a new note, make it active
                if (result?.note?._id) {
                    setActiveNoteId(result.note._id);
                    toast.success('Note added sussfully');
                }
            }
            await refetch();
            handleCloseModal();
        } catch (error) {
            console.error('Note submission error:', error);
        }
    };

    // Display when there's no data
    const renderEmptyState = () => (
        <div className='flex flex-col items-center justify-center p-8 bg-slate-50 rounded-lg text-center h-full'>
            <h3 className='text-lg font-medium mb-2'>No Notes Available</h3>
            <p className='text-muted-foreground mb-4'>
                Create a new sticky note to keep track of important information.
            </p>
        </div>
    );

    // Show loading state
    if (isLoading) {
        return (
            <div className='flex justify-center items-center p-4'>
                <div className='animate-pulse text-center'>
                    <p className='text-muted-foreground'>Loading notes...</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className='flex justify-between items-center mb-3 mt-3'>
                <h2 className='text-xl font-bold'>Sticky Notes</h2>
                <Button onClick={() => handleOpenModal('create')}>
                    <Plus size={16} className='mr-2' />
                    Add Note
                </Button>
            </div>

            {notes.length === 0 ? (
                renderEmptyState()
            ) : (
                <div className='flex flex-col md:flex-row gap-4'>
                    {/* Left side - Selected note detail view */}
                    <Card className='w-full md:w-3/4  min-h-[200px] p-2'>
                        {activeNote ? (
                            <>
                                <div className='flex justify-between items-start mb-4  border-border-primary-light border-b '>
                                    <h3 className='text-xl font-medium'>
                                        {activeNote.title || 'Untitled Note'}
                                    </h3>
                                    <div className='flex space-x-2 mb-2'>
                                        <Button
                                            onClick={() =>
                                                handleOpenModal(
                                                    'edit',
                                                    activeNote,
                                                )
                                            }
                                            size='sm'
                                        >
                                            <Pencil
                                                size={14}
                                                className='mr-1'
                                            />
                                            Edit
                                        </Button>
                                        <GlobalDeleteModal
                                            modalSubTitle='This action cannot be undone. This will permanently delete your note and remove your data from our servers.'
                                            loading={isDeleting}
                                            deleteFun={deleteNote}
                                            _id={activeNote?._id}
                                        >
                                            <Button
                                                className='h-8'
                                                variant={'danger_light'}
                                                icon={<Trash size={16} />}
                                            >
                                                Delete
                                            </Button>
                                        </GlobalDeleteModal>
                                    </div>
                                </div>
                                <div className=''>
                                    {renderText({
                                        text: activeNote?.description,
                                    })}
                                </div>
                            </>
                        ) : (
                            <div className='flex items-center justify-center h-full'>
                                <p className='text-muted-foreground'>
                                    Select a note to view details
                                </p>
                            </div>
                        )}
                    </Card>

                    {/* Right side - Notes list */}
                    <div className='w-full md:w-1/4 space-y-3 h-[200px] overflow-y-auto'>
                        {notes.map((note) => (
                            <div
                                key={note._id}
                                className={`p-2 rounded-lg border cursor-pointer transition-colors ${
                                    activeNoteId === note._id
                                        ? 'bg-primary-foreground border-border-primary-light'
                                        : 'bg-primary-light hover:bg-primary-foreground '
                                }`}
                                onClick={() => setActiveNoteId(note._id)}
                            >
                                <div className='flex justify-between items-start'>
                                    <h3 className='font-medium truncate'>
                                        {note.title || 'Untitled Note'}
                                    </h3>
                                    <div className='flex space-x-1 ml-2'>
                                        <Button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleOpenModal('edit', note);
                                            }}
                                            variant='ghost'
                                            size='sm'
                                            className='h-6 w-6 p-0'
                                        >
                                            <Pencil size={12} />
                                        </Button>
                                        <GlobalDeleteModal
                                            modalSubTitle='This action cannot be undone. This will permanently delete your note and remove your data from our servers.'
                                            loading={isDeleting}
                                            deleteFun={deleteNote}
                                            _id={note?._id}
                                        >
                                            <Button
                                                variant={'ghost'}
                                                size='sm'
                                                className='h-6 w-6 p-0'
                                                icon={<Trash size={12} />}
                                            ></Button>
                                        </GlobalDeleteModal>
                                    </div>
                                </div>
                                <div className='text-gray text-sm mt-1 line-clamp-2'>
                                    {note.description
                                        ? renderText({ text: note.description })
                                        : 'No content'}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <StickyNoteModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSubmit={handleSubmitNote}
                initialTitle={selectedNote?.title || ''}
                initialDescription={selectedNote?.description || ''}
                isLoading={isUpdating || isCreating}
                mode={modalMode}
            />
        </div>
    );
};

export default NewAddNote;
