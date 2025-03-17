'use client';
import GlobalHeader from '@/components/global/GlobalHeader';
import CourseCard from '@/components/program/online-courses/CourseCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGetAllCoursesQuery } from '@/redux/api/course/courseApi';
import { TCourse } from '@/types';
import { BookOpenText } from 'lucide-react';
import React from 'react';

const page = () => {
    const { data } = useGetAllCoursesQuery(undefined);
    const courses: TCourse[] = data?.orders || [];

    const activeCourses = courses.filter((c) => c.status === 'active');
    const pendingCourses = courses.filter((c) => c.status === 'pending');
    const inactiveCourses = courses.filter((c) => c.status === 'inactive');

    const renderCourses = (courses: TCourse[]) => {
        return (
            <div className='grid pt-2 xl:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-2'>
                {courses.map((course) => (
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
                            icon={<BookOpenText size={18} />}
                        >
                            My Bootcamps
                        </Button>
                    </div>
                }
            />

            <Tabs defaultValue='all'>
                <TabsList>
                    <TabsTrigger value='all'>All</TabsTrigger>
                    <TabsTrigger value='active'>Active</TabsTrigger>
                    <TabsTrigger value='pending'>Pending</TabsTrigger>
                    <TabsTrigger value='inactive'>Inactive</TabsTrigger>
                </TabsList>
                <TabsContent value='all'>{renderCourses(courses)}</TabsContent>
                <TabsContent value='active'>
                    {renderCourses(activeCourses)}
                </TabsContent>
                <TabsContent value='pending'>
                    {renderCourses(pendingCourses)}
                </TabsContent>
                <TabsContent value='inactive'>
                    {renderCourses(inactiveCourses)}
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default page;
