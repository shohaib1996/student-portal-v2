'use client';

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

// Mock interview data with exact values from the image
const mockInterviewData = [
    {
        name: 'Total mock interview questions',
        value: 60,
        color: '#0d6efd',
        count: 34,
    }, // Blue
    {
        name: 'Total mock interview Answers',
        value: 40,
        color: '#20c997',
        count: 15,
    }, // Teal/Cyan
    { name: 'Reviewed', value: 30, color: '#198754', count: 22 }, // Green
    { name: 'Not reviewed', value: 20, color: '#fd7e14', count: 15 }, // Orange
];

export function MockInterviewChart() {
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
                    <ArrowRight />
                </Link>
            </div>

            <div className='flex flex-col md:flex-row gap-6'>
                <div className='md:w-1/3 relative'>
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
                                    dataKey='value'
                                >
                                    {mockInterviewData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={entry.color}
                                        />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>

                        {/* Manually add percentage labels to match the image exactly */}
                        <div className='absolute top-[15%] right-[25%] text-white font-bold'>
                            60%
                        </div>
                        <div className='absolute top-[40%] left-[15%] text-white font-bold'>
                            40%
                        </div>
                        <div className='absolute bottom-[25%] left-[30%] text-white font-bold'>
                            30%
                        </div>
                        <div className='absolute bottom-[40%] right-[20%] text-white font-bold'>
                            20%
                        </div>
                    </div>
                </div>

                <div className='md:w-2/3 space-y-3'>
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
