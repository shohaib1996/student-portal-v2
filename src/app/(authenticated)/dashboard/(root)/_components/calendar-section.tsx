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

    // Log the data for debugging
    console.log('Calendar Data:', calendarData?.data?.calendar?.results);

    // Default stats if API call fails or is loading
    const defaultStats = {
        total: { count: 0, percentage: 0 },
        finished: { count: 0, percentage: 0 },
        current: { count: 0, percentage: 0 },
        upcoming: { count: 0, percentage: 0 },
        recurrent: { count: 0, percentage: 0 },
    };

    // Dynamic stats based on API data
    const stats = calendarData?.data?.calendar?.results
        ? {
              total: {
                  count: calendarData.data.calendar.results.total || 0,
                  percentage: 100, // Total is always 100%
              },
              finished: {
                  count: calendarData.data.calendar.results.finished || 0,
                  percentage:
                      calendarData.data.calendar.results.total > 0
                          ? Math.round(
                                (calendarData.data.calendar.results.finished /
                                    calendarData.data.calendar.results.total) *
                                    100,
                            )
                          : 0,
              },
              current: {
                  count: calendarData.data.calendar.results.current || 0,
                  percentage:
                      calendarData.data.calendar.results.total > 0
                          ? Math.round(
                                (calendarData.data.calendar.results.current /
                                    calendarData.data.calendar.results.total) *
                                    100,
                            )
                          : 0,
              },
              upcoming: {
                  count: calendarData.data.calendar.results.upcoming || 0,
                  percentage:
                      calendarData.data.calendar.results.total > 0
                          ? Math.round(
                                (calendarData.data.calendar.results.upcoming /
                                    calendarData.data.calendar.results.total) *
                                    100,
                            )
                          : 0,
              },
              recurrent: {
                  count: calendarData.data.calendar.results.recurrent || 0,
                  percentage:
                      calendarData.data.calendar.results.total > 0
                          ? Math.round(
                                (calendarData.data.calendar.results.recurrent /
                                    calendarData.data.calendar.results.total) *
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
                    {/* <Select defaultValue='this-month'>
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
                    </Select> */}
                </div>
            </CardHeader>
            <CardContent className='p-2'>
                {error ? (
                    <div className='py-4 text-center text-sm text-destructive'>
                        Failed to load calendar data. Please try again later.
                    </div>
                ) : (
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
                                        title='Total Events'
                                        value={stats.total.count}
                                        percentage={stats.total.percentage}
                                        color='primary'
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
                                                className='lucide lucide-calendar'
                                            >
                                                <path d='M8 2v4' />
                                                <path d='M16 2v4' />
                                                <rect
                                                    width='18'
                                                    height='18'
                                                    x='3'
                                                    y='4'
                                                    rx='2'
                                                />
                                                <path d='M3 10h18' />
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
                                    <StatusCard
                                        title='Current'
                                        value={stats.current.count}
                                        percentage={stats.current.percentage}
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
                                                <circle
                                                    cx='12'
                                                    cy='12'
                                                    r='10'
                                                />
                                                <polyline points='12 6 12 12 16 14' />
                                            </svg>
                                        }
                                    />

                                    <StatusCard
                                        title='Recurrent'
                                        value={stats.recurrent.count}
                                        percentage={stats.recurrent.percentage}
                                        color='info'
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
                                                className='lucide lucide-repeat'
                                            >
                                                <path d='m17 2 4 4-4 4' />
                                                <path d='M3 12v-2a4 4 0 0 1 4-4h12.8' />
                                                <path d='m7 22-4-4 4-4' />
                                                <path d='M21 12v2a4 4 0 0 1-4 4H4.2' />
                                            </svg>
                                        }
                                    />
                                </div>
                            )}
                        </TabsContent>
                        <TabsContent value='upcoming'>
                            {isLoading ? (
                                <div className='flex justify-center items-center py-4'>
                                    <div>Loading...</div>
                                </div>
                            ) : stats.upcoming.count > 0 ? (
                                <div className='grid grid-cols-1 gap-4'>
                                    <StatusCard
                                        title='Upcoming Events'
                                        value={stats.upcoming.count}
                                        percentage={stats.upcoming.percentage}
                                        color='warning'
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
                                                className='lucide lucide-calendar-plus'
                                            >
                                                <path d='M8 2v4' />
                                                <path d='M16 2v4' />
                                                <path d='M21 14V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8' />
                                                <path d='M3 10h18' />
                                                <path d='M16 20h6' />
                                                <path d='M19 17v6' />
                                            </svg>
                                        }
                                    />
                                </div>
                            ) : (
                                <div className='py-4 text-center text-sm text-muted-foreground'>
                                    <StatusCard
                                        title='Upcoming'
                                        value={stats.upcoming.count}
                                        percentage={stats.upcoming.percentage}
                                        color='warning'
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
                                                className='lucide lucide-calendar-plus'
                                            >
                                                <path d='M8 2v4' />
                                                <path d='M16 2v4' />
                                                <path d='M21 14V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8' />
                                                <path d='M3 10h18' />
                                                <path d='M16 20h6' />
                                                <path d='M19 17v6' />
                                            </svg>
                                        }
                                    />
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                )}
            </CardContent>
        </Card>
    );
}
