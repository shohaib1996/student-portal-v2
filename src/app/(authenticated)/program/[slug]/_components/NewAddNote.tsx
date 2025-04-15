'use client';

import GlobalBlockEditor from '@/components/editor/GlobalBlockEditor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    useAddNoteMutation,
    useGetSingleNoteQuery,
    useUpdateNoteMutation,
} from '@/redux/api/notes/notesApi';
import { FileText } from 'lucide-react';
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
    const note = noteData?.note;

    const [updateNote, { isLoading: isUpdating }] = useUpdateNoteMutation();
    const [addNote, { isLoading: isCreating }] = useAddNoteMutation();

    // Set initial form values when note data is loaded or when entering edit mode
    useEffect(() => {
        if (note && isEdit) {
            setTitle(note.title || '');
            setDescription(note.description || '');
        }
    }, [note, isEdit]);

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

    // Function to render the note content
    const renderNoteContent = () => {
        if (!note?.description) {
            return 'There is no note content';
        }

        try {
            // Attempt to parse and extract text for display
            const content = JSON.parse(note.description);
            // This is a simplified example - adjust based on your actual content structure
            if (content?.root?.children?.[0]?.children?.[0]?.text) {
                return content.root.children[0].children[0].text;
            }
            return 'Note content available (rich format)';
        } catch (error) {
            return note.description; // Fallback to raw content if parsing fails
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
            <div className='flex items-center justify-end'>
                {!isEdit && note && (
                    <Button onClick={() => setIsEdit(true)}>
                        <FileText className='mr-2' />
                        Edit
                    </Button>
                )}
            </div>

            {!isEdit ? (
                note ? (
                    <div className='bg-primary-foreground p-4 rounded-lg mt-2'>
                        <p className='font-semibold text-lg mb-2'>
                            {note.title || 'Untitled Note'}
                        </p>
                        <p>{renderNoteContent()}</p>
                    </div>
                ) : (
                    renderEmptyState()
                )
            ) : (
                <form
                    onSubmit={handleSubmit}
                    className='border border-border p-4 rounded-md space-y-4 mt-4'
                >
                    <div>
                        <Label htmlFor='note-title'>Title</Label>
                        <Input
                            id='note-title'
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder='Enter title'
                            required
                        />
                    </div>

                    <div>
                        <Label>Note Content</Label>
                        <GlobalBlockEditor
                            value={description}
                            onChange={setDescription}
                        />
                    </div>

                    <div className='flex justify-end space-x-2'>
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
