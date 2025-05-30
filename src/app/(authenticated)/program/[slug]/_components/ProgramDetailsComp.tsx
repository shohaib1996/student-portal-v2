'use client';
import { useEffect, useState } from 'react';
import { ArrowLeft, Clock, FileText, MessageSquareCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import GlobalHeader from '@/components/global/GlobalHeader';
import { useRouter } from 'next/navigation';
import { useMyProgramQuery } from '@/redux/api/myprogram/myprogramApi';
import {
    useCourseContentQuery,
    useGetAllCourseProgramsQuery,
    useGetAllCourseReviewQuery,
} from '@/redux/api/course/courseApi';
import { ChapterData, ICourseData, TProgram } from '@/types';
import ProgramContent from './ProgramContent';
import { toast } from 'sonner';
import ReviewModal from '@/components/shared/review-modal';
import GlobalModal from '@/components/global/GlobalModal';
import dayjs from 'dayjs';

export default function ProgramDetailsComp({ slug }: { slug: string }) {
    // State for selected tab and data
    const [selectedTab, setSelectedTab] = useState({
        tab: 'Modules',
        value: 'modules',
    });

    // Updated filter option state to handle property-value pairs
    const [filterOption, setFilterOption] = useState<
        Array<{ property: string; value: any }>
    >([]);
    const router = useRouter();
    const [reviewOpen, setReviewOpen] = useState<boolean>(false);

    // Fetch program and course data
    const { data: myPrograms, isLoading: isProgramsLoading } =
        useMyProgramQuery({});
    const {
        data: courseContent,
        isLoading: isCourseContentLoading,
        isFetching,
    } = useCourseContentQuery({ slug });

    // Use the single API call with filter parameters
    const {
        data: programsData,
        isLoading: courseProgramsLoading,
        refetch: refetchCourseContent,
    } = useGetAllCourseProgramsQuery({
        slug: slug,
        categoryID: selectedTab?.value,
    });

    const [filteredChaptersData, setFilteredChaptersData] = useState<
        ChapterData[] | undefined
    >(undefined);

    // Extract relevant data
    const program: TProgram | undefined = myPrograms?.program;
    const courseContentData: ICourseData | undefined = courseContent;
    const chaptersData: ChapterData[] = programsData?.chapters;

    const tabs = courseContentData?.category?.categories;

    // Updated filtering logic to handle property-value pairs
    useEffect(() => {
        if (!chaptersData) {
            setFilteredChaptersData(undefined);
            return;
        }

        if (filterOption.length === 0) {
            // When no filters are active, show all chapters
            setFilteredChaptersData(chaptersData);
            return;
        }

        const filtered = chaptersData.filter((chapter: any) =>
            filterOption.some((filter) => {
                const { property, value } = filter;

                // Handle nested properties like "chapter.isFree"
                if (property.includes('.')) {
                    const [parentProp, childProp] = property.split('.');
                    return (
                        chapter?.[parentProp] &&
                        chapter?.[parentProp][childProp] === value
                    );
                }

                // Handle direct properties
                return chapter[property as keyof typeof chapter] === value;
            }),
        );

        setFilteredChaptersData(filtered);
    }, [filterOption, chaptersData]);

    useEffect(() => {
        // Initialize first tab from available tabs if needed
        if (tabs && tabs?.length > 0 && selectedTab.value === 'modules') {
            setSelectedTab({ tab: tabs[0].name, value: tabs[0]._id });
        }
    }, [tabs, selectedTab.value]);

    const commingSoon = () => {
        toast.success('Coming Soon...');
    };
    const lastUpdate = myPrograms?.program?.updatedAt;

    const { data: reviews } = useGetAllCourseReviewQuery({});

    return (
        <div className='bg-background border-t border-border pt-2'>
            <GlobalHeader
                title={
                    <span
                        className='flex items-center justify-center gap-1'
                        id='program-title'
                    >
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
                            onClick={() => setReviewOpen(true)}
                        >
                            <span>
                                <MessageSquareCode
                                    size={20}
                                    className='text-primary-white'
                                />
                            </span>
                            Leave a Review
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
                }}
                className='w-full'
            >
                {/* Tabs Navigation */}
                <div className='border-b border-border'>
                    <div className='flex flex-col lg:flex-row gap-2 justify-between md:justify-start lg:justify-between  items-center md:items-start lg:items-center py-2'>
                        {(tabs?.length as number) > 0 ? (
                            <TabsList className='bg-foreground p-1 rounded-full gap-2  overflow-x-auto flex-wrap'>
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
                        ) : (
                            <div className='invisible'></div>
                        )}

                        <div className='flex items-center gap-4 flex-wrap'>
                            <div className='flex items-center gap-1 text-nowrap'>
                                <Clock className='h-4 w-4 text-gray' />
                                <span className='text-sm'>
                                    Last updated{' '}
                                    {lastUpdate
                                        ? dayjs(lastUpdate).fromNow()
                                        : 'N/A'}
                                </span>
                            </div>
                            <div className='flex items-center gap-1 text-nowrap'>
                                <FileText className='h-4 w-4 text-primary' />
                                <span className='text-sm font-medium'>
                                    {chaptersData?.length || 0} modules &
                                    lessons
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
                        }}
                        selectedTab={selectedTab}
                        fetchedData={filteredChaptersData}
                        courseContentData={courseContentData}
                        refetchCourseContent={refetchCourseContent}
                        filterOption={filterOption}
                        setFilterOption={setFilterOption}
                    />
                </TabsContent>
            </Tabs>

            <GlobalModal
                open={reviewOpen}
                setOpen={setReviewOpen}
                className='w-[550px] md:w-[550px] lg:w-[550px]'
                allowFullScreen={false}
                subTitle='A quick overview of your feedback and rating'
                title='My Review'
            >
                <ReviewModal _id={program?._id as string} />
            </GlobalModal>
        </div>
    );
}
