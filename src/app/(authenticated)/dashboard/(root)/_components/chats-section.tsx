'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ViewMoreLink } from './view-more-link';
import { Progress } from '@/components/ui/progress';

import { useEffect, useState } from 'react';
import { useGetAllPortalChartDataMutation } from '@/redux/api/myprogram/myprogramApi';
import { MessageCircle } from 'lucide-react';

export function ChatsSection() {
    const [chatData, setChatData] = useState({
        totalChat: 20,
        totalMessage: 20,
        totalUnreadChat: 20,
        totalReadChat: 20,
        totalPinnedMessages: 20,
        totalUnreadCrowd: 20,
        totalUnreadDirect: 20,
    });

    // Calculate progress percentages
    const readProgress = chatData.totalChat
        ? (chatData.totalReadChat / chatData.totalChat) * 100
        : 0;
    const unreadProgress = chatData.totalChat
        ? (chatData.totalUnreadChat / chatData.totalChat) * 100
        : 0;
    const unreadCrowdProgress = chatData.totalChat
        ? (chatData.totalUnreadCrowd / chatData.totalChat) * 100
        : 0;
    const unreadDirectProgress = chatData.totalChat
        ? (chatData.totalUnreadDirect / chatData.totalChat) * 100
        : 0;
    const pinnedProgress = chatData.totalChat
        ? (chatData.totalPinnedMessages / chatData.totalChat) * 100
        : 0;

    return (
        <Card className='p-2 rounded-lg shadow-none bg-foreground'>
            <CardHeader className='flex flex-row items-center justify-between p-2 border-b'>
                <div>
                    <h4 className='text-md font-medium'>Chats</h4>
                    <p className='text-xs text-muted-foreground'>
                        Manage and track all your conversations
                    </p>
                </div>
                <ViewMoreLink href='/chat' />
            </CardHeader>
            <CardContent className='p-2'>
                {/* Grid Data Table for Chat Statistics */}
                <div className=''>
                    <div className='grid lg:grid-cols-3 gap-2 border rounded-lg'>
                        <div className='p-2 flex items-center gap-2'>
                            <MessageCircle className='text-primary' />
                            <div>
                                <div className='text-sm font-medium text-nowrap'>
                                    Total Chats
                                </div>
                                <div className='text-2xl font-bold'>
                                    {chatData.totalChat}
                                </div>
                            </div>
                        </div>
                        <div className='p-2 flex items-center gap-2'>
                            <svg
                                xmlns='http://www.w3.org/2000/svg'
                                width='24'
                                height='24'
                                viewBox='0 0 24 24'
                                fill='none'
                                stroke='currentColor'
                                strokeWidth='2'
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                className='lucide lucide-user text-purple-500'
                            >
                                <path d='M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2' />
                                <circle cx='12' cy='7' r='4' />
                            </svg>
                            <div>
                                <div className='text-sm font-medium text-nowrap'>
                                    One-on-One
                                </div>
                                <div className='text-2xl font-bold'>
                                    {chatData.totalUnreadDirect}
                                </div>
                            </div>
                        </div>
                        <div className='p-2 flex items-center gap-2'>
                            <svg
                                xmlns='http://www.w3.org/2000/svg'
                                width='24'
                                height='24'
                                viewBox='0 0 24 24'
                                fill='none'
                                stroke='currentColor'
                                strokeWidth='2'
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                className='lucide lucide-users text-yellow-500'
                            >
                                <path d='M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' />
                                <circle cx='9' cy='7' r='4' />
                                <path d='M22 21v-2a4 4 0 0 0-3-3.87' />
                                <path d='M16 3.13a4 4 0 0 1 0 7.75' />
                            </svg>
                            <div>
                                <div className='text-sm font-medium text-nowrap'>
                                    Crowd Chats
                                </div>
                                <div className='text-2xl font-bold'>
                                    {chatData.totalUnreadCrowd}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Progress Bars */}
                <div className='mt-2 space-y-2'>
                    <div className='space-y-2'>
                        <div className='flex items-center justify-between'>
                            <span className='text-sm'>Read</span>
                            <span className='text-xs text-muted-foreground'>
                                {chatData.totalReadChat} out of{' '}
                                {chatData.totalChat}
                            </span>
                        </div>
                        <Progress
                            value={readProgress}
                            className='h-2 bg-background'
                        />

                        <div className='flex items-center justify-between'>
                            <span className='text-sm'>Unread</span>
                            <span className='text-xs text-muted-foreground'>
                                {chatData.totalUnreadChat} out of{' '}
                                {chatData.totalChat}
                            </span>
                        </div>
                        <Progress
                            value={unreadProgress}
                            className='h-2 bg-background'
                        />

                        <div className='flex items-center justify-between'>
                            <span className='text-sm'>Unread Chat Crowd</span>
                            <span className='text-xs text-muted-foreground'>
                                {chatData.totalUnreadCrowd} out of{' '}
                                {chatData.totalChat}
                            </span>
                        </div>
                        <Progress
                            value={unreadCrowdProgress}
                            className='h-2 bg-background'
                        />

                        <div className='flex items-center justify-between'>
                            <span className='text-sm'>
                                Unread Direct Message
                            </span>
                            <span className='text-xs text-muted-foreground'>
                                {chatData.totalUnreadDirect} out of{' '}
                                {chatData.totalChat}
                            </span>
                        </div>
                        <Progress
                            value={unreadDirectProgress}
                            className='h-2 bg-background'
                        />

                        <div className='flex items-center justify-between'>
                            <span className='text-sm'>Pinned Messages</span>
                            <span className='text-xs text-muted-foreground'>
                                {chatData.totalPinnedMessages} out of{' '}
                                {chatData.totalChat}
                            </span>
                        </div>
                        <Progress
                            value={pinnedProgress}
                            className='h-2 bg-background'
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
