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
import { Alert, AlertDescription } from '@/components/ui/alert';

export interface EditDocumentModalProps {
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

export function EditDocumentModal({
    isOpen,
    onClose,
    defaultValues,
    documentId,
}: EditDocumentModalProps) {
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(
        null,
    );
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
    const [attachedFileUrls, setAttachedFileUrls] = useState<string[]>([]);
    const [category1, setCategory1] = useState<string>('');
    const [category2, setCategory2] = useState<string>('');
    const [documentName, setDocumentName] = useState<string>(
        defaultValues?.name || '',
    );
    const [nameError, setNameError] = useState<string>('');

    // Set default values when the modal opens
    useEffect(() => {
        if (isOpen && defaultValues) {
            setThumbnailPreview(defaultValues.thumbnailUrl);
            setAttachedFileUrls(defaultValues.attachedFileUrls);
            setCategory1(defaultValues.categories[0] || '');
            setCategory2(defaultValues.categories[1] || '');
            setDocumentName(defaultValues.name || '');
        }
    }, [isOpen, defaultValues]);

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

    // Handle document name change with direct state management
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setDocumentName(value);

        // Clear error if valid, set error if not
        if (value.trim() === '') {
            setNameError(
                'Document name cannot be empty or contain only spaces',
            );
        } else {
            setNameError('');
        }
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Validate document name before proceeding
        if (documentName.trim() === '') {
            setNameError(
                'Document name cannot be empty or contain only spaces',
            );
            return; // Prevent form submission
        }

        const form = e.currentTarget;
        const formData = new FormData(form);

        const description = formData.get('description') as string;
        const tags = formData.get('tags') as string;

        const submissionData = {
            description,
            documentName: documentName.trim(), // Trim whitespace before submission
            categories: [category1, category2].filter(Boolean),
            tags: tags ? tags.split(',').map((tag) => tag.trim()) : [],
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
            <DialogContent className='h-screen min-w-full overflow-y-auto p-0'>
                <div className='flex h-full flex-col'>
                    {/* Header */}
                    <div className='sticky top-0 z-10 flex items-center justify-between border-b bg-background p-4'>
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
                                    {defaultValues
                                        ? 'Edit Document'
                                        : 'Add New Document'}
                                </h1>
                                <p className='text-sm text-muted-foreground'>
                                    {defaultValues
                                        ? 'Update your document details'
                                        : 'Fill out the form to add new document'}
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
                            >
                                Save & Close
                            </Button>
                        </div>
                    </div>

                    {/* Form content */}
                    <div className='flex-1 overflow-y-auto p-4 document-container w-full'>
                        <form
                            id='upload-document-form'
                            onSubmit={handleSubmit}
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
                                            <div className='flex flex-wrap items-center gap-0.5 border-b bg-muted/50 px-3 py-1.5'>
                                                <Button
                                                    variant='ghost'
                                                    size='icon'
                                                    className='h-8 w-8'
                                                >
                                                    <Bold className='h-4 w-4' />
                                                </Button>
                                                <Button
                                                    variant='ghost'
                                                    size='icon'
                                                    className='h-8 w-8'
                                                >
                                                    <Italic className='h-4 w-4' />
                                                </Button>
                                                <Button
                                                    variant='ghost'
                                                    size='icon'
                                                    className='h-8 w-8'
                                                >
                                                    <Underline className='h-4 w-4' />
                                                </Button>
                                                <Button
                                                    variant='ghost'
                                                    size='icon'
                                                    className='h-8 w-8'
                                                >
                                                    <X className='h-4 w-4' />
                                                </Button>
                                                <div className='mx-2 h-4 w-px bg-border' />
                                                <Button
                                                    variant='ghost'
                                                    size='icon'
                                                    className='h-8 w-8'
                                                >
                                                    <List className='h-4 w-4' />
                                                </Button>
                                                <Button
                                                    variant='ghost'
                                                    size='icon'
                                                    className='h-8 w-8'
                                                >
                                                    <ListOrdered className='h-4 w-4' />
                                                </Button>
                                                <Button
                                                    variant='ghost'
                                                    size='icon'
                                                    className='h-8 w-8'
                                                >
                                                    <span className='text-xs'>
                                                        ⟶
                                                    </span>
                                                </Button>
                                                <div className='mx-2 h-4 w-px bg-border' />
                                                <Button
                                                    variant='ghost'
                                                    size='icon'
                                                    className='h-8 w-8'
                                                >
                                                    <Link2 className='h-4 w-4' />
                                                </Button>
                                                <Button
                                                    variant='ghost'
                                                    size='icon'
                                                    className='h-8 w-8'
                                                >
                                                    <span className='text-xs'>
                                                        @
                                                    </span>
                                                </Button>
                                            </div>
                                            <Textarea
                                                id='description'
                                                name='description'
                                                defaultValue={
                                                    defaultValues?.description ||
                                                    ''
                                                }
                                                placeholder='Enter description...'
                                                className='h-[80vh] resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0'
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right column - 1/3 width on large screens */}
                            <div className='space-y-6'>
                                <div className='space-y-4'>
                                    <div>
                                        <Label
                                            htmlFor='document-name'
                                            className='mb-2 flex items-center gap-1'
                                        >
                                            Document Name{' '}
                                            <span className='text-red-500'>
                                                *
                                            </span>
                                        </Label>
                                        <Input
                                            id='document-name'
                                            name='document-name'
                                            value={documentName}
                                            placeholder='Enter document name'
                                            required
                                            onChange={handleNameChange}
                                            className={
                                                nameError
                                                    ? 'border-red-500'
                                                    : ''
                                            }
                                        />
                                        {nameError && (
                                            <p className='mt-1 text-xs text-red-500'>
                                                {nameError}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <Label
                                            htmlFor='category-1'
                                            className='mb-2 flex items-center gap-1'
                                        >
                                            Category{' '}
                                            <span className='text-red-500'>
                                                *
                                            </span>
                                        </Label>
                                        <Select
                                            required
                                            onValueChange={setCategory1}
                                            value={category1}
                                        >
                                            <SelectTrigger id='category-1'>
                                                <SelectValue placeholder='Select Category' />
                                            </SelectTrigger>
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
                                    </div>

                                    <div>
                                        <Label
                                            htmlFor='category-2'
                                            className='mb-2 flex items-center gap-1'
                                        >
                                            Category{' '}
                                            <span className='text-red-500'>
                                                *
                                            </span>
                                        </Label>
                                        <Select
                                            required
                                            onValueChange={setCategory2}
                                            value={category2}
                                        >
                                            <SelectTrigger id='category-2'>
                                                <SelectValue placeholder='Select Category' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value='web-development'>
                                                    Web Development
                                                </SelectItem>
                                                <SelectItem value='mobile-development'>
                                                    Mobile Development
                                                </SelectItem>
                                                <SelectItem value='technical-test'>
                                                    Technical Test
                                                </SelectItem>
                                                <SelectItem value='resources'>
                                                    Resources
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label htmlFor='tags' className='mb-2'>
                                            Tags
                                        </Label>
                                        <Input
                                            id='tags'
                                            name='tags'
                                            defaultValue={
                                                defaultValues?.tags || ''
                                            }
                                            placeholder='Enter tags (Maximum 10 tags)'
                                        />
                                    </div>

                                    <div>
                                        <Label className='mb-2'>
                                            Upload Thumbnail
                                        </Label>
                                        <div className='mt-1 flex justify-center rounded-lg border border-dashed border-border px-6 py-10'>
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
                                        <div className='rounded-lg border bg-muted/20 p-4'>
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
                                                JPG, PNG, PDF, DOCS | Max 5MB
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
