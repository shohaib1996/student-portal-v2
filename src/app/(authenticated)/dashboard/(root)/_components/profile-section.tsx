import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function ProfileSection() {
    return (
        <Card className='p-2 rounded-lg shadow-none bg-foreground'>
            <CardHeader className='p-2 border-b'>
                <CardTitle className='text-md font-medium'>Profile</CardTitle>
                <span className='text-xs text-muted-foreground'>
                    View Profile Information
                </span>
            </CardHeader>
            <CardContent className='p-2'>
                <div className='grid grid-cols-2 gap-4'>
                    <div className='border rounded-lg p-3 bg-background'>
                        <div className='flex items-center gap-2 mb-2'>
                            <div className='w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center'>
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
                                    className='lucide lucide-user'
                                >
                                    <path d='M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2' />
                                    <circle cx='12' cy='7' r='4' />
                                </svg>
                            </div>
                            <div className='flex items-center justify-between gap-3'>
                                <h4 className='font-medium text-sm'>
                                    My Profile
                                </h4>
                                <div className='flex items-center gap-1 text-xs text-muted-foreground'>
                                    <span className='text-black px-1 text-[10px] rounded-full bg-background'>
                                        95% complete
                                    </span>
                                </div>
                            </div>
                        </div>
                        <Progress value={95} className='h-2' />
                        <p className='text-xs my-3'>Last updated 1 week ago</p>
                        <Link href='/profile' className='w-full'>
                            <Button
                                variant='secondary'
                                size='sm'
                                className='w-full text-xs'
                            >
                                Complete Profile
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

                    <div className='border rounded-lg p-3 bg-background flex flex-col justify-between'>
                        <div className='flex items-center gap-2 mb-2'>
                            <div className='w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center'>
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
                                    className='lucide lucide-key'
                                >
                                    <path d='m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4' />
                                </svg>
                            </div>
                            <div>
                                <h4 className='font-medium text-sm'>
                                    Change Password
                                </h4>
                            </div>
                        </div>
                        <div className='text-xs text-muted-foreground mt-2 mb-4'>
                            <div className='flex items-center gap-1 mt-1'>
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
                        <Link href={'/profile'}>
                            <Button
                                variant='secondary'
                                size='sm'
                                className='w-full text-xs'
                            >
                                Change Now
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
            </CardContent>
        </Card>
    );
}
