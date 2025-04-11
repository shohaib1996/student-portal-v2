'use client';
import { useEffect, useState } from 'react';
import {
    ArrowLeft,
    Star,
    Users,
    Clock,
    FileText,
    MessageSquareCode,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import GlobalHeader from '@/components/global/GlobalHeader';
import { usePathname, useRouter } from 'next/navigation';
import { useMyProgramQuery } from '@/redux/api/myprogram/myprogramApi';
import {
    useCourseContentQuery,
    usePostCourseProgramsMutation,
} from '@/redux/api/course/courseApi';
import {
    ChapterType,
    ICourseData,
    TChaptersResponse,
    TContent,
    TProgram,
} from '@/types';
import ProgramContent from './ProgramContent';
import { toast } from 'sonner';

// Types for course data
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
    isExpanded?: boolean;
    date?: string;
    time?: string;
}

export default function ProgramDetailsComp({ slug }: { slug: string }) {
    const router = useRouter();

    // Fetch program and course data
    const { data: myPrograms, isLoading: isProgramsLoading } =
        useMyProgramQuery({});
    const { data: courseContent, isLoading: isCourseContentLoading } =
        useCourseContentQuery({ slug });
    const [getPrograms, { isLoading: courseProgramsLoading }] =
        usePostCourseProgramsMutation();

    // Extract relevant data
    const program: TProgram | undefined = myPrograms?.program;
    const courseContentData: ICourseData | undefined = courseContent;

    const tabs = courseContentData?.category?.categories;
    const [parentId, setParentId] = useState<string | null>(null);
    // State for selected tab and data
    const [selectedTab, setSelectedTab] = useState({
        tab: 'Modules',
        value: 'modules',
    });
    const [filterOption, setFilterOption] = useState<{
        filter: string;
        query: string;
    }>({
        filter: '',
        query: '',
    });

    const [fetchedData, setFetchedData] = useState<TContent[] | null>(null);
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
                slug: slug,
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

    useEffect(() => {
        // setSelectedTab({tab:})
        if (tabs && tabs?.length > 0 && selectedTab.value === 'modules') {
            setSelectedTab({ tab: tabs[0].name, value: tabs[0]._id });
        }

        if (tabs && tabs?.length > 0 && selectedTab?.value !== 'modules') {
            fetchProgramData(
                parentId,
                filterOption?.filter,
                filterOption?.query,
            );
        }
    }, [parentId, tabs, selectedTab.value, slug, parentId, filterOption]);
    const commingSoon = () => {
        toast.success('Coming Soon...');
    };

    return (
        <div className='bg-background border-t border-border pt-2'>
            <GlobalHeader
                title={
                    <span className='flex items-center justify-center gap-1'>
                        <ArrowLeft
                            onClick={() => router.push('/program')}
                            size={18}
                            className='cursor-pointer'
                        />
                        {program?.title}
                    </span>
                }
                tooltip={program?.title}
                buttons={
                    <div className='flex items-center gap-3 mb-2'>
                        <Button
                            variant='primary_light'
                            className=''
                            onClick={commingSoon}
                        >
                            <span>
                                <MessageSquareCode
                                    size={20}
                                    className='text-primary-white'
                                />
                            </span>
                            Leave a Review
                        </Button>
                        <Button className='' onClick={commingSoon}>
                            <span>
                                <svg
                                    xmlns='http://www.w3.org/2000/svg'
                                    width='16'
                                    height='16'
                                    viewBox='0 0 16 16'
                                    fill='none'
                                >
                                    <path
                                        d='M10.667 2L13.3337 4.66667L10.667 7.33333'
                                        stroke='white'
                                        strokeWidth='1.5'
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                    />
                                    <path
                                        d='M13.3337 4.66602H2.66699'
                                        stroke='white'
                                        strokeWidth='1.5'
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                    />
                                    <path
                                        d='M5.33366 13.9993L2.66699 11.3327L5.33366 8.66602'
                                        stroke='white'
                                        strokeWidth='1.5'
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                    />
                                    <path
                                        d='M2.66699 11.334H13.3337'
                                        stroke='white'
                                        strokeWidth='1.5'
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                    />
                                </svg>
                            </span>
                            Switch Program
                        </Button>
                    </div>
                }
            />
            <Tabs
                value={selectedTab.value}
                onValueChange={(value) => {
                    const tab = tabs?.find((t) => t._id === value);
                    setSelectedTab({
                        tab: tab?.name as string,
                        value: tab?._id as string,
                    });
                    setParentId(null);
                }}
                className='w-full'
            >
                {/* Tabs Navigation */}
                <div className='border-b border-border'>
                    <div className='flex flex-col xl:flex-row gap-2 justify-between items-center py-2'>
                        <TabsList className='bg-foreground p-1 rounded-full gap-2 flex-wrap overflow-x-auto'>
                            {tabs?.map((tab, i) => (
                                <TabsTrigger
                                    key={tab?._id || i}
                                    value={tab?._id || ''}
                                    className='rounded-full data-[state=active]:bg-primary data-[state=active]:text-white text-sm font-medium'
                                >
                                    {tab?.name || 'Untitled'}
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        <div className='flex items-center gap-4 flex-wrap'>
                            <div className='flex items-center gap-1 text-nowrap'>
                                <div className='flex'>
                                    {Array.from(
                                        {
                                            length: Math.floor(4.9),
                                        },
                                        (_, i) => (
                                            <Star
                                                key={i}
                                                className='h-4 w-4 fill-yellow-400 text-yellow-400'
                                            />
                                        ),
                                    )}
                                </div>
                                <span className='text-sm font-medium'>4.9</span>
                                <span className='text-xs text-gray'>
                                    (128 reviews)
                                </span>
                            </div>
                            <div className='flex items-center gap-1 text-nowrap'>
                                <Users className='h-4 w-4 text-primary' />
                                <span className='text-sm font-medium'>
                                    345 students
                                </span>
                            </div>
                            <div className='flex items-center gap-1 text-nowrap'>
                                <Clock className='h-4 w-4 text-gray' />
                                <span className='text-sm'>
                                    Last updated 2 week ago
                                </span>
                            </div>
                            <div className='flex items-center gap-1 text-nowrap'>
                                <FileText className='h-4 w-4 text-primary' />
                                <span className='text-sm font-medium'>
                                    35 modules
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                <TabsContent value={selectedTab?.value}>
                    <ProgramContent
                        option={{
                            isLoading: isProgramsLoading,
                            isError: false,
                            courseProgramsLoading,
                            setFilterOption,
                        }}
                        selectedTab={selectedTab}
                        fetchedData={fetchedData}
                        parentId={parentId}
                        setParentId={setParentId}
                        courseContentData={courseContentData}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}
