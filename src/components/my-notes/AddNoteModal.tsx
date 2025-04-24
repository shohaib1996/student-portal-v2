'use client';

import type React from 'react';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ArrowLeft, ImageIcon, Loader, Paperclip, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import GlobalHeader from '../global/GlobalHeader';
import {
    useAddNoteMutation,
    useUpdateNoteMutation,
} from '@/redux/api/notes/notesApi';
import type { TNote } from '@/types';
import SelectPurpose from '../calendar/CreateEvent/SelectPurpose';
import GlobalModal from '../global/GlobalModal';
import { useUploadUserDocumentFileMutation } from '@/redux/api/documents/documentsApi';
import GlobalBlockEditor from '../editor/GlobalBlockEditor';
import { toast } from 'sonner';
import UploadAttatchment from '../global/UploadAttatchment/UploadAttatchment';
import UploadThumbnail from '../global/UploadThumbnail/UploadThumbnail';
import { TagsInput } from '../global/TagsInput';

export interface AddNoteModalProps {
    isOpen: boolean;
    onClose: () => void;
    defaultValues?: TNote;
    documentId: string;
}

// Zod validation schema
const noteSchema = z.object({
    title: z.string().trim().min(1, { message: 'Title is required' }),
    description: z.string().optional(),
    thumbnail: z.string().optional(),
    tags: z.array(z.string()).optional(),
    purpose: z
        .object({
            category: z.string(),
            resourceId: z.string(),
        })
        .optional(),
    attachments: z
        .array(
            z.object({
                name: z.string(),
                type: z.string(),
                size: z.number(),
                url: z.string(),
            }),
        )
        .optional(),
});

