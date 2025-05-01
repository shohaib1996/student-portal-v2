import {
    ICourseData,
    TContent,
    TCourse,
    TLessonInfo,
    TProgram,
    ChapterData,
} from '@/types';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { ProgramSidebar } from './ProgramSidebar';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { Search, PanelLeft, PanelLeftClose, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ContentDropDown from './ContentDropDown';
import VideoContent from './VideoContent';
import FilterProgram from './FilterProgram';

// Import the enhanced search utilities
import { searchByNameKeepDescendants } from '@/utils/search-utils';
import { toast } from 'sonner';
import { buildContentTree } from '@/utils/tree-utils';

interface ProgramContentProps {
    option: {
        isLoading: boolean;
        isError: boolean;
        courseProgramsLoading: boolean;
    };
    refetchCourseContent: () => void;
    selectedTab: { tab: string; value: string };
    fetchedData: ChapterData[] | undefined;
    courseContentData: ICourseData | undefined;
    setFilterOption: React.Dispatch<
        React.SetStateAction<Array<{ property: string; value: any }>>
    >;
    filterOption: Array<{ property: string; value: any }>;
}

const ProgramContent: React.FC<ProgramContentProps> = ({
    selectedTab,
    option,
    fetchedData,
    courseContentData,
    refetchCourseContent,
    setFilterOption,
    filterOption,
}) => {
    const courseData = courseContentData?.course;

    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [isPinnedEyeOpen, setIsPinnedEyeOpen] = useState(false);
    const [treeData, setTreeData] = useState<TContent[]>([]);

    // State for search functionality
    const [searchInput, setSearchInput] = useState<string>('');
    const [debouncedSearchInput, setDebouncedSearchInput] =
        useState<string>('');

    // Add local completion state for instant UI updates
    const [localCompletionState, setLocalCompletionState] = useState<
        Map<string, boolean>
    >(new Map());

    const [videoData, setVideoData] = useState<{
        videoInfo: null | TLessonInfo;
        isSideOpen: boolean;
        item: ChapterData;
        contentId: string | null;
    }>({
        videoInfo: null,
        isSideOpen: false,
        item: {} as ChapterData,
        contentId: null,
    });
    const [isModuleOpen, setModuleOpen] = useState<boolean>(false);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    // Setup debounced search for better performance
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchInput(searchInput);
        }, 300); // 300ms debounce
        return () => clearTimeout(timer);
    }, [searchInput]);

    console.log({ treeData });

    // Initialize content tree with search and filter capabilities
    useEffect(() => {
        if (fetchedData && fetchedData.length > 0) {
            try {
                // Build the content tree with the original data
                const tree = buildContentTree(fetchedData as any);
                setTreeData(tree);
            } catch (error) {
                console.error('Error building content tree:', error);
                setTreeData([]);
            }
        } else {
            setTreeData([]);
        }
    }, [fetchedData]);

    // Refresh course content data
    const refreshData = useCallback(() => {
        if (refetchCourseContent) {
            refetchCourseContent();
        }
    }, [refetchCourseContent]);

    // Use memoized filtered content to avoid unnecessary recalculations
    const filteredContent = useMemo(() => {
        if (!treeData || treeData.length === 0) {
            return [];
        }

        // Apply search and filters using our enhanced utility
        return searchByNameKeepDescendants(
            treeData,
            debouncedSearchInput,
        ) as any;
    }, [treeData, debouncedSearchInput, filterOption]);

    useEffect(() => {
        if (videoData?.isSideOpen) {
            setSidebarOpen(false);
        }
    }, [videoData?.isSideOpen]);

    // Clear a specific filter
    const clearFilter = useCallback(
        (property: string, value: any) => {
            setFilterOption((prev) =>
                prev.filter(
                    (filter) =>
                        !(
                            filter.property === property &&
                            filter.value === value
                        ),
                ),
            );
        },
        [setFilterOption],
    );

    // Clear all filters
    const clearAllFilters = useCallback(() => {
        setFilterOption([]);
        setSearchInput('');
        setDebouncedSearchInput('');
    }, [setFilterOption]);

    return (
        <div className='p-2 flex relative bg-foreground'>
            {/* Desktop Sidebar */}
            <div
                className={cn(
                    'transition-all duration-300 ease-in-out border-r border-border hidden lg:block',
                    sidebarOpen
                        ? 'w-[350px] '
                        : 'w-0 opacity-0 overflow-hidden ',
                )}
            >
                {sidebarOpen && (
                    <ProgramSidebar
                        courseData={courseData as any}
                        onToggle={toggleSidebar}
                        fetchedData={fetchedData}
                        filterOption={filterOption}
                        setFilterOption={setFilterOption}
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
                <div className='flex flex-col xl:flex-row justify-between items-start mb-2 lg:gap-2 xl:gap-0'>
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
                            <SheetContent
                                side='left'
                                className='w-[280px] p-0 overflow-y-auto'
                            >
                                <div className='p-4'>
                                    <ProgramSidebar
                                        courseData={courseData as any}
                                        fetchedData={fetchedData}
                                        filterOption={filterOption}
                                        setFilterOption={setFilterOption}
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
                        {/* Search Input with Fuse.js */}
                        <div className='relative'>
                            <Search className='h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray' />
                            <Input
                                onChange={(e) => setSearchInput(e.target.value)}
                                placeholder='Search chapter & modules...'
                                className='pl-9 w-[280px] md:w-[300px] border-border-primary-light rounded-lg text-dark-gray placeholder:text-dark-gray bg-foreground'
                                value={searchInput}
                            />
                            {searchInput?.length > 0 && (
                                <X
                                    className='h-4 w-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray cursor-pointer'
                                    onClick={() => {
                                        setSearchInput('');
                                        setDebouncedSearchInput('');
                                    }}
                                />
                            )}
                        </div>

                        {/* Filter Component */}
                        <FilterProgram
                            filterOption={filterOption}
                            setFilterOption={setFilterOption}
                        />
                    </div>
                </div>

                {/* Active Filters Display */}
                {(filterOption.length > 0 || debouncedSearchInput) && (
                    <div className='flex flex-wrap gap-2 bg-primary-light/20 items-center p-2 rounded-md'>
                        <span className='text-xs text-gray'>
                            Active filters:
                        </span>

                        {/* Search filter badge */}
                        {debouncedSearchInput && (
                            <div className='flex items-center gap-1 bg-primary-light px-2 py-1 rounded-full text-xs'>
                                <span>Search: {debouncedSearchInput}</span>
                                <X
                                    className='h-3 w-3 cursor-pointer'
                                    onClick={() => {
                                        setSearchInput('');
                                        setDebouncedSearchInput('');
                                    }}
                                />
                            </div>
                        )}

                        {/* Property filter badges */}
                        {filterOption.map((filter, index) => (
                            <div
                                key={index}
                                className='flex items-center gap-1 bg-primary-light px-2 py-1 rounded-full text-xs'
                            >
                                <span>
                                    {filter.property === 'isPinned'
                                        ? 'Pinned'
                                        : filter.property === 'priority'
                                          ? `${filter.value === 3 ? 'High' : filter.value === 2 ? 'Medium' : 'Low'} Priority`
                                          : filter.property === 'chapter.isFree'
                                            ? 'Free Chapter'
                                            : filter.property ===
                                                'lesson.isFree'
                                              ? 'Free Lesson'
                                              : filter.property ===
                                                  'isCompleted'
                                                ? 'Completed'
                                                : `${filter.property}: ${filter.value}`}
                                </span>
                                <X
                                    className='h-3 w-3 cursor-pointer'
                                    onClick={() =>
                                        clearFilter(
                                            filter.property,
                                            filter.value,
                                        )
                                    }
                                />
                            </div>
                        ))}
                        <button
                            className='text-xs text-primary underline'
                            onClick={clearAllFilters}
                        >
                            Clear all
                        </button>
                    </div>
                )}

                <div
                    className={`mt-common ${videoData?.isSideOpen ? 'relative grid grid-cols-1 lg:grid-cols-3 gap-common' : 'block'} `}
                >
                    {videoData?.isSideOpen && (
                        <VideoContent
                            videoData={videoData as any}
                            setVideoData={setVideoData as any}
                            isPinnedEyeOpen={isPinnedEyeOpen}
                            setIsPinnedEyeOpen={setIsPinnedEyeOpen}
                            refreshData={refreshData}
                            isModuleOpen={isModuleOpen}
                            setModuleOpen={setModuleOpen}
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
                                className='animate-spin stroke-primary ml-2'
                            >
                                <path d='M21 12a9 9 0 1 1-6.219-8.56' />
                            </svg>
                        </div>
                    ) : !treeData || treeData.length === 0 ? (
                        <div className='text-center py-8 text-dark-gray'>
                            {filterOption.length > 0 ||
                            debouncedSearchInput !== ''
                                ? 'No chapters match your search or filter criteria'
                                : 'No chapters available for this section'}
                        </div>
                    ) : filteredContent.length === 0 ? (
                        <div className='text-center py-8 text-dark-gray'>
                            No chapters match your search or filter criteria
                        </div>
                    ) : (
                        <ContentDropDown
                            fetchedData={filteredContent as any}
                            option={option}
                            setVideoData={setVideoData as any}
                            setIsPinnedEyeOpen={setIsPinnedEyeOpen}
                            videoData={videoData as any}
                            searchInput={debouncedSearchInput}
                            filterOption={filterOption}
                            localCompletionState={localCompletionState}
                            setLocalCompletionState={setLocalCompletionState}
                            setModuleOpen={setModuleOpen}
                            isModuleOpen={isModuleOpen}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProgramContent;
