'use client';

import type React from 'react';
import { useState } from 'react';
import { Download, Loader2, X } from 'lucide-react';
import mime from 'mime-types';
import dayjs from 'dayjs';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';
import { Button } from '../ui/button';

// Dynamic imports for optimized loading
const AudioCard = dynamic(() => import('./TextEditor/AudioCard'), {
    loading: () => (
        <div className='w-full h-16 bg-muted animate-pulse rounded-md'></div>
    ),
});

// Define image types
const imageTypes = [
    'image/bmp',
    'image/cis-cod',
    'image/gif',
    'image/jpeg',
    'image/pipeg',
    'image/x-xbitmap',
    'image/png',
    'image/webp',
];

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

interface FileCardProps {
    file: FileObject;
    index?: number;
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

/**
 * Determine the icon source based on file type
 */
const determineIconSrc = (
    fileType: string | undefined,
    url: string | undefined,
): string => {
    if (!fileType) {
        return '/file_icon.png';
    }

    switch (fileType) {
        case 'application/pdf':
            return '/pdf.png';
        case 'text/plain':
            return '/txt-file.png';
        case 'application/msword':
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
            return '/doc.png';
        case 'application/vnd.ms-excel':
        case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
            return '/sheets.png';
        case 'text/csv':
            return '/sheets.png';
        case 'application/zip':
        case 'application/x-zip-compressed':
            return '/zip.png';
        default:
            if (imageTypes.includes(fileType)) {
                return url || '/default_image.png';
            }
            return '/file_icon.png';
    }
};

/**
 * Helper function to download a file
 */
const downloadFileWithLink = (url?: string, fileName?: string) => {
    if (!url) {
        toast.error('Download URL not available');
        return;
    }

    try {
        const link = document.createElement('a');
        link.href = url;
        if (fileName) {
            link.setAttribute('download', fileName);
        } else {
            link.setAttribute('download', '');
        }
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Download started');
    } catch (error) {
        toast.error('Failed to download file');
        console.error('Download error:', error);
    }
};

const formatDate = (dateString?: string) => {
    if (!dateString) {
        return '';
    }
    return dayjs(dateString).format('MMM D, YYYY h:mm A');
};

const FileCard = ({ file, index }: FileCardProps) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const iconSrc = determineIconSrc(file?.type, file?.url);
    const fileType =
        file?.file?.type?.split('/')[0] || file?.type?.split('/')[0];

    const isAudio =
        file?.file?.type === 'audio/mp3' || file?.type === 'audio/mp3';
    const isImage = fileType === 'image';
    const isVideo = fileType === 'video';
    const isUploading = file?.status === 'uploading';

