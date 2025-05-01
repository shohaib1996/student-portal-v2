'use client';

import DiagramComponent from '@/components/global/diagram/diagram-component';
import { TdUser } from '@/components/global/TdUser';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { formatDateToCustomString } from '@/lib/formatDateToCustomString';
import { TUser } from '@/types/auth';
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
    console.log(diagram);
    return (
        <div className='border rounded-lg overflow-hidden bg-foreground'>
            <div className='relative'>
                <div className='h-40 overflow-hidden'>
                    {Array.isArray(diagram?.attachments) &&
                    diagram?.attachments[0] &&
                    typeof diagram?.attachments[0] === 'string' &&
                    diagram?.attachments[0].includes('appState') ? (
                        <div className=''>
                            <DiagramComponent
                                height='160px'
                                zoom={0.1}
                                diagram={diagram?.description}
                                viewMode={true}
                            />
                        </div>
                    ) : (
                        <div className=''>
                            <Image
                                width={1920}
                                height={1080}
                                className='w-full h-[150px] object-cover'
                                src={
                                    diagram?.thumbnail ||
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
                    <TdUser user={diagram?.createdBy as TUser} />
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
