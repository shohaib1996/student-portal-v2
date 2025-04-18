'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
    ChevronLeft,
    ChevronRight,
    X,
    Download,
    Play,
    Pause,
    Volume2,
    VolumeX,
} from 'lucide-react';
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

interface MediaSliderProps {
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

const MediaSlider: React.FC<MediaSliderProps> = ({
    isOpen,
    onClose,
    files,
    initialIndex = 0,
}) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Filter only media files (images and videos)
    const mediaFiles = files.filter(
        (file) =>
            file?.type?.startsWith('image/') ||
            file?.file?.type?.startsWith('image/') ||
            file?.type?.startsWith('video/') ||
            file?.file?.type?.startsWith('video/'),
    );

    const isCurrentFileVideo = () => {
        const currentFile = mediaFiles[currentIndex];
        return (
            currentFile?.type?.startsWith('video/') ||
            currentFile?.file?.type?.startsWith('video/')
        );
    };

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
            } else if (e.key === ' ' && isCurrentFileVideo()) {
                // Space bar for play/pause
                e.preventDefault(); // Prevent page scroll
                toggleVideoPlayback();
            } else if (e.key === 'm' && isCurrentFileVideo()) {
                // 'm' for mute/unmute
                toggleMute(e as unknown as React.MouseEvent);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, currentIndex, mediaFiles]);

    // Reset video state when changing slides
    useEffect(() => {
        setIsVideoPlaying(false);

        // Wait for the component to update with new index
        setTimeout(() => {
            // If it's a video, ensure it's properly reset
            if (videoRef.current && isCurrentFileVideo()) {
                videoRef.current.pause();
                videoRef.current.currentTime = 0;
                videoRef.current.load(); // Properly reload the video source
            }
        }, 50);
    }, [currentIndex]);

    // Reset current index when modal opens
    useEffect(() => {
        if (isOpen) {
            setCurrentIndex(initialIndex);
            setIsVideoPlaying(false);

            // Reset controls visibility
            setShowControls(true);

            // Auto-hide controls after 3 seconds
            const timer = setTimeout(() => {
                if (isOpen) {
                    setShowControls(false);
                }
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [isOpen, initialIndex]);

    // Hide controls after inactivity
    useEffect(() => {
        let timer: NodeJS.Timeout;

        const resetTimer = () => {
            clearTimeout(timer);
            setShowControls(true);

            timer = setTimeout(() => {
                if (isVideoPlaying) {
                    setShowControls(false);
                }
            }, 3000);
        };

        if (isOpen) {
            resetTimer();
            document.addEventListener('mousemove', resetTimer);
        }

        return () => {
            clearTimeout(timer);
            document.removeEventListener('mousemove', resetTimer);
        };
    }, [isOpen, isVideoPlaying]);

    const handleNext = () => {
        if (videoRef.current && isVideoPlaying) {
            videoRef.current.pause();
        }
        setCurrentIndex((prevIndex) =>
            prevIndex === mediaFiles.length - 1 ? 0 : prevIndex + 1,
        );
    };

    const handlePrev = () => {
        if (videoRef.current && isVideoPlaying) {
            videoRef.current.pause();
        }
        setCurrentIndex((prevIndex) =>
            prevIndex === 0 ? mediaFiles.length - 1 : prevIndex - 1,
        );
    };

    const toggleVideoPlayback = (e?: React.MouseEvent) => {
        if (e) {
            e.stopPropagation();
        }

        if (!videoRef.current) {
            return;
        }

        if (isVideoPlaying) {
            videoRef.current.pause();
            setIsVideoPlaying(false);
        } else {
            // Ensure it's loaded and ready
            try {
                const playPromise = videoRef.current.play();
                if (playPromise !== undefined) {
                    playPromise
                        .then(() => {
                            setIsVideoPlaying(true);
                        })
                        .catch((err) => {
                            console.error('Error playing video:', err);
                            // Sometimes videos need a second attempt
                            setTimeout(() => {
                                if (videoRef.current) {
                                    videoRef.current
                                        .play()
                                        .then(() => setIsVideoPlaying(true))
                                        .catch((e) =>
                                            console.error(
                                                'Second attempt failed:',
                                                e,
                                            ),
                                        );
                                }
                            }, 300);
                        });
                }
            } catch (e) {
                console.error('Error in play attempt:', e);
            }
        }
    };

    const toggleMute = (e: React.MouseEvent) => {
        e.stopPropagation();

        if (!videoRef.current) {
            return;
        }

        videoRef.current.muted = !videoRef.current.muted;
        setIsMuted(!isMuted);
    };

    const handleDownload = (e: React.MouseEvent) => {
        e.stopPropagation();

        const currentFile = mediaFiles[currentIndex];
        if (currentFile?.url) {
            try {
                const link = document.createElement('a');
                link.href = currentFile.url;
                link.setAttribute('download', currentFile.name || 'media');
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                toast.success('Download started');
            } catch (error) {
                toast.error('Failed to download file');
                console.error('Download error:', error);
            }
        } else {
            toast.error('Download URL not available');
        }
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        // Only close if the click is directly on the backdrop
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    if (!isOpen || mediaFiles.length === 0) {
        return null;
    }

    const currentFile = mediaFiles[currentIndex];
    const currentIsVideo = isCurrentFileVideo();

    return (
        <div
            className='fixed inset-0 z-50 flex flex-col items-center justify-center bg-pure-black/50 backdrop-blur-md'
            onClick={handleBackdropClick}
            ref={containerRef}
        >
            {/* Top controls */}
            <div
                className={`absolute top-0 left-0 right-0 flex justify-between p-4 z-10 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}
                onClick={(e) => e.stopPropagation()}
            >
                <span className='text-white text-sm'>
                    {currentIndex + 1} of {mediaFiles.length}
                </span>
                <div className='flex gap-2'>
                    <Button
                        size='icon'
                        className='text-pure-white h-8 w-8 rounded-full'
                        onClick={handleDownload}
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

            {/* Media container */}
            <div
                className='relative max-h-[80vh] max-w-[90vw] flex items-center justify-center'
                onClick={(e) => {
                    e.stopPropagation();
                    if (currentIsVideo) {
                        toggleVideoPlayback(e);
                    }
                }}
            >
                {currentIsVideo ? (
                    <div
                        className='relative'
                        onClick={(e) => e.stopPropagation()}
                    >
                        <video
                            ref={videoRef}
                            className='max-h-[80vh] z-10 max-w-[90vw] object-contain bg-black'
                            controls={true}
                            muted={isMuted}
                            playsInline
                            onPlay={() => setIsVideoPlaying(true)}
                            onPause={() => setIsVideoPlaying(false)}
                            onEnded={() => setIsVideoPlaying(false)}
                            preload='auto'
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleVideoPlayback(e);
                            }}
                        >
                            <source src={currentFile?.url} type='video/mp4' />
                            Your browser does not support video playback.
                        </video>

                        {/* Play overlay if not playing */}
                        {!isVideoPlaying && (
                            <div
                                className='absolute inset-0 flex items-center justify-center bg-black/20'
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleVideoPlayback(e);
                                }}
                            >
                                <div
                                    className='rounded-full bg-black/60 p-4 cursor-pointer'
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleVideoPlayback(e);
                                    }}
                                >
                                    <Play className='h-12 w-12 text-white' />
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <img
                        src={currentFile?.url}
                        alt={currentFile?.name || 'Image'}
                        className='max-h-[80vh] max-w-[90vw] object-contain'
                        onClick={(e) => e.stopPropagation()}
                    />
                )}
            </div>

            {/* Navigation buttons */}
            <div
                className={`absolute inset-y-0 left-0 right-0 flex justify-between items-center px-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}
                onClick={(e) => e.stopPropagation()}
            >
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
            <div
                className={`absolute bottom-0 left-0 right-0 p-4 bg-black/50 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}
                onClick={(e) => e.stopPropagation()}
            >
                <p className='text-white text-sm truncate'>
                    {currentFile?.name}
                </p>
                <p className='text-white/70 text-xs'>
                    {currentIsVideo ? 'Video' : 'Image'} • Size:{' '}
                    {bytesToSize(
                        currentFile?.size || currentFile?.file?.size || 0,
                    )}
                </p>
            </div>
        </div>
    );
};

export default MediaSlider;
