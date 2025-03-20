'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ViewMoreLink } from './view-more-link';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

const data = [
    { name: 'Jan', value: 20 },
    { name: 'Feb', value: 30 },
    { name: 'Mar', value: 45 },
    { name: 'Apr', value: 35 },
    { name: 'May', value: 25 },
    { name: 'Jun', value: 40 },
    { name: 'Jul', value: 60 },
    { name: 'Aug', value: 40 },
    { name: 'Sep', value: 50 },
    { name: 'Oct', value: 35 },
    { name: 'Nov', value: 45 },
    { name: 'Dec', value: 55 },
];

export function TodoSection() {
    return (
        <Card>
            <CardHeader className='flex flex-row items-center justify-between pb-2'>
                <CardTitle className='text-md font-medium'>To-Do</CardTitle>
                <div className='flex items-center gap-2'>
                    <ViewMoreLink href='#' />
                    <Select defaultValue='monthly'>
                        <SelectTrigger className='w-[140px] h-8'>
                            <SelectValue placeholder='Select period' />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value='monthly'>Monthly</SelectItem>
                            <SelectItem value='weekly'>Weekly</SelectItem>
                            <SelectItem value='daily'>Daily</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent>
                <p className='text-xs text-muted-foreground'>
                    Monitor your to-do progress
                </p>

                <div className='h-[200px] mt-4'>
                    <ResponsiveContainer width='100%' height='100%'>
                        <LineChart
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
                            <Line
                                type='monotone'
                                dataKey='value'
                                stroke='#f4a00c'
                                strokeWidth={2}
                                dot={{ r: 0 }}
                                activeDot={{ r: 6, fill: '#f4a00c' }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
