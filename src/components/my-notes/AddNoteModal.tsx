'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
    ArrowLeft,
    Bold,
    ImageIcon,
    Italic,
    Link2,
    List,
    ListOrdered,
    Loader,
    Paperclip,
    Underline,
    X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
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
import GlobalEditor from '../editor/GlobalEditor';
import { useAddNoteMutation } from '@/redux/api/notes/notesApi';
import { TNote } from '@/types';
import SelectPurpose from '../calendar/CreateEvent/SelectPurpose';
import GlobalModal from '../global/GlobalModal';
import { useUploadUserDocumentFileMutation } from '@/redux/api/documents/documentsApi';
import GlobalBlockEditor from '../editor/GlobalBlockEditor';

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
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(
        null,
    );
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [uploadingThumb, setUploadingThumb] = useState(false);
    const [uploadingAttac, setUploadingAttac] = useState(false);
    const [addNote, { isLoading: isCreating }] = useAddNoteMutation();
    const [
        uploadUserDocumentFile,
        { isLoading: isUploading, isError, isSuccess, data },
    ] = useUploadUserDocumentFileMutation();

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

    // Set default values when the modal opens
    useEffect(() => {
        if (isOpen && defaultValues) {
            setThumbnailPreview(defaultValues?.thumbnail || '');
            // setAttachedFileUrls(defaultValues?.attachments || []);
            form.reset({
                description: defaultValues.description,
                title: defaultValues.title,
                tags: defaultValues?.tags,
                purpose: defaultValues?.purpose,
                attachments: defaultValues?.attachments || [],
                thumbnail: defaultValues?.thumbnail || '',
            });
        }
    }, [isOpen, defaultValues, form]);

    const handleFileAttachment = async (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setUploadingAttac(true);
            try {
                // Create an array of promises for each file upload
                const uploadPromises = newFiles.map(async (file) => {
                    const url = await uploadFile(file);
                    if (url) {
                        return {
                            name: file.name,
                            size: file.size,
                            url: url,
                            type: file.type,
                        };
                    }
                    return null;
                });

                // Wait for all promises to resolve
                const results = await Promise.all(uploadPromises);

                // Filter out any null results
                const newAttachments = results.filter(
                    (attachment) => attachment !== null,
                );

                // Now set the form value after all uploads are complete
                form.setValue('attachments', newAttachments);
            } catch (error) {
                console.error('Failed to upload attachments:', error);
            } finally {
                console.log('d');
                setUploadingAttac(false);
            }
        }
    };

    const handleRemoveFile = (index: number) => {
        const current = form.watch('attachments');

        const newValues = current?.filter((item) => {
            const i = current.indexOf(item);
            if (i !== i) {
                return item;
            }
        });

        form.setValue('attachments', newValues);
    };

    const handleRemoveThumbnail = () => {
        setThumbnailPreview(null);
        form.setValue('thumbnail', '');
        setThumbnailFile(null);
    };

    const onSubmit = async (values: z.infer<typeof noteSchema>) => {
        const submissionData: Partial<TNote> = {
            description: values.description,
            title: values.title.trim(),
            // tags: values.tags
            //     ? values.tags.split(',').map((tag) => tag.trim())
            //     : [],
            thumbnail: values.thumbnail,
            attachments: values.attachments,
            purpose: values.purpose,
        };

        try {
            const res = await addNote(submissionData).unwrap();
            if (res) {
                console.log(res);
                onClose();
            }
        } catch (err) {
            console.log(err);
        }
    };

    const uploadFile = async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append('file', file);

        try {
            await uploadUserDocumentFile(formData).unwrap();
            return data?.fileUrl as string;
        } catch (error) {
            console.error('Error uploading file:', error);
            throw error;
        }
    };

    const handleThumbnailChange = async (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            setUploadingThumb(true);

            try {
                const url = await uploadFile(file);
                if (url) {
                    form.setValue('thumbnail', url);
                }
            } catch (error) {
                console.error('Failed to upload thumbnail:', error);
            } finally {
                console.log('d');
                setUploadingThumb(false);
            }
        }
    };

    return (
        <GlobalModal
            fullScreen
            open={isOpen}
            setOpen={(open) => !open && onClose()}
            title={
                <div className='w-full'>
                    <GlobalHeader
                        className='border-none'
                        title={defaultValues ? 'Edit Note' : 'Add Note'}
                        subTitle={
                            defaultValues
                                ? 'Fill out the form, to update note'
                                : 'Fill out the form, to add new note'
                        }
                        buttons={
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
                                    onClick={form.handleSubmit(onSubmit)}
                                >
                                    Save & Close
                                </Button>
                            </div>
                        }
                    />
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
                                                        <Input
                                                            placeholder='Enter tags (Maximum 10 tags)'
                                                            {...field}
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
                                                        <div className='mt-1 flex justify-center bg-background rounded-lg border border-dashed border-border px-6 py-10'>
                                                            <div className='text-center'>
                                                                {uploadingThumb ? (
                                                                    <div className='flex text-dark-gray items-center flex-col gap-3 justify-between w-full'>
                                                                        <Loader className='animate-spin' />
                                                                        <p className='text-sm'>
                                                                            Uploading
                                                                            thumbnail.
                                                                            Please
                                                                            wait...
                                                                        </p>
                                                                    </div>
                                                                ) : form.watch(
                                                                      'thumbnail',
                                                                  ) ? (
                                                                    <div className='relative mx-auto h-32 w-32 overflow-hidden rounded'>
                                                                        <Image
                                                                            src={
                                                                                field.value ||
                                                                                '/placeholder.svg'
                                                                            }
                                                                            alt='Thumbnail preview'
                                                                            fill
                                                                            className='object-cover'
                                                                        />
                                                                        <Button
                                                                            disabled={
                                                                                isUploading
                                                                            }
                                                                            type='button'
                                                                            variant='destructive'
                                                                            size='icon'
                                                                            className='absolute right-1 top-1 h-6 w-6'
                                                                            onClick={
                                                                                handleRemoveThumbnail
                                                                            }
                                                                        >
                                                                            <X className='h-3 w-3' />
                                                                        </Button>
                                                                    </div>
                                                                ) : (
                                                                    <>
                                                                        <ImageIcon className='mx-auto h-12 w-12 text-muted-foreground' />
                                                                        <div className='mt-4 flex text-sm text-muted-foreground'>
                                                                            <label
                                                                                htmlFor='thumbnail-upload'
                                                                                className='relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/80'
                                                                            >
                                                                                <span>
                                                                                    Click
                                                                                    to
                                                                                    upload
                                                                                    a
                                                                                    thumbnail
                                                                                </span>
                                                                                <input
                                                                                    disabled={
                                                                                        isUploading
                                                                                    }
                                                                                    id='thumbnail-upload'
                                                                                    name='thumbnail'
                                                                                    type='file'
                                                                                    accept='image/jpeg,image/png,image/gif'
                                                                                    className='sr-only'
                                                                                    onChange={
                                                                                        handleThumbnailChange
                                                                                    }
                                                                                />
                                                                                <p className='mt-1 text-xs text-muted-foreground'>
                                                                                    or
                                                                                    drag
                                                                                    and
                                                                                    drop
                                                                                </p>
                                                                                <p className='text-xs text-muted-foreground'>
                                                                                    JPG,
                                                                                    PNG
                                                                                    |
                                                                                    Max
                                                                                    5MB
                                                                                </p>
                                                                            </label>
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
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
                                                        <div className='rounded-lg border bg-background p-4'>
                                                            {uploadingAttac ? (
                                                                <div className='flex text-dark-gray items-center flex-col gap-3 justify-between w-full'>
                                                                    <Loader className='animate-spin' />
                                                                    <p className='text-sm'>
                                                                        Uploading
                                                                        attachments.
                                                                        Please
                                                                        wait...
                                                                    </p>
                                                                </div>
                                                            ) : form.watch(
                                                                  'attachments',
                                                              ) &&
                                                              field.value &&
                                                              field.value
                                                                  ?.length >
                                                                  0 ? (
                                                                <ul className='space-y-2'>
                                                                    {field.value?.map(
                                                                        (
                                                                            url,
                                                                            index,
                                                                        ) => (
                                                                            <li
                                                                                key={
                                                                                    index
                                                                                }
                                                                                className='flex items-center justify-between rounded-md border bg-foreground p-2 text-sm'
                                                                            >
                                                                                <div className='flex items-center gap-2'>
                                                                                    <Paperclip className='h-4 w-4 text-muted-foreground' />
                                                                                    <span className='truncate'>
                                                                                        {
                                                                                            url?.name
                                                                                        }
                                                                                        {/* Extract filename */}
                                                                                    </span>
                                                                                </div>
                                                                                <Button
                                                                                    type='button'
                                                                                    variant='ghost'
                                                                                    size='icon'
                                                                                    className='h-6 w-6'
                                                                                    onClick={() =>
                                                                                        handleRemoveFile(
                                                                                            index,
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    <X className='h-3 w-3' />
                                                                                </Button>
                                                                            </li>
                                                                        ),
                                                                    )}
                                                                </ul>
                                                            ) : (
                                                                <div className='flex items-center justify-center py-2 text-sm text-muted-foreground'>
                                                                    <label
                                                                        htmlFor='file-upload'
                                                                        className='relative text-center cursor-pointer rounded-md font-medium text-primary hover:text-primary/80'
                                                                    >
                                                                        <span className='text-center'>
                                                                            Attach
                                                                            or
                                                                            drag
                                                                            &
                                                                            drop
                                                                        </span>
                                                                        <input
                                                                            id='file-upload'
                                                                            name='files'
                                                                            type='file'
                                                                            multiple
                                                                            className='sr-only'
                                                                            onChange={
                                                                                handleFileAttachment
                                                                            }
                                                                        />

                                                                        <p className='mt-1 text-center text-xs text-muted-foreground'>
                                                                            JPG,
                                                                            PNG,
                                                                            PDF,
                                                                            DOCS
                                                                            |
                                                                            Max
                                                                            5MB
                                                                        </p>
                                                                    </label>
                                                                </div>
                                                            )}
                                                        </div>
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
