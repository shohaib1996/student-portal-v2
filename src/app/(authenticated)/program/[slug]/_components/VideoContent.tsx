import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TContent, TLessonInfo, TProgramMain } from '@/types';
import {
    Star,
    Download,
    ChevronDown,
    Pin,
    Share,
    PinOff,
    Check,
    PanelLeft,
} from 'lucide-react';
import Image from 'next/image';
import React, { useEffect, useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import dayjs from 'dayjs';
import { toast } from 'sonner';
import DownloadTab from './DownloadTab';
import RatingsTab from './RatingsTab';
import NewAddNote from './NewAddNote';
import { useMyProgramQuery } from '@/redux/api/myprogram/myprogramApi';
import {
    useGetSingleChapterQuery,
    useTrackChapterMutation,
} from '@/redux/api/course/courseApi';

// Fixed VideoContent Props Interface
interface VideoContentProps {
    videoData: {
        videoInfo: null | TLessonInfo;
        isSideOpen: boolean;
        contentId: string | null;
        item: TContent;
    };
    refreshData?: () => void;
    setVideoData: React.Dispatch<
        React.SetStateAction<{
            videoInfo: null | TLessonInfo;
            isSideOpen: boolean;
            item: TContent;
            contentId: string | null;
        }>
    >;
    isPinnedEyeOpen: boolean;
    isModuleOpen: boolean;
    setIsPinnedEyeOpen: React.Dispatch<React.SetStateAction<boolean>>;
    // Add callback for progress updates
    onProgressUpdate?: (lessonId: string, isCompleted: boolean) => void;
    setModuleOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export type AttachmentsType = {
    _id: string;
    name: string;
    size: number;
    url: string;
    type: string;
    createdAt: string;
};

const VideoContent: React.FC<VideoContentProps> = ({
    videoData,
    refreshData,
    setVideoData,
    isPinnedEyeOpen,
    setIsPinnedEyeOpen,
    onProgressUpdate,
    isModuleOpen,
    setModuleOpen,
}) => {
    // Wait for required data
    if (!videoData || (!videoData.videoInfo && videoData.isSideOpen)) {
        return <div>Loading...</div>;
    }

    // Retrieve program data using RTK Query
    const { data } = useMyProgramQuery<{ data: TProgramMain }>(undefined);
    const [trackChapter, { isLoading: isTracking }] = useTrackChapterMutation();

    const { data: singleData } = useGetSingleChapterQuery(
        videoData?.contentId as string,
    );

    const programData = data?.program;

    const tabData = singleData?.chapter?.lesson?.data;
    const attachments: AttachmentsType[] = singleData?.chapter?.attachments;
    const myReview = singleData?.myReview;

    const tabs = tabData
        ? Object.entries(tabData).map(([key, value]) => ({
              title: key,
              label: key.charAt(0).toUpperCase() + key.slice(1),
              data: value,
          }))
        : [];

    // Function to handle pin/unpin
    const handlePinToggle = useCallback(async () => {
        if (!videoData.contentId) {
            return;
        }

        const action = isPinnedEyeOpen ? 'unpin' : 'pin';
        const newPinStatus = !isPinnedEyeOpen;

        try {
            // Update local state immediately (optimistic update)
            setVideoData(
                (prev: {
                    videoInfo: null | TLessonInfo;
                    isSideOpen: boolean;
                    item: TContent;
                    contentId: string | null;
                }) => ({
                    ...prev,
                    item: {
                        ...prev.item,
                        isPinned: newPinStatus,
                    },
                }),
            );

            // Update the pin status in parent component
            setIsPinnedEyeOpen(newPinStatus);

            // Make API call
            const courseId = videoData.item?.myCourse?.course;
            if (courseId) {
                await trackChapter({
                    courseId,
                    action,
                    chapterId: videoData.contentId,
                });

                // This will cause the tree to refresh and update the LessonActionMenu
                if (refreshData) {
                    refreshData();
                }

                toast.success(
                    `${action.charAt(0).toUpperCase() + action.slice(1)} has been successful`,
                );
            }
        } catch (error) {
            // Revert on error
            setVideoData(
                (prev: {
                    videoInfo: null | TLessonInfo;
                    isSideOpen: boolean;
                    item: TContent;
                    contentId: string | null;
                }) => ({
                    ...prev,
                    item: {
                        ...prev.item,
                        isPinned: isPinnedEyeOpen,
                    },
                }),
            );
            setIsPinnedEyeOpen(isPinnedEyeOpen);

            toast.error('Something went wrong. Please try again.');
        }
    }, [
        videoData,
        isPinnedEyeOpen,
        setVideoData,
        setIsPinnedEyeOpen,
        trackChapter,
        refreshData,
    ]);

    return (
        <div
            className={`${videoData.isSideOpen && isModuleOpen ? 'lg:col-span-3 relative' : videoData.isSideOpen ? 'lg:col-span-2' : 'hidden'}`}
        >
            {videoData.videoInfo?.url && (
                <div className='relative'>
                    <iframe
                        src={videoData.videoInfo.url}
                        title='Video Content'
                        className='aspect-video w-full rounded-lg'
                        allowFullScreen
                    />
                </div>
            )}

            <div
                onClick={() => setModuleOpen(!isModuleOpen)}
                className={cn(
                    isModuleOpen ? 'absolute top-0 right-0' : 'hidden',
                )}
            >
                <PanelLeft className='h-5 w-5' />
            </div>
            {/* Video Info */}
            <div className='p-4 border-b border-border flex flex-col md:flex-row justify-between items-start md:items-center gap-2'>
                <div>
                    <h1 className='text-xl font-semibold text-black'>
                        {videoData.videoInfo?.title}
                    </h1>
                    <div className='flex items-center gap-4 mt-2'>
                        <div className='flex items-center gap-2'>
                            <div className='w-8 h-8 rounded-full overflow-hidden'>
                                <Image
                                    src={
                                        programData?.instructor?.image ||
                                        '/images/author.png'
                                    }
                                    alt={
                                        programData?.instructor?.name ||
                                        'Jane Cooper'
                                    }
                                    width={32}
                                    height={32}
                                />
                            </div>
                            <div className='flex flex-col'>
                                <span className='text-sm text-gray'>
                                    {programData?.instructor?.name || 'Unknown'}
                                </span>
                                <span className='text-xs text-gray'>
                                    Instructor
                                </span>
                            </div>
                        </div>
                        <div className='text-sm text-gray'>
                            {dayjs(videoData.videoInfo?.updatedAt).format(
                                'MMM DD, YYYY | hh:mm A',
                            )}
                        </div>
                    </div>
                </div>
                <div className='flex items-center gap-2'>
                    {/* Pin/Unpin with clickable functionality */}
                    <button
                        onClick={handlePinToggle}
                        className={cn(
                            'flex items-center gap-1 text-gray hover:text-primary-white cursor-pointer group',
                            isPinnedEyeOpen ? 'stroke-primary' : 'stroke-gray',
                        )}
                    >
                        <Pin
                            className={cn(
                                'h-4 w-4 group-hover:stroke-primary',
                                isPinnedEyeOpen
                                    ? 'stroke-primary '
                                    : 'stroke-gray',
                            )}
                        />
                        <span className='text-sm'>
                            {isPinnedEyeOpen ? 'Unpin' : 'Pin'}
                        </span>
                    </button>

                    <button
                        onClick={() =>
                            toast.success('Sharing feature coming soon...')
                        }
                        className='flex items-center gap-1 text-gray hover:text-dark-gray cursor-pointer'
                    >
                        <Share className='h-4 w-4' />
                        <span className='text-sm'>Share</span>
                    </button>
                </div>
            </div>

            {/* Main Tabs */}
            <div className='flex-1 overflow-auto'>
                <Tabs defaultValue='overview' className='w-full'>
                    <div className='border-b border-border'>
                        <TabsList className='h-auto bg-transparent p-0 border-0 gap-3 md:gap-6 lg:gap-8 overflow-x-auto flex-wrap'>
                            <TabsTrigger
                                value='overview'
                                className='px-0 py-3 text-sm font-medium data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-border-primary-light data-[state=active]:text-primary-white rounded-none'
                            >
                                <div className='flex items-center gap-2'>
                                    <svg
                                        width='16'
                                        height='16'
                                        viewBox='0 0 24 24'
                                        fill='none'
                                        xmlns='http://www.w3.org/2000/svg'
                                        className='text-primary-white'
                                    >
                                        <path
                                            d='M4 6H20M4 10H20M4 14H20M4 18H20'
                                            stroke='currentColor'
                                            strokeWidth='2'
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                        />
                                    </svg>
                                    Overview
                                </div>
                            </TabsTrigger>
                            <TabsTrigger
                                value='notes'
                                className='px-0 py-3 text-sm font-medium data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-border-primary-light data-[state=active]:text-primary-white rounded-none'
                            >
                                <div className='flex items-center gap-2'>
                                    <svg
                                        width='16'
                                        height='16'
                                        viewBox='0 0 24 24'
                                        fill='none'
                                        xmlns='http://www.w3.org/2000/svg'
                                        className='text-gray'
                                    >
                                        <path
                                            d='M11 4H4V20H20V13'
                                            stroke='currentColor'
                                            strokeWidth='2'
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                        />
                                        <path
                                            d='M9 15H7V17H9V15Z'
                                            fill='currentColor'
                                        />
                                        <path
                                            d='M14 15H12V17H14V15Z'
                                            fill='currentColor'
                                        />
                                        <path
                                            d='M9 10H7V12H9V10Z'
                                            fill='currentColor'
                                        />
                                        <path
                                            d='M14 10H12V12H14V10Z'
                                            fill='currentColor'
                                        />
                                        <path
                                            d='M19 10H17V12H19V10Z'
                                            fill='currentColor'
                                        />
                                        <path
                                            d='M14 5H12V7H14V5Z'
                                            fill='currentColor'
                                        />
                                        <path
                                            d='M19 5H17V7H19V5Z'
                                            fill='currentColor'
                                        />
                                    </svg>
                                    Add Notes
                                </div>
                            </TabsTrigger>
                            <TabsTrigger
                                value='download'
                                className='px-0 py-3 text-sm font-medium data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-border-primary-light data-[state=active]:text-primary-white rounded-none'
                            >
                                <div className='flex items-center gap-2'>
                                    <Download className='h-4 w-4 text-gray' />
                                    Download
                                </div>
                            </TabsTrigger>
                            <TabsTrigger
                                value='ratings'
                                className='px-0 py-3 text-sm font-medium data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-border-primary-light data-[state=active]:text-primary-white rounded-none'
                            >
                                <div className='flex items-center gap-2'>
                                    <svg
                                        width='16'
                                        height='16'
                                        viewBox='0 0 24 24'
                                        fill='none'
                                        xmlns='http://www.w3.org/2000/svg'
                                        className='text-gray'
                                    >
                                        <path
                                            d='M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z'
                                            stroke='currentColor'
                                            strokeWidth='2'
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                        />
                                    </svg>
                                    Ratings
                                </div>
                            </TabsTrigger>
                        </TabsList>
                    </div>
                    <TabsContent
                        value='overview'
                        className='p-0 m-0 data-[state=active]:border-0'
                    >
                        <div className='p-4'>
                            <div className='mb-2'>
                                <div className='flex items-center gap-2 mb-2'>
                                    <div className='w-4 h-4 rounded-full bg-primary'></div>
                                    <h2 className='text-base font-medium text-black'>
                                        Description
                                    </h2>
                                </div>
                                <p className='text-dark-gray text-sm ml-6'>
                                    {videoData.videoInfo?.title ||
                                        'Bootcamps Hub is an all-in-one SaaS platform designed for high-ticket coaches and educators. It empowers you to launch, manage, and scale premium boot camps without relying on fragmented tools like Udemy or Skillshare.'}
                                </p>
                            </div>
                            <div className='mb-2'>
                                <div className='flex items-center gap-2 mb-2'>
                                    <h2 className='text-base font-medium text-black'>
                                        Resources
                                    </h2>
                                </div>
                                {tabs?.length > 0 ? (
                                    <Tabs defaultValue='summary'>
                                        <TabsList className='bg-background p-1 rounded-full gap-2 flex-wrap overflow-x-auto lg:overflow-x-visible'>
                                            {tabs
                                                ?.filter(
                                                    (t) =>
                                                        t.title !==
                                                        'transcription',
                                                )
                                                ?.map((tab) => (
                                                    <TabsTrigger
                                                        key={tab.title}
                                                        value={tab.title}
                                                        className={cn(
                                                            'rounded-full data-[state=active]:bg-primary-light data-[state=active]:text-white text-sm font-medium',
                                                            'data-[state=active]:text-primary-white data-[state=active]:border-b-2 data-[state=active]:border-border-primary-light',
                                                            'text-gray hover:text-dark-gray',
                                                        )}
                                                    >
                                                        {tab.title ===
                                                            'summary' && (
                                                            <svg
                                                                width='16'
                                                                height='16'
                                                                viewBox='0 0 24 24'
                                                                fill='none'
                                                                xmlns='http://www.w3.org/2000/svg'
                                                                className='data-[state=active]:text-primary-white text-gray'
                                                            >
                                                                <path
                                                                    d='M4 6H20M4 10H20M4 14H20M4 18H12'
                                                                    stroke='currentColor'
                                                                    strokeWidth='2'
                                                                    strokeLinecap='round'
                                                                    strokeLinejoin='round'
                                                                />
                                                            </svg>
                                                        )}
                                                        {tab.title ===
                                                            'interview' && (
                                                            <svg
                                                                width='16'
                                                                height='16'
                                                                viewBox='0 0 24 24'
                                                                fill='none'
                                                                xmlns='http://www.w3.org/2000/svg'
                                                                className='data-[state=active]:text-primary-white text-gray'
                                                            >
                                                                <path
                                                                    d='M8 9H16M8 13H14M8 17H11M13 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V9L13 2Z'
                                                                    stroke='currentColor'
                                                                    strokeWidth='2'
                                                                    strokeLinecap='round'
                                                                    strokeLinejoin='round'
                                                                />
                                                            </svg>
                                                        )}
                                                        {tab.title ===
                                                            'behavioral' && (
                                                            <svg
                                                                width='16'
                                                                height='16'
                                                                viewBox='0 0 24 24'
                                                                fill='none'
                                                                xmlns='http://www.w3.org/2000/svg'
                                                                className='data-[state=active]:text-primary-white text-gray'
                                                            >
                                                                <path
                                                                    d='M9 6L20 6M9 12H20M9 18H20M5 6V6.01M5 12V12.01M5 18V18.01'
                                                                    stroke='currentColor'
                                                                    strokeWidth='2'
                                                                    strokeLinecap='round'
                                                                    strokeLinejoin='round'
                                                                />
                                                            </svg>
                                                        )}
                                                        <span>{tab.label}</span>
                                                    </TabsTrigger>
                                                ))}
                                        </TabsList>
                                        {tabs?.map((tab) => (
                                            <TabsContent
                                                key={tab.title}
                                                value={tab.title}
                                                className='mt-0'
                                            >
                                                <>
                                                    {tab.data ? (
                                                        <div className='py-2 px-2'>
                                                            <p className='whitespace-pre-line text-sm font-semibold text-gray'>
                                                                {
                                                                    tab.data as any
                                                                }
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div className='flex items-center gap-2 text-graytext-sm mt-1 p-3 bg-primary-foreground rounded-md line-clamp-2  transition-all '>
                                                                <span className='text-center w-full text-primary font-bold'>
                                                                    No{' '}
                                                                    {tab?.title}{' '}
                                                                    available
                                                                </span>
                                                            </div>
                                                        </>
                                                    )}
                                                </>
                                            </TabsContent>
                                        ))}
                                    </Tabs>
                                ) : (
                                    'No resources available'
                                )}
                            </div>
                        </div>
                    </TabsContent>
                    <TabsContent
                        value='notes'
                        className='p-0 m-0 data-[state=active]:border-0'
                    >
                        <NewAddNote contentId={videoData.contentId as string} />
                    </TabsContent>
                    <TabsContent
                        value='download'
                        className='p-0 m-0 data-[state=active]:border-0'
                    >
                        <DownloadTab attachments={attachments} />
                    </TabsContent>
                    <TabsContent
                        value='ratings'
                        className='p-0 m-0 data-[state=active]:border-0'
                    >
                        <RatingsTab
                            myReview={myReview}
                            chapterId={videoData.contentId as string}
                        />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default VideoContent;
