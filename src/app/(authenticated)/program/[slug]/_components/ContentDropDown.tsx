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
import { Progress } from '@/components/ui/progress';
import GlobalModal from '@/components/global/GlobalModal';

// Icons and SVGs
import { File, Folder, Play, MoreVertical, Clock, Brain } from 'lucide-react';
import LecturesSvg from '@/components/svgs/common/LecturesSvg';
import MemoizedLoadingIndicator from '@/components/svgs/common/LoadingIndicator';
import MemoizedEmptyState from '@/components/svgs/common/EmptyState';

// Navigation and Utils
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
    buildContentTree,
    getTotalDuration,
    countLessons,
    searchContentTree,
} from '@/utils/tree-utils';

// Types
import {
    AnswerPayload,
    ChapterType,
    Interview,
    type TContent,
    type TLessonInfo,
} from '@/types';

// Related Components
import LessionActionMenu from './LessionActionMenu';

import QuizModalContent from './QuizModalContent';

// Types definitions
interface ContentDropDownProps {
    fetchedData: TContent[] | null;
    videoData: {
        videoInfo: null | TLessonInfo;
        isSideOpen: boolean;
        item: TContent;
        contentId: string | null;
    };
    option: {
        isLoading: boolean;
        isError: boolean;
        courseProgramsLoading: boolean;
    };
    setVideoData: React.Dispatch<
        React.SetStateAction<{
            videoInfo: null | TLessonInfo;
            isSideOpen: boolean;
            item: TContent;
            contentId: string | null;
        }>
    >;
    setIsPinnedEyeOpen: React.Dispatch<React.SetStateAction<boolean>>;
    searchInput: string;
    filterOption: Array<{ property: string; value: any }>;
    localCompletionState?: Map<string, boolean>;
    setLocalCompletionState?: React.Dispatch<
        React.SetStateAction<Map<string, boolean>>
    >;
}

interface QuizModalProps {
    openQuiz: boolean;
    setOpenQuiz: React.Dispatch<React.SetStateAction<boolean>>;
}

// Helper component for Quiz Modal
// const QuizModalComponent: React.FC<QuizModalProps> = ({
//     openQuiz,
//     setOpenQuiz,
// }) => {
//     console.log({ openQuiz });
//     return <GlobalModal open={openQuiz} setOpen={setOpenQuiz}></GlobalModal>;
// };

