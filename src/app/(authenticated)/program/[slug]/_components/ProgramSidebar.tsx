'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
    Play,
    Clock,
    Calendar,
    PanelLeftClose,
    Check,
    Package,
    CirclePlay,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { ChapterData, TBootcampResult, TProgram } from '@/types';
import { useGetPortalDataQuery } from '@/redux/api/dashboard/calendarApi';
import FocusedIcon from '@/components/svgs/common/FocusedIcon';

interface CourseSidebarProps {
    courseData: TProgram;
    onToggle?: () => void;
    fetchedData: ChapterData[] | undefined;
}

export function ProgramSidebar({
    courseData,
    onToggle,
    fetchedData,
}: CourseSidebarProps) {
    const [showCompleted, setShowCompleted] = useState(true);
    const { data, isLoading, error } = useGetPortalDataQuery({ bootcamp: {} });
    const bootcamp: TBootcampResult[] = data?.data?.bootcamp?.results;

    console.log({ bootcamp, courseData, fetchedData });
    const totalCompleted = bootcamp?.reduce(
        (acc, curr) => acc + Number(curr.completedItems),
        0,
    );

    const totalIncomplete = bootcamp?.reduce(
        (acc, curr) => acc + Number(curr.incompletedItems),
        0,
    );
    const newData = {
        ...courseData,
        totalPinned: bootcamp?.reduce(
            (acc, curr) => acc + Number(curr.pinnedItems),
            0,
        ),
        programComplete: Math.round(
            (bootcamp?.reduce(
                (acc, curr) => acc + Number(curr.completedItems),
                0,
            ) /
                bootcamp?.reduce(
                    (acc, curr) => acc + Number(curr.totalItems),
                    0,
                )) *
                100,
        ),
    };

    // Alternatively, count all priorities in a single pass
    const priorityCounts = fetchedData?.reduce(
        (acc, cur) => {
            if (cur.priority === 3) {
                acc.high += 1;
            } else if (cur.priority === 2) {
                acc.medium += 1;
            } else if (cur.priority === 1) {
                acc.low += 1;
            }
            return acc;
        },
        { high: 0, medium: 0, low: 0 },
    ) || { high: 0, medium: 0, low: 0 };

    return (
        <div className='overflow-y-auto w-full pr-2'>
            <div className='flex items-center justify-between mb-4'>
                <div className='flex items-center gap-1'>
                    <Check className='h-4 w-4 text-green-500' />
                    <span className='text-sm font-medium'>Show Completed</span>
                    <div
                        className={`w-10 h-5 rounded-full p-1 cursor-pointer ${showCompleted ? 'bg-blue-600' : 'bg-gray-300'}`}
                        onClick={() => setShowCompleted(!showCompleted)}
                    >
                        <div
                            className={`w-3 h-3 rounded-full bg-white transform transition-transform ${
                                showCompleted
                                    ? 'translate-x-5'
                                    : 'translate-x-0'
                            }`}
                        ></div>
                    </div>
                </div>
                {onToggle && (
                    <button
                        onClick={onToggle}
                        className='text-gray hover:text-dark-gray'
                    >
                        <PanelLeftClose className='h-5 w-5' />
                    </button>
                )}
            </div>

            {/* Course Card */}
            <div className='bg-primary-light border border-border rounded-lg overflow-hidden'>
                <div className='relative'>
                    <div className='absolute top-2 left-2 bg-background text-green-700 px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1'>
                        <Check className='h-4 w-4 text-green-500' />
                        <span>Approved</span>
                    </div>
                    <Image
                        src={courseData?.image || '/placeholder.svg'}
                        alt={courseData?.title}
                        width={400}
                        height={200}
                        className='w-full h-[120px] object-cover'
                    />
                </div>
                <div className='p-3'>
                    <h3 className='font-medium text-black flex items-center gap-1'>
                        <Package className='h-5 w-5 text-black' />
                        <span className='text-base text-black font-semibold capitalize'>
                            {courseData?.title}
                        </span>
                    </h3>
                    <p className='text-sm text-gray my-2'>
                        {courseData?.shortDetail}
                    </p>
                    <div className='flex items-center gap-1 text-[10px] text-dark-gray'>
                        <div className='flex -space-x-2'>
                            <Avatar className='h-6 w-6 border border-border'>
                                <AvatarImage
                                    src='/images/author.png'
                                    alt='Student 1'
                                />
                                <AvatarFallback>S1</AvatarFallback>
                            </Avatar>
                            <Avatar className='h-6 w-6 border border-border'>
                                <AvatarImage
                                    src='/images/author.png'
                                    alt='Student 2'
                                />
                                <AvatarFallback>S2</AvatarFallback>
                            </Avatar>
                            <Avatar className='h-6 w-6 border border-border'>
                                <AvatarImage
                                    src='/images/author.png'
                                    alt='Student 3'
                                />
                                <AvatarFallback>S3</AvatarFallback>
                            </Avatar>
                            <Avatar className='h-6 w-6 border border-border'>
                                <AvatarImage
                                    src='/images/author.png'
                                    alt='Student 4'
                                />
                                <AvatarFallback>S4</AvatarFallback>
                            </Avatar>
                        </div>
                        <span>{10} + enrolled students</span>
                    </div>
                </div>
            </div>
            <Separator className='my-2 bg-border' />
            {/* Pinned */}

            {/* Priority Filters */}
            <div className='space-y-1.5'>
                <div className='flex items-center justify-between p-2.5 border border-border-primary-light rounded-sm'>
                    <div className='flex items-center gap-1 text-sm text-dark-gray'>
                        <svg
                            xmlns='http://www.w3.org/2000/svg'
                            width='18'
                            height='18'
                            viewBox='0 0 18 18'
                            fill='none'
                        >
                            <path
                                d='M10.371 1.26758L16.7349 7.63155L15.6743 8.6922L15.144 8.16188L11.9619 11.3438L11.4316 13.9955L10.371 15.0562L7.18898 11.8742L3.47668 15.5865L2.41602 14.5259L6.12833 10.8135L2.94635 7.63155L4.00701 6.57088L6.65866 6.04055L9.84064 2.85857L9.31032 2.32824L10.371 1.26758ZM10.9013 3.91923L7.39818 7.42236L5.28177 7.8456L10.1568 12.7208L10.5801 10.6043L14.0833 7.10121L10.9013 3.91923Z'
                                fill='#5C5958'
                            />
                        </svg>
                        <span>Pinned</span>
                    </div>
                    <span className='text-sm text-black'>
                        {newData?.totalPinned}
                    </span>
                </div>
                <div className='flex items-center justify-between p-2.5 border border-border-primary-light rounded-sm'>
                    <div className='flex items-center gap-1 text-sm text-dark-gray'>
                        <div>
                            <Image
                                src='/images/High.png'
                                width='18'
                                height='18'
                                alt='high priority'
                            />
                        </div>
                        <span className=''>High Priority</span>
                    </div>
                    <span className='text-sm text-black'>
                        {priorityCounts?.high || 0}
                    </span>
                </div>
                <div className='flex items-center justify-between p-2.5 border border-border-primary-light rounded-sm'>
                    <div className='flex items-center gap-1 text-sm text-dark-gray'>
                        <div>
                            <Image
                                src='/images/Medium.png'
                                width='18'
                                height='18'
                                alt='Medium priority'
                            />
                        </div>
                        <span className=''>Medium Priority</span>
                    </div>
                    <span className='text-sm text-black'>
                        {priorityCounts?.medium || 0}
                    </span>
                </div>
                <div className='flex items-center justify-between p-2.5 border border-border-primary-light rounded-sm'>
                    <div className='flex items-center gap-1 text-sm text-dark-gray'>
                        <div>
                            <Image
                                src='/images/Low.png'
                                width='18'
                                height='18'
                                alt='Low priority'
                            />
                        </div>
                        <span className=''>Low Priority</span>
                    </div>
                    <span className='text-sm text-black'>
                        {priorityCounts?.low || 0}
                    </span>
                </div>
            </div>

            <Separator className='my-2 bg-border' />

            {/* Progress Section */}
            <div className='border border-border rounded-lg p-2.5'>
                <h3 className='font-semibold text-base leading-5 capitalize text-black'>
                    Your Progress
                </h3>
                <Separator className='my-2 bg-border' />
                <div className='mb-2'>
                    <div className='flex items-center justify-between mb-1'>
                        <span className='text-xs font-medium text-black'>
                            Program Completion
                        </span>
                        <span className='text-xs font-medium text-primary'>
                            {newData?.programComplete || 0}%
                        </span>
                    </div>
                    <Progress
                        value={newData?.programComplete || 0}
                        className='h-2 bg-pure-black'
                        indicatorClass='bg-primary rounded-full'
                    />
                </div>

                <div className='space-y-2'>
                    <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-2'>
                            <Check className='h-4 w-4 text-green-500' />
                            <span className='text-xs text-gray'>Completed</span>
                        </div>
                        <span className='text-xs font-medium text-black'>
                            {totalCompleted || 0}
                        </span>
                    </div>
                    <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-2'>
                            <Clock className='h-4 w-4 text-amber-500' />
                            {/* <Check className='h-4 w-4 text-green-500' /> */}
                            <span className='text-xs text-gray'>Progress</span>
                        </div>
                        <span className='text-xs font-medium text-black'>
                            {Math.round(
                                (totalCompleted /
                                    (totalCompleted + totalIncomplete)) *
                                    100,
                            ) || 0}
                            %
                        </span>
                    </div>

                    <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-2'>
                            <CirclePlay size={16} />
                            <span className='text-xs text-gray'>
                                Not Started
                            </span>
                        </div>
                        <span className='text-xs font-medium text-black'>
                            {totalIncomplete || 0}
                        </span>
                    </div>
                </div>
            </div>

            {/* Focused Lesson */}
            {/* <div className='border border-border rounded-lg p-2.5 mt-2'>
                <h3 className='font-medium text-black flex items-center gap-2'>
                    <FocusedIcon />
                    <span>Focused Lesson</span>
                </h3>
                <Separator className='my-2' />
                <div className='bg-primary-light rounded-lg p-1.5'>
                    <div className='flex items-start mb-2'>
                        <div className='bg-primary mr-1.5 p-1.5 rounded-md'>
                            <Play className='h-4 w-4 text-pure-white' />
                        </div>
                        <div className='space-y-1'>
                            <h4 className='text-sm font-medium text-black'>
                                {courseData?.focusedLesson?.title}dfdfd
                            </h4>
                            <div className='flex items-center gap-2 text-xs text-gray'>
                                <div className='flex items-center gap-1'>
                                    <Calendar className='h-4 w-4 text-dark-gray' />
                                    <span>
                                        {courseData?.focusedLesson?.date}xxx
                                    </span>
                                </div>
                                <div className='flex items-center gap-1'>
                                    <Clock className='h-4 w-4 text-dark-gray' />
                                    <span>
                                        {courseData?.focusedLesson?.time}xx
                                    </span>
                                </div>
                                <span className=''>
                                    {courseData?.focusedLesson?.duration}xxx
                                </span>
                            </div>
                        </div>
                        <Badge className='text-red-600 border-red-600 text-[10px] font-medium px-1 border bg-transparent'>
                            {courseData?.focusedLesson?.tags[0]}xxx
                        </Badge>
                    </div>
                    <Separator className='my-2.5' />
                    <div className='mb-2'>
                        <div className='flex items-center justify-between mb-1'>
                            <span className='text-xs font-medium text-black'>
                                Completion
                            </span>
                            <span className='text-xs font-medium text-primary'>
                                {courseData?.focusedLesson?.completion}%
                            </span>
                        </div>
                        <Progress
                            value={courseData?.focusedLesson?.completion}
                            className='h-2 bg-pure-black'
                            indicatorClass='bg-primary rounded-full'
                        />
                    </div>
                </div>
            </div> */}
        </div>
    );
}
