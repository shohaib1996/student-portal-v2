'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { PieChart, Pie, Cell, ResponsiveContainer, Label } from 'recharts';
import { useGetMyProgressQuery } from '@/redux/api/myprogram/myprogramApi';
import { useEffect, useState } from 'react';

interface PieData {
    name: string;
    value: number;
    color: string;
}

const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index,
}: {
    cx: number;
    cy: number;
    midAngle: number;
    innerRadius: number;
    outerRadius: number;
    percent: number;
    index: number;
}) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));

    return (
        <text
            x={x}
            y={y}
            fill='#ffffff'
            textAnchor='middle'
            dominantBaseline='central'
            fontSize={12}
        >
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};

export function OverallProgress() {
    const { data: myProgress, isLoading, error } = useGetMyProgressQuery({});
    const [isSmallScreen, setIsSmallScreen] = useState(false);

    // Check screen size on component mount and when window resizes
    useEffect(() => {
        const checkScreenSize = () => {
            setIsSmallScreen(window.innerWidth < 1655); // 768px is a common breakpoint for medium screens
        };

        // Initial check
        checkScreenSize();

        // Add event listener for window resize
        window.addEventListener('resize', checkScreenSize);

        // Cleanup
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    interface MyProgressResult {
        title: string;
        count: number;
        limit: number;
    }

    interface MyProgressMetrics {
        overallPercentageAllItems: number;
    }

    interface MyProgress {
        results: MyProgressResult[];
        metrics: MyProgressMetrics;
    }

    const data: PieData[] =
        myProgress?.results?.length > 0
            ? myProgress.results.map(
                  (item: MyProgressResult, index: number) => ({
                      name: item.title,
                      value: Math.min((item.count / item.limit) * 100, 100),
                      color: [
                          '#0736d1',
                          '#f4a00c',
                          '#09c61a',
                          '#07b4d3',
                          '#f34141',
                      ][index % 5],
                  }),
              )
            : [
                  {
                      name: 'Overall Progress',
                      value:
                          myProgress?.metrics?.overallPercentageAllItems || 0,
                      color: '#2A9A13',
                  },
                  {
                      name: 'Remaining',
                      value: myProgress?.metrics
                          ? 100 - myProgress.metrics.overallPercentageAllItems
                          : 100,
                      color: '#e5e7eb',
                  },
              ];

    if (error) {
        console.error('Error fetching progress:', error);
        // You can replace this with a shadcn toast component if desired
    }

    return (
        <Card className='rounded-lg p-2 shadow-none bg-foreground'>
            <CardHeader className='p-2 flex flex-row items-center justify-between border-b'>
                <div>
                    <h3 className='text-md font-medium'>Overall Progress</h3>
                    <p className='text-xs text-muted-foreground'>
                        Your activity distribution across categories
                    </p>
                </div>
                {/* <Select defaultValue='this-month'>
                    <SelectTrigger className='w-[140px] h-8'>
                        <SelectValue placeholder='Select period' />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value='this-month'>This month</SelectItem>
                        <SelectItem value='last-month'>Last month</SelectItem>
                        <SelectItem value='this-year'>This year</SelectItem>
                    </SelectContent>
                </Select> */}
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className='flex justify-center items-center h-[200px]'>
                        <div>Loading...</div>
                    </div>
                ) : (
                    <div
                        className={`flex ${isSmallScreen ? 'flex-col' : 'flex-row'} items-center justify-between mt-4`}
                    >
                        <div className='h-[200px] w-[200px] relative mx-auto'>
                            <ResponsiveContainer width='100%' height='100%'>
                                <PieChart>
                                    <Pie
                                        data={data}
                                        cx='50%'
                                        cy='50%'
                                        stroke='none'
                                        innerRadius={50}
                                        outerRadius={80}
                                        paddingAngle={2}
                                        dataKey='value'
                                        label={renderCustomizedLabel}
                                        labelLine={false}
                                    >
                                        {data.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={entry.color}
                                            />
                                        ))}
                                        <Label
                                            value='100%'
                                            position='center'
                                            style={{
                                                fontSize: '18px',
                                                fontWeight: 'bold',
                                            }}
                                            className='text-black'
                                        />
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div
                            className={`space-y-2 ${isSmallScreen ? 'w-full mt-4' : 'flex-1'}  overflow-y-auto`}
                        >
                            {data.map((item) => (
                                <div key={item.name} className='flex flex-col'>
                                    <div className='flex items-center justify-between'>
                                        <div className='flex items-center'>
                                            <span className='text-sm'>
                                                {item.name}
                                            </span>
                                        </div>
                                        <span className='text-sm font-medium'>
                                            {item.value.toFixed(0)}%
                                        </span>
                                    </div>
                                    <div className='w-full h-2 rounded-full mt-1 overflow-hidden bg-gray-light bg-background'>
                                        <div
                                            className='h-full rounded-full'
                                            style={{
                                                width: `${item.value}%`,
                                                backgroundColor: item.color,
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
