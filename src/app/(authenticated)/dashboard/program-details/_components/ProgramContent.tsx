import { ICourseData, TContent, TLessonInfo } from '@/types';
import { useEffect, useState } from 'react';
import { ProgramSidebar } from './ProgramSidebar';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

import { Search, PanelLeft, PanelLeftClose } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ContentDropDown from './ContentDropDown';
import VideoContent from './VideoContent';
import FilterProgram from './FilterProgram';

const ProgramContent = ({
    selectedTab,
    option,
    fetchedData,
    parentId,
    setParentId,
    courseContentData,
}: {
    option: {
        isLoading: boolean;
        isError: boolean;
        courseProgramsLoading: boolean;
        setFilterOption: React.Dispatch<
            React.SetStateAction<{
                filter: string;
                query: string;
            }>
        >;
    };

    selectedTab: { tab: string; value: string };
    fetchedData: TContent[] | null;
    parentId?: string | null;
    setParentId: React.Dispatch<React.SetStateAction<string | null>>;
    courseContentData: ICourseData | undefined;
}) => {
    const courseData = courseContentData?.course;
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [searchInput, setSearchInput] = useState('');
    const { setFilterOption } = option;
    const [videoData, setVideoData] = useState<{
        videoInfo: null | TLessonInfo;
        isSideOpen: boolean;
    }>({
        videoInfo: null,
        isSideOpen: false,
    });

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

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
                        courseData={courseData}
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
                <div className='flex flex-col lg:flex-row justify-between items-center mb-2 gap-2'>
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
                                    <ProgramSidebar courseData={courseData} />
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
                    <div className='flex items-center gap-3'>
                        <div className='relative text-dark-gray'>
                            <Search
                                onClick={() => {
                                    setFilterOption(
                                        (pre: {
                                            query: string;
                                            filter: string;
                                        }) => {
                                            return {
                                                filter: pre?.filter,
                                                query: searchInput,
                                                pId: null,
                                            };
                                        },
                                    );
                                    setParentId(null);
                                }}
                                className='h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray'
                            />
                            <Input
                                onChange={(e) => setSearchInput(e.target.value)}
                                placeholder='Search chapter & modules...'
                                className='pl-9 w-[300px] border-border rounded-lg text-dark-gray placeholder:text-dark-gray bg-foreground'
                            />
                        </div>
                        <FilterProgram
                            option={option}
                            searchInput={searchInput}
                            setParentId={setParentId}
                        />
                    </div>
                </div>

                <div
                    className={`mt-common ${videoData?.isSideOpen ? 'relative grid grid-cols-1 xl:grid-cols-3 gap-common' : 'block'} `}
                >
                    <VideoContent videoData={videoData} />
                    {option?.courseProgramsLoading && parentId === null ? (
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
                                <path d='M21 12a9 9 0 1 1-common.219-8.56' />
                            </svg>
                        </div>
                    ) : (
                        <ContentDropDown
                            fetchedData={fetchedData}
                            parentId={parentId}
                            setParentId={setParentId}
                            option={option}
                            setVideoData={setVideoData}
                            videoData={videoData}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProgramContent;
