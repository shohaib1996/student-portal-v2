'use client';

import Image from 'next/image';

import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GlobalDocumentDetailsModal } from '@/components/global/documents/GlobalDocumentDetailsModal';
import DownloadIcon from '@/components/svgs/common/DownloadIcon';
import EditPenIcon from '@/components/svgs/common/EditPenIcon';
import DeleteTrashIcon from '@/components/svgs/common/DeleteTrashIcon';
import { useState } from 'react';
import { EditDocumentModal } from './edit-document-modal';
import { DocumentContentArea } from '@/components/global/documents/DocumentContentArea';

export interface DocumentDetailsProps {
    isOpen: boolean;
    onClose: () => void;
    documentId: string | null;
    selectedDocument?: any;
}

// // Define the document interface
export interface Document {
    id: string;
    title: string;
    author: string;
    uploadDate: string;
    lastUpdate: string;
    tags: string[];
    content: string;
    imageUrl: string;
    attachedFiles: { id: string; name: string; type: string; size: string }[];
    comments: {
        id: string;
        author: string;
        avatar: string;
        time: string;
        content: string;
        additionalText?: string;
        likes: number;
        replies: number;
    }[];
}

export function DocumentDetailsModal({
    isOpen,
    onClose,
    documentId,
    selectedDocument,
}: DocumentDetailsProps) {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    console.log({ selectedDocument });

    // Mock document data - in a real app, you would fetch this based on documentId
    const document: Document | null = documentId
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

    const handleEditClick = () => {
        setIsEditModalOpen(true);
    };

    const handleEditModalClose = () => {
        setIsEditModalOpen(false);
    };

    if (!document) {
        return null;
    }

    return (
        <>
            <GlobalDocumentDetailsModal isOpen={isOpen} onClose={onClose}>
                <div className='flex h-full flex-col'>
                    {/* Header with navigation */}
                    <div className='sticky top-0 z-10 flex items-center justify-between border-b bg-background p-4'>
                        <div className='flex items-center gap-2'>
                            <div>
                                <h1 className='text-xl font-semibold flex gap-1 items-center'>
                                    <Button
                                        variant='ghost'
                                        size='icon'
                                        onClick={onClose}
                                        className='px-0 py-0 h-auto w-auto'
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
                        </div>
                        <div className='flex items-center gap-2'>
                            <Button
                                variant='default'
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
                            <Button variant='outline' size='sm'>
                                <DownloadIcon className='h-4 w-4' />
                            </Button>
                            <Button
                                variant='outline'
                                size='sm'
                                onClick={handleEditClick}
                            >
                                <EditPenIcon className='h-4 w-4' />
                            </Button>
                            <Button variant='outline' size='sm'>
                                <DeleteTrashIcon className='h-4 w-4' />
                            </Button>
                        </div>
                    </div>

                    {/* Main content */}
                    <div className='flex-1 overflow-y-auto p-4 document-container bg-foreground my-3 rounded-lg'>
                        {/* Main content with sidebar */}
                        <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
                            {/* Main content area - 2/3 width on large screens */}
                            <DocumentContentArea
                                document={document}
                                documentId={documentId}
                                onCommentSubmit={handleCommentSubmit}
                            />

                            {/* Sidebar - 1/3 width on large screens */}
                            <div className='lg:sticky top-20 space-y-3'>
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

            {/* Edit Modal */}
            {document && (
                <EditDocumentModal
                    isOpen={isEditModalOpen}
                    onClose={handleEditModalClose}
                    defaultValues={{
                        description: document.content,
                        name: document.title,
                        categories: document.tags.slice(0, 2), // Assuming 2 categories
                        tags: document.tags.join(', '),
                        thumbnailUrl: document.imageUrl,
                        attachedFileUrls: document.attachedFiles.map(
                            (file) => file.name,
                        ),
                    }}
                />
            )}
        </>
    );
}
