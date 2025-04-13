'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useGetPortalDataQuery } from '@/redux/api/dashboard/calendarApi';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useState } from 'react';
import GlobalModal from '@/components/global/GlobalModal';
import ReviewModal from '@/components/shared/review-modal';
import { useRouter } from 'next/navigation';

export function OthersSection() {
    const { data, isLoading, error } = useGetPortalDataQuery({
        community: {},
        familyMember: {},
        review: {},
    });

    const router = useRouter();

    return (
        <Card className='p-2 rounded-lg shadow-none bg-foreground'>
            <CardHeader className='flex p-2 border-b'>
                <CardTitle className='text-md font-medium'>Others</CardTitle>
                <span className='text-xs text-muted-foreground'>
                    See all others activitie
                </span>
            </CardHeader>
            <CardContent className='p-2'>
                <div className='grid lg:grid-cols-2 gap-3'>
                    {/* Community Section */}
                    <div className='border rounded-lg p-4 bg-background'>
                        <div className='flex items-center gap-2 mb-2'>
                            <div className='w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center'>
                                <svg
                                    xmlns='http://www.w3.org/2000/svg'
                                    width='16'
                                    height='16'
                                    viewBox='0 0 24 24'
                                    fill='none'
                                    stroke='currentColor'
                                    strokeWidth='2'
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    className='lucide lucide-users'
                                >
                                    <path d='M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' />
                                    <circle cx='9' cy='7' r='4' />
                                    <path d='M22 21v-2a4 4 0 0 0-3-3.87' />
                                    <path d='M16 3.13a4 4 0 0 1 0 7.75' />
                                </svg>
                            </div>
                            <div className='flex items-center justify-between w-full bg-background'>
                                <h4 className='font-medium text-sm'>
                                    Community
                                </h4>
                                <div className='flex items-center gap-1 text-xs text-primary'>
                                    <svg
                                        xmlns='http://www.w3.org/2000/svg'
                                        width='12'
                                        height='12'
                                        viewBox='0 0 24 24'
                                        fill='none'
                                        stroke='currentColor'
                                        strokeWidth='2'
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                        className='lucide lucide-trending-up'
                                    >
                                        <polyline points='22 7 13.5 15.5 8.5 10.5 2 17' />
                                        <polyline points='16 7 22 7 22 13' />
                                    </svg>
                                    <span>Increasing</span>
                                </div>
                            </div>
                        </div>
                        <div className='mt-2'>
                            <div className='flex items-center justify-between mb-1'>
                                <span className='text-sm'>Total Posts</span>
                                <span className='text-xs font-bold'>
                                    {data?.data?.community?.results
                                        ?.totalCommintyPost || 0}
                                </span>
                            </div>
                            {/* <Progress value={45} className='h-2' /> */}
                        </div>
                        <div className='flex items-center justify-between text-xs text-muted-foreground mt-3'>
                            <Link href={'/community'}>
                                <Button
                                    variant='link'
                                    size='sm'
                                    className='w-full text-xs p-0 h-auto text-primary'
                                >
                                    View Details
                                    <svg
                                        xmlns='http://www.w3.org/2000/svg'
                                        width='12'
                                        height='12'
                                        viewBox='0 0 24 24'
                                        fill='none'
                                        stroke='currentColor'
                                        strokeWidth='2'
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                        className='lucide lucide-arrow-right ml-1'
                                    >
                                        <path d='M5 12h14' />
                                        <path d='m12 5 7 7-7 7' />
                                    </svg>
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Family Members Section */}
                    <div className='border rounded-lg p-4 bg-background'>
                        <div className='flex items-center gap-2 mb-2'>
                            <div className='w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center'>
                                <svg
                                    xmlns='http://www.w3.org/2000/svg'
                                    width='16'
                                    height='16'
                                    viewBox='0 0 24 24'
                                    fill='none'
                                    stroke='currentColor'
                                    strokeWidth='2'
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    className='lucide lucide-users'
                                >
                                    <path d='M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' />
                                    <circle cx='9' cy='7' r='4' />
                                    <path d='M22 21v-2a4 4 0 0 0-3-3.87' />
                                    <path d='M16 3.13a4 4 0 0 1 0 7.75' />
                                </svg>
                            </div>

                            <h4 className='font-medium text-sm'>
                                Family Members
                            </h4>
                        </div>

                        <div className='flex items-center justify-between mb-1'>
                            <span className='text-sm'>Total Members</span>
                            <span className='text-xs font-bold'>
                                {data?.data?.familyMember?.results
                                    ?.familyMemberCount || 0}
                            </span>
                        </div>
                    </div>

                    {/* Review Section */}
                    <div className='border rounded-lg p-4 bg-background'>
                        <div className='flex items-center gap-2 mb-2'>
                            <div className='w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center'>
                                <svg
                                    xmlns='http://www.w3.org/2000/svg'
                                    width='16'
                                    height='16'
                                    viewBox='0 0 24 24'
                                    fill='none'
                                    stroke='currentColor'
                                    strokeWidth='2'
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    className='lucide lucide-star'
                                >
                                    <polygon points='12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2' />
                                </svg>
                            </div>
                            <h4 className='font-medium text-sm'>Reviews</h4>
                        </div>
                        <div className='flex items-center justify-between mb-1'>
                            <span className='text-sm'>Total Reviews</span>
                            <span className='text-xs font-bold'>
                                {data?.data?.review?.results?.totalReviews || 0}
                            </span>
                        </div>
                        <Link href={'/program/online-courses'}>
                            <Button
                                variant='secondary'
                                size='sm'
                                className='w-full mt-2 text-xs'
                            >
                                Leave a Review
                                <ArrowRight className='h-3 w-3 ml-1' />
                            </Button>
                        </Link>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
