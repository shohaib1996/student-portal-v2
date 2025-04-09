'use client';

import React, { useState } from 'react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import {
    File,
    Folder,
    Youtube,
    Play,
    MoreVertical,
    ChevronDown,
    Pin,
} from 'lucide-react';
import Link from 'next/link';
import { ChapterType, TContent, TLessonInfo } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import LessionActionMenu from './LessionActionMenu';

const ContentDropDown = ({
    fetchedData,
    parentId,
    setParentId,
    setVideoData,
    videoData,
    option,
}: {
    fetchedData: TContent[] | null;
    parentId?: string | null;
    videoData: {
        videoInfo: null | TLessonInfo;
        isSideOpen: boolean;
    };
    option: {
        isLoading: boolean;
        isError: boolean;
        courseProgramsLoading: boolean;
        setFilterOption: React.Dispatch<{
            filter: string;
            query: string;
            pId: string | null;
        }>;
    };
    setVideoData: React.Dispatch<
        React.SetStateAction<{
            videoInfo: null | TLessonInfo;
            isSideOpen: boolean;
        }>
    >;
    setParentId: React.Dispatch<React.SetStateAction<string | null>>;
}) => {
    function formatSeconds(totalSeconds: number) {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes} min ${seconds} sec`;
    }

    const calculateProgress = (chapter: TContent) => {
        if (chapter.isCompleted) {
            return 100;
        }
        return 0; // Or implement a more detailed progress calculation if data is available
    };

    const renderPriorityBadge = (priority: number | undefined) => {
        if (priority === 3) {
            return (
                <Badge className='bg-red-100 text-red-700 border-none text-xs font-normal'>
                    High
                </Badge>
            );
        } else if (priority === 2) {
            return (
                <Badge className='bg-yellow-100 text-yellow-700 border-none text-xs font-normal'>
                    Medium
                </Badge>
            );
        } else if (priority === 1) {
            return (
                <Badge className='bg-green-100 text-green-700 border-none text-xs font-normal'>
                    Low
                </Badge>
            );
        }
        return null;
    };

    const renderContent = (
        data: TContent[],
        parentIndex = '',
    ): React.ReactNode => {
        return data.map((item, index) => {
            // Generate a unique key combining _id and parentIndex
            const uniqueKey = `${item._id}-${parentIndex}-${index}`;

            // Handle lesson type content
            if (item.type === ChapterType.LESSON && 'lesson' in item) {
                const status = item.isCompleted ? 'completed' : 'upcoming';

                return (
                    <AccordionItem
                        key={uniqueKey}
                        value={uniqueKey}
                        className='mb-4 mt-4 rounded-lg border  mr-4'
                    >
                        {item?.lesson?.type === 'video' ? (
                            <AccordionTrigger
                                isIcon={false}
                                className={`text-start hover:no-underline py-0  ${
                                    status === 'upcoming'
                                        ? 'bg-primary-light'
                                        : ''
                                } ${
                                    parentId &&
                                    '[&[data-state=open]>div>div>svg]:stroke-primary [&[data-state=open]>div>p]:text-primary'
                                }`}
                                // isChevronDown={false}
                            >
                                <div className='flex items-center justify-between w-full p-2'>
                                    <div
                                        className='flex items-center gap-3'
                                        onClick={() =>
                                            setVideoData({
                                                videoInfo: item?.lesson,
                                                isSideOpen: true,
                                            })
                                        }
                                    >
                                        <div>
                                            <Play className='h-5 w-5 stroke-gray' />
                                        </div>

                                        <div>
                                            <p className='text-sm font-medium text-black'>
                                                {item.lesson.title}
                                            </p>
                                            <span className='text-xs text-gray'>
                                                {formatSeconds(
                                                    item.lesson
                                                        .duration as number,
                                                )}
                                            </span>
                                        </div>
                                        <div className='flex items-start gap-1'>
                                            {renderPriorityBadge(item.priority)}
                                        </div>
                                    </div>

                                    <div className='flex items-center gap-1'>
                                        <span>
                                            {item.isPinned && (
                                                <Pin className='h-4 w-4 text-primary-white' />
                                            )}
                                        </span>
                                        <LessionActionMenu
                                            lessonId={item?._id}
                                            courseId={item?.myCourse?.course}
                                        />
                                    </div>
                                </div>
                            </AccordionTrigger>
                        ) : (
                            <AccordionTrigger
                                className={`text-start hover:no-underline py-0 ${
                                    status === 'upcoming' ? '' : ''
                                } ${
                                    parentId &&
                                    '[&[data-state=open]>a>div>p]:text-primary [&[data-state=open]>div>div>svg]:stroke-primary'
                                }`}
                                // isChevronDown={false}
                            >
                                <Link
                                    href={
                                        item.lesson.url
                                            ? `/dashboard/slide/${item.lesson.url}`
                                            : '#'
                                    }
                                    target='_blank'
                                    className='w-full'
                                >
                                    <div className='flex items-center justify-between w-full p-2'>
                                        <div className='flex items-center gap-3'>
                                            <div>
                                                <File className='h-5 w-5 stroke-gray' />
                                            </div>

                                            <div>
                                                <p className='text-sm font-medium text-black'>
                                                    {item.lesson.title}
                                                </p>
                                                <span className='text-xs text-gray'>
                                                    {formatSeconds(
                                                        item.lesson
                                                            .duration as number,
                                                    )}
                                                </span>
                                            </div>
                                        </div>

                                        <div className='flex items-center gap-3'>
                                            <div className='flex gap-1'>
                                                {renderPriorityBadge(
                                                    item.priority,
                                                )}
                                            </div>
                                            <MoreVertical className='h-5 w-5 text-gray' />
                                        </div>
                                    </div>
                                </Link>
                            </AccordionTrigger>
                        )}
                    </AccordionItem>
                );
            }

            // Handle chapter type content
            if (item.type === ChapterType.CHAPTER && 'chapter' in item) {
                const progress = calculateProgress(item);
                const lectures = item.chapter.children?.length || 0;
                const duration =
                    item.chapter.children?.reduce(
                        (acc, child) =>
                            acc +
                            (typeof child?.lesson === 'object'
                                ? Number(child.lesson.duration) || 0
                                : 0),
                        0,
                    ) || 0;

                return (
                    <AccordionItem
                        key={uniqueKey}
                        value={uniqueKey}
                        className='mb-2 mt-1 mr-2 rounded-lg border border-border-primary-light overflow-hidden'
                    >
                        <AccordionTrigger
                            isIcon={false}
                            className={`text-start hover:no-underline py-0 pr-4 ${
                                parentId &&
                                '[&[data-state=open]>div>div>svg]:stroke-primary [&[data-state=open]>div>p]:text-primary'
                            }`}
                            onClick={() => setParentId(item._id)}
                        >
                            <div className='flex items-center justify-between w-full p-2 flex-wrap'>
                                <div className='flex items-center gap-3'>
                                    <div className='bg-primary-light mr-1.5 p-1.5 rounded-md'>
                                        {parentId ? (
                                            <Folder className='h-5 w-5 stroke-primary' />
                                        ) : (
                                            <ChevronDown className='h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200' />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className='font-medium text-black'>
                                            {item.chapter.name}
                                        </h3>
                                        <div className='flex items-center gap-4 text-sm text-gray'>
                                            <span className='flex items-center gap-1 text-sm text-nowrap'>
                                                <svg
                                                    xmlns='http://www.w3.org/2000/svg'
                                                    width='14'
                                                    height='15'
                                                    viewBox='0 0 14 15'
                                                    fill='none'
                                                >
                                                    <path
                                                        d='M7.43913 6.55327C7.43913 6.31167 7.24324 6.11579 7.00163 6.11579C6.76001 6.11579 6.56413 6.31167 6.56413 6.55327H7.43913ZM6.56413 13.0182C6.56413 13.2598 6.76001 13.4557 7.00163 13.4557C7.24324 13.4557 7.43913 13.2598 7.43913 13.0182H6.56413ZM5.6159 3.35142C5.40674 3.47241 5.33527 3.74004 5.45626 3.94919C5.57724 4.15835 5.84488 4.22982 6.054 4.10883L5.6159 3.35142ZM7.94925 4.10883C8.15838 4.22982 8.42601 4.15835 8.547 3.94919C8.66798 3.74004 8.59652 3.47241 8.38734 3.35142L7.94925 4.10883ZM4.418 2.04104C4.21982 2.17927 4.17123 2.45199 4.30946 2.65016C4.4477 2.84834 4.72041 2.89694 4.91859 2.7587L4.418 2.04104ZM9.08465 2.7587C9.28287 2.89694 9.55558 2.84834 9.69377 2.65016C9.83202 2.45199 9.78343 2.17927 9.58527 2.04104L9.08465 2.7587ZM6.56413 6.55327V13.0182H7.43913V6.55327H6.56413ZM3.21787 5.60797C4.22977 5.71913 5.53457 6.01507 6.43649 6.62951L6.92912 5.90638C5.84896 5.17049 4.37201 4.8545 3.31343 4.7382L3.21787 5.60797ZM3.21787 12.5774C4.22977 12.6885 5.53457 12.9845 6.43649 13.5989L6.92912 12.8757C5.84896 12.1399 4.37201 11.8239 3.31343 11.7075L3.21787 12.5774ZM1.89746 6.04597V11.1568H2.77246V6.04597H1.89746ZM3.31343 11.7075C2.99465 11.6725 2.77246 11.4196 2.77246 11.1568H1.89746C1.89746 11.9205 2.51194 12.4998 3.21787 12.5774L3.31343 11.7075ZM3.31343 4.7382C2.51477 4.65046 1.89746 5.3005 1.89746 6.04597H2.77246C2.77246 5.76502 2.99181 5.58313 3.21787 5.60797L3.31343 4.7382ZM10.6898 4.7382C9.63124 4.8545 8.15429 5.17049 7.07414 5.90638L7.56676 6.62951C8.46871 6.01507 9.77351 5.71913 10.7854 5.60797L10.6898 4.7382ZM10.6898 11.7075C9.63124 11.8239 8.15429 12.1399 7.07414 12.8757L7.56676 13.5989C8.46871 12.9845 9.77351 12.6885 10.7854 12.5774L10.6898 11.7075ZM11.2308 6.04597V11.1568H12.1058V6.04597H11.2308ZM10.7854 12.5774C11.4913 12.4998 12.1058 11.9205 12.1058 11.1568H11.2308C11.2308 11.4196 11.0086 11.6725 10.6898 11.7075L10.7854 12.5774ZM10.7854 5.60797C11.0115 5.58313 11.2308 5.76502 11.2308 6.04597H12.1058C12.1058 5.3005 11.4885 4.65046 10.6898 4.7382L10.7854 5.60797ZM6.43649 13.5989C6.77559 13.8299 7.22767 13.8299 7.56676 13.5989L7.07414 12.8757C7.03225 12.9043 6.971 12.9043 6.92912 12.8757L6.43649 13.5989ZM6.43649 6.62951C6.77559 6.86051 7.22767 6.86051 7.56676 6.62951L7.07414 5.90638C7.03225 5.9349 6.971 5.9349 6.92912 5.90638L6.43649 6.62951ZM6.054 4.10883C6.33243 3.94778 6.65559 3.85547 7.00163 3.85547V2.98047C6.49769 2.98047 6.0239 3.11541 5.6159 3.35142L6.054 4.10883ZM7.00163 3.85547C7.34766 3.85547 7.67083 3.94778 7.94925 4.10883L8.38734 3.35142C7.97935 3.11541 7.50557 2.98047 7.00163 2.98047V3.85547ZM4.91859 2.7587C5.50895 2.34691 6.22644 2.10547 7.00163 2.10547V1.23047C6.04169 1.23047 5.15044 1.53014 4.418 2.04104L4.91859 2.7587ZM7.00163 2.10547C7.77682 2.10547 8.49432 2.34691 9.08465 2.7587L9.58527 2.04104C8.85284 1.53014 7.96156 1.23047 7.00163 1.23047V2.10547Z'
                                                        fill='#5C5958'
                                                    />
                                                </svg>
                                                {lectures} lectures
                                            </span>
                                            <span className='flex items-center gap-1 text-sm text-nowrap'>
                                                <svg
                                                    xmlns='http://www.w3.org/2000/svg'
                                                    width='12'
                                                    height='13'
                                                    viewBox='0 0 12 13'
                                                    fill='none'
                                                >
                                                    <path
                                                        d='M11 6.5C11 9.26 8.76 11.5 6 11.5C3.24 11.5 1 9.26 1 6.5C1 3.74 3.24 1.5 6 1.5C8.76 1.5 11 3.74 11 6.5Z'
                                                        stroke='#5C5958'
                                                        strokeWidth='1.2'
                                                        strokeLinecap='round'
                                                        strokeLinejoin='round'
                                                    />
                                                    <path
                                                        d='M7.85494 8.09086L6.30494 7.16586C6.03494 7.00586 5.81494 6.62086 5.81494 6.30586V4.25586'
                                                        stroke='#5C5958'
                                                        strokeWidth='1.2'
                                                        strokeLinecap='round'
                                                        strokeLinejoin='round'
                                                    />
                                                </svg>
                                                {formatSeconds(duration)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className='flex items-center gap-4'>
                                    <div className='w-32'>
                                        <div className='flex items-center justify-between mb-1 gap-1.5'>
                                            <Progress
                                                value={progress}
                                                className='h-2.5 bg-primary-light'
                                                indicatorClass='bg-primary rounded-full'
                                            />
                                            <span className='text-xs text-black'>
                                                {progress}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className='border-t border-border pb-0'>
                            {item.chapter.children &&
                            item.chapter.children.length > 0 ? (
                                <Accordion
                                    type='single'
                                    collapsible
                                    className='ml-4'
                                >
                                    {renderContent(
                                        item.chapter.children,
                                        uniqueKey,
                                    )}
                                </Accordion>
                            ) : option?.courseProgramsLoading ? (
                                <div className='flex w-full items-center justify-center py-4 text-center text-primary'>
                                    <p>Loading...</p>
                                    <svg
                                        xmlns='http://www.w3.org/2000/svg'
                                        width='24'
                                        height='24'
                                        viewBox='0 0 24 24'
                                        fill='none'
                                        stroke='currentColor'
                                        strokeWidth='2'
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                        className='animate-spin stroke-primary ml-2'
                                    >
                                        <path d='M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z' />
                                        <path d='M21 12a9 9 0 0 1-9 9' />
                                    </svg>
                                </div>
                            ) : (
                                <p className='p-3 text-center text-primary'>
                                    No additional content available
                                </p>
                            )}
                        </AccordionContent>
                    </AccordionItem>
                );
            }

            return null;
        });
    };

    return (
        <div
            className={cn(
                'space-y-4',
                videoData?.isSideOpen
                    ? 'no-scrollbar lg:col-span-1 md:overflow-auto'
                    : 'w-full',
            )}
        >
            <Accordion type='single' collapsible className='w-full'>
                {fetchedData && fetchedData.length > 0 ? (
                    renderContent(fetchedData)
                ) : option?.courseProgramsLoading ? (
                    <div className='flex w-full items-center justify-center py-4 text-center text-primary'>
                        <p>Loading...</p>
                        <svg
                            xmlns='http://www.w3.org/2000/svg'
                            width='24'
                            height='24'
                            viewBox='0 0 24 24'
                            fill='none'
                            stroke='currentColor'
                            strokeWidth='2'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            className='animate-spin stroke-primary ml-2'
                        >
                            <path d='M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z' />
                            <path d='M21 12a9 9 0 0 1-9 9' />
                        </svg>
                    </div>
                ) : (
                    <p className='py-4 text-center text-primary'>
                        No content available
                    </p>
                )}
            </Accordion>
        </div>
    );
};

export default ContentDropDown;
