'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, Download } from 'lucide-react';
import { Button } from '../ui/button';
import { toast } from 'sonner';

interface FileObject {
    _id?: string;
    name?: string;
    type?: string;
    size?: number;
    url?: string;
    status?: string;
    file?: {
        name?: string;
        type?: string;
        size?: number;
    };
    createdAt?: string;
}

interface ImageSliderProps {
    isOpen: boolean;
    onClose: () => void;
    files: FileObject[];
    initialIndex?: number;
}

/**
 * Convert bytes to human-readable size
 */
function bytesToSize(bytes: number | undefined): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (!bytes || bytes === 0) {
        return '0 Bytes';
    }
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Math.round(bytes / Math.pow(1024, i))} ${sizes[i]}`;
}

const ImageSlider: React.FC<ImageSliderProps> = ({
    isOpen,
    onClose,
    files,
    initialIndex = 0,
}) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);

    // Filter only image files
    const imageFiles = files.filter(
        (file) =>
            file?.type?.startsWith('image/') ||
            file?.file?.type?.startsWith('image/'),
    );

    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) {
                return;
            }

            if (e.key === 'Escape') {
                onClose();
            } else if (e.key === 'ArrowRight') {
                handleNext();
            } else if (e.key === 'ArrowLeft') {
                handlePrev();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, currentIndex, imageFiles.length, onClose]);

    // Reset current index when modal opens
    useEffect(() => {
        if (isOpen) {
            setCurrentIndex(initialIndex);
        }
    }, [isOpen, initialIndex]);

    const handleNext = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === imageFiles.length - 1 ? 0 : prevIndex + 1,
        );
    };

    const handlePrev = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === 0 ? imageFiles.length - 1 : prevIndex - 1,
        );
    };

    const handleDownload = () => {
        const currentFile = imageFiles[currentIndex];
        if (currentFile?.url) {
            try {
                const link = document.createElement('a');
                link.href = currentFile.url;
                link.setAttribute('download', currentFile.name || 'image');
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                toast.success('Download started');
            } catch (error) {
                toast.error('Failed to download image');
                console.error('Download error:', error);
            }
        } else {
            toast.error('Download URL not available');
        }
    };

    if (!isOpen || imageFiles.length === 0) {
        return null;
    }

    const currentFile = imageFiles[currentIndex];

    return (
        <div
            className='fixed inset-0 z-50 bg-pure-black/80 flex flex-col items-center justify-center'
            onClick={onClose}
        >
            {/* Top controls */}
            <div className='absolute top-0 left-0 right-0 flex justify-between p-4 z-10'>
                <span className='text-white text-sm'>
                    {currentIndex + 1} of {imageFiles.length}
                </span>
                <div className='flex gap-2'>
                    <Button
                        size='icon'
                        className='text-pure-white h-8 w-8 rounded-full'
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDownload();
                        }}
                    >
                        <Download className='h-5 w-5' />
                    </Button>
                    <Button
                        variant='ghost'
                        size='icon'
                        className='text-pure-white h-8 w-8 rounded-full bg-danger'
                        onClick={(e) => {
                            e.stopPropagation();
                            onClose();
                        }}
                    >
                        <X className='h-5 w-5' />
                    </Button>
                </div>
            </div>

            {/* Image container */}
            <div
                className='relative max-h-[80vh] max-w-[90vw] flex items-center justify-center'
                onClick={(e) => e.stopPropagation()}
            >
                <img
                    src={currentFile?.url}
                    alt={currentFile?.name || 'Image'}
                    className='max-h-[80vh] max-w-[90vw] object-contain'
                />
            </div>

            {/* Navigation buttons */}
            <div className='absolute inset-y-0 left-0 right-0 flex justify-between items-center px-4'>
                <Button
                    variant='ghost'
                    size='icon'
                    className='text-white h-12 w-12 rounded-full bg-black/50 hover:bg-black/70'
                    onClick={(e) => {
                        e.stopPropagation();
                        handlePrev();
                    }}
                >
                    <ChevronLeft className='h-8 w-8' />
                </Button>

                <Button
                    variant='ghost'
                    size='icon'
                    className='text-white h-12 w-12 rounded-full bg-black/50 hover:bg-black/70'
                    onClick={(e) => {
                        e.stopPropagation();
                        handleNext();
                    }}
                >
                    <ChevronRight className='h-8 w-8' />
                </Button>
            </div>

            {/* File info at the bottom */}
            <div className='absolute bottom-0 left-0 right-0 p-4 bg-black/50'>
                <p className='text-white text-sm truncate'>
                    {currentFile?.name}
                </p>
                <p className='text-white/70 text-xs'>
                    Size:{' '}
                    {bytesToSize(
                        currentFile?.size || currentFile?.file?.size || 0,
                    )}
                </p>
            </div>
        </div>
    );
};

export default ImageSlider;
