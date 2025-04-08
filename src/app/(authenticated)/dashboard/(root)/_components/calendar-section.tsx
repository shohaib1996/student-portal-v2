'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { StatusCard } from './status-card';
import { ViewMoreLink } from './view-more-link';

import { OverviewIcon, UpcomingIcon } from '@/components/svgs/dashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGetPortalDataQuery } from '@/redux/api/dashboard/calendarApi';

export function CalendarSection() {
    const {
        data: calendarData,
        isLoading,
        error,
    } = useGetPortalDataQuery({ calendar: {} });

    // Default data structure if API call fails or is loading
    const defaultStats = {
        accepted: { count: 72, percentage: 57 },
        pending: { count: 44, percentage: 34 },
        denied: { count: 35, percentage: 47 },
        finished: { count: 86, percentage: 57 },
    };

    // Use API data if available, otherwise use defaults
    const stats = calendarData?.results
        ? {
              accepted: {
                  count: calendarData.results.current || 0,
                  percentage:
                      calendarData.results.total > 0
                          ? Math.round(
                                (calendarData.results.current /
                                    calendarData.results.total) *
                                    100,
                            )
                          : 0,
              },
              pending: {
                  count: calendarData.results.upcoming || 0,
                  percentage:
                      calendarData.results.total > 0
                          ? Math.round(
                                (calendarData.results.upcoming /
                                    calendarData.results.total) *
                                    100,
                            )
                          : 0,
              },
              denied: {
                  count: 0, // No direct equivalent in your data, setting to 0
                  percentage: 0,
              },
              finished: {
                  count: calendarData.results.finished || 0,
                  percentage:
                      calendarData.results.total > 0
                          ? Math.round(
                                (calendarData.results.finished /
                                    calendarData.results.total) *
                                    100,
                            )
                          : 0,
              },
          }
        : defaultStats;

    if (error) {
        console.error('Error fetching calendar data:', error);
    }

    return (
        <Card className='p-2 rounded-lg shadow-none bg-foreground'>
            <CardHeader className='p-2 flex flex-row flex-wrap items-center justify-between border-b'>
                <div>
                    <h3 className='text-md font-medium'>Calendar</h3>
                    <p className='text-xs text-muted-foreground'>
                        Track your calendar events and status
                    </p>
                </div>
                <div className='flex items-center gap-2'>
                    <ViewMoreLink href='/calendar' />
                    <Select defaultValue='this-month'>
                        <SelectTrigger className='w-[140px] h-9'>
                            <SelectValue placeholder='Select period' />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value='this-month'>
                                This month
                            </SelectItem>
                            <SelectItem value='last-month'>
                                Last month
                            </SelectItem>
                            <SelectItem value='this-year'>This year</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent className='p-2'>
                <Tabs defaultValue='overview' className='border-b'>
                    <TabsList className='bg-transparent'>
                        <TabsTrigger
                            value='overview'
                            className='border-b rounded-none data-[state=active]:text-primary data-[state=active]:font-semibold data-[state=active]:border-primary data-[state=active]:shadow-none flex items-center gap-1 data-[state=active]:bg-transparent'
                        >
                            <OverviewIcon className='text-gray data-[state=active]:text-primary' />{' '}
                            Overview
                        </TabsTrigger>
                        <TabsTrigger
                            value='upcoming'
                            className='border-b rounded-none data-[state=active]:text-primary data-[state=active]:font-semibold data-[state=active]:border-primary data-[state=active]:shadow-none flex items-center gap-1 data-[state=active]:bg-transparent'
                        >
                            <UpcomingIcon className='data-[state=active]:text-primary' />{' '}
                            Upcoming
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value='overview' className='space-y-1'>
                        {isLoading ? (
                            <div className='flex justify-center items-center py-4'>
                                <div>Loading...</div>
                            </div>
                        ) : (
                            <div className='grid grid-cols-2 gap-4'>
                                <StatusCard
                                    title='Total Accepted'
                                    value={stats.accepted.count}
                                    percentage={stats.accepted.percentage}
                                    color='success'
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
                                    title='Total Pending'
                                    value={stats.pending.count}
                                    percentage={stats.pending.percentage}
                                    color='secondary'
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
                                    title='Total Denied'
                                    value={stats.denied.count}
                                    percentage={stats.denied.percentage}
                                    color='success'
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
                                    title='Finished'
                                    value={stats.finished.count}
                                    percentage={stats.finished.percentage}
                                    color='success'
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
                                            className='lucide lucide-check-square'
                                        >
                                            <polyline points='9 11 12 14 22 4' />
                                            <path d='M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11' />
                                        </svg>
                                    }
                                />
                            </div>
                        )}
                    </TabsContent>
                    <TabsContent value='upcoming'>
                        <div className='py-4 text-center text-sm text-muted-foreground'>
                            {isLoading
                                ? 'Loading...'
                                : 'No upcoming events scheduled'}
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
