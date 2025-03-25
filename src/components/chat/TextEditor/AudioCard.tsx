'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { Play, Pause, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { Button } from '@/components/ui/button';

// Initialize dayjs duration plugin
dayjs.extend(duration);

interface AudioCardProps {
    audioUrl: string;
}

const formatTime = (time: number): string => {
    return dayjs.duration(time, 'seconds').format('mm:ss');
};

const AudioCard = ({ audioUrl }: AudioCardProps) => {
    const [waveform, setWaveForm] = useState<WaveSurfer | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentPlaybackTime, setCurrentPlaybackTime] = useState(0);
    const [totalDuration, setTotalDuration] = useState(0);
    const [remainingTime, setRemainingTime] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const waveFormRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!waveFormRef?.current) {
            return;
        }

        const wavesurfer = WaveSurfer.create({
            container: waveFormRef.current,
            waveColor: '#dbdada',
            progressColor: '#5C5958',
            cursorColor: 'transparent',
            barWidth: 2,
            height: 30,
            barHeight: 6,
        });

        setWaveForm(wavesurfer);

        wavesurfer.on('ready', () => {
            setRemainingTime(wavesurfer.getDuration());
            setTotalDuration(wavesurfer.getDuration());
            setIsLoading(false);
        });

        wavesurfer.on('audioprocess', (time: number) => {
            setCurrentPlaybackTime(time);

            // Calculate remaining time
            if (totalDuration > time) {
                const remainingTimeInSeconds = totalDuration - time;
                setRemainingTime(remainingTimeInSeconds);
            }
        });

        wavesurfer.on('finish', () => {
            setIsPlaying(false);
        });

        wavesurfer.on('error', (error: any) => {
            toast.error('Error loading audio file');
            setIsLoading(false);
        });

        if (audioUrl) {
            wavesurfer.load(audioUrl).catch((error: any) => {
                console.error('Error loading audio:', error);
                toast.error('Failed to load audio');
                setIsLoading(false);
            });
        }

        return () => {
            wavesurfer?.destroy();
        };
    }, [audioUrl, totalDuration]);

    const handlePlayPause = useCallback(() => {
        if (waveform) {
            if (isPlaying) {
                waveform.pause();
            } else {
                waveform.play();
            }
            setIsPlaying(!isPlaying);
        }
    }, [waveform, isPlaying]);

    return (
        <div className='w-full'>
            <div className='flex items-center p-2 rounded-full bg-white'>
                <Button
                    onClick={handlePlayPause}
                    className='mr-3 h-7 w-7 rounded-full disabled:opacity-50'
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                    disabled={isLoading || !audioUrl}
                >
                    {isLoading ? (
                        <Loader2
                            size={17}
                            className='animate-spin text-white'
                        />
                    ) : isPlaying ? (
                        <Pause size={17} className='cursor-pointer' />
                    ) : (
                        <Play size={17} className='cursor-pointer' />
                    )}
                </Button>

                <div
                    ref={waveFormRef}
                    className={cn(
                        'flex-grow mr-4 max-w-[200px] w-full',
                        (!audioUrl || isLoading) && 'opacity-50',
                    )}
                />

                <span className='text-xs text-primary'>
                    {formatTime(remainingTime)}
                </span>
            </div>
        </div>
    );
};

export default AudioCard;