    const handleDownload = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        downloadFileWithLink(file?.url, file?.name);
    };

    const openPreview = () => {
        if (isImage) {
            setIsPreviewOpen(true);
        }
    };

    const closePreview = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsPreviewOpen(false);
    };

    // Render audio card for audio files
    if (isAudio) {
        return (
            <div className='file_download_item rounded-md flex flex-col w-full'>
                <AudioCard audioUrl={file?.url as string} />
            </div>
        );
    }

    // Special rendering for image files
    if (isImage) {
        return (
            <>
                <div
                    className='file_download_item w-full relative rounded-md overflow-hidden cursor-pointer'
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    onClick={openPreview}
                >
                    {/* Image */}
                    <div className='w-full relative'>
                        <img
                            className='w-full h-full object-contain'
                            src={file?.url || iconSrc || '/default_image.png'}
                            alt={file?.name || 'Image'}
                        />

                        {/* Gradient overlay */}
                        <div className='absolute inset-0 bg-gradient-to-b from-pure-black/60 to-transparent pointer-events-none' />

                        {/* Top controls */}
                        <div className='absolute top-0 left-0 right-0 p-1 flex justify-between items-center'>
                            {/* Download button */}
                            <Button
                                variant='primary_light'
                                size='icon'
                                className='h-8 w-8 rounded-full'
                                onClick={handleDownload}
                                aria-label='Download file'
                            >
                                <Download className='h-4 w-4 text-primary' />
                            </Button>

                            {/* Time */}
                            {file?.createdAt && (
                                <span className='text-xs text-white px-2 py-1 rounded-md'>
                                    {formatDate(file?.createdAt)}
                                </span>
                            )}
                        </div>

                        {/* Bottom info box - shown on hover */}
                        <div
                            className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-pure-black to-transparent p-2 transition-transform duration-200 ease-in-out ${
                                isHovered ? 'translate-y-0' : 'translate-y-full'
                            }`}
                        >
                            <p
                                className='text-sm font-medium truncate text-pure-white mt-4'
                                title={file?.name}
                            >
                                {file?.name || 'Unnamed file'}
                            </p>
                            <p className='text-xs text-pure-white/80'>
                                Size:{' '}
                                {bytesToSize(
                                    file?.size || file?.file?.size || 0,
                                )}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Full Screen Preview Modal */}
                {isPreviewOpen && (
                    <div
                        className='fixed inset-0 z-50 flex items-center justify-center bg-pure-black/80'
                        onClick={closePreview}
                    >
                        <div
                            className='relative max-w-full lg:max-w-[95vw] max-h-full lg:max-h-[95vh] flex flex-col'
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Top controls */}
                            <div className='absolute top-4 right-4 z-10 flex items-center gap-4'>
                                <Button
                                    size='icon'
                                    className='h-10 w-10 rounded-full'
                                    onClick={handleDownload}
                                    aria-label='Download file'
                                >
                                    <Download className='h-5 w-5 text-white' />
                                </Button>
                                <Button
                                    variant='destructive'
                                    size='icon'
                                    className='h-10 w-10 rounded-full bg-red-600/80 text-pure-white'
                                    onClick={closePreview}
                                    aria-label='Close preview'
                                >
                                    <X className='h-5 w-5' />
                                </Button>
                            </div>

                            {/* Image */}
                            <div className='flex-1 overflow-auto'>
                                <img
                                    className='max-w-full max-h-[80vh] object-contain'
                                    src={
                                        file?.url ||
                                        iconSrc ||
                                        '/default_image.png'
                                    }
                                    alt={file?.name || 'Image'}
                                />
                            </div>

                            {/* Bottom info */}
                            <div className='bg-pure-black/80 p-4 text-white mt-2 rounded-md'>
                                <p
                                    className='text-lg font-medium truncate'
                                    title={file?.name}
                                >
                                    {file?.name || 'Unnamed file'}
                                </p>
                                <p className='text-sm text-white/80'>
                                    Size:{' '}
                                    {bytesToSize(
                                        file?.size || file?.file?.size || 0,
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </>
        );
    }

    // Default rendering for non-image, non-audio files (attachments)
    return (
        <div
            className={`file_download_item w-full ${file?.status || ''} rounded-md border flex flex-col`}
        >
            <div
                className='thumb relative overflow-hidden'
                style={{ borderRadius: '4px 4px 0 0 ' }}
            >
                {isVideo ? (
                    <div className='aspect-video overflow-hidden rounded-md bg-primary-light flex items-center justify-center'>
                        <img
                            className='w-20 h-20 object-contain'
                            src='/video-icon.png'
                            alt='Video'
                        />
                    </div>
                ) : (
                    <div className='overflow-hidden bg-primary-light flex items-center justify-center'>
                        <img
                            className='w-24 h-24 object-contain'
                            src={iconSrc || '/placeholder.svg'}
                            alt={mime.extension(file?.type || '') || 'File'}
                        />
                    </div>
                )}
            </div>
            <div
                className='flex flex-row items-center gap-1 bg-background px-2 py-1'
                style={{ borderRadius: '0 0 4px 4px' }}
            >
                <div className='left'>
                    <Button
                        variant={'primary_light'}
                        className='rounded-full h-10 w-10'
                        onClick={handleDownload}
                        aria-label='Download file'
                    >
                        <Download className='h-4 w-4 text-primary' />
                    </Button>
                </div>
                <div className='right flex flex-col'>
                    {!isVideo && (
                        <p
                            className='text-xs text-gray'
                            style={{ lineHeight: 1.1 }}
                        >
                            Attachment
                        </p>
                    )}
                    <p
                        className='text-sm font-medium truncate text-black'
                        style={{ lineHeight: 1.1 }}
                        title={file?.name}
                    >
                        {file?.name || 'Unnamed file'}
                    </p>
                    <div className='flex flex-row gap-3 items-center justify-between'>
                        <div className='flex items-center space-x-2'>
                            {isUploading ? (
                                <Loader2 className='h-4 w-4 animate-spin text-primary' />
                            ) : (
                                <span
                                    className='text-xs text-gray'
                                    style={{ lineHeight: 1.1 }}
                                >
                                    {bytesToSize(
                                        file?.size || file?.file?.size || 0,
                                    )}
                                </span>
                            )}
                        </div>
                        {file?.createdAt && (
                            <span
                                className='text-xs text-gray'
                                style={{ lineHeight: 1.1 }}
                            >
                                {formatDate(file?.createdAt)}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FileCard;
