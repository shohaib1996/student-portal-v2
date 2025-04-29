'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
    ArrowLeft,
    ArrowRight,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Clock,
    Eye,
    FileIcon,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GlobalDocumentDetailsModal } from '@/components/global/documents/GlobalDocumentDetailsModal';
import { useRouter, useSearchParams } from 'next/navigation';
import { renderText } from '@/components/lexicalEditor/renderer/renderText';
import GlobalComment from '@/components/global/GlobalComments/GlobalComment';
import { Card, CardContent } from '@/components/ui/card';
import { useGetTemplateDetailsQuery } from '@/redux/api/documents/documentsApi';
import dayjs from 'dayjs';
import DocumentList from '../../my-documents/_components/documentsList';

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
    relatedDocuments?: any[];
}

export function DocumentDetailsModal({
    isOpen,
    onClose,
    documentId,
    documentData,
    relatedDocuments = [],
}: DocumentDetailsProps) {
    const [activeSection, setActiveSection] = useState<string>('');
    const contentRef = useRef<HTMLDivElement>(null);
    const commentsRef = useRef<HTMLDivElement>(null);
    const [isSidebarSticky, setIsSidebarSticky] = useState(true);

    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get('documentId') || documentId;
    const mode = searchParams.get('mode') || 'view';

    const imageExtensions = [
        '.png',
        '.jpg',
        '.jpeg',
        '.webp',
        '.gif',
        '.svg',
        '.bmp',
        '.tiff',
        '.ico',
        '.avif',
    ];

    // Fetch document data if not provided
    const { data, isLoading, error } = useGetTemplateDetailsQuery(id || '', {
        skip: !id || !!documentData,
    });

    // Use provided data or fetched data
    const document: DocumentContent = documentData || {
        title: data?.template?.title || 'Untitled',
        author: data?.template?.createdBy?.fullName || 'Unknown Author',
        uploadDate: data?.template?.createdAt || '',
        lastUpdate: data?.template?.updatedAt || '',
        tags: data?.template?.tags || [],
        content: data?.template?.description || '',
        imageUrl: data?.template?.thumbnail || '/placeholder.svg',
        attachedFiles: data?.template?.attachments || [],
        category: data?.template?.category || '',
        createdBy: data?.template?.createdBy?.fullName || '',
        isActive: data?.template?.isActive || false,
        programs: data?.template?.programs || [],
        sessions: data?.template?.sessions || [],
        users: data?.template?.users || [],
    };

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
        const element = window.document.getElementById(id);
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

    // Extract headings for table of contents
    const headings = document ? extractHeadings(document.content) : [];

    // Handle loading state
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

    // Handle error state
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

    // Handle empty state
    if (!isOpen || (!documentData && !data && !isLoading)) {
        return null;
    }

    return (
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
                                className='h-auto p-0 sm:p-0 w-fit sm:w-fit'
                            >
                                <ArrowLeft className='h-4 w-4' />
                                <span className='sr-only'>Back</span>
                            </Button>
                            Template Document Details
                        </h1>
                        <p className='text-sm text-muted-foreground'>
                            Easily view your template documents
                        </p>
                    </div>
                    <div className='flex items-center gap-2'>
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
                </div>

                {/* Main content */}
                <div className='flex-1 overflow-y-auto p-4 document-container'>
                    <div className='max-w-6xl mx-auto'>
                        {/* Top section - full width */}
                        <div className='mb-3'>
                            {/* Created date */}
                            <div className='text-sm text-muted-foreground mb-2 flex flex-row items-center gap-4'>
                                <div className='flex flex-row items-center gap-1'>
                                    <Calendar className='h-4 w-4' />
                                    {dayjs(document.uploadDate).format(
                                        'MMM DD, YYYY',
                                    )}
                                </div>
                                <div className='flex flex-row items-center gap-1'>
                                    <Clock className='h-4 w-4' />
                                    {dayjs(document.uploadDate).format(
                                        'hh:mm A',
                                    )}
                                </div>
                            </div>

                            {/* Title */}
                            <h1 className='text-3xl font-bold mb-2'>
                                {document.title}
                            </h1>

                            {/* Created by */}
                            <div className='mb-2 flex flex-row items-center gap-1'>
                                <div className='h-8 w-8 rounded-full overflow-hidden bg-muted'>
                                    <Image
                                        src='/avatar.png'
                                        alt={document.author}
                                        width={32}
                                        height={32}
                                        className='object-cover'
                                    />
                                </div>
                                <p className='text-lg text-dark-gray font-semibold'>
                                    {document.author}
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
                                        text: document?.content,
                                    })}
                                </div>
                            </div>

                            {/* Right column - Sidebar */}
                            <div className='w-full lg:w-1/3'>
                                <div
                                    className={`space-y-4 ${isSidebarSticky ? 'lg:sticky lg:top-24' : ''}`}
                                >
                                    {/* Thumbnail */}
                                    <div className='rounded-lg overflow-hidden mb-3'>
                                        <Image
                                            src={
                                                document?.imageUrl ||
                                                '/placeholder.svg'
                                            }
                                            alt={document.title}
                                            width={400}
                                            height={225}
                                            className='w-full object-cover aspect-video'
                                        />
                                    </div>
                                    <div className='flex flex-row items-center gap-2 capitalize'>
                                        <p>Category:</p>
                                        <p className='bg-orange-400 rounded-lg px-1'>
                                            {document?.category || 'Template'}
                                        </p>
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
                                    {document.tags &&
                                        document.tags.length > 0 && (
                                            <div className='border rounded-lg p-4 bg-foreground'>
                                                <h3 className='font-semibold mb-3'>
                                                    Tags
                                                </h3>
                                                <div className='flex flex-wrap gap-2'>
                                                    {document.tags.map(
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
                                    {/* {document.attachedFiles &&
                                        document.attachedFiles.length > 0 && (
                                            <DocumentList
                                                files={
                                                    document.attachedFiles || []
                                                }
                                            />
                                        )} */}

                                    {/* Programs */}
                                    {document.programs &&
                                        document.programs.length > 0 && (
                                            <div className='border rounded-lg p-4 bg-foreground'>
                                                <h3 className='font-semibold mb-3'>
                                                    Associated Programs
                                                </h3>
                                                <div className='space-y-2'>
                                                    {document.programs.map(
                                                        (program, index) => (
                                                            <div
                                                                key={index}
                                                                className='flex items-center gap-2 p-2 bg-background rounded-md'
                                                            >
                                                                <div className='h-6 w-6 bg-primary/10 text-primary flex items-center justify-center rounded'>
                                                                    <Calendar className='h-4 w-4' />
                                                                </div>
                                                                <span>
                                                                    {program.name ||
                                                                        `Program ${index + 1}`}
                                                                </span>
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
                        <div className='mt-3' ref={commentsRef}>
                            <GlobalComment
                                contentId={id || ''}
                                bgColor='foreground'
                            />
                        </div>

                        {/* Related content - full width */}
                        {relatedDocuments && relatedDocuments.length > 0 && (
                            <div className='mt-3 pt-3 border-t max-w-full'>
                                <div className='flex items-center justify-between mb-6'>
                                    <h2 className='text-2xl font-bold'>
                                        Related Templates
                                    </h2>
                                    <div className='flex items-center gap-2'>
                                        <Button
                                            variant='outline'
                                            size='icon'
                                            className='rounded-full'
                                            onClick={() => {
                                                const slider =
                                                    window.document.getElementById(
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
                                                    window.document.getElementById(
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
                                    {relatedDocuments.map((doc, i) => (
                                        <Card
                                            className='overflow-hidden flex-shrink-0 w-[300px] lg:w-[calc(100%/2-16px)] xl:w-[calc(100%/3-16px)]'
                                            key={i}
                                        >
                                            <div className='cursor-pointer'>
                                                <div className='relative'>
                                                    <div className='absolute left-2 top-2 z-10 flex flex-wrap gap-1 w-full'></div>
                                                    <Image
                                                        src={
                                                            doc.thumbnail ||
                                                            '/placeholder.svg'
                                                        }
                                                        alt={
                                                            doc.title ||
                                                            doc.name
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
                                                                        ?.fullName ||
                                                                    'Author'
                                                                }
                                                                width={20}
                                                                height={20}
                                                                className='rounded-full'
                                                            />
                                                            <p className='text-sm font-medium text-gray'>
                                                                {doc?.createdBy
                                                                    ?.fullName ||
                                                                    'Author'}
                                                            </p>
                                                        </div>
                                                        {doc.readTime !==
                                                            undefined && (
                                                            <div className='flex items-center gap-1 text-xs text-gray'>
                                                                <Eye className='h-3 w-3' />
                                                                <span>
                                                                    {
                                                                        doc.readTime
                                                                    }{' '}
                                                                    min read
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <h3 className='mb-1 line-clamp-2 text-lg font-semibold'>
                                                        {doc.title ||
                                                            doc.name ||
                                                            'Untitled'}
                                                    </h3>
                                                    <p className='line-clamp-2 text-sm text-gray'>
                                                        {doc.excerpt ||
                                                            doc.description?.substring(
                                                                0,
                                                                100,
                                                            )}
                                                    </p>
                                                    <Button
                                                        variant='link'
                                                        className='h-auto p-0 text-xs font-medium text-primary-white hover:no-underline'
                                                        onClick={() =>
                                                            router.push(
                                                                `/templates?documentId=${doc?._id || doc?.id}&mode=view`,
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
                        )}
                    </div>
                </div>
            </div>
        </GlobalDocumentDetailsModal>
    );
}
