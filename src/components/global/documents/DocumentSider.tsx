'use client';

import Image from 'next/image';
import { Badge } from '@/components/ui/badge';

interface RelatedDocument {
    id: string;
    title: string;
    excerpt: string;
    tags: string[];
    imageUrl: string;
    readTime: number;
}

interface DocumentSidebarProps {
    tags: string[];
    relatedDocuments: RelatedDocument[];
}

export function DocumentSidebar({
    tags,
    relatedDocuments,
}: DocumentSidebarProps) {
    return (
        <div className='lg:sticky top-20 space-y-3'>
            {/* Tags section */}
            <div className='rounded-lg border bg-background p-4 shadow'>
                <h3 className='mb-3 text-sm font-medium'>Tags</h3>
                <div className='flex flex-wrap gap-2'>
                    {tags.map((tag, index) => (
                        <Badge
                            key={index}
                            variant='outline'
                            className='bg-purple-500/20 backdrop-blur-2xl text-purple-500 rounded-full'
                        >
                            {tag}
                        </Badge>
                    ))}
                </div>
            </div>

            {/* New Documents section */}
            <div className='rounded-lg border bg-background p-4 shadow'>
                <h3 className='mb-3 text-sm font-medium'>New Documents</h3>
                <div className='space-y-4'>
                    {relatedDocuments.map((doc) => (
                        <div key={doc.id} className='flex gap-3'>
                            <div className='relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-md border'>
                                <Image
                                    src={doc.imageUrl || '/placeholder.svg'}
                                    alt={doc.title}
                                    fill
                                    className='object-cover'
                                />
                                <div className='absolute left-1 top-1 rounded bg-amber-500 px-1 py-0.5 text-[10px] font-medium text-white'>
                                    {doc.readTime} min
                                </div>
                            </div>
                            <div className='flex-1'>
                                <h4 className='line-clamp-1 text-sm font-medium'>
                                    {doc.title}
                                </h4>
                                <p className='line-clamp-2 text-xs text-muted-foreground'>
                                    {doc.excerpt}
                                </p>
                                <div className='mt-1 flex flex-wrap gap-1'>
                                    {doc.tags.map((tag, index) => (
                                        <Badge
                                            key={index}
                                            variant='outline'
                                            className='bg-purple-500/20 backdrop-blur-2xl text-purple-500 rounded-full px-1 py-0 text-[10px]'
                                        >
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
