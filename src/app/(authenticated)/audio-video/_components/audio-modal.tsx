'use client';

import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    ChevronLeft,
    Play,
    Pause,
    ThumbsUp,
    ThumbsDown,
    MoreVertical,
    FileText,
    ClipboardList,
    Users,
    BarChart4,
} from 'lucide-react';

interface AudioModalProps {
    isOpen: boolean;
    onClose: () => void;
    audioUrl: string;
    title: string;
    instructor: {
        name: string;
        avatar: string;
        role: string;
    };
    date: string;
    onPrevious?: () => void;
    onNext?: () => void;
}

export function AudioModal({
    isOpen,
    onClose,
    audioUrl,
    title,
    instructor,
    date,
    onPrevious,
    onNext,
}: AudioModalProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [playbackRate, setPlaybackRate] = useState(1);
    const audioRef = useRef<HTMLAudioElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Toggle play/pause
    const togglePlayPause = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    // Toggle playback rate
    const togglePlaybackRate = () => {
        const newRate = playbackRate === 1 ? 2 : 1;
        setPlaybackRate(newRate);
        if (audioRef.current) {
            audioRef.current.playbackRate = newRate;
        }
    };

    // Format time in MM:SS
    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    // Handle audio events
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) {
            return;
        }

        const handleLoadedMetadata = () => {
            setDuration(audio.duration);
        };

        const handleTimeUpdate = () => {
            setCurrentTime(audio.currentTime);
        };

        const handleEnded = () => {
            setIsPlaying(false);
            setCurrentTime(0);
        };

        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('ended', handleEnded);
        };
    }, []);

    // Draw waveform visualization
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) {
            return;
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            return;
        }

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Set styles
        ctx.lineWidth = 1.5;

        const centerY = canvas.height / 2;
        const totalPoints = 100;
        const pointSpacing = canvas.width / totalPoints;

        // Generate zigzag pattern points
        const points = [];
        for (let i = 0; i <= totalPoints; i++) {
            const x = i * pointSpacing;

            // Create a more natural-looking waveform with varying amplitudes
            // Using sine waves with different frequencies for a more organic look
            const amplitude =
                Math.sin(i * 0.1) * 10 +
                Math.sin(i * 0.05) * 15 +
                Math.random() * 5;
            const y = centerY + amplitude;

            points.push({ x, y });
        }

        // Calculate progress position based on current time
        const progress = currentTime / duration;
        const progressPosition = canvas.width * progress;

        // Draw the played portion (blue line)
        ctx.beginPath();
        ctx.strokeStyle = '#3b4eff';
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';

        for (let i = 0; i < points.length; i++) {
            const point = points[i];
            if (point.x > progressPosition) {
                break;
            }

            if (i === 0) {
                ctx.moveTo(point.x, point.y);
            } else {
                ctx.lineTo(point.x, point.y);
            }
        }
        ctx.stroke();

        // Draw the unplayed portion (light blue/gray line)
        ctx.beginPath();
        ctx.strokeStyle = '#e6ebfa';

        let startedUnplayed = false;
        for (let i = 0; i < points.length; i++) {
            const point = points[i];
            if (point.x <= progressPosition) {
                continue;
            }

            if (!startedUnplayed) {
                // Find the exact point at the progress position by interpolating
                if (i > 0) {
                    const prevPoint = points[i - 1];
                    const ratio =
                        (progressPosition - prevPoint.x) /
                        (point.x - prevPoint.x);
                    const y = prevPoint.y + ratio * (point.y - prevPoint.y);
                    ctx.moveTo(progressPosition, y);
                } else {
                    ctx.moveTo(point.x, point.y);
                }
                startedUnplayed = true;
            } else {
                ctx.lineTo(point.x, point.y);
            }
        }
        ctx.stroke();
    }, [currentTime, duration]);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className='max-w-3xl p-0 overflow-hidden bg-white'>
                <div className='flex items-center justify-between p-4 border-b'>
                    <div className='flex items-center gap-2'>
                        <ChevronLeft className='w-5 h-5' />
                        <DialogTitle className='text-base font-medium'>
                            Videos Details
                        </DialogTitle>
                    </div>
                    <div className='flex items-center gap-2'>
                        <Button
                            variant='outline'
                            size='sm'
                            className='text-xs'
                            onClick={onPrevious}
                            disabled={!onPrevious}
                        >
                            ← Previous
                        </Button>
                        <Button
                            variant='outline'
                            size='sm'
                            className='text-xs'
                            onClick={onNext}
                            disabled={!onNext}
                        >
                            Next →
                        </Button>
                    </div>
                </div>

                <div className='p-6'>
                    <div className='relative mb-6 bg-[#f5f5f5] rounded-md p-4'>
                        <div className='flex items-center gap-4 mb-4'>
                            <button
                                onClick={togglePlayPause}
                                className='flex items-center justify-center w-16 h-16 text-white bg-[#3b4eff] rounded-full'
                            >
                                {isPlaying ? (
                                    <Pause className='w-8 h-8' />
                                ) : (
                                    <Play className='w-8 h-8 ml-1' />
                                )}
                            </button>

                            <div className='flex-1'>
                                <canvas
                                    ref={canvasRef}
                                    width={600}
                                    height={80}
                                    className='w-full h-20'
                                />
                            </div>

                            <div className='flex flex-col items-center'>
                                <div className='text-2xl font-bold'>
                                    {formatTime(currentTime)}
                                </div>
                                <button
                                    onClick={togglePlaybackRate}
                                    className='flex items-center justify-center w-10 h-10 mt-2 text-sm font-medium border rounded-full'
                                >
                                    {playbackRate}x
                                </button>
                            </div>
                        </div>

                        <audio
                            ref={audioRef}
                            src={audioUrl}
                            className='hidden'
                        />
                    </div>

                    <div className='mb-6'>
                        <h2 className='text-xl font-bold'>{title}</h2>
                        <div className='flex items-center gap-3 mt-2'>
                            <Avatar className='w-8 h-8 border'>
                                <AvatarImage
                                    src={instructor.avatar}
                                    alt={instructor.name}
                                />
                                <AvatarFallback>
                                    {instructor.name.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <div className='text-sm'>
                                <div className='font-medium'>
                                    {instructor.name}
                                </div>
                                <div className='text-[#676b71]'>
                                    {instructor.role}
                                </div>
                            </div>
                            <div className='ml-4 text-sm text-[#676b71]'>
                                {date}
                            </div>
                        </div>
                    </div>

                    <div className='mb-6'>
                        <h3 className='mb-2 text-sm font-semibold'>
                            Description
                        </h3>
                        <p className='text-sm text-[#5c5958]'>
                            Lorem ipsum is simply dummy text of the printing and
                            typesetting industry. Lorem Ipsum has been the
                            industry&apos;s standard dummy text ever since the
                            1500s, when an unknown printer took a galley of type
                            and scrambled it to make a type specimen book.
                        </p>
                    </div>

                    <div className='mb-6'>
                        <h3 className='mb-2 text-sm font-semibold'>
                            Resources
                        </h3>
                        <Tabs defaultValue='summary'>
                            <TabsList className='grid w-full grid-cols-4 h-9'>
                                <TabsTrigger
                                    value='summary'
                                    className='text-xs'
                                >
                                    <FileText className='w-4 h-4 mr-1' />{' '}
                                    Summary
                                </TabsTrigger>
                                <TabsTrigger
                                    value='assessments'
                                    className='text-xs'
                                >
                                    <ClipboardList className='w-4 h-4 mr-1' />{' '}
                                    Assessments
                                </TabsTrigger>
                                <TabsTrigger
                                    value='interview'
                                    className='text-xs'
                                >
                                    <Users className='w-4 h-4 mr-1' /> Interview
                                </TabsTrigger>
                                <TabsTrigger
                                    value='behavioral'
                                    className='text-xs'
                                >
                                    <BarChart4 className='w-4 h-4 mr-1' />{' '}
                                    Behavioral
                                </TabsTrigger>
                            </TabsList>
                            <TabsContent value='summary' className='pt-4'>
                                <p className='text-sm text-[#5c5958]'>
                                    Lorem ipsum is simply dummy text of the
                                    printing and typesetting industry. Lorem
                                    Ipsum has been the industry&apos;s standard
                                    dummy text ever since the 1500s, when an
                                    unknown printer took a galley of type and
                                    scrambled it to make a type specimen book.
                                </p>
                            </TabsContent>
                            <TabsContent value='assessments' className='pt-4'>
                                <p className='text-sm text-[#5c5958]'>
                                    Assessment content goes here.
                                </p>
                            </TabsContent>
                            <TabsContent value='interview' className='pt-4'>
                                <p className='text-sm text-[#5c5958]'>
                                    Interview content goes here.
                                </p>
                            </TabsContent>
                            <TabsContent value='behavioral' className='pt-4'>
                                <p className='text-sm text-[#5c5958]'>
                                    Behavioral content goes here.
                                </p>
                            </TabsContent>
                        </Tabs>
                    </div>

                    <div>
                        <div className='flex items-center justify-between mb-4'>
                            <h3 className='text-sm font-semibold'>
                                Comments (16)
                            </h3>
                        </div>

                        <div className='space-y-4'>
                            <div className='p-3 border rounded-md'>
                                <div className='flex items-start justify-between'>
                                    <div className='flex items-start gap-3'>
                                        <Avatar className='w-8 h-8 border'>
                                            <AvatarImage
                                                src='/placeholder.svg?height=32&width=32'
                                                alt='John Doe'
                                            />
                                            <AvatarFallback>JD</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className='flex items-center gap-2'>
                                                <span className='text-sm font-medium'>
                                                    John Doe
                                                </span>
                                                <span className='text-xs text-[#676b71]'>
                                                    10:30 PM
                                                </span>
                                            </div>
                                            <p className='mt-1 text-sm text-[#5c5958]'>
                                                Lorem ipsum is simply dummy text
                                                of the printing and typesetting
                                                industry.
                                                <br />
                                                How are you? I hope you are
                                                doing well!
                                            </p>
                                            <div className='flex items-center gap-3 mt-2'>
                                                <button className='flex items-center gap-1 text-xs text-[#676b71]'>
                                                    Replies 2
                                                </button>
                                                <button className='flex items-center gap-1 text-xs text-[#676b71]'>
                                                    <ThumbsUp className='w-3 h-3' />{' '}
                                                    20
                                                </button>
                                                <button className='flex items-center gap-1 text-xs text-[#676b71]'>
                                                    <ThumbsDown className='w-3 h-3' />{' '}
                                                    5
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <button>
                                        <MoreVertical className='w-4 h-4 text-[#676b71]' />
                                    </button>
                                </div>
                            </div>

                            <div className='p-3 border rounded-md'>
                                <div className='flex items-start justify-between'>
                                    <div className='flex items-start gap-3'>
                                        <Avatar className='w-8 h-8 border'>
                                            <AvatarImage
                                                src='/placeholder.svg?height=32&width=32'
                                                alt='Brooklyn Simmons'
                                            />
                                            <AvatarFallback>BS</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className='flex items-center gap-2'>
                                                <span className='text-sm font-medium'>
                                                    Brooklyn Simmons
                                                </span>
                                                <span className='text-xs text-[#676b71]'>
                                                    9:00 PM
                                                </span>
                                            </div>
                                            <p className='mt-1 text-sm text-[#5c5958]'>
                                                Excellent! I really appreciate
                                                you.
                                            </p>
                                            <div className='flex items-center gap-3 mt-2'>
                                                <button className='flex items-center gap-1 text-xs text-[#676b71]'>
                                                    Reply
                                                </button>
                                                <button className='flex items-center gap-1 text-xs text-[#676b71]'>
                                                    <ThumbsUp className='w-3 h-3' />{' '}
                                                    20
                                                </button>
                                                <button className='flex items-center gap-1 text-xs text-[#676b71]'>
                                                    <ThumbsDown className='w-3 h-3' />{' '}
                                                    5
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <button>
                                        <MoreVertical className='w-4 h-4 text-[#676b71]' />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
