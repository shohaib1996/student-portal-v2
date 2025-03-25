import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface DocumentItemProps {
    title: string;
    description: string;
    date: string;
    time: string;
    readTime: number;
    imageSrc: string;
}

export function DocumentItem({
    title,
    description,
    date,
    time,
    readTime,
    imageSrc,
}: DocumentItemProps) {
    return (
        <div className='flex items-center gap-3 p-2 border rounded-lg bg-background'>
            <div className='bg-green-500 rounded-md'>
                <Image
                    src={imageSrc || '/placeholder.svg'}
                    alt={title}
                    width={60}
                    height={60}
                    className='h-full w-full object-cover'
                />
            </div>
            <div className='flex-1'>
                <div>
                    <h4 className='font-medium text-sm'>{title}</h4>
                    <p className='text-xs text-muted-foreground line-clamp-2'>
                        {description}
                    </p>
                    <div className='flex items-center gap-4 mt-2 text-xs text-muted-foreground'>
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
                                className='lucide lucide-book-open mr-1'
                            >
                                <path d='M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z' />
                                <path d='M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z' />
                            </svg>
                            {readTime} min read
                        </div>
                    </div>
                </div>
            </div>
            <Button variant='primary_light' size='sm' className='h-7 text-xs'>
                View More
            </Button>
        </div>
    );
}
