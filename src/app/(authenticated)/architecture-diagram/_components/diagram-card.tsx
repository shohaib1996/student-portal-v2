'use client';

import DiagramComponent from '@/components/global/diagram/diagram-component';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { formatDateToCustomString } from '@/lib/formatDateToCustomString';
import { DiagramType } from '@/types/diagram';
import { Eye } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface DiagramCardProps {
    diagram: DiagramType;
    onClick?: () => void;
    index?: number;
}

const DiagramCard = ({ diagram, onClick, index }: DiagramCardProps) => {
    return (
        <div className='border rounded-lg overflow-hidden bg-background'>
            <div className='relative'>
                <div className='h-40 overflow-hidden'>
                    {typeof diagram?.attachments[0] === 'string' &&
                    diagram?.attachments[0].includes('appState') ? (
                        <div className=''>
                            <DiagramComponent
                                height='160px'
                                zoom={0.1}
                                diagram={diagram?.attachments}
                                viewMode={false}
                            />
                        </div>
                    ) : (
                        <div className=''>
                            <Image
                                width={1920}
                                height={1080}
                                className='w-full h-[150px] object-cover'
                                src={
                                    diagram?.attachments[0] ||
                                    '/images/diagram-thumbnail.png'
                                }
                                alt={diagram?.title}
                            />
                        </div>
                    )}
                </div>
                <div className='absolute top-2 left-2 z-50'>
                    <span className='rounded-full px-4 py-1 bg-primary text-white text-xs'>
                        {diagram?.category || 'New'}
                    </span>
                </div>
            </div>
            <div className='p-3'>
                <h3 className='font-semibold text-lg mb-1 line-clamp-1'>
                    {diagram.title}
                </h3>
                <div className='flex items-center justify-between gap-2 my-2'>
                    <div className='flex items-center gap-2'>
                        <Avatar className='h-5 w-5'>
                            <AvatarImage
                                src={'/images/author.png'}
                                alt='Author'
                            />
                            <AvatarFallback>A</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className='text-sm font-medium'>Author</p>
                            <p className='text-xs text-muted-foreground'>
                                Frontend Engineer
                            </p>
                        </div>
                    </div>
                    <div className='text-xs'>
                        <p className='text-muted-foreground'>Uploaded Date</p>
                        <p>{formatDateToCustomString(diagram?.createdAt)}</p>
                    </div>
                </div>
                <div className='flex items-center justify-center'>
                    <Link
                        href={`/architecture-diagram/preview/${diagram._id}`}
                        className='w-full'
                    >
                        <Button
                            disabled={index === 3 || index === 6}
                            variant='default'
                            size='sm'
                            className='text-xs px-3 w-full'
                        >
                            <Eye className='h-3 w-3' /> View
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default DiagramCard;
