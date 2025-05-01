'use client';

import type React from 'react';
import { useState, useEffect, useCallback, useMemo } from 'react';

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
import {
    File,
    Folder,
    Play,
    MoreVertical,
    Clock,
    Brain,
    PanelLeft,
    Link2,
    Search,
} from 'lucide-react';
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
} from '@/utils/tree-utils';

// Import our enhanced search utility functions
// import { searchAndFilterContent, findItemById } from '@/utils/search-utils';

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
import { useParams, useRouter } from 'next/navigation';
import { searchByNameKeepDescendants } from '@/utils/search-utils';

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
    setModuleOpen: React.Dispatch<React.SetStateAction<boolean>>;
    isModuleOpen: boolean;
}

// Main component
const ContentDropDown: React.FC<ContentDropDownProps> = ({
    fetchedData,
    setVideoData,
    videoData,
    setIsPinnedEyeOpen,
    option,
    searchInput,
    filterOption,
    isModuleOpen,
    setModuleOpen,
}) => {
    // State management
    const [expandedChapters, setExpandedChapters] = useState<Set<string>>(
        new Set(),
    );
    const [localCompletionState, setLocalCompletionState] = useState<
        Map<string, boolean>
    >(new Map());
    const [openQuiz, setOpenQuiz] = useState(false);
    const [lesson, setLesson] = useState({});

    // Filter and search the content
    const filteredContent = useMemo(() => {
        if (!fetchedData) {
            return [];
        }

        return searchByNameKeepDescendants(fetchedData, searchInput);
    }, [fetchedData, searchInput, filterOption]);

    useEffect(() => {
        // if (!searchInput.trim()) {
        //     setExpandedChapters(new Set());
        // }
    }, [searchInput]);
    // Auto-expand chapters based on search results
    useEffect(() => {
        // If there's an active search, expand all chapters that contain search results
        if (searchInput && searchInput.trim() !== '') {
            const chaptersToExpand = new Set<string>();

            // Helper function to identify chapters that match the search or contain matches
            const findMatchingChapters = (items: TContent[]) => {
                items.forEach((item) => {
                    if (item.type === ChapterType.CHAPTER) {
                        // Check if this chapter's name or description matches the search
                        const searchLower = searchInput.toLowerCase();
                        const nameMatches = item.chapter?.name
                            ?.toLowerCase()
                            .includes(searchLower);
                        const descMatches = item.chapter?.description
                            ?.toLowerCase()
                            .includes(searchLower);

                        if (nameMatches || descMatches) {
                            chaptersToExpand.add(item._id);
                        }

                        // Check if any children match
                        if (item.children && item.children.length > 0) {
                            const hasMatchingChild = item.children.some(
                                (child) => {
                                    if (child.type === ChapterType.CHAPTER) {
                                        return (
                                            child.chapter?.name
                                                ?.toLowerCase()
                                                .includes(searchLower) ||
                                            child.chapter?.description
                                                ?.toLowerCase()
                                                .includes(searchLower)
                                        );
                                    } else if (
                                        child.type === ChapterType.LESSON
                                    ) {
                                        return child.lesson?.title
                                            ?.toLowerCase()
                                            .includes(searchLower);
                                    }
                                    return false;
                                },
                            );

                            if (hasMatchingChild) {
                                chaptersToExpand.add(item._id);
                            }

                            // Continue checking in children
                            findMatchingChapters(item.children as TContent[]);
                        }
                    }
                });
            };

            findMatchingChapters(filteredContent);

            // Update expanded chapters state
            setExpandedChapters((prev) => {
                const newSet = new Set(prev);
                chaptersToExpand.forEach((id) => newSet.add(id));
                return newSet;
            });
        }
    }, [searchInput, filteredContent]);

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
                        countLessonsWithState(item?.children as TContent[]);
                    }
                }
            };

            // Start counting from the chapter's children
            if (chapter?.children && chapter?.children.length > 0) {
                countLessonsWithState(chapter.children as TContent[]);
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

    const router = useRouter();
    const params = useParams();

    const handleVideoClick = useCallback(
        (item: TContent, e: React.MouseEvent): void => {
            e.stopPropagation();
            setIsPinnedEyeOpen(item?.isPinned || false);
            router.push(`/program/${params.slug}?content=${item._id}`);
            setVideoData({
                videoInfo: {
                    ...(item?.lesson as TLessonInfo),
                },
                isSideOpen: true,
                contentId: item._id,
                item: item,
            });
        },
        [setIsPinnedEyeOpen, setVideoData, router, params],
    );

    const handelQuizOpen = () => {
        setOpenQuiz(true);
    };

    const handleQuizClose = () => {
        setOpenQuiz(false);
    };

    // Highlight matching text for search results
    const highlightMatchingText = useCallback(
        (text: string) => {
            if (!searchInput || !text) {
                return text;
            }

            const searchTerm = searchInput.toLowerCase();
            if (!text.toLowerCase().includes(searchTerm)) {
                return text;
            }

            const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));

            return (
                <>
                    {parts.map((part, index) =>
                        part.toLowerCase() === searchTerm ? (
                            <span
                                key={index}
                                className='bg-yellow-100 text-yellow-800'
                            >
                                {part}
                            </span>
                        ) : (
                            part
                        ),
                    )}
                </>
            );
        },
        [searchInput],
    );

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

                    // For search highlighting
                    const isHighlighted =
                        searchInput &&
                        item.lesson?.title
                            ?.toLowerCase()
                            .includes(searchInput.toLowerCase());

                    return (
                        <AccordionItem
                            key={uniqueKey}
                            value={uniqueKey}
                            className={cn(
                                'mb-4 mt-4 rounded-lg border mr-4',
                                isHighlighted
                                    ? 'border-yellow-400 shadow-sm'
                                    : '',
                            )}
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
                                                    {highlightMatchingText(
                                                        item.lesson.title || '',
                                                    )}
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
                                                    className='flex items-center gap-3 grow-[1]'
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
                                                            {highlightMatchingText(
                                                                item.lesson
                                                                    .title ||
                                                                    '',
                                                            )}
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
                                            {item?.lesson?.type === 'link' ? (
                                                <Link
                                                    href={
                                                        (item?.lesson
                                                            ?.url as string) ||
                                                        '#'
                                                    }
                                                    target='_blank'
                                                    className='flex items-center gap-3 grow-[1] w-full'
                                                >
                                                    <div>
                                                        <Link2 className='h-5 w-5 stroke-gray' />
                                                    </div>

                                                    <div>
                                                        <p className='text-sm font-medium text-black'>
                                                            {highlightMatchingText(
                                                                item?.lesson
                                                                    ?.title ||
                                                                    '',
                                                            )}
                                                        </p>
                                                    </div>
                                                </Link>
                                            ) : item.lesson.type === 'file' ? (
                                                <Link
                                                    href={
                                                        item?.lesson?.url
                                                            ? `/documents-and-labs?documentId=${item?.lesson?.url}&mode=view`
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
                                                            {highlightMatchingText(
                                                                item?.lesson
                                                                    ?.title ||
                                                                    '',
                                                            )}
                                                        </p>
                                                    </div>
                                                </Link>
                                            ) : (
                                                <Link
                                                    href={
                                                        item?.lesson?.url
                                                            ? `/presentation-slides/${extractSlideId(item?.lesson?.url)}`
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
                                                            {highlightMatchingText(
                                                                item?.lesson
                                                                    ?.title ||
                                                                    '',
                                                            )}
                                                        </p>
                                                    </div>
                                                </Link>
                                            )}

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

                    // Check if this chapter should be expanded
                    const isExpanded = expandedChapters.has(item._id);

                    // Check if this chapter or any of its children match the search
                    const containsSearchMatches = Boolean(
                        searchInput &&
                            // Direct match on chapter name or description
                            ((item.chapter?.name &&
                                item.chapter.name
                                    .toLowerCase()
                                    .includes(searchInput.toLowerCase())) ||
                                (item.chapter?.description &&
                                    item.chapter.description
                                        .toLowerCase()
                                        .includes(searchInput.toLowerCase())) ||
                                // Or has matching children
                                (hasChildren &&
                                    item.children?.some((child) => {
                                        if (
                                            child.type === ChapterType.CHAPTER
                                        ) {
                                            return (
                                                (child.chapter?.name &&
                                                    child.chapter.name
                                                        .toLowerCase()
                                                        .includes(
                                                            searchInput.toLowerCase(),
                                                        )) ||
                                                (child.chapter?.description &&
                                                    child.chapter.description
                                                        .toLowerCase()
                                                        .includes(
                                                            searchInput.toLowerCase(),
                                                        ))
                                            );
                                        } else if (
                                            child.type === ChapterType.LESSON
                                        ) {
                                            return (
                                                child.lesson?.title &&
                                                child.lesson.title
                                                    .toLowerCase()
                                                    .includes(
                                                        searchInput.toLowerCase(),
                                                    )
                                            );
                                        }
                                        return false;
                                    }))),
                    );

                    return (
                        <AccordionItem
                            key={uniqueKey}
                            value={uniqueKey}
                            className={cn(
                                'mb-2 mr-2 rounded-lg border border-border-primary-light overflow-hidden flex justify-between items-start',
                                containsSearchMatches
                                    ? 'border-yellow-400 shadow-sm'
                                    : '',
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
                                    <div className='flex items-center justify-between w-full p-2 flex-wrap gap-2'>
                                        <div className='flex items-center gap-2'>
                                            <div className='bg-primary-light mr-1.5 p-1.5 rounded-md'>
                                                <Folder className='h-5 w-5 stroke-primary' />
                                            </div>
                                            <div>
                                                <h3 className='font-medium text-black'>
                                                    {highlightMatchingText(
                                                        item.chapter.name || '',
                                                    )}

                                                    {/* Display a badge if this contains search matches */}
                                                    {containsSearchMatches &&
                                                        searchInput &&
                                                        !item.chapter?.name
                                                            ?.toLowerCase()
                                                            .includes(
                                                                searchInput.toLowerCase(),
                                                            ) && (
                                                            <Badge className='ml-2 bg-yellow-100 text-yellow-800 border-none text-xs font-normal'>
                                                                Contains matches
                                                            </Badge>
                                                        )}
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

                                {/* Auto-expand chapter if it's marked as expanded or if it contains search matches */}
                                {(isExpanded ||
                                    (searchInput && containsSearchMatches)) && (
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
            searchInput,
            highlightMatchingText,
        ],
    );

    // If we have search input but no results, show a message
    const noSearchResults =
        searchInput &&
        searchInput.trim() !== '' &&
        filteredContent &&
        filteredContent.length === 0;

    return (
        <>
            <div
                className={cn(
                    'relative transition-all duration-300 ease-in-out ',
                    isModuleOpen && 'hidden',
                    'space-y-4 transition-all duration-300 ease-in-out ',
                    videoData?.isSideOpen
                        ? `no-scrollbar lg:col-span-1 top-0 h-[607px] overflow-y-auto bottom-[20px]`
                        : 'w-full ',
                )}
            >
                {/* Search indicator */}
                {searchInput && searchInput.trim() !== '' && (
                    <div className='px-4 py-2 bg-primary-light/20 rounded-lg mb-2 flex items-center gap-2'>
                        <Search className='h-4 w-4 text-primary' />
                        <span className='text-sm text-primary'>
                            Showing results for: <strong>{searchInput}</strong>
                        </span>
                    </div>
                )}

                {noSearchResults && (
                    <div className='p-8 text-center'>
                        <div className='mb-4'>
                            <Search className='h-12 w-12 text-gray-400 mx-auto' />
                        </div>
                        <h3 className='text-lg font-medium mb-2'>
                            No results found
                        </h3>
                        <p className='text-gray-500'>
                            {`We couldnt find any content matching ${searchInput}
                            . Try using different keywords or check for typos.`}
                        </p>
                    </div>
                )}

                <Accordion type='multiple' className='w-full'>
                    {videoData?.isSideOpen && (
                        <div
                            onClick={() => setModuleOpen(!isModuleOpen)}
                            className='sticky top-0 z-10 bg-foreground'
                        >
                            <PanelLeft className='h-5 w-5' />
                        </div>
                    )}
                    {option?.courseProgramsLoading ? (
                        <MemoizedLoadingIndicator />
                    ) : filteredContent && filteredContent?.length > 0 ? (
                        renderContent(filteredContent)
                    ) : (
                        !noSearchResults && <MemoizedEmptyState />
                    )}
                </Accordion>
                <GlobalModal
                    open={openQuiz}
                    setOpen={handleQuizClose}
                    title='Give your quiz ans'
                >
                    <QuizModalContent lesson={lesson as any} />
                </GlobalModal>
            </div>
        </>
    );
};

export default ContentDropDown;
