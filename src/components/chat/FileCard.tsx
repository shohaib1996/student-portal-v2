'use client';

import type React from 'react';
import { useState, useRef, useEffect } from 'react';
import { Download, Loader2, X, Maximize, Play } from 'lucide-react';
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
    isPopUp?: boolean;
    onImageClick?: (file: FileObject) => void;
    onVideoClick?: (file: FileObject) => void;
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

const FileCard = ({
    file,
    index,
    onImageClick,
    onVideoClick,
    isPopUp,
}: FileCardProps) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [videoThumbnail, setVideoThumbnail] = useState<string | null>(null);
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    const iconSrc = determineIconSrc(file?.type, file?.url);
    const fileType =
        file?.file?.type?.split('/')[0] || file?.type?.split('/')[0];

    const isAudio =
        file?.file?.type === 'audio/mp3' || file?.type === 'audio/mp3';
    const isImage = fileType === 'image';
    const isVideo = fileType === 'video';
    const isUploading = file?.status === 'uploading';

    // Generate video thumbnail
    useEffect(() => {
        if (isVideo && file?.url && !videoThumbnail) {
            // Try to generate thumbnail only if we have a URL and haven't generated one yet
            const video = document.createElement('video');
            video.crossOrigin = 'anonymous';
            video.src = file.url;
            video.muted = true;

            // Try to get a frame at 1 second
            video.currentTime = 1;

            video.onloadeddata = () => {
                try {
                    const canvas = document.createElement('canvas');
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                        const thumbnailUrl = canvas.toDataURL('image/jpeg');
                        setVideoThumbnail(thumbnailUrl);
                    }
                } catch (e) {
                    console.error('Error generating video thumbnail:', e);
                    setVideoThumbnail(null);
                }
            };

            video.onerror = () => {
                console.error('Error loading video for thumbnail generation');
                setVideoThumbnail(null);
            };
        }
    }, [isVideo, file?.url, videoThumbnail]);

    const handleDownload = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        downloadFileWithLink(file?.url, file?.name);
    };

    const handleFullScreen = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (isVideo && videoRef.current) {
            if (document.fullscreenElement) {
                document.exitFullscreen();
                setIsFullScreen(false);
            } else {
                videoRef.current.requestFullscreen();
                setIsFullScreen(true);
            }
        } else if (isImage) {
            setIsPreviewOpen(true);
        }
    };

    const closePreview = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsPreviewOpen(false);
    };

    const handleVideoClick = () => {
        if (isVideo && onVideoClick) {
            onVideoClick(file);
        } else if (isVideo) {
            setIsVideoPlaying(true);
        }
    };

    const handleImageClick = () => {
        if (isImage && onImageClick) {
            onImageClick(file);
        } else if (isImage) {
            setIsPreviewOpen(true);
        }
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
                    className='file_download_item w-full relative rounded-md overflow-hidden cursor-pointer h-full bg-foreground'
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    onClick={handleImageClick}
                >
                    {/* Image */}
                    <div className='w-full h-full relative'>
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
                                className='h-7 w-7 min-w-7 rounded-full'
                                onClick={handleDownload}
                                aria-label='Download file'
                            >
                                <Download className='h-4 w-4 text-primary' />
                            </Button>

                            {/* Time */}
                            {!isPopUp && file?.createdAt && (
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
            </>
        );
    }

    // Special rendering for video files
    if (isVideo) {
        return (
            <>
                <div
                    className={`file_download_item w-full h-full bg-foreground ${file?.status || ''} rounded-md border flex flex-col overflow-hidden cursor-pointer`}
                    onClick={handleVideoClick}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    <div
                        className='thumb relative overflow-hidden h-full'
                        style={{ borderRadius: '4px 4px 0 0' }}
                    >
                        {isVideoPlaying ? (
                            <video
                                ref={videoRef}
                                controls
                                autoPlay
                                className='w-full h-full aspect-video object-cover'
                                src={file?.url}
                                onEnded={() => setIsVideoPlaying(false)}
                            >
                                Your browser does not support video playback.
                            </video>
                        ) : (
                            <div className='aspect-video w-full h-full overflow-hidden rounded-t-md bg-primary-light flex items-center justify-center relative'>
                                {/* Video thumbnail if available */}
                                {videoThumbnail ? (
                                    <img
                                        className='w-full h-full object-cover'
                                        src={videoThumbnail}
                                        alt='Video thumbnail'
                                    />
                                ) : (
                                    <img
                                        className='w-20 h-20 object-contain'
                                        src='/video-icon.png'
                                        alt='Video'
                                    />
                                )}

                                {/* Play button overlay */}
                                <div className='absolute inset-0 bg-black/30 flex items-center justify-center'>
                                    <div className='rounded-full bg-black/60 p-3'>
                                        <Play className='h-8 w-8 text-white' />
                                    </div>
                                </div>

                                {/* Top controls for video */}
                                <div className='absolute top-0 left-0 right-0 p-1 flex justify-between items-center'>
                                    {/* Download button */}
                                    <Button
                                        variant='primary_light'
                                        size='icon'
                                        className='h-8 w-8 min-w-8 rounded-full'
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDownload(e);
                                        }}
                                        aria-label='Download video'
                                    >
                                        <Download className='h-4 w-4 text-primary' />
                                    </Button>

                                    {/* Time */}
                                    {!isPopUp && file?.createdAt && (
                                        <span className='text-xs text-white px-2 py-1 rounded-md'>
                                            {formatDate(file?.createdAt)}
                                        </span>
                                    )}
                                </div>

                                {/* Bottom info box - shown on hover */}
                                <div
                                    className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-pure-black to-transparent p-2 transition-transform duration-200 ease-in-out ${
                                        isHovered
                                            ? 'translate-y-0'
                                            : 'translate-y-full'
                                    }`}
                                >
                                    <p
                                        className='text-sm font-medium truncate text-pure-white mt-4'
                                        title={file?.name}
                                    >
                                        {file?.name || 'Unnamed video'}
                                    </p>
                                    <p className='text-xs text-pure-white/80'>
                                        Size:{' '}
                                        {bytesToSize(
                                            file?.size || file?.file?.size || 0,
                                        )}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </>
        );
    }

    // Default rendering for non-image, non-audio, non-video files (attachments)
    return (
        <div
            className={`file_download_item w-full ${file?.status || ''} rounded-md border flex flex-col`}
        >
            <div
                className='thumb relative overflow-hidden'
                style={{ borderRadius: '4px 4px 0 0' }}
            >
                <div className='overflow-hidden bg-primary-light flex items-center justify-center'>
                    <img
                        className='w-24 h-24 object-contain'
                        src={iconSrc || '/placeholder.svg'}
                        alt={mime.extension(file?.type || '') || 'File'}
                    />
                </div>
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
                    <p
                        className='text-xs text-gray'
                        style={{ lineHeight: 1.1 }}
                    >
                        Attachment
                    </p>
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
