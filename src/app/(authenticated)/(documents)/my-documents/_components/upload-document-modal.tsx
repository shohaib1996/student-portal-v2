'use client';

import { useState } from 'react';
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
    AlertCircle,
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
import instance from '@/utils/storage';
import GlobalEditor from '@/components/editor/GlobalEditor';

export interface UploadDocumentModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function UploadDocumentModal({
    isOpen,
    onClose,
}: UploadDocumentModalProps) {
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(
        null,
    );
    const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null); // Store uploaded thumbnail URL
    const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
    const [attachedFileUrls, setAttachedFileUrls] = useState<string[]>([]); // Store uploaded attachment URLs
    const [category1, setCategory1] = useState<string>('');
    const [category2, setCategory2] = useState<string>('');
    const [isUploading, setIsUploading] = useState(false); // Track upload status

    // New states for form validation
    const [documentNameError, setDocumentNameError] = useState<string | null>(
        null,
    );
    const [category1Error, setCategory1Error] = useState<string | null>(null);
    const [category2Error, setCategory2Error] = useState<string | null>(null);

    // Upload a single file and return its URL
    const uploadFile = async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await instance('/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const data = await response.json();
            return data.url; // Assuming the response contains { url: string }
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
            setIsUploading(true);

            try {
                // Upload the thumbnail
                const url = await uploadFile(file);
                setThumbnailUrl(url);

                // Generate preview
                const reader = new FileReader();
                reader.onload = (event) => {
                    if (event.target?.result) {
                        setThumbnailPreview(event.target.result as string);
                    }
                };
                reader.readAsDataURL(file);
            } catch (error) {
                console.error('Failed to upload thumbnail:', error);
            } finally {
                setIsUploading(false);
            }
        }
    };

    const handleFileAttachment = async (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setIsUploading(true);

            try {
                // Upload each file and collect URLs
                const urls = await Promise.all(
                    newFiles.map((file) => uploadFile(file)),
                );
                setAttachedFiles((prev) => [...prev, ...newFiles]);
                setAttachedFileUrls((prev) => [...prev, ...urls]);
            } catch (error) {
                console.error('Failed to upload attachments:', error);
            } finally {
                setIsUploading(false);
            }
        }
    };

    const handleRemoveFile = (index: number) => {
        setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
        setAttachedFileUrls((prev) => prev.filter((_, i) => i !== index));
    };

    const handleRemoveThumbnail = () => {
        setThumbnailPreview(null);
        setThumbnailUrl(null);
    };

    // Validate a single field and return whether it passed validation
    const validateField = (fieldName: string, value: string): boolean => {
        switch (fieldName) {
            case 'document-name':
                if (!value || value.trim() === '') {
                    setDocumentNameError('Document name is required');
                    return false;
                }
                setDocumentNameError(null);
                return true;

            case 'category1':
                if (!value) {
                    setCategory1Error('Primary category is required');
                    return false;
                }
                setCategory1Error(null);
                return true;

            case 'category2':
                if (!value) {
                    setCategory2Error('Secondary category is required');
                    return false;
                }
                setCategory2Error(null);
                return true;

            default:
                return true;
        }
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const form = e.currentTarget;
        const formData = new FormData(form);

        const documentName = formData.get('document-name') as string;
        const description = formData.get('description') as string;
        const tags = formData.get('tags') as string;

        // Validate all required fields
        const isDocumentNameValid = validateField(
            'document-name',
            documentName,
        );
        const isCategory1Valid = validateField('category1', category1);
        const isCategory2Valid = validateField('category2', category2);

        // Only proceed if all validations pass
        if (isDocumentNameValid && isCategory1Valid && isCategory2Valid) {
            const submissionData = {
                documentName,
                description,
                categories: [category1, category2].filter(Boolean),
                tags: tags ? tags.split(',').map((tag) => tag.trim()) : [],
                thumbnail: thumbnailUrl,
                attachedFiles: attachedFileUrls,
            };

            // Here you would typically send this data to your backend

            onClose();
        } else {
            // Focus on the first invalid input
            if (!isDocumentNameValid) {
                document.getElementById('document-name')?.focus();
            } else if (!isCategory1Valid) {
                document.getElementById('category-1')?.focus();
            } else if (!isCategory2Valid) {
                document.getElementById('category-2')?.focus();
            }
        }
    };

    // Clear all errors when modal is closed
    const handleClose = () => {
        setDocumentNameError(null);
        setCategory1Error(null);
        setCategory2Error(null);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className='h-screen min-w-full overflow-y-auto p-0'>
                <div className='flex h-full flex-col'>
                    {/* Header */}
                    <div className='sticky top-0 z-10 flex items-center justify-between border-b bg-background p-4'>
                        <div className='flex items-center gap-2'>
                            <Button
                                variant='outline'
                                size='icon'
                                onClick={handleClose}
                            >
                                <ArrowLeft className='h-4 w-4' />
                                <span className='sr-only'>Back</span>
                            </Button>
                            <div>
                                <h1 className='text-xl font-semibold'>
                                    Add New Document
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
                                onClick={handleClose}
                            >
                                Cancel
                            </Button>
                            <Button
                                size='sm'
                                type='submit'
                                form='upload-document-form'
                                disabled={isUploading} // Disable while uploading
                            >
                                {isUploading ? 'Uploading...' : 'Save & Close'}
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
                                            {/* <GlobalEditor value='' /> */}
                                            <Textarea
                                                id='description'
                                                name='description'
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
                                            placeholder='Enter document name'
                                            className={
                                                documentNameError
                                                    ? 'border-red-500'
                                                    : ''
                                            }
                                            onChange={() =>
                                                documentNameError &&
                                                setDocumentNameError(null)
                                            }
                                        />
                                        {documentNameError && (
                                            <div className='mt-1 flex items-center gap-1 text-sm text-red-500'>
                                                <AlertCircle className='h-4 w-4' />
                                                <span>{documentNameError}</span>
                                            </div>
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
                                            onValueChange={(value) => {
                                                setCategory1(value);
                                                if (category1Error) {
                                                    setCategory1Error(null);
                                                }
                                            }}
                                            value={category1}
                                        >
                                            <SelectTrigger
                                                id='category-1'
                                                className={
                                                    category1Error
                                                        ? 'border-red-500'
                                                        : ''
                                                }
                                            >
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
                                        {category1Error && (
                                            <div className='mt-1 flex items-center gap-1 text-sm text-red-500'>
                                                <AlertCircle className='h-4 w-4' />
                                                <span>{category1Error}</span>
                                            </div>
                                        )}
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
                                            onValueChange={(value) => {
                                                setCategory2(value);
                                                if (category2Error) {
                                                    setCategory2Error(null);
                                                }
                                            }}
                                            value={category2}
                                        >
                                            <SelectTrigger
                                                id='category-2'
                                                className={
                                                    category2Error
                                                        ? 'border-red-500'
                                                        : ''
                                                }
                                            >
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
                                        {category2Error && (
                                            <div className='mt-1 flex items-center gap-1 text-sm text-red-500'>
                                                <AlertCircle className='h-4 w-4' />
                                                <span>{category2Error}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor='tags' className='mb-2'>
                                            Tags
                                        </Label>
                                        <Input
                                            id='tags'
                                            name='tags'
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
                                                            disabled={
                                                                isUploading
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
                                                                    disabled={
                                                                        isUploading
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
                                            {attachedFiles.length})
                                        </Label>
                                        <div className='rounded-lg border bg-muted/20 p-4'>
                                            {attachedFiles.length > 0 ? (
                                                <ul className='space-y-2'>
                                                    {attachedFiles.map(
                                                        (file, index) => (
                                                            <li
                                                                key={index}
                                                                className='flex items-center justify-between rounded-md border bg-background p-2 text-sm'
                                                            >
                                                                <div className='flex items-center gap-2'>
                                                                    <Paperclip className='h-4 w-4 text-muted-foreground' />
                                                                    <span className='truncate'>
                                                                        {
                                                                            file.name
                                                                        }
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
                                                                    disabled={
                                                                        isUploading
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
                                                            disabled={
                                                                isUploading
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
