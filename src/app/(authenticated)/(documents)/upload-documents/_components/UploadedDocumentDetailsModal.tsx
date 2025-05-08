'use client';

import { useState, useEffect, useRef, Dispatch, SetStateAction } from 'react';
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
    Trash,
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
    UploadDoc,
    useDeleteUserDocumentMutation,
    useGetSingleUpdatedDocumentByIdQuery,
    useGetSingleUploadDocumentQuery,
} from '@/redux/api/documents/documentsApi';
import { TdUser } from '@/components/global/TdUser';
import DocumentList from '../../my-documents/_components/documentsList';
import { on } from 'events';

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
    setSelected: Dispatch<SetStateAction<UploadDoc | null>>;
}

export function UploadedDocumentDetailsModal({
    isOpen,
    onClose,
    documentId,
    mode = 'view',
    relatedDocuments,
    setSelected,
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

    const content = uploadDocumentData?.document;

    const handleEditClick = () => {
        setSelected(apiData?.document);
        router.push('/upload-documents');
        onClose();
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
            : [];

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

    const handleDelete = () => {
        deleteUserDocument(id || '')
            .unwrap()
            .then(() => {
                toast.success('Document deleted successfully!');
                onClose();
            })
            .catch((error) => {
                toast.error(`Error deleting document: ${error}`);
            });
    };
    return (
        <>
            <GlobalDocumentDetailsModal isOpen={isOpen} onClose={onClose}>
                <div className='flex h-full flex-col'>
                    {/* Header */}
                    <div className='sticky top-0 z-10 flex items-center justify-between border-b bg-background px-4 py-2'>
                        <div>
                            <h1 className='flex items-center gap-1 text-xl font-semibold'>
                                <button
                                    onClick={onClose}
                                    className='h-auto w-auto p-0'
                                >
                                    <ArrowLeft size={18} />
                                    <span className='sr-only'>Back</span>
                                </button>
                                Uploaded Document Details
                            </h1>
                            <p className='text-sm text-muted-foreground'>
                                View your documents with ease
                            </p>
                        </div>
                        <div className='flex items-center gap-2'>
                            <Button
                                className='text-pure-white'
                                onClick={handleEditClick}
                                icon={<PencilLine className='h-4 w-4' />}
                            >
                                Edit
                            </Button>
                            <GlobalDeleteModal
                                deleteFun={deleteUserDocument}
                                customDelete={handleDelete}
                                _id={id || ''}
                                itemTitle='Document'
                                loading={isDeleting}
                                modalTitle='Delete Document?'
                                modalSubTitle='This action cannot be undone. This will permanently delete your document and remove your data from our servers.'
                                // isButton={true}
                            >
                                <Button
                                    variant={'danger_light'}
                                    icon={<Trash className='h-4 w-4' />}
                                >
                                    Delete
                                </Button>
                            </GlobalDeleteModal>
                        </div>
                    </div>

                    {/* Main content */}
                    <div className='flex-1 overflow-y-auto p-4 document-container'>
                        <div className='mx-auto'>
                            {/* Top section - full width */}
                            <div className='mb-3'>
                                {/* Created date */}
                                <div className='text-sm text-muted-foreground mb-2 flex flex-row items-center gap-4'>
                                    <div className='flex flex-row items-center gap-1'>
                                        <Calendar className='h-4 w-4' />
                                        {dayjs(content.createdAt).format(
                                            'MMM DD, YYYY',
                                        )}
                                    </div>
                                    <div className='flex flex-row items-center gap-1'>
                                        <Clock className='h-4 w-4' />
                                        {dayjs(content.createdAt).format(
                                            'hh:mm A',
                                        )}
                                    </div>
                                </div>

                                {/* Title */}
                                <h1 className='text-3xl font-bold mb-3'>
                                    {content?.name}
                                </h1>

                                {/* Created by */}
                                <TdUser user={content?.user} />
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
                                            text: content?.description,
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
                                        <div className='rounded-lg border border-forground-border overflow-hidden mb-3'>
                                            <Image
                                                src={
                                                    content.thumbnail ||
                                                    '/default_image.png'
                                                }
                                                alt={content?.name}
                                                width={400}
                                                height={225}
                                                className='w-full object-cover aspect-video'
                                            />
                                        </div>

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
                                                                    className='text-sm bg-purple-100/20 text-purple-600 rounded-full'
                                                                >
                                                                    {tag}
                                                                </Badge>
                                                            ),
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                        {/* Attached Files */}
                                        {content?.attachments &&
                                            content.attachments.length > 0 && (
                                                <DocumentList
                                                    files={content?.attachments}
                                                />
                                            )}
                                    </div>
                                </div>
                            </div>

                            {/* Comments section - full width */}
                            <div className='mt-3' ref={commentsRef}>
                                <GlobalComment
                                    contentId={id || ''}
                                    bgColor='foreground'
                                />
                            </div>

                            {/* Related content - full width */}
                            <div className='mt-3 pt-1 border-t'>
                                <div className='flex items-center justify-between mb-2'>
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
                                                        alt={
                                                            doc.title ||
                                                            'Document'
                                                        }
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
        </>
    );
}
