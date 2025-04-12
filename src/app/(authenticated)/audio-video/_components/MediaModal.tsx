'use client';

import type React from 'react';

import { useState, useEffect, useRef } from 'react';
import GlobalModal from '@/components/global/GlobalModal';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    ArrowLeft,
    ArrowRight,
    Calendar,
    Clock,
    Download,
    Eye,
    FileText,
    LayoutDashboard,
    MessageCircle,
    MonitorPlayIcon as TvMinimalPlay,
    MoreVertical,
    Pause,
    Pin,
    Play,
    Share,
    Star,
    Volume2,
} from 'lucide-react';
import Image from 'next/image';
import { formatDateToCustomString } from '@/lib/formatDateToCustomString';
import { cn } from '@/lib/utils';
import { useMyAudioVideoQuery } from '@/redux/api/audio-video/audioVideos';
import GlobalComment from '@/components/global/GlobalComments/GlobalComment';
import { toast } from 'sonner';

// Define the media item type if not already defined
type TMediaItem = {
    _id: string;
    title: string;
    url: string;
    createdAt: string;
    createdBy: {
        fullName: string;
        profilePicture: string;
        role?: string;
    };
    thumbnail?: string;
    description?: string;
    duration?: string;
    summary?: string;
    implementation?: string;
    interview?: string;
    behavioral?: string;
};

type TMediaModalProps = {
    showModal: boolean;
    setShowModal: (value: boolean) => void;
    media: TMediaItem;
    isAudio?: boolean;
};

