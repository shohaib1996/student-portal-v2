'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Label,
    LabelProps,
} from 'recharts';
import { JSX } from 'react';

// Define the data type
interface PieData {
    name: string;
    value: number;
    color: string;
}

const data: PieData[] = [
    { name: 'Bootcamps', value: 35, color: '#0736d1' },
    { name: 'Courses', value: 20, color: '#f4a00c' },
    { name: 'Calendar', value: 25, color: '#09c61a' },
    { name: 'Mock Interview', value: 5, color: '#07b4d3' },
    { name: 'Others', value: 15, color: '#f34141' },
];

// Type for the custom label props
interface CustomLabelProps {
    cx: number;
    cy: number;
    midAngle: number;
    innerRadius: number;
    outerRadius: number;
    percent: number;
    index: number;
}

const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index,
}: CustomLabelProps): JSX.Element => {
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

export function OverallProgress(): JSX.Element {
    return (
        <Card className='rounded-lg p-2 shadow-none bg-foreground'>
            <CardHeader className='p-2 flex flex-row items-center justify-between border-b'>
                <div>
                    <h3 className='text-md font-medium'>Overall Progress</h3>
                    <p className='text-xs text-muted-foreground'>
                        Your activity distribution across categories
                    </p>
                </div>
                <Select defaultValue='this-month'>
                    <SelectTrigger className='w-[140px] h-8'>
                        <SelectValue placeholder='Select period' />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value='this-month'>This month</SelectItem>
                        <SelectItem value='last-month'>Last month</SelectItem>
                        <SelectItem value='this-year'>This year</SelectItem>
                    </SelectContent>
                </Select>
            </CardHeader>
            <CardContent>
                <div className='flex items-center justify-between mt-4'>
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
                                    {data.map(
                                        (entry: PieData, index: number) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={entry.color}
                                            />
                                        ),
                                    )}
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
                    <div className='space-y-2 flex-1'>
                        {data.map((item: PieData) => (
                            <div key={item.name} className='flex flex-col'>
                                <div className='flex items-center justify-between'>
                                    <div className='flex items-center'>
                                        <span className='text-sm'>
                                            {item.name}
                                        </span>
                                    </div>
                                    <span className='text-sm font-medium'>
                                        {item.value}%
                                    </span>
                                </div>
                                <div className='w-full h-2 rounded-full mt-1 overflow-hidden bg-gray-light bg-background '>
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
            </CardContent>
        </Card>
    );
}
