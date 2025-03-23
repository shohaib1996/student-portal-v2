'use client';

import { useState } from 'react';
import {
    ChevronDown,
    ChevronRight,
    Play,
    CheckCircle,
    MoreVertical,
    Folder,
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SubLesson {
    id: string;
    title: string;
    date: string;
    time: string;
    duration: string;
    priority: 'High' | 'Medium' | 'Low';
    status: 'completed' | 'current' | 'upcoming';
    tags: string[];
}

interface Lesson {
    id: string;
    title: string;
    date: string;
    time: string;
    duration: string;
    priority: 'High' | 'Medium' | 'Low';
    status: 'completed' | 'current' | 'upcoming';
    tags: string[];
    isNew?: boolean;
    hasContent?: boolean;
    isFolder?: boolean;
    subLessons?: SubLesson[];
}

interface Module {
    id: string;
    title: string;
    lectures: number;
    duration: string;
    progress: number;
    lessons: Lesson[];
}

interface ModuleListProps {
    modules: Module[];
}

export function ModuleList({ modules }: ModuleListProps) {
    const [expandedModules, setExpandedModules] = useState<
        Record<string, boolean>
    >({
        'module-1': true,
        'module-2': false,
        'module-3': false,
        'module-4': false,
    });

    const [expandedFolders, setExpandedFolders] = useState<
        Record<string, boolean>
    >({});

    const toggleModule = (moduleId: string) => {
        setExpandedModules((prev) => ({
            ...prev,
            [moduleId]: !prev[moduleId],
        }));
    };

    const toggleFolder = (lessonId: string) => {
        setExpandedFolders((prev) => ({
            ...prev,
            [lessonId]: !prev[lessonId],
        }));
    };

    return (
        <div className='space-y-4'>
            {modules.map((module) => (
                <div
                    key={module.id}
                    className='border border-border-primary-light rounded-lg overflow-hidden'
                >
                    <div
                        className='flex items-center justify-between p-2 cursor-pointer hover:bg-primary-light transition-colors'
                        onClick={() => toggleModule(module.id)}
                    >
                        <div className='flex items-center gap-3'>
                            {expandedModules[module.id] ? (
                                <div className='bg-primary-light mr-1.5 p-1.5 rounded-md'>
                                    <ChevronDown className='h-5 w-5 text-primary' />
                                </div>
                            ) : (
                                <div className='bg-primary-light mr-1.5 p-1.5 rounded-md'>
                                    <ChevronRight className='h-5 w-5 text-primary' />
                                </div>
                            )}
                            <div>
                                <h3 className='font-medium text-gray-900'>
                                    {module.title}
                                </h3>
                                <div className='flex items-center gap-4 text-sm text-gray-500'>
                                    <span className='flex items-center gap-1'>
                                        <span>
                                            <svg
                                                xmlns='http://www.w3.org/2000/svg'
                                                width='14'
                                                height='15'
                                                viewBox='0 0 14 15'
                                                fill='none'
                                            >
                                                <g clip-path='url(#clip0_336_47041)'>
                                                    <path
                                                        d='M7.43913 6.55327C7.43913 6.31167 7.24324 6.11579 7.00163 6.11579C6.76001 6.11579 6.56413 6.31167 6.56413 6.55327H7.43913ZM6.56413 13.0182C6.56413 13.2598 6.76001 13.4557 7.00163 13.4557C7.24324 13.4557 7.43913 13.2598 7.43913 13.0182H6.56413ZM5.6159 3.35142C5.40674 3.47241 5.33527 3.74004 5.45626 3.94919C5.57724 4.15835 5.84488 4.22982 6.054 4.10883L5.6159 3.35142ZM7.94925 4.10883C8.15838 4.22982 8.42601 4.15835 8.547 3.94919C8.66798 3.74004 8.59652 3.47241 8.38734 3.35142L7.94925 4.10883ZM4.418 2.04104C4.21982 2.17927 4.17123 2.45199 4.30946 2.65016C4.4477 2.84834 4.72041 2.89694 4.91859 2.7587L4.418 2.04104ZM9.08465 2.7587C9.28287 2.89694 9.55558 2.84834 9.69377 2.65016C9.83202 2.45199 9.78343 2.17927 9.58527 2.04104L9.08465 2.7587ZM6.56413 6.55327V13.0182H7.43913V6.55327H6.56413ZM3.21787 5.60797C4.22977 5.71913 5.53457 6.01507 6.43649 6.62951L6.92912 5.90638C5.84896 5.17049 4.37201 4.8545 3.31343 4.7382L3.21787 5.60797ZM3.21787 12.5774C4.22977 12.6885 5.53457 12.9845 6.43649 13.5989L6.92912 12.8757C5.84896 12.1399 4.37201 11.8239 3.31343 11.7075L3.21787 12.5774ZM1.89746 6.04597V11.1568H2.77246V6.04597H1.89746ZM3.31343 11.7075C2.99465 11.6725 2.77246 11.4196 2.77246 11.1568H1.89746C1.89746 11.9205 2.51194 12.4998 3.21787 12.5774L3.31343 11.7075ZM3.31343 4.7382C2.51477 4.65046 1.89746 5.3005 1.89746 6.04597H2.77246C2.77246 5.76502 2.99181 5.58313 3.21787 5.60797L3.31343 4.7382ZM10.6898 4.7382C9.63124 4.8545 8.15429 5.17049 7.07414 5.90638L7.56676 6.62951C8.46871 6.01507 9.77351 5.71913 10.7854 5.60797L10.6898 4.7382ZM10.6898 11.7075C9.63124 11.8239 8.15429 12.1399 7.07414 12.8757L7.56676 13.5989C8.46871 12.9845 9.77351 12.6885 10.7854 12.5774L10.6898 11.7075ZM11.2308 6.04597V11.1568H12.1058V6.04597H11.2308ZM10.7854 12.5774C11.4913 12.4998 12.1058 11.9205 12.1058 11.1568H11.2308C11.2308 11.4196 11.0086 11.6725 10.6898 11.7075L10.7854 12.5774ZM10.7854 5.60797C11.0115 5.58313 11.2308 5.76502 11.2308 6.04597H12.1058C12.1058 5.3005 11.4885 4.65046 10.6898 4.7382L10.7854 5.60797ZM6.43649 13.5989C6.77559 13.8299 7.22767 13.8299 7.56676 13.5989L7.07414 12.8757C7.03225 12.9043 6.971 12.9043 6.92912 12.8757L6.43649 13.5989ZM6.43649 6.62951C6.77559 6.86051 7.22767 6.86051 7.56676 6.62951L7.07414 5.90638C7.03225 5.9349 6.971 5.9349 6.92912 5.90638L6.43649 6.62951ZM6.054 4.10883C6.33243 3.94778 6.65559 3.85547 7.00163 3.85547V2.98047C6.49769 2.98047 6.0239 3.11541 5.6159 3.35142L6.054 4.10883ZM7.00163 3.85547C7.34766 3.85547 7.67083 3.94778 7.94925 4.10883L8.38734 3.35142C7.97935 3.11541 7.50557 2.98047 7.00163 2.98047V3.85547ZM4.91859 2.7587C5.50895 2.34691 6.22644 2.10547 7.00163 2.10547V1.23047C6.04169 1.23047 5.15044 1.53014 4.418 2.04104L4.91859 2.7587ZM7.00163 2.10547C7.77682 2.10547 8.49432 2.34691 9.08465 2.7587L9.58527 2.04104C8.85284 1.53014 7.96156 1.23047 7.00163 1.23047V2.10547Z'
                                                        fill='#5C5958'
                                                    />
                                                    <path
                                                        d='M7.43913 6.55327C7.43913 6.31167 7.24324 6.11579 7.00163 6.11579C6.76001 6.11579 6.56413 6.31167 6.56413 6.55327M7.43913 6.55327H6.56413M7.43913 6.55327V13.0182M6.56413 6.55327V13.0182M6.56413 13.0182C6.56413 13.2598 6.76001 13.4557 7.00163 13.4557C7.24324 13.4557 7.43913 13.2598 7.43913 13.0182M6.56413 13.0182H7.43913M3.26565 5.17308L3.21787 5.60797M3.21787 5.60797C4.22977 5.71913 5.53457 6.01507 6.43649 6.62951M3.21787 5.60797L3.31343 4.7382M3.21787 5.60797C2.99181 5.58313 2.77246 5.76502 2.77246 6.04597M6.68284 6.26795L6.92912 5.90638M6.92912 5.90638L6.43649 6.62951M6.92912 5.90638C5.84896 5.17049 4.37201 4.8545 3.31343 4.7382M6.92912 5.90638C6.971 5.9349 7.03225 5.9349 7.07414 5.90638M3.26565 12.1425L3.31343 11.7075M3.31343 11.7075C4.37201 11.8239 5.84896 12.1399 6.92912 12.8757M3.31343 11.7075L3.21787 12.5774M3.31343 11.7075C2.99465 11.6725 2.77246 11.4196 2.77246 11.1568M6.68284 13.2373L6.92912 12.8757M6.92912 12.8757L6.43649 13.5989M6.92912 12.8757C6.971 12.9043 7.03225 12.9043 7.07414 12.8757M10.7376 5.17308L10.6898 4.7382M10.6898 4.7382C9.63124 4.8545 8.15429 5.17049 7.07414 5.90638M10.6898 4.7382L10.7854 5.60797M10.6898 4.7382C11.4885 4.65046 12.1058 5.3005 12.1058 6.04597M7.32042 6.26795L7.07414 5.90638M7.07414 5.90638L7.56676 6.62951M10.7376 12.1425L10.6898 11.7075M10.6898 11.7075C9.63124 11.8239 8.15429 12.1399 7.07414 12.8757M10.6898 11.7075L10.7854 12.5774M10.6898 11.7075C11.0086 11.6725 11.2308 11.4196 11.2308 11.1568M7.32042 13.2373L7.07414 12.8757M7.07414 12.8757L7.56676 13.5989M5.6159 3.35142C5.40674 3.47241 5.33527 3.74004 5.45626 3.94919C5.57724 4.15835 5.84488 4.22982 6.054 4.10883M5.6159 3.35142L6.054 4.10883M5.6159 3.35142C6.0239 3.11541 6.49769 2.98047 7.00163 2.98047M6.054 4.10883C6.33243 3.94778 6.65559 3.85547 7.00163 3.85547M7.94925 4.10883C8.15838 4.22982 8.42601 4.15835 8.54699 3.94919C8.66798 3.74004 8.59652 3.47241 8.38734 3.35142M7.94925 4.10883L8.38734 3.35142M7.94925 4.10883C7.67083 3.94778 7.34766 3.85547 7.00163 3.85547M8.38734 3.35142C7.97935 3.11541 7.50557 2.98047 7.00163 2.98047M4.418 2.04104C4.21982 2.17927 4.17123 2.45199 4.30946 2.65016C4.4477 2.84834 4.72041 2.89694 4.91859 2.7587M4.418 2.04104L4.91859 2.7587M4.418 2.04104C5.15044 1.53014 6.04169 1.23047 7.00163 1.23047M4.91859 2.7587C5.50895 2.34691 6.22644 2.10547 7.00163 2.10547M9.08465 2.7587C9.28287 2.89694 9.55558 2.84834 9.69377 2.65016C9.83202 2.45199 9.78343 2.17927 9.58527 2.04104M9.08465 2.7587L9.58527 2.04104M9.08465 2.7587C8.49432 2.34691 7.77682 2.10547 7.00163 2.10547M9.58527 2.04104C8.85284 1.53014 7.96156 1.23047 7.00163 1.23047M6.43649 6.62951C6.77559 6.86051 7.22767 6.86051 7.56676 6.62951M3.31343 4.7382C2.51477 4.65046 1.89746 5.3005 1.89746 6.04597M3.21787 12.5774C4.22977 12.6885 5.53457 12.9845 6.43649 13.5989M3.21787 12.5774C2.51194 12.4998 1.89746 11.9205 1.89746 11.1568M6.43649 13.5989C6.77559 13.8299 7.22767 13.8299 7.56676 13.5989M1.89746 6.04597V11.1568M1.89746 6.04597H2.77246M1.89746 11.1568H2.77246M2.77246 11.1568V6.04597M7.56676 6.62951C8.46871 6.01507 9.77351 5.71913 10.7854 5.60797M10.7854 5.60797C11.0115 5.58313 11.2308 5.76502 11.2308 6.04597M7.56676 13.5989C8.46871 12.9845 9.77351 12.6885 10.7854 12.5774M10.7854 12.5774C11.4913 12.4998 12.1058 11.9205 12.1058 11.1568M11.2308 6.04597V11.1568M11.2308 6.04597H12.1058M11.2308 11.1568H12.1058M12.1058 11.1568V6.04597M7.00163 3.85547V2.98047M7.00163 2.10547V1.23047'
                                                        stroke='#5C5958'
                                                        stroke-width='0.5'
                                                    />
                                                </g>
                                                <defs>
                                                    <clipPath id='clip0_336_47041'>
                                                        <rect
                                                            width='14'
                                                            height='14'
                                                            fill='white'
                                                            transform='translate(0 0.5)'
                                                        />
                                                    </clipPath>
                                                </defs>
                                            </svg>
                                        </span>{' '}
                                        {module.lectures} lectures
                                    </span>
                                    <span className='flex items-center gap-1'>
                                        {' '}
                                        <span>
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
                                                    stroke-width='1.2'
                                                    stroke-linecap='round'
                                                    stroke-linejoin='round'
                                                />
                                                <path
                                                    d='M7.85494 8.09086L6.30494 7.16586C6.03494 7.00586 5.81494 6.62086 5.81494 6.30586V4.25586'
                                                    stroke='#5C5958'
                                                    stroke-width='1.2'
                                                    stroke-linecap='round'
                                                    stroke-linejoin='round'
                                                />
                                            </svg>
                                        </span>
                                        {module.duration}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className='flex items-center gap-4'>
                            <div className='w-[120px]'>
                                <div className='flex items-center justify-between mb-1 gap-1.5'>
                                    <Progress
                                        value={module.progress}
                                        className='h-2.5'
                                        indicatorClass='bg-primary rounded-full'
                                    />
                                    <span className='text-xs text-black'>
                                        {module.progress}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Expanded Lessons */}
                    {expandedModules[module.id] && (
                        <div className='border-t border-gray-200 bg-gray-50'>
                            {module.lessons.map((lesson) => (
                                <div key={lesson.id}>
                                    <div
                                        className={cn(
                                            'flex items-center justify-between p-3 border-b border-gray-200',
                                            lesson.status === 'current'
                                                ? 'bg-blue-50'
                                                : '',
                                            lesson.isFolder
                                                ? 'cursor-pointer hover:bg-gray-100'
                                                : '',
                                        )}
                                        onClick={
                                            lesson.isFolder
                                                ? () => toggleFolder(lesson.id)
                                                : undefined
                                        }
                                    >
                                        <div className='flex items-center gap-3'>
                                            <div className='w-6 flex justify-center'>
                                                {lesson.isFolder ? (
                                                    <Folder className='h-5 w-5 text-gray-500' />
                                                ) : lesson.status ===
                                                  'completed' ? (
                                                    <CheckCircle className='h-5 w-5 text-green-500' />
                                                ) : lesson.status ===
                                                  'current' ? (
                                                    <Play className='h-5 w-5 text-blue-600' />
                                                ) : (
                                                    <div className='h-5 w-5 rounded-full border-2 border-gray-300'></div>
                                                )}
                                            </div>
                                            <div>
                                                <h4 className='text-sm font-medium text-gray-900'>
                                                    {lesson.title}
                                                </h4>
                                                <div className='flex items-center gap-2 text-xs text-gray-500'>
                                                    <span>{lesson.date}</span>
                                                    <span>{lesson.time}</span>
                                                    <span>
                                                        {lesson.duration}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className='flex items-center gap-3'>
                                            <div className='flex gap-1'>
                                                {lesson.tags.map(
                                                    (tag, index) => {
                                                        let bgColor =
                                                            'bg-gray-100';
                                                        let textColor =
                                                            'text-gray-700';

                                                        if (tag === 'High') {
                                                            bgColor =
                                                                'bg-red-100';
                                                            textColor =
                                                                'text-red-700';
                                                        } else if (
                                                            tag === 'Medium'
                                                        ) {
                                                            bgColor =
                                                                'bg-yellow-100';
                                                            textColor =
                                                                'text-yellow-700';
                                                        } else if (
                                                            tag === 'Low'
                                                        ) {
                                                            bgColor =
                                                                'bg-green-100';
                                                            textColor =
                                                                'text-green-700';
                                                        } else if (
                                                            tag === 'New'
                                                        ) {
                                                            bgColor =
                                                                'bg-blue-100';
                                                            textColor =
                                                                'text-blue-700';
                                                        } else if (
                                                            tag === 'Content'
                                                        ) {
                                                            bgColor =
                                                                'bg-purple-100';
                                                            textColor =
                                                                'text-purple-700';
                                                        } else if (
                                                            tag === 'Current'
                                                        ) {
                                                            bgColor =
                                                                'bg-blue-600';
                                                            textColor =
                                                                'text-white';
                                                        }

                                                        return (
                                                            <Badge
                                                                key={index}
                                                                className={`${bgColor} ${textColor} border-none text-xs font-normal`}
                                                            >
                                                                {tag}
                                                            </Badge>
                                                        );
                                                    },
                                                )}
                                            </div>
                                            <MoreVertical className='h-5 w-5 text-gray-400' />
                                        </div>
                                    </div>

                                    {/* Sub-lessons (if this is a folder and it's expanded) */}
                                    {lesson.isFolder &&
                                        lesson.subLessons &&
                                        expandedFolders[lesson.id] && (
                                            <div className='pl-8 bg-white border-b border-gray-200 relative'>
                                                {/* Vertical line connecting folder to sub-lessons */}
                                                <div className='absolute left-6 top-0 bottom-0 w-[1px] bg-border my-1'></div>

                                                {lesson.subLessons.map(
                                                    (subLesson) => (
                                                        <div
                                                            key={subLesson.id}
                                                            className='flex items-center justify-between p-3 border-b border-gray-100 last:border-b-0 relative'
                                                        >
                                                            <div className='flex items-center gap-3'>
                                                                <div className='w-6 flex justify-center'>
                                                                    <Play className='h-5 w-5 text-gray-500' />
                                                                </div>
                                                                <div>
                                                                    <h4 className='text-sm font-medium text-gray-900'>
                                                                        {
                                                                            subLesson.title
                                                                        }
                                                                    </h4>
                                                                    <div className='flex items-center gap-2 text-xs text-gray-500'>
                                                                        <span>
                                                                            {
                                                                                subLesson.date
                                                                            }
                                                                        </span>
                                                                        <span>
                                                                            {
                                                                                subLesson.time
                                                                            }
                                                                        </span>
                                                                        <span>
                                                                            {
                                                                                subLesson.duration
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className='flex items-center gap-3'>
                                                                <div className='flex gap-1'>
                                                                    {subLesson.tags.map(
                                                                        (
                                                                            tag,
                                                                            index,
                                                                        ) => {
                                                                            let bgColor =
                                                                                'bg-gray-100';
                                                                            let textColor =
                                                                                'text-gray-700';

                                                                            if (
                                                                                tag ===
                                                                                'High'
                                                                            ) {
                                                                                bgColor =
                                                                                    'bg-red-100';
                                                                                textColor =
                                                                                    'text-red-700';
                                                                            } else if (
                                                                                tag ===
                                                                                'Medium'
                                                                            ) {
                                                                                bgColor =
                                                                                    'bg-yellow-100';
                                                                                textColor =
                                                                                    'text-yellow-700';
                                                                            } else if (
                                                                                tag ===
                                                                                'Low'
                                                                            ) {
                                                                                bgColor =
                                                                                    'bg-green-100';
                                                                                textColor =
                                                                                    'text-green-700';
                                                                            }

                                                                            return (
                                                                                <Badge
                                                                                    key={
                                                                                        index
                                                                                    }
                                                                                    className={`${bgColor} ${textColor} border-none text-xs font-normal`}
                                                                                >
                                                                                    {
                                                                                        tag
                                                                                    }
                                                                                </Badge>
                                                                            );
                                                                        },
                                                                    )}
                                                                </div>
                                                                <MoreVertical className='h-5 w-5 text-gray-400' />
                                                            </div>
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        )}
                                </div>
                            ))}
                            {/* View More Button */}
                            <div className='flex items-center w-full my-2 px-2'>
                                <div className='h-px bg-border flex-grow'></div>
                                <Button
                                    onClick={() => {}}
                                    variant='outline'
                                    size='sm'
                                    className='mx-4 rounded-full px-4 bg-primary-light text-primary border-border-primary-light hover:bg-primary-light hover:text-primary'
                                >
                                    View More
                                    <ChevronDown className='h-4 w-4 ml-1' />
                                </Button>
                                <div className='h-px bg-border flex-grow'></div>
                            </div>
                        </div>
                    )}
                </div>
            ))}

            {/* View More Button */}
            <div className='flex items-center w-full'>
                <div className='h-px bg-border flex-grow'></div>
                <Button
                    onClick={() => {}}
                    variant='outline'
                    size='sm'
                    className='mx-4 rounded-full px-4 bg-primary-light text-primary border-border-primary-light hover:bg-primary-light hover:text-primary'
                >
                    View More
                    <ChevronDown className='h-4 w-4 ml-1' />
                </Button>
                <div className='h-px bg-border flex-grow'></div>
            </div>
        </div>
    );
}
