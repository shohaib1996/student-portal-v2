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

type Status = 'approved' | 'pending' | 'cancelled';

const program = {
    id: '1',
    title: 'AWS DevOps And CloudOps Engineer',
    image: '/switchprogram.jpg',
    rating: 5.0,
    status: 'approved' as Status,
    user: {
        name: 'John Doe',
        avatar: '/avatar.png',
        online: true,
    },
    organization: 'Org With Logo',
    branch: 'TS4U IT Engineer Bootcamps',
    date: 'Dec-2023',
    payment: {
        totalFee: 12000,
        paid: 4000,
        due: 8000,
    },
    progress: 65,
    switched: false,
};

const userProgress = {
    name: 'Vivienne Westwood',
    avatar: '/avatar.png',
    rank: 20,
    score: 543,
    improvement: 45,
};

const ProgressComp = () => {
    const router = useRouter();
    return (
        <>
            <GlobalHeader
                title={
                    <span className='flex items-center justify-center gap-1'>
                        <ArrowLeft
                            onClick={() => router.push('/dashboard/program')}
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
                                            src='/avatar.png'
                                            alt={userProgress.name}
                                            width={40}
                                            height={40}
                                            className='rounded-full'
                                        />
                                    </div>
                                    <span className='font-medium text-black'>
                                        {userProgress.name}
                                    </span>
                                </div>

                                <div className='grid grid-cols-3 gap-2'>
                                    <div className='bg-[#FBF5FF] p-3 rounded-lg'>
                                        <div className='text-xs text-gray'>
                                            Current Rank
                                        </div>
                                        <div className='font-semibold text-base text-[#875BC9]'>
                                            #{userProgress.rank}
                                        </div>
                                    </div>
                                    <div className='bg-yellow-50 p-3 rounded-lg'>
                                        <div className='text-xs text-gray'>
                                            Your Score
                                        </div>
                                        <div className='font-bold text-yellow-600'>
                                            {userProgress.score}
                                        </div>
                                    </div>
                                    <div className='bg-green-50 p-3 rounded-lg'>
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
                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-2'>
                            {/* Overall Progress */}
                            <div className='bg-foreground rounded-xl border border-border py-4 px-3 flex items-center justify-between'>
                                <div className=''>
                                    <h3 className='text-base font-medium text-black'>
                                        Overall Progress
                                    </h3>

                                    <div className='text-3xl font-bold text-black my-2.5'>
                                        80%
                                    </div>
                                    <div className='text-sm text-gray font-medium'>
                                        58 out of 700
                                    </div>
                                </div>
                                <RadialProgress
                                    value={80}
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
                                        65%
                                    </div>
                                    <div className='text-sm text-gray font-medium'>
                                        48 out of 100 activities
                                    </div>
                                </div>
                                <RadialProgress
                                    value={65}
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
                                        75%
                                    </div>
                                    <div className='text-sm text-gray font-medium'>
                                        113 out of 150 reviews
                                    </div>
                                </div>
                                <RadialProgress
                                    value={75}
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
                                        50%
                                    </div>
                                    <div className='text-sm text-gray font-medium'>
                                        50 out of 100
                                    </div>
                                </div>
                                <RadialProgress
                                    value={50}
                                    size='md'
                                    thickness='medium'
                                    color='primary'
                                />
                            </div>
                        </div>

                        {/* Documents Section */}
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-2 mb-2'>
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
                                            <div className='w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center'>
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
                                                <h4 className='font-medium text-gray-900'>
                                                    Documents & Labs
                                                </h4>
                                            </div>
                                        </div>
                                        <div className='text-2xl font-bold text-gray-900 mb-1'>
                                            72
                                        </div>
                                        <div className='text-xs text-gray-500'>
                                            All documents & labs
                                        </div>
                                    </div>

                                    {/* Uploaded Documents */}
                                    <div className='bg-foreground border border-border rounded-lg p-4'>
                                        <div className='flex items-center gap-2 mb-2'>
                                            <div className='w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center'>
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
                                                <h4 className='font-medium text-gray-900'>
                                                    Uploaded Documents
                                                </h4>
                                            </div>
                                        </div>
                                        <div className='text-2xl font-bold text-gray-900 mb-1'>
                                            35
                                        </div>
                                        <div className='text-xs text-gray-500'>
                                            All uploaded documents
                                        </div>
                                    </div>

                                    {/* Presentations/Slides */}
                                    <div className='bg-foreground border border-border rounded-lg p-4'>
                                        <div className='flex items-center gap-2 mb-2'>
                                            <div className='w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center'>
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
                                                <h4 className='font-medium text-gray-900'>
                                                    Presentations/Slides
                                                </h4>
                                            </div>
                                        </div>
                                        <div className='text-2xl font-bold text-gray-900 mb-1'>
                                            72
                                        </div>
                                        <div className='text-xs text-gray-500'>
                                            All documents
                                        </div>
                                    </div>

                                    {/* Templates */}
                                    <div className='bg-foreground border border-border rounded-lg p-4'>
                                        <div className='flex items-center gap-2 mb-2'>
                                            <div className='w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center'>
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
                                                <h4 className='font-medium text-gray-900'>
                                                    Templates
                                                </h4>
                                            </div>
                                        </div>
                                        <div className='text-2xl font-bold text-gray-900 mb-1'>
                                            35
                                        </div>
                                        <div className='text-xs text-gray-500'>
                                            All templates
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Technical Test */}
                            <div className='bg-foreground rounded-xl border border-border py-2.5 px-2'>
                                <TechnicalTestChart />
                            </div>
                        </div>

                        {/* Mock Interview & Calendar Section */}
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-2 mb-2'>
                            <div className='bg-foreground rounded-xl border border-border p-2 mb-2'>
                                <MockInterviewChart />
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
                                        href='#'
                                        className='text-sm text-primary bg-primary-light hover:bg-primary hover:text-white font-medium flex items-center gap-0.5 py-2 px-2.5 rounded-lg'
                                    >
                                        View More
                                        <ArrowRight />
                                    </Link>
                                </div>

                                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                    {/* Audios & Videos */}
                                    <div className='bg-primary-light rounded-lg p-4'>
                                        <div className='flex items-center gap-2 mb-3'>
                                            <div className='w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center'>
                                                <svg
                                                    width='16'
                                                    height='16'
                                                    viewBox='0 0 24 24'
                                                    fill='none'
                                                    xmlns='http://www.w3.org/2000/svg'
                                                    className='text-blue-600'
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
                                            <h3 className='font-medium text-gray-700'>
                                                Audios & Videos
                                            </h3>
                                        </div>

                                        <div className='text-2xl font-bold text-gray-900 mb-1'>
                                            Total 80
                                        </div>
                                        <p className='text-sm text-gray-500 mb-3'>
                                            Completed audios and videos
                                            <br />
                                            78 out of 123
                                        </p>

                                        <Link
                                            href='#'
                                            className='text-sm text-blue-600 font-medium hover:underline flex items-center'
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
                                            <div className='w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center'>
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
                                            <h3 className='font-medium text-gray-700'>
                                                Community
                                            </h3>
                                        </div>

                                        <div className='text-2xl font-bold text-gray-900 mb-1'>
                                            45
                                        </div>
                                        <p className='text-sm text-gray-500 mb-3'>
                                            Total 45 posts
                                        </p>

                                        <Link
                                            href='#'
                                            className='text-sm text-blue-600 font-medium hover:underline flex items-center'
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
                        <div className='bg-foreground rounded-xl border border-border p-4 mb-6'>
                            <div className='flex justify-between items-center mb-4'>
                                <div>
                                    <h3 className='font-medium text-gray-700'>
                                        Calendar
                                    </h3>
                                    <p className='text-sm text-gray-500'>
                                        All the details about the calendar event
                                        are here
                                    </p>
                                </div>
                                <Link
                                    href='#'
                                    className='text-sm text-blue-600 font-medium hover:underline flex items-center'
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

                            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                                {/* Total Accepted */}
                                <div className='bg-green-50 rounded-lg p-4'>
                                    <div className='flex items-center gap-2 mb-2'>
                                        <div className='w-6 h-6 bg-green-100 rounded-full flex items-center justify-center'>
                                            <Check className='h-3 w-3 text-green-600' />
                                        </div>
                                        <span className='text-sm font-medium text-gray-700'>
                                            Total Accepted
                                        </span>
                                    </div>
                                    <div className='text-2xl font-bold text-gray-900 mb-2'>
                                        72
                                    </div>
                                    <Progress
                                        value={35}
                                        className='h-2 bg-white text-green-500'
                                        indicatorClass='bg-green-700'
                                    />
                                    <div className='text-xs text-gray-500 text-right mt-1'>
                                        35%
                                    </div>
                                </div>

                                {/* Total pending */}
                                <div className='bg-orange-50 rounded-lg p-4'>
                                    <div className='flex items-center gap-2 mb-2'>
                                        <div className='w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center'>
                                            <Clock className='h-3 w-3 text-orange-600' />
                                        </div>
                                        <span className='text-sm font-medium text-gray-700'>
                                            Total pending
                                        </span>
                                    </div>
                                    <div className='text-2xl font-bold text-gray-900 mb-2'>
                                        25
                                    </div>
                                    <Progress
                                        value={28}
                                        className='h-2 bg-white text-orange-500'
                                        indicatorClass='bg-orange-700'
                                    />
                                    <div className='text-xs text-gray-500 text-right mt-1'>
                                        28%
                                    </div>
                                </div>

                                {/* Denied */}
                                <div className='bg-red-50 rounded-lg p-4'>
                                    <div className='flex items-center gap-2 mb-2'>
                                        <div className='w-6 h-6 bg-red-100 rounded-full flex items-center justify-center'>
                                            <svg
                                                width='12'
                                                height='12'
                                                viewBox='0 0 24 24'
                                                fill='none'
                                                xmlns='http://www.w3.org/2000/svg'
                                                className='text-red-600'
                                            >
                                                <path
                                                    d='M6 18L18 6M6 6l12 12'
                                                    stroke='currentColor'
                                                    strokeWidth='2'
                                                    strokeLinecap='round'
                                                    strokeLinejoin='round'
                                                />
                                            </svg>
                                        </div>
                                        <span className='text-sm font-medium text-gray-700'>
                                            Denied
                                        </span>
                                    </div>
                                    <div className='text-2xl font-bold text-gray-900 mb-2'>
                                        72
                                    </div>
                                    <Progress
                                        value={15}
                                        className='h-2 bg-white'
                                        indicatorClass='bg-red-700'
                                    />
                                    <div className='text-xs text-gray-500 text-right mt-1'>
                                        15%
                                    </div>
                                </div>

                                {/* Proposed New Time */}
                                <div className='bg-cyan-50 rounded-lg p-4'>
                                    <div className='flex items-center gap-2 mb-2'>
                                        <div className='w-6 h-6 bg-cyan-100 rounded-full flex items-center justify-center'>
                                            <svg
                                                width='12'
                                                height='12'
                                                viewBox='0 0 24 24'
                                                fill='none'
                                                xmlns='http://www.w3.org/2000/svg'
                                                className='text-cyan-600'
                                            >
                                                <path
                                                    d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                                                    stroke='currentColor'
                                                    strokeWidth='2'
                                                    strokeLinecap='round'
                                                    strokeLinejoin='round'
                                                />
                                            </svg>
                                        </div>
                                        <span className='text-sm font-medium text-gray-700'>
                                            Proposed New Time
                                        </span>
                                    </div>
                                    <div className='text-2xl font-bold text-gray-900 mb-2'>
                                        72
                                    </div>
                                    <Progress
                                        value={21}
                                        className='h-2 bg-white'
                                        indicatorClass='bg-cyan-700'
                                    />
                                    <div className='text-xs text-gray-500 text-right mt-1'>
                                        21%
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ProgressComp;
