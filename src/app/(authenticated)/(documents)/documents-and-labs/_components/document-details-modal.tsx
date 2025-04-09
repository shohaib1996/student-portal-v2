'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, FileText, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GlobalDocumentDetailsModal } from '@/components/global/documents/GlobalDocumentDetailsModal';
import { useGetContentDetailsQuery } from '@/redux/api/documents/documentsApi';
import { DocumentContentArea } from '@/components/global/documents/DocumentContentArea';
import { DocumentSidebar } from '@/components/global/documents/DocumentSider';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

export interface DocumentContent {
    title: string;
    author: string;
    uploadDate: string;
    lastUpdate: string;
    tags: string[];
    content: string;
    imageUrl: string;
    thumbnail?: string;
    user?: string;
    attachedFiles: { id: string; name: string; type: string; size: string }[];
}

export interface DocumentDetailsProps {
    isOpen: boolean;
    onClose: () => void;
    documentId: string | null;
    documentData?: DocumentContent;
    mode?: 'view' | 'edit' | 'add';
}

export function DocumentDetailsModal({
    isOpen,
    onClose,
    documentId,
    documentData,
    mode = 'view',
}: DocumentDetailsProps) {
    // Add router and search params hooks at the top to maintain hooks order
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathName = usePathname();

    // Get document ID from URL if present, otherwise use the prop
    const id = searchParams.get('documentId') || documentId;
    const urlMode = searchParams.get('mode') || mode;

    // Always call hooks at the top level, with skip logic to avoid unnecessary fetching
    const { data, error, isLoading } = useGetContentDetailsQuery(id || '', {
        skip: !id || !!documentData,
    });

    // Handle URL-based modal opening
    useEffect(() => {
        if (urlMode === 'edit' && id) {
            // Handle edit mode logic here if needed
            console.log('Edit mode detected in URL');
        }
    }, [urlMode, id]);

    // Handle loading and error states
    if (!documentData && isLoading && isOpen) {
        return (
            <GlobalDocumentDetailsModal isOpen={isOpen} onClose={onClose}>
                <div className='flex items-center justify-center h-full'>
                    <div className='text-center'>
                        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4'></div>
                        <p>Loading document...</p>
                    </div>
                </div>
            </GlobalDocumentDetailsModal>
        );
    }

    // If neither documentData nor fetched data is available and not loading
    if (!documentData && !data && !isLoading && isOpen) {
        return (
            <GlobalDocumentDetailsModal isOpen={isOpen} onClose={onClose}>
                <div className='flex items-center justify-center h-full'>
                    <div className='text-center'>
                        <div className='text-red-500 mb-4'>
                            <svg
                                xmlns='http://www.w3.org/2000/svg'
                                width='64'
                                height='64'
                                viewBox='0 0 24 24'
                                fill='none'
                                stroke='currentColor'
                                strokeWidth='2'
                                strokeLinecap='round'
                                strokeLinejoin='round'
                            >
                                <circle cx='12' cy='12' r='10'></circle>
                                <line x1='12' y1='8' x2='12' y2='12'></line>
                                <line x1='12' y1='16' x2='12.01' y2='16'></line>
                            </svg>
                        </div>
                        <h3 className='text-xl font-semibold mb-2'>
                            Document Not Found
                        </h3>
                        <p className='text-gray mb-4'>
                            {`The document you're looking for doesn't exist or has
                            been removed.`}
                        </p>
                        <Button onClick={onClose}>Go Back</Button>
                    </div>
                </div>
            </GlobalDocumentDetailsModal>
        );
    }

    if (!isOpen) {
        return null;
    }

    // Process data after all hooks and early returns
    // Use provided documentData if available, otherwise use fetched data
    const content = documentData || {
        title: data?.content?.name || 'Untitled',
        author: data?.content?.createdBy || 'Unknown Author',
        uploadDate: data?.content?.createdAt || new Date().toISOString(),
        lastUpdate: data?.content?.updatedAt || new Date().toISOString(),
        tags: data?.content?.tags || [],
        content: data?.content?.description || '',
        imageUrl: data?.content?.thumbnail || '/placeholder.svg',
        attachedFiles: data?.content?.attachedFiles || [],
    };

    // All available tags
    const allTags = [
        'development',
        'technical test',
        'web development',
        'resources',
        'devops',
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

    return (
        <GlobalDocumentDetailsModal onClose={onClose} isOpen={isOpen}>
            <div className='flex h-full flex-col'>
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
                            Document & Labs Details
                        </h1>
                        <p className='text-sm text-muted-foreground'>
                            View your documents & labs with ease
                        </p>
                    </div>
                    <div className='flex items-center gap-2'>
                        {/* <Button variant='outline' size='sm' className='gap-1'>
                            <ArrowLeft className='h-4 w-4' />
                            <span>Previous</span>
                        </Button>
                        <Button variant='outline' size='sm' className='gap-1'>
                            <span>Next</span>
                            <ArrowRight className='h-4 w-4' />
                        </Button> */}
                        <Button size='sm' className='gap-1' onClick={onClose}>
                            <span>Back to Docs</span>
                            <ArrowRight className='h-4 w-4' />
                        </Button>
                        {/* <Button
                            variant='ghost'
                            size='icon'
                            onClick={onClose}
                            className='ml-2'
                        >
                            <X className='h-4 w-4' />
                            <span className='sr-only'>Close</span>
                        </Button> */}
                    </div>
                </div>

                {/* Main content */}
                <div className='flex-1 overflow-y-auto p-4 document-container bg-foreground my-3 rounded-lg'>
                    <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
                        <DocumentContentArea
                            document={content}
                            documentId={id}
                            onCommentSubmit={handleCommentSubmit}
                            isLab={true}
                        />

                        <DocumentSidebar
                            tags={allTags}
                            relatedDocuments={relatedDocuments}
                        />
                    </div>
                </div>
            </div>
        </GlobalDocumentDetailsModal>
    );
}
