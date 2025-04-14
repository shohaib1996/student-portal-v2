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
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GlobalDocumentDetailsModal } from '@/components/global/documents/GlobalDocumentDetailsModal';
import {
    LabContent,
    type LabContentResponse,
    useGetContentDetailsQuery,
} from '@/redux/api/documents/documentsApi';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { renderText } from '@/components/lexicalEditor/renderer/renderText';
import GlobalComment from '@/components/global/GlobalComments/GlobalComment';
import { instance } from '@/lib/axios/axiosInstance';
import dayjs from 'dayjs';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export interface DocumentContent {
    _id?: string;
    excerpt?: string;
    title: string;
    author: string;
    uploadDate: string;
    lastUpdate: string;
    tags: string[];
    content: string;
    imageUrl: string;
    thumbnail?: string;
    user?: any;
    attachedFiles?: { id: string; name: string; type: string; size: string }[];
    programs?: { _id: string; title: string }[];
    sessions?: string[] | { _id: string; name: string }[];
    dependencies?: string[];
}

export interface DocumentDetailsProps {
    isOpen: boolean;
    onClose: () => void;
    documentId: string | null;
    documentData?: DocumentContent;
    mode?: 'view' | 'edit' | 'add';
    relatedDocuments?: LabContent[];
}

export function DocumentAndLabsDetailsModal({
    isOpen,
    onClose,
    documentId,
    documentData,
    mode = 'view',
    relatedDocuments,
}: DocumentDetailsProps) {
    // Add router and search params hooks at the top to maintain hooks order
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathName = usePathname();
    const [des, setDes] = useState<string>('');
    const [activeSection, setActiveSection] = useState<string>('');
    const contentRef = useRef<HTMLDivElement>(null);
    const commentsRef = useRef<HTMLDivElement>(null);
    const [isSidebarSticky, setIsSidebarSticky] = useState(true);

    // Get document ID from URL if present, otherwise use the prop
    const id = searchParams.get('documentId') || documentId;
    const urlMode = searchParams.get('mode') || mode;

    // Always call hooks at the top level, with skip logic to avoid unnecessary fetching
    const { data, error, isLoading } = useGetContentDetailsQuery(id || '', {
        skip: !id || !!documentData,
    });

    // Fetch content description from API
    useEffect(() => {
        if (id) {
            (async () => {
                try {
                    const res = await instance.get(
                        `/content/singlecontent/${id}`,
                    );
                    setDes(res.data.content?.description);
                } catch (error) {
                    console.error((error as Error).message);
                }
            })();
        }
    }, [id]);

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

    // Create HTML content with IDs for headings
    const createContentWithIds = (content: string) => {
        return content.replace(
            /<h([1-6])[^>]*>(.*?)<\/h\1>/g,
            (match, level, text) => {
                const id = text
                    .replace(/<[^>]*>/g, '')
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-');
                return `<h${level} id="${id}">${text}</h${level}>`;
            },
        );
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

    if (!isOpen) {
        return null;
    }

    // Use provided documentData if available, otherwise use fetched data
    const content = documentData || {
        title: data?.content?.name || 'Untitled',
        author: data?.content?.author || '',
        uploadDate: data?.content?.createdAt || new Date().toISOString(),
        lastUpdate: data?.content?.updatedAt || new Date().toISOString(),
        tags: data?.content?.tags || [],
        content: des || data?.content?.description || '',
        imageUrl: data?.content?.thumbnail || '/default_image.png',
        thumbnail: data?.content?.thumbnail || '/default_image.png',
        user: data?.content?.user || null,
        attachedFiles: data?.content?.attachedFiles || [],
        programs: data?.content?.programs || [],
        sessions: data?.content?.sessions || [],
        dependencies: data?.content?.dependencies || [],
    };

    // Extract headings for table of contents
    const headings = extractHeadings(content.content);

    return (
        <GlobalDocumentDetailsModal onClose={onClose} isOpen={isOpen}>
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
                            Document & Labs Details
                        </h1>
                        <p className='text-sm text-muted-foreground'>
                            View your documents & labs with ease
                        </p>
                    </div>
                    <div className='flex items-center gap-2'>
                        <Button size='sm' className='gap-1' onClick={onClose}>
                            <span>Back to Docs</span>
                            <ArrowRight className='h-4 w-4' />
                        </Button>
                    </div>
                </div>

                {/* Main content */}
                <div className='flex-1 overflow-y-auto p-4 document-container'>
                    <div className='max-w-6xl mx-auto'>
                        {/* Top section - full width */}
                        <div className='mb-6'>
                            {/* Created date */}
                            {isLoading && !documentData ? (
                                <div className='mb-2'>
                                    <Skeleton className='h-5 w-48 mb-2' />
                                </div>
                            ) : (
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
                            )}

                            {/* Title */}
                            {isLoading && !documentData ? (
                                <Skeleton className='h-10 w-3/4 mb-4' />
                            ) : (
                                <h1 className='text-3xl font-bold mb-4'>
                                    {content.title}
                                </h1>
                            )}

                            {/* Created by */}
                            {isLoading && !documentData ? (
                                <div className='flex items-center gap-2 mb-4'>
                                    <Skeleton className='h-8 w-8 rounded-full' />
                                    <Skeleton className='h-5 w-40' />
                                </div>
                            ) : (
                                content.author && (
                                    <div className='mb-4 flex flex-row items-center gap-1'>
                                        <Image
                                            height={30}
                                            width={30}
                                            src={
                                                content?.author
                                                    ?.profilePicture ||
                                                '/avatar.png'
                                            }
                                            alt={
                                                content?.author?.fullName ||
                                                'author'
                                            }
                                            className='rounded-full'
                                        />
                                        <p className='text-lg text-dark-gray font-semibold'>
                                            {content?.author?.fullName ||
                                                'Author'}
                                        </p>
                                    </div>
                                )
                            )}
                        </div>

                        {/* Two-column layout */}
                        <div className='flex flex-col lg:flex-row gap-8'>
                            {/* Left column - Content */}
                            <div className='w-full lg:w-2/3' ref={contentRef}>
                                {isLoading && !documentData ? (
                                    <div className='space-y-4'>
                                        <Skeleton className='h-6 w-3/4' />
                                        <Skeleton className='h-24 w-full' />
                                        <Skeleton className='h-6 w-1/2' />
                                        <Skeleton className='h-32 w-full' />
                                        <Skeleton className='h-6 w-2/3' />
                                        <Skeleton className='h-20 w-full' />
                                    </div>
                                ) : (
                                    <div className='prose prose-gray max-w-none dark:prose-invert'>
                                        {renderText(content?.content)}
                                    </div>
                                )}
                            </div>

                            {/* Right column - Sidebar */}
                            <div className='w-full lg:w-1/3'>
                                <div
                                    className={`space-y-6 ${isSidebarSticky ? 'lg:sticky lg:top-24' : ''}`}
                                >
                                    {/* Thumbnail */}
                                    {isLoading && !documentData ? (
                                        <Skeleton className='w-full h-48 rounded-lg mb-6' />
                                    ) : (
                                        <div className='rounded-lg overflow-hidden mb-6'>
                                            <Image
                                                src={
                                                    content.thumbnail ||
                                                    '/default_image.png'
                                                }
                                                alt={content.title}
                                                width={400}
                                                height={225}
                                                className='w-full object-cover aspect-video'
                                            />
                                        </div>
                                    )}

                                    {/* Table of contents */}
                                    {isLoading && !documentData ? (
                                        <div className='border rounded-lg p-4 bg-background'>
                                            <Skeleton className='h-6 w-40 mb-3' />
                                            <div className='space-y-2'>
                                                <Skeleton className='h-5 w-full' />
                                                <Skeleton className='h-5 w-5/6' />
                                                <Skeleton className='h-5 w-4/6' />
                                                <Skeleton className='h-5 w-full' />
                                                <Skeleton className='h-5 w-3/4' />
                                            </div>
                                        </div>
                                    ) : (
                                        headings.length > 0 && (
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
                                        )
                                    )}

                                    {/* Tags */}
                                    {isLoading && !documentData ? (
                                        <div className='border rounded-lg p-4 bg-foreground'>
                                            <Skeleton className='h-6 w-20 mb-3 bg-background/50' />
                                            <div className='flex flex-wrap gap-2'>
                                                <Skeleton className='h-6 w-16 rounded-full bg-background/50' />
                                                <Skeleton className='h-6 w-24 rounded-full bg-background/50' />
                                                <Skeleton className='h-6 w-20 rounded-full bg-background/50' />
                                            </div>
                                        </div>
                                    ) : (
                                        content.tags &&
                                        content.tags.length > 0 && (
                                            <div className='border rounded-lg p-4 bg-foreground'>
                                                <h3 className='font-semibold mb-3'>
                                                    Tags
                                                </h3>
                                                <div className='flex flex-wrap gap-2'>
                                                    {content.tags.map(
                                                        (
                                                            tag: string,
                                                            index: number,
                                                        ) => (
                                                            <Badge
                                                                key={index}
                                                                variant='secondary'
                                                                className='text-sm bg-background'
                                                            >
                                                                {tag}
                                                            </Badge>
                                                        ),
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    )}

                                    {/* Sessions */}
                                    {isLoading && !documentData ? (
                                        <div className='border rounded-lg p-4 bg-background'>
                                            <Skeleton className='h-6 w-24 mb-3' />
                                            <div className='flex flex-wrap gap-2'>
                                                <Skeleton className='h-6 w-20 rounded-full' />
                                                <Skeleton className='h-6 w-28 rounded-full' />
                                            </div>
                                        </div>
                                    ) : (
                                        content.sessions &&
                                        content.sessions.length > 0 && (
                                            <div className='border rounded-lg p-4 bg-background'>
                                                <h3 className='font-semibold mb-3'>
                                                    Sessions
                                                </h3>
                                                <div className='flex flex-wrap gap-2'>
                                                    {content.sessions.map(
                                                        (
                                                            session: {
                                                                name: string;
                                                            },
                                                            index: number,
                                                        ) => (
                                                            <Badge
                                                                key={index}
                                                                variant='outline'
                                                                className='text-sm'
                                                            >
                                                                {typeof session ===
                                                                'string'
                                                                    ? session
                                                                    : session.name}
                                                            </Badge>
                                                        ),
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    )}

                                    {/* Programs */}
                                    {isLoading && !documentData ? (
                                        <div className='border rounded-lg p-4 bg-background'>
                                            <Skeleton className='h-6 w-24 mb-3' />
                                            <div className='flex flex-wrap gap-2'>
                                                <Skeleton className='h-6 w-32 rounded-full' />
                                                <Skeleton className='h-6 w-24 rounded-full' />
                                            </div>
                                        </div>
                                    ) : (
                                        content.programs &&
                                        content.programs.length > 0 && (
                                            <div className='border rounded-lg p-4 bg-background'>
                                                <h3 className='font-semibold mb-3'>
                                                    Programs
                                                </h3>
                                                <div className='flex flex-wrap gap-2'>
                                                    {content.programs.map(
                                                        (
                                                            program: {
                                                                title: string;
                                                            },
                                                            index: number,
                                                        ) => (
                                                            <Badge
                                                                key={index}
                                                                variant='outline'
                                                                className='text-sm'
                                                            >
                                                                {program.title}
                                                            </Badge>
                                                        ),
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    )}

                                    {/* Dependencies */}
                                    {isLoading && !documentData ? (
                                        <div className='border rounded-lg p-4 bg-background'>
                                            <Skeleton className='h-6 w-32 mb-3' />
                                            <div className='flex flex-wrap gap-2'>
                                                <Skeleton className='h-6 w-24 rounded-full' />
                                                <Skeleton className='h-6 w-20 rounded-full' />
                                                <Skeleton className='h-6 w-28 rounded-full' />
                                            </div>
                                        </div>
                                    ) : (
                                        content.dependencies &&
                                        content.dependencies.length > 0 && (
                                            <div className='border rounded-lg p-4 bg-background'>
                                                <h3 className='font-semibold mb-3'>
                                                    Dependencies
                                                </h3>
                                                <div className='flex flex-wrap gap-2'>
                                                    {content.dependencies.map(
                                                        (
                                                            dependency: string,
                                                            index: number,
                                                        ) => (
                                                            <Badge
                                                                key={index}
                                                                variant='outline'
                                                                className='text-sm'
                                                            >
                                                                {dependency}
                                                            </Badge>
                                                        ),
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Comments section - full width */}
                        <div className='mt-12' ref={commentsRef}>
                            {isLoading && !documentData ? (
                                <div className='space-y-4'>
                                    <Skeleton className='h-8 w-40' />
                                    <Skeleton className='h-32 w-full rounded-lg' />
                                </div>
                            ) : (
                                <GlobalComment
                                    contentId={id || ''}
                                    bgColor='foreground'
                                />
                            )}
                        </div>

                        {/* Related content - full width */}
                        {isLoading && !documentData ? (
                            <div className='mt-12'>
                                <Skeleton className='h-8 w-48 mb-6' />
                                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
                                    {[1, 2, 3].map((i) => (
                                        <div
                                            key={i}
                                            className='border rounded-lg overflow-hidden'
                                        >
                                            <Skeleton className='h-36 w-full' />
                                            <div className='p-3 space-y-2'>
                                                <div className='flex justify-between'>
                                                    <Skeleton className='h-5 w-24' />
                                                    <Skeleton className='h-5 w-16' />
                                                </div>
                                                <Skeleton className='h-6 w-full' />
                                                <Skeleton className='h-4 w-full' />
                                                <Skeleton className='h-4 w-3/4' />
                                                <Skeleton className='h-4 w-16' />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            relatedDocuments &&
                            relatedDocuments.length > 0 && (
                                <div className='mt-12 pt-4 border-t border-forground-border'>
                                    <div className='flex items-center justify-between mb-6'>
                                        <h2 className='text-2xl font-bold'>
                                            Related Documents
                                        </h2>
                                        {relatedDocuments.length > 3 && (
                                            <div className='flex items-center gap-2'>
                                                <Button
                                                    variant='outline'
                                                    size='icon'
                                                    className='rounded-full bg-foreground'
                                                    onClick={() => {
                                                        const slider =
                                                            document.getElementById(
                                                                'related-docs-slider',
                                                            );
                                                        if (slider) {
                                                            slider.scrollBy({
                                                                left: -300,
                                                                behavior:
                                                                    'smooth',
                                                            });
                                                        }
                                                    }}
                                                >
                                                    <ChevronLeft className='h-4 w-4' />
                                                </Button>
                                                <Button
                                                    variant='outline'
                                                    size='icon'
                                                    className='rounded-full bg-foreground'
                                                    onClick={() => {
                                                        const slider =
                                                            document.getElementById(
                                                                'related-docs-slider',
                                                            );
                                                        if (slider) {
                                                            slider.scrollBy({
                                                                left: 300,
                                                                behavior:
                                                                    'smooth',
                                                            });
                                                        }
                                                    }}
                                                >
                                                    <ChevronRight className='h-4 w-4' />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                    <div
                                        id='related-docs-slider'
                                        className='flex overflow-x-auto space-x-4 pb-4 hide-scrollbar w-full'
                                        style={{
                                            scrollBehavior: 'smooth',
                                            scrollbarWidth: 'none',
                                            msOverflowStyle: 'none',
                                        }}
                                    >
                                        {relatedDocuments.map(
                                            (relatedDoc: any, i: number) => (
                                                <Card
                                                    className='overflow-hidden flex-shrink-0'
                                                    key={i}
                                                    style={{
                                                        width: 'calc(100% / 3 - 16px)',
                                                    }}
                                                >
                                                    <div
                                                        className='cursor-pointer'
                                                        onClick={() =>
                                                            router.push(
                                                                `/documents-and-labs?documentId=${relatedDoc._id || ''}&mode=view`,
                                                            )
                                                        }
                                                    >
                                                        <div className='relative'>
                                                            {/* <div className='absolute left-2 top-2 z-10 flex flex-wrap gap-1 w-full'>
                                                                <div className='flex flex-row items-center justify-between gap-4 w-[calc(100%-16px)]'>
                                                                    {relatedDoc.groups &&
                                                                        relatedDoc.groups
                                                                            .slice(
                                                                                0,
                                                                                2,
                                                                            )
                                                                            .map(
                                                                                (
                                                                                    tag: string,
                                                                                    i: number,
                                                                                ) => (
                                                                                    <Badge
                                                                                        key={
                                                                                            i
                                                                                        }
                                                                                        variant='secondary'
                                                                                        className='bg-pure-black/40 backdrop-blur-2xl text-pure-white text-xs font-medium rounded-full'
                                                                                    >
                                                                                        {
                                                                                            tag
                                                                                        }
                                                                                    </Badge>
                                                                                ),
                                                                            )}
                                                                </div>
                                                            </div> */}
                                                            <Image
                                                                src={
                                                                    relatedDoc.thumbnail ||
                                                                    '/default_image.png'
                                                                }
                                                                alt={
                                                                    relatedDoc.name ||
                                                                    'thumbnail'
                                                                }
                                                                width={400}
                                                                height={200}
                                                                className='h-36 w-full object-cover'
                                                            />
                                                        </div>
                                                        <CardContent className='p-3'>
                                                            <div className='mb-2 flex items-start justify-between'>
                                                                {relatedDoc.createdBy ? (
                                                                    <div className='flex items-center gap-1'>
                                                                        <Image
                                                                            src={
                                                                                relatedDoc
                                                                                    .createdBy
                                                                                    .profilePicture ||
                                                                                '/avatar.png'
                                                                            }
                                                                            alt={
                                                                                relatedDoc
                                                                                    .createdBy
                                                                                    .fullName ||
                                                                                ''
                                                                            }
                                                                            width={
                                                                                20
                                                                            }
                                                                            height={
                                                                                20
                                                                            }
                                                                            className='rounded-full'
                                                                        />
                                                                        <p className='text-sm font-medium text-gray'>
                                                                            {
                                                                                relatedDoc
                                                                                    .createdBy
                                                                                    .fullName
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                ) : (
                                                                    <p className='text-xs text-gray flex flex-row items-center gap-0.5'>
                                                                        <Calendar className='h-3 w-4' />
                                                                        <time
                                                                            dateTime={
                                                                                relatedDoc.createdAt as string
                                                                            }
                                                                        >
                                                                            {dayjs(
                                                                                relatedDoc.createdAt,
                                                                            ).format(
                                                                                'MMM DD, YYYY',
                                                                            )}
                                                                        </time>
                                                                    </p>
                                                                )}
                                                                <div className='flex items-center gap-1 text-xs text-gray'>
                                                                    <Eye className='h-3 w-3' />
                                                                    <span>
                                                                        {Math.ceil(
                                                                            ((relatedDoc
                                                                                .description
                                                                                ?.length ||
                                                                                0) /
                                                                                1000) *
                                                                                0.5,
                                                                        )}{' '}
                                                                        min read
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <h3 className='mb-1 line-clamp-2 font-semibold'>
                                                                {relatedDoc.name ||
                                                                    'Untitled'}
                                                            </h3>

                                                            <Button
                                                                variant='link'
                                                                className='h-auto p-0 text-xs font-medium text-primary-white hover:no-underline'
                                                                onClick={(
                                                                    e,
                                                                ) => {
                                                                    e.stopPropagation();
                                                                    router.push(
                                                                        `/documents-and-labs?documentId=${relatedDoc._id || ''}&mode=view`,
                                                                    );
                                                                }}
                                                            >
                                                                Read More →
                                                            </Button>
                                                        </CardContent>
                                                    </div>
                                                </Card>
                                            ),
                                        )}
                                    </div>
                                </div>
                            )
                        )}
                    </div>
                </div>
            </div>
        </GlobalDocumentDetailsModal>
    );
}