const MediaModal = ({
    showModal,
    setShowModal,
    media,
    isAudio,
}: TMediaModalProps) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [resourceTab, setResourceTab] = useState('Summary');
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [currentMedia, setCurrentMedia] = useState<TMediaItem>(media);
    const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement>(null);
    const waveformCanvasRef = useRef<HTMLCanvasElement>(null);

    // Fetch related media
    const { data, isLoading } = useMyAudioVideoQuery({});
    const relatedMedia =
        data?.medias?.filter(
            (m: any) =>
                (isAudio && m.url?.includes('audio')) ||
                (!isAudio && !m.url?.includes('audio')),
        ) || [];

    // Update current media when media prop changes
    useEffect(() => {
        setCurrentMedia(media);
    }, [media]);

    // Draw audio waveform visualization (simplified version)
    useEffect(() => {
        if (isAudio && waveformCanvasRef.current) {
            const canvas = waveformCanvasRef.current;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                return;
            }

            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Set styles
            ctx.fillStyle = '#ffffff';
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;

            // Draw waveform (simplified representation)
            const barCount = 100;
            const barWidth = canvas.width / barCount;
            const centerY = canvas.height / 2;

            for (let i = 0; i < barCount; i++) {
                // Generate random heights for demonstration
                const height = Math.random() * (canvas.height * 0.8) + 10;
                const x = i * barWidth;

                // Draw bar
                ctx.beginPath();
                ctx.moveTo(x, centerY - height / 2);
                ctx.lineTo(x, centerY + height / 2);
                ctx.stroke();
            }

            // Draw playback position indicator
            const playbackPosition =
                (currentTime / (duration || 1)) * canvas.width;
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(playbackPosition, centerY, 8, 0, Math.PI * 2);
            ctx.fill();
        }
    }, [isAudio, currentTime, duration]);

    // Handle media playback
    const togglePlay = () => {
        if (mediaRef.current) {
            if (isPlaying) {
                mediaRef.current.pause();
            } else {
                mediaRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    // Handle time update
    const handleTimeUpdate = () => {
        if (mediaRef.current) {
            setCurrentTime(mediaRef.current.currentTime);
        }
    };

    // Handle media loaded metadata
    const handleLoadedMetadata = () => {
        if (mediaRef.current) {
            setDuration(mediaRef.current.duration);
        }
    };

    // Format time (seconds) to MM:SS
    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    // Handle seeking
    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTime = Number.parseFloat(e.target.value);
        setCurrentTime(newTime);
        if (mediaRef.current) {
            mediaRef.current.currentTime = newTime;
        }
    };

    // Handle volume change
    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = Number.parseFloat(e.target.value);
        setVolume(newVolume);
        if (mediaRef.current) {
            mediaRef.current.volume = newVolume;
        }
    };

    // Handle playback rate change
    const togglePlaybackRate = () => {
        const rates = [1, 1.5, 2, 0.5];
        const currentIndex = rates.indexOf(playbackRate);
        const nextIndex = (currentIndex + 1) % rates.length;
        const newRate = rates[nextIndex];

        setPlaybackRate(newRate);
        if (mediaRef.current) {
            mediaRef.current.playbackRate = newRate;
        }
    };

    // Handle next/previous media
    const handleNextMedia = () => {
        const currentIndex = relatedMedia.findIndex(
            (v: any) => v._id === currentMedia._id,
        );
        if (currentIndex < relatedMedia.length - 1) {
            setCurrentMedia(relatedMedia[currentIndex + 1]);
        }
    };

    const handlePreviousMedia = () => {
        const currentIndex = relatedMedia.findIndex(
            (v: any) => v._id === currentMedia._id,
        );
        if (currentIndex > 0) {
            setCurrentMedia(relatedMedia[currentIndex - 1]);
        }
    };

    // Check if next/previous buttons should be disabled
    const isNextDisabled =
        relatedMedia.findIndex((v: any) => v._id === currentMedia._id) ===
        relatedMedia.length - 1;
    const isPreviousDisabled =
        relatedMedia.findIndex((v: any) => v._id === currentMedia._id) === 0;

    // Custom sidebar with related media
    const sideBar = (
        <div className='p-2 flex flex-col h-full bg-background rounded-lg border'>
            <h3 className='font-semibold mb-2 pb-2 border-b'>
                {isAudio ? 'Upcoming Audios' : 'Upcoming Videos'}
            </h3>
            <div className='space-y-4 overflow-y-auto max-h-[calc(100vh-300px)]'>
                {relatedMedia.map((relatedItem: any) => (
                    <div
                        key={relatedItem._id}
                        className={`flex gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-md ${
                            relatedItem._id === currentMedia._id
                                ? 'bg-gray-100'
                                : ''
                        }`}
                        onClick={() => setCurrentMedia(relatedItem)}
                    >
                        <div className='relative w-24 h-16 sm:w-32 sm:h-20 flex-shrink-0'>
                            {isAudio ? (
                                <div className='absolute inset-0 bg-gray-200 rounded-md flex items-center justify-center'>
                                    <Volume2 className='h-8 w-8 text-gray-500' />
                                </div>
                            ) : (
                                <>
                                    <div className='absolute top-1 left-1 z-10'>
                                        <div className='flex items-center gap-1 bg-white px-1 py-0.5 rounded-md text-[10px] shadow-sm'>
                                            <TvMinimalPlay className='h-3 w-3 text-primary' />
                                            <span className='text-[10px] font-medium text-primary'>
                                                Videos
                                            </span>
                                        </div>
                                    </div>
                                    <div className='absolute top-1 right-1 z-10'>
                                        <div className='flex items-center gap-1 bg-black/80 px-1 py-0.5 rounded-md text-[10px]'>
                                            <Clock className='h-2 w-2 text-white' />
                                            <span className='text-[10px] font-medium text-white'>
                                                {relatedItem.duration ||
                                                    '05:30'}
                                            </span>
                                        </div>
                                    </div>
                                    <Image
                                        src={
                                            relatedItem.thumbnail ||
                                            '/placeholder.svg?height=80&width=128&query=video thumbnail'
                                        }
                                        alt={relatedItem.title}
                                        fill
                                        className='object-cover rounded-md'
                                    />
                                </>
                            )}

                            <div className='absolute inset-0 flex items-center justify-center'>
                                <div className='h-8 w-8 rounded-full bg-white/40 flex items-center justify-center'>
                                    {isAudio ? (
                                        <Volume2 className='h-4 w-4 text-gray-700' />
                                    ) : (
                                        <Play className='h-4 w-4 text-white ml-0.5' />
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className='flex-1 min-w-0'>
                            <div className='flex items-center gap-1 text-xs text-gray-500 mb-1'>
                                <Calendar className='h-3 w-3' />
                                <span>
                                    {formatDateToCustomString(
                                        relatedItem.createdAt,
                                    )}
                                </span>
                            </div>
                            <h4 className='text-sm font-medium line-clamp-1'>
                                {relatedItem.title}
                            </h4>
                            <div className='flex items-center gap-1 mt-1'>
                                <div className='relative h-5 w-5'>
                                    <Image
                                        src={
                                            relatedItem.createdBy
                                                ?.profilePicture ||
                                            '/abstract-user-icon.png'
                                        }
                                        alt={
                                            relatedItem.createdBy?.fullName ||
                                            'User'
                                        }
                                        className='rounded-full object-cover'
                                        fill
                                    />
                                </div>
                                <p className='text-xs text-gray-500'>
                                    {relatedItem.createdBy?.fullName}
                                </p>
                            </div>
                            <div className='mt-1'>
                                <Button
                                    variant='ghost'
                                    size='sm'
                                    className='h-6 text-xs px-2 text-primary'
                                >
                                    <Eye className='h-3 w-3 mr-1' />
                                    View
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    // Custom title with navigation
    const customTitle = (
        <div className='flex items-center justify-between border-b border-forground-border px-5 py-3 pb-2 sticky top-0 rounded-tr-lg rounded-tl-lg'>
            <div className='flex items-center gap-2'>
                <Button
                    variant='ghost'
                    size='icon'
                    className='h-8 w-8'
                    onClick={() => setShowModal(false)}
                >
                    <ArrowLeft className='h-5 w-5' />
                </Button>
                <div>
                    <h3 className='text-black font-medium text-lg'>
                        {isAudio ? 'Audio Details' : 'Video Details'}
                    </h3>
                    <p className='text-xs text-gray-500'>
                        {isAudio
                            ? 'Explore the details of this audio'
                            : 'Explore the details of this video'}
                    </p>
                </div>
            </div>
            <div className='flex items-center gap-2'>
                <Button
                    variant='outline'
                    size='sm'
                    className='text-xs h-8 hidden sm:flex'
                    onClick={handlePreviousMedia}
                    disabled={isPreviousDisabled}
                >
                    <ArrowLeft className='h-3 w-3 mr-1' /> Previous
                </Button>
                <Button
                    variant='outline'
                    size='sm'
                    className='text-xs h-8 hidden sm:flex'
                    onClick={handleNextMedia}
                    disabled={isNextDisabled}
                >
                    Next <ArrowRight className='h-3 w-3 ml-1' />
                </Button>
                <Button size='sm' className='text-xs h-8'>
                    Save & Close
                </Button>
            </div>
        </div>
    );

    return (
        <GlobalModal
            open={showModal}
            setOpen={setShowModal}
            customTitle={customTitle}
            className='flex flex-col'
            fullScreen={true}
            allowFullScreen={true}
        >
            <div className='flex flex-col lg:flex-row gap-3 w-full h-full'>
                <div className='flex flex-col w-full lg:w-3/4 h-full'>
                    {isAudio ? (
                        // Audio Player UI
                        <div className='p-4 bg-gray-700 rounded-lg'>
                            {/* Hidden audio element for playback */}
                            <audio
                                ref={
                                    mediaRef as React.RefObject<HTMLAudioElement>
                                }
                                src={currentMedia.url}
                                className='hidden'
                                onTimeUpdate={handleTimeUpdate}
                                onLoadedMetadata={handleLoadedMetadata}
                            />

                            {/* Audio waveform visualization */}
                            <div className='relative mb-4'>
                                <div className='flex items-center'>
                                    <Button
                                        variant='ghost'
                                        size='icon'
                                        className='h-12 w-12 text-white mr-4'
                                        onClick={togglePlay}
                                    >
                                        {isPlaying ? (
                                            <Pause className='h-8 w-8' />
                                        ) : (
                                            <Play className='h-8 w-8' />
                                        )}
                                    </Button>

                                    <div className='relative flex-1 h-24'>
                                        <canvas
                                            ref={waveformCanvasRef}
                                            className='w-full h-full'
                                            width={800}
                                            height={96}
                                        />

                                        {/* Time display */}
                                        <div className='absolute right-0 top-0 text-white text-lg font-medium'>
                                            {currentMedia.duration || '03:30'}
                                        </div>
                                    </div>
                                </div>

                                {/* Playback rate control */}
                                <div className='absolute right-0 bottom-0'>
                                    <Button
                                        variant='outline'
                                        className='h-8 w-12 rounded-full bg-white/20 text-white border-white/30'
                                        onClick={togglePlaybackRate}
                                    >
                                        {playbackRate}x
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        // Video Player UI
                        <div className='relative aspect-video bg-black rounded-lg'>
                            <video
                                ref={
                                    mediaRef as React.RefObject<HTMLVideoElement>
                                }
                                src={currentMedia.url}
                                className='w-full h-full rounded-lg'
                                onTimeUpdate={handleTimeUpdate}
                                onLoadedMetadata={handleLoadedMetadata}
                                onClick={togglePlay}
                            />

                            {!currentMedia.url && (
                                <div className='w-full h-full flex items-center justify-center bg-gray-900 rounded-lg'>
                                    <Image
                                        src={
                                            currentMedia.thumbnail ||
                                            '/placeholder.svg?height=540&width=960&query=video player'
                                        }
                                        alt={currentMedia.title}
                                        fill
                                        className='object-cover opacity-60 rounded-lg'
                                    />
                                    <div className='absolute inset-0 bg-black/40' />
                                </div>
                            )}

                            {/* Play button overlay */}
                            <div className='absolute inset-0 flex items-center justify-center'>
                                <Button
                                    variant='secondary'
                                    size='icon'
                                    className='h-16 w-16 rounded-full bg-primary/80 text-white hover:bg-primary/90'
                                    onClick={togglePlay}
                                >
                                    {isPlaying ? (
                                        <Pause className='h-8 w-8' />
                                    ) : (
                                        <Play className='h-8 w-8 ml-1' />
                                    )}
                                </Button>
                            </div>

                            {/* Video Controls */}
                            <div className='absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent'>
                                <div className='flex flex-col gap-2'>
                                    <div className='relative w-full h-1 bg-white/30 rounded-full'>
                                        <input
                                            type='range'
                                            min='0'
                                            max={duration || 100}
                                            value={currentTime}
                                            onChange={handleSeek}
                                            className='absolute w-full h-1 opacity-0 cursor-pointer z-10'
                                        />
                                        <div
                                            className='absolute left-0 top-0 h-full bg-primary rounded-full'
                                            style={{
                                                width: `${(currentTime / (duration || 1)) * 100}%`,
                                            }}
                                        />
                                        <div
                                            className='absolute top-0 h-3 w-3 -mt-1 bg-primary rounded-full'
                                            style={{
                                                left: `${(currentTime / (duration || 1)) * 100}%`,
                                            }}
                                        />
                                    </div>

                                    <div className='flex items-center justify-between'>
                                        <div className='flex items-center gap-2'>
                                            <Button
                                                variant='ghost'
                                                size='icon'
                                                className='h-8 w-8 text-white'
                                                onClick={togglePlay}
                                            >
                                                {isPlaying ? (
                                                    <Pause className='h-4 w-4' />
                                                ) : (
                                                    <Play className='h-4 w-4' />
                                                )}
                                            </Button>
                                            <span className='text-xs text-white'>
                                                {formatTime(currentTime)} /{' '}
                                                {formatTime(duration || 0)}
                                            </span>
                                        </div>

                                        <div className='flex items-center gap-2'>
                                            <div className='flex items-center gap-1 w-24'>
                                                <Volume2 className='h-4 w-4 text-white' />
                                                <input
                                                    type='range'
                                                    min='0'
                                                    max='1'
                                                    step='0.01'
                                                    value={volume}
                                                    onChange={
                                                        handleVolumeChange
                                                    }
                                                    className='w-full h-1 bg-white/30 rounded-full'
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Media Info */}
                    <div className='p-4 border-b mt-4'>
                        <div className='flex items-center justify-between'>
                            <h2 className='text-xl font-bold'>
                                {currentMedia.title ||
                                    'Automation Fundamentals'}
                            </h2>
                            <div className='flex items-center gap-2'>
                                <Button
                                    variant='ghost'
                                    size='sm'
                                    className='gap-1'
                                    onClick={() => toast.info('Coming soon!')}
                                >
                                    <Pin className='h-4 w-4' />
                                    Pin
                                </Button>
                                <Button
                                    variant='ghost'
                                    size='sm'
                                    className='gap-1'
                                    onClick={() => toast.info('Coming soon!')}
                                >
                                    <Share className='h-4 w-4' />
                                    Share
                                </Button>
                            </div>
                        </div>

                        <div className='flex items-center mt-2 gap-4'>
                            <div className='flex items-center gap-2'>
                                <div className='relative h-8 w-8'>
                                    <Image
                                        src={
                                            currentMedia.createdBy
                                                ?.profilePicture ||
                                            '/abstract-user-icon.png'
                                        }
                                        alt={
                                            currentMedia.createdBy?.fullName ||
                                            'User'
                                        }
                                        className='rounded-full object-cover'
                                        fill
                                    />
                                </div>
                                <div>
                                    <p className='text-sm font-medium'>
                                        {currentMedia.createdBy?.fullName ||
                                            'Jane Cooper'}
                                    </p>
                                    <p className='text-xs text-gray-500'>
                                        {currentMedia.createdBy?.role ||
                                            'Instructor'}
                                    </p>
                                </div>
                            </div>
                            <div className='h-6 w-px bg-gray-300' />
                            <div className='flex items-center gap-1 text-sm text-gray-500'>
                                <Calendar className='h-4 w-4' />
                                <span>
                                    {formatDateToCustomString(
                                        currentMedia.createdAt,
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className='border-b'>
                        <Tabs
                            defaultValue='overview'
                            value={activeTab}
                            onValueChange={setActiveTab}
                        >
                            <div className='flex items-center justify-between px-4'>
                                <TabsList className='bg-transparent border-0 p-0'>
                                    <TabsTrigger
                                        value='overview'
                                        className={cn(
                                            'data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-4 py-2',
                                            'data-[state=inactive]:bg-transparent data-[state=inactive]:text-gray-500',
                                        )}
                                    >
                                        <LayoutDashboard className='h-4 w-4 mr-2' />
                                        Overview
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value='notes'
                                        className={cn(
                                            'data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-4 py-2',
                                            'data-[state=inactive]:bg-transparent data-[state=inactive]:text-gray-500',
                                        )}
                                    >
                                        <FileText className='h-4 w-4 mr-2' />
                                        Add Notes
                                    </TabsTrigger>
                                </TabsList>

                                <div className='flex items-center gap-2'>
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

                            <TabsContent value='overview' className='p-4 mt-0'>
                                <div className='space-y-6'>
                                    <div>
                                        <h3 className='text-lg font-medium mb-2'>
                                            Description
                                        </h3>
                                        <p className='text-sm text-gray-500'>
                                            {currentMedia.description ||
                                                'Bootcamp is an all-in-one SaaS platform designed for high-ticket coaches and educators. It empowers you to launch, manage, and scale premium boot camps without relying on fragmented tools like Udemy or Skillshare.'}
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className='text-lg font-medium mb-2'>
                                            Resources
                                        </h3>
                                        <div className='border rounded-md p-4'>
                                            <div className='tab-wrapper flex border-b mb-4 overflow-x-auto'>
                                                <button
                                                    onClick={() =>
                                                        setResourceTab(
                                                            'Summary',
                                                        )
                                                    }
                                                    className={`tab px-4 py-2 ${
                                                        resourceTab ===
                                                        'Summary'
                                                            ? 'border-b-2 border-primary text-primary font-medium'
                                                            : 'text-gray-500'
                                                    }`}
                                                >
                                                    Summary
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        setResourceTab(
                                                            'Assessments',
                                                        )
                                                    }
                                                    className={`tab px-4 py-2 ${
                                                        resourceTab ===
                                                        'Assessments'
                                                            ? 'border-b-2 border-primary text-primary font-medium'
                                                            : 'text-gray-500'
                                                    }`}
                                                >
                                                    Assessments
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        setResourceTab(
                                                            'Interview',
                                                        )
                                                    }
                                                    className={`tab px-4 py-2 ${
                                                        resourceTab ===
                                                        'Interview'
                                                            ? 'border-b-2 border-primary text-primary font-medium'
                                                            : 'text-gray-500'
                                                    }`}
                                                >
                                                    Interview
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        setResourceTab(
                                                            'Behavioral',
                                                        )
                                                    }
                                                    className={`tab px-4 py-2 ${
                                                        resourceTab ===
                                                        'Behavioral'
                                                            ? 'border-b-2 border-primary text-primary font-medium'
                                                            : 'text-gray-500'
                                                    }`}
                                                >
                                                    Behavioral
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        setResourceTab(
                                                            'Analytic',
                                                        )
                                                    }
                                                    className={`tab px-4 py-2 ${
                                                        resourceTab ===
                                                        'Analytic'
                                                            ? 'border-b-2 border-primary text-primary font-medium'
                                                            : 'text-gray-500'
                                                    }`}
                                                >
                                                    Analytic
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        setResourceTab('Labs')
                                                    }
                                                    className={`tab px-4 py-2 ${
                                                        resourceTab === 'Labs'
                                                            ? 'border-b-2 border-primary text-primary font-medium'
                                                            : 'text-gray-500'
                                                    }`}
                                                >
                                                    Labs
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        setResourceTab(
                                                            'Presentations',
                                                        )
                                                    }
                                                    className={`tab px-4 py-2 ${
                                                        resourceTab ===
                                                        'Presentations'
                                                            ? 'border-b-2 border-primary text-primary font-medium'
                                                            : 'text-gray-500'
                                                    }`}
                                                >
                                                    Presentations
                                                </button>
                                            </div>

                                            <div className='activeBody'>
                                                {resourceTab === 'Summary' && (
                                                    <div>
                                                        <p className='text-sm text-gray-500 mb-4'>
                                                            {currentMedia.summary ||
                                                                "What you're going to get from this course:"}
                                                        </p>
                                                        <ul className='list-disc pl-5 text-sm text-gray-500 space-y-2'>
                                                            <li>
                                                                Understand the
                                                                core principles
                                                                of automation
                                                                technology
                                                            </li>
                                                            <li>
                                                                Learn how to
                                                                implement
                                                                automation in
                                                                various business
                                                                processes
                                                            </li>
                                                            <li>
                                                                Develop skills
                                                                to analyze and
                                                                optimize
                                                                automated
                                                                workflows
                                                            </li>
                                                            <li>
                                                                Apply automation
                                                                concepts to
                                                                real-world
                                                                scenarios
                                                            </li>
                                                        </ul>
                                                    </div>
                                                )}
                                                {resourceTab ===
                                                    'Assessments' && (
                                                    <div>
                                                        <p className='text-sm text-gray-500'>
                                                            No assessment
                                                            information
                                                            available for this
                                                            content.
                                                        </p>
                                                    </div>
                                                )}
                                                {resourceTab ===
                                                    'Interview' && (
                                                    <div>
                                                        <p className='text-sm text-gray-500'>
                                                            No interview
                                                            information
                                                            available for this
                                                            content.
                                                        </p>
                                                    </div>
                                                )}
                                                {resourceTab ===
                                                    'Behavioral' && (
                                                    <div>
                                                        <p className='text-sm text-gray-500'>
                                                            No behavioral
                                                            information
                                                            available for this
                                                            content.
                                                        </p>
                                                    </div>
                                                )}
                                                {resourceTab === 'Analytic' && (
                                                    <div>
                                                        <p className='text-sm text-gray-500'>
                                                            No analytic
                                                            information
                                                            available for this
                                                            content.
                                                        </p>
                                                    </div>
                                                )}
                                                {resourceTab === 'Labs' && (
                                                    <div>
                                                        <p className='text-sm text-gray-500'>
                                                            No labs information
                                                            available for this
                                                            content.
                                                        </p>
                                                    </div>
                                                )}
                                                {resourceTab ===
                                                    'Presentations' && (
                                                    <div>
                                                        <p className='text-sm text-gray-500'>
                                                            No presentations
                                                            available for this
                                                            content.
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
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
                                        <GlobalComment
                                            contentId={currentMedia._id || ''}
                                        />
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value='notes' className='p-4 mt-0'>
                                <div className='border rounded-md p-4'>
                                    <h3 className='text-lg font-medium mb-2'>
                                        Add Notes
                                    </h3>
                                    <textarea
                                        className='w-full border rounded-md p-3 min-h-[200px]'
                                        placeholder='Write your notes here...'
                                    />
                                    <div className='flex justify-end mt-4'>
                                        <Button>Save Notes</Button>
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
                <div className='sidebar w-full lg:w-1/4 mt-4 lg:mt-0'>
                    {sideBar}
                </div>
            </div>
        </GlobalModal>
    );
};

export default MediaModal;
