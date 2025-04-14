'use client';

import Image from 'next/image';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlobalDocumentDetailsModal } from '@/components/global/documents/GlobalDocumentDetailsModal';
import { useGetTemplateDetailsQuery } from '@/redux/api/documents/documentsApi';
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
    attachedFiles: { id: string; name: string; type: string; size: string }[];
    category?: string;
    createdBy?: string;
    isActive?: boolean;
    programs?: any[];
    sessions?: any[];
    users?: any[];
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
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get('documentId') || documentId;
    const mode = searchParams.get('mode') || 'view';

    // Fetch document data if not provided
    const { data, isLoading, error } = useGetTemplateDetailsQuery(id || '', {
        skip: !id || !!documentData,
    });

    // Handle loading state
    if (!documentData && isLoading) {
        return (
            <GlobalDocumentDetailsModal isOpen={isOpen} onClose={onClose}>
                <div className='flex h-full items-center justify-center'>
                    Loading...
                </div>
            </GlobalDocumentDetailsModal>
        );
    }

    // Handle error state
    if (!documentData && error) {
        return (
            <GlobalDocumentDetailsModal isOpen={isOpen} onClose={onClose}>
                <div className='flex h-full items-center justify-center text-red-500'>
                    Something went wrong!
                </div>
            </GlobalDocumentDetailsModal>
        );
    }

    // Use provided data or fetched data
    const documentContent: DocumentContent = documentData || {
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

    // Static tags for sidebar
    const availableTags = [
        'development',
        'devops',
        'technical test',
        'web development',
        'resources',
    ];

    // Mock related documents
    const relatedDocs = Array.from({ length: 5 }, (_, index) => ({
        id: `doc-${index + 1}`,
        title: 'Test Document - For Upload File',
        excerpt:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla facilis...',
        tags: ['development', 'technical'],
        imageUrl: '/images/documents-and-labs-thumbnail.png',
        readTime: 12,
    }));

    // Handle empty state
    if (!isOpen || (!documentData && !data && !isLoading)) {
        return null;
    }

    return (
        <GlobalDocumentDetailsModal isOpen={isOpen} onClose={onClose}>
            <div className='flex h-full flex-col'>
                {/* Header */}
                <div className='sticky top-0 z-10 flex items-center justify-between gap-3 border-b bg-background p-3'>
                    <div>
                        <h1 className='flex items-center gap-2 text-lg font-semibold lg:text-xl'>
                            <Button
                                variant='ghost'
                                size='icon'
                                onClick={onClose}
                                className='p-0'
                            >
                                <ArrowLeft className='h-4 w-4' />
                                <span className='sr-only'>Back</span>
                            </Button>
                            Template Document Details
                        </h1>
                        <p className='text-xs text-muted-foreground lg:text-sm'>
                            Easily view your template documents
                        </p>
                    </div>
                    <Button
                        variant='secondary'
                        size='sm'
                        className='flex items-center gap-1'
                        onClick={onClose}
                    >
                        Back to Docs
                        <ArrowRight className='h-4 w-4' />
                    </Button>
                </div>

                {/* Content */}
                <div className='flex-1 overflow-y-auto rounded-lg bg-foreground p-4 my-3'>
                    <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
                        <DocumentContentArea
                            document={documentContent}
                            documentId={id}
                        />
                        <DocumentSidebar
                            tags={availableTags}
                            relatedDocuments={relatedDocs}
                        />
                    </div>
                </div>
            </div>
        </GlobalDocumentDetailsModal>
    );
}
