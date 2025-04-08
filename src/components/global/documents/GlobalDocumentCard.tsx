'use client';

import Image from 'next/image';
import { Eye, PencilLine, Trash } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDateToCustomString } from '@/lib/formatDateToCustomString';
import { useRouter, useSearchParams } from 'next/navigation';
import { useGetMySingleDocumentQuery } from '@/redux/api/documents/documentsApi';

export interface GlobalDocumentCardProps {
    id?: string;
    title?: string;
    name?: string;
    author?: string;
    date?: string;
    readTime?: number;
    categories?: string[];
    imageUrl?: string;
    description?: string;
    authorAvatar?: string;
    showAuthorInfo?: boolean;
    badgeVariant?: 'default' | 'secondary' | 'outline' | 'destructive';
    imageHeight?: number;
    onClick?: () => void;
    redirect: string;
}

export function GlobalDocumentCard({
    id,
    title,
    redirect,
    name,
    author,
    date,
    readTime = 2,
    categories = ['Document'],
    imageUrl = '/images/documents-and-labs-thumbnail.png',
    description = 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Consectetur, adipisci?',
    authorAvatar = '/images/author.png',
    showAuthorInfo = true,
    onClick,
    badgeVariant = 'secondary',
    imageHeight = 150,
}: GlobalDocumentCardProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { data } = useGetMySingleDocumentQuery(searchParams.get('id') || '');

    const handleReadMore: (e: React.MouseEvent) => void = (
        e: React.MouseEvent,
    ) => {
        e.stopPropagation();
        if (id) {
            router.push(`/${redirect}?documentId=${id}&mode=view`);
        }
        onClick?.();
    };

    return (
        <Card className='overflow-hidden'>
            <div className='cursor-pointer' onClick={onClick}>
                <div className='relative'>
                    <div className='absolute left-2 top-2 z-10 flex flex-wrap gap-1 w-full'>
                        <div className='flex flex-row items-center justify-between gap-4 w-[calc(100%-16px)]'>
                            {categories?.map((category) => (
                                <Badge
                                    key={category}
                                    variant={badgeVariant}
                                    className='bg-pure-black/40 backdrop-blur-2xl text-pure-white text-xs font-medium rounded-full'
                                >
                                    {category}
                                </Badge>
                            ))}
                            <div className='flex flex-row items-center gap-2'>
                                <Button className='h-6 w-6 rounded-full bg-primary-light hover:bg-primary'>
                                    <PencilLine size={14} />
                                </Button>
                                <Button className='h-6 w-6 rounded-full bg-red-500/70 hover:bg-red-500'>
                                    <Trash size={14} />
                                </Button>
                            </div>
                        </div>
                    </div>
                    <Image
                        src={imageUrl || '/default_image.png'}
                        alt={title || 'thumbnail'}
                        width={400}
                        height={200}
                        className={`h-[${imageHeight}px] w-full object-cover`}
                    />
                </div>
                <CardContent className='p-3'>
                    <div className='mb-2 flex items-start justify-between'>
                        {showAuthorInfo && author ? (
                            <div className='flex items-center gap-1'>
                                <Avatar className='h-5 w-5'>
                                    <AvatarImage
                                        src={authorAvatar}
                                        alt={author}
                                    />
                                    <AvatarFallback>{author[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className='text-sm font-medium text-gray'>
                                        {author}
                                    </p>
                                    <p className='text-xs text-gray'>
                                        <time dateTime={date}>{date}</time>
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <p className='text-xs text-gray'>
                                <time dateTime={date}>
                                    {formatDateToCustomString(date)}
                                </time>
                            </p>
                        )}
                        <div className='flex items-center gap-1 text-xs text-gray'>
                            <Eye className='h-3 w-3' />
                            <span>{readTime} min read</span>
                        </div>
                    </div>
                    <h3 className='mb-1 line-clamp-2 font-semibold'>
                        {name || title}
                    </h3>
                    <p className='line-clamp-2 text-sm text-gray'>
                        {description}
                    </p>
                    <Button
                        variant='link'
                        className='h-auto p-0 text-xs font-medium text-primary-white'
                        onClick={handleReadMore}
                    >
                        Read More →
                    </Button>
                </CardContent>
            </div>
        </Card>
    );
}
