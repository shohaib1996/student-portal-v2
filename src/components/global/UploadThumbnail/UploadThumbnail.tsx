'use client';
import { Button } from '@/components/ui/button';
import { useUploadUserDocumentFileMutation } from '@/redux/api/documents/documentsApi';
import { ImageIcon, Loader, X } from 'lucide-react';
import NextImage from 'next/image';
import React, { useState, useRef } from 'react';

type TProps = {
    value: string;
    onChange: (_: string) => void;
    ratio?: string;
    maxWidth?: number;
    maxSize?: number;
};

const UploadThumbnail = ({
    value,
    onChange,
    ratio = '1:1',
    maxWidth = 1200,
    maxSize = 5,
}: TProps) => {
    const [uploadingThumb, setUploadingThumb] = useState(false);
    const [processingError, setProcessingError] = useState<string | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const [
        uploadUserDocumentFile,
        { isLoading: isUploading, isError, isSuccess, data },
    ] = useUploadUserDocumentFileMutation();

    const handleRemoveThumbnail = () => {
        onChange('');
    };

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

    const processAndUploadFile = async (file: File) => {
        setProcessingError(null);

        // Check if file is an image
        if (!file.type.match('image.*')) {
            setProcessingError('Please select an image file');
            return;
        }

        // Check file size (maxSize in MB)
        const maxSizeBytes = maxSize * 1024 * 1024;

        setUploadingThumb(true);

        try {
            let fileToUpload = file;

            // Process the image only if needed (cropping or resizing)
            if (file.size > maxSizeBytes || ratio !== '1:1') {
                try {
                    fileToUpload = await processImage(file);
                } catch (processError) {
                    fileToUpload = file;
                }
            }

            const url = await uploadFile(fileToUpload);
            if (url) {
                onChange(url);
            }
        } catch (error) {
            setProcessingError('Failed to upload image. Please try again.');
        } finally {
            setUploadingThumb(false);
        }
    };

    const handleThumbnailChange = async (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        if (e.target.files && e.target.files[0]) {
            await processAndUploadFile(e.target.files[0]);
        }
    };

    // Drag and drop handlers
    const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();

        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            await processAndUploadFile(e.dataTransfer.files[0]);
        }
    };

    const handleButtonClick = () => {
        inputRef.current?.click();
    };

    const processImage = (file: File): Promise<File> => {
        return new Promise((resolve, reject) => {
            // Parse aspect ratio
            const [widthRatio, heightRatio] = ratio.split(':').map(Number);
            const aspectRatio = widthRatio / heightRatio;

            // Create file reader to read the file
            const reader = new FileReader();
            reader.readAsDataURL(file);

            reader.onload = (event) => {
                const img = new window.Image();
                img.src = event.target?.result as string;

                img.onload = () => {
                    try {
                        // Create canvas for image manipulation
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');

                        if (!ctx) {
                            reject(new Error('Could not get canvas context'));
                            return;
                        }

                        // Calculate dimensions for cropping
                        let srcWidth = img.width;
                        let srcHeight = img.height;
                        let srcX = 0;
                        let srcY = 0;

                        // Determine crop area to match aspect ratio
                        const imgRatio = img.width / img.height;

                        if (imgRatio > aspectRatio) {
                            // Image is wider than target ratio
                            srcWidth = img.height * aspectRatio;
                            srcX = (img.width - srcWidth) / 2;
                        } else {
                            // Image is taller than target ratio
                            srcHeight = img.width / aspectRatio;
                            srcY = (img.height - srcHeight) / 2;
                        }

                        // Determine output size (with max width constraint)
                        let destWidth = srcWidth;
                        let destHeight = srcHeight;

                        // Scale down if larger than maxWidth
                        if (destWidth > maxWidth) {
                            const scale = maxWidth / destWidth;
                            destWidth = maxWidth;
                            destHeight = destHeight * scale;
                        }

                        // Round the dimensions to integers
                        destWidth = Math.round(destWidth);
                        destHeight = Math.round(destHeight);
                        srcX = Math.round(srcX);
                        srcY = Math.round(srcY);
                        srcWidth = Math.round(srcWidth);
                        srcHeight = Math.round(srcHeight);

                        // Set canvas dimensions
                        canvas.width = destWidth;
                        canvas.height = destHeight;

                        // Draw cropped and resized image on canvas
                        ctx.drawImage(
                            img,
                            srcX,
                            srcY,
                            srcWidth,
                            srcHeight,
                            0,
                            0,
                            destWidth,
                            destHeight,
                        );

                        // Keep original file format
                        const mimeType = file.type;
                        // Use higher quality for JPEGs
                        const quality = mimeType === 'image/jpeg' ? 0.92 : 0.85;

                        // Convert canvas to blob
                        canvas.toBlob(
                            (blob) => {
                                if (!blob) {
                                    reject(
                                        new Error(
                                            'Could not create image blob',
                                        ),
                                    );
                                    return;
                                }

                                try {
                                    // Create new file with processed image
                                    const fileName = file.name;

                                    const processedFile = new File(
                                        [blob],
                                        fileName,
                                        { type: mimeType },
                                    );

                                    resolve(processedFile);
                                } catch (error) {
                                    console.error(
                                        'Error creating File from blob:',
                                        error,
                                    );
                                    reject(error);
                                }
                            },
                            mimeType,
                            quality,
                        );
                    } catch (error) {
                        console.error(
                            'Error processing image in canvas:',
                            error,
                        );
                        reject(error);
                    }
                };

                img.onerror = (error) => {
                    console.error('Error loading image:', error);
                    reject(new Error('Error loading image'));
                };
            };

            reader.onerror = (error) => {
                console.error('Error reading file:', error);
                reject(new Error('Error reading file'));
            };
        });
    };

    // Calculate aspect ratio for display
    const [widthRatio, heightRatio] = ratio.split(':').map(Number);
    const aspectStyle = {
        paddingTop: `${(heightRatio / widthRatio) * 100}%`,
    };

    return (
        <div
            onClick={() => !value && handleButtonClick()}
            className={`mt-1 flex justify-center bg-background rounded-lg border border-dashed ${dragActive ? 'border-primary border-2' : 'border-border'} ${value ? '' : 'cursor-pointer'} px-6 py-10`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
        >
            <div className='text-center'>
                {uploadingThumb ? (
                    <div className='flex text-dark-gray items-center flex-col gap-3 justify-between w-full'>
                        <Loader className='animate-spin' />
                        <p className='text-sm'>
                            Processing and uploading thumbnail. Please wait...
                        </p>
                    </div>
                ) : value ? (
                    <div className='relative mx-auto w-32 overflow-hidden rounded'>
                        <div style={aspectStyle}></div>
                        <NextImage
                            src={value}
                            alt='Thumbnail preview'
                            fill
                            sizes='(max-width: 768px) 100vw, 8rem'
                            className='object-cover absolute top-0 left-0'
                        />
                        <button
                            disabled={isUploading}
                            type='button'
                            className='absolute flex items-center justify-center bg-destructive right-1 top-1 size-4 rounded-sm text-pure-white'
                            onClick={handleRemoveThumbnail}
                        >
                            <X size={13} />
                        </button>
                    </div>
                ) : (
                    <>
                        <ImageIcon className='mx-auto h-12 w-12 text-muted-foreground' />
                        <div className='mt-4 flex flex-col text-sm text-muted-foreground'>
                            <div
                                className='relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/80'
                                onClick={handleButtonClick}
                            >
                                <span>Click to upload a thumbnail</span>
                                <input
                                    ref={inputRef}
                                    disabled={isUploading}
                                    id='thumbnail-upload'
                                    name='thumbnail'
                                    type='file'
                                    accept='image/jpeg,image/png,image/gif'
                                    className='sr-only'
                                    onChange={handleThumbnailChange}
                                />
                                <p className='mt-1 text-xs text-muted-foreground'>
                                    or drag and drop
                                </p>
                                <p className='text-xs text-muted-foreground'>
                                    JPG, PNG | {ratio} ratio | Max {maxSize}MB
                                </p>
                            </div>
                            {processingError && (
                                <p className='mt-2 text-xs text-red-500'>
                                    {processingError}
                                </p>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default UploadThumbnail;
