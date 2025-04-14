import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TLessonInfo } from '@/types';
import { Star, Download, ChevronDown, Pin, Share } from 'lucide-react';
import Image from 'next/image';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { GlobalCommentsSection } from '@/components/global/GlobalCommentSection';
import dayjs from 'dayjs';
import { toast } from 'sonner';
import AddNotes from './AddNotes';
import DownloadTab from './DownloadTab';
import RatingsTab from './RatingsTab';
import NewAddNote from './NewAddNote';

const VideoContent = ({
    videoData,
}: {
    videoData: {
        videoInfo: null | TLessonInfo;
        isSideOpen: boolean;
        contentId?: string;
    };
}) => {
    if (!videoData || (!videoData?.videoInfo && videoData?.isSideOpen)) {
        return <div>Loading...</div>;
    }

    console.log({ videoData });

    const tabData = videoData?.videoInfo?.data;
    const tabs = tabData
        ? Object.entries(tabData)?.map(([key, value]) => ({
              title: key,
              label: key.charAt(0).toUpperCase() + key.slice(1),
              data: value,
          }))
        : [];

    const commingSoon = () => {
        toast.success('Coming Soon...');
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
            <div className='p-4 border-b border-border flex justify-between items-center'>
                <div>
                    <h1 className='text-xl font-semibold text-black'>
                        {videoData?.videoInfo?.title}
                    </h1>
                    <div className='flex items-center gap-4 mt-2'>
                        <div className='flex items-center gap-2'>
                            <div className='w-8 h-8 rounded-full overflow-hidden'>
                                <Image
                                    src='/images/author.png'
                                    alt='Jane Cooper'
                                    width={32}
                                    height={32}
                                />
                            </div>
                            <div className='flex flex-col'>
                                <span className='text-sm text-gray'>
                                    Jane Cooper
                                </span>
                                <span className='text-xs text-gray'>
                                    Instructor
                                </span>
                            </div>
                        </div>
                        <div className='text-sm text-gray'>
                            {dayjs(videoData?.videoInfo?.createdAt).format(
                                'MMM DD, YYYY | hh:mm A',
                            )}
                        </div>
                    </div>
                </div>
                <div className='flex items-center gap-2'>
                    <button
                        onClick={commingSoon}
                        className='flex items-center gap-1 text-gray hover:text-dark-gray cursor-pointer'
                    >
                        <Pin className='h-4 w-4' />
                        <span className='text-sm'>Pin</span>
                    </button>
                    <button
                        onClick={commingSoon}
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
                        <TabsList className='h-auto bg-transparent p-0 border-0 gap-8'>
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
                                    <TabsList className='bg-foreground p-1 rounded-full gap-2 flex-wrap'>
                                        {tabs?.map((tab) => (
                                            <TabsTrigger
                                                key={tab.title}
                                                value={tab.title}
                                                className={cn(
                                                    'rounded-full data-[state=active]:bg-primary-light data-[state=active]:text-white text-sm font-medium',
                                                    'data-[state=active]:text-primary-white data-[state=active]:border-b-2 data-[state=active]:border-border-primary-light',
                                                    'text-gray hover:text-dark-gray',
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

                            {/* Comments Section */}
                            {/* <div>
                                <div className='flex items-center gap-2 mb-2'>
                                    <svg
                                        width='16'
                                        height='16'
                                        viewBox='0 0 24 24'
                                        fill='none'
                                        xmlns='http://www.w3.org/2000/svg'
                                        className='text-gray'
                                    >
                                        <path
                                            d='M21 11.5C21.0034 12.8199 20.6951 14.1219 20.1 15.3C19.3944 16.7118 18.3098 17.8992 16.9674 18.7293C15.6251 19.5594 14.0782 19.9994 12.5 20C11.1801 20.0035 9.87812 19.6951 8.7 19.1L3 21L4.9 15.3C4.30493 14.1219 3.99656 12.8199 4 11.5C4.00061 9.92179 4.44061 8.37488 5.27072 7.03258C6.10083 5.69028 7.28825 4.6056 8.7 3.90003C9.87812 3.30496 11.1801 2.99659 12.5 3.00003H13C15.0843 3.11502 17.053 3.99479 18.5291 5.47089C20.0052 6.94699 20.885 8.91568 21 11V11.5Z'
                                            stroke='currentColor'
                                            strokeWidth='2'
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                        />
                                    </svg>
                                    <GlobalCommentsSection />
                                </div>
                            </div> */}
                        </div>
                    </TabsContent>

                    <TabsContent
                        value='notes'
                        className='p-0 m-0 data-[state=active]:border-0'
                    >
                        <NewAddNote
                            contentId={videoData?.contentId as string}
                        />
                        {/* <AddNotes contentId={videoData?.contentId as string} /> */}
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
