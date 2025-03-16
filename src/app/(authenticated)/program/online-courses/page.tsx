'use client';
import GlobalHeader from '@/components/global/GlobalHeader';
import CourseCard from '@/components/program/online-courses/CourseCard';
import { Button } from '@/components/ui/button';
import { BookOpenText } from 'lucide-react';
import React from 'react';

const page = () => {
    return (
        <div className='pt-2'>
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

            <div className='grid pt-2 xl:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-2'>
                {Array.from({ length: 20 }, (_, i: number) => (
                    <CourseCard key={i} />
                ))}
            </div>
        </div>
    );
};

export default page;
