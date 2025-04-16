'use client';
import GlobalHeader from '@/components/global/GlobalHeader';
import { ArrowLeft, Check, Clock, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';
import ProgramCard from '../../switch-program/_components/ProgramCard';
import Image from 'next/image';
import { RadialProgress } from '@/components/global/RadialProgress';
import { TechnicalTestChart } from './TechnicalTestChat';
import { MockInterviewChart } from './MockInterviewChart';
import Link from 'next/link';
import { Progress } from '@/components/ui/progress';
import {
    useGetLeaderboardQuery,
    useGetMyProgressQuery,
    useMyProgramQuery,
} from '@/redux/api/myprogram/myprogramApi';
import { TProgram, TProgressChart } from '@/types';
import dayjs from 'dayjs';
import BottomCalendar from './BottomCalendar';
import { useAppSelector } from '@/redux/hooks';

type Status = 'approved' | 'pending' | 'cancelled';

const ProgressComp = () => {
    const router = useRouter();
    const { user } = useAppSelector((state) => state.auth);
    const { data, isLoading, isError, error } = useGetLeaderboardQuery({});
    const {
        data: myProgram,
        isLoading: isProgramLoading,
        isError: myProgramError,
    } = useMyProgramQuery({});

    const {
        data: myProgress,
        isLoading: isProgressLoading,
        isError: isProgressError,
    } = useGetMyProgressQuery<{
        data: TProgressChart;
        isLoading: boolean;
        isError: boolean;
    }>({});

    const programData: TProgram = myProgram?.program;

    const program = {
        id: '1',
        title: programData?.title,
        image: programData?.image,
        rating: 5.0,
        status: 'approved' as Status,
        user: {
            name: programData?.instructor?.name,
            avatar: programData?.instructor?.image,
            online: programData?.instructor?.isActive,
        },
        organization: 'N/A',
        branch: 'TS4U IT Engineer Bootcamps',
        date: dayjs(programData?.createdAt).format('MMM-YYYY'),
        payment: {
            totalFee: 0,
            paid: 0,
            due: 0,
        },
        progress: 0,
        switched: true,
    };

    // User progress data
    const userProgress = {
        name: user?.fullName,
        avatar: user?.profilePicture,
        rank: data?.myData?.rank,
        score: myProgress?.metrics?.totalObtainedMark,
        improvement: myProgress?.metrics?.overallPercentageAllItems,
    };

    function calculatePercentage(count: number, limit: number) {
        if (limit === 0) {
            return 0;
        }
        const percentage = (count / limit) * 100;
        return Math.min(Math.round(percentage), 100);
    }

    const processedData = myProgress?.results?.reduce(
        (acc, item) => {
            acc[item.id] = {
                limit: item.limit,
                count: item.count,
                percentage: calculatePercentage(item.count, item.limit),
                additionalData: item.additionalData,
            };
            return acc;
        },
        {} as Record<
            string,
            {
                limit: number;
                count: number;
                percentage: number;
                additionalData?: object;
            }
        >,
    );

    return (
        <div className='pt-2'>
            <GlobalHeader
                title={
                    <span className='flex items-center justify-center gap-1'>
                        <ArrowLeft
                            onClick={() => router.push('/program')}
                            size={18}
                            className='cursor-pointer'
                        />
                        My Progress
                    </span>
                }
                subTitle='Track Your Growth, One Step at a Time'
            />

            <div className='my-2'>
                <div className='flex flex-col lg:flex-row gap-2'>
                    {/* Left Sidebar */}
                    <div className=''>
                        {/* Program Card */}
                        <ProgramCard program={program} key={program.id} />

                        {/* User Progress */}
                        <div className='bg-foreground rounded-xl overflow-hidden border border-border mt-2.5 p-2.5'>
                            <h3 className='font-semibold text-black capitalize'>
                                Your Progress
                            </h3>

                            <div>
                                <div className='flex items-center gap-3 my-2'>
                                    <div className='relative'>
                                        <Image
                                            src={
                                                userProgress.avatar ||
                                                '/avatar.png'
                                            }
                                            alt={
                                                userProgress.name ||
                                                'Profile Picture'
                                            }
                                            width={40}
                                            height={40}
                                            className='rounded-full'
                                        />
                                    </div>
                                    <span className='font-medium text-black'>
                                        {userProgress.name || 'N/A'}
                                    </span>
                                </div>

                                <div className='grid grid-cols-3 gap-2'>
                                    <div className='bg-[#FBF5FF] dark:bg-background p-3 rounded-lg'>
                                        <div className='text-xs text-gray'>
                                            Current Rank
                                        </div>
                                        <div className='font-semibold text-base text-[#875BC9]'>
                                            #{userProgress.rank}
                                        </div>
                                    </div>
                                    <div className='bg-yellow-50 dark:bg-background p-3 rounded-lg'>
                                        <div className='text-xs text-gray'>
                                            Your Score
                                        </div>
                                        <div className='font-bold text-yellow-600'>
                                            {userProgress.score}
                                        </div>
                                    </div>
                                    <div className='bg-green-50 dark:bg-background p-3 rounded-lg'>
                                        <div className='text-xs text-gray'>
                                            Improvement
                                        </div>
                                        <div className='font-bold text-green-600'>
                                            {userProgress.improvement}%
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content - Chart Progress Bar*/}
                    <div className='flex-1'>
                        {/* Top Progress Cards */}
                        <div className='grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-2 mb-2'>
                            {/* Overall Progress */}
                            <div className='bg-foreground rounded-xl border border-border py-4 px-3 flex items-center justify-between'>
                                <div className=''>
                                    <h3 className='text-base font-medium text-black'>
                                        Overall Progress
                                    </h3>

                                    <div className='text-3xl font-bold text-black my-2.5'>
                                        {myProgress?.metrics
                                            ?.overallPercentageAllItems || 0}
                                        %
                                    </div>
                                    <div className='text-sm text-gray font-medium'>
                                        {myProgress?.metrics?.totalObtainedMark}{' '}
                                        out of {myProgress?.metrics?.totalMark}
                                    </div>
                                </div>
                                <RadialProgress
                                    value={
                                        myProgress?.metrics
                                            ?.overallPercentageAllItems || 0
                                    }
                                    size='md'
                                    thickness='medium'
                                    color='success'
                                />
                            </div>

                            {/* Daily Activities */}
                            <div className='bg-foreground rounded-xl border border-border py-4 px-3 flex items-center justify-between'>
                                <div className=''>
                                    <h3 className='text-base font-medium text-black'>
                                        Daily Activities
                                    </h3>

                                    <div className='text-3xl font-bold text-black my-2.5'>
                                        {processedData?.day2day?.percentage ||
                                            0}
                                        %
                                    </div>
                                    <div className='text-sm text-gray font-medium'>
                                        {processedData?.day2day?.count} out of{' '}
                                        {processedData?.day2day?.limit}{' '}
                                        activities
                                    </div>
                                </div>
                                <RadialProgress
                                    value={
                                        processedData?.day2day?.percentage || 0
                                    }
                                    size='md'
                                    thickness='medium'
                                    color='warning'
                                />
                            </div>

                            {/* Reviews */}
                            <div className='bg-foreground rounded-xl border border-border py-4 px-3 flex items-center justify-between'>
                                <div className=''>
                                    <h3 className='text-base font-medium text-black'>
                                        Reviews
                                    </h3>

                                    <div className='text-3xl font-bold text-black my-2.5'>
                                        {processedData?.review?.percentage || 0}
                                        %
                                    </div>
                                    <div className='text-sm text-gray font-medium'>
                                        {processedData?.review?.count} out of{' '}
                                        {processedData?.review?.count} reviews
                                    </div>
                                </div>
                                <RadialProgress
                                    value={
                                        processedData?.review?.percentage || 0
                                    }
                                    size='md'
                                    thickness='medium'
                                    color='info'
                                />
                            </div>

                            {/* Messages */}
                            <div className='bg-foreground rounded-xl border border-border py-4 px-3 flex items-center justify-between'>
                                <div className=''>
                                    <h3 className='text-base font-medium text-black'>
                                        Messages
                                    </h3>

                                    <div className='text-3xl font-bold text-black my-2.5'>
                                        {processedData?.messages?.percentage ||
                                            0}
                                        %
                                    </div>
                                    <div className='text-sm text-gray font-medium'>
                                        {processedData?.messages?.count} out of{' '}
                                        {processedData?.messages?.limit}
                                    </div>
                                </div>
                                <RadialProgress
                                    value={
                                        processedData?.messages?.percentage || 0
                                    }
                                    size='md'
                                    thickness='medium'
                                    color='primary'
                                />
                            </div>
                        </div>

                        {/* Documents Section */}
                        <div className='grid grid-cols-1 2xl:grid-cols-2 gap-2 mb-2'>
                            {/* Documents */}
                            <div className='bg-foreground rounded-xl border border-border p-2'>
                                <div className='border-b border-border'>
                                    <h3 className='font-medium text-black mb-1'>
                                        Documents
                                    </h3>
                                    <p className='text-sm text-gray mb-2'>
                                        Access all your documents in one place
                                    </p>
                                </div>
                                <div className='grid grid-cols-2 gap-4 mt-2'>
                                    {/* Documents & Labs */}
                                    <div className='bg-foreground border border-border rounded-lg p-4'>
                                        <div className='flex items-center gap-2 mb-2'>
                                            <div className='w-8 h-8 bg-purple-100 dark:bg-background rounded-lg flex items-center justify-center'>
                                                <svg
                                                    width='20'
                                                    height='20'
                                                    viewBox='0 0 24 24'
                                                    fill='none'
                                                    xmlns='http://www.w3.org/2000/svg'
                                                    className='text-purple-600'
                                                >
                                                    <path
                                                        d='M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z'
                                                        stroke='currentColor'
                                                        strokeWidth='1.5'
                                                        strokeLinecap='round'
                                                        strokeLinejoin='round'
                                                    />
                                                </svg>
                                            </div>
                                            <div>
                                                <h4 className='font-medium text-black'>
                                                    Documents & Labs
                                                </h4>
                                            </div>
                                        </div>
                                        <div className='text-2xl font-bold text-black mb-1'>
                                            {processedData?.dcumentLabsComment
                                                ?.count || 0}
                                        </div>
                                        <div className='text-xs text-gray'>
                                            All documents & labs
                                        </div>
                                    </div>

                                    {/* Uploaded Documents */}
                                    <div className='bg-foreground border border-border rounded-lg p-4'>
                                        <div className='flex items-center gap-2 mb-2'>
                                            <div className='w-8 h-8 bg-blue-100 dark:bg-background rounded-lg flex items-center justify-center'>
                                                <svg
                                                    width='20'
                                                    height='20'
                                                    viewBox='0 0 24 24'
                                                    fill='none'
                                                    xmlns='http://www.w3.org/2000/svg'
                                                    className='text-blue-600'
                                                >
                                                    <path
                                                        d='M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5'
                                                        stroke='currentColor'
                                                        strokeWidth='1.5'
                                                        strokeLinecap='round'
                                                        strokeLinejoin='round'
                                                    />
                                                </svg>
                                            </div>
                                            <div>
                                                <h4 className='font-medium text-black'>
                                                    Uploaded Documents
                                                </h4>
                                            </div>
                                        </div>
                                        <div className='text-2xl font-bold text-black mb-1'>
                                            {processedData?.uploadedDocuments
                                                ?.count || 0}
                                        </div>
                                        <div className='text-xs text-gray'>
                                            All uploaded documents
                                        </div>
                                    </div>

                                    {/* Presentations/Slides */}
                                    <div className='bg-foreground border border-border rounded-lg p-4'>
                                        <div className='flex items-center gap-2 mb-2'>
                                            <div className='w-8 h-8 bg-amber-100 dark:bg-background rounded-lg flex items-center justify-center'>
                                                <svg
                                                    width='20'
                                                    height='20'
                                                    viewBox='0 0 24 24'
                                                    fill='none'
                                                    xmlns='http://www.w3.org/2000/svg'
                                                    className='text-amber-600'
                                                >
                                                    <path
                                                        d='M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605'
                                                        stroke='currentColor'
                                                        strokeWidth='1.5'
                                                        strokeLinecap='round'
                                                        strokeLinejoin='round'
                                                    />
                                                </svg>
                                            </div>
                                            <div>
                                                <h4 className='font-medium text-black'>
                                                    Presentations / Slides
                                                </h4>
                                            </div>
                                        </div>
                                        <div className='text-2xl font-bold text-black mb-1'>
                                            72
                                        </div>
                                        <div className='text-xs text-gray'>
                                            All documents
                                        </div>
                                    </div>

                                    {/* Templates */}
                                    <div className='bg-foreground border border-border rounded-lg p-4'>
                                        <div className='flex items-center gap-2 mb-2'>
                                            <div className='w-8 h-8 bg-green-100 dark:bg-background rounded-lg flex items-center justify-center'>
                                                <svg
                                                    width='20'
                                                    height='20'
                                                    viewBox='0 0 24 24'
                                                    fill='none'
                                                    xmlns='http://www.w3.org/2000/svg'
                                                    className='text-green-600'
                                                >
                                                    <path
                                                        d='M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5A3.375 3.375 0 006.375 7.5H5.25m11.9-3.664A2.251 2.251 0 0015 2.25h-1.5a2.251 2.251 0 00-2.15 1.586m5.8 0c.065.21.1.433.1.664v.75h-6V4.5c0-.231.035-.454.1-.664M6.75 7.5H4.875c-.621 0-1.125.504-1.125 1.125v12c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V16.5a9 9 0 00-9-9z'
                                                        stroke='currentColor'
                                                        strokeWidth='1.5'
                                                        strokeLinecap='round'
                                                        strokeLinejoin='round'
                                                    />
                                                </svg>
                                            </div>
                                            <div>
                                                <h4 className='font-medium text-black'>
                                                    Templates
                                                </h4>
                                            </div>
                                        </div>
                                        <div className='text-2xl font-bold text-black mb-1'>
                                            35
                                        </div>
                                        <div className='text-xs text-gray'>
                                            All templates
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Technical Test */}
                            <div className='bg-foreground rounded-xl border border-border py-2.5 px-2'>
                                <TechnicalTestChart
                                    data={
                                        processedData?.technicalTestAnswers
                                            ?.additionalData
                                    }
                                />
                            </div>
                        </div>

                        {/* Mock Interview & Calendar Section */}
                        <div className='grid grid-cols-1 2xl:grid-cols-2 gap-2 mb-2'>
                            <div className='bg-foreground rounded-xl border border-border p-2 mb-2'>
                                <MockInterviewChart
                                    data={
                                        processedData?.mockInterview
                                            ?.additionalData || {}
                                    }
                                />
                            </div>
                            <div className='bg-foreground rounded-xl border border-border p-2 mb-2'>
                                <div className='flex justify-between items-center mb-2 pb-2 border-b border-border'>
                                    <div>
                                        <h3 className='font-medium text-black'>
                                            Calendar
                                        </h3>
                                        <p className='text-sm text-gray'>
                                            All the details about the calendar
                                            event are here
                                        </p>
                                    </div>
                                    <Link
                                        href='/calendar'
                                        className='text-sm text-nowrap text-primary-white bg-primary-light hover:bg-primary hover:text-white font-medium flex items-center gap-0.5 py-2 px-2.5 rounded-lg'
                                    >
                                        View More
                                        <ArrowRight className='hidden md:block' />
                                    </Link>
                                </div>

                                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                    {/* Audios & Videos */}
                                    <div className='bg-primary-light rounded-lg p-4'>
                                        <div className='flex items-center gap-2 mb-3'>
                                            <div className='w-8 h-8 bg-blue-100 dark:bg-background rounded-full flex items-center justify-center'>
                                                <svg
                                                    width='16'
                                                    height='16'
                                                    viewBox='0 0 24 24'
                                                    fill='none'
                                                    xmlns='http://www.w3.org/2000/svg'
                                                    className='text-primary'
                                                >
                                                    <path
                                                        d='M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z'
                                                        stroke='currentColor'
                                                        strokeWidth='1.5'
                                                        strokeLinecap='round'
                                                        strokeLinejoin='round'
                                                    />
                                                </svg>
                                            </div>
                                            <h3 className='font-medium text-black'>
                                                Audios & Videos
                                            </h3>
                                        </div>

                                        <div className='text-2xl font-bold text-black mb-1'>
                                            Total 80
                                        </div>
                                        <p className='text-sm text-gray mb-3'>
                                            Completed audios and videos
                                            <br />
                                            78 out of 123
                                        </p>

                                        <Link
                                            href='#'
                                            className='text-sm text-primary-white font-medium hover:underline flex items-center'
                                        >
                                            View More
                                            <svg
                                                width='16'
                                                height='16'
                                                viewBox='0 0 16 16'
                                                fill='none'
                                                xmlns='http://www.w3.org/2000/svg'
                                                className='ml-1'
                                            >
                                                <path
                                                    d='M6.66675 12L10.6667 8L6.66675 4'
                                                    stroke='currentColor'
                                                    strokeWidth='2'
                                                    strokeLinecap='round'
                                                    strokeLinejoin='round'
                                                />
                                            </svg>
                                        </Link>
                                    </div>

                                    {/* Community */}
                                    <div className='bg-primary-light rounded-lg p-4'>
                                        <div className='flex items-center gap-2 mb-3'>
                                            <div className='w-8 h-8 bg-purple-100 dark:bg-background rounded-full flex items-center justify-center'>
                                                <svg
                                                    width='16'
                                                    height='16'
                                                    viewBox='0 0 24 24'
                                                    fill='none'
                                                    xmlns='http://www.w3.org/2000/svg'
                                                    className='text-purple-600'
                                                >
                                                    <path
                                                        d='M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z'
                                                        stroke='currentColor'
                                                        strokeWidth='1.5'
                                                        strokeLinecap='round'
                                                        strokeLinejoin='round'
                                                    />
                                                </svg>
                                            </div>
                                            <h3 className='font-medium text-black'>
                                                Community
                                            </h3>
                                        </div>

                                        <div className='text-2xl font-bold text-black mb-1'>
                                            {processedData?.communityPost
                                                ?.count || 0}
                                        </div>
                                        <p className='text-sm text-gray mb-3'>
                                            Total{' '}
                                            {processedData?.communityPost
                                                ?.count || 0}{' '}
                                            posts
                                        </p>

                                        <Link
                                            href='#'
                                            className='text-sm text-primary-white font-medium hover:underline flex items-center'
                                        >
                                            View More
                                            <svg
                                                width='16'
                                                height='16'
                                                viewBox='0 0 16 16'
                                                fill='none'
                                                xmlns='http://www.w3.org/2000/svg'
                                                className='ml-1'
                                            >
                                                <path
                                                    d='M6.66675 12L10.6667 8L6.66675 4'
                                                    stroke='currentColor'
                                                    strokeWidth='2'
                                                    strokeLinecap='round'
                                                    strokeLinejoin='round'
                                                />
                                            </svg>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Calendar Section with 4 cards */}
                        <BottomCalendar
                            data={processedData?.events?.additionalData || []}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProgressComp;
