import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
    useCourseContentQuery,
    usePostCourseProgramsMutation,
} from '@/redux/api/course/courseApi';
import { useMyProgramQuery } from '@/redux/api/myprogram/myprogramApi';
import {
    ChapterType,
    ICourseData,
    TChaptersResponse,
    TContent,
    TCourseEnrollment,
    TLesson,
    TLessonInfo,
} from '@/types';
import {
    ChevronDown,
    File,
    Folder,
    LinkIcon,
    MoreVertical,
    Pin,
    Play,
} from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

import storage from '../../../utils/storage';
import { useAppSelector } from '@/redux/hooks';
import GlobalDropdown from '@/components/global/GlobalDropdown';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

const SelectPurpose = ({
    value,
    onChange,
    className,
}: {
    value: { category?: string; resourceId?: string };
    onChange: (_: { category: string; resourceId: string }) => void;
    className?: string;
}) => {
    const [parentId, setParentId] = useState<string | null>(null);
    const { data: myPrograms, isLoading: isProgramsLoading } =
        useMyProgramQuery({});
    const [getPrograms, { isLoading: courseProgramsLoading }] =
        usePostCourseProgramsMutation();
    const { data: courseContent, isLoading: isCourseContentLoading } =
        useCourseContentQuery({ slug: 'first-program' });
    const [selectedTab, setSelectedTab] = useState({
        tab: 'Modules',
        value: 'modules',
    });
    const { myEnrollments } = useAppSelector((state) => state.auth);
    const [active, setActive] = useState<TCourseEnrollment | null>(null);
    const courseContentData: ICourseData | undefined = courseContent;
    const tabs = courseContentData?.category?.categories;

    const getActive = async () => {
        if (typeof window !== 'undefined') {
            // Only run in the browser
            const activeEnrollment = await storage.getItem('active_enrolment');
            if (activeEnrollment) {
                setActive(activeEnrollment);
            }
        }
    };
    useEffect(() => {
        getActive();
    }, [myEnrollments]);

    const [fetchedData, setFetchedData] = useState<TContent[] | null>(null);

    const mergeChapters = (
        chapters: TContent[],
        parentId: string | null,
        newChapters: TContent[],
    ): TContent[] => {
        return chapters.map((chapter) => {
            if (
                chapter._id === parentId &&
                chapter.type === ChapterType.CHAPTER
            ) {
                // Merge only unique chapters
                const existingIds = new Set(
                    chapter.chapter.children?.map((child) => child._id) || [],
                );
                const uniqueChapters = newChapters.filter(
                    (newChapter) => !existingIds.has(newChapter._id),
                );

                return {
                    ...chapter,
                    chapter: {
                        ...chapter.chapter,
                        children: chapter.chapter.children
                            ? [...chapter.chapter.children, ...uniqueChapters]
                            : uniqueChapters,
                    },
                };
            }
            if (
                chapter.type === ChapterType.CHAPTER &&
                chapter.chapter.children
            ) {
                return {
                    ...chapter,
                    chapter: {
                        ...chapter.chapter,
                        children: mergeChapters(
                            chapter.chapter.children,
                            parentId,
                            newChapters,
                        ),
                    },
                };
            }
            return chapter;
        });
    };

    const fetchProgramData = async (
        parent: string | null,
        filterBy: string,
        queryText: string,
    ) => {
        try {
            const res = (await getPrograms({
                body: {
                    filterBy: filterBy,
                    parent: parent,
                    queryText: queryText,
                },
                contentId: selectedTab?.value,
                slug: 'first-program',
            }).unwrap()) as TChaptersResponse;

            if (parent) {
                setFetchedData((prev) => {
                    if (!prev) {
                        return res.chapters;
                    }
                    return mergeChapters(prev, parent, res.chapters);
                });
            } else {
                setFetchedData(res.chapters);
            }
        } catch (error) {
            console.error('Error fetching program data:', error);
        }
    };

    useEffect(() => {
        // setSelectedTab({tab:})
        if (tabs && tabs?.length > 0 && selectedTab.value === 'modules') {
            setSelectedTab({ tab: tabs[0].name, value: tabs[0]._id });
        }

        if (tabs && tabs?.length > 0 && selectedTab?.value !== 'modules') {
            fetchProgramData(parentId, '', '');
        }
    }, [parentId, tabs, selectedTab.value]);

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

    const [selectedItem, setSelectedItem] = useState('Bootcamps/Course Link');
    const [open, setOpen] = useState(false);

    const handleSelect = (item: TContent) => {
        onChange({
            category: item.type,
            resourceId: item._id,
        });
        if (item.type === ChapterType.LESSON && 'lesson' in item) {
            setSelectedItem(item.lesson.title);
        } else if (item.type === ChapterType.CHAPTER && 'chapter' in item) {
            setSelectedItem(item.chapter.name);
        }
        setOpen(false);
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
                        className='mb-1 mt-1 rounded-lg border  mr-1'
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
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleSelect(item);
                                        }}
                                        className='flex items-center gap-1'
                                    >
                                        <div>
                                            <Play className='size-4 stroke-gray' />
                                        </div>

                                        <div>
                                            <p className='text-sm font-medium text-black'>
                                                {item.lesson.title}
                                            </p>
                                        </div>
                                        <div className='flex items-start gap-1'>
                                            {renderPriorityBadge(item.priority)}
                                        </div>
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
                                <div
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleSelect(item);
                                    }}
                                    className='w-full'
                                >
                                    <div className='flex items-center justify-between w-full p-2'>
                                        <div className='flex items-center gap-3'>
                                            <div>
                                                <File className='size-4 stroke-gray' />
                                            </div>

                                            <div>
                                                <p className='text-sm font-medium text-dark-gray'>
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
                                </div>
                            </AccordionTrigger>
                        )}
                    </AccordionItem>
                );
            }

            // Handle chapter type content
            if (item.type === ChapterType.CHAPTER && 'chapter' in item) {
                return (
                    <AccordionItem
                        key={uniqueKey}
                        value={uniqueKey}
                        className='mb-2 mt-1 mr-1 rounded-lg border border-border-primary-light overflow-hidden'
                    >
                        <AccordionTrigger
                            isIcon={false}
                            className={`text-start hover:no-underline py-0 pr-4 ${
                                parentId &&
                                '[&[data-state=open]>div>div>svg]:stroke-primary [&[data-state=open]>div>p]:text-primary'
                            }`}
                            onClick={() => setParentId(item._id)}
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
                        <AccordionContent className='border-t border-border pb-0'>
                            {item.chapter.children &&
                            item.chapter.children.length > 0 ? (
                                <Accordion
                                    type='single'
                                    collapsible
                                    className='ml-2'
                                >
                                    {renderContent(
                                        item.chapter.children,
                                        uniqueKey,
                                    )}
                                </Accordion>
                            ) : isProgramsLoading ? (
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
                    <div
                        className={cn(
                            'space-y-4',
                            // videoData?.isSideOpen
                            //     ? 'no-scrollbar lg:col-span-1 md:overflow-auto'
                            //     : 'w-full',
                        )}
                    >
                        <Accordion type='single' collapsible className='w-full'>
                            {fetchedData && fetchedData.length > 0 ? (
                                renderContent(fetchedData)
                            ) : isProgramsLoading || courseProgramsLoading ? (
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
                <p className='truncate max-w-48'>{selectedItem}</p>
                <ChevronDown className='mr-3 h-4 w-4 ms-auto opacity-50' />
            </div>
        </GlobalDropdown>
    );
};

export default SelectPurpose;
