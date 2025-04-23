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
    attachment: z
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
    const [isUploading, setIsUploading] = useState(false);
    const [
        addUserDocument,
        {
            isLoading: isSubmitting,
            isError: isSubmitError,
            isSuccess: isSubmitSuccess,
            data: submitResponse,
        },
    ] = useAddUserDocumentMutation();

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
            attachment: values.attachment?.map((at) => at.url) || [],
        };

        try {
            await addUserDocument(submissionData).unwrap();
            toast.success('Document added successfully!');
            onClose();
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
                thumbnail: selected.thumbnail,
                attachment: selected.attachment || [],
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
                                    Fill out the form to add new document
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
                                disabled={
                                    isSubmitting || !form.formState.isValid
                                }
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
                                    <div className='space-y-4'>
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
                                                        <div
                                                            className='h-[80vh] !max-w-[calc(100vw-40px)]'
                                                            style={{
                                                                maxWidth:
                                                                    'calc(100vw-40px)',
                                                            }}
                                                        >
                                                            <GlobalBlockEditor
                                                                value={
                                                                    field.value ||
                                                                    ''
                                                                }
                                                                onChange={(
                                                                    val,
                                                                ) =>
                                                                    field.onChange(
                                                                        val,
                                                                    )
                                                                }
                                                            />
                                                        </div>
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </div>
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

                                        {/* <FormField
                                            control={form.control}
                                            name='category1'
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className='mb-2 flex items-center gap-1'>
                                                        Category
                                                        <span className='text-red-500'>
                                                            *
                                                        </span>
                                                    </FormLabel>
                                                    <Select
                                                        onValueChange={
                                                            field.onChange
                                                        }
                                                        defaultValue={
                                                            field.value
                                                        }
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder='Select Category' />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value='development'>
                                                                Development
                                                            </SelectItem>
                                                            <SelectItem value='technology'>
                                                                Technology
                                                            </SelectItem>
                                                            <SelectItem value='design'>
                                                                Design
                                                            </SelectItem>
                                                            <SelectItem value='marketing'>
                                                                Marketing
                                                            </SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        /> */}

                                        {/* <FormField
                                            control={form.control}
                                            name='category2'
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className='mb-2 flex items-center gap-1'>
                                                        Category
                                                        <span className='text-red-500'>
                                                            *
                                                        </span>
                                                    </FormLabel>
                                                    <Select
                                                        onValueChange={
                                                            field.onChange
                                                        }
                                                        defaultValue={
                                                            field.value
                                                        }
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder='Select Category' />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value='web-development'>
                                                                Web Development
                                                            </SelectItem>
                                                            <SelectItem value='mobile-development'>
                                                                Mobile
                                                                Development
                                                            </SelectItem>
                                                            <SelectItem value='technical-test'>
                                                                Technical Test
                                                            </SelectItem>
                                                            <SelectItem value='resources'>
                                                                Resources
                                                            </SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        /> */}

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
                                            name='attachment'
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        Upload Attachments
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
            </DialogContent>
        </Dialog>
    );
}
