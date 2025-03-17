'use client';
import Image from 'next/image';
import {
    ArrowLeft,
    ArrowRight,
    Calendar,
    FileText,
    Heart,
    MessageSquare,
    MoreVertical,
    Send,
    Smile,
    Upload,
    X,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { GlobalAttachedFilesSection } from '@/components/global/GlobalAttachedFilesSection';
import { GlobalCommentsSection } from '@/components/global/GlobalCommentSection';

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
    // Mock document data - in a real app, you would fetch this based on documentId
    const document = documentId
        ? {
              id: documentId,
              title: 'Test Document - For Upload File',
              author: 'John Doe',
              uploadDate: 'Jan 20, 2024 | 12:30 PM',
              lastUpdate: 'Jan 20, 2024 | 12:30 PM',
              tags: ['development', 'technical test', 'web development'],
              content: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla facilisi. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.

Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum`,
              imageUrl: '/images/documents-and-labs-thumbnail.png',
              attachedFiles: [
                  {
                      id: 'file-1',
                      name: 'ab-bg-Groups.jpg',
                      type: 'image',
                      size: '1.2 MB',
                  },
                  {
                      id: 'file-2',
                      name: 'Group - Image 2023',
                      type: 'image',
                      size: '0.8 MB',
                  },
              ],
              comments: [
                  {
                      id: 'comment-1',
                      author: 'John Doe',
                      avatar: '/images/author.png',
                      time: '10:00 PM',
                      content:
                          "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard du",
                      additionalText: 'How are you? I hope you are doing well.',
                      likes: 20,
                      replies: 2,
                  },
                  {
                      id: 'comment-2',
                      author: 'Brooklyn Simmons',
                      avatar: '/placeholder.svg?height=40&width=40',
                      time: '10:00 PM',
                      content: 'Excellent! I really appreciate you.',
                      likes: 20,
                      replies: 0,
                  },
              ],
          }
        : null;

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

    // Bullet points for the document
    const bulletPoints = [
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        'Nulla facilisi, sed ut perspiciatis unde omnis error.',
        'Accusantium doloremque laudantium, totam rem aperiam.',
        'Ut enim ad minim veniam, quis nostrud exercitation ullamco.',
        'Duis aute irure dolor in reprehenderit in voluptate velit esse.',
    ];

    const handleCommentSubmit = (content: string) => {
        console.log('New comment:', content);
    };

    if (!document) {
        return null;
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className='h-screen w-screen overflow-y-auto p-0 sm:max-w-[95vw]'>
                <div className='flex h-full flex-col'>
                    {/* Header with navigation */}
                    <div className='sticky top-0 z-10 flex items-center justify-between border-b bg-background p-4'>
                        <div className='flex items-center gap-2'>
                            <Button
                                variant='outline'
                                size='icon'
                                onClick={onClose}
                            >
                                <ArrowLeft className='h-4 w-4' />
                                <span className='sr-only'>Back</span>
                            </Button>
                            <div>
                                <h1 className='text-xl font-semibold'>
                                    Document Details
                                </h1>
                                <p className='text-sm text-muted-foreground'>
                                    View your documents with ease
                                </p>
                            </div>
                        </div>
                        <div className='flex items-center gap-2'>
                            <Button
                                variant='outline'
                                size='sm'
                                className='gap-1'
                            >
                                <ArrowLeft className='h-4 w-4' />
                                <span>Previous</span>
                            </Button>
                            <Button
                                variant='outline'
                                size='sm'
                                className='gap-1'
                            >
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
                    <div className='flex-1 overflow-y-auto p-4 document-container'>
                        {/* Main content with sidebar */}
                        <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
                            {/* Main content area - 2/3 width on large screens */}
                            <div className='lg:col-span-2'>
                                {/* Document image with overlay title */}
                                <div className='relative mb-4 overflow-hidden rounded-lg border'>
                                    <Image
                                        src={
                                            document.imageUrl ||
                                            '/images/documents-and-labs-thumbnail.png'
                                        }
                                        alt={document.title}
                                        width={800}
                                        height={400}
                                        className='h-auto w-full object-cover'
                                    />
                                    <div className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white'>
                                        <h2 className='text-2xl font-bold'>
                                            {document.title}
                                        </h2>
                                        <div className='mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm'>
                                            <div className='flex items-center gap-1'>
                                                <Avatar className='h-5 w-5'>
                                                    <AvatarImage
                                                        src='/placeholder.svg?height=20&width=20'
                                                        alt={document.author}
                                                    />
                                                    <AvatarFallback>
                                                        {document.author[0]}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span>{document.author}</span>
                                            </div>
                                            <div className='flex items-center gap-1'>
                                                <Upload className='h-4 w-4' />
                                                <span>
                                                    Uploaded:{' '}
                                                    {document.uploadDate}
                                                </span>
                                            </div>
                                            <div className='flex items-center gap-1'>
                                                <Calendar className='h-4 w-4' />
                                                <span>
                                                    Last Update:{' '}
                                                    {document.lastUpdate}
                                                </span>
                                            </div>
                                        </div>
                                        <div className='mt-2 flex flex-wrap gap-1'>
                                            {document.tags.map((tag, index) => (
                                                <Badge
                                                    key={index}
                                                    variant='secondary'
                                                    className='bg-white/20 hover:bg-white/30'
                                                >
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Document content */}
                                <div className='rounded-lg border bg-card shadow'>
                                    <Tabs defaultValue='documents'>
                                        <TabsList className='border-b px-4'>
                                            <TabsTrigger
                                                value='documents'
                                                className='gap-2 data-[state=active]:bg-transparent'
                                            >
                                                <FileText className='h-4 w-4' />
                                                Documents
                                            </TabsTrigger>
                                            <TabsTrigger
                                                value='slide'
                                                className='gap-2 data-[state=active]:bg-transparent'
                                            >
                                                <FileText className='h-4 w-4' />
                                                Slide
                                            </TabsTrigger>
                                        </TabsList>
                                        <TabsContent
                                            value='documents'
                                            className='p-4'
                                        >
                                            <div className='space-y-4'>
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
                                                    cupidatat non proident, sunt
                                                    in culpa qui officia
                                                    deserunt mollit anim id est
                                                    laborum Excepteur sint
                                                    occaecat cupidatat non
                                                    proident, sunt in culpa qui
                                                    officia deserunt mollit anim
                                                    id est laborum Excepteur
                                                    sint occaecat cupidatat non
                                                    proident, sunt in culpa qui
                                                    officia deserunt mollit anim
                                                    id est laborum Excepteur
                                                    sint occaecat cupidatat non
                                                    proident, sunt in
                                                </p>
                                            </div>

                                            {/* Attached files */}
                                            {/* <div className='mt-6 border-t pt-4'>
                                                <h3 className='mb-3 text-sm font-medium'>
                                                    Attached Files (
                                                    {
                                                        document.attachedFiles
                                                            .length
                                                    }
                                                    )
                                                </h3>
                                                <div className='flex flex-wrap gap-4'>
                                                    {document.attachedFiles.map(
                                                        (file) => (
                                                            <div
                                                                key={file.id}
                                                                className='flex items-center gap-2 rounded-md border bg-muted/40 p-2 text-sm'
                                                            >
                                                                <div className='flex h-8 w-8 items-center justify-center rounded bg-muted'>
                                                                    <FileText className='h-4 w-4 text-muted-foreground' />
                                                                </div>
                                                                <div>
                                                                    <p className='text-xs font-medium'>
                                                                        {
                                                                            file.name
                                                                        }
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        ),
                                                    )}
                                                </div>
                                            </div> */}
                                            <GlobalAttachedFilesSection
                                                files={document.attachedFiles}
                                            />

                                            {/* Comments section */}
                                            <GlobalCommentsSection
                                                comments={document.comments}
                                                onCommentSubmit={
                                                    handleCommentSubmit
                                                }
                                            />
                                        </TabsContent>
                                        <TabsContent value='slide'>
                                            <div className='flex h-40 items-center justify-center rounded-md border border-dashed p-4'>
                                                <p className='text-sm text-muted-foreground'>
                                                    Slide content would appear
                                                    here
                                                </p>
                                            </div>
                                        </TabsContent>
                                    </Tabs>
                                </div>
                            </div>

                            {/* Sidebar - 1/3 width on large screens */}
                            <div className='space-y-6'>
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
            </DialogContent>
        </Dialog>
    );
}
