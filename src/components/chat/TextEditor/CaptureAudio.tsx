'use client';

import type React from 'react';
import { useEffect, useRef, useState, useCallback } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { Play, Pause, Square, Trash, Send, Mic } from 'lucide-react';
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
        <div className='flex w-full items-center justify-center gap-2.5'>
            {isRecording && (
                <div className='min-w-[150px]'>
                    <span className={`${isRecording ? 'animate-pulse' : ''}`}>
                        {isRecording ? `Recording ${recordingDuration}s` : ''}
                    </span>
                </div>
            )}

            {/* Waveform container */}
            <div
                className={`w-full flex items-center justify-between gap-2.5 rounded-2xl p-2.5 ${isRecording ? 'invisible' : 'visible'}`}
            >
                {/* Current playback time */}
                <div
                    className={`text-xs text-gray flex gap-1.5 items-center ${isRecording ? 'invisible' : 'visible'}`}
                >
                    {recordedAudio &&
                        !isRecording &&
                        (isPlaying ? (
                            <button
                                onClick={handlePauseRecording}
                                className='text-primary transition-colors'
                            >
                                <Pause size={17} />
                                <span className='sr-only'>Pause</span>
                            </button>
                        ) : (
                            <button
                                onClick={handlePlayRecording}
                                className='text-primary transition-colors'
                            >
                                <Play size={17} />
                                <span className='sr-only'>Play</span>
                            </button>
                        ))}
                    {recordedAudio && formatTime(currentPlaybackTime)}
                </div>

                <div
                    ref={waveFormRef}
                    className='w-full bg=primary-light rounded-full border-blue-700/20 px-4 py-2'
                    hidden={isRecording}
                ></div>

                {/* Total duration */}
                <div
                    className={`text-xs text-gray flex gap-1.5 items-center ${isRecording ? 'invisible' : 'visible'}`}
                >
                    {recordedAudio && formatTime(totalDuration)}
                    {!isRecording && (
                        <Button
                            onClick={() => setIsRecorderVisible(false)}
                            className='text-danger bg-red-500/10 rounded-full h-9 w-9 transition-colors'
                        >
                            <Trash size={17} />
                            <span className='sr-only'>Delete recording</span>
                        </Button>
                    )}
                </div>
            </div>

            <audio ref={audioRef} hidden />

            <div className='flex gap-2.5 items-center justify-between'>
                {!isRecording ? (
                    <>
                        <button
                            className='p-2 rounded-full border border-gray-300 hover:bg-gray-100 transition-colors'
                            onClick={handleStartRecording}
                        >
                            <Mic size={20} className='text-gray-600' />
                            <span className='sr-only'>Start recording</span>
                        </button>

                        {recordedAudio &&
                            !isRecording &&
                            (isSendingAudio ? (
                                <div className='p-2 rounded-full bg-primary'>
                                    <Loader
                                        size={20}
                                        className='text-white animate-spin'
                                    />
                                </div>
                            ) : (
                                <button
                                    className='p-2 rounded-full bg-primary hover:bg-primary/90 transition-colors'
                                    onClick={sendRecording}
                                >
                                    <Send size={16} className='text-white' />
                                    <span className='sr-only'>
                                        Send recording
                                    </span>
                                </button>
                            ))}
                    </>
                ) : (
                    <button
                        className='text-green-500 hover:text-green-600 transition-colors'
                        onClick={handleStopRecording}
                    >
                        <Square size={20} />
                        <span className='sr-only'>Stop recording</span>
                    </button>
                )}
            </div>
        </div>
    );
};

export default CaptureAudio;
