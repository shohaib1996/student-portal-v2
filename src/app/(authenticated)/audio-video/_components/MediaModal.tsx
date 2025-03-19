// app/components/MediaModal.tsx
'use client';

import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    ArrowLeft,
    Calendar,
    X,
    Play,
    Rewind,
    FastForward,
    Volume2,
    Maximize,
    Settings,
    PictureInPicture,
    Share,
    Download,
    Pin,
    MessageCircle,
    MoreVertical,
    Star,
} from 'lucide-react';
import { GlobalCommentsSection } from '@/components/global/GlobalCommentSection';

// Define the media item type
type TMediaItem = {
    id?: string;
    title: string;
    url: string;
    createdAt: string;
    createdBy: {
        fullName: string;
        profilePicture: string;
    };
    description?: string;
};

type TMediaModalProps = {
    showModal: boolean;
    setShowModal: (value: boolean) => void;
    media: TMediaItem | null;
    onPrevious?: () => void;
    onNext?: () => void;
    onCommentSubmit?: (comment: string) => void;
};

export default function MediaModal({
    showModal,
    setShowModal,
    media,
    onPrevious,
    onNext,
    onCommentSubmit,
}: TMediaModalProps) {
    const [currentSection, setCurrentSection] = useState('overview'); // State to toggle sections
    const [isClient, setIsClient] = useState(false);

    // Ensure client-side rendering
    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient || !media) {
        return null;
    }

    return (
        <Dialog open={showModal} onOpenChange={setShowModal}>
            <DialogContent className='[&>button]:hidden no-scrollbar max-h-[90vh] lg:min-w-[1140px] overflow-y-auto bg-background p-0'>
                <div className='relative'>
                    {/* Header */}
                    <DialogHeader className='p-4'>
                        <div className='flex items-center justify-between'>
                            <div className='flex items-center gap-2'>
                                <Button
                                    variant='ghost'
                                    size='icon'
                                    onClick={() => setShowModal(false)}
                                >
                                    <ArrowLeft className='h-5 w-5' />
                                </Button>
                                <DialogTitle className='text-lg font-semibold'>
                                    Video Details
                                    <p className='text-sm font-normal text-muted-foreground'>
                                        Explore the details of this video
                                    </p>
                                </DialogTitle>
                            </div>
                            <div className='flex items-center gap-2'>
                                <Button
                                    variant='outline'
                                    size='sm'
                                    className='gap-1'
                                    onClick={onPrevious}
                                    disabled={!onPrevious}
                                >
                                    <ArrowLeft className='h-4 w-4' />
                                    Previous
                                </Button>
                                <Button
                                    variant='outline'
                                    size='sm'
                                    className='gap-1'
                                    onClick={onNext}
                                    disabled={!onNext}
                                >
                                    Next
                                    <ArrowLeft className='h-4 w-4 rotate-180' />
                                </Button>
                                <Button
                                    variant='ghost'
                                    size='icon'
                                    className='ml-2 text-destructive'
                                    onClick={() => setShowModal(false)}
                                >
                                    <X className='h-5 w-5' />
                                </Button>
                            </div>
                        </div>
                    </DialogHeader>

                    {/* Video Player */}
                    <div className='relative aspect-video bg-black'>
                        {media.url ? (
                            <iframe
                                src={media.url}
                                title={media.title}
                                allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
                                allowFullScreen
                                className='h-full w-full'
                            />
                        ) : (
                            <div
                                className='absolute inset-0 bg-cover bg-center'
                                style={{
                                    backgroundImage:
                                        "url('/placeholder.svg?height=600&width=1200')",
                                    filter: 'brightness(0.7)',
                                }}
                            />
                        )}

                        <div className='absolute inset-0 flex items-center justify-center'>
                            <Button
                                variant='ghost'
                                size='icon'
                                className='h-16 w-16 rounded-full bg-primary/80 text-primary-foreground hover:bg-primary/90'
                            >
                                <Play className='h-8 w-8 ml-1' />
                            </Button>

                            <Button
                                variant='ghost'
                                size='icon'
                                className='absolute left-1/4 h-12 w-12 rounded-full bg-black/50 text-white hover:bg-black/70'
                            >
                                <Rewind className='h-6 w-6' />
                                <span className='absolute text-xs font-bold'>
                                    10
                                </span>
                            </Button>

                            <Button
                                variant='ghost'
                                size='icon'
                                className='absolute right-1/4 h-12 w-12 rounded-full bg-black/50 text-white hover:bg-black/70'
                            >
                                <FastForward className='h-6 w-6' />
                                <span className='absolute text-xs font-bold'>
                                    10
                                </span>
                            </Button>
                        </div>

                        {/* Video Controls */}
                        <div className='absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent'>
                            <div className='flex flex-col gap-2'>
                                <div className='relative w-full h-1 bg-white/30 rounded-full'>
                                    <div className='absolute left-0 top-0 h-full w-1/5 bg-primary rounded-full' />
                                    <div className='absolute left-[20%] top-0 h-3 w-3 -mt-1 bg-primary rounded-full' />
                                </div>

                                <div className='flex items-center justify-between'>
                                    <div className='flex items-center gap-2'>
                                        <Button
                                            variant='ghost'
                                            size='icon'
                                            className='h-8 w-8 text-white'
                                        >
                                            <Play className='h-4 w-4' />
                                        </Button>
                                        <span className='text-xs text-white'>
                                            02:30 / 10:30
                                        </span>
                                    </div>

                                    <div className='flex items-center gap-2'>
                                        <Button
                                            variant='ghost'
                                            size='icon'
                                            className='h-8 w-8 text-white'
                                        >
                                            <Volume2 className='h-4 w-4' />
                                        </Button>
                                        <Button
                                            variant='ghost'
                                            size='icon'
                                            className='h-8 w-8 text-white'
                                        >
                                            <PictureInPicture className='h-4 w-4' />
                                        </Button>
                                        <Button
                                            variant='ghost'
                                            size='icon'
                                            className='h-8 w-8 text-white'
                                        >
                                            <Settings className='h-4 w-4' />
                                        </Button>
                                        <Button
                                            variant='ghost'
                                            size='icon'
                                            className='h-8 w-8 text-white'
                                        >
                                            <Maximize className='h-4 w-4' />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Video Info */}
                    <div className='p-4 border-b'>
                        <div className='flex items-center justify-between'>
                            <h2 className='text-xl font-bold'>
                                {media.title || 'Test Document For CloudOps'}
                            </h2>
                            <div className='flex items-center gap-2'>
                                <Button
                                    variant='ghost'
                                    size='sm'
                                    className='gap-1'
                                >
                                    <Pin className='h-4 w-4' />
                                    Pin
                                </Button>
                                <Button
                                    variant='ghost'
                                    size='sm'
                                    className='gap-1'
                                >
                                    <Share className='h-4 w-4' />
                                    Share
                                </Button>
                                <Button variant='ghost' size='icon'>
                                    <MoreVertical className='h-5 w-5' />
                                </Button>
                            </div>
                        </div>

                        <div className='flex items-center mt-2 gap-4'>
                            <div className='flex items-center gap-2'>
                                <Avatar className='h-8 w-8'>
                                    <AvatarImage
                                        src={
                                            media.createdBy.profilePicture ||
                                            '/placeholder.svg'
                                        }
                                        alt={media.createdBy.fullName || 'User'}
                                    />
                                    <AvatarFallback>
                                        {media.createdBy.fullName?.charAt(0) ||
                                            'U'}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className='text-sm font-medium'>
                                        {media.createdBy.fullName ||
                                            'Jane Cooper'}
                                    </p>
                                    <p className='text-xs text-muted-foreground'>
                                        Instructor
                                    </p>
                                </div>
                            </div>
                            <Separator orientation='vertical' className='h-6' />
                            <div className='flex items-center gap-1 text-sm text-muted-foreground'>
                                <Calendar className='h-4 w-4' />
                                <span>
                                    {new Date(
                                        media.createdAt ||
                                            '2024-01-30T12:30:00',
                                    ).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className='flex items-center border-b'>
                        <div className='flex items-center justify-between px-4 w-full h-12'>
                            <button
                                onClick={() => setCurrentSection('overview')}
                                className={`flex items-center gap-2 px-4 py-2 ${
                                    currentSection === 'overview'
                                        ? 'border-b-2 border-primary text-foreground'
                                        : 'text-muted-foreground'
                                }`}
                            >
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
                                    className='lucide lucide-layout-dashboard'
                                >
                                    <rect
                                        width='7'
                                        height='9'
                                        x='3'
                                        y='3'
                                        rx='1'
                                    />
                                    <rect
                                        width='7'
                                        height='5'
                                        x='14'
                                        y='3'
                                        rx='1'
                                    />
                                    <rect
                                        width='7'
                                        height='9'
                                        x='14'
                                        y='12'
                                        rx='1'
                                    />
                                    <rect
                                        width='7'
                                        height='5'
                                        x='3'
                                        y='16'
                                        rx='1'
                                    />
                                </svg>
                                Overview
                            </button>

                            <div className='flex items-center gap-2'>
                                <Button
                                    variant='ghost'
                                    size='sm'
                                    className='gap-1'
                                >
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
                                        className='lucide lucide-file-plus'
                                    >
                                        <path d='M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 2-2V7.5L14.5 2z' />
                                        <polyline points='14 2 14 8 20 8' />
                                        <line x1='12' x2='12' y1='18' y2='12' />
                                        <line x1='9' x2='15' y1='15' y2='15' />
                                    </svg>
                                    Add Notes
                                </Button>
                                <Button
                                    variant='ghost'
                                    size='sm'
                                    className='gap-1'
                                >
                                    <Download className='h-4 w-4' />
                                    Download
                                </Button>
                                <Button
                                    variant='ghost'
                                    size='sm'
                                    className='gap-1'
                                >
                                    <Star className='h-4 w-4' />
                                    Ratings
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className='p-4'>
                        {currentSection === 'overview' && (
                            <div className='space-y-6'>
                                <div>
                                    <h3 className='text-lg font-medium mb-2'>
                                        Description
                                    </h3>
                                    <p className='text-sm text-muted-foreground'>
                                        {media.description ||
                                            "Lorem ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book."}
                                    </p>
                                </div>

                                <div>
                                    <h3 className='text-lg font-medium mb-2'>
                                        Resources
                                    </h3>
                                    <div className='border rounded-md p-4'>
                                        <div className='flex items-center gap-1 mb-2'>
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
                                                className='lucide lucide-file-text'
                                            >
                                                <path d='M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 2-2V7.5L14.5 2z' />
                                                <polyline points='14 2 14 8 20 8' />
                                                <line
                                                    x1='16'
                                                    x2='8'
                                                    y1='13'
                                                    y2='13'
                                                />
                                                <line
                                                    x1='16'
                                                    x2='8'
                                                    y1='17'
                                                    y2='17'
                                                />
                                                <line
                                                    x1='10'
                                                    x2='8'
                                                    y1='9'
                                                    y2='9'
                                                />
                                            </svg>
                                            <h4 className='text-sm font-medium'>
                                                Summary
                                            </h4>
                                        </div>
                                        <p className='text-sm text-muted-foreground'>
                                            Lorem ipsum is simply dummy text of
                                            the printing and typesetting
                                            industry...
                                        </p>
                                        <p className='text-sm text-muted-foreground mt-4'>
                                            Lorem ipsum is simply dummy text of
                                            the printing and typesetting
                                            industry...
                                        </p>
                                    </div>
                                </div>

                                {/* Comments */}
                                <div>
                                    <div className='flex items-center gap-2 mb-4'>
                                        <MessageCircle className='h-5 w-5' />
                                        <h3 className='text-lg font-medium'>
                                            Comments
                                        </h3>
                                    </div>
                                    <GlobalCommentsSection
                                        documentId={media.id || ''}
                                        onCommentSubmit={onCommentSubmit}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