// Main component
const ContentDropDown: React.FC<ContentDropDownProps> = ({
    fetchedData,
    setVideoData,
    videoData,
    setIsPinnedEyeOpen,
    option,
    searchInput,
    filterOption,
}) => {
    // State management
    const [expandedChapters, setExpandedChapters] = useState<Set<string>>(
        new Set(),
    );
    const [treeData, setTreeData] = useState<TContent[]>([]);
    const [localCompletionState, setLocalCompletionState] = useState<
        Map<string, boolean>
    >(new Map());
    const [openQuiz, setOpenQuiz] = useState(false);

    const [lesson, setLesson] = useState({});

    // Initialize content tree
    useEffect(() => {
        if (fetchedData && fetchedData.length > 0) {
            try {
                const tree = buildContentTree(fetchedData);
                setTreeData(tree);
            } catch (error) {
                console.error('Error building content tree:', error);
                setTreeData([]);
            }
        } else {
            setTreeData([]);
        }
    }, [fetchedData, searchInput]);

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

    const handleVideoClick = useCallback(
        (item: TContent, e: React.MouseEvent): void => {
            e.stopPropagation();
            setIsPinnedEyeOpen(item?.isPinned || false);
            setVideoData({
                videoInfo: {
                    ...(item?.lesson as TLessonInfo),
                },
                isSideOpen: true,
                contentId: item._id,
                item: item,
            });
        },
        [setIsPinnedEyeOpen, setVideoData],
    );

    const handelQuizOpen = () => {
        setOpenQuiz(true);
    };
    const handleQuizClose = () => {
        setOpenQuiz(false);
    };
    // Content rendering
    const renderContent = useCallback(
        (data: TContent[], parentIndex = ''): React.ReactNode => {
            return data.map((item, index) => {
                // Generate a unique key combining _id and parentIndex
                const uniqueKey = `${item._id}-${parentIndex}-${index}`;

                // Handle lesson type content
                if (item.type === ChapterType.LESSON && 'lesson' in item) {
                    // Check both backend and local completion status
                    const localCompletionStatus = localCompletionState.get(
                        item._id,
                    );
                    const isItemCompleted =
                        localCompletionStatus !== undefined
                            ? localCompletionStatus
                            : item.isCompleted;

                    const status = isItemCompleted ? 'completed' : 'upcoming';

                    return (
                        <AccordionItem
                            key={uniqueKey}
                            value={uniqueKey}
                            className='mb-4 mt-4 rounded-lg border mr-4'
                        >
                            {item?.lesson?.type === 'video' ? (
                                <AccordionTrigger
                                    isIcon={false}
                                    className={`text-start hover:no-underline py-0 ${
                                        status === 'upcoming'
                                            ? 'bg-primary-light'
                                            : ''
                                    } [&[data-state=open]>div>div>svg]:stroke-primary [&[data-state=open]>div>p]:text-primary`}
                                >
                                    <div className='flex items-center justify-between w-full p-2'>
                                        <div
                                            className='flex items-center gap-3 grow-[1] w-full cursor-pointer'
                                            onClick={(e: React.MouseEvent) =>
                                                handleVideoClick(item, e)
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
                                        </div>

                                        <div className='flex items-center gap-1'>
                                            <div className='flex items-start gap-1'>
                                                {renderPriorityBadge(
                                                    item.priority,
                                                )}
                                            </div>
                                            <LessionActionMenu
                                                videoData={videoData}
                                                item={item}
                                                setVideoData={setVideoData}
                                                lessonId={item?._id}
                                                courseId={
                                                    item?.myCourse?.course
                                                }
                                                setIsPinnedEyeOpen={
                                                    setIsPinnedEyeOpen
                                                }
                                                onProgressUpdate={
                                                    handleProgressUpdate
                                                }
                                            />
                                        </div>
                                    </div>
                                </AccordionTrigger>
                            ) : item.lesson.type === 'quiz' ? (
                                <>
                                    <AccordionTrigger
                                        isIcon={false}
                                        className={`text-start hover:no-underline py-0 ${
                                            status === 'upcoming' ? '' : ''
                                        } [&[data-state=open]>a>div>div>p]:text-primary [&[data-state=open]>div>div>svg]:stroke-primary`}
                                    >
                                        <div className='w-full'>
                                            <div className='flex items-center justify-between w-full p-2'>
                                                <div
                                                    className='flex items-center gap-3 grow-[1]  '
                                                    onClick={() => {
                                                        handelQuizOpen();
                                                        setLesson(item);
                                                    }}
                                                >
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
                                                    <div className='flex items-center gap-1'>
                                                        <LessionActionMenu
                                                            videoData={
                                                                videoData
                                                            }
                                                            item={item}
                                                            setVideoData={
                                                                setVideoData
                                                            }
                                                            lessonId={item?._id}
                                                            courseId={
                                                                item?.myCourse
                                                                    ?.course
                                                            }
                                                            setIsPinnedEyeOpen={
                                                                setIsPinnedEyeOpen
                                                            }
                                                            onProgressUpdate={
                                                                handleProgressUpdate
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </AccordionTrigger>
                                </>
                            ) : (
                                <AccordionTrigger
                                    isIcon={false}
                                    className={`text-start hover:no-underline py-0 ${
                                        status === 'upcoming' ? '' : ''
                                    } [&[data-state=open]>a>div>div>p]:text-primary [&[data-state=open]>div>div>svg]:stroke-primary`}
                                >
                                    <div className='w-full'>
                                        <div className='flex items-center justify-between w-full p-2'>
                                            <Link
                                                href={
                                                    item.lesson.url
                                                        ? `/presentation-slides/${extractSlideId(item.lesson.url)}`
                                                        : '#'
                                                }
                                                target='_blank'
                                                className='flex items-center gap-3 grow-[1] w-full'
                                            >
                                                <div>
                                                    <File className='h-5 w-5 stroke-gray' />
                                                </div>

                                                <div>
                                                    <p className='text-sm font-medium text-black'>
                                                        {item.lesson.title}
                                                    </p>
                                                </div>
                                            </Link>

                                            <div className='flex items-center gap-3'>
                                                <div className='flex gap-1'>
                                                    {renderPriorityBadge(
                                                        item.priority,
                                                    )}
                                                </div>
                                                <div className='flex items-center gap-1'>
                                                    <LessionActionMenu
                                                        videoData={videoData}
                                                        item={item}
                                                        setVideoData={
                                                            setVideoData
                                                        }
                                                        lessonId={item?._id}
                                                        courseId={
                                                            item?.myCourse
                                                                ?.course
                                                        }
                                                        setIsPinnedEyeOpen={
                                                            setIsPinnedEyeOpen
                                                        }
                                                        onProgressUpdate={
                                                            handleProgressUpdate
                                                        }
                                                    />
                                                </div>
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
                    // Use the enhanced progress calculation that includes local state
                    const progress = calculateProgressWithLocalState(item);
                    const hasChildren =
                        item?.children && item.children.length > 0;

                    // Get the total number of lessons (including nested ones)
                    const lectures = countLessons(item);

                    // Get the total duration of all lessons (including nested ones)
                    const duration = getTotalDuration(item);

                    const isExpanded = expandedChapters.has(item._id);

                    return (
                        <AccordionItem
                            key={uniqueKey}
                            value={uniqueKey}
                            className='mb-2  mr-2 rounded-lg border border-border-primary-light overflow-hidden flex justify-between items-start'
                        >
                            <div className='flex-1'>
                                <AccordionTrigger
                                    isIcon={false}
                                    className={`text-start hover:no-underline py-0 pr-0 [&[data-state=open]>div>div>svg]:stroke-primary [&[data-state=open]>div>p]:text-primary`}
                                    onClick={(e: React.MouseEvent) =>
                                        toggleChapter(item._id, e)
                                    }
                                >
                                    <div className='flex items-center justify-between w-full p-2 flex-wrap gap-2'>
                                        <div className='flex items-center gap-2'>
                                            <div className='bg-primary-light mr-1.5 p-1.5 rounded-md'>
                                                <Folder className='h-5 w-5 stroke-primary' />
                                            </div>
                                            <div>
                                                <h3 className='font-medium text-black'>
                                                    {item.chapter.name}
                                                </h3>
                                                <div className='flex items-center gap-4 text-sm text-gray'>
                                                    <span className='flex items-center gap-1 text-sm text-nowrap'>
                                                        <LecturesSvg />
                                                        {lectures} lectures
                                                    </span>
                                                    <span className='flex items-center gap-1 text-sm text-nowrap'>
                                                        <Clock className='size-3' />
                                                        {formatSeconds(
                                                            duration as number,
                                                        )}
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
                                            <div className='flex items-center gap-1'>
                                                <div className='flex items-start gap-1'>
                                                    {renderPriorityBadge(
                                                        item.priority,
                                                    )}
                                                </div>
                                                <div className='flex'>
                                                    <LessionActionMenu
                                                        videoData={videoData}
                                                        item={item}
                                                        setVideoData={
                                                            setVideoData
                                                        }
                                                        lessonId={item?._id}
                                                        courseId={
                                                            item?.myCourse
                                                                ?.course
                                                        }
                                                        setIsPinnedEyeOpen={
                                                            setIsPinnedEyeOpen
                                                        }
                                                        onProgressUpdate={
                                                            handleProgressUpdate
                                                        }
                                                    />
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
                                                className='ml-4'
                                            >
                                                {renderContent(
                                                    item?.children as TContent[],
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
            handleVideoClick,
            renderPriorityBadge,
            extractSlideId,
            toggleChapter,
            option?.courseProgramsLoading,
            videoData,
            setVideoData,
            setIsPinnedEyeOpen,
            localCompletionState,
            handleProgressUpdate,
            calculateProgressWithLocalState,
        ],
    );

    return (
        <div
            className={cn(
                'space-y-4',
                videoData?.isSideOpen
                    ? `no-scrollbar lg:col-span-1 xl:sticky top-0 h-[607px] overflow-y-auto bottom-[20px]`
                    : 'w-full',
            )}
        >
            <Accordion type='multiple' className='w-full'>
                {option?.courseProgramsLoading ? (
                    <MemoizedLoadingIndicator />
                ) : treeData && treeData.length > 0 ? (
                    renderContent(treeData)
                ) : (
                    <MemoizedEmptyState />
                )}
            </Accordion>
            <GlobalModal
                open={openQuiz}
                setOpen={handleQuizClose}
                title='Give tour qiize'
            >
                <QuizModalContent lesson={lesson as any} />
            </GlobalModal>
        </div>
    );
};

export default ContentDropDown;
