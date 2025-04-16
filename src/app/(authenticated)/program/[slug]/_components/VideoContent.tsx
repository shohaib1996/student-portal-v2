import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TContent, TLessonInfo, TProgram, TProgramMain } from '@/types';
import { Star, Download, ChevronDown, Pin, Share, PinOff } from 'lucide-react';
import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { GlobalCommentsSection } from '@/components/global/GlobalCommentSection';
import dayjs from 'dayjs';
import { toast } from 'sonner';
// import AddNotes from './AddNotes';
import DownloadTab from './DownloadTab';
import RatingsTab from './RatingsTab';
import NewAddNote from './NewAddNote';
import { useAppSelector } from '@/redux/hooks';
import { useMyProgramQuery } from '@/redux/api/myprogram/myprogramApi';
import { useTrackChapterMutation } from '@/redux/api/course/courseApi';

const VideoContent = ({
    videoData,
    refreshData, // Add this prop to refresh parent data after pinning/unpinning
    setVideoData,
}: {
    videoData: {
        videoInfo: null | TLessonInfo;
        isSideOpen: boolean;
        contentId: string | null;
        item: Partial<TContent | any>;
    };
    refreshData?: () => void;
    setVideoData: React.Dispatch<React.SetStateAction<any>>;
}) => {
    if (!videoData || (!videoData?.videoInfo && videoData?.isSideOpen)) {
        return <div>Loading...</div>;
    }

    const { data } = useMyProgramQuery<{ data: TProgramMain }>(undefined);
    const [trackChapter, { isLoading: isTracking }] = useTrackChapterMutation();

    // Local state to track the pinned status
    const [isPinned, setIsPinned] = useState(
        videoData?.item?.isPinned || false,
    );

    // Update local state when videoData changes
    useEffect(() => {
        setIsPinned(videoData?.item?.isPinned || false);
    }, [videoData?.item?.isPinned]);

    const programData = data?.program;
    console.log({
        item: videoData?.item,
        videoInfo: videoData?.videoInfo,
        isPinned,
    });

    const tabData = videoData?.videoInfo?.data;
    const tabs = tabData
        ? Object.entries(tabData)?.map(([key, value]) => ({
              title: key,
              label: key.charAt(0).toUpperCase() + key.slice(1),
              data: value,
          }))
        : [];

    const handlePinContent = async () => {
        if (!videoData?.contentId) {
            toast.error('Content ID not found');
            return;
        }

        // Determine the action based on the current pin state
        const action = isPinned ? 'unpin' : 'pin';
        const newPinnedState = !isPinned;

        try {
            // Update local state immediately for better UX
            setIsPinned(newPinnedState);

            // Update the videoData state to reflect the change
            setVideoData((prev: any) => ({
                ...prev,
                item: {
                    ...prev.item,
                    isPinned: newPinnedState,
                    courseId: videoData?.item?.courseId,
                    chapterId: videoData?.item?.chapterId,
                },
            }));

            // Call the API
            const response = await trackChapter({
                courseId: videoData?.item?.courseId,
                action: action, // "pin" or "unpin" based on current state
                chapterId: videoData?.item?.chapterId,
            }).unwrap();

            if (response.success) {
                toast.success(
                    isPinned
                        ? 'Content unpinned successfully'
                        : 'Content pinned successfully',
                );

                // Refresh the parent data if the refresh function is provided
                if (refreshData) {
                    refreshData();
                }
            } else {
                // Revert the local state if API call fails
                setIsPinned(!newPinnedState);
                setVideoData((prev: any) => ({
                    ...prev,
                    item: {
                        ...prev.item,
                        isPinned: !newPinnedState,
                    },
                }));
                toast.error(response.message || 'Failed to pin/unpin content');
            }
        } catch (error) {
            // Revert the local state if API call fails
            setIsPinned(!newPinnedState);
            setVideoData((prev: any) => ({
                ...prev,
                item: {
                    ...prev.item,
                    isPinned: !newPinnedState,
                },
            }));
            console.error('Error pinning/unpinning content:', error);
            toast.error('Something went wrong while pinning/unpinning content');
        }
    };

    return (
        <div
            className={`${videoData?.isSideOpen ? 'lg:col-span-2' : 'hidden'} `}
        >
            {videoData?.videoInfo?.url && (
                <iframe
                    src={videoData?.videoInfo?.url}
                    title='Video Content'
                    className='aspect-video w-full rounded-lg'
                    allowFullScreen // Optional, allows full-screen playback
                ></iframe>
            )}
            {/* Video Info */}
            <div className='p-4 border-b border-border flex flex-col md:flex-row justify-between items-start md:items-center gap-2'>
                <div>
                    <h1 className='text-xl font-semibold text-black'>
                        {videoData?.videoInfo?.title}
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
                            {dayjs(videoData?.videoInfo?.updatedAt).format(
                                'MMM DD, YYYY | hh:mm A',
                            )}
                        </div>
                    </div>
                </div>
                <div className='flex items-center gap-2'>
                    <button
                        onClick={handlePinContent}
                        disabled={isTracking}
                        className={cn(
                            'flex items-center gap-1 hover:text-dark-gray cursor-pointer transition-colors',
                            isPinned ? 'text-primary' : 'text-gray',
                            isTracking && 'opacity-70 cursor-not-allowed',
                        )}
                    >
                        {isPinned ? (
                            <PinOff className='h-4 w-4 stroke-primary' />
                        ) : (
                            <Pin className='h-4 w-4' />
                        )}
                        <span className='text-sm'>
                            {isTracking
                                ? 'Processing...'
                                : isPinned
                                  ? 'Unpin'
                                  : 'Pin'}
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
                            {/* Description Section */}
                            <div className='mb-2'>
                                <div className='flex items-center gap-2 mb-2'>
                                    <div className='w-4 h-4 rounded-full bg-primary'></div>
                                    <h2 className='text-base font-medium text-black'>
                                        Description
                                    </h2>
                                </div>
                                <p className='text-dark-gray text-sm ml-6'>
                                    {videoData?.videoInfo?.title ||
                                        'Bootcamps Hub is an all-in-one SaaS platform designed for high-ticket coaches and educators. It empowers you to launch, manage, and scale premium boot camps without relying on fragmented tools like Udemy or Skillshare.'}
                                </p>
                            </div>

                            {/* Resources Section */}
                            <div className='mb-2'>
                                <div className='flex items-center gap-2 mb-2'>
                                    <h2 className='text-base font-medium text-black'>
                                        Resources
                                    </h2>
                                </div>
                                <Tabs defaultValue='summary' className=''>
                                    <TabsList className='bg-background p-1 rounded-full gap-2 flex-wrap overflow-x-auto lg:overflow-x-visible'>
                                        {tabs?.map((tab) => (
                                            <TabsTrigger
                                                key={tab.title}
                                                value={tab.title}
                                                className={cn(
                                                    'rounded-full data-[state=active]:bg-primary-light data-[state=active]:text-white text-sm font-medium',
                                                    'data-[state=active]:text-primary-white data-[state=active]:border-b-2 data-[state=active]:border-border-primary-light',
                                                    'text-gray hover:text-dark-gray overx',
                                                )}
                                            >
                                                {/* SVG for Summary */}
                                                {tab.title === 'summary' && (
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
                                                {tab.title === 'interview' && (
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
                                                {tab.title === 'behavioral' && (
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
                                            {tab.data && (
                                                <div className='py-2 px-2'>
                                                    <p className='whitespace-pre-line text-sm font-semibold text-gray'>
                                                        {tab.data}
                                                    </p>
                                                </div>
                                            )}
                                        </TabsContent>
                                    ))}
                                </Tabs>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent
                        value='notes'
                        className='p-0 m-0 data-[state=active]:border-0'
                    >
                        <NewAddNote
                            contentId={videoData?.contentId as string}
                        />
                    </TabsContent>

                    <TabsContent
                        value='download'
                        className='p-0 m-0 data-[state=active]:border-0'
                    >
                        <DownloadTab />
                    </TabsContent>

                    <TabsContent
                        value='ratings'
                        className='p-0 m-0 data-[state=active]:border-0'
                    >
                        <RatingsTab />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default VideoContent;
