'use client';
import { Button } from '@/components/ui/button';
import { useUploadUserDocumentFileMutation } from '@/redux/api/documents/documentsApi';
import { Loader, Paperclip, X } from 'lucide-react';
import React, { useState, useRef, DragEvent } from 'react';
import { toast } from 'sonner';

type TAttatchment = {
    name: string;
    type: string;
    size: number;
    url: string;
};

type TProps = {
    attachments: TAttatchment[];
    onChange: (_: TAttatchment[]) => void;
};

const UploadAttatchment = ({ attachments, onChange }: TProps) => {
    const [uploadingAttac, setUploadingAttac] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const dropRef = useRef<HTMLDivElement>(null);

    const [
        uploadUserDocumentFile,
        { isLoading: isUploading, isError, isSuccess, data },
    ] = useUploadUserDocumentFileMutation();

    const uploadFile = async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await uploadUserDocumentFile(formData).unwrap();
            return response?.fileUrl as string;
        } catch (error) {
            console.error('Error uploading file:', error);
            throw error;
        }
    };

    // Check if file is already uploaded
    const isFileAlreadyUploaded = (file: File): boolean => {
        return attachments.some(
            (attachment) =>
                attachment.name === file.name && attachment.size === file.size,
        );
    };

    const processFiles = async (files: File[]) => {
        const newFiles = files.filter((file) => !isFileAlreadyUploaded(file));

        if (newFiles.length === 0 && files.length > 0) {
            toast.warning('Attachment already exists');
            return;
        }
        if (newFiles.length === 0) {
            return;
        }

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
            ) as TAttatchment[];

            // Combine existing attachments with new ones
            onChange([...attachments, ...newAttachments]);
        } catch (error) {
            console.error('Failed to upload attachments:', error);
        } finally {
            setUploadingAttac(false);
        }
    };

    const handleFileAttachment = async (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        if (e.target.files) {
            await processFiles(Array.from(e.target.files));
        }
    };

    const handleRemoveFile = (index: number) => {
        // Create a new array without the item at the specified index
        const newAttachments = [...attachments];
        newAttachments.splice(index, 1);
        onChange(newAttachments);
    };

    // Drag and drop handlers
    const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();

        // Only set isDragging to false if we're leaving the container (not entering a child element)
        if (
            dropRef.current &&
            !dropRef.current.contains(e.relatedTarget as Node)
        ) {
            setIsDragging(false);
        }
    };

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            await processFiles(Array.from(e.dataTransfer.files));
        }
    };

    return (
        <div
            className='bg-foreground p-2'
            ref={dropRef}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            {uploadingAttac ? (
                <div className='flex text-dark-gray items-center flex-col gap-3 justify-between w-full'>
                    <Loader className='animate-spin' />
                    <p className='text-sm'>
                        Uploading attachments. Please wait...
                    </p>
                </div>
            ) : (
                <div
                    className={`flex items-center justify-center py-4 text-sm text-muted-foreground border-2 border-dashed rounded-md ${isDragging ? 'border-primary bg-primary/5' : 'border-muted'}`}
                >
                    <label
                        htmlFor='file-upload'
                        className='relative text-center cursor-pointer rounded-md font-medium text-primary hover:text-primary/80 px-4 py-2'
                    >
                        <span className='text-center'>
                            {isDragging
                                ? 'Drop files here'
                                : 'Attach or drag & drop'}
                        </span>
                        <input
                            id='file-upload'
                            name='files'
                            type='file'
                            multiple
                            className='sr-only'
                            onChange={handleFileAttachment}
                        />

                        <p className='mt-1 text-center text-xs text-muted-foreground'>
                            JPG, PNG, PDF, DOCS | Max 5MB
                        </p>
                    </label>
                </div>
            )}

            {attachments?.length > 0 && (
                <ul className='space-y-2 pt-3'>
                    {attachments?.map((attachment, index) => (
                        <li
                            key={index}
                            className='flex items-center justify-between rounded-md border bg-foreground p-2 text-sm'
                        >
                            <div className='flex items-center gap-2'>
                                <Paperclip className='h-4 w-4 text-muted-foreground' />
                                <span className='truncate'>
                                    {attachment.name}
                                </span>
                            </div>
                            <Button
                                type='button'
                                variant='ghost'
                                size='icon'
                                className='h-6 w-6'
                                onClick={() => handleRemoveFile(index)}
                            >
                                <X className='h-3 w-3' />
                            </Button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default UploadAttatchment;
