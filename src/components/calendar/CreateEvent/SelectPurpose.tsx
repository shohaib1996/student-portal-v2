'use client';

// React imports
import type React from 'react';
import { useState, useEffect, useCallback } from 'react';

// UI Components
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';

// Icons and SVGs
import { File, Folder, Play, Brain, LinkIcon, ChevronDown } from 'lucide-react';
import MemoizedLoadingIndicator from '@/components/svgs/common/LoadingIndicator';
import MemoizedEmptyState from '@/components/svgs/common/EmptyState';

// Navigation and Utils
import { cn } from '@/lib/utils';
import { buildContentTree } from '@/utils/tree-utils';

// Types
import {
    ChapterData,
    ChapterType,
    ICourseData,
    TChapter,
    type TContent,
    type TLessonInfo,
} from '@/types';
import { useAppSelector } from '@/redux/hooks';
import {
    useCourseContentQuery,
    useGetAllCourseProgramsQuery,
} from '@/redux/api/course/courseApi';
import GlobalDropdown from '@/components/global/GlobalDropdown';
import { Button } from '@/components/ui/button';
import GlobalTooltip from '@/components/global/GlobalTooltip';
import Cookies from 'js-cookie';

// Types definitions
interface ContentDropDownProps {
    value: { category?: string; resourceId?: string };
    onChange: (_: { category: string; resourceId: string }) => void;
    className?: string;
}

