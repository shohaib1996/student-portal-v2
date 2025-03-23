import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TLessonInfo } from '@/types';
import { Star, Download, ChevronDown, Pin, Share } from 'lucide-react';
import Image from 'next/image';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const VideoContent = ({
    videoData,
}: {
    videoData: {
        videoInfo: null | TLessonInfo;
        isSideOpen: boolean;
    };
}) => {
    if (!videoData || (!videoData?.videoInfo && videoData?.isSideOpen)) {
        return <div>Loading...</div>; // Return loading if videoInfo is null or videoData is not provided
    }

    const [activeResourceTab, setActiveResourceTab] = useState('summary');

    return (
        <div
            className={`${videoData?.isSideOpen ? 'lg:col-span-1' : 'hidden'} `}
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
                        <div className='text-sm text-gray-500'>
                            Jan 30, 2024 | 12:30 PM
                        </div>
                    </div>
                </div>
                <div className='flex items-center gap-2'>
                    <button className='flex items-center gap-1 text-gray-500 hover:text-gray-700'>
                        <Pin className='h-4 w-4' />
                        <span className='text-sm'>Pin</span>
                    </button>
                    <button className='flex items-center gap-1 text-gray-500 hover:text-gray-700'>
                        <Share className='h-4 w-4' />
                        <span className='text-sm'>Share</span>
                    </button>
                </div>
            </div>

            {/* Main Tabs */}
            <div className='flex-1 overflow-auto'>
                <Tabs defaultValue='overview' className='w-full'>
                    <div className='border-b border-gray-200'>
                        <TabsList className='h-auto bg-transparent p-0 border-0 gap-8'>
                            <TabsTrigger
                                value='overview'
                                className='px-0 py-3 text-sm font-medium data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none'
                            >
                                <div className='flex items-center gap-2'>
                                    <svg
                                        width='16'
                                        height='16'
                                        viewBox='0 0 24 24'
                                        fill='none'
                                        xmlns='http://www.w3.org/2000/svg'
                                        className='text-blue-600'
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
                                className='px-0 py-3 text-sm font-medium data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none'
                            >
                                <div className='flex items-center gap-2'>
                                    <svg
                                        width='16'
                                        height='16'
                                        viewBox='0 0 24 24'
                                        fill='none'
                                        xmlns='http://www.w3.org/2000/svg'
                                        className='text-gray-500'
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
                                className='px-0 py-3 text-sm font-medium data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none'
                            >
                                <div className='flex items-center gap-2'>
                                    <Download className='h-4 w-4 text-gray-500' />
                                    Download
                                </div>
                            </TabsTrigger>
                            <TabsTrigger
                                value='ratings'
                                className='px-0 py-3 text-sm font-medium data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none'
                            >
                                <div className='flex items-center gap-2'>
                                    <svg
                                        width='16'
                                        height='16'
                                        viewBox='0 0 24 24'
                                        fill='none'
                                        xmlns='http://www.w3.org/2000/svg'
                                        className='text-gray-500'
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
                                    <div className='w-4 h-4 rounded-full bg-blue-600'></div>
                                    <h2 className='text-base font-medium text-gray-900'>
                                        Description
                                    </h2>
                                </div>
                                <p className='text-gray-700 text-sm ml-6'>
                                    {videoData?.videoInfo?.title ||
                                        'Bootcamps Hub is an all-in-one SaaS platform designed for high-ticket coaches and educators. It empowers you to launch, manage, and scale premium boot camps without relying on fragmented tools like Udemy or Skillshare.'}
                                </p>
                            </div>

                            {/* Resources Section */}
                            <div className='mb-2'>
                                <div className='flex items-center gap-2 mb-2'>
                                    <h2 className='text-base font-medium text-gray-900'>
                                        Resources
                                    </h2>
                                </div>
                                <div className=''>
                                    <div className='flex border-b border-gray-200 overflow-hidden'>
                                        <button
                                            className={cn(
                                                'px-2 py-2 text-sm font-medium whitespace-nowrap flex items-center gap-1',
                                                activeResourceTab === 'summary'
                                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                                    : 'text-gray-500 hover:text-gray-700',
                                            )}
                                            onClick={() =>
                                                setActiveResourceTab('summary')
                                            }
                                        >
                                            <svg
                                                width='16'
                                                height='16'
                                                viewBox='0 0 24 24'
                                                fill='none'
                                                xmlns='http://www.w3.org/2000/svg'
                                                className={
                                                    activeResourceTab ===
                                                    'summary'
                                                        ? 'text-blue-600'
                                                        : 'text-gray-500'
                                                }
                                            >
                                                <path
                                                    d='M4 6H20M4 10H20M4 14H20M4 18H12'
                                                    stroke='currentColor'
                                                    strokeWidth='2'
                                                    strokeLinecap='round'
                                                    strokeLinejoin='round'
                                                />
                                            </svg>
                                            Summary
                                        </button>
                                        <button
                                            className={cn(
                                                'px-2 py-2 text-sm font-medium whitespace-nowrap flex items-center gap-1',
                                                activeResourceTab ===
                                                    'assessments'
                                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                                    : 'text-gray-500 hover:text-gray-700',
                                            )}
                                            onClick={() =>
                                                setActiveResourceTab(
                                                    'assessments',
                                                )
                                            }
                                        >
                                            <svg
                                                width='16'
                                                height='16'
                                                viewBox='0 0 24 24'
                                                fill='none'
                                                xmlns='http://www.w3.org/2000/svg'
                                                className={
                                                    activeResourceTab ===
                                                    'assessments'
                                                        ? 'text-blue-600'
                                                        : 'text-gray-500'
                                                }
                                            >
                                                <path
                                                    d='M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15M9 5C9 6.10457 9.89543 7 11 7H13C14.1046 7 15 6.10457 15 5M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5M12 12H15M12 16H15M9 12H9.01M9 16H9.01'
                                                    stroke='currentColor'
                                                    strokeWidth='2'
                                                    strokeLinecap='round'
                                                />
                                            </svg>
                                            Assessments
                                        </button>
                                        <button
                                            className={cn(
                                                'px-2 py-2 text-sm font-medium whitespace-nowrap flex items-center gap-1',
                                                activeResourceTab ===
                                                    'interview'
                                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                                    : 'text-gray-500 hover:text-gray-700',
                                            )}
                                            onClick={() =>
                                                setActiveResourceTab(
                                                    'interview',
                                                )
                                            }
                                        >
                                            <svg
                                                width='16'
                                                height='16'
                                                viewBox='0 0 24 24'
                                                fill='none'
                                                xmlns='http://www.w3.org/2000/svg'
                                                className={
                                                    activeResourceTab ===
                                                    'interview'
                                                        ? 'text-blue-600'
                                                        : 'text-gray-500'
                                                }
                                            >
                                                <path
                                                    d='M8 9H16M8 13H14M8 17H11M13 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V9L13 2Z'
                                                    stroke='currentColor'
                                                    strokeWidth='2'
                                                    strokeLinecap='round'
                                                    strokeLinejoin='round'
                                                />
                                            </svg>
                                            Interview
                                        </button>
                                        <button
                                            className={cn(
                                                'px-2 py-2 text-sm font-medium whitespace-nowrap flex items-center gap-1',
                                                activeResourceTab ===
                                                    'behavioral'
                                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                                    : 'text-gray-500 hover:text-gray-700',
                                            )}
                                            onClick={() =>
                                                setActiveResourceTab(
                                                    'behavioral',
                                                )
                                            }
                                        >
                                            <svg
                                                width='16'
                                                height='16'
                                                viewBox='0 0 24 24'
                                                fill='none'
                                                xmlns='http://www.w3.org/2000/svg'
                                                className={
                                                    activeResourceTab ===
                                                    'behavioral'
                                                        ? 'text-blue-600'
                                                        : 'text-gray-500'
                                                }
                                            >
                                                <path
                                                    d='M9 6L20 6M9 12H20M9 18H20M5 6V6.01M5 12V12.01M5 18V18.01'
                                                    stroke='currentColor'
                                                    strokeWidth='2'
                                                    strokeLinecap='round'
                                                    strokeLinejoin='round'
                                                />
                                            </svg>
                                            Behavioral
                                        </button>
                                        <button
                                            className={cn(
                                                'px-2 py-2 text-sm font-medium whitespace-nowrap flex items-center gap-1',
                                                activeResourceTab === 'analytic'
                                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                                    : 'text-gray-500 hover:text-gray-700',
                                            )}
                                            onClick={() =>
                                                setActiveResourceTab('analytic')
                                            }
                                        >
                                            <svg
                                                width='16'
                                                height='16'
                                                viewBox='0 0 24 24'
                                                fill='none'
                                                xmlns='http://www.w3.org/2000/svg'
                                                className={
                                                    activeResourceTab ===
                                                    'analytic'
                                                        ? 'text-blue-600'
                                                        : 'text-gray-500'
                                                }
                                            >
                                                <path
                                                    d='M16 8V16M12 11V16M8 14V16M6 20H18C19.1046 20 20 19.1046 20 18V6C20 4.89543 19.1046 4 18 4H6C4.89543 4 4 4.89543 4 6V18C4 19.1046 4.89543 20 6 20Z'
                                                    stroke='currentColor'
                                                    strokeWidth='2'
                                                    strokeLinecap='round'
                                                    strokeLinejoin='round'
                                                />
                                            </svg>
                                            Analytic
                                        </button>
                                        <button
                                            className={cn(
                                                'px-2 py-2 text-sm font-medium whitespace-nowrap flex items-center gap-1',
                                                activeResourceTab === 'labs'
                                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                                    : 'text-gray-500 hover:text-gray-700',
                                            )}
                                            onClick={() =>
                                                setActiveResourceTab('labs')
                                            }
                                        >
                                            <svg
                                                width='16'
                                                height='16'
                                                viewBox='0 0 24 24'
                                                fill='none'
                                                xmlns='http://www.w3.org/2000/svg'
                                                className={
                                                    activeResourceTab === 'labs'
                                                        ? 'text-blue-600'
                                                        : 'text-gray-500'
                                                }
                                            >
                                                <path
                                                    d='M19.7778 17.5H4.22222L12 4.5L19.7778 17.5Z'
                                                    stroke='currentColor'
                                                    strokeWidth='2'
                                                    strokeLinecap='round'
                                                    strokeLinejoin='round'
                                                />
                                                <path
                                                    d='M9.5 10.5L12 15.5L14.5 10.5'
                                                    stroke='currentColor'
                                                    strokeWidth='2'
                                                    strokeLinecap='round'
                                                    strokeLinejoin='round'
                                                />
                                            </svg>
                                            Labs
                                        </button>
                                        <button
                                            className={cn(
                                                'px-2 py-2 text-sm font-medium whitespace-nowrap flex items-center gap-1',
                                                activeResourceTab ===
                                                    'presentations'
                                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                                    : 'text-gray-500 hover:text-gray-700',
                                            )}
                                            onClick={() =>
                                                setActiveResourceTab(
                                                    'presentations',
                                                )
                                            }
                                        >
                                            <svg
                                                width='16'
                                                height='16'
                                                viewBox='0 0 24 24'
                                                fill='none'
                                                xmlns='http://www.w3.org/2000/svg'
                                                className={
                                                    activeResourceTab ===
                                                    'presentations'
                                                        ? 'text-blue-600'
                                                        : 'text-gray-500'
                                                }
                                            >
                                                <path
                                                    d='M8 13V17M16 11V17M12 7V17M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z'
                                                    stroke='currentColor'
                                                    strokeWidth='2'
                                                    strokeLinecap='round'
                                                    strokeLinejoin='round'
                                                />
                                            </svg>
                                            Presentations
                                        </button>
                                    </div>

                                    {activeResourceTab === 'summary' && (
                                        <div className='py-2px-2'>
                                            <h3 className='font-medium mb-2'>
                                                What you&apos;re going to get
                                                from this course
                                            </h3>
                                            <ul className='text-sm text-gray-700 space-y-2 pl-5 list-disc'>
                                                <li>
                                                    Understand the core
                                                    principles of automation
                                                    technology
                                                </li>
                                                <li>
                                                    Learn how to implement
                                                    automation in various
                                                    business processes
                                                </li>
                                                <li>
                                                    Develop skills to analyze
                                                    and optimize automation
                                                    workflows
                                                </li>
                                                <li>
                                                    Apply automation concepts to
                                                    real-world scenarios
                                                </li>
                                            </ul>
                                        </div>
                                    )}

                                    {activeResourceTab === 'interview' &&
                                        videoData?.videoInfo?.data
                                            ?.interview && (
                                            <div className='py-2px-2'>
                                                <p className='whitespace-pre-line text-sm font-semibold text-gray'>
                                                    {
                                                        videoData?.videoInfo
                                                            ?.data?.interview
                                                    }
                                                </p>
                                            </div>
                                        )}

                                    {activeResourceTab === 'behavioral' &&
                                        videoData?.videoInfo?.data
                                            ?.behavioral && (
                                            <div className='py-2px-2'>
                                                <p className='whitespace-pre-line text-sm font-semibold text-gray'>
                                                    {
                                                        videoData?.videoInfo
                                                            ?.data?.behavioral
                                                    }
                                                </p>
                                            </div>
                                        )}
                                </div>
                            </div>

                            {/* Comments Section */}
                            <div>
                                <div className='flex items-center gap-2 mb-2'>
                                    <svg
                                        width='16'
                                        height='16'
                                        viewBox='0 0 24 24'
                                        fill='none'
                                        xmlns='http://www.w3.org/2000/svg'
                                        className='text-gray-500'
                                    >
                                        <path
                                            d='M21 11.5C21.0034 12.8199 20.6951 14.1219 20.1 15.3C19.3944 16.7118 18.3098 17.8992 16.9674 18.7293C15.6251 19.5594 14.0782 19.9994 12.5 20C11.1801 20.0035 9.87812 19.6951 8.7 19.1L3 21L4.9 15.3C4.30493 14.1219 3.99656 12.8199 4 11.5C4.00061 9.92179 4.44061 8.37488 5.27072 7.03258C6.10083 5.69028 7.28825 4.6056 8.7 3.90003C9.87812 3.30496 11.1801 2.99659 12.5 3.00003H13C15.0843 3.11502 17.053 3.99479 18.5291 5.47089C20.0052 6.94699 20.885 8.91568 21 11V11.5Z'
                                            stroke='currentColor'
                                            strokeWidth='2'
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                        />
                                    </svg>
                                    <h2 className='text-base font-medium text-gray-900 flex items-center gap-2'>
                                        <span>Comments (16)</span>
                                        <ChevronDown className='h-4 w-4' />
                                    </h2>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent
                        value='notes'
                        className='p-4 m-0 data-[state=active]:border-0'
                    >
                        <div className='border border-gray-200 rounded-md p-4'>
                            <textarea
                                className='w-full h-40 p-2 border border-gray-200 rounded-md text-sm'
                                placeholder='Add your notes here...'
                            ></textarea>
                            <div className='flex justify-end mt-2'>
                                <Button className='bg-blue-600 hover:bg-blue-700'>
                                    Save Notes
                                </Button>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent
                        value='download'
                        className='p-4 m-0 data-[state=active]:border-0'
                    >
                        <div className='border border-gray-200 rounded-md p-4 flex items-center justify-between'>
                            <div>
                                <h3 className='font-medium'>
                                    Automation Fundamentals.mp4
                                </h3>
                                <p className='text-sm text-gray-500'>
                                    720p, 45MB
                                </p>
                            </div>
                            <Button className='bg-blue-600 hover:bg-blue-700'>
                                <Download className='h-4 w-4 mr-2' />
                                Download
                            </Button>
                        </div>
                    </TabsContent>

                    <TabsContent
                        value='ratings'
                        className='p-4 m-0 data-[state=active]:border-0'
                    >
                        <div className='flex items-center gap-4 mb-4'>
                            <div className='text-4xl font-bold text-gray-900'>
                                4.8
                            </div>
                            <div className='flex-1'>
                                <div className='flex items-center'>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            className={`h-5 w-5 ${star <= 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                                        />
                                    ))}
                                    <span className='ml-2 text-sm text-gray-500'>
                                        (128 ratings)
                                    </span>
                                </div>
                                <div className='mt-2 space-y-1'>
                                    <div className='flex items-center gap-2'>
                                        <span className='text-xs w-8'>
                                            5 stars
                                        </span>
                                        <div className='flex-1 h-2 bg-gray-200 rounded-full overflow-hidden'>
                                            <div className='h-full bg-yellow-400 w-[75%]'></div>
                                        </div>
                                    </div>
                                    <div className='flex items-center gap-2'>
                                        <span className='text-xs w-8'>
                                            4 stars
                                        </span>
                                        <div className='flex-1 h-2 bg-gray-200 rounded-full overflow-hidden'>
                                            <div className='h-full bg-yellow-400 w-[15%]'></div>
                                        </div>
                                    </div>
                                    <div className='flex items-center gap-2'>
                                        <span className='text-xs w-8'>
                                            3 stars
                                        </span>
                                        <div className='flex-1 h-2 bg-gray-200 rounded-full overflow-hidden'>
                                            <div className='h-full bg-yellow-400 w-[5%]'></div>
                                        </div>
                                    </div>
                                    <div className='flex items-center gap-2'>
                                        <span className='text-xs w-8'>
                                            2 stars
                                        </span>
                                        <div className='flex-1 h-2 bg-gray-200 rounded-full overflow-hidden'>
                                            <div className='h-full bg-yellow-400 w-[3%]'></div>
                                        </div>
                                    </div>
                                    <div className='flex items-center gap-2'>
                                        <span className='text-xs w-8'>
                                            1 star
                                        </span>
                                        <div className='flex-1 h-2 bg-gray-200 rounded-full overflow-hidden'>
                                            <div className='h-full bg-yellow-400 w-[2%]'></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default VideoContent;
