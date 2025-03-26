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

interface CourseSidebarProps {
    courseData: any;
    onToggle?: () => void;
}

export function ProgramSidebar({ courseData, onToggle }: CourseSidebarProps) {
    const [showCompleted, setShowCompleted] = useState(true);

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
                            AWS DevOps And CloudOps Engineer
                        </span>
                    </h3>
                    <p className='text-sm text-gray my-2'>
                        Master cloud operations and automation
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
                        <span>
                            {courseData?.enrolledStudents} + enrolled students
                        </span>
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
                    <span className='text-sm text-black'>34</span>
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
                        {courseData?.priorities?.high}
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
                        {courseData?.priorities?.medium}
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
                        {courseData?.priorities?.low}
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
                            {courseData?.completion}%
                        </span>
                    </div>
                    <Progress
                        value={courseData?.completion}
                        className='h-2'
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
                            {courseData?.completed}
                        </span>
                    </div>
                    <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-2'>
                            <span>
                                <svg
                                    xmlns='http://www.w3.org/2000/svg'
                                    width='14'
                                    height='15'
                                    viewBox='0 0 14 15'
                                    fill='none'
                                >
                                    <g clipPath='url(#clip0_336_46946)'>
                                        <path
                                            d='M6.99837 13.3327C10.22 13.3327 12.8317 10.721 12.8317 7.49935C12.8317 4.27769 10.22 1.66602 6.99837 1.66602C3.77671 1.66602 1.16504 4.27769 1.16504 7.49935C1.16504 10.721 3.77671 13.3327 6.99837 13.3327Z'
                                            stroke='#F59504'
                                            strokeWidth='1.5'
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                        />
                                        <path
                                            d='M7 4V7.5L9.33333 8.66667'
                                            stroke='#F59504'
                                            strokeWidth='1.5'
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                        />
                                    </g>
                                    <defs>
                                        <clipPath id='clip0_336_46946'>
                                            <rect
                                                width='14'
                                                height='14'
                                                fill='white'
                                                transform='translate(0 0.5)'
                                            />
                                        </clipPath>
                                    </defs>
                                </svg>
                            </span>
                            <span className='text-xs text-gray'>
                                In progress
                            </span>
                        </div>
                        <span className='text-xs font-medium text-black'>
                            {courseData?.inProgress}
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
                            {courseData?.notStarted}
                        </span>
                    </div>
                </div>
            </div>

            {/* Focused Lesson */}
            <div className='border border-border rounded-lg p-2.5 mt-2'>
                <h3 className='font-medium text-black flex items-center gap-2'>
                    <svg
                        xmlns='http://www.w3.org/2000/svg'
                        width='20'
                        height='20'
                        viewBox='0 0 20 20'
                        fill='none'
                    >
                        <path
                            d='M10.6276 8.64697C10.6276 8.30183 10.3478 8.022 10.0026 8.022C9.65744 8.022 9.3776 8.30183 9.3776 8.64697H10.6276ZM9.3776 17.8826C9.3776 18.2277 9.65744 18.5076 10.0026 18.5076C10.3478 18.5076 10.6276 18.2277 10.6276 17.8826H9.3776ZM8.02299 4.0729C7.7242 4.24574 7.6221 4.62808 7.79494 4.92686C7.96777 5.22565 8.3501 5.32775 8.64885 5.15491L8.02299 4.0729ZM11.3564 5.15491C11.6551 5.32775 12.0374 5.22565 12.2103 4.92686C12.3831 4.62808 12.281 4.24574 11.9822 4.0729L11.3564 5.15491ZM6.31171 2.20093C6.0286 2.3984 5.95918 2.78799 6.15665 3.0711C6.35413 3.35421 6.74372 3.42364 7.02683 3.22616L6.31171 2.20093ZM12.9784 3.22616C13.2615 3.42364 13.6511 3.35421 13.8485 3.0711C14.046 2.78799 13.9766 2.3984 13.6935 2.20093L12.9784 3.22616ZM9.3776 8.64697V17.8826H10.6276V8.64697H9.3776ZM4.59724 7.29654C6.0428 7.45534 7.9068 7.87812 9.19527 8.75589L9.89902 7.72284C8.35594 6.67157 6.24601 6.22015 4.73375 6.05401L4.59724 7.29654ZM4.59724 17.2528C6.0428 17.4116 7.9068 17.8344 9.19527 18.7121L9.89902 17.6791C8.35594 16.6278 6.24601 16.1764 4.73375 16.0102L4.59724 17.2528ZM2.71094 7.92225V15.2235H3.96094V7.92225H2.71094ZM4.73375 16.0102C4.27835 15.9602 3.96094 15.5989 3.96094 15.2235H2.71094C2.71094 16.3144 3.58876 17.142 4.59724 17.2528L4.73375 16.0102ZM4.73375 6.05401C3.5928 5.92867 2.71094 6.85729 2.71094 7.92225H3.96094C3.96094 7.52089 4.2743 7.26106 4.59724 7.29654L4.73375 6.05401ZM15.2714 6.05401C13.7592 6.22015 11.6493 6.67157 10.1062 7.72284L10.8099 8.75589C12.0984 7.87812 13.9624 7.45534 15.4079 7.29654L15.2714 6.05401ZM15.2714 16.0102C13.7592 16.1764 11.6493 16.6278 10.1062 17.6791L10.8099 18.7121C12.0984 17.8344 13.9624 17.4116 15.4079 17.2528L15.2714 16.0102ZM16.0443 7.92225V15.2235H17.2943V7.92225H16.0443ZM15.4079 17.2528C16.4164 17.142 17.2943 16.3144 17.2943 15.2235H16.0443C16.0443 15.5989 15.7269 15.9602 15.2714 16.0102L15.4079 17.2528ZM15.4079 7.29654C15.7309 7.26106 16.0443 7.52089 16.0443 7.92225H17.2943C17.2943 6.85729 16.4124 5.92867 15.2714 6.05401L15.4079 7.29654ZM9.19527 18.7121C9.67969 19.0421 10.3255 19.0421 10.8099 18.7121L10.1062 17.6791C10.0464 17.7198 9.95885 17.7198 9.89902 17.6791L9.19527 18.7121ZM9.19527 8.75589C9.67969 9.08589 10.3255 9.08589 10.8099 8.75589L10.1062 7.72284C10.0464 7.76359 9.95885 7.76359 9.89902 7.72284L9.19527 8.75589ZM8.64885 5.15491C9.0466 4.92484 9.50827 4.79297 10.0026 4.79297V3.54297C9.28269 3.54297 8.60585 3.73574 8.02299 4.0729L8.64885 5.15491ZM10.0026 4.79297C10.4969 4.79297 10.9586 4.92484 11.3564 5.15491L11.9822 4.0729C11.3994 3.73574 10.7225 3.54297 10.0026 3.54297V4.79297ZM7.02683 3.22616C7.87021 2.63789 8.89519 2.29297 10.0026 2.29297V1.04297C8.63127 1.04297 7.35805 1.47108 6.31171 2.20093L7.02683 3.22616ZM10.0026 2.29297C11.11 2.29297 12.135 2.63789 12.9784 3.22616L13.6935 2.20093C12.6472 1.47108 11.3739 1.04297 10.0026 1.04297V2.29297Z'
                            fill='#0736D1'
                        />
                        <path
                            d='M10.6276 8.64697C10.6276 8.30183 10.3478 8.022 10.0026 8.022C9.65744 8.022 9.3776 8.30183 9.3776 8.64697H10.6276ZM9.3776 17.8826C9.3776 18.2277 9.65744 18.5076 10.0026 18.5076C10.3478 18.5076 10.6276 18.2277 10.6276 17.8826H9.3776ZM8.02299 4.0729C7.7242 4.24574 7.6221 4.62808 7.79494 4.92686C7.96777 5.22565 8.3501 5.32775 8.64885 5.15491L8.02299 4.0729ZM11.3564 5.15491C11.6551 5.32775 12.0374 5.22565 12.2103 4.92686C12.3831 4.62808 12.281 4.24574 11.9822 4.0729L11.3564 5.15491ZM6.31171 2.20093C6.0286 2.3984 5.95918 2.78799 6.15665 3.0711C6.35413 3.35421 6.74372 3.42364 7.02683 3.22616L6.31171 2.20093ZM12.9784 3.22616C13.2615 3.42364 13.6511 3.35421 13.8485 3.0711C14.046 2.78799 13.9766 2.3984 13.6935 2.20093L12.9784 3.22616ZM9.3776 8.64697V17.8826H10.6276V8.64697H9.3776ZM4.59724 7.29654C6.0428 7.45534 7.9068 7.87812 9.19527 8.75589L9.89902 7.72284C8.35594 6.67157 6.24601 6.22015 4.73375 6.05401L4.59724 7.29654ZM4.59724 17.2528C6.0428 17.4116 7.9068 17.8344 9.19527 18.7121L9.89902 17.6791C8.35594 16.6278 6.24601 16.1764 4.73375 16.0102L4.59724 17.2528ZM2.71094 7.92225V15.2235H3.96094V7.92225H2.71094ZM4.73375 16.0102C4.27835 15.9602 3.96094 15.5989 3.96094 15.2235H2.71094C2.71094 16.3144 3.58876 17.142 4.59724 17.2528L4.73375 16.0102ZM4.73375 6.05401C3.5928 5.92867 2.71094 6.85729 2.71094 7.92225H3.96094C3.96094 7.52089 4.2743 7.26106 4.59724 7.29654L4.73375 6.05401ZM15.2714 6.05401C13.7592 6.22015 11.6493 6.67157 10.1062 7.72284L10.8099 8.75589C12.0984 7.87812 13.9624 7.45534 15.4079 7.29654L15.2714 6.05401ZM15.2714 16.0102C13.7592 16.1764 11.6493 16.6278 10.1062 17.6791L10.8099 18.7121C12.0984 17.8344 13.9624 17.4116 15.4079 17.2528L15.2714 16.0102ZM16.0443 7.92225V15.2235H17.2943V7.92225H16.0443ZM15.4079 17.2528C16.4164 17.142 17.2943 16.3144 17.2943 15.2235H16.0443C16.0443 15.5989 15.7269 15.9602 15.2714 16.0102L15.4079 17.2528ZM15.4079 7.29654C15.7309 7.26106 16.0443 7.52089 16.0443 7.92225H17.2943C17.2943 6.85729 16.4124 5.92867 15.2714 6.05401L15.4079 7.29654ZM9.19527 18.7121C9.67969 19.0421 10.3255 19.0421 10.8099 18.7121L10.1062 17.6791C10.0464 17.7198 9.95885 17.7198 9.89902 17.6791L9.19527 18.7121ZM9.19527 8.75589C9.67969 9.08589 10.3255 9.08589 10.8099 8.75589L10.1062 7.72284C10.0464 7.76359 9.95885 7.76359 9.89902 7.72284L9.19527 8.75589ZM8.64885 5.15491C9.0466 4.92484 9.50827 4.79297 10.0026 4.79297V3.54297C9.28269 3.54297 8.60585 3.73574 8.02299 4.0729L8.64885 5.15491ZM10.0026 4.79297C10.4969 4.79297 10.9586 4.92484 11.3564 5.15491L11.9822 4.0729C11.3994 3.73574 10.7225 3.54297 10.0026 3.54297V4.79297ZM7.02683 3.22616C7.87021 2.63789 8.89519 2.29297 10.0026 2.29297V1.04297C8.63127 1.04297 7.35805 1.47108 6.31171 2.20093L7.02683 3.22616ZM10.0026 2.29297C11.11 2.29297 12.135 2.63789 12.9784 3.22616L13.6935 2.20093C12.6472 1.47108 11.3739 1.04297 10.0026 1.04297V2.29297Z'
                            fill='black'
                            fillOpacity='0.2'
                        />
                        <path
                            d='M10.6276 8.64697C10.6276 8.30183 10.3478 8.022 10.0026 8.022C9.65744 8.022 9.3776 8.30183 9.3776 8.64697M10.6276 8.64697H9.3776M10.6276 8.64697V17.8826M9.3776 8.64697V17.8826M9.3776 17.8826C9.3776 18.2277 9.65744 18.5076 10.0026 18.5076C10.3478 18.5076 10.6276 18.2277 10.6276 17.8826M9.3776 17.8826H10.6276M4.66549 6.67528L4.59724 7.29654M4.59724 7.29654C6.0428 7.45534 7.9068 7.87812 9.19527 8.75589M4.59724 7.29654L4.73375 6.05401M4.59724 7.29654C4.2743 7.26106 3.96094 7.52089 3.96094 7.92225M9.54719 8.23937L9.89902 7.72284M9.89902 7.72284L9.19527 8.75589M9.89902 7.72284C8.35594 6.67157 6.24601 6.22015 4.73375 6.05401M9.89902 7.72284C9.95885 7.76359 10.0464 7.76359 10.1062 7.72284M4.66549 16.6316L4.73375 16.0102M4.73375 16.0102C6.24601 16.1764 8.35594 16.6278 9.89902 17.6791M4.73375 16.0102L4.59724 17.2528M4.73375 16.0102C4.27835 15.9602 3.96094 15.5989 3.96094 15.2235M9.54719 18.1956L9.89902 17.6791M9.89902 17.6791L9.19527 18.7121M9.89902 17.6791C9.95885 17.7198 10.0464 17.7198 10.1062 17.6791M15.3397 6.67528L15.2714 6.05401M15.2714 6.05401C13.7592 6.22015 11.6493 6.67157 10.1062 7.72284M15.2714 6.05401L15.4079 7.29654M15.2714 6.05401C16.4124 5.92867 17.2943 6.85729 17.2943 7.92225M10.458 8.23937L10.1062 7.72284M10.1062 7.72284L10.8099 8.75589M15.3397 16.6316L15.2714 16.0102M15.2714 16.0102C13.7592 16.1764 11.6493 16.6278 10.1062 17.6791M15.2714 16.0102L15.4079 17.2528M15.2714 16.0102C15.7269 15.9602 16.0443 15.5989 16.0443 15.2235M10.458 18.1956L10.1062 17.6791M10.1062 17.6791L10.8099 18.7121M8.02299 4.0729C7.7242 4.24574 7.6221 4.62808 7.79494 4.92686C7.96777 5.22565 8.3501 5.32775 8.64885 5.15491M8.02299 4.0729L8.64885 5.15491M8.02299 4.0729C8.60585 3.73574 9.28269 3.54297 10.0026 3.54297M8.64885 5.15491C9.0466 4.92484 9.50827 4.79297 10.0026 4.79297M11.3564 5.15491C11.6551 5.32775 12.0374 5.22565 12.2103 4.92686C12.3831 4.62808 12.281 4.24574 11.9822 4.0729M11.3564 5.15491L11.9822 4.0729M11.3564 5.15491C10.9586 4.92484 10.4969 4.79297 10.0026 4.79297M11.9822 4.0729C11.3994 3.73574 10.7225 3.54297 10.0026 3.54297M6.31171 2.20093C6.0286 2.3984 5.95918 2.78799 6.15665 3.0711C6.35413 3.35421 6.74372 3.42364 7.02683 3.22616M6.31171 2.20093L7.02683 3.22616M6.31171 2.20093C7.35805 1.47108 8.63127 1.04297 10.0026 1.04297M7.02683 3.22616C7.87021 2.63789 8.89519 2.29297 10.0026 2.29297M12.9784 3.22616C13.2615 3.42364 13.6511 3.35421 13.8485 3.0711C14.046 2.78799 13.9766 2.3984 13.6935 2.20093M12.9784 3.22616L13.6935 2.20093M12.9784 3.22616C12.135 2.63789 11.11 2.29297 10.0026 2.29297M13.6935 2.20093C12.6472 1.47108 11.3739 1.04297 10.0026 1.04297M9.19527 8.75589C9.67969 9.08589 10.3255 9.08589 10.8099 8.75589M4.73375 6.05401C3.5928 5.92867 2.71094 6.85729 2.71094 7.92225M4.59724 17.2528C6.0428 17.4116 7.9068 17.8344 9.19527 18.7121M4.59724 17.2528C3.58876 17.142 2.71094 16.3144 2.71094 15.2235M9.19527 18.7121C9.67969 19.0421 10.3255 19.0421 10.8099 18.7121M2.71094 7.92225V15.2235M2.71094 7.92225H3.96094M2.71094 15.2235H3.96094M3.96094 15.2235V7.92225M10.8099 8.75589C12.0984 7.87812 13.9624 7.45534 15.4079 7.29654M15.4079 7.29654C15.7309 7.26106 16.0443 7.52089 16.0443 7.92225M10.8099 18.7121C12.0984 17.8344 13.9624 17.4116 15.4079 17.2528M15.4079 17.2528C16.4164 17.142 17.2943 16.3144 17.2943 15.2235M16.0443 7.92225V15.2235M16.0443 7.92225H17.2943M16.0443 15.2235H17.2943M17.2943 15.2235V7.92225M10.0026 4.79297V3.54297M10.0026 2.29297V1.04297'
                            stroke='#0736D1'
                            strokeWidth='0.5'
                        />
                        <path
                            d='M10.6276 8.64697C10.6276 8.30183 10.3478 8.022 10.0026 8.022C9.65744 8.022 9.3776 8.30183 9.3776 8.64697M10.6276 8.64697H9.3776M10.6276 8.64697V17.8826M9.3776 8.64697V17.8826M9.3776 17.8826C9.3776 18.2277 9.65744 18.5076 10.0026 18.5076C10.3478 18.5076 10.6276 18.2277 10.6276 17.8826M9.3776 17.8826H10.6276M4.66549 6.67528L4.59724 7.29654M4.59724 7.29654C6.0428 7.45534 7.9068 7.87812 9.19527 8.75589M4.59724 7.29654L4.73375 6.05401M4.59724 7.29654C4.2743 7.26106 3.96094 7.52089 3.96094 7.92225M9.54719 8.23937L9.89902 7.72284M9.89902 7.72284L9.19527 8.75589M9.89902 7.72284C8.35594 6.67157 6.24601 6.22015 4.73375 6.05401M9.89902 7.72284C9.95885 7.76359 10.0464 7.76359 10.1062 7.72284M4.66549 16.6316L4.73375 16.0102M4.73375 16.0102C6.24601 16.1764 8.35594 16.6278 9.89902 17.6791M4.73375 16.0102L4.59724 17.2528M4.73375 16.0102C4.27835 15.9602 3.96094 15.5989 3.96094 15.2235M9.54719 18.1956L9.89902 17.6791M9.89902 17.6791L9.19527 18.7121M9.89902 17.6791C9.95885 17.7198 10.0464 17.7198 10.1062 17.6791M15.3397 6.67528L15.2714 6.05401M15.2714 6.05401C13.7592 6.22015 11.6493 6.67157 10.1062 7.72284M15.2714 6.05401L15.4079 7.29654M15.2714 6.05401C16.4124 5.92867 17.2943 6.85729 17.2943 7.92225M10.458 8.23937L10.1062 7.72284M10.1062 7.72284L10.8099 8.75589M15.3397 16.6316L15.2714 16.0102M15.2714 16.0102C13.7592 16.1764 11.6493 16.6278 10.1062 17.6791M15.2714 16.0102L15.4079 17.2528M15.2714 16.0102C15.7269 15.9602 16.0443 15.5989 16.0443 15.2235M10.458 18.1956L10.1062 17.6791M10.1062 17.6791L10.8099 18.7121M8.02299 4.0729C7.7242 4.24574 7.6221 4.62808 7.79494 4.92686C7.96777 5.22565 8.3501 5.32775 8.64885 5.15491M8.02299 4.0729L8.64885 5.15491M8.02299 4.0729C8.60585 3.73574 9.28269 3.54297 10.0026 3.54297M8.64885 5.15491C9.0466 4.92484 9.50827 4.79297 10.0026 4.79297M11.3564 5.15491C11.6551 5.32775 12.0374 5.22565 12.2103 4.92686C12.3831 4.62808 12.281 4.24574 11.9822 4.0729M11.3564 5.15491L11.9822 4.0729M11.3564 5.15491C10.9586 4.92484 10.4969 4.79297 10.0026 4.79297M11.9822 4.0729C11.3994 3.73574 10.7225 3.54297 10.0026 3.54297M6.31171 2.20093C6.0286 2.3984 5.95918 2.78799 6.15665 3.0711C6.35413 3.35421 6.74372 3.42364 7.02683 3.22616M6.31171 2.20093L7.02683 3.22616M6.31171 2.20093C7.35805 1.47108 8.63127 1.04297 10.0026 1.04297M7.02683 3.22616C7.87021 2.63789 8.89519 2.29297 10.0026 2.29297M12.9784 3.22616C13.2615 3.42364 13.6511 3.35421 13.8485 3.0711C14.046 2.78799 13.9766 2.3984 13.6935 2.20093M12.9784 3.22616L13.6935 2.20093M12.9784 3.22616C12.135 2.63789 11.11 2.29297 10.0026 2.29297M13.6935 2.20093C12.6472 1.47108 11.3739 1.04297 10.0026 1.04297M9.19527 8.75589C9.67969 9.08589 10.3255 9.08589 10.8099 8.75589M4.73375 6.05401C3.5928 5.92867 2.71094 6.85729 2.71094 7.92225M4.59724 17.2528C6.0428 17.4116 7.9068 17.8344 9.19527 18.7121M4.59724 17.2528C3.58876 17.142 2.71094 16.3144 2.71094 15.2235M9.19527 18.7121C9.67969 19.0421 10.3255 19.0421 10.8099 18.7121M2.71094 7.92225V15.2235M2.71094 7.92225H3.96094M2.71094 15.2235H3.96094M3.96094 15.2235V7.92225M10.8099 8.75589C12.0984 7.87812 13.9624 7.45534 15.4079 7.29654M15.4079 7.29654C15.7309 7.26106 16.0443 7.52089 16.0443 7.92225M10.8099 18.7121C12.0984 17.8344 13.9624 17.4116 15.4079 17.2528M15.4079 17.2528C16.4164 17.142 17.2943 16.3144 17.2943 15.2235M16.0443 7.92225V15.2235M16.0443 7.92225H17.2943M16.0443 15.2235H17.2943M17.2943 15.2235V7.92225M10.0026 4.79297V3.54297M10.0026 2.29297V1.04297'
                            stroke='black'
                            strokeOpacity='0.2'
                            strokeWidth='0.5'
                        />
                    </svg>
                    <span>Focused Lesson</span>
                </h3>
                <Separator className='my-2' />
                <div className='bg-primary-light rounded-lg p-1.5'>
                    <div className='flex items-start mb-2'>
                        <div className='bg-background mr-1.5 p-1.5 rounded-md'>
                            <Play className='h-4 w-4 text-primary' />
                        </div>
                        <div className='space-y-1'>
                            <h4 className='text-sm font-medium text-black'>
                                {courseData?.focusedLesson?.title}
                            </h4>
                            <div className='flex items-center gap-2 text-xs text-gray'>
                                <div className='flex items-center gap-1'>
                                    <Calendar className='h-3 w-3 text-dark-gray' />
                                    <span>
                                        {courseData?.focusedLesson?.date}
                                    </span>
                                </div>
                                <div className='flex items-center gap-1'>
                                    <Clock className='h-3 w-3 text-dark-gray' />
                                    <span>
                                        {courseData?.focusedLesson?.time}
                                    </span>
                                </div>
                                <span className=''>
                                    {courseData?.focusedLesson?.duration}
                                </span>
                            </div>
                        </div>
                        <Badge className='text-red-600 border-red-600 text-[10px] font-medium px-1 border bg-transparent'>
                            {courseData?.focusedLesson?.tags[0]}
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
                            className='h-2 bg-background'
                            indicatorClass='bg-primary rounded-full'
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
