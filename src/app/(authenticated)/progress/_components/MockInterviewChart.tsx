'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, LabelList } from 'recharts';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function MockInterviewChart({ data }: { data: any }) {
    const totalCount = Object.values(data)?.reduce(
        (sum: number, item: any) => sum + item,
        0,
    );

    const mockInterviewData = [
        {
            name: 'Total mock interview questions',
            color: '#0d6efd',
            count: data?.totalInterview || 0,
            percentage: totalCount
                ? (((data?.totalInterview || 0) / totalCount) * 100).toFixed(
                      0,
                  ) + '%'
                : '0%',
        }, // Blue
        {
            name: 'Total mock interview Answers',
            color: '#20c997',
            count: data?.submitted || 0,
            percentage: totalCount
                ? (((data?.submitted || 0) / totalCount) * 100).toFixed(0) + '%'
                : '0%',
        }, // Teal/Cyan
        {
            name: 'Reviewed',
            color: '#198754',
            count: data?.completed || 0,
            percentage: totalCount
                ? (((data?.completed || 0) / totalCount) * 100).toFixed(0) + '%'
                : '0%',
        }, // Green
        {
            name: 'Not reviewed',
            color: '#fd7e14',
            count: data?.pending || 0,
            percentage: totalCount
                ? (((data?.pending || 0) / totalCount) * 100).toFixed(0) + '%'
                : '0%',
        }, // Orange
    ];

    return (
        <div className='bg-foreground rounded-xl mb-2'>
            <div className='flex justify-between items-center mb-2 pb-2 border-b border-border'>
                <div>
                    <h3 className='font-medium text-black'>Mock Interview</h3>
                    <p className='text-sm text-gray'>
                        View all your mock interview data
                    </p>
                </div>
                <Link
                    href='#'
                    className='text-sm text-primary-white bg-primary-light hover:bg-primary hover:text-white font-medium flex items-center gap-0.5 py-2 px-2.5 rounded-lg'
                >
                    View More
                    <ArrowRight className='hidden md:block' />
                </Link>
            </div>

            <div className='flex flex-col md:flex-row lg:flex-col xl:flex-row gap-6 items-center'>
                <div className='w-full md:w-2/5 lg:w-full xl:w-1/2 relative'>
                    <div className='w-full max-w-[200px] mx-auto relative'>
                        <ResponsiveContainer width='100%' height={200}>
                            <PieChart>
                                <Pie
                                    data={mockInterviewData}
                                    cx='50%'
                                    cy='50%'
                                    innerRadius={0}
                                    outerRadius={80}
                                    paddingAngle={0}
                                    dataKey='count'
                                >
                                    {mockInterviewData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={entry.color}
                                        />
                                    ))}
                                    <LabelList
                                        dataKey='percentage'
                                        position='inside'
                                        style={{
                                            fill: '#ffffff',
                                            fontWeight: '400',
                                            fontSize: '14px',
                                        }}
                                    />
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className='w-full md:w-3/5 lg:w-full xl:w-1/2 space-y-3'>
                    {mockInterviewData.map((item, index) => (
                        <div
                            key={index}
                            className='flex items-center justify-between'
                        >
                            <div className='flex items-center gap-2'>
                                <div
                                    className='w-3 h-3 rounded-full'
                                    style={{ backgroundColor: item.color }}
                                ></div>
                                <span className='text-sm text-dark-gray'>
                                    {item.name}
                                </span>
                            </div>
                            <span className='font-medium'>{item.count}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
