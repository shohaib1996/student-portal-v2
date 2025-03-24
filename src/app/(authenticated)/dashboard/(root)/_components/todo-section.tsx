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
    AreaChart,
    Area,
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
        <Card className='p-2 shadow-none bg-foreground rounded-lg'>
            <CardHeader className='flex flex-row items-center justify-between p-2 border-b'>
                <CardTitle className='text-md font-medium'>To-Do</CardTitle>
                <div className='flex items-center gap-2'>
                    <ViewMoreLink href='#' />
                    <Select defaultValue='monthly'>
                        <SelectTrigger className='w-[140px] h-9'>
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
            <CardContent className='p-2'>
                <p className='text-xs text-muted-foreground'>
                    Monitor your to-do progress
                </p>

                <div className='h-[200px] mt-4'>
                    <ResponsiveContainer width='100%' height='100%'>
                        <AreaChart
                            data={data}
                            margin={{
                                top: 5,
                                right: 10,
                                left: 0,
                                bottom: 5,
                            }}
                        >
                            <defs>
                                <linearGradient
                                    id='fillValue'
                                    x1='0'
                                    y1='0'
                                    x2='0'
                                    y2='1'
                                >
                                    <stop
                                        offset='5%'
                                        stopColor='#f4a00c'
                                        stopOpacity={0.8}
                                    />
                                    <stop
                                        offset='95%'
                                        stopColor='#f4a00c'
                                        stopOpacity={0.1}
                                    />
                                </linearGradient>
                            </defs>
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
                            <Area
                                type='monotone'
                                dataKey='value'
                                stroke='#f4a00c'
                                strokeWidth={2}
                                fill='url(#fillValue)'
                                activeDot={{ r: 6, fill: '#f4a00c' }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
