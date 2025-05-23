'use client';

import type React from 'react';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    ArrowLeft,
    ArrowRight,
    Calendar,
    Clock,
    Eye,
    FileText,
    LayoutDashboard,
    MessageCircle,
    MonitorPlayIcon as TvMinimalPlay,
    Pin,
    Play,
    Share,
    Volume2,
    Gauge,
    ChevronDown,
} from 'lucide-react';
import Image from 'next/image';
import { formatDateToCustomString } from '@/lib/formatDateToCustomString';
import { cn } from '@/lib/utils';
import { useMyAudioVideoQuery } from '@/redux/api/audio-video/audioVideos';
import GlobalModal from '@/components/global/GlobalModal';
import GlobalComment from '@/components/global/GlobalComments/GlobalComment';
import { toast } from 'sonner';
import { renderPlainText } from '@/components/lexicalEditor/renderer/renderPlainText';
import NewAddNote from '../../program/[slug]/_components/NewAddNote';

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
    mediaType?: 'video' | 'audio';
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
};

const MediaModal = ({ showModal, setShowModal, media }: TMediaModalProps) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [resourceTab, setResourceTab] = useState('Summary');
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [currentMedia, setCurrentMedia] = useState<TMediaItem>(media);
    const [visibleItems, setVisibleItems] = useState(10); // Number of items to show initially
    const videoRef = useRef<HTMLVideoElement>(null);
    // Fetch related videos
    const { data, isLoading } = useMyAudioVideoQuery({});
    const relatedVideos = data?.medias || [];
    // Update current media when media prop changes
    console.log({ relatedVideos });
    useEffect(() => {
        setCurrentMedia(media);
    }, [media]);

    // Handle video playback
    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    // Handle time update
    const handleTimeUpdate = () => {
        if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime);
        }
    };

    // Handle video loaded metadata
    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            setDuration(videoRef.current.duration);
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
        if (videoRef.current) {
            videoRef.current.currentTime = newTime;
        }
    };

    // Handle volume change
    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = Number.parseFloat(e.target.value);
        setVolume(newVolume);
        if (videoRef.current) {
            videoRef.current.volume = newVolume;
        }
    };

    // Handle next/previous video
    const handleNextVideo = () => {
        const currentIndex = relatedVideos.findIndex(
            (v: any) => v._id === currentMedia._id,
        );
        if (currentIndex < relatedVideos.length - 1) {
            setCurrentMedia(relatedVideos[currentIndex + 1]);
        }
    };

    const handlePreviousVideo = () => {
        const currentIndex = relatedVideos.findIndex(
            (v: any) => v._id === currentMedia._id,
        );
        if (currentIndex > 0) {
            setCurrentMedia(relatedVideos[currentIndex - 1]);
        }
    };

    // Function to load more items
    const loadMoreItems = () => {
        setVisibleItems((prev) => prev + 10);
    };

    // Filter videos by current media type
    const filteredVideos = relatedVideos.filter(
        (relatedMedia: any) =>
            relatedMedia.mediaType === currentMedia?.mediaType,
    );

    // Check if next/previous buttons should be disabled
    const isNextDisabled =
        relatedVideos.findIndex((v: any) => v._id === currentMedia._id) ===
        relatedVideos.length - 1;
    const isPreviousDisabled =
        relatedVideos.findIndex((v: any) => v._id === currentMedia._id) === 0;

    // Custom footer with related videos
    const sideBar = (
        <div className='p-2 flex flex-col bg-background rounded-lg border fixed top-[73px] h-[calc(100vh-80px)]'>
            <h3 className='font-semibold mb-2 pb-2 border-b'>
                {currentMedia?.mediaType === 'audio'
                    ? 'Upcoming Audio'
                    : 'Upcoming Videos'}
            </h3>
            <div className='space-y-4 overflow-y-auto'>
                {filteredVideos
                    .slice(0, visibleItems)
                    .map((relatedMedia: any) => (
                        <div
                            key={relatedMedia._id}
                            className={`flex lg:flex-col xl:flex-row gap-3 cursor-pointer bg-foreground p-2 rounded-md ${
                                relatedMedia._id === currentMedia._id
                                    ? 'bg-primary'
                                    : ''
                            }`}
                            onClick={() => setCurrentMedia(relatedMedia)}
                        >
                            <div className='relative w-24 h-16 sm:w-32 sm:h-24 rounded-lg flex-shrink-0 bg-background border shadow-md'>
                                <div className='absolute top-1 left-1 z-10'>
                                    <div className='flex items-center gap-1 bg-foreground px-1 py-0.5 rounded-md text-[10px] shadow-sm'>
                                        <TvMinimalPlay className='h-3 w-3 text-primary-white' />
                                        <span className='text-[10px] font-medium text-primary-white'>
                                            Videos
                                        </span>
                                    </div>
                                </div>
                                <div className='absolute top-1 right-1 z-10'>
                                    <div className='flex items-center gap-1 bg-black/80 px-1 py-0.5 rounded-md text-[10px]'>
                                        <Clock className='h-2 w-2 text-white' />
                                        <span className='text-[10px] font-medium text-white'>
                                            {relatedMedia.duration || '05:30'}
                                        </span>
                                    </div>
                                </div>
                                <Image
                                    src={
                                        relatedMedia.thumbnail || '/avatar.png'
                                    }
                                    alt={relatedMedia.title}
                                    fill
                                    className='object-cover rounded-md'
                                />
                            </div>
                            <div className='flex-1 min-w-0'>
                                <div
                                    className={`flex items-center gap-1 text-xs ${
                                        relatedMedia._id === currentMedia._id
                                            ? 'text-pure-white/90'
                                            : 'text-primary-white'
                                    } mb-1`}
                                >
                                    <Calendar className='h-3 w-3' />
                                    <span>
                                        {formatDateToCustomString(
                                            relatedMedia.createdAt,
                                        )}
                                    </span>
                                </div>
                                <h4
                                    className={`text-sm text-wrap font-medium line-clamp-1 truncate capitalize mb-1 ${
                                        relatedMedia._id === currentMedia._id
                                            ? 'text-pure-white'
                                            : 'text-primary-white'
                                    }`}
                                >
                                    {relatedMedia.title}
                                </h4>
                                <div className='flex items-center gap-1'>
                                    <div className='relative h-6 w-6'>
                                        <Image
                                            src={
                                                relatedMedia.createdBy
                                                    ?.profilePicture ||
                                                '/avatar.png'
                                            }
                                            alt={
                                                relatedMedia.createdBy
                                                    ?.fullName || 'Instructor'
                                            }
                                            className='rounded-full object-cover'
                                            fill
                                        />
                                    </div>
                                    <div>
                                        <p
                                            className={`text-sm font-medium leading-none ${
                                                relatedMedia._id ===
                                                currentMedia._id
                                                    ? 'text-pure-white'
                                                    : 'text-primary-white'
                                            }`}
                                        >
                                            {relatedMedia.createdBy?.fullName}
                                        </p>
                                        <p
                                            className={`text-xs leading-none ${
                                                relatedMedia._id ===
                                                currentMedia._id
                                                    ? 'text-pure-white'
                                                    : 'text-primary-white'
                                            }`}
                                        >
                                            {relatedMedia.createdBy?.role ||
                                                'Instructor'}
                                        </p>
                                    </div>
                                </div>
                                <div className='mt-1 pt-1 border-t'>
                                    <Button
                                        variant='primary_light'
                                        size='sm'
                                        className='h-6 text-xs px-2 text-primary w-full'
                                    >
                                        <Eye className='h-3 w-3 mr-1' />
                                        View
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}

                {/* Load More Button - only show if there are more items to load */}
                {visibleItems < filteredVideos.length && (
                    <div className='flex justify-center pt-2'>
                        <Button
                            variant='secondary'
                            size='sm'
                            onClick={loadMoreItems}
                            className='w-full flex items-center justify-center'
                        >
                            Load More <ChevronDown className='ml-1 h-4 w-4' />
                        </Button>
                    </div>
                )}

                {/* Show count message */}
                <div className='text-xs text-center text-muted-foreground pt-1'>
                    Showing {Math.min(visibleItems, filteredVideos.length)} of{' '}
                    {filteredVideos.length} videos
                </div>
            </div>
        </div>
    );

    // Custom title with navigation
    const customTitle = (
        <div className='flex items-center justify-between border-b border-forground-border px-5 py-3 pb-2 sticky top-0 rounded-tr-lg rounded-tl-lg'>
            <div className='flex items-center gap-2'>
                <Button variant='ghost' size='icon' className='h-8 w-8'>
                    <ArrowLeft className='h-5 w-5' />
                </Button>
                <div>
                    <h3 className='text-black font-medium text-lg'>
                        {currentMedia?.mediaType === 'video'
                            ? 'Video Details'
                            : 'Audio Details'}
                    </h3>
                    <p className='text-xs text-gray'>
                        Explore the details of this{' '}
                        {currentMedia?.mediaType === 'video'
                            ? 'video'
                            : 'audio'}
                    </p>
                </div>
            </div>
            {/* Navigation buttons */}
            <div className='flex items-center gap-2'>
                {!isPreviousDisabled && (
                    <Button
                        variant='outline'
                        size='sm'
                        className='text-xs h-8 hidden sm:flex'
                        onClick={handlePreviousVideo}
                    >
                        <ArrowLeft className='h-3 w-3 mr-1' /> Previous
                    </Button>
                )}
                {!isNextDisabled && (
                    <Button
                        variant='outline'
                        size='sm'
                        className='text-xs h-8 hidden sm:flex'
                        onClick={handleNextVideo}
                    >
                        Next <ArrowRight className='h-3 w-3 ml-1' />
                    </Button>
                )}
            </div>
        </div>
    );

    const isValidUrl = (url: string) => {
        try {
            new URL(url);
            // Additional checks for common video platforms
            return (
                url.match(
                    /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|vimeo\.com|player\.vimeo\.com|wistia\.com|fast\.wistia\.net|sproutvideo\.com|vidyard\.com|loom\.com|streamable\.com|dailymotion\.com|dai\.ly|facebook\.com|fb\.watch)/i,
                ) !== null
            );
        } catch (e) {
            return false;
        }
    };
    return (
        <GlobalModal
            open={showModal}
            setOpen={setShowModal}
            customTitle={customTitle}
            className='flex flex-col p-0'
            fullScreen={true}
            allowFullScreen={true}
        >
            <div className='flex flex-col lg:flex-row gap-3 w-full'>
                <div className='flex flex-col w-full lg:w-3/4 h-full bg-background rounded-lg border mt-2'>
                    {/* Media Player */}
                    {currentMedia?.mediaType === 'video' ? (
                        /* Video Player */
                        <div className='p-2'>
                            {currentMedia.url ? (
                                isValidUrl(currentMedia.url) ? (
                                    <></>
                                ) : (
                                    <div className='aspect-video w-full rounded-lg flex items-center justify-center bg-gray-900'>
                                        <div className='text-center p-4'>
                                            <div className='mb-4'>
                                                <FileText className='h-12 w-12 mx-auto text-gray-400' />
                                            </div>
                                            <h3 className='text-white font-medium'>
                                                Invalid Video URL
                                            </h3>
                                            <p className='text-gray-400 text-sm mt-2'>
                                                The video URL is invalid or
                                                cannot be displayed
                                            </p>
                                        </div>
                                    </div>
                                )
                            ) : (
                                <div className='w-full h-full flex items-center justify-center bg-gray-900 rounded-lg'>
                                    <Image
                                        src={
                                            currentMedia.thumbnail ||
                                            '/avatar.png'
                                        }
                                        alt={currentMedia.title}
                                        fill
                                        className='object-cover opacity-60 rounded-lg'
                                    />
                                    <div className='absolute inset-0 bg-black/40' />
                                </div>
                            )}
                        </div>
                    ) : (
                        /* Audio Player - styled like the image */
                        <div className='relative bg-gray-600 rounded-lg p-6'>
                            <div className='flex flex-col space-y-4'>
                                {/* Waveform visualization + controls */}
                                <div className='flex items-center space-x-4'>
                                    <Button
                                        variant='ghost'
                                        size='icon'
                                        className='h-12 w-12 text-white'
                                        onClick={togglePlay}
                                    >
                                        {isPlaying ? (
                                            <div className='h-6 w-6 flex items-center justify-center'>
                                                <div className='h-4 w-4 bg-foreground' />
                                            </div>
                                        ) : (
                                            <Play className='h-6 w-6 ml-1' />
                                        )}
                                    </Button>

                                    <div className='relative w-full h-16'>
                                        {/* Audio waveform visualization */}
                                        <svg
                                            className='w-full h-16'
                                            viewBox='0 0 600 100'
                                        >
                                            {/* Dynamically generated waveform bars */}
                                            {Array.from({ length: 50 }).map(
                                                (_, i) => {
                                                    const height =
                                                        Math.random() * 60 + 20;
                                                    return (
                                                        <rect
                                                            key={i}
                                                            x={i * 12}
                                                            y={
                                                                (100 - height) /
                                                                2
                                                            }
                                                            width={4}
                                                            height={height}
                                                            fill='#ffffff'
                                                        />
                                                    );
                                                },
                                            )}
                                        </svg>

                                        {/* Playhead indicator */}
                                        <div
                                            className='absolute top-0 left-0 h-full w-2 bg-white/30 rounded-full'
                                            style={{
                                                left: `${(currentTime / (duration || 1)) * 100}%`,
                                            }}
                                        />
                                    </div>
                                    <div className='flex flex-col items-center gap-1'>
                                        <div className='text-pure-white font-medium'>
                                            {formatTime(duration || 0)}
                                        </div>

                                        <div className='bg-foreground rounded-full px-2 py-1 flex items-center space-x-1'>
                                            <Gauge className='h-4 w-4 text-gray' />
                                            <span className='text-dark-gray font-medium'>
                                                2x
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Audio element */}
                            <audio
                                ref={videoRef}
                                src={currentMedia.url}
                                className='hidden'
                                onTimeUpdate={handleTimeUpdate}
                                onLoadedMetadata={handleLoadedMetadata}
                            />
                        </div>
                    )}

                    {/* Video Info */}
                    <div className='p-4 border-b'>
                        <div className='flex items-center justify-between'>
                            <h2 className='text-xl font-bold'>
                                {currentMedia.title}
                            </h2>
                            <div className='flex items-center gap-2'>
                                <Button
                                    variant='ghost'
                                    size='sm'
                                    className='gap-1 text-dark-gray'
                                    onClick={() => toast.info('Coming soon!')}
                                >
                                    <Pin className='h-4 w-4 rotate-45' />
                                    Pin
                                </Button>
                                <Button
                                    variant='ghost'
                                    size='sm'
                                    className='gap-1 text-dark-gray'
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
                                            '/avatar.png'
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
                                        {currentMedia.createdBy?.fullName}
                                    </p>
                                    <p className='text-xs text-gray'>
                                        {currentMedia.createdBy?.role ||
                                            'Instructor'}
                                    </p>
                                </div>
                            </div>
                            <div className='h-6 w-px bg-gray-300' />
                            <div className='flex items-center gap-1 text-sm text-gray'>
                                <Clock className='h-4 w-4' />
                                <span>
                                    {formatDateToCustomString(
                                        currentMedia.createdAt,
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className='border-b mt-2'>
                        <Tabs
                            defaultValue='overview'
                            value={activeTab}
                            onValueChange={setActiveTab}
                        >
                            <div className='flex items-center justify-between px-4'>
                                <TabsList className='bg-transparent border-b p-0 rounded-none'>
                                    <TabsTrigger
                                        value='overview'
                                        className={cn(
                                            'data-[state=active]:border-b-2 data-[state=active]:border-primary-white data-[state=active]:shadow-none rounded-none px-4 py-2',
                                            'data-[state=inactive]:bg-transparent data-[state=active]:bg-transparent data-[state=inactive]:text-gray data-[state=active]:text-primary-white',
                                        )}
                                    >
                                        <LayoutDashboard className='h-4 w-4 mr-2' />
                                        Overview
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value='notes'
                                        className={cn(
                                            'data-[state=active]:border-b-2 data-[state=active]:border-primary-white data-[state=active]:shadow-none rounded-none px-4 py-2',
                                            'data-[state=inactive]:bg-transparent data-[state=active]:bg-transparent data-[state=inactive]:text-gray data-[state=active]:text-primary-white',
                                        )}
                                    >
                                        <FileText className='h-4 w-4 mr-2' />
                                        Add Notes
                                    </TabsTrigger>
                                </TabsList>
                            </div>

                            <TabsContent value='overview' className='p-4 mt-0'>
                                <div className='space-y-4'>
                                    <div className='bg-foreground rounded-lg p-2'>
                                        <h3 className='text-lg font-medium mb-2'>
                                            Description
                                        </h3>
                                        <p className='text-sm text-gray'>
                                            {renderPlainText({
                                                text: currentMedia.description as string,
                                                textColor: 'text-gray',
                                                truncate: true,
                                            }) ||
                                                'Bootcamp is an all-in-one SaaS platform designed for high-ticket coaches and educators. It empowers you to launch, manage, and scale premium boot camps without relying on fragmented tools like Udemy or Skillshare.'}
                                        </p>
                                    </div>

                                    <div className='bg-foreground p-2 rounded-lg'>
                                        <h3 className='text-lg font-medium mb-2'>
                                            Resources
                                        </h3>
                                        <div className=''>
                                            {currentMedia.behavioral ||
                                                currentMedia.interview ||
                                                currentMedia.implementation ||
                                                (currentMedia.summary && (
                                                    <div className='tab-wrapper flex border-b mb-4 overflow-x-auto bg-primary-light rounded-full w-fit p-1'>
                                                        {currentMedia.summary && (
                                                            <button
                                                                onClick={() =>
                                                                    setResourceTab(
                                                                        'Summary',
                                                                    )
                                                                }
                                                                className={`tab px-4 py-2 ${
                                                                    resourceTab ===
                                                                    'Summary'
                                                                        ? 'bg-primary rounded-full text-pure-white font-medium'
                                                                        : 'text-primary-white'
                                                                }`}
                                                            >
                                                                Summary
                                                            </button>
                                                        )}
                                                        {currentMedia.implementation && (
                                                            <button
                                                                onClick={() =>
                                                                    setResourceTab(
                                                                        'Implementation',
                                                                    )
                                                                }
                                                                className={`tab px-4 py-2 ${
                                                                    resourceTab ===
                                                                    'Implementation'
                                                                        ? 'bg-primary rounded-full text-pure-white font-medium'
                                                                        : 'text-primary-white'
                                                                }`}
                                                            >
                                                                Implementation
                                                            </button>
                                                        )}
                                                        {currentMedia.interview && (
                                                            <button
                                                                onClick={() =>
                                                                    setResourceTab(
                                                                        'Interview',
                                                                    )
                                                                }
                                                                className={`tab px-4 py-2 ${
                                                                    resourceTab ===
                                                                    'Interview'
                                                                        ? 'bg-primary rounded-full text-pure-white font-medium'
                                                                        : 'text-primary-white'
                                                                }`}
                                                            >
                                                                Interview
                                                            </button>
                                                        )}
                                                        {currentMedia.behavioral && (
                                                            <button
                                                                onClick={() =>
                                                                    setResourceTab(
                                                                        'Behavioral',
                                                                    )
                                                                }
                                                                className={`tab px-4 py-2 ${
                                                                    resourceTab ===
                                                                    'Behavioral'
                                                                        ? 'bg-primary rounded-full text-pure-white font-medium'
                                                                        : 'text-primary-white'
                                                                }`}
                                                            >
                                                                Behavioral
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}

                                            <div className='activeBody'>
                                                {resourceTab === 'Summary' && (
                                                    <div>
                                                        <p className='text-sm text-gray'>
                                                            {currentMedia.summary ||
                                                                'No summary available for this content.'}
                                                        </p>
                                                    </div>
                                                )}
                                                {resourceTab ===
                                                    'Implementation' && (
                                                    <div>
                                                        <p className='text-sm text-gray'>
                                                            {currentMedia.implementation ||
                                                                'No implementation details available for this content.'}
                                                        </p>
                                                    </div>
                                                )}
                                                {resourceTab ===
                                                    'Interview' && (
                                                    <div>
                                                        <p className='text-sm text-gray'>
                                                            {currentMedia.interview ||
                                                                'No interview information available for this content.'}
                                                        </p>
                                                    </div>
                                                )}
                                                {resourceTab ===
                                                    'Behavioral' && (
                                                    <div>
                                                        <p className='text-sm text-gray'>
                                                            {currentMedia.behavioral ||
                                                                'No behavioral information available for this content.'}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Comments */}
                                    <div>
                                        <GlobalComment
                                            contentId={currentMedia._id || ''}
                                            bgColor='foreground'
                                        />
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value='notes' className='p-4 mt-0'>
                                <NewAddNote contentId={currentMedia?._id} />
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
                <div className='sidebar w-full h-full lg:w-1/4 mt-2'>
                    {sideBar}
                </div>
            </div>
        </GlobalModal>
    );
};

export default MediaModal;