const SelectPurpose: React.FC<ContentDropDownProps> = ({
    value,
    onChange,
    className,
}) => {
    const [selectedTab, setSelectedTab] = useState({
        tab: 'Modules',
        value: 'modules',
    });
    const { myEnrollments } = useAppSelector((state) => state.auth);
    const [open, setOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<TContent | null>(null);

    const activeEnrollmentFromCookie = Cookies.get('activeEnrolment');
    const activeProgram = myEnrollments?.find(
        (en) => en._id === activeEnrollmentFromCookie,
    );
    const {
        data: programsData,
        isLoading: courseProgramsLoading,
        refetch: refetchCourseContent,
    } = useGetAllCourseProgramsQuery(
        {
            slug: activeProgram?.program?.slug,
            categoryID: selectedTab.value,
        },
        { skip: !activeProgram },
    );

    const { data: courseContent, isLoading: isCourseContentLoading } =
        useCourseContentQuery(
            { slug: activeProgram?.program?.slug },
            { skip: !activeProgram },
        );
    const chaptersData: TContent[] = programsData?.chapters;
    const [expandedChapters, setExpandedChapters] = useState<Set<string>>(
        new Set(),
    );
    const [treeData, setTreeData] = useState<TContent[]>([]);
    const [localCompletionState, setLocalCompletionState] = useState<
        Map<string, boolean>
    >(new Map());

    const courseContentData: ICourseData | undefined = courseContent;
    const tabs = courseContentData?.category?.categories;

    useEffect(() => {
        // Initialize first tab from available tabs if needed
        if (tabs && tabs?.length > 0 && selectedTab.value === 'modules') {
            setSelectedTab({ tab: tabs[0].name, value: tabs[0]._id });
        }
    }, [tabs, selectedTab.value]);

    useEffect(() => {
        console.log(
            value,
            chaptersData?.find((c) => c._id === value?.resourceId),
        );
        if (value && chaptersData) {
            const active = chaptersData?.find(
                (c) => c._id === value?.resourceId,
            );
            if (active) {
                setSelectedItem(active as TContent);
            }
        }
    }, [value, chaptersData]);

    // Initialize content tree
    useEffect(() => {
        if (chaptersData && chaptersData.length > 0) {
            try {
                const tree = buildContentTree(chaptersData);
                setTreeData(tree);
            } catch (error) {
                console.error('Error building content tree:', error);
                setTreeData([]);
            }
        } else {
            setTreeData([]);
        }
    }, [chaptersData]);

    // Utility handlers and formatters
    const handleProgressUpdate = useCallback(
        (lessonId: string, isCompleted: boolean) => {
            setLocalCompletionState((prevState) => {
                const newState = new Map(prevState);
                newState.set(lessonId, isCompleted);
                return newState;
            });
        },
        [],
    );

    const calculateProgressWithLocalState = useCallback(
        (chapter: TContent): number => {
            // If the chapter itself is marked as completed (either from API or local state),
            // return 100% immediately
            const localChapterCompletionState = localCompletionState.get(
                chapter._id,
            );
            const isChapterCompleted =
                localChapterCompletionState !== undefined
                    ? localChapterCompletionState
                    : chapter.isCompleted;

            if (isChapterCompleted) {
                return 100;
            }

            // Count all lessons and completed lessons recursively
            let totalLessons = 0;
            let completedLessonsCount = 0;

            // Helper function to count lessons
            const countLessonsWithState = (items: TContent[]): void => {
                if (!items || !Array.isArray(items)) {
                    return;
                }

                for (const item of items) {
                    if (item.type === 'lesson') {
                        totalLessons++;

                        // Check if this lesson is completed, using local state as priority
                        const localState = localCompletionState.get(item._id);
                        const isCompleted =
                            localState !== undefined
                                ? localState
                                : item.isCompleted;

                        if (isCompleted) {
                            completedLessonsCount++;
                        }
                    } else if (item?.children && item?.children.length > 0) {
                        countLessonsWithState(item?.children);
                    }
                }
            };

            // Start counting from the chapter's children
            if (chapter?.children && chapter?.children.length > 0) {
                countLessonsWithState(chapter.children);
            }

            // Calculate the progress percentage
            return totalLessons > 0
                ? Math.round((completedLessonsCount / totalLessons) * 100)
                : 0;
        },
        [localCompletionState],
    );

    const extractSlideId = useCallback((url: string): string => {
        try {
            const urlObj = new URL(url);
            const segments = urlObj.pathname.split('/');
            return segments[segments.length - 1]; // Get the ID from the path
        } catch {
            return url; // If it's already an ID, just return it
        }
    }, []);

    const formatSeconds = useCallback((totalSeconds: number): string => {
        if (!totalSeconds || isNaN(totalSeconds)) {
            return '0 min 0 sec';
        }
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;

        return `${minutes} min ${seconds.toFixed()} sec`;
    }, []);

    const renderPriorityBadge = useCallback((priority: number | undefined) => {
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
    }, []);

    // Event handlers
    const toggleChapter = useCallback(
        (chapterId: string, e?: React.MouseEvent): void => {
            if (e) {
                e.stopPropagation();
            }
            setExpandedChapters((prev) => {
                const newSet = new Set(prev);
                if (newSet.has(chapterId)) {
                    newSet.delete(chapterId);
                } else {
                    newSet.add(chapterId);
                }
                return newSet;
            });
        },
        [],
    );

    const handleSelect = (item: TContent) => {
        onChange({
            category: item.type,
            resourceId: item._id,
        });
        if (item.type === ChapterType.LESSON && 'lesson' in item) {
            setSelectedItem(item);
        } else if (item.type === ChapterType.CHAPTER && 'chapter' in item) {
            setSelectedItem(item);
        }
        setOpen(false);
    };

    // Content rendering
    const renderContent = useCallback(
        (
            data: TContent[],
            parentIndex = '',
            level: number,
        ): React.ReactNode => {
            return data.map((item, index) => {
                // Generate a unique key combining _id and parentIndex
                const uniqueKey = `${item._id}-${parentIndex}-${index}`;

                // Handle lesson type content
                if (item.type === ChapterType.LESSON && 'lesson' in item) {
                    // Check both backend and local completion status

                    return (
                        <AccordionItem
                            key={uniqueKey}
                            value={uniqueKey}
                            className='mb-2 mt-2 rounded-lg border mr-2'
                        >
                            {item?.lesson?.type === 'video' ? (
                                <AccordionTrigger
                                    isIcon={false}
                                    className={`text-start rounded-md hover:no-underline py-0 bg-background ${level % 2 !== 0 ? 'bg-background' : 'bg-foreground'}`}
                                >
                                    <div
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleSelect(item);
                                        }}
                                        className='flex items-center justify-between w-full p-2'
                                    >
                                        <div className='flex items-center gap-3 grow-[1] w-full cursor-pointer'>
                                            <GlobalTooltip tooltip='Video'>
                                                <Play className='h-5 w-5 stroke-gray' />
                                            </GlobalTooltip>
                                            <p className='text-sm font-medium text-black'>
                                                {item.lesson.title}
                                            </p>
                                        </div>

                                        <div className='flex items-center gap-1'>
                                            <div className='flex items-start gap-1'>
                                                {renderPriorityBadge(
                                                    item.priority,
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </AccordionTrigger>
                            ) : item.lesson.type === 'quiz' ? (
                                <>
                                    <AccordionTrigger
                                        isIcon={false}
                                        className={`text-start rounded-md hover:no-underline py-0 bg-background ${level % 2 !== 0 ? 'bg-background' : 'bg-foreground'}`}
                                    >
                                        <div
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleSelect(item);
                                            }}
                                            className='w-full'
                                        >
                                            <div className='flex items-center justify-between w-full p-2'>
                                                <div className='flex items-center gap-3 grow-[1]  '>
                                                    <div>
                                                        <Brain className='h-5 w-5 stroke-gray' />
                                                    </div>

                                                    <div>
                                                        <p className='text-sm font-medium text-black'>
                                                            {item.lesson.title}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className='flex items-center gap-3'>
                                                    <div className='flex gap-1'>
                                                        {renderPriorityBadge(
                                                            item.priority,
                                                        )}
                                                    </div>
                                                    <div className='flex items-center gap-1'></div>
                                                </div>
                                            </div>
                                        </div>
                                    </AccordionTrigger>
                                </>
                            ) : (
                                <AccordionTrigger
                                    isIcon={false}
                                    className={`text-start rounded-md hover:no-underline py-0 ${level % 2 !== 0 ? 'bg-background' : 'bg-foreground'}`}
                                >
                                    <div
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleSelect(item);
                                        }}
                                        className='w-full'
                                    >
                                        <div className='flex items-center justify-between w-full p-2'>
                                            <div>
                                                <File className='h-5 w-5 stroke-gray' />
                                            </div>

                                            <div>
                                                <p className='text-sm font-medium text-black'>
                                                    {item.lesson.title}
                                                </p>
                                            </div>

                                            <div className='flex items-center gap-3'>
                                                <div className='flex gap-1'>
                                                    {renderPriorityBadge(
                                                        item.priority,
                                                    )}
                                                </div>
                                                <div className='flex items-center gap-1'></div>
                                            </div>
                                        </div>
                                    </div>
                                </AccordionTrigger>
                            )}
                        </AccordionItem>
                    );
                }

                // Handle chapter type content
                if (item.type === ChapterType.CHAPTER && 'chapter' in item) {
                    const hasChildren =
                        item?.children && item.children.length > 0;

                    const isExpanded = expandedChapters.has(item._id);

                    return (
                        <AccordionItem
                            key={uniqueKey}
                            value={uniqueKey}
                            className={cn(
                                'mb-2  mr-2 rounded-lg border border-forground-border overflow-hidden bg-background flex justify-between items-start',
                                `${level % 2 !== 0 ? 'bg-background' : 'bg-foreground'}`,
                            )}
                        >
                            <div className='flex-1'>
                                <AccordionTrigger
                                    isIcon={false}
                                    className={`text-start hover:no-underline py-0 pr-0 [&[data-state=open]>div>div>svg]:stroke-primary [&[data-state=open]>div>p]:text-primary`}
                                    onClick={(e: React.MouseEvent) =>
                                        toggleChapter(item._id, e)
                                    }
                                >
                                    <div className='flex items-center justify-between w-full px-2 py-1 flex-wrap'>
                                        <div className='flex items-center gap-1'>
                                            <ChevronDown className='h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200' />
                                            <div
                                                className='flex items-center gap-1'
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleSelect(item);
                                                }}
                                            >
                                                <div className='bg-primary-light mr-1.5 p-1.5 rounded-md'>
                                                    <Folder className='size-4 stroke-primary' />
                                                </div>
                                                <div>
                                                    <h3 className='font-medium text-sm text-black'>
                                                        {item.chapter.name}
                                                    </h3>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                {isExpanded && (
                                    <AccordionContent className='border-t border-border pb-0'>
                                        {hasChildren ? (
                                            <Accordion
                                                type='single'
                                                collapsible
                                                className='ml-2'
                                            >
                                                {renderContent(
                                                    item?.children as TContent[],
                                                    uniqueKey,
                                                    level + 1,
                                                )}
                                            </Accordion>
                                        ) : courseProgramsLoading ? (
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
                                )}
                            </div>
                        </AccordionItem>
                    );
                }

                return null;
            });
        },
        [
            expandedChapters,
            formatSeconds,
            renderPriorityBadge,
            extractSlideId,
            toggleChapter,
            courseProgramsLoading,
            localCompletionState,
            handleProgressUpdate,
            calculateProgressWithLocalState,
        ],
    );

    return (
        <GlobalDropdown
            open={open}
            onOpenChange={setOpen}
            className='w-full p-2 max-w-md z-[99999]'
            dropdownRender={
                <div className='w-full'>
                    <div className='gap-2 flex overflow-x-auto pb-1'>
                        {tabs?.map((tab, i) => (
                            <Button
                                onClick={() =>
                                    setSelectedTab({
                                        tab: tab?.name as string,
                                        value: tab?._id as string,
                                    })
                                }
                                key={tab?._id || i}
                                value={tab?._id || ''}
                                className={cn(
                                    'rounded-lg border-forground-border h-7 bg-background text-dark-gray font-medium',
                                    {
                                        'bg-primary text-pure-white':
                                            tab._id === selectedTab.value,
                                    },
                                )}
                            >
                                {tab?.name || 'Untitled'}
                            </Button>
                        ))}
                    </div>
                    <div className={cn('space-y-2 mt-2')}>
                        <Accordion type='multiple' className='w-full'>
                            {courseProgramsLoading ? (
                                <MemoizedLoadingIndicator />
                            ) : treeData && treeData.length > 0 ? (
                                renderContent(treeData, '', 1)
                            ) : (
                                <MemoizedEmptyState />
                            )}
                        </Accordion>
                    </div>
                </div>
            }
        >
            <div
                onClick={() => setOpen((prev) => !prev)}
                className={cn(
                    'flex w-full gap-1 items-center border rounded-md h-10 bg-foreground text-sm text-dark-gray border-forground-border',
                    className,
                )}
            >
                <LinkIcon className='ml-3 h-4 w-4' />

                {selectedItem ? (
                    <>
                        {selectedItem.type === ChapterType.LESSON &&
                        'lesson' in selectedItem
                            ? selectedItem.lesson.title
                            : selectedItem.chapter?.name}
                    </>
                ) : (
                    <p className='truncate max-w-48'>Bootcamps/Course Link</p>
                )}

                <ChevronDown className='mr-3 h-4 w-4 ms-auto opacity-50' />
            </div>
        </GlobalDropdown>
    );
};

export default SelectPurpose;
