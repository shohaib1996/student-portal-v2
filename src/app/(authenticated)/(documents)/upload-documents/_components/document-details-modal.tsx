'use client';

import {
    ArrowLeft,
    ArrowRight,
    LoaderCircle,
    PencilIcon,
    PencilLine,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlobalDocumentDetailsModal } from '@/components/global/documents/GlobalDocumentDetailsModal';
import DownloadIcon from '@/components/svgs/common/DownloadIcon';
import EditPenIcon from '@/components/svgs/common/EditPenIcon';
import DeleteTrashIcon from '@/components/svgs/common/DeleteTrashIcon';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { EditDocumentModal } from './edit-document-modal';
import {
    useDeleteUserDocumentMutation,
    useGetSingleUpdatedDocumentByIdQuery,
    useGetSingleUploadDocumentQuery,
} from '@/redux/api/documents/documentsApi';
import { DocumentContentArea } from '@/components/global/documents/DocumentContentArea';
import { DocumentSidebar } from '@/components/global/documents/DocumentSider';
import { toast } from 'sonner';
import GlobalDeleteModal from '@/components/global/GlobalDeleteModal';

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
    // documentData?: any;
    mode?: 'view' | 'edit' | 'add';
}

export function DocumentDetailsModal({
    isOpen,
    onClose,
    documentId,
    // documentData,
    mode = 'view',
}: DocumentDetailsProps) {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathName = usePathname();

    // Get document ID from URL if present, otherwise use the prop
    const id = searchParams.get('documentId') || documentId;
    const urlMode = searchParams.get('mode') || mode;

    const [
        deleteUserDocument,
        {
            isLoading: isDeleting,
            isError: isDeleteError,
            isSuccess: isDeleteSuccess,
        },
    ] = useDeleteUserDocumentMutation();

    // Use the appropriate query based on the pathname
    const { data: uploadDocumentData, isLoading: isUploadDocLoading } =
        pathName === '/upload-documents'
            ? useGetSingleUploadDocumentQuery(id || '', {
                  skip: !id,
              })
            : { data: null, isLoading: false };

    const { data: contentDetailsData, isLoading: isContentLoading } =
        pathName !== '/upload-documents'
            ? useGetSingleUpdatedDocumentByIdQuery(id || '', {
                  skip: !id,
              })
            : { data: null, isLoading: false };

    // Determine which data to use
    const apiData =
        pathName === '/upload-documents'
            ? uploadDocumentData
            : contentDetailsData;
    const isLoading = isUploadDocLoading || isContentLoading;

    // Open edit modal automatically if mode is 'edit'
    useEffect(() => {
        if (urlMode === 'edit' && documentId && apiData) {
            setIsEditModalOpen(true);
        }
    }, [urlMode, documentId, apiData]);

    // Format the document data based on its structure
    const formatDocumentData = () => {
        // If on upload-documents page, format data accordingly
        if (pathName === '/upload-documents' && uploadDocumentData) {
            const document = uploadDocumentData.document;
            return {
                title: document?.name || 'Untitled',
                author: document?.user || 'Unknown Author',
                uploadDate: document?.createdAt || new Date().toISOString(),
                lastUpdate: document?.updatedAt || new Date().toISOString(),
                tags: Array.isArray(document?.category)
                    ? document.category
                    : [],
                content: document?.description || '',
                imageUrl:
                    document?.thumbnail ||
                    '/images/documents-and-labs-thumbnail.png',
                attachedFiles: Array.isArray(document?.attachment)
                    ? document.attachment.map((file: any, index: number) => ({
                          id: `file-${index}`,
                          name:
                              typeof file === 'string'
                                  ? file
                                  : file.name || `File ${index}`,
                          type: 'document',
                          size: '1.0 MB',
                      }))
                    : [],
            };
        }

        // For other pages, format accordingly
        if (contentDetailsData) {
            const content = contentDetailsData.document;
            return {
                title: content?.title || content?.name || 'Untitled',
                author: content?.createdBy?.fullName || 'Unknown Author',
                uploadDate: content?.createdAt || new Date().toISOString(),
                lastUpdate: content?.updatedAt || new Date().toISOString(),
                tags: Array.isArray(content?.tags)
                    ? content.tags
                    : Array.isArray(content?.category)
                      ? content.category
                      : [],
                content: content?.content || content?.description || '',
                imageUrl:
                    content?.imageUrl ||
                    content?.thumbnail ||
                    '/images/documents-and-labs-thumbnail.png',
                attachedFiles:
                    content?.attachedFiles ||
                    (Array.isArray(content?.attachment)
                        ? content.attachment.map(
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
                        : []),
            };
        }

        // Default empty document
        return null;
    };

    const content = formatDocumentData();

    // Placeholder tags
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

    const handleEditClick = () => {
        if (id) {
            router.push(`?documentId=${id}&mode=edit`);
            setIsEditModalOpen(true);
        } else {
            setIsEditModalOpen(true);
        }
    };

    const handleEditModalClose = () => {
        if (id) {
            router.push(`?documentId=${id}&mode=view`);
        }
        setIsEditModalOpen(false);
    };

    const handleDelete = async () => {
        try {
            if (!id) {
                return;
            }
            await deleteUserDocument(id).unwrap();
            toast.success('Document successfully deleted!');
            onClose();
        } catch (error) {
            console.error(error);
            toast.error('Failed to delete document');
        }
    };

    // Loading state
    if (isLoading && isOpen) {
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

    // Error or not found state
    if (!content && isOpen) {
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
                        <p className='text-gray-500 mb-4'>
                            {`The document you're looking for doesn't exist or has
                            been removed.`}
                        </p>
                        <Button onClick={onClose}>Go Back</Button>
                    </div>
                </div>
            </GlobalDocumentDetailsModal>
        );
    }

    if (!isOpen || !content) {
        return null;
    }

    // Get document tags for the sidebar

    const documentTags =
        Array.isArray(content.tags) && content.tags.length > 0
            ? content.tags
            : allTags;

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
                                <p className='text-sm text-gray'>
                                    View your documents with ease
                                </p>
                            </div>
                        </div>
                        <div className='flex items-center gap-2'>
                            {/* <Button
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
                            </Button> */}
                            {/* <Button variant='outline' size='sm'>
                                <DownloadIcon className='h-4 w-4' />
                            </Button> */}
                            <Button
                                size='icon'
                                className='text-pure-white'
                                onClick={handleEditClick}
                            >
                                <PencilLine className='h-4 w-4' />
                            </Button>
                            <GlobalDeleteModal
                                deleteFun={deleteUserDocument}
                                _id={id || ''}
                                itemTitle='Document'
                                loading={isDeleting}
                                modalTitle='Delete Document?'
                                modalSubTitle='This action cannot be undone. This will permanently delete your document and remove your data from our servers.'
                                isButton={true}
                            />
                        </div>
                    </div>

                    <div className='flex-1 overflow-y-auto p-4 document-container w-full bg-foreground my-3 rounded-lg'>
                        <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
                            <DocumentContentArea
                                document={content}
                                documentId={id}
                                onCommentSubmit={handleCommentSubmit}
                            />

                            <DocumentSidebar
                                tags={documentTags}
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
                    // documentId={id || ''}
                    defaultValues={{
                        description: content.content,
                        name: content.title,
                        categories: Array.isArray(content.tags)
                            ? content.tags.slice(0, 2)
                            : [],
                        tags: Array.isArray(content.tags)
                            ? content.tags.join(', ')
                            : '',
                        thumbnailUrl: content.imageUrl,
                        attachedFileUrls: Array.isArray(content.attachedFiles)
                            ? content.attachedFiles.map(
                                  (file: {
                                      id: string;
                                      name: string;
                                      type: string;
                                      size: string;
                                  }) => file.name,
                              )
                            : [],
                    }}
                />
            )}
        </>
    );
}
