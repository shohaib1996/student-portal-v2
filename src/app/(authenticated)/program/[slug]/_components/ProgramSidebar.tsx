'use client';

import { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import {
    Play,
    Clock,
    Calendar,
    PanelLeftClose,
    Check,
    Package,
    CirclePlay,
    Filter,
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
    // Direct access to filter state to make filtering more explicit
    filterOption?: Array<{ property: string; value: any }>;
    setFilterOption?: React.Dispatch<
        React.SetStateAction<Array<{ property: string; value: any }>>
    >;
}

export function ProgramSidebar({
    courseData,
    onToggle,
    fetchedData,
    filterOption = [],
    setFilterOption,
}: CourseSidebarProps) {
    const [showCompleted, setShowCompleted] = useState(false);
    const { data, isLoading, error } = useGetPortalDataQuery({ bootcamp: {} });
    const bootcamp: TBootcampResult[] = data?.data?.bootcamp?.results;

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

    // Count all priorities in a single pass
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

    // Check if a filter is active
    const isFilterActive = (property: string, value: any): boolean => {
        return filterOption.some(
            (filter) => filter.property === property && filter.value === value,
        );
    };

    // Handle filter click for prioritized and pinned items
    const handleFilterClick = useCallback(
        (property: string, value: any) => {
            if (!setFilterOption) {
                return;
            }

            // Check if this filter is already applied
            const existingFilter = filterOption.find(
                (filter) =>
                    filter.property === property && filter.value === value,
            );

            if (existingFilter) {
                // If filter exists, remove it (toggle off)
                setFilterOption(
                    filterOption.filter(
                        (filter) =>
                            !(
                                filter.property === property &&
                                filter.value === value
                            ),
                    ),
                );
            } else {
                // Replace any existing sidebar filters with the new one
                // First find and keep any filters that are NOT from sidebar (may be from dropdown)
                const nonSidebarFilters = filterOption.filter(
                    (filter) =>
                        !(
                            filter.property === 'isPinned' ||
                            filter.property === 'priority'
                        ),
                );

                // Then add the new sidebar filter
                setFilterOption([...nonSidebarFilters, { property, value }]);
            }
        },
        [filterOption, setFilterOption],
    );

    // Handle the show/hide completed toggle
    const toggleShowCompleted = useCallback(() => {
        const newValue = !showCompleted;
        setShowCompleted(newValue);

        if (setFilterOption) {
            // First remove any existing isCompleted filter
            const filtersWithoutCompleted = filterOption.filter(
                (filter) => filter.property !== 'isCompleted',
            );

            // If we're now showing only completed items
            if (newValue) {
                setFilterOption([
                    ...filtersWithoutCompleted,
                    { property: 'isCompleted', value: true },
                ]);
            } else {
                // If showing all, just remove the completed filter
                setFilterOption(filtersWithoutCompleted);
            }
        }
    }, [showCompleted, filterOption, setFilterOption]);

    // Check if isCompleted filter is active and sync with showCompleted state
    useEffect(() => {
        const completedFilter = filterOption.find(
            (filter) =>
                filter.property === 'isCompleted' && filter.value === true,
        );

        // Only update if there's a mismatch to avoid infinite loop
        if (completedFilter && !showCompleted) {
            setShowCompleted(true);
        } else if (!completedFilter && showCompleted) {
            setShowCompleted(false);
        }
    }, [filterOption, showCompleted]);

    return (
        <div className='w-full pr-2'>
            <div className='flex items-center justify-between mb-4'>
                <div className='flex items-center gap-1'>
                    <Check className='h-4 w-4 text-green-500' />
                    <span className='text-sm font-medium'>Show Completed</span>
                    <div
                        className={`w-10 h-5 rounded-full p-1 cursor-pointer ${showCompleted ? 'bg-blue-600' : 'bg-gray-300'}`}
                        onClick={toggleShowCompleted}
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
                </div>
            </div>
            <Separator className='my-2 bg-border' />

            {/* Priority Filters - With explicit filter buttons */}
            <div className='space-y-1.5'>
                <div
                    className={`flex items-center justify-between p-2.5 border ${isFilterActive('isPinned', true) ? 'border-primary bg-primary-light/30' : 'border-border-primary-light'} rounded-sm group relative`}
                >
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
                    <div className='flex items-center gap-2'>
                        <span className='text-sm text-black'>
                            {newData?.totalPinned}
                        </span>
                        <button
                            onClick={() => handleFilterClick('isPinned', true)}
                            className={`p-1 rounded ${isFilterActive('isPinned', true) ? 'bg-primary text-white' : 'bg-gray-100 opacity-70 group-hover:opacity-100'}`}
                            title='Filter pinned items'
                        >
                            <Filter size={14} />
                        </button>
                    </div>
                </div>
                <div
                    className={`flex items-center justify-between p-2.5 border ${isFilterActive('priority', 3) ? 'border-primary bg-primary-light/30' : 'border-border-primary-light'} rounded-sm group relative`}
                >
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
                    <div className='flex items-center gap-2'>
                        <span className='text-sm text-black'>
                            {priorityCounts?.high || 0}
                        </span>
                        <button
                            onClick={() => handleFilterClick('priority', 3)}
                            className={`p-1 rounded ${isFilterActive('priority', 3) ? 'bg-primary text-white' : 'bg-gray-100 opacity-70 group-hover:opacity-100'}`}
                            title='Filter high priority items'
                        >
                            <Filter size={14} />
                        </button>
                    </div>
                </div>
                <div
                    className={`flex items-center justify-between p-2.5 border ${isFilterActive('priority', 2) ? 'border-primary bg-primary-light/30' : 'border-border-primary-light'} rounded-sm group relative`}
                >
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
                    <div className='flex items-center gap-2'>
                        <span className='text-sm text-black'>
                            {priorityCounts?.medium || 0}
                        </span>
                        <button
                            onClick={() => handleFilterClick('priority', 2)}
                            className={`p-1 rounded ${isFilterActive('priority', 2) ? 'bg-primary text-white' : 'bg-gray-100 opacity-70 group-hover:opacity-100'}`}
                            title='Filter medium priority items'
                        >
                            <Filter size={14} />
                        </button>
                    </div>
                </div>
                <div
                    className={`flex items-center justify-between p-2.5 border ${isFilterActive('priority', 1) ? 'border-primary bg-primary-light/30' : 'border-border-primary-light'} rounded-sm group relative`}
                >
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
                    <div className='flex items-center gap-2'>
                        <span className='text-sm text-black'>
                            {priorityCounts?.low || 0}
                        </span>
                        <button
                            onClick={() => handleFilterClick('priority', 1)}
                            className={`p-1 rounded ${isFilterActive('priority', 1) ? 'bg-primary text-white' : 'bg-gray-100 opacity-70 group-hover:opacity-100'}`}
                            title='Filter low priority items'
                        >
                            <Filter size={14} />
                        </button>
                    </div>
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
        </div>
    );
}
