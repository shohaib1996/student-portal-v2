'use client';

import Image from 'next/image';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GlobalDocumentDetailsModal } from '@/components/global/documents/GlobalDocumentDetailsModal';
import DownloadIcon from '@/components/svgs/common/DownloadIcon';
import EditPenIcon from '@/components/svgs/common/EditPenIcon';
import DeleteTrashIcon from '@/components/svgs/common/DeleteTrashIcon';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { EditDocumentModal } from './edit-document-modal';
import { DocumentContentArea } from '@/components/global/documents/DocumentContentArea';
import { useGetMySingleDocumentQuery } from '@/redux/api/documents/documentsApi';

export interface DocumentDetailsProps {
    isOpen: boolean;
    onClose: () => void;
    documentId: string | null;
    selectedDocument?: any;
}

// Define the document interface
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
    selectedDocument: propDocument,
}: DocumentDetailsProps) {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();

    // Get document ID from URL if present, otherwise use the prop
    const id = searchParams.get('documentId') || documentId;
    const mode = searchParams.get('mode') || 'view';

    // Fetch document from API if we have an ID and it's not provided in props
    const {
        data: apiDocument,
        isLoading,
        error,
    } = useGetMySingleDocumentQuery(id || '', { skip: !id || !!propDocument });

    // Use document from props if available, otherwise use fetched data
    const documentData = propDocument || apiDocument?.document || null;

    // Format document data to match the expected structure for DocumentContentArea
    const document = documentData
        ? {
              id: documentData.id || documentData._id,
              title:
                  documentData.title ||
                  documentData.name ||
                  'Untitled Document',
              author:
                  documentData.author ||
                  documentData.createdBy?.fullName ||
                  'Unknown',
              uploadDate:
                  documentData.uploadDate ||
                  documentData.createdAt ||
                  new Date().toISOString(),
              lastUpdate:
                  documentData.lastUpdate ||
                  documentData.updatedAt ||
                  new Date().toISOString(),
              tags: Array.isArray(documentData.tags)
                  ? documentData.tags
                  : Array.isArray(documentData.category)
                    ? documentData.category
                    : [],
              content: documentData.content || documentData.description || '',
              imageUrl:
                  documentData.imageUrl ||
                  documentData.thumbnail ||
                  '/images/documents-and-labs-thumbnail.png',
              attachedFiles:
                  documentData.attachedFiles ||
                  (documentData.attachment
                      ? Array.isArray(documentData.attachment)
                          ? documentData.attachment.map(
                                (file: any, index: number) => ({
                                    id: `file-${index}`,
                                    name:
                                        typeof file === 'string'
                                            ? file
                                            : file.name || `File ${index}`,
                                    type: 'document',
                                    size: '1.0 MB',
                                }),
                            )
                          : []
                      : []),
          }
        : null;

    // Open edit modal automatically if mode is 'edit'
    useEffect(() => {
        if (mode === 'edit' && isOpen && document) {
            setIsEditModalOpen(true);
        }
    }, [mode, isOpen, document]);

    const handleCommentSubmit = (content: string) => {
        console.log('New comment:', content);
    };

    const handleEditClick = () => {
        if (id) {
            router.push(`?documentId=${id}&mode=edit`);
            setIsEditModalOpen(true);
        }
    };

    const handleEditModalClose = () => {
        if (id) {
            router.push(`?documentId=${id}&mode=view`);
        }
        setIsEditModalOpen(false);
    };

    // All available tags - ensure it's always an array
    const allTags = Array.isArray(documentData?.tags)
        ? documentData.tags
        : Array.isArray(documentData?.category)
          ? documentData.category
          : [];

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

    // Loading state
    if (isLoading) {
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

    // Error state
    if (error && isOpen) {
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
                            Error Loading Document
                        </h3>
                        <p className='text-gray-500 mb-4'>
                            There was a problem loading the document. Please try
                            again later.
                        </p>
                        <Button onClick={onClose}>Go Back</Button>
                    </div>
                </div>
            </GlobalDocumentDetailsModal>
        );
    }

    // Not found state
    if (!document && isOpen) {
        return (
            <GlobalDocumentDetailsModal isOpen={isOpen} onClose={onClose}>
                <div className='flex flex-col items-center justify-center h-full'>
                    <div className='text-red-500 mb-4 w-[70px]'>
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
                    <p className='text-gray-500 mb-4'>
                        {`The document you're looking for doesn't exist or has
                            been removed.`}
                    </p>
                    <Button onClick={onClose}>Go Back</Button>
                </div>
            </GlobalDocumentDetailsModal>
        );
    }

    if (!isOpen || !document) {
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
                                documentId={id}
                                onCommentSubmit={handleCommentSubmit}
                            />

                            {/* Sidebar - 1/3 width on large screens */}
                            <div className='lg:sticky top-20 space-y-3'>
                                {/* Tags section */}
                                <div className='rounded-lg border bg-background p-4 shadow'>
                                    <h3 className='mb-3 text-sm font-medium'>
                                        Tags
                                    </h3>
                                    <div className='flex flex-wrap gap-2'>
                                        {Array.isArray(allTags) &&
                                        allTags.length > 0 ? (
                                            allTags.map((tag, index) => (
                                                <Badge
                                                    key={index}
                                                    variant='outline'
                                                    className='bg-purple-100/20 text-purple-600 rounded-full'
                                                >
                                                    {tag}
                                                </Badge>
                                            ))
                                        ) : (
                                            <span className='text-gray-400 text-sm'>
                                                No tags available
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* New Documents section */}
                                <div className='rounded-lg border bg-background p-4 shadow'>
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
                                                    <p className='line-clamp-2 text-xs text-gray'>
                                                        {doc.excerpt}
                                                    </p>
                                                    <div className='mt-1 flex flex-wrap gap-1'>
                                                        {doc.tags.map(
                                                            (tag, index) => (
                                                                <Badge
                                                                    key={index}
                                                                    variant='outline'
                                                                    className='bg-purple-100/20 text-purple-600 rounded-full px-1 py-0 text-[10px]'
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
                    documentId={id || ''}
                    defaultValues={{
                        description: document.content,
                        name: document.title,
                        categories: document.tags.slice(0, 2), // Assuming 2 categories
                        tags: document.tags.join(', '),
                        thumbnailUrl: document.imageUrl,
                        attachedFileUrls: document.attachedFiles.map(
                            (file: any) => file.name,
                        ),
                    }}
                />
            )}
        </>
    );
}
