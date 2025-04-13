'use client';

import GlobalHeader from '@/components/global/GlobalHeader';
import CourseCard from '@/components/program/online-courses/CourseCard';
// Removed the unused API hook import
// import { useGetAllCoursesQuery } from '@/redux/api/course/courseApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppSelector } from '@/redux/hooks';
// import { TCourse } from '@/types';
import {
    BookOpen,
    BookOpenText,
    GraduationCap,
    MessageSquare,
    Search,
} from 'lucide-react';
import { useMemo, useState } from 'react';

const OnlineCoursesPage = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('program');

    // Get user enrollments from Redux state
    const { myEnrollments } = useAppSelector((state) => state.auth);

    // Filter enrollments based on search query and type
    const { filteredPrograms, filteredCourses, filteredInterviews } =
        useMemo(() => {
            const lowercasedQuery = searchQuery.toLowerCase();
            return {
                filteredPrograms:
                    myEnrollments?.filter(
                        (enroll) =>
                            enroll.program.type === 'program' &&
                            enroll.program.title
                                .toLowerCase()
                                .includes(lowercasedQuery),
                    ) || [],
                filteredCourses:
                    myEnrollments?.filter(
                        (enroll) =>
                            enroll.program.type === 'course' &&
                            enroll.program.title
                                .toLowerCase()
                                .includes(lowercasedQuery),
                    ) || [],
                filteredInterviews:
                    myEnrollments?.filter(
                        (enroll) =>
                            enroll.program.type === 'interview' &&
                            enroll.program.title
                                .toLowerCase()
                                .includes(lowercasedQuery),
                    ) || [],
            };
        }, [myEnrollments, searchQuery]);

    // Dummy values for the All Courses section;
    // Replace these with your actual data/logic if needed.
    const activeCourses = [];
    const pendingCourses = [];
    const inactiveCourses = [];

    // Render courses in a grid layout
    const renderTabContent = (courses: any) => {
        if (!courses || courses.length === 0) {
            return (
                <div className='text-center py-12'>
                    <p className='text-muted-foreground'>
                        No courses available
                    </p>
                </div>
            );
        }

        return (
            <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 mt-4'>
                {courses.map((course: any) => (
                    <CourseCard key={course._id} course={course} />
                ))}
            </div>
        );
    };

    return (
        <div className='py-2'>
            <GlobalHeader
                title='Online Courses'
                subTitle='Learn, Grow, and Advance Your Career Online'
                buttons={
                    <div>
                        <Button
                            variant={'secondary'}
                            className='flex items-center gap-2'
                        >
                            <BookOpenText size={18} />
                            My Bootcamps
                        </Button>
                    </div>
                }
            />
            <div>
                <div className='space-y-3 bg-background p-3 rounded-lg'>
                    <div className='relative'>
                        <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
                            <Search className='w-4 h-4 text-gray-500' />
                        </div>
                        <Input
                            className='pl-10 bg-foreground'
                            placeholder='Search programs...'
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* User Enrollments Section */}
            <Tabs
                defaultValue='program'
                value={activeTab}
                onValueChange={setActiveTab}
                className='mb-6'
            >
                <TabsList className='flex items-center justify-start gap-3 bg-transparent mt-4'>
                    <TabsTrigger
                        value='program'
                        className='text-xs data-[state=active]:text-primary-white shadow-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary-white border-b rounded-none data-[state=active]:border-b-primary-white'
                    >
                        <GraduationCap className='w-4 h-4 mr-1' />
                        Programs ({filteredPrograms.length})
                    </TabsTrigger>
                    <TabsTrigger
                        value='courses'
                        className='text-xs data-[state=active]:text-primary-white shadow-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary-white border-b rounded-none data-[state=active]:border-b-primary-white'
                    >
                        <BookOpen className='w-4 h-4 mr-1' />
                        Courses ({filteredCourses.length})
                    </TabsTrigger>
                    <TabsTrigger
                        value='interviews'
                        className='text-xs data-[state=active]:text-primary-white shadow-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary-white border-b rounded-none data-[state=active]:border-b-primary-white'
                    >
                        <MessageSquare className='w-4 h-4 mr-1' />
                        Interviews ({filteredInterviews.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value='program'>
                    {renderTabContent(filteredPrograms)}
                </TabsContent>
                <TabsContent value='courses'>
                    {renderTabContent(filteredCourses)}
                </TabsContent>
                <TabsContent value='interviews'>
                    {renderTabContent(filteredInterviews)}
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default OnlineCoursesPage;
