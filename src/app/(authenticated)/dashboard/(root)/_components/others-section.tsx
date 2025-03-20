import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

export function OthersSection() {
    return (
        <Card className='p-2 lg:col-span-2'>
            <CardHeader className='flex p-2 border-b'>
                <CardTitle className='text-md font-medium'>Others</CardTitle>
                <span className='text-xs text-muted-foreground'>
                    See all others activities
                </span>
            </CardHeader>
            <CardContent className='p-2'>
                <div className='grid lg:grid-cols-3 gap-3'>
                    {/* Community Section */}
                    <div className='border rounded-lg p-4'>
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
                            <div className='flex items-center justify-between w-full'>
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
                                <span className='text-sm'>
                                    Active Engagement
                                </span>
                                <span className='text-xs font-bold'>45%</span>
                            </div>
                            <Progress value={45} className='h-2' />
                        </div>
                        <div className='flex items-center justify-between text-xs text-muted-foreground mt-3'>
                            <div className='flex items-center gap-1'>
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
                                    className='lucide lucide-user'
                                >
                                    <path d='M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2' />
                                    <circle cx='12' cy='7' r='4' />
                                </svg>
                                <span className='text-nowrap'>
                                    Last updated today
                                </span>
                            </div>
                            <div>
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
                            </div>
                        </div>
                    </div>

                    {/* Family Members Section */}
                    <div className='border rounded-lg p-4'>
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
                            <div>
                                <h4 className='font-medium text-sm'>
                                    Family Members
                                </h4>
                            </div>
                        </div>
                        <div className='flex -space-x-2 mt-4'>
                            {[1, 2, 3, 4].map((i) => (
                                <Avatar
                                    key={i}
                                    className='border-2 border-background w-8 h-8'
                                >
                                    <AvatarImage src={`/images/author.png`} />
                                    <AvatarFallback>U{i}</AvatarFallback>
                                </Avatar>
                            ))}
                            <div className='flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white text-xs font-medium'>
                                +5
                            </div>
                        </div>
                        <div className='flex items-center justify-between mt-3'>
                            <div className='text-xs text-muted-foreground'>
                                <div className='flex items-center gap-1'>
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
                                        className='lucide lucide-user'
                                    >
                                        <path d='M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2' />
                                        <circle cx='12' cy='7' r='4' />
                                    </svg>
                                    Last updated 1 week ago
                                </div>
                            </div>
                            <div>
                                <Button
                                    variant='link'
                                    size='sm'
                                    className='w-full mt-2 text-xs p-0 h-auto text-primary'
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
                            </div>
                        </div>
                    </div>

                    {/* Review Section */}
                    <div className='border rounded-lg p-4'>
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
                            <div>
                                <h4 className='font-medium text-sm'>Review</h4>
                                <div className='flex items-center gap-1 text-xs text-muted-foreground'>
                                    <span>Not review yet</span>
                                </div>
                            </div>
                        </div>
                        <div className='mt-2'>
                            <div className='flex items-center justify-between mb-1'>
                                <span className='text-sm font-bold'>0%</span>
                            </div>
                            <Progress value={0} className='h-2' />
                        </div>
                        <div className='text-xs text-muted-foreground mt-2'>
                            <div className='flex items-center gap-1'>
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
                                    className='lucide lucide-user'
                                >
                                    <path d='M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2' />
                                    <circle cx='12' cy='7' r='4' />
                                </svg>
                                Last updated 1 week ago
                            </div>
                        </div>
                        <Button
                            variant='outline'
                            size='sm'
                            className='w-full mt-2 text-xs'
                        >
                            Leave a Review
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
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
