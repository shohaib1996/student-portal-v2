'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ViewMoreLink } from './view-more-link';
import { StatusCard } from './status-card';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

const data = [
    { name: 'Jan', value: 30 },
    { name: 'Feb', value: 25 },
    { name: 'Mar', value: 35 },
    { name: 'Apr', value: 15 },
    { name: 'May', value: 10 },
    { name: 'Jun', value: 5 },
    { name: 'Jul', value: 20 },
    { name: 'Aug', value: 35 },
    { name: 'Sep', value: 25 },
    { name: 'Oct', value: 30 },
    { name: 'Nov', value: 15 },
    { name: 'Dec', value: 30 },
];

export function TechnicalTestSection() {
    return (
        <Card className='p-2 rounded-lg shadow-none bg-foreground'>
            <CardHeader className='flex flex-row items-center justify-between p-2 border-b'>
                <div>
                    <CardTitle className='text-md font-medium'>
                        Technical Test
                    </CardTitle>
                    <p className='text-xs text-muted-foreground'>
                        Track Your Performance in Technical Tests
                    </p>
                </div>
                <ViewMoreLink href='#' />
            </CardHeader>
            <CardContent className='p-2'>
                <div className='grid grid-cols-2 gap-4 mt-4'>
                    <StatusCard
                        title='Total Accepted'
                        value={72}
                        percentage={57}
                        color='#09c61a'
                        icon={
                            <svg
                                xmlns='http://www.w3.org/2000/svg'
                                width='20'
                                height='20'
                                viewBox='0 0 24 24'
                                fill='none'
                                stroke='currentColor'
                                strokeWidth='2'
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                className='lucide lucide-check-circle'
                            >
                                <path d='M22 11.08V12a10 10 0 1 1-5.93-9.14' />
                                <path d='m9 11 3 3L22 4' />
                            </svg>
                        }
                    />
                    <StatusCard
                        title='Pending'
                        value={44}
                        percentage={34}
                        color='#f4a00c'
                        icon={
                            <svg
                                xmlns='http://www.w3.org/2000/svg'
                                width='20'
                                height='20'
                                viewBox='0 0 24 24'
                                fill='none'
                                stroke='currentColor'
                                strokeWidth='2'
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                className='lucide lucide-clock'
                            >
                                <circle cx='12' cy='12' r='10' />
                                <polyline points='12 6 12 12 16 14' />
                            </svg>
                        }
                    />
                    <StatusCard
                        title='Rejected'
                        value={15}
                        percentage={47}
                        color='#f34141'
                        icon={
                            <svg
                                xmlns='http://www.w3.org/2000/svg'
                                width='20'
                                height='20'
                                viewBox='0 0 24 24'
                                fill='none'
                                stroke='currentColor'
                                strokeWidth='2'
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                className='lucide lucide-x-circle'
                            >
                                <circle cx='12' cy='12' r='10' />
                                <path d='m15 9-6 6' />
                                <path d='m9 9 6 6' />
                            </svg>
                        }
                    />
                    <StatusCard
                        title='Unanswered'
                        value={29}
                        percentage={57}
                        color='#0736d1'
                        icon={
                            <svg
                                xmlns='http://www.w3.org/2000/svg'
                                width='20'
                                height='20'
                                viewBox='0 0 24 24'
                                fill='none'
                                stroke='currentColor'
                                strokeWidth='2'
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                className='lucide lucide-help-circle'
                            >
                                <circle cx='12' cy='12' r='10' />
                                <path d='M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3' />
                                <path d='M12 17h.01' />
                            </svg>
                        }
                    />
                </div>

                <div className='mt-6'>
                    <h3 className='text-sm font-medium mb-4'>
                        Test Completion Timeline
                    </h3>
                    <div className='h-[200px]'>
                        <ResponsiveContainer width='100%' height='100%'>
                            <BarChart
                                data={data}
                                margin={{
                                    top: 5,
                                    right: 10,
                                    left: 0,
                                    bottom: 5,
                                }}
                            >
                                <CartesianGrid
                                    strokeDasharray='3 3'
                                    vertical={false}
                                />
                                <XAxis
                                    dataKey='name'
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip />
                                <Bar
                                    dataKey='value'
                                    fill='#f4a00c'
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
