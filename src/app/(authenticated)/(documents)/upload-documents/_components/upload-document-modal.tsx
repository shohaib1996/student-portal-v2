'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { ArrowLeft, ImageIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    UploadDoc,
    useAddUserDocumentMutation,
    useUploadUserDocumentFileMutation,
} from '@/redux/api/documents/documentsApi';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import GlobalEditor from '@/components/editor/GlobalEditor';
import { TagsInput } from '@/components/global/TagsInput';
import UploadThumbnail from '@/components/global/UploadThumbnail/UploadThumbnail';
import UploadAttatchment from '@/components/global/UploadAttatchment/UploadAttatchment';
import GlobalBlockEditor from '@/components/editor/GlobalBlockEditor';
import { useUpdateUserDocumentMutation } from '@/redux/api/documents/documentsApi';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
export interface UploadDocumentModalProps {
    isOpen: boolean;
    onClose: () => void;
    selected: UploadDoc | null;
}

// Zod schema for form validation
const documentSchema = z.object({
    description: z.string().optional(),
    documentName: z
        .string()
        .trim()
        .min(1, { message: 'Document is required' })
        .refine((value) => value.trim().length > 0, {
            message: 'Document name cannot contain spaces',
        }),
    tags: z.array(z.string()).optional(),
    thumbnail: z.string().optional(),
    priority: z.enum(['high', 'medium', 'low']).optional(),
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

export function UploadDocumentModal({
    isOpen,
    onClose,
    selected,
}: UploadDocumentModalProps) {
    const [
        addUserDocument,
        {
            isLoading: isSubmitting,
            isError: isSubmitError,
            isSuccess: isSubmitSuccess,
            data: submitResponse,
        },
    ] = useAddUserDocumentMutation();
    const [updateUserDocument, { isLoading: isUpdating }] =
        useUpdateUserDocumentMutation();

    // Initialize form with react-hook-form and zod resolver
    const form = useForm<z.infer<typeof documentSchema>>({
        resolver: zodResolver(documentSchema),
        defaultValues: {
            description: '',
            documentName: '',
            tags: [],
        },
    });

    const handleSubmit = async (values: z.infer<typeof documentSchema>) => {
        const submissionData = {
            description: values.description,
            name: values.documentName,
            tags: values.tags,
            thumbnail: values.thumbnail,
            attachments: values.attachments || [],
            priority: values.priority,
        };

        try {
            if (selected) {
                const result = await updateUserDocument({
                    id: selected._id,
                    data: submissionData,
                }).unwrap();

                if (result.success) {
                    toast.success('Document updated successfully!');
                    onClose();
                }
            } else {
                await addUserDocument(submissionData).unwrap();
                toast.success('Document added successfully!');
                onClose();
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (selected) {
            form.reset({
                description: selected.description,
                documentName: selected.name,
                tags: [],
                thumbnail: selected?.thumbnail,
                attachments: selected?.attachments || [],
                priority: selected?.priority,
            });
        }
    }, [selected]);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className='h-screen min-w-full overflow-y-auto p-0'>
                <div className='flex h-full flex-col'>
                    {/* Header */}
                    <div className='sticky top-0 flex flex-col lg:flex-row gap-2 lg:gap-0 lg:items-center lg:justify-between border-b bg-background p-4 z-20'>
                        <div className='flex items-center gap-2'>
                            <Button
                                variant='outline'
                                size='icon'
                                onClick={onClose}
                            >
                                <ArrowLeft className='h-4 w-4' />
                                <span className='sr-only'>Back</span>
                            </Button>
                            <div>
                                <h1 className='text-xl font-semibold'>
                                    {selected
                                        ? 'Update Document'
                                        : 'Add New Document'}
                                </h1>
                                <p className='text-sm text-muted-foreground'>
                                    Fill out the form to update document
                                </p>
                            </div>
                        </div>
                        <div className='flex items-center gap-2'>
                            <Button
                                variant='outline'
                                size='sm'
                                onClick={onClose}
                            >
                                Cancel
                            </Button>
                            <Button
                                size='sm'
                                type='submit'
                                form='upload-document-form'
                                disabled={isSubmitting || isUpdating}
                            >
                                {isSubmitting ? 'Saving...' : 'Save & Close'}
                            </Button>
                        </div>
                    </div>

                    {/* Form content */}
                    <div className='flex-1 overflow-y-auto p-4 document-container w-full'>
                        <Form {...form}>
                            <form
                                id='upload-document-form'
                                onSubmit={form.handleSubmit(handleSubmit)}
                                className='grid grid-cols-1 gap-6 lg:grid-cols-3'
                            >
                                {/* Left column - 2/3 width on large screens */}
                                <div className='lg:col-span-2'>
                                    <FormField
                                        control={form.control}
                                        name='description'
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className='mb-2 flex items-center gap-1'>
                                                    Description
                                                    <span className='text-muted-foreground'>
                                                        <svg
                                                            xmlns='http://www.w3.org/2000/svg'
                                                            width='16'
                                                            height='16'
                                                            viewBox='0 0 24 24'
                                                            fill='none'
                                                            stroke='currentColor'
                                                            strokeWidth='2'
                                                            strokeLinecap='round'
                                                            strokeLinejoin='round'
                                                            className='h-4 w-4'
                                                        >
                                                            <circle
                                                                cx='12'
                                                                cy='12'
                                                                r='10'
                                                            />
                                                            <path d='M12 16v-4' />
                                                            <path d='M12 8h.01' />
                                                        </svg>
                                                    </span>
                                                </FormLabel>
                                                <FormControl>
                                                    <GlobalBlockEditor
                                                        value={
                                                            field.value || ''
                                                        }
                                                        onChange={(val) =>
                                                            field.onChange(val)
                                                        }
                                                        className='min-h-[calc(100vh-300px)]'
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* Right column - 1/3 width on large screens */}
                                <div className='space-y-6'>
                                    <div className='space-y-4'>
                                        <FormField
                                            control={form.control}
                                            name='documentName'
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className='mb-2 flex items-center gap-1'>
                                                        Document Name
                                                        <span className='text-red-500'>
                                                            *
                                                        </span>
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            className='bg-foreground'
                                                            placeholder='Enter document name (no spaces allowed)'
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name='priority'
                                            render={({ field }) => (
                                                <FormItem key={field.value}>
                                                    <FormLabel>
                                                        Priority
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Select
                                                            defaultValue={
                                                                field.value
                                                            }
                                                            onValueChange={
                                                                field.onChange
                                                            }
                                                            {...field}
                                                        >
                                                            <SelectTrigger className='bg-foreground'>
                                                                <SelectValue placeholder='Select Priority' />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value='high'>
                                                                    High
                                                                </SelectItem>
                                                                <SelectItem value='medium'>
                                                                    Medium
                                                                </SelectItem>
                                                                <SelectItem value='low'>
                                                                    low
                                                                </SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </FormControl>
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
                                                            tags={[]}
                                                            selectedTags={
                                                                field.value ||
                                                                []
                                                            }
                                                            setSelectedTags={
                                                                field.onChange
                                                            }
                                                            placeholder='Enter tags (Maximum 10 tags)'
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
                                                        Upload Thumbnail
                                                    </FormLabel>
                                                    <FormControl>
                                                        <UploadThumbnail
                                                            className='bg-foreground'
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
                                                        Upload Attachments
                                                    </FormLabel>
                                                    <FormControl>
                                                        <UploadAttatchment
                                                            className='bg-foreground'
                                                            uploadClassName='bg-background'
                                                            itemClassName='bg-background'
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
            </DialogContent>
        </Dialog>
    );
}
