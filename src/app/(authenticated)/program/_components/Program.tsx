'use client';

import GlobalHeader from '@/components/global/GlobalHeader';
import React from 'react';
import ActiveProgram from './ActiveProgram';
import {
    useGetMyProgressQuery,
    useMyProgramQuery,
} from '@/redux/api/myprogram/myprogramApi';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TProgram, TProgramMain, TProgressChart } from '@/types';
import { TEnrollment } from '@/types/auth';
import RightButton from './RightButton';

const Program = () => {
    const { data, isLoading, isError } = useMyProgramQuery({});

    const {
        data: myProgress,
        isLoading: isProgressLoading,
        isError: isProgressError,
    } = useGetMyProgressQuery<{
        data: TProgressChart;
        isLoading: boolean;
        isError: boolean;
    }>({});
    const myProgram: TProgramMain = data;
    const program: TProgram = myProgram?.program;
    const enrollment: TEnrollment = myProgram?.enrollment;

    if (isLoading || isProgressLoading) {
        return (
            <Card className='overflow-hidden border border-border shadow-sm mb-8'>
                <CardContent className='p-6 md:p-8'>
                    <div className='flex flex-col lg:flex-row gap-8'>
                        {/* Left Column - Program Details Skeleton */}
                        <div className='flex-1'>
                            <div className='flex items-center gap-2 mb-4'>
                                <Skeleton className='h-6 w-28 rounded-full bg-green-100' />
                                <Skeleton className='h-6 w-32 rounded-full bg-primary-light' />
                            </div>

                            <Skeleton className='h-8 w-3/4 mb-6 bg-background' />

                            <div className='grid md:grid-cols-2 gap-6 mb-6'>
                                <div className='space-y-4'>
                                    <div className='flex items-center gap-2'>
                                        <Skeleton className='h-5 w-5 rounded-full bg-background' />
                                        <div className='space-y-1'>
                                            <Skeleton className='h-3 w-16 bg-background' />
                                            <Skeleton className='h-4 w-28 bg-background' />
                                        </div>
                                    </div>

                                    <div className='flex items-center gap-2'>
                                        <Skeleton className='h-5 w-5 rounded-full bg-background' />
                                        <div className='space-y-1'>
                                            <Skeleton className='h-3 w-16 bg-background' />
                                            <Skeleton className='h-4 w-40 bg-background' />
                                        </div>
                                    </div>

                                    <div className='flex items-center gap-2'>
                                        <Skeleton className='h-5 w-5 rounded-full bg-background' />
                                        <div className='space-y-1'>
                                            <Skeleton className='h-3 w-16 bg-background' />
                                            <Skeleton className='h-4 w-32 bg-background' />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <div className='flex items-center gap-3 mb-4'>
                                        <Skeleton className='w-12 h-12 rounded-full bg-background' />
                                        <div className='space-y-2'>
                                            <Skeleton className='h-4 w-32 bg-background' />
                                            <Skeleton className='h-3 w-24 bg-background' />
                                        </div>
                                    </div>

                                    <div className='mb-4'>
                                        <div className='flex items-center justify-between mb-1'>
                                            <Skeleton className='h-4 w-32 bg-background' />
                                            <Skeleton className='h-4 w-10 bg-background' />
                                        </div>
                                        <Skeleton className='h-3 w-full rounded-full bg-blue-100' />
                                    </div>

                                    <div className='grid grid-cols-2 gap-2 mt-4'>
                                        {[1, 2, 3, 4].map((i) => (
                                            <div
                                                key={i}
                                                className='flex items-center gap-2'
                                            >
                                                <Skeleton className='w-8 h-8 rounded-full bg-blue-50' />
                                                <div>
                                                    <Skeleton className='h-3 w-16 bg-background' />
                                                    <Skeleton className='h-4 w-8 bg-background mt-1' />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <Skeleton className='h-10 w-36 rounded-md bg-blue-600' />
                        </div>

                        {/* Right Column - Program Image and Technologies Skeleton */}
                        <div className='lg:w-2/5'>
                            <Skeleton className='h-48 md:h-64 w-full rounded-xl bg-background mb-4' />

                            <div className='grid grid-cols-6 gap-2'>
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <div
                                        key={i}
                                        className='flex flex-col items-center'
                                    >
                                        <Skeleton className='w-10 h-10 rounded-lg bg-background' />
                                        <Skeleton className='h-2 w-8 bg-background mt-1' />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }
    if (isError || isProgressError) {
        return <p>Geeting error to fetch</p>;
    }

    return (
        <>
            <GlobalHeader
                title='Bootcamps'
                subTitle='Continue learning to keep moving forward'
                buttons={<RightButton />}
            />
            <ActiveProgram
                program={program}
                myProgram={myProgram}
                myProgress={myProgress}
                enrollment={enrollment}
            />
        </>
    );
};

export default Program;
