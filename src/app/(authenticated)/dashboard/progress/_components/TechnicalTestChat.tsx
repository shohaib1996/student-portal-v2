'use client';

import { Pie, PieChart, Cell, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    type ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';

// Technical test data
const technicalTestData = [
    { name: 'accepted', value: 20, percentage: 35, fill: '#22c55e' }, // Green
    { name: 'pending', value: 15, percentage: 25, fill: '#f97316' }, // Orange
    { name: 'rejected', value: 5, percentage: 22, fill: '#ef4444' }, // Red
    { name: 'totalAnswers', value: 50, percentage: 10, fill: '#14b8a6' }, // Teal
    { name: 'totalAssignments', value: 80, percentage: 5, fill: '#3b82f6' }, // Blue
];

// Chart configuration
const chartConfig = {
    value: {
        label: 'Value',
    },
    accepted: {
        label: 'Accepted',
        color: '#22c55e',
    },
    pending: {
        label: 'Pending',
        color: '#f97316',
    },
    rejected: {
        label: 'Rejected',
        color: '#ef4444',
    },
    totalAnswers: {
        label: 'Total Answers',
        color: '#14b8a6',
    },
    totalAssignments: {
        label: 'Total Assignments',
        color: '#3b82f6',
    },
} satisfies ChartConfig;

export function TechnicalTestChart() {
    return (
        <div className='border-0 shadow-none bg-foreground'>
            <div className='border-b border-border'>
                <h3 className='font-medium text-black mb-1'>Technical Test</h3>
                <p className='text-sm text-gray mb-2'>
                    View all your technical test data
                </p>
            </div>
            <div className='mt-4 p-0'>
                <div className='flex flex-col 3xl:flex-row items-center 3xl:items-start gap-6'>
                    <div className='3xl:w-1/3 relative'>
                        <div className='w-full aspect-square mx-auto relative'>
                            <div className='absolute inset-0 flex items-center justify-center z-10'>
                                <div className='w-[50%] h-[50%] rounded-full bg-foreground border-4 border-green-100'></div>
                            </div>

                            <ChartContainer
                                config={chartConfig}
                                className='mx-auto aspect-square h-full'
                            >
                                <>
                                    <ResponsiveContainer
                                        width='100%'
                                        height='100%'
                                    >
                                        <PieChart>
                                            <ChartTooltip
                                                cursor={false}
                                                content={
                                                    <ChartTooltipContent
                                                        hideLabel
                                                    />
                                                }
                                            />
                                            <Pie
                                                data={technicalTestData}
                                                dataKey='percentage'
                                                nameKey='name'
                                                cx='50%'
                                                cy='50%'
                                                innerRadius={30}
                                                outerRadius={90}
                                                paddingAngle={1}
                                                startAngle={90}
                                                endAngle={-270}
                                            >
                                                {technicalTestData.map(
                                                    (entry, index) => (
                                                        <Cell
                                                            key={`cell-${index}`}
                                                            fill={entry.fill}
                                                        />
                                                    ),
                                                )}
                                            </Pie>
                                        </PieChart>
                                    </ResponsiveContainer>

                                    {/* Percentage labels */}
                                    <div className='absolute top-[18%] right-[15%] text-xs font-medium text-white'>
                                        35%
                                    </div>
                                    <div className='absolute bottom-[10%] right-[35%] text-xs font-medium text-white'>
                                        25%
                                    </div>
                                    <div className='absolute bottom-[30%] left-[10%] text-xs font-medium text-white'>
                                        22%
                                    </div>
                                    <div className='absolute top-[15%] left-[18%] text-xs font-medium text-white'>
                                        10%
                                    </div>
                                    <div className='absolute top-[5%] left-[40%] text-xs font-medium text-white'>
                                        5%
                                    </div>
                                </>
                            </ChartContainer>
                        </div>
                    </div>

                    <div className='w-full 3xl:w-2/3 space-y-4 pb-2 px-2'>
                        <div className='flex items-center justify-between'>
                            <div className='flex items-center gap-2'>
                                <div className='w-4 h-4 rounded-full bg-primary'></div>
                                <span className='text-dark-gray'>
                                    Total Assignments
                                </span>
                            </div>
                            <span className='font-medium text-black text-lg'>
                                80
                            </span>
                        </div>
                        <div className='flex items-center justify-between'>
                            <div className='flex items-center gap-2'>
                                <div className='w-4 h-4 rounded-full bg-teal-500'></div>
                                <span className='text-dark-gray'>
                                    Total Answers
                                </span>
                            </div>
                            <span className='font-medium text-black text-lg'>
                                50
                            </span>
                        </div>
                        <div className='flex items-center justify-between'>
                            <div className='flex items-center gap-2'>
                                <div className='w-4 h-4 rounded-full bg-green-500'></div>
                                <span className='text-dark-gray'>Accepted</span>
                            </div>
                            <span className='font-medium text-black text-lg'>
                                20
                            </span>
                        </div>
                        <div className='flex items-center justify-between'>
                            <div className='flex items-center gap-2'>
                                <div className='w-4 h-4 rounded-full bg-orange-500'></div>
                                <span className='text-dark-gray'>Pending</span>
                            </div>
                            <span className='font-medium text-black text-lg'>
                                15
                            </span>
                        </div>
                        <div className='flex items-center justify-between'>
                            <div className='flex items-center gap-2'>
                                <div className='w-4 h-4 rounded-full bg-red-500'></div>
                                <span className='text-dark-gray'>Rejected</span>
                            </div>
                            <span className='font-medium text-black text-lg'>
                                5
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
