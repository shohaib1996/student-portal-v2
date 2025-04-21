'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
    ArrowLeft,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Clock,
    Download,
    Eye,
    FileIcon,
    PencilLine,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GlobalDocumentDetailsModal } from '@/components/global/documents/GlobalDocumentDetailsModal';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { renderText } from '@/components/lexicalEditor/renderer/renderText';
import GlobalComment from '@/components/global/GlobalComments/GlobalComment';
import { Card, CardContent } from '@/components/ui/card';
import dayjs from 'dayjs';
import { toast } from 'sonner';
import GlobalDeleteModal from '@/components/global/GlobalDeleteModal';
import {
    useDeleteUserDocumentMutation,
    useGetSingleUpdatedDocumentByIdQuery,
    useGetSingleUploadDocumentQuery,
} from '@/redux/api/documents/documentsApi';
import { EditDocumentModal } from './edit-document-modal';

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
    mode?: 'view' | 'edit' | 'add';
    relatedDocuments?: any[];
}

export function UploadedDocumentDetailsModal({
    isOpen,
    onClose,
    documentId,
    mode = 'view',
    relatedDocuments,
}: DocumentDetailsProps) {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [activeSection, setActiveSection] = useState<string>('');
    const contentRef = useRef<HTMLDivElement>(null);
    const commentsRef = useRef<HTMLDivElement>(null);
    const [isSidebarSticky, setIsSidebarSticky] = useState(true);
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
        useGetSingleUploadDocumentQuery(id || '', {
            skip: !id || pathName !== '/upload-documents',
        });

    const { data: contentDetailsData, isLoading: isContentLoading } =
        useGetSingleUpdatedDocumentByIdQuery(id || '', {
            skip: !id || pathName === '/upload-documents',
        });

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

    // Check if sidebar should be sticky based on scroll position
    useEffect(() => {
        const handleScroll = () => {
            if (commentsRef.current) {
                const commentsPosition =
                    commentsRef.current.getBoundingClientRect().top;
                const windowHeight = window.innerHeight;

                // If comments section is about to enter viewport, stop sticky behavior
                if (commentsPosition < windowHeight + 100) {
                    setIsSidebarSticky(false);
                } else {
                    setIsSidebarSticky(true);
                }
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

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
                imageUrl: document?.thumbnail || '/default_image.png',
                attachedFiles: Array.isArray(document?.attachment)
                    ? document.attachment.map((file: any, index: number) => ({
                          id: `file-${index}`,
                          name:
                              typeof file === 'string'
                                  ? file
                                  : file?.name || `File ${index}`,
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
                                          : file?.name || `File ${index}`,
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

    // Extract headings from content for table of contents
    const extractHeadings = (content: string) => {
        const headingRegex = /<h([1-6])[^>]*>(.*?)<\/h\1>/g;
        const headings: { id: string; text: string; level: number }[] = [];
        let match;

        while ((match = headingRegex.exec(content)) !== null) {
            const level = Number.parseInt(match[1]);
            const text = match[2].replace(/<[^>]*>/g, ''); // Remove any HTML tags inside heading
            const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            headings.push({ id, text, level });
        }

        return headings;
    };

    // Handle scroll to section
    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            setActiveSection(id);
        }
    };

    // Track scroll position to highlight active TOC item
    useEffect(() => {
        const handleScroll = () => {
            if (!contentRef.current) {
                return;
            }

            const headings = contentRef.current.querySelectorAll(
                'h1, h2, h3, h4, h5, h6',
            );
            if (headings.length === 0) {
                return;
            }

            // Find the heading that is currently at the top of the viewport
            for (let i = 0; i < headings.length; i++) {
                const heading = headings[i] as HTMLElement;
                const rect = heading.getBoundingClientRect();

                // If the heading is in view
                if (rect.top >= 0 && rect.top <= 200) {
                    setActiveSection(heading.id);
                    break;
                }
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Get document tags for the sidebar
    const documentTags =
        Array.isArray(content?.tags) && content.tags.length > 0
            ? content.tags
            : allTags;

    // Extract headings for table of contents
    const headings = content ? extractHeadings(content.content) : [];

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
                        <p className='text-gray-500 mb-4'>{`The document you're looking for doesn't exist or has been removed.`}</p>
                        <Button onClick={onClose}>Go Back</Button>
                    </div>
                </div>
            </GlobalDocumentDetailsModal>
        );
    }

    if (!isOpen || !content) {
        return null;
    }

    return (
        <>
            <GlobalDocumentDetailsModal isOpen={isOpen} onClose={onClose}>
                <div className='flex h-full flex-col'>
                    {/* Header */}
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
                                Uploaded Document Details
                            </h1>
                            <p className='text-sm text-muted-foreground'>
                                View your documents with ease
                            </p>
                        </div>
                        <div className='flex items-center gap-2'>
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

                    {/* Main content */}
                    <div className='flex-1 overflow-y-auto p-4 document-container'>
                        <div className='max-w-6xl mx-auto'>
                            {/* Top section - full width */}
                            <div className='mb-6'>
                                {/* Created date */}
                                <div className='text-sm text-muted-foreground mb-2 flex flex-row items-center gap-4'>
                                    <div className='flex flex-row items-center gap-1'>
                                        <Calendar className='h-4 w-4' />
                                        {dayjs(content.uploadDate).format(
                                            'MMM DD, YYYY',
                                        )}
                                    </div>
                                    <div className='flex flex-row items-center gap-1'>
                                        <Clock className='h-4 w-4' />
                                        {dayjs(content.uploadDate).format(
                                            'hh:mm A',
                                        )}
                                    </div>
                                </div>

                                {/* Title */}
                                <h1 className='text-3xl font-bold mb-4'>
                                    {content.title}
                                </h1>

                                {/* Created by */}
                                <div className='mb-4 flex flex-row items-center gap-1'>
                                    <div className='h-8 w-8 rounded-full overflow-hidden bg-muted'>
                                        <Image
                                            src='/avatar.png'
                                            alt={content.author}
                                            width={32}
                                            height={32}
                                            className='object-cover'
                                        />
                                    </div>
                                    <p className='text-lg text-dark-gray font-semibold'>
                                        {content.author}
                                    </p>
                                </div>
                            </div>

                            {/* Two-column layout */}
                            <div className='flex flex-col-reverse lg:flex-row gap-8'>
                                {/* Left column - Content */}
                                <div
                                    className='w-full lg:w-2/3'
                                    ref={contentRef}
                                    style={{ maxWidth: 'calc(100vw - 40px)' }}
                                >
                                    <div className='prose prose-gray max-w-none dark:prose-invert'>
                                        {renderText({
                                            text: content?.content,
                                            toc: true,
                                        })}
                                    </div>
                                </div>

                                {/* Right column - Sidebar */}
                                <div className='w-full lg:w-1/3'>
                                    <div
                                        className={`space-y-6 ${isSidebarSticky ? 'lg:sticky lg:top-24' : ''}`}
                                    >
                                        {/* Thumbnail */}
                                        <div className='rounded-lg overflow-hidden mb-6'>
                                            <Image
                                                src={
                                                    content.imageUrl ||
                                                    '/default_image.png'
                                                }
                                                alt={content.title}
                                                width={400}
                                                height={225}
                                                className='w-full object-cover aspect-video'
                                            />
                                        </div>

                                        {/* Table of contents */}
                                        {headings.length > 0 && (
                                            <div className='border rounded-lg p-4 bg-background'>
                                                <h3 className='font-semibold mb-3'>
                                                    Table of Contents
                                                </h3>
                                                <nav className='space-y-1'>
                                                    {headings.map((heading) => (
                                                        <button
                                                            key={heading.id}
                                                            onClick={() =>
                                                                scrollToSection(
                                                                    heading.id,
                                                                )
                                                            }
                                                            className={`block text-sm w-full text-left px-2 py-1 rounded hover:bg-muted transition-colors
                                ${activeSection === heading.id ? 'bg-muted font-medium' : 'text-muted-foreground'}
                                ${heading.level === 1 ? '' : `ml-${(heading.level - 1) * 2}`}`}
                                                        >
                                                            {heading.text}
                                                        </button>
                                                    ))}
                                                </nav>
                                            </div>
                                        )}

                                        {/* Tags */}
                                        {documentTags &&
                                            documentTags.length > 0 && (
                                                <div className='border rounded-lg p-4 bg-foreground'>
                                                    <h3 className='font-semibold mb-3'>
                                                        Tags
                                                    </h3>
                                                    <div className='flex flex-wrap gap-2'>
                                                        {documentTags.map(
                                                            (
                                                                tag: string,
                                                                index: number,
                                                            ) => (
                                                                <Badge
                                                                    key={index}
                                                                    variant='secondary'
                                                                    className='text-sm bg-background bg-purple-100/20 text-purple-600 rounded-full'
                                                                >
                                                                    {tag}
                                                                </Badge>
                                                            ),
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                        {/* Attached Files */}
                                        {content.attachedFiles &&
                                            content.attachedFiles.length >
                                                0 && (
                                                <div className='border rounded-lg p-4 bg-foreground'>
                                                    <h3 className='font-semibold mb-3'>
                                                        Attached Files
                                                    </h3>
                                                    <div className='space-y-2'>
                                                        {content.attachedFiles.map(
                                                            (
                                                                file: any,
                                                                index: number,
                                                            ) => (
                                                                <div
                                                                    key={index}
                                                                    className='flex items-center justify-between'
                                                                >
                                                                    <div className='flex items-center gap-2'>
                                                                        <div className='h-8 w-8 min-w-8 flex items-center justify-center bg-background rounded'>
                                                                            <FileIcon className='h-4 w-4' />
                                                                        </div>
                                                                        <div>
                                                                            <p className='text-sm font-medium line-clamp-1 w-full'>
                                                                                {
                                                                                    file.name
                                                                                }
                                                                            </p>
                                                                            <p className='text-xs text-muted-foreground'>
                                                                                {
                                                                                    file.size
                                                                                }
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    <Button
                                                                        variant='secondary'
                                                                        size='sm'
                                                                        className='bg-background w-8 h-8'
                                                                    >
                                                                        <Download
                                                                            size={
                                                                                16
                                                                            }
                                                                        />
                                                                    </Button>
                                                                </div>
                                                            ),
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                    </div>
                                </div>
                            </div>

                            {/* Comments section - full width */}
                            <div className='mt-12' ref={commentsRef}>
                                <GlobalComment
                                    contentId={id || ''}
                                    bgColor='foreground'
                                />
                            </div>

                            {/* Related content - full width */}
                            <div className='mt-12 pt-6 border-t'>
                                <div className='flex items-center justify-between mb-6'>
                                    <h2 className='text-2xl font-bold'>
                                        Related Documents
                                    </h2>
                                    <div className='flex items-center gap-2'>
                                        <Button
                                            variant='outline'
                                            size='icon'
                                            className='rounded-full'
                                            onClick={() => {
                                                const slider =
                                                    document.getElementById(
                                                        'related-docs-slider',
                                                    );
                                                if (slider) {
                                                    slider.scrollBy({
                                                        left: -300,
                                                        behavior: 'smooth',
                                                    });
                                                }
                                            }}
                                        >
                                            <ChevronLeft className='h-4 w-4' />
                                        </Button>
                                        <Button
                                            variant='outline'
                                            size='icon'
                                            className='rounded-full'
                                            onClick={() => {
                                                const slider =
                                                    document.getElementById(
                                                        'related-docs-slider',
                                                    );
                                                if (slider) {
                                                    slider.scrollBy({
                                                        left: 300,
                                                        behavior: 'smooth',
                                                    });
                                                }
                                            }}
                                        >
                                            <ChevronRight className='h-4 w-4' />
                                        </Button>
                                    </div>
                                </div>
                                <div
                                    id='related-docs-slider'
                                    className='flex overflow-x-auto space-x-4 pb-4 hide-scrollbar'
                                    style={{
                                        scrollBehavior: 'smooth',
                                        scrollbarWidth: 'none',
                                        msOverflowStyle: 'none',
                                        maxWidth: 'calc(100vw - 40px)',
                                    }}
                                >
                                    {relatedDocuments?.map((doc, i) => (
                                        <Card
                                            className='overflow-hidden flex-shrink-0 w-[300px] lg:w-[calc(100%/2-16px)] xl:w-[calc(100%/3-16px)]'
                                            key={i}
                                        >
                                            <div className='cursor-pointer'>
                                                <div className='relative'>
                                                    <div className='absolute left-2 top-2 z-10 flex flex-wrap gap-1 w-full'>
                                                        <div className='flex flex-row items-center justify-between gap-4 w-[calc(100%-16px)]'>
                                                            {doc?.tags?.map(
                                                                (
                                                                    tag: string,
                                                                    i: number,
                                                                ) => (
                                                                    <Badge
                                                                        key={i}
                                                                        variant='secondary'
                                                                        className='bg-pure-black/40 backdrop-blur-2xl text-pure-white text-xs font-medium rounded-full'
                                                                    >
                                                                        {tag}
                                                                    </Badge>
                                                                ),
                                                            )}
                                                        </div>
                                                    </div>
                                                    <Image
                                                        src={
                                                            doc.imageUrl ||
                                                            '/default_image.png'
                                                        }
                                                        alt={doc.title}
                                                        width={400}
                                                        height={200}
                                                        className='h-36 w-full object-cover'
                                                    />
                                                </div>
                                                <CardContent className='p-3'>
                                                    <div className='mb-2 flex items-start justify-between'>
                                                        <div className='flex items-center gap-1'>
                                                            <Image
                                                                src={
                                                                    doc
                                                                        ?.createdBy
                                                                        ?.profilePicture ||
                                                                    '/avatar.png'
                                                                }
                                                                alt={
                                                                    doc
                                                                        ?.createdBy
                                                                        ?.profilePicture ||
                                                                    'Author'
                                                                }
                                                                width={20}
                                                                height={20}
                                                                className='rounded-full'
                                                            />
                                                            <p className='text-sm font-medium text-gray'>
                                                                {doc?.createdBy
                                                                    ?.profilePicture ||
                                                                    'Author Name'}
                                                            </p>
                                                        </div>
                                                        <div className='flex items-center gap-1 text-xs text-gray'>
                                                            <Eye className='h-3 w-3' />
                                                            <span>
                                                                {doc.readTime}{' '}
                                                                min read
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <h3 className='mb-1 line-clamp-2 font-semibold'>
                                                        {doc?.name ||
                                                            'untitled'}
                                                    </h3>
                                                    {/* <p className='line-clamp-2 text-sm text-gray'>
                                                        {doc.excerpt}
                                                    </p> */}
                                                    <Button
                                                        variant='link'
                                                        className='h-auto p-0 text-xs font-medium text-primary-white hover:no-underline'
                                                        onClick={() =>
                                                            router.push(
                                                                `/upload-documents?documentId=${doc?._id}&mode=view`,
                                                            )
                                                        }
                                                    >
                                                        Read More →
                                                    </Button>
                                                </CardContent>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </div>
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
