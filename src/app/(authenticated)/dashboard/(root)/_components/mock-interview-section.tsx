import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ViewMoreLink } from './view-more-link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { InterviewItem } from './interview-item';
import { OverviewIcon, UpcomingIcon } from '@/components/svgs/dashboard'; // Added icons import

export function MockInterviewSection() {
    return (
        <Card className='p-2 rounded-lg shadow-none bg-foreground'>
            <CardHeader className='flex flex-row items-center justify-between p-2 border-b'>
                <div>
                    <h3 className='text-md font-medium'>Mock Interview</h3>
                    <p className='text-xs text-muted-foreground'>
                        Track your interview progress
                    </p>
                </div>
                <ViewMoreLink href='#' />
            </CardHeader>
            <CardContent className='p-2'>
                <div className=''>
                    <div className='flex flex-col bg-foreground p-2 rounded-md'>
                        <div className='flex flex-col justify-between'>
                            <div className='font-medium'>Completion Rate</div>
                            <div className='flex items-center'>
                                <span className='text-xl font-bold'>45%</span>
                                <Badge
                                    variant='outline'
                                    className='ml-1 bg-success-light text-success text-xs bg-background rounded-full text-red-600'
                                >
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
                                        className='lucide lucide-trending-up mr-1'
                                    >
                                        <polyline points='22 7 13.5 15.5 8.5 10.5 2 17' />
                                        <polyline points='16 7 22 7 22 13' />
                                    </svg>
                                    15% increase
                                </Badge>
                            </div>
                        </div>
                        <div className='text-xs text-right text-muted-foreground mb-1'>
                            140 of 320 interviews
                        </div>
                        <Progress value={45} className='h-2 bg-background' />
                    </div>

                    <Tabs defaultValue='all' className='border-b'>
                        <TabsList className='bg-transparent'>
                            <TabsTrigger
                                value='all'
                                className='border-b rounded-none data-[state=active]:text-primary-white data-[state=active]:font-semibold data-[state=active]:border-primary-white data-[state=active]:shadow-none flex items-center gap-1 data-[state=active]:bg-transparent'
                            >
                                <OverviewIcon className='text-gray data-[state=active]:text-primary-white' />
                                All (140)
                            </TabsTrigger>
                            <TabsTrigger
                                value='completed'
                                className='border-b rounded-none data-[state=active]:text-primary-white data-[state=active]:font-semibold data-[state=active]:border-primary-white data-[state=active]:shadow-none flex items-center gap-1 data-[state=active]:bg-transparent'
                            >
                                <UpcomingIcon className='data-[state=active]:text-primary-white' />
                                Completed
                            </TabsTrigger>
                            <TabsTrigger
                                value='pending'
                                className='border-b rounded-none data-[state=active]:text-primary-white data-[state=active]:font-semibold data-[state=active]:border-primary-white data-[state=active]:shadow-none flex items-center gap-1 data-[state=active]:bg-transparent'
                            >
                                <UpcomingIcon className='data-[state=active]:text-primary-white' />
                                Pending
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value='all' className='mt-1 space-y-2'>
                            <InterviewItem
                                title='Web Element'
                                subtitle='Frontend Masters'
                                date='Jan 30, 2024'
                                time='12:30 PM'
                                duration={40}
                                score={80}
                                imageSrc='/images/interview-item-thumbnail.png'
                            />
                            <InterviewItem
                                title='Web Element'
                                subtitle='Frontend Masters'
                                date='Jan 30, 2024'
                                time='12:30 PM'
                                duration={40}
                                score={80}
                                imageSrc='/images/interview-item-thumbnail.png'
                            />
                            <InterviewItem
                                title='Web Element'
                                subtitle='Frontend Masters'
                                date='Jan 30, 2024'
                                time='12:30 PM'
                                duration={40}
                                score={80}
                                imageSrc='/images/interview-item-thumbnail.png'
                            />
                        </TabsContent>
                        <TabsContent value='completed'>
                            <div className='py-4 text-center text-sm text-muted-foreground'>
                                No completed interviews
                            </div>
                        </TabsContent>
                        <TabsContent value='pending'>
                            <div className='py-4 text-center text-sm text-muted-foreground'>
                                No pending interviews
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </CardContent>
        </Card>
    );
}
