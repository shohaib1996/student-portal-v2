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

export interface AddNoteModalProps {
    isOpen: boolean;
    onClose: () => void;
    defaultValues?: {
        description: string;
        name: string;
        tags: string;
        categories: string[];
        thumbnailUrl: string;
        attachedFileUrls: string[];
    };
    documentId: string;
}

// Zod validation schema
const noteSchema = z.object({
    description: z.string().optional(),
    documentName: z.string().min(1, 'Document name cannot be empty'),
    tags: z.string().optional(),
    category1: z.string().optional(),
    category2: z.string().min(1, 'Category is required'),
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
    const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
    const [attachedFileUrls, setAttachedFileUrls] = useState<string[]>([]);

    // Initialize form with react-hook-form and zod resolver
    const form = useForm<z.infer<typeof noteSchema>>({
        resolver: zodResolver(noteSchema),
        defaultValues: {
            description: defaultValues?.description || '',
            documentName: defaultValues?.name || '',
            tags: defaultValues?.tags || '',
            category1: defaultValues?.categories?.[0] || '',
            category2: defaultValues?.categories?.[1] || '',
        },
    });

    // Set default values when the modal opens
    useEffect(() => {
        if (isOpen && defaultValues) {
            setThumbnailPreview(defaultValues.thumbnailUrl);
            setAttachedFileUrls(defaultValues.attachedFileUrls);
            form.reset({
                description: defaultValues.description,
                documentName: defaultValues.name,
                tags: defaultValues.tags,
                category1: defaultValues.categories[0] || '',
                category2: defaultValues.categories[1] || '',
            });
        }
    }, [isOpen, defaultValues, form]);

    const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setThumbnailFile(file);
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    setThumbnailPreview(event.target.result as string);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleFileAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setAttachedFiles((prev) => [...prev, ...newFiles]);
            // For simplicity, we'll just add file names here; in a real app, you'd upload and get URLs
            setAttachedFileUrls((prev) => [
                ...prev,
                ...newFiles.map((file) => file.name),
            ]);
        }
    };

    const handleRemoveFile = (index: number) => {
        setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
        setAttachedFileUrls((prev) => prev.filter((_, i) => i !== index));
    };

    const handleRemoveThumbnail = () => {
        setThumbnailPreview(null);
        setThumbnailFile(null);
    };

    const onSubmit = (values: z.infer<typeof noteSchema>) => {
        const submissionData = {
            description: values.description,
            documentName: values.documentName.trim(),
            categories: [values.category1, values.category2].filter(Boolean),
            tags: values.tags
                ? values.tags.split(',').map((tag) => tag.trim())
                : [],
            thumbnail: thumbnailFile
                ? {
                      name: thumbnailFile.name,
                      size: thumbnailFile.size,
                      type: thumbnailFile.type,
                  }
                : { url: thumbnailPreview }, // Use preview URL if no new file
            attachedFiles:
                attachedFiles.length > 0
                    ? attachedFiles.map((file) => ({
                          name: file.name,
                          size: file.size,
                          type: file.type,
                      }))
                    : attachedFileUrls.map((url) => ({ url })), // Use URLs if no new files
        };

        console.log('Submitting data:', submissionData);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className='h-screen min-w-full bg-foreground overflow-y-auto p-0'>
                <div className='flex h-full flex-col'>
                    {/* Header */}
                    <div className='sticky top-0 z-10 px-4 py-2'>
                        <GlobalHeader
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
                                        type='submit'
                                        form='upload-document-form'
                                    >
                                        Save & Close
                                    </Button>
                                </div>
                            }
                        />
                    </div>

                    {/* Form content */}
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
                                                                <GlobalEditor
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
                                            </div>
                                        </div>
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
                                            name='category1'
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className='mb-2 flex items-center gap-1'>
                                                        Purpose
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
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name='category2'
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className='mb-2 flex items-center gap-1'>
                                                        Category{' '}
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

                                        <div>
                                            <Label className='mb-2'>
                                                Upload Thumbnail
                                            </Label>
                                            <div className='mt-1 flex justify-center bg-background rounded-lg border border-dashed border-border px-6 py-10'>
                                                <div className='text-center'>
                                                    {thumbnailPreview ? (
                                                        <div className='relative mx-auto h-32 w-32 overflow-hidden rounded'>
                                                            <Image
                                                                src={
                                                                    thumbnailPreview ||
                                                                    '/placeholder.svg'
                                                                }
                                                                alt='Thumbnail preview'
                                                                fill
                                                                className='object-cover'
                                                            />
                                                            <Button
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
                                                                        Click to
                                                                        upload a
                                                                        thumbnail
                                                                    </span>
                                                                    <input
                                                                        id='thumbnail-upload'
                                                                        name='thumbnail'
                                                                        type='file'
                                                                        accept='image/jpeg,image/png,image/gif'
                                                                        className='sr-only'
                                                                        onChange={
                                                                            handleThumbnailChange
                                                                        }
                                                                    />
                                                                </label>
                                                            </div>
                                                        </>
                                                    )}
                                                    <p className='mt-1 text-xs text-muted-foreground'>
                                                        or drag and drop
                                                    </p>
                                                    <p className='text-xs text-muted-foreground'>
                                                        JPG, PNG | Max 5MB
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <Label className='mb-2'>
                                                Attached Files (
                                                {attachedFileUrls.length})
                                            </Label>
                                            <div className='rounded-lg border bg-background p-4'>
                                                {attachedFileUrls.length > 0 ? (
                                                    <ul className='space-y-2'>
                                                        {attachedFileUrls.map(
                                                            (url, index) => (
                                                                <li
                                                                    key={index}
                                                                    className='flex items-center justify-between rounded-md border bg-background p-2 text-sm'
                                                                >
                                                                    <div className='flex items-center gap-2'>
                                                                        <Paperclip className='h-4 w-4 text-muted-foreground' />
                                                                        <span className='truncate'>
                                                                            {url
                                                                                .split(
                                                                                    '/',
                                                                                )
                                                                                .pop() ||
                                                                                url}{' '}
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
                                                            className='relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/80'
                                                        >
                                                            <span>Attach</span>
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
                                                        </label>
                                                        <span className='ml-1'>
                                                            or drag & drop
                                                        </span>
                                                    </div>
                                                )}
                                                <p className='mt-1 text-center text-xs text-muted-foreground'>
                                                    JPG, PNG, PDF, DOCS | Max
                                                    5MB
                                                </p>
                                            </div>
                                        </div>
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
