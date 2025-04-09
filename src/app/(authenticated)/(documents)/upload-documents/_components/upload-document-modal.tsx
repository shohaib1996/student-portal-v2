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
    useAddUserDocumentMutation,
    useUploadUserDocumentFileMutation,
} from '@/redux/api/documents/documentsApi';
import { toast } from 'sonner';

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
    const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
    const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
    const [attachedFileUrls, setAttachedFileUrls] = useState<string[]>([]);
    const [category1, setCategory1] = useState<string>('');
    const [category2, setCategory2] = useState<string>('');
    const [isUploading, setIsUploading] = useState(false);
    const [documentNameError, setDocumentNameError] = useState<string>('');
    const [category1Error, setCategory1Error] = useState<string>('');
    const [category2Error, setCategory2Error] = useState<string>('');
    const [isDraggingThumbnail, setIsDraggingThumbnail] = useState(false);
    const [isDraggingFiles, setIsDraggingFiles] = useState(false);
    const [uploadUserDocumentFile, { isLoading, isError, isSuccess, data }] =
        useUploadUserDocumentFileMutation();
    const [
        addUserDocument,
        {
            isLoading: isSubmitting,
            isError: isSubmitError,
            isSuccess: isSubmitSuccess,
            data: submitResponse,
        },
    ] = useAddUserDocumentMutation();

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
            setIsUploading(true);

            try {
                const url = await uploadFile(file);
                setThumbnailUrl(url);

                // show preview
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

    const handleThumbnailDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingThumbnail(true);
    };

    const handleThumbnailDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingThumbnail(false);
    };

    const handleThumbnailDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingThumbnail(false);

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            const file = files[0];
            const validImageTypes = ['image/jpeg', 'image/png', 'image/gif'];

            if (validImageTypes.includes(file.type)) {
                // Simulate the file input change event
                const fileChangeEvent = {
                    target: {
                        files: files,
                    },
                } as unknown as React.ChangeEvent<HTMLInputElement>;

                handleThumbnailChange(fileChangeEvent);
            } else {
                toast.error('Please upload a valid image file (JPG, PNG, GIF)');
            }
        }
    };

    const handleFilesDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingFiles(true);
    };

    const handleFilesDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingFiles(false);
    };

    const handleFilesDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingFiles(false);

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            const fileArray = Array.from(files);
            const validFileTypes = [
                'image/jpeg',
                'image/png',
                'image/gif',
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            ];

            const validFiles = fileArray.filter((file) =>
                validFileTypes.includes(file.type),
            );

            if (validFiles.length > 0) {
                // Simulate the file input change event
                const fileChangeEvent = {
                    target: {
                        files: validFiles as unknown as FileList,
                    },
                } as unknown as React.ChangeEvent<HTMLInputElement>;

                handleFileAttachment(fileChangeEvent);
            } else {
                toast.error(
                    'Please upload valid file types (JPG, PNG, PDF, DOCS)',
                );
            }
        }
    };

    const validateDocumentName = (name: string) => {
        if (name.includes(' ')) {
            setDocumentNameError('Document name cannot contain spaces');
            return false;
        }
        setDocumentNameError('');
        return true;
    };

    const validateCategories = () => {
        let isValid = true;

        if (!category1) {
            setCategory1Error('Please select a category');
            isValid = false;
        } else {
            setCategory1Error('');
        }

        if (!category2) {
            setCategory2Error('Please select a category');
            isValid = false;
        } else {
            setCategory2Error('');
        }

        return isValid;
    };

    const handleDocumentNameChange = (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        validateDocumentName(e.target.value);
    };

    const handleCategory1Change = (value: string) => {
        setCategory1(value);
        if (value) {
            setCategory1Error('');
        }
    };

    const handleCategory2Change = (value: string) => {
        setCategory2(value);
        if (value) {
            setCategory2Error('');
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const form = e.currentTarget;
        const formData = new FormData(form);

        const description = formData.get('description') as string;
        const documentName = formData.get('document-name') as string;
        const tags = formData.get('tags') as string;

        // Validate document name and categories before submission
        const isDocumentNameValid = validateDocumentName(documentName);
        const areCategoriesValid = validateCategories();

        if (!isDocumentNameValid || !areCategoriesValid) {
            return;
        }

        const submissionData = {
            description,
            name: documentName,
            categories: [category1, category2].filter(Boolean),
            tags: tags ? tags.split(',').map((tag) => tag.trim()) : [],
            thumbnail: thumbnailUrl,
            attachedFiles: attachedFileUrls,
        };

        try {
            await addUserDocument(submissionData).unwrap();
            toast.success('Document added successfully!');
            onClose();
        } catch (error) {
            console.error(error);
        }
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
                                onClick={onClose}
                            >
                                Cancel
                            </Button>
                            <Button
                                size='sm'
                                type='submit'
                                form='upload-document-form'
                                disabled={
                                    isSubmitting ||
                                    !!documentNameError ||
                                    !!category1Error ||
                                    !!category2Error
                                }
                            >
                                {isSubmitting ? 'Saving...' : 'Save & Close'}
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
                                                    type='button'
                                                >
                                                    <Bold className='h-4 w-4' />
                                                </Button>
                                                <Button
                                                    variant='ghost'
                                                    size='icon'
                                                    className='h-8 w-8'
                                                    type='button'
                                                >
                                                    <Italic className='h-4 w-4' />
                                                </Button>
                                                <Button
                                                    variant='ghost'
                                                    size='icon'
                                                    className='h-8 w-8'
                                                    type='button'
                                                >
                                                    <Underline className='h-4 w-4' />
                                                </Button>
                                                <Button
                                                    variant='ghost'
                                                    size='icon'
                                                    className='h-8 w-8'
                                                    type='button'
                                                >
                                                    <X className='h-4 w-4' />
                                                </Button>
                                                <div className='mx-2 h-4 w-px bg-border' />
                                                <Button
                                                    variant='ghost'
                                                    size='icon'
                                                    className='h-8 w-8'
                                                    type='button'
                                                >
                                                    <List className='h-4 w-4' />
                                                </Button>
                                                <Button
                                                    variant='ghost'
                                                    size='icon'
                                                    className='h-8 w-8'
                                                    type='button'
                                                >
                                                    <ListOrdered className='h-4 w-4' />
                                                </Button>
                                                <Button
                                                    variant='ghost'
                                                    size='icon'
                                                    className='h-8 w-8'
                                                    type='button'
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
                                                    type='button'
                                                >
                                                    <Link2 className='h-4 w-4' />
                                                </Button>
                                                <Button
                                                    variant='ghost'
                                                    size='icon'
                                                    className='h-8 w-8'
                                                    type='button'
                                                >
                                                    <span className='text-xs'>
                                                        @
                                                    </span>
                                                </Button>
                                            </div>
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
                                            Document Name
                                            <span className='text-red-500'>
                                                *
                                            </span>
                                        </Label>
                                        <Input
                                            id='document-name'
                                            name='document-name'
                                            placeholder='Enter document name (no spaces allowed)'
                                            required
                                            onChange={handleDocumentNameChange}
                                        />
                                        {documentNameError && (
                                            <p className='mt-1 text-sm text-red-500'>
                                                {documentNameError}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <Label
                                            htmlFor='category-1'
                                            className='mb-2 flex items-center gap-1'
                                        >
                                            Category
                                            <span className='text-red-500'>
                                                *
                                            </span>
                                        </Label>
                                        <Select
                                            required
                                            onValueChange={
                                                handleCategory1Change
                                            }
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
                                            <p className='mt-1 text-sm text-red-500'>
                                                {category1Error}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <Label
                                            htmlFor='category-2'
                                            className='mb-2 flex items-center gap-1'
                                        >
                                            Category
                                            <span className='text-red-500'>
                                                *
                                            </span>
                                        </Label>
                                        <Select
                                            required
                                            onValueChange={
                                                handleCategory2Change
                                            }
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
                                            <p className='mt-1 text-sm text-red-500'>
                                                {category2Error}
                                            </p>
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
                                        <div
                                            className={`mt-1 flex justify-center rounded-lg border ${isDraggingThumbnail ? 'border-primary border-2' : 'border-dashed border-border'} px-6 py-10`}
                                            onDragOver={handleThumbnailDragOver}
                                            onDragLeave={
                                                handleThumbnailDragLeave
                                            }
                                            onDrop={handleThumbnailDrop}
                                        >
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
                                        <div
                                            className={`rounded-lg border ${isDraggingFiles ? 'border-primary border-2' : 'border bg-muted/20'} p-4`}
                                            onDragOver={handleFilesDragOver}
                                            onDragLeave={handleFilesDragLeave}
                                            onDrop={handleFilesDrop}
                                        >
                                            {attachedFiles.length > 0 ? (
                                                <ul className='space-y-2'>
                                                    {attachedFiles.map(
                                                        (file, index) => (
                                                            <li
                                                                key={index}
                                                                className='flex items-center justify-between rounded-md border bg-background p-2 text-sm'
                                                            >
                                                                <div className='flex items-center gap-2 flex-1 overflow-hidden'>
                                                                    {file.type.includes(
                                                                        'image/',
                                                                    ) ? (
                                                                        <div className='relative h-10 w-10 overflow-hidden rounded'>
                                                                            <Image
                                                                                src={URL.createObjectURL(
                                                                                    file,
                                                                                )}
                                                                                alt={
                                                                                    file.name
                                                                                }
                                                                                fill
                                                                                className='object-cover'
                                                                            />
                                                                        </div>
                                                                    ) : file.type.includes(
                                                                          'pdf',
                                                                      ) ? (
                                                                        <div className='flex h-10 w-10 items-center justify-center rounded bg-red-100 text-red-500'>
                                                                            <svg
                                                                                xmlns='http://www.w3.org/2000/svg'
                                                                                width='24'
                                                                                height='24'
                                                                                viewBox='0 0 24 24'
                                                                                fill='none'
                                                                                stroke='currentColor'
                                                                                strokeWidth='2'
                                                                                strokeLinecap='round'
                                                                                strokeLinejoin='round'
                                                                                className='h-5 w-5'
                                                                            >
                                                                                <path d='M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z' />
                                                                                <polyline points='14 2 14 8 20 8' />
                                                                            </svg>
                                                                        </div>
                                                                    ) : (
                                                                        <div className='flex h-10 w-10 items-center justify-center rounded bg-blue-100 text-blue-500'>
                                                                            <svg
                                                                                xmlns='http://www.w3.org/2000/svg'
                                                                                width='24'
                                                                                height='24'
                                                                                viewBox='0 0 24 24'
                                                                                fill='none'
                                                                                stroke='currentColor'
                                                                                strokeWidth='2'
                                                                                strokeLinecap='round'
                                                                                strokeLinejoin='round'
                                                                                className='h-5 w-5'
                                                                            >
                                                                                <path d='M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z' />
                                                                                <polyline points='14 2 14 8 20 8' />
                                                                            </svg>
                                                                        </div>
                                                                    )}
                                                                    <div className='flex-1 overflow-hidden'>
                                                                        <p className='truncate font-medium'>
                                                                            {
                                                                                file.name
                                                                            }
                                                                        </p>
                                                                        <p className='text-xs text-muted-foreground'>
                                                                            {(
                                                                                file.size /
                                                                                1024
                                                                            ).toFixed(
                                                                                2,
                                                                            )}{' '}
                                                                            KB
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <Button
                                                                    type='button'
                                                                    variant='ghost'
                                                                    size='icon'
                                                                    className='h-6 w-6 ml-2 flex-shrink-0'
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
                                                <div className='flex flex-col items-center justify-center py-4 text-sm text-muted-foreground'>
                                                    <div className='mb-3'>
                                                        <svg
                                                            xmlns='http://www.w3.org/2000/svg'
                                                            width='40'
                                                            height='40'
                                                            viewBox='0 0 24 24'
                                                            fill='none'
                                                            stroke='currentColor'
                                                            strokeWidth='1.5'
                                                            strokeLinecap='round'
                                                            strokeLinejoin='round'
                                                            className='text-muted-foreground opacity-50'
                                                        >
                                                            <path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4'></path>
                                                            <polyline points='17 8 12 3 7 8'></polyline>
                                                            <line
                                                                x1='12'
                                                                y1='3'
                                                                x2='12'
                                                                y2='15'
                                                            ></line>
                                                        </svg>
                                                    </div>
                                                    <p className='mb-1 font-medium text-primary'>
                                                        Drop files here or
                                                    </p>
                                                    <label
                                                        htmlFor='file-upload'
                                                        className='relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/80'
                                                    >
                                                        <span>
                                                            browse files
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
                                                            disabled={
                                                                isUploading
                                                            }
                                                        />
                                                    </label>
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