export function AddNoteModal({
    isOpen,
    onClose,
    defaultValues,
    documentId,
}: AddNoteModalProps) {
    const [addNote, { isLoading: isCreating }] = useAddNoteMutation();
    const [updateNote, { isLoading: isUpdating }] = useUpdateNoteMutation();

    // Initialize form with react-hook-form and zod resolver
    const form = useForm<z.infer<typeof noteSchema>>({
        resolver: zodResolver(noteSchema),
        defaultValues: {
            attachments: defaultValues?.attachments || [],
            description: defaultValues?.description || '',
            title: defaultValues?.title || '',
            tags: defaultValues?.tags || [],
        },
    });

    const clearForm = () => {
        form.reset({
            description: '',
            title: '',
            tags: [],
            purpose: {
                category: '',
                resourceId: '',
            },
            attachments: [],
            thumbnail: '',
        });
    };

    // Set default values when the modal opens
    useEffect(() => {
        if (isOpen && defaultValues) {
            form.reset({
                description: defaultValues.description,
                title: defaultValues.title,
                tags: defaultValues?.tags || [],
                purpose: defaultValues?.purpose,
                attachments: defaultValues?.attachments || [],
                thumbnail: defaultValues?.thumbnail || '',
            });
        }
    }, [isOpen, defaultValues, form]);

    const onSubmit = async (values: z.infer<typeof noteSchema>) => {
        const submissionData: Partial<TNote> = {
            description: values.description,
            title: values.title.trim(),
            tags: values.tags || [],
            thumbnail: values.thumbnail,
            attachments: values.attachments,
            purpose: values.purpose,
        };

        try {
            if (defaultValues) {
                const res = await updateNote({
                    id: defaultValues._id,
                    data: submissionData,
                });

                if (res) {
                    toast.success('Note updated successfully');
                    onClose();
                    clearForm();
                }
            } else {
                const res = await addNote(submissionData).unwrap();
                if (res) {
                    onClose();
                    clearForm();
                    toast.success('Added new note successfully');
                }
            }
        } catch (err) {
            toast.error(`Failed to ${defaultValues ? 'update' : 'add'} note`);
        }
    };

    return (
        <GlobalModal
            fullScreen
            open={isOpen}
            setOpen={(open) => {
                if (!open) {
                    onClose();
                    clearForm();
                }
            }}
            title={
                <div className='w-full flex flex-row items-start'>
                    <Button variant={'ghost'} onClick={onClose}>
                        <ArrowLeft size={20} />
                    </Button>
                    <GlobalHeader
                        withTooltip={false}
                        className='border-none'
                        title={defaultValues ? 'Edit Note' : 'Add Note'}
                        subTitle={
                            defaultValues
                                ? 'Fill out the form, to update note'
                                : 'Fill out the form, to add new note'
                        }
                    />
                </div>
            }
            buttons={
                <div className='flex items-center gap-2'>
                    <Button variant='outline' size='sm' onClick={onClose}>
                        Cancel
                    </Button>
                    <Button size='sm' onClick={form.handleSubmit(onSubmit)}>
                        Save & Close
                    </Button>
                </div>
            }
        >
            <div className='min-w-full bg-foreground overflow-y-auto p-0'>
                <div className='flex h-full flex-col'>
                    <div className='flex-1 overflow-y-auto p-4 document-container w-full'>
                        <Form {...form}>
                            <form
                                id='upload-document-form'
                                onSubmit={form.handleSubmit(onSubmit)}
                                className='grid grid-cols-1 gap-6 lg:grid-cols-3'
                            >
                                {/* Left column - 2/3 width on large screens */}
                                <div className='lg:col-span-2'>
                                    <div className='space-y-4'>
                                        <div>
                                            <Label
                                                htmlFor='description'
                                                className='mb-2 flex items-center gap-1'
                                            >
                                                Description
                                            </Label>
                                            <div className='rounded-md border'>
                                                <FormField
                                                    control={form.control}
                                                    name='description'
                                                    render={({ field }) => (
                                                        <FormItem className='h-[80vh] bg-background'>
                                                            <FormControl>
                                                                <GlobalBlockEditor
                                                                    placeholder='Add Description'
                                                                    value={
                                                                        form.watch(
                                                                            'description',
                                                                        ) || ''
                                                                    }
                                                                    onChange={(
                                                                        val,
                                                                    ) =>
                                                                        field.onChange(
                                                                            val,
                                                                        )
                                                                    }
                                                                />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right column - 1/3 width on large screens */}
                                <div className='space-y-6'>
                                    <div className='space-y-4'>
                                        <FormField
                                            control={form.control}
                                            name='title'
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className='mb-2 flex items-center gap-1'>
                                                        Title{' '}
                                                        <span className='text-red-500'>
                                                            *
                                                        </span>
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder='Enter document name'
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name='purpose'
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className='mb-2 flex items-center gap-1'>
                                                        Purpose
                                                    </FormLabel>
                                                    <SelectPurpose
                                                        className='bg-background text-gray'
                                                        value={
                                                            field.value || {
                                                                category: '',
                                                                resourceId: '',
                                                            }
                                                        }
                                                        onChange={(val) =>
                                                            field.onChange(val)
                                                        }
                                                    />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name='tags'
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Tags</FormLabel>
                                                    <FormControl>
                                                        <TagsInput
                                                            itemClassName='bg-foreground'
                                                            className='bg-background'
                                                            selectedTags={
                                                                field.value ||
                                                                []
                                                            }
                                                            setSelectedTags={
                                                                field.onChange
                                                            }
                                                            tags={[]}
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name='thumbnail'
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        {' '}
                                                        Upload Thumbnail
                                                    </FormLabel>
                                                    <FormControl>
                                                        <UploadThumbnail
                                                            ratio='12:8'
                                                            value={
                                                                field.value ||
                                                                ''
                                                            }
                                                            onChange={
                                                                field.onChange
                                                            }
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name='attachments'
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        Attached Files (
                                                        {field.value?.length})
                                                    </FormLabel>
                                                    <FormControl>
                                                        <UploadAttatchment
                                                            attachments={
                                                                field.value ||
                                                                []
                                                            }
                                                            onChange={
                                                                field.onChange
                                                            }
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                            </form>
                        </Form>
                    </div>
                </div>
            </div>
        </GlobalModal>
    );
}
