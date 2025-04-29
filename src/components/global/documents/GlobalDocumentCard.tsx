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
import { useEffect, useState } from 'react';
import { instance } from '@/lib/axios/axiosInstance';
import { renderText } from '@/components/lexicalEditor/renderer/renderText';
import { renderPlainText } from '@/components/lexicalEditor/renderer/renderPlainText';

export interface GlobalDocumentCardProps {
    id: string;
    title?: string;
    name?: string;
    author?: string;
    createdAt?: string | Date;
    readTime?: number;
    categories?: string[];
    attachment?: string[] | [];
    thumbnail?: string;
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
    createdAt,
    readTime = 2,
    categories = ['Document'],
    imageUrl = '/default_image.png',
    thumbnail,
    attachment = [''],
    description,
    authorAvatar = '/avatar.png',
    showAuthorInfo = true,
    onClick,
    badgeVariant = 'secondary',
    imageHeight = 150,
}: GlobalDocumentCardProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    // const { data } = useGetMySingleDocumentQuery(searchParams.get('id') || '');
    // const [des, setDes] = useState(description);

    // useEffect(() => {
    //     (async () => {
    //         try {
    //             const res = await instance.get(`/content/singlecontent/${id}`);
    //             setDes(res.data.content?.description);
    //         } catch (error) {
    //             console.error((error as Error).message);
    //         }
    //     })();
    // }, [id]);

    const handleReadMore: (e: React.MouseEvent) => void = (
        e: React.MouseEvent,
    ) => {
        e.stopPropagation();
        if (id) {
            router.push(`/${redirect}?documentId=${id}&mode=view`);
        }
        onClick?.();
    };

    const imageExtensions = [
        '.png',
        '.jpg',
        '.jpeg',
        '.webp',
        '.gif',
        '.svg',
        '.bmp',
        '.tiff',
        '.ico',
        '.avif',
    ];

    const getImageUrl = attachment?.find((file) =>
        imageExtensions.some((ext) => file?.toLowerCase().includes(ext)),
    );

    return (
        <Card className='overflow-hidden'>
            <div className='cursor-pointer' onClick={handleReadMore}>
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
                        </div>
                    </div>
                    <Image
                        src={
                            thumbnail ||
                            imageUrl ||
                            getImageUrl ||
                            '/default_image.png'
                        }
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
                                        <time dateTime={createdAt as string}>
                                            {createdAt as string}
                                        </time>
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <p className='text-xs text-gray'>
                                <time dateTime={createdAt as string}>
                                    {formatDateToCustomString(
                                        createdAt as string,
                                    )}
                                </time>
                            </p>
                        )}
                        <div className='flex items-center gap-1 text-xs text-gray'>
                            <Eye className='h-3 w-3' />
                            <span>{readTime} min read</span>
                        </div>
                    </div>
                    <h3 className='mb-1 line-clamp-2 font-semibold'>
                        {name || title || 'Untitled'}
                    </h3>
                    <p className='!line-clamp-2 !text-sm text-gray opacity-80 max-h-[80px] overflow-hidden'>
                        {description
                            ? renderPlainText({ text: description })
                            : 'No description available'}
                    </p>
                    <Button
                        variant='link'
                        className='h-auto p-0 text-xs font-medium text-primary-white hover:no-underline'
                        onClick={handleReadMore}
                    >
                        Read More →
                    </Button>
                </CardContent>
            </div>
        </Card>
    );
}
