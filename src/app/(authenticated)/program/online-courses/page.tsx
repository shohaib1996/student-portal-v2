'use client';

import GlobalHeader from '@/components/global/GlobalHeader';
import CourseCard from '@/components/program/online-courses/CourseCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGetAllCoursesQuery } from '@/redux/api/course/courseApi';
import { TCourse } from '@/types';
import { BookOpenText } from 'lucide-react';

const page = () => {
    const { data } = useGetAllCoursesQuery(undefined);
    const courses: TCourse[] = data?.orders || [];

    const activeCourses = courses.filter((c) => c.status === 'active');
    const pendingCourses = courses.filter((c) => c.status === 'pending');
    const inactiveCourses = courses.filter((c) => c.status === 'inactive');

    const renderCourses = (courses: TCourse[]) => {
        return (
            <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-2'>
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
                <TabsList className='bg-transparent'>
                    <TabsTrigger
                        value='all'
                        className='border-b rounded-none data-[state=active]:text-primary data-[state=active]:font-semibold data-[state=active]:border-primary data-[state=active]:shadow-none flex items-center gap-1 data-[state=active]:bg-transparent'
                    >
                        All
                    </TabsTrigger>
                    <TabsTrigger
                        value='active'
                        className='border-b rounded-none data-[state=active]:text-primary data-[state=active]:font-semibold data-[state=active]:border-primary data-[state=active]:shadow-none flex items-center gap-1 data-[state=active]:bg-transparent'
                    >
                        Active
                    </TabsTrigger>
                    <TabsTrigger
                        value='pending'
                        className='border-b rounded-none data-[state=active]:text-primary data-[state=active]:font-semibold data-[state=active]:border-primary data-[state=active]:shadow-none flex items-center gap-1 data-[state=active]:bg-transparent'
                    >
                        Pending
                    </TabsTrigger>
                    <TabsTrigger
                        value='inactive'
                        className='border-b rounded-none data-[state=active]:text-primary data-[state=active]:font-semibold data-[state=active]:border-primary data-[state=active]:shadow-none flex items-center gap-1 data-[state=active]:bg-transparent'
                    >
                        Inactive
                    </TabsTrigger>
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
