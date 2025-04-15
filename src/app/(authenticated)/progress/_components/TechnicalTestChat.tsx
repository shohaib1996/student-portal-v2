'use client';

import { Pie, PieChart, Cell, ResponsiveContainer } from 'recharts';
import {
    type ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';

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

const CustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    value,
    total,
}: {
    cx: any;
    cy: any;
    midAngle: any;
    innerRadius: any;
    outerRadius: any;
    value: any;
    total: any;
}) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.6; // Position label in the middle of the slice
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    const percentage = total ? ((value / total) * 100).toFixed(1) : 0;

    return (
        <text
            x={x}
            y={y}
            fill='white'
            textAnchor='middle'
            dominantBaseline='central'
            className='text-xs font-medium'
        >
            {`${percentage}%`}
        </text>
    );
};

export function TechnicalTestChart({ data }: { data: any }) {
    const technicalTestData = [
        {
            name: 'accepted',
            value: data?.acceptedItems || 0,
            fill: '#22c55e',
        },
        {
            name: 'pending',
            value: data?.pendingItems || 0,
            fill: '#f97316',
        },
        {
            name: 'rejected',
            value: data?.rejectedItems || 0,
            fill: '#ef4444',
        },
        {
            name: 'totalAnswers',
            value: data?.totalItems || 0,
            fill: '#14b8a6',
        },
        {
            name: 'totalAssignments',
            value: data?.totalItems || 0,
            fill: '#3b82f6',
        },
    ];
    const totalValue = technicalTestData.reduce(
        (sum, item) => sum + item.value,
        0,
    );

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
                                <ResponsiveContainer width='100%' height='100%'>
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
                                            dataKey='value'
                                            nameKey='name'
                                            cx='50%'
                                            cy='50%'
                                            innerRadius={30}
                                            outerRadius={90}
                                            paddingAngle={1}
                                            startAngle={90}
                                            endAngle={-270}
                                            label={(props) => (
                                                <CustomLabel
                                                    {...props}
                                                    total={totalValue}
                                                />
                                            )}
                                            labelLine={false}
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
                                {data?.totalItems || 0}
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
                                {data?.acceptedItems +
                                    data?.pendingItems +
                                    data?.rejectedItems || 0}
                            </span>
                        </div>
                        <div className='flex items-center justify-between'>
                            <div className='flex items-center gap-2'>
                                <div className='w-4 h-4 rounded-full bg-green-500'></div>
                                <span className='text-dark-gray'>Accepted</span>
                            </div>
                            <span className='font-medium text-black text-lg'>
                                {data?.acceptedItems || 0}
                            </span>
                        </div>
                        <div className='flex items-center justify-between'>
                            <div className='flex items-center gap-2'>
                                <div className='w-4 h-4 rounded-full bg-orange-500'></div>
                                <span className='text-dark-gray'>Pending</span>
                            </div>
                            <span className='font-medium text-black text-lg'>
                                {data?.pendingItems || 0}
                            </span>
                        </div>
                        <div className='flex items-center justify-between'>
                            <div className='flex items-center gap-2'>
                                <div className='w-4 h-4 rounded-full bg-red-500'></div>
                                <span className='text-dark-gray'>Rejected</span>
                            </div>
                            <span className='font-medium text-black text-lg'>
                                {data?.rejectedItems || 0}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
