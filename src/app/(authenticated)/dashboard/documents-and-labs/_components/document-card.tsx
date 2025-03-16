import Link from 'next/link';
import Image from 'next/image';
import { Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

export interface DocumentCardProps {
    id: string;
    title: string;
    author: string;
    date: string;
    readTime: number;
    categories: string[];
    imageUrl: string;
    onClick?: () => void;
}

export function DocumentCard({
    id,
    title,
    author,
    date,
    readTime,
    categories,
    imageUrl,
    onClick,
}: DocumentCardProps) {
    return (
        <Card className='overflow-hidden'>
            <div className='cursor-pointer' onClick={onClick}>
                <div className='relative'>
                    <div className='absolute left-2 top-2 z-10 flex flex-wrap gap-1'>
                        {categories.map((category) => (
                            <Badge
                                key={category}
                                variant='secondary'
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
                        className='h-[150px] w-full object-cover'
                    />
                </div>
                <CardContent className='p-3'>
                    <div className='mb-2 flex items-start justify-between'>
                        <div className='flex items-center gap-1'>
                            <Avatar className='h-5 w-5'>
                                <AvatarImage
                                    src='/images/author.png'
                                    alt={author}
                                />
                                <AvatarFallback>{author}</AvatarFallback>
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
                        <div className='flex items-center gap-1 text-xs text-muted-foreground'>
                            <Eye className='h-3 w-3' />
                            <span>{readTime} min read</span>
                        </div>
                    </div>
                    <h3 className='mb-1 line-clamp-2 font-semibold'>{title}</h3>
                    <p className='line-clamp-2 text-sm text-muted-foreground'>
                        Lorem ipsum dolor sit, amet consectetur adipisicing
                        elit. Consectetur, adipisci?
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
