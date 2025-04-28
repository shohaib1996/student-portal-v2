'use client';

import { renderText } from '@/components/lexicalEditor/renderer/renderText';
import { Button } from '@/components/ui/button';
import {
    useAddNoteMutation,
    useDeleteNoteMutation,
    useGetSingleNoteQuery,
    useUpdateNoteMutation,
} from '@/redux/api/notes/notesApi';
import type { TNote } from '@/types';
import { Pencil, StickyNote, Trash } from 'lucide-react';
import { useState, useEffect } from 'react';
import StickyNoteModal from './sticky-note-modal';

const NewAddNote = ({ contentId }: { contentId: string }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    // Add local note state to handle transitions cleanly
    const [currentNote, setCurrentNote] = useState<TNote | null>(null);

    const {
        data: noteData,
        isLoading: isLoadingNote,
        refetch,
        isFetching,
    } = useGetSingleNoteQuery(contentId, {
        refetchOnMountOrArgChange: true,
        // Skip caching to ensure fresh data
        refetchOnReconnect: true,
    });

    // Update local state when data changes
    useEffect(() => {
        if (noteData?.note) {
            setCurrentNote(noteData.note);
        } else {
            // Clear the note when there is no data for this contentId
            setCurrentNote(null);
        }
    }, [noteData, contentId]);

    // Reset state when contentId changes
    useEffect(() => {
        // Clear the current note data while new data is loading
        setCurrentNote(null);
    }, [contentId]);

    const [updateNote, { isLoading: isUpdating }] = useUpdateNoteMutation();
    const [addNote, { isLoading: isCreating }] = useAddNoteMutation();
    const [deleteNote, { isLoading: isDeleting }] = useDeleteNoteMutation();

    const handleDeleteNote = async () => {
        try {
            if (currentNote?._id) {
                await deleteNote(currentNote._id).unwrap();
                setCurrentNote(null);
                await refetch();
            }
        } catch (err) {
            console.log(err);
        }
    };

    const handleOpenModal = (mode: 'create' | 'edit') => {
        setModalMode(mode);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleSubmitNote = async (title: string, description: string) => {
        const payload = {
            title,
            description,
            contentId,
            purpose: {
                category: '', // e.g., "module", "document"
                resourceId: contentId, // ID of the related resource
            },
        };

        try {
            if (modalMode === 'edit' && currentNote?._id) {
                await updateNote({
                    id: currentNote._id,
                    data: payload,
                }).unwrap();
            } else {
                await addNote(payload).unwrap();
            }

            // After successful mutation, refetch the data to get the latest version
            await refetch();

            // Close the modal
            handleCloseModal();
        } catch (error) {
            console.error('Note submission error:', error);
        }
    };

    // Display when there's no data
    const renderEmptyState = () => (
        <div className='flex flex-col items-center justify-center p-8 bg-muted/20 rounded-lg text-center'>
            <StickyNote className='h-12 w-12 text-muted-foreground mb-4' />
            <h3 className='text-lg font-medium mb-2'>No Notes Available</h3>
            <p className='text-muted-foreground mb-4'>
                Create a new sticky note to keep track of important information.
            </p>
            <Button onClick={() => handleOpenModal('create')}>
                Create Sticky Note
            </Button>
        </div>
    );

    // Show loading state
    if (isLoadingNote || isFetching) {
        return (
            <div className='flex justify-center items-center p-8'>
                <div className='animate-pulse text-center'>
                    <p className='text-muted-foreground'>Loading note...</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            {currentNote ? (
                <div className='bg-primary-light dark:bg-background p-4 rounded-lg mt-2'>
                    <div className='flex gap-2 w-full'>
                        <div>
                            <p className='font-semibold text-2xl mb-1'>
                                {currentNote.title || 'Untitled Note'}
                            </p>
                        </div>
                        <Button
                            onClick={() => handleOpenModal('edit')}
                            variant={'secondary'}
                            size={'sm'}
                            className='ml-auto'
                        >
                            <Pencil size={14} className='mr-2' />
                            Edit
                        </Button>
                        <Button
                            onClick={handleDeleteNote}
                            variant={'delete_button'}
                            size={'sm'}
                        >
                            <Trash size={14} />
                        </Button>
                    </div>
                    <div className='text-dark-gray mt-2'>
                        {renderText({ text: currentNote?.description })}
                    </div>
                </div>
            ) : (
                renderEmptyState()
            )}

            <StickyNoteModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSubmit={handleSubmitNote}
                initialTitle={
                    modalMode === 'edit' ? currentNote?.title || '' : ''
                }
                initialDescription={
                    modalMode === 'edit' ? currentNote?.description || '' : ''
                }
                isLoading={isUpdating || isCreating}
                mode={modalMode}
            />
        </div>
    );
};

export default NewAddNote;
