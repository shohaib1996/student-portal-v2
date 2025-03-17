'use client';
import GlobalHeader from '@/components/global/GlobalHeader';
import React from 'react';
import RightButton from './RightButton';
import ActiveProgram from './ActiveProgram';
import PendingProgram from './PendingProgram';
import {
    useGetMyProgressQuery,
    useMyProgramQuery,
} from '@/redux/api/myprogram/myprogramApi';

import {
    Card,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TProgram, TProgramMain, TProgressChart } from '@/types';

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

    if (isLoading || isProgressLoading) {
        return (
            <Card className='mt-common flex flex-col gap-common bg-background p-common md:flex-row'>
                {/* Left Section Skeleton */}
                <Card className='flex w-full flex-col gap-common bg-background p-common'>
                    <CardHeader>
                        <Skeleton className='w-6/4 h-6 bg-foreground' />
                    </CardHeader>
                    <CardDescription className='grow-[1] space-y-common'>
                        <Skeleton className='h-4 w-1/2 bg-foreground' />
                        <Skeleton className='w-6/4 h-4 bg-foreground' />
                        <Skeleton className='h-4 w-1/3 bg-foreground' />
                        <Skeleton className='h-2 w-full rounded bg-foreground' />
                    </CardDescription>
                    <CardFooter>
                        <Skeleton className='h-10 w-32 rounded bg-foreground' />
                    </CardFooter>
                </Card>

                {/* Right Section Skeleton */}
                <Card className='min-h-[300px] w-full overflow-hidden bg-background p-common'>
                    <Skeleton className='h-[300px] w-full rounded-xl bg-foreground' />
                </Card>
            </Card>
        );
    }
    if (isError || isProgressError) {
        return <p>Geeting error to fetch</p>;
    }
    const myProgram: TProgramMain = data;
    const program: TProgram = myProgram?.program;

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
            />
            <PendingProgram />
        </>
    );
};

export default Program;
