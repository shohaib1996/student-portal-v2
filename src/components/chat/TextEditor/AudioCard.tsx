'use client';

import type React from 'react';
import { useEffect, useRef, useState, useCallback } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { Play, Pause, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AudioCardProps {
    audioUrl: string;
}

const formatTime = (time: number): string => {
    return new Date(time * 1000).toISOString().substr(14, 5);
};

const AudioCard: React.FC<AudioCardProps> = ({ audioUrl }) => {
    const [waveform, setWaveForm] = useState<WaveSurfer | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentPlaybackTime, setCurrentPlaybackTime] = useState(0);
    const [totalDuration, setTotalDuration] = useState(0);
    const [remainingTime, setRemainingTime] = useState(0);
    const waveFormRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!waveFormRef.current) {
            return;
        }

        const wavesurfer = WaveSurfer.create({
            container: waveFormRef.current,
            waveColor: '#dbdada',
            progressColor: 'white',
            cursorColor: 'white',
            barWidth: 2,
            height: 25,
            barHeight: 3,
            // responsive: true,
        });

        setWaveForm(wavesurfer);

        wavesurfer.on('ready', () => {
            setRemainingTime(wavesurfer.getDuration());
            setTotalDuration(wavesurfer.getDuration());
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

        if (audioUrl) {
            wavesurfer.load(audioUrl).catch((error: any) => {
                console.error('Error loading audio:', error);
            });
        }

        return () => {
            wavesurfer.destroy();
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
            <div className='flex items-center px-4 py-2 rounded-full bg-primary/90'>
                <button
                    onClick={handlePlayPause}
                    className='mr-3 text-primary-foreground focus:outline-none'
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                    {isPlaying ? (
                        <Pause size={17} className='cursor-pointer' />
                    ) : (
                        <Play size={17} className='cursor-pointer' />
                    )}
                </button>

                {!audioUrl && (
                    <Loader2
                        size={15}
                        className='text-destructive animate-spin'
                    />
                )}

                <div
                    ref={waveFormRef}
                    className={cn('flex-grow mr-4', !audioUrl && 'opacity-50')}
                />

                <span className='text-xs text-primary-foreground'>
                    {formatTime(remainingTime)}
                </span>
            </div>
        </div>
    );
};

export default AudioCard;
