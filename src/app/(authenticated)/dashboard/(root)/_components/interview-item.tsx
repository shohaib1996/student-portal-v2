import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';

interface InterviewItemProps {
    title: string;
    subtitle: string;
    date: string;
    time: string;
    duration: number;
    score: number;
    imageSrc: string;
}

export function InterviewItem({
    title,
    subtitle,
    date,
    time,
    duration,
    score,
    imageSrc,
}: InterviewItemProps) {
    return (
        <div className='flex items-start gap-3 p-2 border rounded-lg'>
            <div className='w-[72px] h-full'>
                <Image
                    src={imageSrc || '/images/interview-item-thumbnail.png'}
                    alt={title}
                    width={60}
                    height={60}
                    className='rounded-md object-cover h-full w-full'
                />
            </div>
            <div className='flex-1'>
                <div className='flex items-start justify-between'>
                    <div>
                        <h4 className='font-medium text-sm'>{title}</h4>
                        <p className='text-xs text-muted-foreground'>
                            {subtitle}
                        </p>
                    </div>
                    <Button
                        variant='primary_light'
                        size='sm'
                        className='h-7 text-xs'
                    >
                        Review <ArrowRight className='h-3 w-3' />
                    </Button>
                </div>
                <div className='flex items-center gap-1.5 mt-2 text-xs text-muted-foreground'>
                    <div className='flex items-center'>
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
                            className='lucide lucide-calendar mr-1'
                        >
                            <rect
                                width='18'
                                height='18'
                                x='3'
                                y='4'
                                rx='2'
                                ry='2'
                            />
                            <line x1='16' x2='16' y1='2' y2='6' />
                            <line x1='8' x2='8' y1='2' y2='6' />
                            <line x1='3' x2='21' y1='10' y2='10' />
                        </svg>
                        {date} | {time}
                    </div>
                    <div className='flex items-center'>
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
                            className='lucide lucide-clock mr-1'
                        >
                            <circle cx='12' cy='12' r='10' />
                            <polyline points='12 6 12 12 16 14' />
                        </svg>
                        Duration: {duration} min
                    </div>
                    <div className='flex items-center'>
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
                            className='lucide lucide-bar-chart-2 mr-1'
                        >
                            <line x1='18' x2='18' y1='20' y2='10' />
                            <line x1='12' x2='12' y1='20' y2='4' />
                            <line x1='6' x2='6' y1='20' y2='14' />
                        </svg>
                        Score: {score}/100
                    </div>
                </div>
                <div className='flex items-center gap-2 mt-2'>
                    <Button
                        variant='outline'
                        size='sm'
                        className='h-6 px-2 text-xs rounded-full'
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
                            className='lucide lucide-share mr-1'
                        >
                            <path d='M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8' />
                            <polyline points='16 6 12 2 8 6' />
                            <line x1='12' x2='12' y1='2' y2='15' />
                        </svg>
                        Share
                    </Button>
                    <Button
                        variant='outline'
                        size='sm'
                        className='h-6 px-2 text-xs rounded-full'
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
                            className='lucide lucide-message-square mr-1'
                        >
                            <path d='M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' />
                        </svg>
                        Comments
                    </Button>
                </div>
            </div>
        </div>
    );
}
