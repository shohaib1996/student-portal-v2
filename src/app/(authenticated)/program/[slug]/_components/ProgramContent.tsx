import { ICourseData, TContent, TCourse, TLessonInfo, TProgram } from '@/types';
import { useEffect, useState, useCallback } from 'react';
import { ProgramSidebar } from './ProgramSidebar';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { Search, PanelLeft, PanelLeftClose, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ContentDropDown from './ContentDropDown';
import VideoContent from './VideoContent';
import FilterProgram from './FilterProgram';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { useForm } from 'react-hook-form';

const ProgramContent = ({
    selectedTab,
    option,
    fetchedData,
    courseContentData,
    refetchCourseContent,
}: {
    option: {
        isLoading: boolean;
        isError: boolean;
        courseProgramsLoading: boolean;
    };
    refetchCourseContent: () => void;

    selectedTab: { tab: string; value: string };
    fetchedData: TContent[] | null;
    courseContentData: ICourseData | undefined;
}) => {
    const courseData = courseContentData?.course;
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [isPinnedEyeOpen, setIsPinnedEyeOpen] = useState(false);

    // Setup form
    const form = useForm({
        defaultValues: {
            search: '',
        },
    });

    // NEW: Add local completion state for instant UI updates
    const [localCompletionState, setLocalCompletionState] = useState<
        Map<string, boolean>
    >(new Map());

    const [videoData, setVideoData] = useState<{
        videoInfo: null | TLessonInfo;
        isSideOpen: boolean;
        item: TContent;
        contentId: string | null;
    }>({
        videoInfo: null,
        isSideOpen: false,
        item: {} as TContent,
        contentId: null,
    });
    const [searchInput, setSearchInput] = useState<string>('');
    const [filterOption, setFilterOption] = useState<
        {
            filter: string;
        }[]
    >([
        {
            filter: '',
        },
    ]);
    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    // In ProgramContent.tsx
    const refreshData = useCallback(() => {
        // If you're using React Query or RTK Query, use their refetch methods
        if (refetchCourseContent) {
            refetchCourseContent();
        }
    }, [refetchCourseContent]);

    // NEW: Function to handle progress updates

    useEffect(() => {
        if (videoData?.isSideOpen) {
            setSidebarOpen(false);
        }
    }, [videoData?.isSideOpen]);

    return (
        <div className='p-2 flex relative bg-foreground'>
            {/* Desktop Sidebar */}
            <div
                className={cn(
                    'transition-all duration-300 ease-in-out border-r border-border hidden lg:block',
                    sidebarOpen ? 'w-[350px]' : 'w-0 opacity-0 overflow-hidden',
                )}
            >
                {sidebarOpen && (
                    <ProgramSidebar
                        courseData={courseData as any}
                        onToggle={toggleSidebar}
                    />
                )}
            </div>

            {/* Chapters and Modules Content */}
            <div
                className={cn(
                    'transition-all duration-300 ease-in-out flex-1',
                    sidebarOpen ? 'lg:pl-2' : 'pl-0',
                )}
            >
                <div className='flex flex-col lg:flex-row justify-between items-start md:items-center mb-2'>
                    {/* Desktop Sidebar Toggle */}
                    <div className='flex items-start lg:items-center gap-2'>
                        {/* Mobile Sidebar */}
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button
                                    variant='outline'
                                    size='icon'
                                    className='lg:hidden mb-4'
                                >
                                    <PanelLeft className='h-5 w-5' />
                                    <span className='sr-only'>
                                        Toggle Sidebar
                                    </span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side='left' className='w-[280px] p-0'>
                                <div className='p-4'>
                                    <ProgramSidebar
                                        courseData={courseData as any}
                                    />
                                </div>
                            </SheetContent>
                        </Sheet>
                        <div className='hidden lg:block'>
                            <Button
                                onClick={toggleSidebar}
                                variant='outline'
                                size='icon'
                            >
                                {sidebarOpen ? (
                                    <PanelLeftClose className='h-5 w-5' />
                                ) : (
                                    <PanelLeft className='h-5 w-5' />
                                )}
                                <span className='sr-only'>Toggle Sidebar</span>
                            </Button>
                        </div>

                        <div>
                            <h2 className='text-base font-medium text-black'>
                                {selectedTab?.tab}
                            </h2>
                            <p className='text-xs text-gray'>
                                Explore key topics with structured lessons
                            </p>
                        </div>
                    </div>
                    <div className='flex flex-row items-start md:items-center gap-3'>
                        {/* Search Form */}

                        <div className='relative'>
                            <Search className='h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray' />
                            <Input
                                onChange={(e) => setSearchInput(e.target.value)}
                                placeholder='Search chapter & modules...'
                                className='pl-9 w-[280px] md:w-[300px] border-border rounded-lg text-dark-gray placeholder:text-dark-gray bg-foreground'
                                value={searchInput ?? ''}
                            />
                            {searchInput?.length > 0 && (
                                <X
                                    className='h-4 w-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray'
                                    onClick={(e) => setSearchInput('')}
                                />
                            )}
                        </div>

                        <FilterProgram
                            filterOption={filterOption}
                            setFilterOption={setFilterOption}
                        />
                    </div>
                </div>

                <div
                    className={`mt-common ${videoData?.isSideOpen ? 'relative grid grid-cols-1 xl:grid-cols-3 gap-common' : 'block'} `}
                >
                    {videoData?.isSideOpen && (
                        <VideoContent
                            videoData={videoData}
                            setVideoData={setVideoData}
                            isPinnedEyeOpen={isPinnedEyeOpen}
                            setIsPinnedEyeOpen={setIsPinnedEyeOpen}
                            refreshData={refreshData}
                            // NEW: Pass progress update handler
                        />
                    )}

                    {option?.courseProgramsLoading ? (
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
                                className='animate-spin stroke-primary'
                            >
                                <path d='M21 12a9 9 0 1 1-6.219-8.56' />
                            </svg>
                        </div>
                    ) : (
                        <ContentDropDown
                            fetchedData={fetchedData}
                            option={option}
                            setVideoData={setVideoData}
                            setIsPinnedEyeOpen={setIsPinnedEyeOpen}
                            videoData={videoData}
                            searchInput={searchInput}
                            filterOption={filterOption}
                            // NEW: Pass progress update handler and local state
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProgramContent;
