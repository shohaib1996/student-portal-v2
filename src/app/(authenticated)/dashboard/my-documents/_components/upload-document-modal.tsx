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
    const [attachedFiles, setAttachedFiles] = useState<File[]>([]);

    const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
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
        }
    };

    const handleRemoveFile = (index: number) => {
        setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle form submission
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className='h-screen w-screen overflow-y-auto p-0 sm:max-w-[95vw]'>
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
                            >
                                Save & Close
                            </Button>
                        </div>
                    </div>

                    {/* Form content */}
                    <div className='flex-1 overflow-y-auto p-4'>
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
                                                placeholder='Enter description...'
                                                className='min-h-[200px] resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0'
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
                                            placeholder='Enter document name'
                                            required
                                        />
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
                                        <Select required>
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
                                        <Select required>
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
                                                            onClick={() =>
                                                                setThumbnailPreview(
                                                                    null,
                                                                )
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
