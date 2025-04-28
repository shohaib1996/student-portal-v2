'use client';

import type React from 'react';
import { useEffect, useRef, useState, useCallback } from 'react';
import WaveSurfer from 'wavesurfer.js';
import {
    Play,
    Pause,
    Square,
    Trash,
    Send,
    Mic,
    CircleStop,
} from 'lucide-react';
import { Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CaptureAudioProps {
    sendRenderedAudio: (audio: File) => void;
    setIsRecorderVisible: (visible: boolean) => void;
    isSendingAudio: boolean;
}

const formatTime = (time: number): string => {
    if (isNaN(time)) {
        return '00:00';
    }
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const CaptureAudio: React.FC<CaptureAudioProps> = ({
    sendRenderedAudio,
    setIsRecorderVisible,
    isSendingAudio,
}) => {
    const [isRecording, setIsRecording] = useState<boolean>(false);
    const [recordedAudio, setRecordedAudio] = useState<HTMLAudioElement | null>(
        null,
    );
    const [waveform, setWaveForm] = useState<WaveSurfer | null>(null);
    const [recordingDuration, setRecordingDuration] = useState<number>(0);
    const [currentPlaybackTime, setCurrentPlaybackTime] = useState<number>(0);
    const [totalDuration, setTotalDuration] = useState<number>(0);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [renderedAudio, setRenderedAudio] = useState<File | null>(null);

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const waveFormRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isRecording) {
            interval = setInterval(() => {
                setRecordingDuration((prevDuration) => {
                    setTotalDuration(prevDuration + 1);
                    return prevDuration + 1;
                });
            }, 1000);
        }

        return () => {
            clearInterval(interval);
        };
    }, [isRecording]);

    useEffect(() => {
        if (!waveFormRef.current) {
            return;
        }

        const wavesurfer = WaveSurfer.create({
            container: waveFormRef.current,
            waveColor: '#666',
            progressColor: '#22c55e', // Using Tailwind green-500 equivalent
            cursorColor: '#22c55e',
            barWidth: 1,
            height: 25,
            barHeight: 3,
            // responsive: true,
        });

        setWaveForm(wavesurfer);

        wavesurfer.on('finish', () => {
            setIsPlaying(false);
        });

        wavesurfer.on('audioprocess', (time) => {
            setCurrentPlaybackTime(time);
        });

        return () => {
            wavesurfer.destroy();
        };
    }, []);

    useEffect(() => {
        if (waveform) {
            handleStartRecording();
        }
    }, [waveform]);

    const handleStartRecording = useCallback(() => {
        setRecordingDuration(0);
        setCurrentPlaybackTime(0);
        setTotalDuration(0);
        setIsRecording(true);

        navigator.mediaDevices
            .getUserMedia({ audio: true })
            .then((stream) => {
                const mediaRecorder = new MediaRecorder(stream);
                mediaRecorderRef.current = mediaRecorder;
                if (audioRef.current) {
                    audioRef.current.srcObject = stream;
                }

                const chunks: BlobPart[] = [];
                mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
                mediaRecorder.onstop = () => {
                    const blob = new Blob(chunks, { type: 'audio/mp3' });
                    const audioUrl = URL.createObjectURL(blob);
                    const audio = new Audio(audioUrl);
                    setRecordedAudio(audio);
                    if (waveform) {
                        waveform.load(audioUrl);
                    }
                };
                mediaRecorder.start();
            })
            .catch((error) => {
                console.error(error);
            });
    }, [waveform]);

    const handleStopRecording = useCallback(() => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (waveform) {
                waveform.stop();
            }

            const audioChunks: BlobPart[] = [];
            mediaRecorderRef.current.addEventListener(
                'dataavailable',
                (event) => {
                    audioChunks.push(event.data);
                },
            );
            mediaRecorderRef.current.addEventListener('stop', () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/mp3' });
                const audioFile = new File([audioBlob], 'recording.mp3', {
                    type: 'audio/mp3',
                });
                setRenderedAudio(audioFile);
            });
        }
    }, [isRecording, waveform]);

    const handlePlayRecording = useCallback(() => {
        if (recordedAudio && waveform) {
            waveform.play();
            setIsPlaying(true);
        }
    }, [recordedAudio, waveform]);

    const handlePauseRecording = useCallback(() => {
        if (waveform) {
            setCurrentPlaybackTime(waveform.getCurrentTime());
            waveform.pause();
            setIsPlaying(false);
        }
    }, [waveform]);

    const sendRecording = useCallback(() => {
        if (renderedAudio) {
            sendRenderedAudio(renderedAudio);
        }
    }, [renderedAudio, sendRenderedAudio]);

    useEffect(() => {
        if (recordedAudio) {
            const updatePlaybackTime = () => {
                setCurrentPlaybackTime(recordedAudio.currentTime);
            };
            recordedAudio.addEventListener('timeupdate', updatePlaybackTime);
            return () => {
                recordedAudio.removeEventListener(
                    'timeupdate',
                    updatePlaybackTime,
                );
            };
        }
    }, [recordedAudio]);

    return (
        <div className='flex w-full items-center justify-center gap-2.5 py-2 px-4 bg-background'>
            {/* Recording indicator with pink pulse animation */}
            {isRecording && (
                <div className='min-w-[150px] flex items-center gap-2'>
                    <div className='h-3 w-3 relative flex items-center justify-center'>
                        <div className='h-3 w-3 rounded-full bg-danger'></div>
                        <div className='h-3 w-3 rounded-full bg-danger animate-ping absolute top-0.4 left-0.4'></div>
                    </div>
                    <span>{`Recording ${recordingDuration}s`}</span>
                </div>
            )}

            {/* Waveform container - Visible at all times */}
            <div className='w-full flex items-center justify-between gap-2 rounded-2xl'>
                {/* Current playback time */}
                <div className='text-xs text-gray flex gap-1.5 items-center'>
                    {recordedAudio &&
                        !isRecording &&
                        (isPlaying ? (
                            <Button
                                onClick={handlePauseRecording}
                                className='text-primary transition-colors bg-transparent hover:bg-transparent rounded-full shadow-none'
                                tooltip='Pause audio'
                            >
                                <Pause size={20} />
                                <span className='sr-only'>Pause</span>
                            </Button>
                        ) : (
                            <Button
                                onClick={handlePlayRecording}
                                className='text-primary transition-colors bg-transparent hover:bg-transparent rounded-full shadow-none'
                                tooltip='Play audio'
                            >
                                <Play size={20} />
                                <span className='sr-only'>Play</span>
                            </Button>
                        ))}
                    {recordedAudio &&
                        !isRecording &&
                        formatTime(currentPlaybackTime)}
                </div>

                <div
                    ref={waveFormRef}
                    className='w-full bg-background rounded-full px-4 py-2'
                ></div>

                {/* Total duration */}
                <div className='text-xs text-gray flex gap-1.5 items-center'>
                    {recordedAudio && !isRecording && formatTime(totalDuration)}
                    {!isRecording && recordedAudio && (
                        <Button
                            onClick={() => setIsRecorderVisible(false)}
                            variant={'destructive'}
                            className='text-danger bg-red-500/10 hover:bg-red-500/20 rounded-full h-9 w-9 transition-colors'
                            tooltip='Delete recording'
                        >
                            <Trash size={17} />
                            <span className='sr-only'>Delete recording</span>
                        </Button>
                    )}
                </div>
            </div>

            <audio ref={audioRef} />

            <div className='flex gap-2.5 items-center justify-between'>
                {!isRecording ? (
                    <>
                        <Button
                            className='h-10 min-h-10 w-10 min-w-10 bg-primary-light rounded-full border border-forground-border hover:bg-foreground  transition-colors'
                            onClick={handleStartRecording}
                            tooltip='Start recording'
                        >
                            <Mic size={20} className='text-gray' />
                            <span className='sr-only'>Start recording</span>
                        </Button>

                        {recordedAudio &&
                            !isRecording &&
                            (isSendingAudio ? (
                                <div className=' rounded-full h-10 min-h-10 w-10 min-w-10 bg-primary'>
                                    <Loader
                                        size={20}
                                        className='text-white animate-spin'
                                    />
                                </div>
                            ) : (
                                <Button
                                    className='rounded-full h-10 min-h-10 w-10 min-w-10'
                                    onClick={sendRecording}
                                    tooltip='Send Recording'
                                >
                                    <Send size={16} />
                                    <span className='sr-only'>
                                        Send recording
                                    </span>
                                </Button>
                            ))}
                    </>
                ) : (
                    <Button
                        variant={'destructive'}
                        className='rounded-full bg-red-500/10 hover:bg-red-500/20 text-danger min-h-10 h-10 w-10 min-w-10'
                        onClick={handleStopRecording}
                        tooltip='Stop recording'
                    >
                        <CircleStop size={22} />
                        <span className='sr-only'>Stop recording</span>
                    </Button>
                )}
            </div>
        </div>
    );
};

export default CaptureAudio;
