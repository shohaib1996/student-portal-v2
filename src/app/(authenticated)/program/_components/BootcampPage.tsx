'use client';

import React, { JSX, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import dayjs from 'dayjs';
import parse from 'html-react-parser';

// Icons
import {
    ArrowRight,
    Award,
    Book,
    Calendar,
    CheckCircle2,
    Clock,
    Layers,
    LayoutDashboard,
    School,
    Users,
} from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';

// Custom Components
import GlobalHeader from '@/components/global/GlobalHeader';
import CourseSectionOpenButton from '@/components/global/SelectModal/buttons/course-section-open-button';
import WhatWillLearn from './WhatWillLearn';
import Recognition from './Recognition';
import BenefitsCourse from './BenefitsCourse';

// API Hooks
import {
    useGetMyProgressQuery,
    useMyProgramQuery,
} from '@/redux/api/myprogram/myprogramApi';
import { useGetPortalDataQuery } from '@/redux/api/dashboard/calendarApi';
import {
    useCourseContentQuery,
    usePostCourseProgramsMutation,
} from '@/redux/api/course/courseApi';

// Helpers
import { formatDateToCustomString } from '@/lib/formatDateToCustomString';

// Types
import {
    ICourseData,
    TBootcampResult,
    TProgram,
    TProgramMain,
    TProgressChart,
} from '@/types';

const BootcampSkeleton = () => (
    <div className='overflow-hidden mt-2'>
        <div className='p-2 md:p-4 bg-foreground grid gap-5 grid-cols-2 border border-forground-border rounded-lg shadow-sm'>
            <div className='space-y-3'>
                <div className='bg-background animate-skeleton h-8 w-1/2 rounded-lg'></div>
                <div className='flex gap-2'>
                    <div className='bg-background animate-skeleton h-4 w-full rounded-lg'></div>
                    <div className='bg-background animate-skeleton h-4 w-full rounded-lg'></div>
                    <div className='bg-background animate-skeleton h-4 w-full rounded-lg'></div>
                    <div className='bg-background animate-skeleton h-4 w-full rounded-lg'></div>
                </div>
                <div className='bg-background animate-skeleton h-4 w-full rounded-lg'></div>
                <div className='bg-background animate-skeleton h-4 w-2/3 rounded-lg'></div>
                <div className='grid rounded-lg p-2 grid-cols-2 gap-3'>
                    <div className='bg-background animate-skeleton h-8 w-full rounded-lg'></div>
                    <div className='bg-background animate-skeleton h-8 w-full rounded-lg'></div>
                    <div className='bg-background animate-skeleton h-8 w-full rounded-lg'></div>
                    <div className='bg-background animate-skeleton h-8 w-full rounded-lg'></div>
                </div>
                <div className='grid bg-background animate-skeleton rounded-lg p-2 grid-cols-2 gap-3'>
                    <div className='bg-foreground animate-skeleton h-14 w-1/2 rounded-lg'></div>
                    <div className='bg-foreground animate-skeleton h-14 w-1/2 rounded-lg'></div>
                    <div className='bg-foreground animate-skeleton h-14 w-1/2 rounded-lg'></div>
                    <div className='bg-foreground animate-skeleton h-14 w-1/2 rounded-lg'></div>
                </div>
                <div className='flex gap-2'>
                    <div className='bg-background animate-skeleton h-10 w-52 rounded-lg'></div>
                    <div className='bg-background animate-skeleton h-10 w-52 rounded-lg'></div>
                </div>
            </div>
            <div className='h-96 w-full rounded-lg bg-background animate-skeleton'></div>
        </div>
        <div className='flex p-4 gap-3 animate-skeleton bg-foreground mt-2 border border-forground-border rounded-lg'>
            <div className='w-full h-32 animate-skeleton rounded-md flex flex-col justify-center p-3 bg-background'>
                <div className='bg-foreground animate-skeleton w-full h-5 rounded-md'></div>
                <div className='bg-foreground animate-skeleton w-2/3 mt-3 h-5 rounded-md'></div>
            </div>
            <div className='w-full h-32 animate-skeleton rounded-md flex flex-col justify-center p-3 bg-background'>
                <div className='bg-foreground animate-skeleton w-full h-5 rounded-md'></div>
                <div className='bg-foreground animate-skeleton w-2/3 mt-3 h-5 rounded-md'></div>
            </div>
            <div className='w-full animate-skeleton h-32 rounded-md flex flex-col justify-center p-3 bg-background'>
                <div className='bg-foreground animate-skeleton w-full h-5 rounded-md'></div>
                <div className='bg-foreground animate-skeleton w-2/3 mt-3 h-5 rounded-md'></div>
            </div>
        </div>
    </div>
);

const ProgressStats = ({
    totalCompleted,
    totalIncomplete,
    inProgress,
}: {
    totalCompleted: number;
    totalIncomplete: number;
    inProgress: number;
}) => (
    <div className='shadow border rounded-md bg-primary-foreground p-2.5 my-3'>
        <div className='flex items-center justify-between mb-2'>
            <h3 className='text-lg font-semibold'>Your Progress</h3>
            <span className='text-sm font-medium text-primary-white'>
                {inProgress || 0}%
            </span>
        </div>
        <Progress value={inProgress || 0} className='h-2 mb-2 bg-background' />
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div className='bg-green-50 dark:bg-background rounded-lg p-4 flex items-center gap-2.5'>
                <div className='h-10 w-10 flex items-center justify-center rounded-sm bg-green-100 dark:bg-foreground'>
                    <CheckCircle2 className='h-5 w-5 text-green-500' />
                </div>
                <div>
                    <div className='text-sm text-black'>Completed</div>
                    <div className='text-xl font-semibold'>
                        {totalCompleted || 0}
                    </div>
                </div>
            </div>
            <div className='bg-amber-50 dark:bg-background rounded-lg p-4 flex items-center gap-2.5'>
                <div className='h-10 w-10 flex items-center justify-center rounded-sm bg-amber-100 dark:bg-foreground'>
                    <Clock className='h-5 w-5 text-amber-500' />
                </div>
                <div>
                    <div className='text-sm text-black'>In Progress</div>
                    <div className='text-xl font-semibold'>
                        {inProgress || 0}%
                    </div>
                </div>
            </div>
            <div className='bg-purple-50 dark:bg-background rounded-lg p-4 flex items-center gap-2.5'>
                <div className='h-10 w-10 flex items-center justify-center rounded-sm bg-purple-100 dark:bg-foreground'>
                    <Layers className='h-5 w-5 text-purple-500' />
                </div>
                <div>
                    <div className='text-sm text-black'>Remaining</div>
                    <div className='text-xl font-semibold'>
                        {totalIncomplete || 0}
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const ProgramStats = ({
    program,
    totalItems,
    totalModule = 0,
}: {
    program: TProgram;
    totalItems: number;
    totalModule: number;
}) => (
    <div className='grid grid-cols-1 md:grid-cols-3 gap-4 my-2.5'>
        <Card className='rounded-md shadow-none'>
            <CardContent className='px-2.5 py-3 flex items-center gap-4'>
                <div className='bg-primary-light p-3 rounded-full'>
                    <Clock className='h-6 w-6 text-blue-600' />
                </div>
                <div>
                    <p className='text-sm text-black'>Lesson</p>
                    <h4 className='text-xl font-semibold'>{totalItems || 0}</h4>
                    <p className='text-xs text-gray'>Full-time commitment</p>
                </div>
            </CardContent>
        </Card>
        <Card className='rounded-md shadow-none'>
            <CardContent className='px-2.5 py-3 flex items-center gap-4'>
                <div className='bg-purple-100 dark:bg-primary-light p-3 rounded-full'>
                    <Layers className='h-6 w-6 text-purple-600' />
                </div>
                <div>
                    <p className='text-sm text-black'>Modules</p>
                    <h4 className='text-xl font-semibold'>
                        {totalModule} Modules
                    </h4>
                    <p className='text-xs text-gray'>120+ hours of content</p>
                </div>
            </CardContent>
        </Card>
        <Card className='rounded-md shadow-none'>
            <CardContent className='px-2.5 py-3 flex items-center gap-4'>
                <div className='bg-green-100 dark:bg-primary-light p-3 rounded-full'>
                    <Award className='h-6 w-6 text-green-600' />
                </div>
                <div>
                    <p className='text-sm text-black'>Certifications</p>
                    <h4 className='text-xl font-semibold'>
                        Industry Recognized
                    </h4>
                    <p className='text-xs text-gray'>
                        {program?.title} certifications
                    </p>
                </div>
            </CardContent>
        </Card>
    </div>
);

export default function BootcampPage() {
    const router = useRouter();

    // API Queries
    const { data, isLoading, isError } = useMyProgramQuery({});
    const { data: bootCampData } = useGetPortalDataQuery({ bootcamp: {} });
    const [chapterData, setChapterData] = useState(null);
    const {
        data: myProgress,
        isLoading: isProgressLoading,
        isError: isProgressError,
    } = useGetMyProgressQuery<{
        data: TProgressChart;
        isLoading: boolean;
        isError: boolean;
    }>({});

    // Handle loading and error states
    if (isLoading || isProgressLoading) {
        return <BootcampSkeleton />;
    }
    if (isError || isProgressError) {
        return <p>Error fetching data</p>;
    }

    const myProgram: TProgramMain = data as TProgramMain;
    const program: TProgram = myProgram?.program;
    const bootcamp: TBootcampResult[] =
        bootCampData?.data?.bootcamp?.results || [];

    const totalCompleted =
        bootcamp.reduce((acc, curr) => acc + Number(curr.completedItems), 0) ||
        0;
    const totalIncomplete =
        bootcamp.reduce(
            (acc, curr) => acc + Number(curr.incompletedItems),
            0,
        ) || 0;
    const totalModule =
        bootcamp.reduce((acc, curr) => acc + Number(curr.totalItems), 0) || 0;
    const inProgress =
        Math.round(
            (totalCompleted / (totalCompleted + totalIncomplete)) * 100,
        ) || 0;

    const getSectionComponent = (sectionId: string, index: number) => {
        const sections: { [key: string]: JSX.Element | false } = {
            whatYouLearn: program?.whatLearns?.length > 0 && (
                <WhatWillLearn bootcamp={program} index={index} />
            ),
            benefits: program?.benefits?.length > 0 && (
                <BenefitsCourse
                    list={program?.benefits}
                    buttonShow={false}
                    title='Benefits of the course'
                    index={index}
                />
            ),
            recognition: program?.recognition && (
                <Recognition data={program?.recognition} index={index} />
            ),
        };
        return sections[sectionId] || null;
    };

    return (
        <TooltipProvider>
            <Separator className='my-1' />
            <div className='p-0'>
                <GlobalHeader
                    title='Bootcamps'
                    subTitle='Continue learning to keep moving forward'
                    buttons={
                        <div className='flex items-center gap-1.5'>
                            <Button
                                variant='outline'
                                className='flex items-center gap-2'
                                onClick={() =>
                                    router.push('/dashboard/leaderboard')
                                }
                            >
                                <Users className='h-4 w-4' />
                                Leaderboard
                            </Button>
                            <Button
                                variant='outline'
                                className='flex items-center gap-2'
                                onClick={() =>
                                    router.push('/dashboard/progress')
                                }
                            >
                                <LayoutDashboard className='h-4 w-4' />
                                Progress
                            </Button>
                        </div>
                    }
                />

                <div className='grid grid-cols-1 xl:grid-cols-2 gap-6 my-2 px-3 py-2 bg-foreground rounded-md border'>
                    <div>
                        <h2 className='text-2xl font-bold mb-2'>
                            {program?.title}
                        </h2>
                        <div className='flex flex-wrap items-center gap-x-6 gap-y-2 mb-2'>
                            <div className='flex items-center gap-1 text-sm'>
                                <Clock className='h-4 w-4 text-green-500' />
                                <span>
                                    Last updated{' '}
                                    {dayjs(program.updatedAt).fromNow()}
                                </span>
                            </div>
                            <div className='flex items-center gap-1 text-sm'>
                                <Layers className='h-4 w-4 text-purple-500' />
                                <span>{totalModule || 0}</span>
                            </div>
                        </div>
                        <div className='text-gray line-clamp-2'>
                            {parse(program?.description)}
                        </div>
                        <div className='grid grid-cols-1 md:grid-cols-2 space-y-3 my-2.5'>
                            <div className='flex items-center gap-2'>
                                <p className='flex items-center gap-2 font-semibold'>
                                    <span className='flex items-center gap-2'>
                                        <School className='h-5 w-5 mr-1' />
                                        Company:
                                    </span>
                                    <span className='text-gray text-wrap lg:text-nowrap'>
                                        {data?.enrollment?.organization?.name}
                                    </span>
                                </p>
                            </div>
                            <div className='flex items-center gap-2'>
                                <p className='flex items-center gap-2 font-semibold'>
                                    <Book className='h-5 w-5 mr-1' />
                                    Branch:
                                    <span className='text-gray'>
                                        {data?.enrollment?.branch?.name}
                                    </span>
                                </p>
                            </div>
                            <div className='flex items-center gap-2'>
                                <p className='flex items-center gap-2 font-semibold'>
                                    <Calendar className='h-5 w-5 mr-1' />
                                    Session:
                                    <span className='text-gray'>
                                        {data?.enrollment?.session?.name}
                                    </span>
                                </p>
                            </div>
                            <div className='flex items-center gap-2'>
                                <div className='flex items-center gap-2 font-semibold'>
                                    <div className='h-6 w-6 rounded-full overflow-hidden'>
                                        <Image
                                            src={program?.instructor?.image}
                                            alt='Instructor Avatar'
                                            width={20}
                                            height={20}
                                            className='object-cover w-full h-full'
                                        />
                                    </div>
                                    {program?.instructor?.name}
                                </div>
                            </div>
                        </div>
                        <ProgressStats
                            totalCompleted={totalCompleted}
                            totalIncomplete={totalIncomplete}
                            inProgress={inProgress}
                        />
                        <div className='flex items-center gap-4'>
                            <Link href={`/program/${program?.slug}`}>
                                <Button className='flex items-center gap-2'>
                                    Go to Bootcamp
                                    <ArrowRight className='h-4 w-4' />
                                </Button>
                            </Link>
                            <CourseSectionOpenButton
                                title='Switch Bootcamp'
                                icon={
                                    <svg
                                        xmlns='http://www.w3.org/2000/svg'
                                        width='16'
                                        height='16'
                                        viewBox='0 0 24 24'
                                        fill='none'
                                        stroke='currentColor'
                                        strokeWidth='2'
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                        className='mr-1'
                                    >
                                        <path d='M16 3H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Z' />
                                        <path d='M12 17h.01' />
                                    </svg>
                                }
                            />
                        </div>
                    </div>
                    <div>
                        <div className='bg-[#0a2540] text-white rounded-lg overflow-hidden shadow-sm h-full'>
                            <div className='flex flex-col items-center justify-between h-full'>
                                <img
                                    src={program?.image || '/placeholder.svg'}
                                    className='w-100 h-100'
                                    alt={program?.title || 'Bootcamp image'}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <ProgramStats
                    program={program}
                    totalItems={totalCompleted + totalIncomplete}
                    totalModule={totalModule}
                />
                {program?.layoutSections?.map((section: any, index: number) => {
                    if (section?.isVisible) {
                        return (
                            <div key={section.id}>
                                {getSectionComponent(section.id, index)}
                            </div>
                        );
                    }
                    return null;
                })}
            </div>
        </TooltipProvider>
    );
}

function renderTechIcon(icon: string) {
    switch (icon) {
        case 'html5':
            return (
                <svg
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 24 24'
                    fill='#E44D26'
                    className='w-8 h-8'
                >
                    <path d='M1.5 0h21l-1.91 21.563L11.977 24l-8.564-2.438L1.5 0zm7.031 9.75l-.232-2.718 10.059.003.23-2.622L5.412 4.41l.698 8.01h9.126l-.326 3.426-2.91.804-2.955-.81-.188-2.11H6.248l.33 4.171L12 19.351l5.379-1.443.744-8.157H8.531z' />
                </svg>
            );
        default:
            return <div className='w-8 h-8 bg-gray-200 rounded-full'></div>;
    }
}
