'use client';

import Image from 'next/image';
import { Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export interface GlobalDocumentCardProps {
    id?: string;
    title: string;
    author?: string; // Made optional to support both versions
    date: string;
    readTime: number;
    categories: string[];
    imageUrl: string;
    description?: string; // Added as optional prop
    authorAvatar?: string; // Added for avatar customization
    showAuthorInfo?: boolean; // Control whether to show author info
    onClick?: () => void;
    badgeVariant?: 'default' | 'secondary' | 'outline' | 'destructive'; // Added for badge styling
    imageHeight?: number; // Added for image customization
}

export function GlobalDocumentCard({
    id,
    title,
    author,
    date,
    readTime,
    categories,
    imageUrl,
    description = 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Consectetur, adipisci?',
    authorAvatar = '/images/author.png',
    showAuthorInfo = true,
    onClick,
    badgeVariant = 'secondary',
    imageHeight = 150,
}: GlobalDocumentCardProps) {
    return (
        <Card className='overflow-hidden'>
            <div className='cursor-pointer' onClick={onClick}>
                <div className='relative'>
                    <div className='absolute left-2 top-2 z-10 flex flex-wrap gap-1'>
                        {categories.map((category) => (
                            <Badge
                                key={category}
                                variant={badgeVariant}
                                className='bg-white/90 text-xs font-medium rounded-full'
                            >
                                {category}
                            </Badge>
                        ))}
                    </div>
                    <Image
                        src={imageUrl || '/placeholder.svg'}
                        alt={title}
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
                                    <p className='text-sm font-medium text-muted-foreground'>
                                        {author}
                                    </p>
                                    <p className='text-xs text-muted-foreground'>
                                        <time dateTime={date}>{date}</time>
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <p className='text-xs text-muted-foreground'>
                                <time dateTime={date}>{date}</time>
                            </p>
                        )}
                        <div className='flex items-center gap-1 text-xs text-muted-foreground'>
                            <Eye className='h-3 w-3' />
                            <span>{readTime} min read</span>
                        </div>
                    </div>
                    <h3 className='mb-1 line-clamp-2 font-semibold'>{title}</h3>
                    <p className='line-clamp-2 text-sm text-muted-foreground'>
                        {description}
                    </p>
                </CardContent>
                <CardFooter className='border-t border-border p-4 pt-2'>
                    <Button
                        variant='link'
                        className='h-auto p-0 text-xs font-medium text-primary'
                        onClick={(e) => {
                            e.stopPropagation();
                            onClick?.();
                        }}
                    >
                        Read More →
                    </Button>
                </CardFooter>
            </div>
        </Card>
    );
}
