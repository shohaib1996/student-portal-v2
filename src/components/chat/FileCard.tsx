'use client';

import type React from 'react';
import { Download, Loader2 } from 'lucide-react';
import mime from 'mime-types';
import AudioCard from './TextEditor/AudioCard';

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
        return '/file.png';
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
                return url || '/file.png';
            }
            return '/file.png';
    }
};

/**
 * Helper function to download a file
 */
const downloadFileWithLink = (url?: string) => {
    if (!url) {
        return;
    }

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', '');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

const FileCard: React.FC<FileCardProps> = ({ file, index }) => {
    const iconSrc = determineIconSrc(file.type, file?.url);
    const fileType = file?.type?.split('/')[0];

    const isAudio =
        file?.file?.type === 'audio/mp3' || file?.type === 'audio/mp3';
    const isImage = fileType === 'image';
    const isVideo = fileType === 'video';
    const isUploading = file?.status === 'uploading';

    return (
        <div
            className={`file_download_item ${file?.status || ''} rounded-md border border-border p-3 flex flex-col`}
        >
            {isAudio ? (
                <AudioCard audioUrl={file?.url as string} />
            ) : (
                <>
                    <div className='thumb relative overflow-hidden rounded-md'>
                        {isImage ? (
                            <div className='aspect-square overflow-hidden rounded-md'>
                                <img
                                    className='w-full h-full object-cover'
                                    src={iconSrc || '/file.png'}
                                    alt={file.name || 'File'}
                                />
                            </div>
                        ) : isVideo ? (
                            <div className='aspect-video overflow-hidden rounded-md bg-muted flex items-center justify-center'>
                                <img
                                    className='w-20 h-20 object-contain'
                                    src='/video-icon.png'
                                    alt='Video'
                                />
                            </div>
                        ) : (
                            <div className='aspect-square overflow-hidden rounded-md bg-muted/50 flex items-center justify-center'>
                                <img
                                    className='w-16 h-16 object-contain'
                                    src={iconSrc || '/placeholder.svg'}
                                    alt={
                                        mime.extension(file.type || '') ||
                                        'File'
                                    }
                                />
                            </div>
                        )}
                    </div>

                    <div className='info mt-2 flex items-center justify-between'>
                        <div className='flex items-center space-x-2'>
                            {isUploading && (
                                <Loader2 className='h-4 w-4 animate-spin text-primary' />
                            )}
                            <span className='text-xs text-muted-foreground'>
                                {bytesToSize(
                                    file.size || file?.file?.size || 0,
                                )}
                            </span>
                        </div>

                        <button
                            className='imgDownBtn p-2 rounded-full hover:bg-muted transition-colors'
                            onClick={(e) => {
                                e.preventDefault();
                                downloadFileWithLink(file?.url);
                            }}
                            aria-label='Download file'
                        >
                            <Download className='h-4 w-4 text-primary' />
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default FileCard;
