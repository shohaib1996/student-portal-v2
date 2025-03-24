import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ViewMoreLink } from './view-more-link';
import { Progress } from '@/components/ui/progress';

export function ChatsSection() {
    return (
        <Card className='p-2 rounded-lg shadow-none bg-foreground'>
            <CardHeader className='flex flex-row items-center justify-between p-2 border-b'>
                <div>
                    <h4 className='text-md font-medium'>Chats</h4>
                    <p className='text-xs text-muted-foreground'>
                        Manage and track all your conversations
                    </p>
                </div>

                <ViewMoreLink href='#' />
            </CardHeader>
            <CardContent className='p-2'>
                {/* Grid Data Table for Chat Statistics */}
                <div className=''>
                    <div className='grid lg:grid-cols-3 gap-2 border rounded-lg'>
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
                                className='lucide lucide-message-square text-blue-500'
                            >
                                <path d='M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' />
                            </svg>
                            <div>
                                <div className='text-sm font-medium text-nowrap'>
                                    Total Chats
                                </div>
                                <div className='text-2xl font-bold'>72</div>
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
                                <div className='text-2xl font-bold'>45</div>
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
                                <div className='text-2xl font-bold'>27</div>
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
                                53 out of 72
                            </span>
                        </div>
                        <Progress value={73} className='h-2 bg-background' />

                        <div className='flex items-center justify-between'>
                            <span className='text-sm'>Unread</span>
                            <span className='text-xs text-muted-foreground'>
                                15 out of 72
                            </span>
                        </div>
                        <Progress
                            value={21}
                            className='h-2 bg-background'
                            // indicatorClassName='bg-warning'
                        />

                        <div className='flex items-center justify-between'>
                            <span className='text-sm'>Unread Chat Crowd</span>
                            <span className='text-xs text-muted-foreground'>
                                12 out of 72
                            </span>
                        </div>
                        <Progress
                            value={17}
                            className='h-2 bg-background'
                            // indicatorClassName='bg-success'
                        />

                        <div className='flex items-center justify-between'>
                            <span className='text-sm'>
                                Unread Direct Message
                            </span>
                            <span className='text-xs text-muted-foreground'>
                                5 out of 72
                            </span>
                        </div>
                        <Progress
                            value={7}
                            className='h-2 bg-background'
                            // indicatorClassName='bg-danger'
                        />

                        <div className='flex items-center justify-between'>
                            <span className='text-sm'>Pinned Messages</span>
                            <span className='text-xs text-muted-foreground'>
                                35 out of 72
                            </span>
                        </div>
                        <Progress
                            value={49}
                            className='h-2 bg-background'
                            // indicatorClassName='bg-warning'
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
