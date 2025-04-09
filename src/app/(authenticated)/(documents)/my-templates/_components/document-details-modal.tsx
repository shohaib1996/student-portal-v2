'use client';

import Image from 'next/image';
import { ArrowLeft, ArrowRight, FileText, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GlobalDocumentDetailsModal } from '@/components/global/documents/GlobalDocumentDetailsModal';
import {
    useGetContentDetailsQuery,
    useGetMyTemplatesQuery,
    useGetTemplateDetailsQuery,
} from '@/redux/api/documents/documentsApi';
import { DocumentContentArea } from '@/components/global/documents/DocumentContentArea';
import { DocumentSidebar } from '@/components/global/documents/DocumentSider';
import { useRouter, useSearchParams } from 'next/navigation';

export interface DocumentContent {
    title: string;
    author: string;
    uploadDate: string;
    lastUpdate: string;
    tags: string[];
    content: string;
    imageUrl: string;
    user?: string;
    attachedFiles: { id: string; name: string; type: string; size: string }[];
}

export interface DocumentDetailsProps {
    isOpen: boolean;
    onClose: () => void;
    documentId: string | null;
    documentData?: DocumentContent;
}

export function DocumentDetailsModal({
    isOpen,
    onClose,
    documentId,
    documentData,
}: DocumentDetailsProps) {
    // Only fetch data if documentData is not provided and documentId exists
    const router = useRouter();
    const searchParams = useSearchParams();

    // Get document ID from URL if present, otherwise use the prop
    const id = searchParams.get('documentId') || documentId;
    const mode = searchParams.get('mode') || 'view';

    // Fetch document from API if we have an ID and it's not provided in props
    const { data, isLoading, error } = useGetTemplateDetailsQuery(id || '', {
        skip: !id,
    });

    console.log({ TemplateDetails: data });
    // Handle loading and error states
    if (!documentData && isLoading) {
        return <div>Loading...</div>;
    }

    if (!documentData && error) {
        return <div>Something went wrong!</div>;
    }

    // Use provided documentData if available, otherwise use fetched data
    const content = documentData || {
        title: data?.template?.title || 'Untitled',
        author: data?.template?.createdBy || 'Unknown Author',
        uploadDate: data?.template?.createdAt || '',
        lastUpdate: data?.template?.updatedAt || '',
        tags: data?.template?.tags || [],
        content: data?.template?.description || '',
        imageUrl: data?.template?.thumbnail || '/placeholder.svg',
        attachedFiles: data?.template?.attachments || [],
        category: data?.template?.category || '',
        createdBy: data?.template?.createdBy || '',
        isActive: data?.template?.isActive || false,
        programs: data?.template?.programs || [],
        sessions: data?.template?.sessions || [],
        users: data?.template?.users || [],
    };

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

    // If neither documentData nor fetched data is available
    if (!documentData && !data && !isLoading) {
        return '';
    }

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
                            Template Document Details
                        </h1>
                        <p className='text-sm text-muted-foreground'>
                            View your template documents with ease
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
                        <Button
                            variant='secondary'
                            size='sm'
                            className='gap-1'
                            onClick={onClose}
                        >
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
                            documentId={documentId}
                            onCommentSubmit={handleCommentSubmit}
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
