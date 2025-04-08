'use client';

import { ArrowLeft, ArrowRight, LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlobalDocumentDetailsModal } from '@/components/global/documents/GlobalDocumentDetailsModal';
import DownloadIcon from '@/components/svgs/common/DownloadIcon';
import EditPenIcon from '@/components/svgs/common/EditPenIcon';
import DeleteTrashIcon from '@/components/svgs/common/DeleteTrashIcon';
import { useState } from 'react';
import { EditDocumentModal } from './edit-document-modal';
import {
    useDeleteUserDocumentMutation,
    useGetContentDetailsQuery,
} from '@/redux/api/documents/documentsApi';
import { DocumentContentArea } from '@/components/global/documents/DocumentContentArea';
import { DocumentSidebar } from '@/components/global/documents/DocumentSider';
import { toast } from 'sonner';

export interface DocumentContent {
    title: string;
    author: string;
    uploadDate: string;
    lastUpdate: string;
    tags: string[];
    content: string;
    imageUrl: string;
    attachedFiles: { id: string; name: string; type: string; size: string }[];
}

export interface DocumentDetailsProps {
    isOpen: boolean;
    onClose: () => void;
    documentId: string | null;
    documentData?: any;
}

export function DocumentDetailsModal({
    isOpen,
    onClose,
    documentId,
    documentData,
}: DocumentDetailsProps) {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [
        deleteUserDocument,
        {
            isLoading: isDeleteing,
            isError: isDeleteError,
            isSuccess: isDeleteSuccess,
            data: deletedData,
        },
    ] = useDeleteUserDocumentMutation();

    // Only fetch data if documentData is not provided and documentId exists
    const { data, error, isLoading } = documentData
        ? { data: null, error: null, isLoading: false }
        : useGetContentDetailsQuery(documentId || '');

    // Handle loading and error states
    if (!documentData && isLoading) {
        return <div>Loading...</div>;
    }

    if (!documentData && error) {
        return <div>Something went wrong!</div>;
    }

    // Use provided documentData if available, otherwise use fetched data
    const content = documentData || {
        title: data?.content?.name || 'Untitled',
        author: data?.content?.createdBy || 'Unknown Author',
        uploadDate: data?.content?.createdAt || new Date().toISOString(),
        lastUpdate: data?.content?.updatedAt || new Date().toISOString(),
        tags: data?.content?.tags || [],
        content:
            data?.content?.description || 'description is one the way of home',
        imageUrl:
            data?.content?.thumbnail ||
            '/images/documents-and-labs-thumbnail.png',
        attachedFiles: data?.content?.attachedFiles || [],
    };

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

    const handleEditClick = () => {
        setIsEditModalOpen(true);
    };

    const handleEditModalClose = () => {
        setIsEditModalOpen(false);
    };

    const handleDelete = async () => {
        try {
            await deleteUserDocument(documentId || '').unwrap();
            if (isDeleteSuccess) {
                toast.success('Document successfully deleted!');

                onClose();
            }
        } catch (error) {
            console.error(error);
        }
    };

    // If neither documentData nor fetched data is available
    if (!documentData && !data && !isLoading) {
        return null;
    }

    return (
        <>
            <GlobalDocumentDetailsModal isOpen={isOpen} onClose={onClose}>
                <div className='flex h-full flex-col'>
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
                            <Button
                                variant='outline'
                                size='sm'
                                onClick={handleDelete}
                                disabled={isDeleteing || !documentId}
                            >
                                {isDeleteing ? (
                                    <LoaderCircle className='h-4 w-4 animate-spin' />
                                ) : (
                                    <DeleteTrashIcon className='h-4 w-4' />
                                )}
                            </Button>
                        </div>
                    </div>

                    <div className='flex-1 overflow-y-auto p-4 document-container w-full bg-foreground my-3 rounded-lg'>
                        <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
                            <DocumentContentArea
                                document={content}
                                documentId={documentId}
                                onCommentSubmit={handleCommentSubmit}
                            />

                            <DocumentSidebar
                                tags={data?.content?.tags || allTags}
                                relatedDocuments={relatedDocuments}
                            />
                        </div>
                    </div>
                </div>
            </GlobalDocumentDetailsModal>

            {/* Edit Modal */}
            {content && (
                <EditDocumentModal
                    isOpen={isEditModalOpen}
                    onClose={handleEditModalClose}
                    defaultValues={{
                        description: content.content,
                        name: content.title,
                        categories: content.tags.slice(0, 2),
                        tags: content.tags.join(', '),
                        thumbnailUrl: content.imageUrl,
                        attachedFileUrls: content.attachedFiles.map(
                            (file: {
                                id: string;
                                name: string;
                                type: string;
                                size: string;
                            }) => file.name,
                        ),
                    }}
                />
            )}
        </>
    );
}
