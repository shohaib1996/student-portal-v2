'use client';

import Image from 'next/image';
import { ArrowLeft, ArrowRight, FileText, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GlobalAttachedFilesSection } from '@/components/global/GlobalAttachedFilesSection';
import { GlobalCommentsSection } from '@/components/global/GlobalCommentSection';
import { GlobalDocumentDetailsModal } from '@/components/global/documents/GlobalDocumentDetailsModal';
import { GlobalDetailsBanner } from '@/components/global/documents/GlobalDetailsBanner';
import { useGetContentDetailsQuery } from '@/redux/api/documents/documentsApi';

export interface DocumentDetailsProps {
    isOpen: boolean;
    onClose: () => void;
    documentId: string | null;
}

export function DocumentDetailsModal({
    isOpen,
    onClose,
    documentId,
}: DocumentDetailsProps) {
    const { data, error, isLoading } = useGetContentDetailsQuery(
        documentId || '',
    );

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Something went wrong!</div>;
    }

    const content = data?.content;
    const {
        name,
        description,
        tags,
        createdAt,
        updatedAt,
        createdBy,
        thumbnail,
    } = content || {};

    // All available tags
    const allTags = [
        'development',
        'development',
        'development',
        'devops',
        'technical test',
        'web development',
        'resources',
        'devops',
        'technical test',
        'web development',
    ];

    // Related documents
    const relatedDocuments = Array.from({ length: 5 }, (_, i) => ({
        id: `doc-${i + 1}`,
        title: 'Test Document - For Upload File',
        excerpt:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla facilis...',
        tags: ['development', 'technical', 'development'],
        imageUrl: '/images/documents-and-labs-thumbnail.png',
        readTime: 12,
    }));

    const handleCommentSubmit = (content: string) => {
        console.log('New comment:', content);
    };

    if (!data) {
        return 'not found';
    }

    return (
        <GlobalDocumentDetailsModal onClose={onClose} isOpen={isOpen}>
            <div className='flex h-full flex-col'>
                {/* Header with navigation */}
                <div className='sticky top-0 z-10 flex items-center justify-between border-b bg-background p-4'>
                    <div>
                        <h1 className='flex items-center gap-1 text-xl font-semibold'>
                            <Button
                                variant='ghost'
                                size='icon'
                                onClick={onClose}
                                className='h-auto w-auto p-0'
                            >
                                <ArrowLeft className='h-4 w-4' />
                                <span className='sr-only'>Back</span>
                            </Button>
                            Document Details
                        </h1>
                        <p className='text-sm text-muted-foreground'>
                            View your documents with ease
                        </p>
                    </div>
                    <div className='flex items-center gap-2'>
                        <Button variant='outline' size='sm' className='gap-1'>
                            <ArrowLeft className='h-4 w-4' />
                            <span>Previous</span>
                        </Button>
                        <Button variant='outline' size='sm' className='gap-1'>
                            <span>Next</span>
                            <ArrowRight className='h-4 w-4' />
                        </Button>
                        <Button
                            variant='outline'
                            size='sm'
                            className='gap-1'
                            onClick={onClose}
                        >
                            <span>Back to Docs</span>
                            <ArrowRight className='h-4 w-4' />
                        </Button>
                        <Button
                            variant='ghost'
                            size='icon'
                            onClick={onClose}
                            className='ml-2'
                        >
                            <X className='h-4 w-4' />
                            <span className='sr-only'>Close</span>
                        </Button>
                    </div>
                </div>

                {/* Main content */}
                <div className='flex-1 overflow-y-auto p-4 document-container bg-foreground my-3 rounded-lg'>
                    {/* Main content with sidebar */}
                    <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
                        {/* Main content area - 2/3 width on large screens */}
                        <div className='lg:col-span-2'>
                            {/* Document image with overlay title */}
                            <GlobalDetailsBanner
                                title={name || 'Title'}
                                author={createdBy || 'Author'}
                                uploadDate={createdAt || ''}
                                lastUpdate={updatedAt || ''}
                                tags={tags || []}
                                imageUrl={
                                    thumbnail ||
                                    '/images/documents-and-labs-thumbnail.png'
                                }
                            />

                            {/* Document content */}
                            <div className=''>
                                <Tabs defaultValue='documents'>
                                    <TabsList className='bg-background'>
                                        <TabsTrigger
                                            value='documents'
                                            className='gap-2 data-[state=active]:bg-primary'
                                        >
                                            <FileText className='h-4 w-4' />
                                            Documents
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value='slide'
                                            className='gap-2 data-[state=active]:bg-primary'
                                        >
                                            <FileText className='h-4 w-4' />
                                            Slide
                                        </TabsTrigger>
                                    </TabsList>
                                    <TabsContent value='documents' className=''>
                                        {/* <div className='space-y-4'>
                                            <p className='text-sm text-muted-foreground'>
                                                {document.content}
                                            </p>

                                            <div className='space-y-2'>
                                                <ul className='ml-6 list-disc space-y-2 text-sm text-muted-foreground'>
                                                    {bulletPoints.map(
                                                        (point, index) => (
                                                            <li key={index}>
                                                                {point}
                                                            </li>
                                                        ),
                                                    )}
                                                </ul>
                                            </div>

                                            <p className='text-sm text-muted-foreground'>
                                                {document.content}
                                            </p>
                                            <p className='text-sm text-muted-foreground'>
                                                Excepteur sint occaecat
                                                cupidatat non proident, sunt in
                                                culpa qui officia deserunt
                                                mollit anim id est laborum
                                                Excepteur sint occaecat
                                                cupidatat non proident, sunt in
                                                culpa qui officia deserunt
                                                mollit anim id est laborum
                                                Excepteur sint occaecat
                                                cupidatat non proident, sunt in
                                                culpa qui officia deserunt
                                                mollit anim id est laborum
                                                Excepteur sint occaecat
                                                cupidatat non proident, sunt in
                                            </p>
                                        </div> */}

                                        <div className='pt-2'>
                                            {description}
                                        </div>

                                        {/* Attached files */}
                                        <GlobalAttachedFilesSection
                                            files={[]}
                                        />

                                        {/* Comments section */}
                                        <GlobalCommentsSection
                                            documentId={documentId || ''}
                                            onCommentSubmit={
                                                handleCommentSubmit
                                            }
                                        />
                                    </TabsContent>
                                    <TabsContent value='slide'>
                                        <div className='flex h-40 items-center justify-center rounded-md border border-dashed p-4'>
                                            <p className='text-sm text-muted-foreground'>
                                                Slide content would appear here
                                            </p>
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </div>
                        </div>

                        {/* Sidebar - 1/3 width on large screens */}
                        <div className='space-y-3'>
                            {/* Tags section */}
                            <div className='rounded-lg border bg-card p-4 shadow'>
                                <h3 className='mb-3 text-sm font-medium'>
                                    Tags
                                </h3>
                                <div className='flex flex-wrap gap-2'>
                                    {allTags.map((tag, index) => (
                                        <Badge
                                            key={index}
                                            variant='outline'
                                            className='bg-violet-100/50 text-violet-500 rounded-full'
                                        >
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            {/* New Documents section */}
                            <div className='rounded-lg border bg-card p-4 shadow'>
                                <h3 className='mb-3 text-sm font-medium'>
                                    New Documents
                                </h3>
                                <div className='space-y-4'>
                                    {relatedDocuments.map((doc) => (
                                        <div
                                            key={doc.id}
                                            className='flex gap-3'
                                        >
                                            <div className='relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-md border'>
                                                <Image
                                                    src={
                                                        doc.imageUrl ||
                                                        '/placeholder.svg'
                                                    }
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
                                                    {doc.tags.map(
                                                        (tag, index) => (
                                                            <Badge
                                                                key={index}
                                                                variant='outline'
                                                                className='bg-violet-100/50 text-violet-500 rounded-full px-1 py-0 text-[10px]'
                                                            >
                                                                {tag}
                                                            </Badge>
                                                        ),
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </GlobalDocumentDetailsModal>
    );
}
