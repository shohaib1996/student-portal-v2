'use client';

import GlobalBlockEditor from '@/components/editor/GlobalBlockEditor';
import { renderText } from '@/components/lexicalEditor/renderer/renderText';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    useAddNoteMutation,
    useDeleteNoteMutation,
    useGetSingleNoteQuery,
    useUpdateNoteMutation,
} from '@/redux/api/notes/notesApi';
import { TNote } from '@/types';
import { FileText, Pencil } from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';

const NewAddNote = ({ contentId }: { contentId: string }) => {
    const [isEdit, setIsEdit] = useState(false);
    const [title, setTitle] = useState<string>('');
    const [description, setDescription] = useState<string>('');

    const {
        data: noteData,
        isLoading: isLoadingNote,
        refetch, // Add refetch function to manually refresh data
    } = useGetSingleNoteQuery(contentId);
    const note: TNote = noteData?.note;

    const [updateNote, { isLoading: isUpdating }] = useUpdateNoteMutation();
    const [addNote, { isLoading: isCreating }] = useAddNoteMutation();
    const [deleteNote, { isLoading: isDeleting }] = useDeleteNoteMutation();

    // Set initial form values when note data is loaded or when entering edit mode
    useEffect(() => {
        if (note && isEdit) {
            setTitle(note.title || '');
            setDescription(note.description || '');
        }
    }, [note, isEdit]);

    const handleDeleteNote = async () => {
        try {
            const res = await deleteNote(note._id).unwrap();
        } catch (err) {
            console.log(err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const payload = {
            title,
            description,
            contentId,
            purpose: {
                category: '', // e.g., "module", "document"
                resourceId: contentId, // ID of the related resource
            }, // Make sure contentId is included in the payload if needed by your API
        };

        try {
            if (note?._id) {
                await updateNote({ id: note._id, data: payload }).unwrap();
            } else {
                await addNote(payload).unwrap();
            }

            // After successful mutation, refetch the data to get the latest version
            await refetch();

            // Then exit edit mode
            setIsEdit(false);
        } catch (error) {
            console.error('Note submission error:', error);
        }
    };

    const handleCancel = () => {
        setIsEdit(false);
        // Reset form values
        if (note) {
            setTitle(note.title || '');
            setDescription(note.description || '');
        } else {
            setTitle('');
            setDescription('');
        }
    };

    // Display when there's no data
    const renderEmptyState = () => (
        <div className='flex flex-col items-center justify-center p-8 bg-muted/20 rounded-lg text-center'>
            <FileText className='h-12 w-12 text-muted-foreground mb-4' />
            <h3 className='text-lg font-medium mb-2'>No Notes Available</h3>
            <p className='text-muted-foreground mb-4'>
                Create a new note to keep track of important information.
            </p>
            <Button onClick={() => setIsEdit(true)}>Create Note</Button>
        </div>
    );

    // Show loading state
    if (isLoadingNote) {
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
            {!isEdit ? (
                note ? (
                    <div className='bg-primary-light dark:bg-background p-4 rounded-lg mt-2'>
                        <div className='flex gap-2 w-full'>
                            <p className='font-semibold text-2xl mb-2'>
                                Title: {note.title || 'Untitled Note'}
                            </p>
                            <Button
                                icon={<Pencil size={14} />}
                                onClick={() => setIsEdit(true)}
                                variant={'secondary'}
                                size={'sm'}
                                className='ml-auto'
                            >
                                Edit
                            </Button>
                            <Button
                                icon={<Pencil size={14} />}
                                onClick={handleDeleteNote}
                                variant={'delete_button'}
                                size={'sm'}
                            ></Button>
                        </div>
                        <div className='text-dark-gray'>
                            {renderText({ text: note?.description })}
                        </div>
                    </div>
                ) : (
                    renderEmptyState()
                )
            ) : (
                <form
                    onSubmit={handleSubmit}
                    className='border border-border p-4 rounded-md space-y-4 mt-4'
                >
                    <div className='space-y-2'>
                        <Label htmlFor='note-title'>Title</Label>
                        <Input
                            id='note-title'
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder='Enter title'
                            required
                        />
                    </div>

                    <div className='space-y-2 h-[50vh]'>
                        <Label>Note Content</Label>
                        <GlobalBlockEditor
                            value={description}
                            onChange={setDescription}
                        />
                    </div>

                    <div className='flex justify-end pt-3 space-x-2'>
                        <Button
                            type='button'
                            variant='outline'
                            onClick={handleCancel}
                        >
                            Cancel
                        </Button>
                        <Button
                            type='submit'
                            disabled={isUpdating || isCreating}
                        >
                            {isUpdating || isCreating
                                ? 'Saving...'
                                : note?._id
                                  ? 'Update Note'
                                  : 'Save Note'}
                        </Button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default NewAddNote;
