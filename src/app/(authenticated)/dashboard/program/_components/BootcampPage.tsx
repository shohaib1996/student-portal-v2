'use client';
import {
    ArrowRight,
    Award,
    Book,
    Calendar,
    CheckCircle2,
    Clock,
    FileText,
    Layers,
    LayoutDashboard,
    School,
    Shield,
    Star,
    Users,
    Github,
    Router,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TooltipProvider } from '@/components/ui/tooltip';
import GlobalHeader from '@/components/global/GlobalHeader';
import { ThunderIcon } from '@/components/svgs/program/program-icons';
import Link from 'next/link';
import CourseSectionOpenButton from '@/components/global/SelectModal/buttons/course-section-open-button';
import {
    useGetMyProgressQuery,
    useMyProgramQuery,
} from '@/redux/api/myprogram/myprogramApi';
import { TProgram, TProgramMain, TProgressChart } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDateToCustomString } from '@/lib/formatDateToCustomString';
import Image from 'next/image';
import parse from 'html-react-parser';
import { useRouter } from 'next/navigation';
import { Separator } from '@/components/ui/separator';

export default function BootcampPage() {
    const { data, isLoading, isError } = useMyProgramQuery({});
    const router = useRouter();

    const {
        data: myProgress,
        isLoading: isProgressLoading,
        isError: isProgressError,
    } = useGetMyProgressQuery<{
        data: TProgressChart;
        isLoading: boolean;
        isError: boolean;
    }>({});

    if (isLoading || isProgressLoading) {
        return (
            <Card className='overflow-hidden border border-border shadow-sm mb-8'>
                <CardContent className='p-6 md:p-8'>
                    <div className='flex flex-col lg:flex-row gap-8'>
                        {/* Left Column - Program Details Skeleton */}
                        <div className='flex-1'>
                            <div className='flex items-center gap-2 mb-4'>
                                <Skeleton className='h-6 w-28 rounded-full bg-background' />
                                <Skeleton className='h-6 w-32 rounded-full bg-primary-light' />
                            </div>

                            <Skeleton className='h-8 w-3/4 mb-6 bg-foreground' />

                            <div className='grid md:grid-cols-2 gap-6 mb-6'>
                                <div className='space-y-4'>
                                    <div className='flex items-center gap-2'>
                                        <Skeleton className='h-5 w-5 rounded-full bg-foreground' />
                                        <div className='space-y-1'>
                                            <Skeleton className='h-3 w-16 bg-foreground' />
                                            <Skeleton className='h-4 w-28 bg-foreground' />
                                        </div>
                                    </div>

                                    <div className='flex items-center gap-2'>
                                        <Skeleton className='h-5 w-5 rounded-full bg-foreground' />
                                        <div className='space-y-1'>
                                            <Skeleton className='h-3 w-16 bg-foreground' />
                                            <Skeleton className='h-4 w-40 bg-foreground' />
                                        </div>
                                    </div>

                                    <div className='flex items-center gap-2'>
                                        <Skeleton className='h-5 w-5 rounded-full bg-foreground' />
                                        <div className='space-y-1'>
                                            <Skeleton className='h-3 w-16 bg-foreground' />
                                            <Skeleton className='h-4 w-32 bg-foreground' />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <div className='flex items-center gap-3 mb-4'>
                                        <Skeleton className='w-12 h-12 rounded-full bg-foreground' />
                                        <div className='space-y-2'>
                                            <Skeleton className='h-4 w-32 bg-foreground' />
                                            <Skeleton className='h-3 w-24 bg-foreground' />
                                        </div>
                                    </div>

                                    <div className='mb-4'>
                                        <div className='flex items-center justify-between mb-1'>
                                            <Skeleton className='h-4 w-32 bg-foreground' />
                                            <Skeleton className='h-4 w-10 bg-foreground' />
                                        </div>
                                        <Skeleton className='h-3 w-full rounded-full bg-background' />
                                    </div>

                                    <div className='grid grid-cols-2 gap-2 mt-4'>
                                        {[1, 2, 3, 4].map((i) => (
                                            <div
                                                key={i}
                                                className='flex items-center gap-2'
                                            >
                                                <Skeleton className='w-8 h-8 rounded-full bg-background' />
                                                <div>
                                                    <Skeleton className='h-3 w-16 bg-foreground' />
                                                    <Skeleton className='h-4 w-8 bg-foreground mt-1' />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <Skeleton className='h-10 w-36 rounded-md bg-background' />
                        </div>

                        {/* Right Column - Program Image and Technologies Skeleton */}
                        <div className='lg:w-2/5'>
                            <Skeleton className='h-48 md:h-64 w-full rounded-xl bg-foreground mb-4' />

                            <div className='grid grid-cols-6 gap-2'>
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <div
                                        key={i}
                                        className='flex flex-col items-center'
                                    >
                                        <Skeleton className='w-10 h-10 rounded-lg bg-foreground' />
                                        <Skeleton className='h-2 w-8 bg-foreground mt-1' />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }
    if (isError || isProgressError) {
        return <p>Geeting error to fetch</p>;
    }
    const myProgram: TProgramMain = data;
    const program: TProgram = myProgram?.program;

    return (
        <TooltipProvider>
            <Separator className='my-1' />
            <div className='p-0'>
                {/* Header */}
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

                {/* Main Content */}
                <div className='grid grid-cols-1 xl:grid-cols-2 gap-6 my-2 px-3 py-2 bg-foreground rounded-md border'>
                    {/* Left Column - Course Info */}
                    <div className=''>
                        {/* Course Title and Info */}
                        <div>
                            <h2 className='text-2xl font-bold mb-2'>
                                {program?.title}
                            </h2>
                            <div className='flex flex-wrap items-center gap-x-6 gap-y-2 mb-2'>
                                <div className='flex items-center'>
                                    <div className='flex'>
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                className='h-4 w-4 fill-amber-400 text-amber-400'
                                            />
                                        ))}
                                    </div>
                                    <span className='ml-1 text-sm font-medium'>
                                        4.9 (128 reviews)
                                    </span>
                                </div>
                                <div className='flex items-center gap-1 text-sm'>
                                    <Users className='h-4 w-4 text-blue-500' />
                                    <span>345 students</span>
                                </div>
                                <div className='flex items-center gap-1 text-sm'>
                                    <Clock className='h-4 w-4 text-green-500' />
                                    <span>Last updated 2 week ago</span>
                                </div>
                                <div className='flex items-center gap-1 text-sm'>
                                    <Layers className='h-4 w-4 text-purple-500' />
                                    <span>35 modules</span>
                                </div>
                            </div>
                            <div className='text-gray line-clamp-2'>
                                {parse(program?.description)}
                            </div>
                            {/* Bootcamp Details */}
                            <div className='grid grid-cols-1 md:grid-cols-2 space-y-3 my-2.5'>
                                <div className='flex items-center gap-2'>
                                    <p className='flex items-center flex-row gap-2 font-semibold'>
                                        <span className='flex items-center gap-2'>
                                            <School className='h-5 w-5 mr-1' />
                                            Company:{' '}
                                        </span>
                                        <span className='text-gray text-wrap lg:text-nowrap'>
                                            {
                                                data?.enrollment?.organization
                                                    ?.name
                                            }
                                        </span>
                                    </p>
                                </div>
                                <div className='flex items-center gap-2'>
                                    <p className='flex items-center gap-2 font-semibold'>
                                        <Book className='h-5 w-5 mr-1' />
                                        Branch:{' '}
                                        <span className='text-gray'>
                                            {data?.enrollment?.branch?.name}
                                        </span>
                                    </p>
                                </div>
                                <div className='flex items-center gap-2'>
                                    <p className='flex items-center gap-2 font-semibold'>
                                        <Calendar className='h-5 w-5 mr-1' />
                                        Session:{' '}
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
                        </div>

                        {/* Progress Section */}
                        <div className='shadow border rounded-md p-2.5 my-3'>
                            <div className='flex items-center justify-between mb-2'>
                                <h3 className='text-lg font-semibold'>
                                    Your Progress
                                </h3>
                                <span className='text-sm font-medium text-primary-white'>
                                    56%
                                </span>
                            </div>
                            <Progress
                                value={56}
                                className='h-2 mb-2 bg-background'
                            />
                            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                                <div className='bg-green-50 dark:bg-background rounded-lg p-4 flex items-center gap-2.5'>
                                    <div className='h-10 w-10 flex items-center justify-center rounded-sm bg-green-100 dark:bg-foreground'>
                                        <CheckCircle2 className='h-5 w-5 text-green-500' />
                                    </div>
                                    <div>
                                        <div className='text-sm text-black'>
                                            Completed
                                        </div>
                                        <div className='text-xl font-semibold'>
                                            20
                                        </div>
                                    </div>
                                </div>
                                <div className='bg-amber-50 dark:bg-background rounded-lg p-4 flex items-center gap-2.5'>
                                    <div className='h-10 w-10 flex items-center justify-center rounded-sm bg-amber-100 dark:bg-foreground'>
                                        <Clock className='h-5 w-5 text-amber-500' />
                                    </div>
                                    <div>
                                        <div className='text-sm text-black'>
                                            In Progress
                                        </div>
                                        <div className='text-xl font-semibold'>
                                            2
                                        </div>
                                    </div>
                                </div>
                                <div className='bg-purple-50 dark:bg-background rounded-lg p-4 flex items-center gap-2.5'>
                                    <div className='h-10 w-10 flex items-center justify-center rounded-sm bg-purple-100 dark:bg-foreground'>
                                        <Layers className='h-5 w-5 text-purple-500' />
                                    </div>
                                    <div>
                                        <div className='text-sm text-black'>
                                            Remaining
                                        </div>
                                        <div className='text-xl font-semibold'>
                                            15
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='flex items-center gap-4'>
                            <Link href='/dashboard/program-details/first-program'>
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

                    {/* Right Column - Tech Stack Banner */}
                    <div>
                        <div className='bg-[#0a2540] text-white rounded-lg overflow-hidden shadow-sm h-full'>
                            <div className='flex flex-col items-center justify-between h-full'>
                                <img
                                    src={program?.image || '/placeholder.svg'}
                                    className='w-100 h-100'
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Program Details */}
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4 my-2.5'>
                    <Card className='rounded-md shadow-none'>
                        <CardContent className='px-2.5 py-3 flex items-center gap-4'>
                            <div className='bg-primary-light p-3 rounded-full'>
                                <Clock className='h-6 w-6 text-blue-600' />
                            </div>
                            <div>
                                <p className='text-sm text-black'>Duration</p>
                                <h4 className='text-xl font-semibold'>
                                    12 Weeks
                                </h4>
                                <p className='text-xs text-gray'>
                                    Full-time commitment
                                </p>
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
                                    24 Modules
                                </h4>
                                <p className='text-xs text-gray'>
                                    120+ hours of content
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className='rounded-md shadow-none'>
                        <CardContent className='px-2.5 py-3 flex items-center gap-4'>
                            <div className='bg-green-100 dark:bg-primary-light p-3 rounded-full'>
                                <Award className='h-6 w-6 text-green-600' />
                            </div>
                            <div>
                                <p className='text-sm text-black'>
                                    Certifications
                                </p>
                                <h4 className='text-xl font-semibold'>
                                    Industry Recognized
                                </h4>
                                <p className='text-xs text-gray'>
                                    AWS & DevOps certifications
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabs Section */}
                <Tabs
                    defaultValue='overview'
                    className='rounded-md border bg-foreground px-2 py-2.5'
                >
                    <TabsList className='bg-transparent border-b w-full flex items-center justify-start flex-wrap rounded-none p-0 h-auto'>
                        <TabsTrigger
                            value='overview'
                            className='rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:bg-transparent data-[state=active]:text-primary-white py-3 px-6'
                        >
                            <LayoutDashboard className='h-4 w-4 mr-2' />
                            Overview
                        </TabsTrigger>
                        <TabsTrigger
                            value='curriculum'
                            className='rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:bg-transparent data-[state=active]:text-primary-white py-3 px-6'
                        >
                            <Book className='h-4 w-4 mr-2' />
                            Curriculum
                        </TabsTrigger>
                        <TabsTrigger
                            value='resources'
                            className='rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:bg-transparent data-[state=active]:text-primary-white py-3 px-6'
                        >
                            <FileText className='h-4 w-4 mr-2' />
                            Resources
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value='overview' className=''>
                        {/* What You'll Learn */}
                        <div>
                            <h3 className='text-lg font-semibold mb-4 flex items-center gap-1.5'>
                                <ThunderIcon />
                                What You&apos;ll Learn
                            </h3>
                            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'>
                                <div className='flex items-center gap-3'>
                                    <div className='bg-primary-light p-1.5 rounded-full mt-0.5'>
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
                                            className='text-blue-600'
                                        >
                                            <path d='M12 5c.67 0 1.35.09 2 .26 1.78-2 5.03-2.84 6.42-2.26 1.4.58-.42 7-.42 7 .57 1.07 1 2.24 1 3.44C21 17.9 16.97 21 12 21s-9-3-9-7.56c0-1.25.5-2.4 1-3.44 0 0-1.89-6.42-.5-7 1.39-.58 4.72.23 6.5 2.23A9.04 9.04 0 0 1 12 5Z' />
                                            <path d='M8 14v.5' />
                                            <path d='M16 14v.5' />
                                            <path d='M11.25 16.25h1.5L12 17l-.75-.75Z' />
                                        </svg>
                                    </div>
                                    <span className='text-sm'>
                                        Build and deploy CI/CD pipelines using
                                        industry-standard tools
                                    </span>
                                </div>
                                <div className='flex items-center gap-3'>
                                    <div className='bg-primary-light p-1.5 rounded-full mt-0.5'>
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
                                            className='text-blue-600'
                                        >
                                            <rect
                                                width='18'
                                                height='18'
                                                x='3'
                                                y='3'
                                                rx='2'
                                            />
                                            <path d='M7 7h10' />
                                            <path d='M7 12h10' />
                                            <path d='M7 17h10' />
                                        </svg>
                                    </div>
                                    <span className='text-sm'>
                                        Design scalable and resilient cloud
                                        infrastructure
                                    </span>
                                </div>
                                <div className='flex items-center gap-3'>
                                    <div className='bg-primary-light p-1.5 rounded-full mt-0.5'>
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
                                            className='text-blue-600'
                                        >
                                            <path d='M12 2v4' />
                                            <path d='m4.93 10.93 2.83-2.83' />
                                            <path d='M2 18h4' />
                                            <path d='M19.07 10.93l-2.83-2.83' />
                                            <path d='M18 18h4' />
                                            <path d='M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z' />
                                        </svg>
                                    </div>
                                    <span className='text-sm'>
                                        Monitor and optimize application
                                        performance
                                    </span>
                                </div>
                                <div className='flex items-center gap-3'>
                                    <div className='bg-primary-light p-1.5 rounded-full mt-0.5'>
                                        <Shield className='h-4 w-4 text-blue-600' />
                                    </div>
                                    <span className='text-sm'>
                                        Implement security best practices in
                                        cloud environments
                                    </span>
                                </div>
                                <div className='flex items-center gap-3'>
                                    <div className='bg-primary-light p-1.5 rounded-full mt-0.5'>
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
                                            className='text-blue-600'
                                        >
                                            <path d='M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z' />
                                            <polyline points='14 2 14 8 20 8' />
                                        </svg>
                                    </div>
                                    <span className='text-sm'>
                                        Automate deployment and infrastructure
                                        management
                                    </span>
                                </div>
                                <div className='flex items-center gap-3'>
                                    <div className='bg-primary-light p-1.5 rounded-full mt-0.5'>
                                        <Users className='h-4 w-4 text-blue-600' />
                                    </div>
                                    <span className='text-sm'>
                                        Collaborate effectively in DevOps teams
                                    </span>
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                    <TabsContent value='curriculum'>
                        <div className='p-6'>
                            <p className='text-gray-500'>
                                Curriculum content will be displayed here.
                            </p>
                        </div>
                    </TabsContent>
                    <TabsContent value='resources'>
                        <div className='p-6'>
                            <p className='text-gray-500'>
                                Resources content will be displayed here.
                            </p>
                        </div>
                    </TabsContent>
                </Tabs>
                {/* Technologies You'll Master */}
                <div className='my-2 border rounded-md bg-foreground px-2 py-2.5'>
                    <h3 className='text-lg font-semibold mb-2.5 flex items-center gap-1.5'>
                        <ThunderIcon /> Technologies You&apos;ll Master
                    </h3>
                    <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4'>
                        {[
                            {
                                name: 'HTML',
                                color: 'border-orange-500',
                                icon: 'html5',
                            },
                            {
                                name: 'JavaScript',
                                color: 'border-yellow-500',
                                icon: 'js',
                            },
                            {
                                name: 'GitHub',
                                color: 'border-gray-500',
                                icon: 'github',
                            },
                            {
                                name: 'Swagger',
                                color: 'border-green-500',
                                icon: 'swagger',
                            },
                            {
                                name: 'AgileALM',
                                color: 'border-blue-500',
                                icon: 'agile',
                            },
                            {
                                name: 'Docker',
                                color: 'border-blue-500',
                                icon: 'docker',
                            },
                            {
                                name: 'GitLab',
                                color: 'border-orange-500',
                                icon: 'gitlab',
                            },
                            {
                                name: 'MongoDB',
                                color: 'border-green-500',
                                icon: 'mongodb',
                            },
                            {
                                name: 'Express',
                                color: 'border-gray-500',
                                icon: 'express',
                            },
                            {
                                name: 'React',
                                color: 'border-blue-500',
                                icon: 'react',
                            },
                            {
                                name: 'Node.js',
                                color: 'border-green-500',
                                icon: 'nodejs',
                            },
                            {
                                name: 'Linux',
                                color: 'border-black',
                                icon: 'linux',
                            },
                        ].map((tech, index) => (
                            <div
                                key={index}
                                className={`border border-t-8 rounded-lg p-4 flex flex-col items-center justify-center ${tech.color} text-center`}
                            >
                                <div className='h-14 w-14 border flex items-center justify-center border-[#E6EBFA] rounded-full mb-2.5'>
                                    <div className='h-12 w-12 flex items-center justify-center'>
                                        {renderTechIcon(tech.icon)}
                                    </div>
                                </div>
                                <span className='text-sm font-medium'>
                                    {tech.name}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
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
        case 'js':
            return (
                <svg
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 24 24'
                    fill='#F7DF1E'
                    className='w-8 h-8'
                >
                    <path d='M0 0h24v24H0V0zm22.034 18.276c-.175-1.095-.888-2.015-3.003-2.873-.736-.345-1.554-.585-1.797-1.14-.091-.33-.105-.51-.046-.705.15-.646.915-.84 1.515-.66.39.12.75.42.976.9 1.034-.676 1.034-.676 1.755-1.125-.27-.42-.404-.601-.586-.78-.63-.705-1.469-1.065-2.834-1.034l-.705.089c-.676.165-1.32.525-1.71 1.005-1.14 1.291-.811 3.541.569 4.471 1.365 1.02 3.361 1.244 3.616 2.205.24 1.17-.87 1.545-1.966 1.41-.811-.18-1.26-.586-1.755-1.336l-1.83 1.051c.21.48.45.689.81 1.109 1.74 1.756 6.09 1.666 6.871-1.004.029-.09.24-.705.074-1.65l.046.067zm-8.983-7.245h-2.248c0 1.938-.009 3.864-.009 5.805 0 1.232.063 2.363-.138 2.711-.33.689-1.18.601-1.566.48-.396-.196-.597-.466-.83-.855-.063-.105-.11-.196-.127-.196l-1.825 1.125c.305.63.75 1.172 1.324 1.517.855.51 2.004.675 3.207.405.783-.226 1.458-.691 1.811-1.411.51-.93.402-2.07.397-3.346.012-2.054 0-4.109 0-6.179l.004-.056z' />
                </svg>
            );
        case 'github':
            return (
                <svg
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 24 24'
                    fill='#181717'
                    className='w-8 h-8'
                >
                    <path d='M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12' />
                </svg>
            );
        case 'swagger':
            return (
                <svg
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 256 256'
                    fill='#85EA2D'
                    className='w-8 h-8'
                >
                    <path
                        d='M127.999 249.895c-67.215 0-121.9-54.68-121.9-121.896C6.1 60.782 60.785 6.102 128 6.102c67.214 0 121.899 54.685 121.899 121.9 0 67.214-54.685 121.893-121.9 121.893z'
                        fill='#85EA2D'
                    />
                    <path
                        d='M127.999 12.202c63.954 0 115.797 51.843 115.797 115.797 0 63.954-51.843 115.797-115.797 115.797-63.954 0-115.797-51.843-115.797-115.797S64.045 12.202 127.999 12.202z'
                        fill='#173647'
                    />
                    <path
                        d='M128 25.701c-56.243 0-101.8 45.557-101.8 101.8 0 56.243 45.557 101.8 101.8 101.8s101.8-45.557 101.8-101.8c0-56.243-45.557-101.8-101.8-101.8zm0 185.502c-46.23 0-83.702-37.472-83.702-83.702s37.472-83.702 83.702-83.702 83.702 37.472 83.702 83.702-37.472 83.702-83.702 83.702z'
                        fill='#173647'
                    />
                </svg>
            );
        case 'agile':
            return (
                <svg
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 24 24'
                    fill='#1572B6'
                    className='w-8 h-8'
                >
                    <path d='M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm0 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm-1 4h2v6h-2V8zm0 8h2v2h-2v-2z' />
                </svg>
            );
        case 'docker':
            return (
                <svg
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 24 24'
                    fill='#2496ED'
                    className='w-8 h-8'
                >
                    <path d='M13.983 11.078h2.119a.186.186 0 0 0 .186-.185V9.006a.186.186 0 0 0-.186-.186h-2.119a.185.185 0 0 0-.185.185v1.888c0 .102.083.185.185.185m-2.954-5.43h2.118a.186.186 0 0 0 .186-.186V3.574a.186.186 0 0 0-.186-.185h-2.118a.185.185 0 0 0-.185.185v1.888c0 .102.082.185.185.185m0 2.716h2.118a.187.187 0 0 0 .186-.186V6.29a.186.186 0 0 0-.186-.185h-2.118a.185.185 0 0 0-.185.185v1.887c0 .102.082.185.185.186m-2.93 0h2.12a.186.186 0 0 0 .184-.186V6.29a.185.185 0 0 0-.185-.185H8.1a.185.185 0 0 0-.185.185v1.887c0 .102.083.185.185.186m-2.964 0h2.119a.186.186 0 0 0 .185-.186V6.29a.185.185 0 0 0-.185-.185H5.136a.186.186 0 0 0-.186.185v1.887c0 .102.084.185.186.186m5.893 2.715h2.118a.186.186 0 0 0 .186-.185V9.006a.186.186 0 0 0-.186-.186h-2.118a.185.185 0 0 0-.185.185v1.888c0 .102.082.185.185.185m-2.93 0h2.12a.185.185 0 0 0 .184-.185V9.006a.185.185 0 0 0-.184-.186h-2.12a.185.185 0 0 0-.184.185v1.888c0 .102.083.185.185.185m-2.964 0h2.119a.185.185 0 0 0 .185-.185V9.006a.185.185 0 0 0-.184-.186h-2.12a.186.186 0 0 0-.186.186v1.887c0 .102.084.185.186.185m-2.92 0h2.12a.185.185 0 0 0 .184-.185V9.006a.185.185 0 0 0-.184-.186h-2.12a.185.185 0 0 0-.184.185v1.888c0 .102.082.185.185.185M23.763 9.89c-.065-.051-.672-.51-1.954-.51-.338.001-.676.03-1.01.087-.248-1.7-1.653-2.53-1.716-2.566l-.344-.199-.226.327c-.284.438-.49.922-.612 1.43-.23.97-.09 1.882.403 2.661-.595.332-1.55.413-1.744.42H.751a.751.751 0 0 0-.75.748 11.376 11.376 0 0 0 .692 4.062c.545 1.428 1.355 2.48 2.41 3.124 1.18.723 3.1 1.137 5.275 1.137.983.003 1.963-.086 2.93-.266a12.248 12.248 0 0 0 3.823-1.389c.98-.567 1.86-1.288 2.61-2.136 1.252-1.418 1.998-2.997 2.553-4.4h.221c1.372 0 2.215-.549 2.68-1.009.309-.293.55-.65.707-1.046l.098-.288Z' />
                </svg>
            );
        case 'gitlab':
            return (
                <svg
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 24 24'
                    fill='#FC6D26'
                    className='w-8 h-8'
                >
                    <path d='M23.955 13.587l-1.342-4.135-2.664-8.189a.455.455 0 0 0-.867 0L16.418 9.45H7.582L4.919 1.263a.455.455 0 0 0-.867 0L1.386 9.45.044 13.587a.924.924 0 0 0 .331 1.023L12 23.054l11.625-8.443a.92.92 0 0 0 .33-1.024' />
                </svg>
            );
        case 'mongodb':
            return (
                <svg
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 24 24'
                    fill='#47A248'
                    className='w-8 h-8'
                >
                    <path d='M17.193 9.555c-1.264-5.58-4.252-7.414-4.573-8.115-.28-.394-.53-.954-.735-1.44-.036.495-.055.685-.523 1.184-.723.566-4.438 3.682-4.74 10.02-.282 5.912 4.27 9.435 4.888 9.884l.07.05A73.49 73.49 0 0 1 11.91 24h.481c.114-1.032.284-2.056.51-3.07.417-.296.604-.463.85-.693a11.342 11.342 0 0 0 3.639-8.464c.01-.814-.103-1.662-.197-2.218zm-5.336 8.195s0-8.291.275-8.29c.213 0 .49 10.695.49 10.695-.381-.045-.765-1.76-.765-2.405z' />
                </svg>
            );
        case 'express':
            return (
                <svg
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 24 24'
                    fill='#000000'
                    className='w-8 h-8'
                >
                    <path d='M24 18.588a1.529 1.529 0 0 1-1.429 1.586h-21.142a1.529 1.529 0 0 1-1.429-1.586v-11.176a1.529 1.529 0 0 1 1.429-1.586h21.142a1.529 1.529 0 0 1 1.429 1.586v11.176zm-1.429-13.176h-21.142a1.528 1.528 0 0 0-1.429 1.586v11.176a1.528 1.528 0 0 0 1.429 1.586h21.142a1.528 1.528 0 0 0 1.429-1.586v-11.176a1.528 1.528 0 0 0-1.429-1.586z' />
                    <path d='M23.2 18.942a1.067 1.067 0 0 1-1.067 1.067h-20.266a1.067 1.067 0 0 1-1.067-1.067v-12.089a1.067 1.067 0 0 1 1.067-1.067h20.266a1.067 1.067 0 0 1 1.067 1.067v12.089z' />
                    <path
                        d='M5.867 10.933h-2.133v-2.133h2.133v2.133zm0 4.267h-2.133v-2.133h2.133v2.133zm12.8-4.267h-10.667v-2.133h10.667v2.133zm0 4.267h-10.667v-2.133h10.667v2.133z'
                        fill='#ffffff'
                    />
                </svg>
            );
        case 'react':
            return (
                <svg
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 24 24'
                    fill='#61DAFB'
                    className='w-8 h-8'
                >
                    <path
                        d='M12 9.861a2.139 2.139 0 1 0 0 4.278 2.139 2.139 0 1 0 0-4.278zm-5.992 6.394l-.472-.12C2.018 15.246 0 13.737 0 11.996s2.018-3.25 5.536-4.139l.472-.119.133.468a23.53 23.53 0 0 0 1.363 3.578l.101.213-.101.213a23.307 23.307 0 0 0-1.363 3.578l-.133.467zM5.317 8.95c-2.674.751-4.315 1.9-4.315 3.046 0 1.145 1.641 2.294 4.315 3.046a24.95 24.95 0 0 1 1.182-3.046A24.752 24.752 0 0 1 5.317 8.95zm12.675 7.305l-.133-.469a23.357 23.357 0 0 0-1.364-3.577l-.101-.213.101-.213a23.42 23.42 0 0 0 1.364-3.578l.133-.468.473.119c3.517.889 5.535 2.398 5.535 4.14s-2.018 3.25-5.535 4.139l-.473.12zm-.491-4.259c.48 1.039.877 2.06 1.182 3.046 2.675-.752 4.315-1.901 4.315-3.046 0-1.146-1.641-2.294-4.315-3.046a24.788 24.788 0 0 1-1.182 3.046zM5.31 8.945l-.133-.467C4.188 4.992 4.488 2.494 6 1.622c
1.483-.856 3.864.155 6.359 2.716l.34.349-.34.349a23.552 23.552 0 0 0-2.422 2.967l-.135.193-.235.02a23.657 23.657 0 0 0-3.785.61l-.472.119zm1.896-6.63c-.268 0-.505.058-.705.173-.994.573-1.17 2.565-.485 5.253a25.122 25.122 0 0 1 3.233-.501 24.847 24.847 0 0 1 2.052-2.544c-1.56-1.519-3.037-2.381-4.095-2.381zm9.589 20.362c-.001 0-.001 0 0 0-1.425 0-3.255-1.073-5.154-3.023l-.34-.349.34-.349a23.53 23.53 0 0 0 2.421-2.968l.135-.193.234-.02a23.63 23.63 0 0 0 3.787-.609l.472-.119.134.468c.987 3.484.688 5.983-.824 6.854a2.38 2.38 0 0 1-1.205.308zm-4.096-3.381c1.56 1.519 3.037 2.381 4.095 2.381h.001c.267 0 .505-.058.704-.173.994-.573 1.171-2.566.485-5.254a25.02 25.02 0 0 1-3.234.501 24.674 24.674 0 0 1-2.051 2.545zM18.69 8.945l-.472-.119a23.479 23.479 0 0 0-3.787-.61l-.234-.02-.135-.193a23.414 23.414 0 0 0-2.421-2.967l-.34-.349.34-.349C14.135 1.778 16.515.767 18 1.622c1.512.872 1.812 3.37.824 6.855l-.134.468zM14.75 7.24c1.142.104 2.227.273 3.234.501.686-2.688.509-4.68-.485-5.253-.988-.571-2.845.304-4.8 2.208A24.849 24.849 0 0 1 14.75 7.24zM7.206 22.677A2.38 2.38 0 0 1 6 22.369c-1.512-.871-1.812-3.369-.823-6.854l.132-.468.472.119c1.155.291 2.429.496 3.785.609l.235.02.134.193a23.596 23.596 0 0 0 2.422 2.968l.34.349-.34.349c-1.898 1.95-3.728 3.023-5.151 3.023zm-1.19-6.427c-.686 2.688-.509 4.681.485 5.254.987.563 2.843-.305 4.8-2.208a24.998 24.998 0 0 1-2.052-2.545 24.976 24.976 0 0 1-3.233-.501zm5.984.628c-.823 0-1.669-.036-2.516-.106l-.235-.02-.135-.193a30.388 30.388 0 0 1-1.35-2.122 30.354 30.354 0 0 1-1.166-2.228l-.1-.213.1-.213a30.3 30.3 0 0 1 1.166-2.228c.414-.716.869-1.43 1.35-2.122l.135-.193.235-.02a29.785 29.785 0 0 1 5.033 0l.234.02.134.193a30.006 30.006 0 0 1 2.517 4.35l.101.213-.101.213a29.6 29.6 0 0 1-2.517 4.35l-.134.193-.234.02c-.847.07-1.694.106-2.517.106zm-2.197-1.084c1.48.111 2.914.111 4.395 0a29.006 29.006 0 0 0 2.196-3.798 28.585 28.585 0 0 0-2.197-3.798 29.031 29.031 0 0 0-4.394 0 28.477 28.477 0 0 0-2.197 3.798 29.114 29.114 0 0 0 2.197 3.798z'
                    />
                </svg>
            );
        case 'nodejs':
            return (
                <svg
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 24 24'
                    fill='#339933'
                    className='w-8 h-8'
                >
                    <path d='M11.998,24c-0.321,0-0.641-0.084-0.922-0.247l-2.936-1.737c-0.438-0.245-0.224-0.332-0.08-0.383 c0.585-0.203,0.703-0.25,1.328-0.604c0.065-0.037,0.151-0.023,0.218,0.017l2.256,1.339c0.082,0.045,0.197,0.045,0.272,0l8.795-5.076 c0.082-0.047,0.134-0.141,0.134-0.238V6.921c0-0.099-0.053-0.192-0.137-0.242l-8.791-5.072c-0.081-0.047-0.189-0.047-0.271,0 L3.075,6.68C2.99,6.729,2.936,6.825,2.936,6.921v10.15c0,0.097,0.054,0.189,0.139,0.235l2.409,1.392 c1.307,0.654,2.108-0.116,2.108-0.89V7.787c0-0.142,0.114-0.253,0.256-0.253h1.115c0.139,0,0.255,0.112,0.255,0.253v10.021 c0,1.745-0.95,2.745-2.604,2.745c-0.508,0-0.909,0-2.026-0.551L2.28,18.675c-0.57-0.329-0.922-0.945-0.922-1.604V6.921 c0-0.659,0.353-1.275,0.922-1.603l8.795-5.082c0.557-0.315,1.296-0.315,1.848,0l8.794,5.082c0.57,0.329,0.924,0.944,0.924,1.603 v10.15c0,0.659-0.354,1.273-0.924,1.604l-8.794,5.078C12.643,23.916,12.324,24,11.998,24z M19.099,13.993 c0-1.9-1.284-2.406-3.987-2.763c-2.731-0.361-3.009-0.548-3.009-1.187c0-0.528,0.235-1.233,2.258-1.233 c1.807,0,2.473,0.389,2.747,1.607c0.024,0.115,0.129,0.199,0.247,0.199h1.141c0.071,0,0.138-0.031,0.186-0.081 c0.048-0.054,0.074-0.123,0.067-0.196c-0.177-2.098-1.571-3.076-4.388-3.076c-2.508,0-4.004,1.058-4.004,2.833 c0,1.925,1.488,2.457,3.895,2.695c2.88,0.282,3.103,0.703,3.103,1.269c0,0.983-0.789,1.402-2.642,1.402 c-2.327,0-2.839-0.584-3.011-1.742c-0.02-0.124-0.126-0.215-0.253-0.215h-1.137c-0.141,0-0.254,0.112-0.254,0.253 c0,1.482,0.806,3.248,4.655,3.248C17.501,17.007,19.099,15.91,19.099,13.993z' />
                </svg>
            );
        case 'linux':
            return (
                <svg
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 24 24'
                    fill='#000000'
                    className='w-8 h-8'
                >
                    <path d='M12.504 0c-.155 0-.315.008-.48.021-4.226.333-3.105 4.807-3.17 6.298-.076 1.092-.3 1.953-1.05 3.02-.885 1.051-2.127 2.75-2.716 4.521-.278.832-.41 1.684-.287 2.489.117.779.567 1.563 1.182 2.145.61.577 1.305.939 1.977 1.094.345.077.685.114 1.016.114.39 0 .762-.039 1.103-.116.673-.161 1.367-.537 1.969-1.097.597-.565 1.037-1.333 1.152-2.096.148-.847.03-1.688-.236-2.512-.565-1.722-1.693-3.401-2.414-4.47-.862-1.285-1.473-2.128-1.574-3.244-.063-.699.013-1.266.172-1.744.244-.721.77-1.229 1.378-1.229h.176c.67 0 1.264.53 1.5 1.272.176.547.194 1.11.13 1.822-.077.845-.292 1.643-.513 2.368-.221.722-.45 1.46-.556 2.276-.19 1.53 1.008 2.828 2.213 3.54.845.498 1.83.776 2.8.776.815 0 1.635-.18 2.398-.53 1.155-.526 2.047-1.496 2.248-2.448.273-1.28-.213-2.478-1.01-3.995-.476-.902-.908-1.859-1.288-2.758-.204-.482-.395-.934-.573-1.352-.344-.815-.673-1.59-.917-2.35-.132-.406-.264-.803-.377-1.196-.129-.449-.237-.9-.309-1.345-.053-.344-.08-.686-.08-1.022 0-.174.012-.344.035-.51.065-.48.263-.881.606-1.134.304-.226.662-.314 1.04-.314.164 0 .33.016.495.05.71.15 1.334.616 1.834 1.345.49.72.886 1.672 1.246 2.878.193.647.395 1.322.592 2.02.602 2.119 1.226 4.31 2.178 6.1.473.886 1.01 1.655 1.697 2.11.596.394 1.324.622 2.102.62.652-.002 1.336-.172 2.028-.51.69-.338 1.31-.911 1.692-1.554.404-.68.598-1.448.594-2.245-.006-1.033-.378-1.993-1.064-2.825-.682-.827-1.601-1.415-2.606-1.713-.151-.045-.301-.08-.452-.108-.103-.02-.207-.036-.312-.05-.143-.02-.287-.035-.433-.047-.135-.01-.27-.018-.406-.022-.13-.004-.262-.004-.394-.001-.066.001-.133.005-.199.01-.094.006-.187.016-.28.027-.118.014-.235.031-.35.052-.154.027-.305.057-.454.094-.102.024-.203.052-.303.08-.144.04-.285.082-.424.129-.086.028-.17.059-.253.09-.123.046-.244.094-.363.144-.073.03-.146.064-.217.097-.13.06-.257.122-.38.188-.57.03-.114.062-.169.094-.11.064-.217.13-.321.2-.053.035-.105.07-.156.107-.096.066-.19.134-.281.204-.05.038-.1.077-.147.117-.082.067-.162.136-.24.207-.046.042-.091.084-.135.127-.073.07-.145.141-.214.214-.042.043-.083.088-.123.133-.065.073-.127.147-.188.223-.037.045-.074.091-.109.138-.055.073-.109.146-.16.221-.032.047-.063.095-.093.143-.048.074-.094.15-.138.226-.026.047-.052.095-.077.143-.04.077-.078.155-.114.234-.022.049-.043.098-.063.148-.031.077-.06.155-.088.234-.018.05-.036.1-.052.15-.025.08-.048.16-.069.241-.014.05-.027.102-.039.153-.019.081-.036.162-.051.244-.01.052-.02.104-.028.156-.013.082-.024.165-.034.248-.006.052-.012.104-.017.157-.007.084-.012.168-.016.252-.002.053-.005.106-.006.159-.001.085-.001.17.001.255.001.052.003.104.005.156.004.087.01.173.018.26.004.051.008.102.013.152.008.088.019.176.03.264.007.05.014.1.022.15.013.09.028.18.044.268.01.049.02.098.031.146.018.092.038.184.06.275.013.048.027.096.041.144.023.093.049.186.076.277.016.046.033.092.05.137.03.096.061.19.094.283.019.044.038.088.058.131.035.097.073.194.112.289.022.042.044.084.067.126.042.099.086.197.132.294.024.04.049.08.074.119.048.1.1.199.152.297.027.037.054.075.082.112.055.102.113.203.173.302.029.034.059.068.089.101.062.103.127.205.194.305.031.031.063.062.095.092.069.104.141.206.215.307.033.027.066.055.1.082.077.105.156.209.239.311.035.024.07.048.106.072.084.105.171.208.262.309.037.021.073.042.111.063.093.105.189.208.289.309.038.018.076.036.114.054.102.104.207.206.315.305.039.015.078.029.117.043.111.103.226.204.345.302.04.011.08.022.12.032.121.102.245.201.373.297.04.007.081.014.121.021.132.1.268.197.407.291.04.003.08.005.12.008.143.097.29.191.44.283.042-.001.083-.001.125-.003.153.094.31.185.471.273.043-.005.086-.01.129-.016.164.09.332.177.503.261.044-.009.088-.018.133-.028.175.086.354.169.536.248.045-.013.09-.027.135-.041.186.081.376.159.569.234.046-.017.091-.035.137-.053.198.075.4.147.605.217.046-.021.092-.043.139-.065.21.069.425.135.644.198.047-.026.094-.052.141-.079.222.063.448.122.676.178.047-.03.095-.061.143-.092.235.056.474.108.716.156.047-.035.095-.07.143-.106.248.048.5.093.754.134.047-.04.095-.079.143-.12.262.04.527.077.795.111.047-.044.095-.089.143-.134.276.032.554.06.835.085.047-.049.095-.098.143-.148.29.023.583.042.879.058.047-.053.095-.107.143-.161.304.014.61.025.919.031.047-.058.095-.116.143-.175.318.006.638.008.96.006.047-.062.095-.125.143-.189.333-.003.668-.01 1.005-.021.047-.067.095-.134.143-.202.347-.012.696-.028 1.047-.048.047-.071.095-.143.143-.215.362-.021.725-.047 1.09-.076.047-.076.095-.152.143-.229.376-.031.754-.066 1.133-.105.047-.08.095-.161.143-.242.39-.04.782-.085 1.175-.134.047-.085.095-.17.143-.256.404-.05.81-.104 1.217-.163.047-.09.095-.179.143-.269.418-.06.837-.124 1.257-.193.047-.094.095-.189.143-.283.431-.069.863-.143 1.296-.222.047-.099.095-.198.143-.297.444-.079.889-.163 1.334-.252.047-.103.095-.207.143-.311.457-.089.914-.183 1.372-.282.047-.108.095-.216.143-.324.47-.099.94-.203 1.41-.312.047-.113.095-.225.143-.338.482-.109.965-.223 1.447-.342.047-.117.095-.235.143-.353.494-.119.988-.243 1.482-.372.047-.122.095-.244.143-.367.506-.129 1.012-.263 1.517-.402.047-.127.095-.253.143-.38.518-.139 1.035-.283 1.552-.433.047-.131.095-.263.143-.394.529-.149 1.057-.303 1.585-.463.047-.136.095-.272.143-.408.54-.16 1.079-.324 1.618-.494.047-.14.095-.281.143-.422.551-.17 1.101-.345 1.65-.525.047-.145.095-.29.143-.436.562-.18 1.122-.366 1.682-.557.047-.15.095-.299.143-.449.572-.191 1.143-.387 1.713-.589.047-.154.095-.309.143-.463.582-.201 1.163-.408 1.743-.621.047-.159.095-.318.143-.477.592-.212 1.183-.429 1.772-.653.047-.163.095-.327.143-.491.602-.223 1.202-.451 1.801-.685.047-.168.095-.336.143-.505.611-.234 1.22-.473 1.828-.718.047-.172.095-.345.143-.518.62-.245 1.238-.495 1.854-.751.047-.177.095-.354.143-.532.629-.256 1.255-.517 1.88-.784.047-.181.095-.363.143-.545.637-.267 1.272-.54 1.905-.818.047-.186.095-.372.143-.559.645-.278 1.288-.562 1.929-.852.047-.19.095-.381.143-.572.653-.29 1.303-.585 1.952-.886.047-.195.095-.39.143-.586.66-.301 1.318-.608 1.974-.921.047-.199.095-.399.143-.599.667-.313 1.332-.631 1.995-.955.047-.204.095-.408.143-.613.674-.325 1.345-.655 2.014-.99.047-.208.095-.417.143-.626.68-.337 1.358-.679 2.033-1.026.047-.213.095-.426.143-.64.686-.349 1.37-.703 2.051-1.062.047-.217.095-.435.143-.653.692-.361 1.381-.727 2.068-1.098.047-.222.095-.444.143-.667.697-.373 1.392-.751 2.085-1.135.047-.226.095-.453.143-.68.702-.385 1.402-.775 2.1-1.172.047-.231.095-.462.143-.694.707-.397 1.411-.8 2.114-1.209.047-.235.095-.471.143-.707.712-.409 1.42-.825 2.127-1.247.047-.24.095-.48.143-.721.716-.422 1.429-.85 2.139-1.285.047-.244.095-.489.143-.734.72-.435 1.437-.876 2.151-1.323.047-.249.095-.498.143-.748.724-.448 1.444-.902 2.162-1.362.047-.253.095-.507.143-.761.727-.461 1.451-.929 2.172-1.401.047-.258.095-.516.143-.775.73-.474 1.457-.955 2.181-1.441.047-.262.095-.525.143-.788.733-.487 1.462-.981 2.19-1.481.047-.267.095-.534.143-.802.736-.5 1.467-1.008 2.198-1.522.047-.271.095-.543.143-.815.738-.514 1.472-1.035 2.205-1.563.047-.276.095-.552.143-.829.74-.527 1.476-1.062 2.211-1.604.047-.28.095-.561.143-.842.742-.541 1.48-1.09 2.216-1.645.047-.285.095-.57.143-.856.744-.555 1.483-1.118 2.221-1.687.047-.289.095-.579.143-.869.745-.569 1.486-1.146 2.225-1.729.047-.294.095-.588.143-.883.746-.583 1.488-1.175 2.228-1.772.047-.298.095-.597.143-.896.747-.598 1.49-1.204 2.231-1.815.047-.303.095-.606.143-.91.748-.612 1.491-1.233 2.233-1.859.047-.307.095-.615.143-.923.748-.627 1.492-1.263 2.234-1.903.047-.312.095-.624.143-.937.748-.642 1.492-1.293 2.234-1.948.047-.316.095-.633.143-.95.748-.657 1.492-1.324 2.234-1.994.047-.321.095-.642.143-.964.748-.673 1.491-1.355 2.233-2.04.047-.325.095-.651.143-.977.747-.689 1.49-1.387 2.231-2.087.047-.33.095-.66.143-.991.746-.705 1.488-1.419 2.228-2.135.047-.334.095-.669.143-1.004.745-.721 1.486-1.452 2.225-2.183.047-.339.095-.678.143-1.018.744-.738 1.483-1.485 2.221-2.232.047-.343.095-.687.143-1.031.742-.755 1.48-1.519 2.216-2.282.047-.348.095-.696.143-1.045.74-.772 1.476-1.553 2.211-2.333.047-.352.095-.705.143-1.058.738-.79 1.472-1.588 2.205-2.385.047-.357.095-.714.143-1.072.736-.807 1.467-1.623 2.198-2.438.047-.361.095-.723.143-1.085.733-.825 1.462-1.659 2.19-2.492.047-.366.095-.732.143-1.099.73-.844 1.457-1.695 2.181-2.546.047-.37.095-.741.143-1.112.727-.862 1.451-1.732 2.172-2.601.047-.375.095-.75.143-1.126.724-.881 1.444-1.77 2.162-2.657.047-.379.095-.759.143-1.139.72-.9 1.437-1.808 2.151-2.714.047-.384.095-.768.143-1.153.716-.919 1.429-1.847 2.139-2.772.047-.388.095-.777.143-1.166.712-.939 1.42-1.886 2.127-2.831.047-.393.095-.786.143-1.18.707-.959 1.411-1.926 2.114-2.891.047-.397.095-.795.143-1.193.702-.979 1.402-1.966 2.1-2.952.047-.402.095-.804.143-1.207.697-1 1.392-2.007 2.085-3.014.047-.406.095-.813.143-1.22.692-1.021 1.381-2.049 2.068-3.077.047-.411.095-.822.143-1.234.686-1.042 1.37-2.092 2.051-3.141.047-.415.095-.831.143-1.247.68-1.064 1.358-2.135 2.033-3.206.047-.42.095-.84.143-1.261.674-1.086 1.345-2.179 2.014-3.272.047-.424.095-.849.143-1.274.667-1.108 1.332-2.224 1.995-3.339.047-.429.095-.858.143-1.288.66-1.131 1.318-2.269 1.974-3.407.047-.433.095-.867.143-1.301.653-1.154 1.303-2.315 1.952-3.476.047-.438.095-.876.143-1.315.645-1.177 1.288-2.362 1.929-3.546.047-.442.095-.885.143-1.328.637-1.201 1.272-2.41 1.905-3.617.047-.447.095-.894.143-1.342.629-1.225 1.255-2.458 1.88-3.689.047-.451.095-.903.143-1.355.62-1.25 1.238-2.507 1.854-3.763.047-.456.095-.912.143-1.369.611-1.275 1.22-2.557 1.828-3.837.047-.46.095-.921.143-1.382.602-1.3 1.202-2.608 1.801-3.913.047-.465.095-.93.143-1.396.592-1.326 1.183-2.659 1.772-3.99.047-.469.095-.939.143-1.409.582-1.352 1.163-2.711 1.743-4.068.047-.474.095-.948.143-1.423.572-1.379 1.143-2.764 1.713-4.147.047-.478.095-.957.143-1.436.562-1.406 1.122-2.818 1.682-4.227.047-.483.095-.966.143-1.45.551-1.433 1.101-2.873 1.65-4.308.047-.487.095-.975.143-1.463.54-1.461 1.079-2.929 1.618-4.39.047-.492.095-.984.143-1.477.529-1.49 1.057-2.985 1.585-4.473.047-.496.095-.993.143-1.49.518-1.518 1.035-3.042 1.552-4.557.047-.501.095-1.002.143-1.504.506-1.548 1.012-3.1 1.517-4.642.047-.505.095-1.011.143-1.517.494-1.578 0-3.159 0-4.728' />
                </svg>
            );
        default:
            return <div className='w-8 h-8 bg-gray-200 rounded-full'></div>;
    }
}
