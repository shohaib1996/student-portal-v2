'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FullScreen, useFullScreenHandle } from 'react-full-screen';
import { SwipeableProps, useSwipeable } from 'react-swipeable';
import { useSelector } from 'react-redux';
import MouseTrail from '@pjsalita/react-mouse-trail';

// DnD Kit imports
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Lucide Icons
import {
    Save,
    Maximize,
    Trash2,
    Info,
    ArrowLeftCircle,
    Download,
    Loader,
    GripVertical,
    Plus,
    Phone,
    Expand,
    BookmarkCheck,
    ArrowLeft,
    Router,
} from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import GlobalModal from '@/components/global/GlobalModal';
import GlobalHeader from '@/components/global/GlobalHeader';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { MDXEditorMethods } from '@mdxeditor/editor';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { toast } from 'sonner';
import MultiSelect from '@/components/global/MultiSelect';
import Scaled from './Scaled';
import { useGetSingleSlideQuery } from '@/redux/api/slides/slideApi';
import useSize from './useSize';
import dayjs from 'dayjs';
import MessagePreview from '../lexicalEditor/renderer/MessagePreview';
import { GlobalCommentsSection } from '../global/GlobalCommentSection';
import GlobalComment from '../global/GlobalComments/GlobalComment';
// import GlobalComment from '@/components/common/GlobalComment/GlobalComment';

// Define TypeScript interfaces
interface SlideContent {
    content: string;
    title: string;
    index?: number;
    _id: string; // Need unique ID for dnd-kit
}

interface Slide {
    _id: string;
    title: string;
    slides: SlideContent[];
    programs: string[];
    sessions: string[];
    createdAt: string;
    updatedAt: string;
}
interface NavigationCallback {
    (): void;
}

interface HandleNavigation {
    (navigateCallback: NavigationCallback): void;
}
interface DataState {
    activeBranch: string;
    programs: Array<{
        _id: string;
        title: string;
    }>;
    sessions: Array<{
        _id: string;
        name: string;
    }>;
}

interface AddSlideProps {
    index?: number;
    content?: string;
    title?: string;
}

// SortableItem component using dnd-kit
function SortableItem({
    slide,
    index,
    current,
    onClick,
}: {
    slide: SlideContent;
    index: number;
    current: number;
    onClick: () => void;
}) {
    const { attributes, listeners, setNodeRef, transform, transition } =
        useSortable({ id: slide._id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };
    const isActive = index === current;
    const bgColor = isActive ? 'bg-primary' : 'bg-background';
    const textColor = isActive ? 'text-pure-white' : 'text-dark-gray';

    return (
        <div ref={setNodeRef} style={style} {...attributes} className='mb-2'>
            <div
                className={`flex flex-col h-36 ${bgColor} rounded-md cursor-pointer overflow-hidden border border-forground-border shadow-md`}
                onClick={onClick}
            >
                <div
                    className={`flex items-center justify-between px-2 py-1 ${isActive ? 'bg-primary' : 'bg-sidebar'}`}
                >
                    <span className={`text-sm font-medium ${textColor}`}>
                        {index + 1}
                    </span>
                </div>

                <div className='w-full h-full p-1 overflow-hidden'>
                    <div className='w-full h-full bg-foreground rounded-sm'>
                        <Scaled slide={slide} active={isActive} big={false} />
                    </div>
                </div>
            </div>
        </div>
    );
}

function ViewSlide({ id }: { id: string }) {
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
    const router = useRouter();
    const { theme } = useTheme();
    const [title, setTitle] = useState<string>('');
    const [slides, setSlides] = useState<SlideContent[]>([
        {
            content: '',
            title: '',
            _id: '1', // Initial ID
        },
    ]);

    const { data: slidesData, isLoading } = useGetSingleSlideQuery(
        { id: id },
        {
            skip: !id,
        },
    );

    const [current, setCurrent] = useState<number>(0);
    const [selected, setSelected] = useState<Slide | null>(null);
    const handle = useFullScreenHandle();
    const [selectedPrograms, setSelectedPrograms] = useState<string[]>([]);
    const [selectedSessions, setSelectedSessions] = useState<string[]>([]);
    const [isSlideOn, setIsSlideOn] = useState<boolean>(false);
    const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);
    const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(
        null,
    );
    const [isTextChanged, setIsTextChanged] = useState<boolean>(false);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
    const [slideToDelete, setSlideToDelete] = useState<number | null>(null);
    const [text, setText] = useState<string>('');
    const [isCsvLoading, setIsCsvLoading] = useState<boolean>(false);
    const markdownRef = useRef<MDXEditorMethods>(null);
    const dispatch = useAppDispatch();

    // Use the size hook at component level for proper hook order
    const [editorContainerRef, editorSize] = useSize<HTMLDivElement>();

    // Configure DnD Kit sensors
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    // Set state from RTK Query data
    useEffect(() => {
        if (slidesData?.slide) {
            setSelected(slidesData.slide);
            setTitle(slidesData.slide.title || '');
            setSlides(slidesData?.slide?.slides || []);
            setSelectedPrograms(slidesData?.slide?.programs || []);
            setSelectedSessions(slidesData?.slide?.sessions || []);
            setHasUnsavedChanges(false); // Reset when data is loaded
        }
    }, [slidesData]);

    // Replace the existing browser back button handler with this:

    // Keyboard navigation in fullscreen mode
    const handleUserKeyPress = (event: KeyboardEvent) => {
        const { keyCode } = event;

        if (handle.active) {
            if (keyCode === 39 && current !== slides?.length - 1) {
                setCurrent((prev) => prev + 1);
            } else if (keyCode === 37 && current !== 0) {
                setCurrent((prev) => prev - 1);
            }
        }
    };

    useEffect(() => {
        window.addEventListener('keydown', handleUserKeyPress);
        if (markdownRef.current && slides[current]) {
            // This will update the editor content when the current slide changes
            markdownRef.current.setMarkdown(slides[current].content || '');
        }
        return () => {
            window.removeEventListener('keydown', handleUserKeyPress);
        };
    }, [handle, current]);

    const handleChangeText = (value: string, field: 'content' | 'title') => {
        const array = [...slides];
        if (current >= 0 && current < array.length) {
            array[current] = { ...array[current], [field]: value };
            setSlides(array);
            setIsTextChanged(true);
            setHasUnsavedChanges(true);
            if (typingTimeout) {
                clearTimeout(typingTimeout);
            }
            const timeout = setTimeout(() => {
                setIsTextChanged(false);
            }, 1000);
            setTypingTimeout(timeout);
        }
    };

    const config = {
        color: 'red',
        idleAnimation: false,
        idleAnimationCount: 3,
        inverted: false,
        size: 20,
        trailCount: 1,
    };

    const exportTrx = () => {
        setIsCsvLoading(true);
        if (selected) {
            const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
                JSON.stringify(selected),
            )}`;
            const link = document.createElement('a');
            link.href = jsonString;
            link.download = 'slide.json';
            link.click();
            setIsCsvLoading(false);
        } else {
            setIsCsvLoading(false);
            console.error('No slide data available to export');
        }
    };

    // Handle DnD Kit sort end
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setSlides((items) => {
                const oldIndex = items.findIndex(
                    (item) => item._id === active.id,
                );
                const newIndex = items.findIndex(
                    (item) => item._id === over.id,
                );
                setHasUnsavedChanges(true);
                return arrayMove(items, oldIndex, newIndex).map(
                    (item, index) => ({
                        ...item,
                        index,
                    }),
                );
            });
        }
    };

    const handleRemoveSlide = (i: number | null) => {
        if (i === null) {
            return;
        }
        setCurrent(0);
        setSlides((prev) => prev.filter((x, index) => index !== i));
        setHasUnsavedChanges(true);
        setIsDeleteModalOpen(false);
    };

    const handleAddSlide = (props: AddSlideProps) => {
        if (props?.index !== undefined) {
            const newSlide = {
                content: props.content || '',
                title: props.title || '',
                _id: `slide-${Date.now()}`,
            };

            setSlides((prev) =>
                [
                    ...prev.slice(0, props.index),
                    newSlide,
                    ...prev.slice(props.index),
                ].map((slide, index) => ({ ...slide, index })),
            );
        } else {
            setSlides((prev) => [
                ...prev,
                {
                    content: '',
                    title: '',
                    _id: `slide-${Date.now()}`,
                },
            ]);
        }
        setHasUnsavedChanges(true); // Mark that we have unsaved changes
    };

    const formateText = (content: string) => {
        if (content.startsWith('1') || content.startsWith('.')) {
            const textSplit = `<ul>${content
                .split('\n')
                .map((item) => `<li>${item.replace(/^\d+\.\s/, '')}</li>`)
                .join('')}</ul>`;
            return textSplit;
        }

        if (content.includes('\n')) {
            const textWithLineBreaks = content
                .split('\n')
                .map((item) => `${item.replace(/^\d+\.\s/, '')}<br>`)
                .join('');
            return `<p>${textWithLineBreaks}</p>`;
        }

        return content;
    };

    useEffect(() => {
        if (text.length > 0) {
            const formattedText = text.includes('list')
                ? formateText(text)
                : formateText(text);
            handleChangeText(formattedText, 'content');
        }
    }, [text]);

    const handleCloseModal = () => {
        setIsOpen(false);
    };

    const handleAiOpen = () => {
        setIsOpen(true);
    };

    const swipeHandlers = useSwipeable({
        onSwipedLeft: () => {
            if (current < slides.length - 1) {
                setCurrent(current + 1);
            }
        },
        onSwipedRight: () => {
            if (current > 0) {
                setCurrent(current - 1);
            }
        },
        trackMouse: true,
        preventDefaultTouchmoveEvent: true,
    } as SwipeableProps);

    const requestFullscreen = () => {
        if (typeof handle.enter === 'function') {
            handle.enter();
        } else {
            const elem = document.documentElement;

            if (elem.requestFullscreen) {
                elem.requestFullscreen();
            } else if ((elem as any).mozRequestFullScreen) {
                (elem as any).mozRequestFullScreen();
            } else if ((elem as any).webkitRequestFullscreen) {
                (elem as any).webkitRequestFullscreen();
            } else if ((elem as any).msRequestFullscreen) {
                (elem as any).msRequestFullscreen();
            }
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <div className='flex items-center justify-center h-screen'>
                <Loader className='animate-spin' />
            </div>
        );
    }

    return (
        <div className='h-full py-2'>
            <div className='page_wrapper h-full'>
                <GlobalHeader
                    title={
                        <div className='flex flex-row items-center gap-1'>
                            <ArrowLeft
                                className='cursor-pointer'
                                size={20}
                                onClick={() => router.back()}
                            />
                            {title}
                        </div>
                    }
                    subTitle={
                        <h2>
                            <span className='last'> Last Update:</span>{' '}
                            <span>{dayjs(selected?.updatedAt).fromNow()}</span>
                        </h2>
                    }
                />

                <div className='h-full'>
                    {/* Fullscreen Mode */}
                    <FullScreen handle={handle}>
                        <div
                            {...swipeHandlers}
                            style={{ height: '100%', width: '100%' }}
                        >
                            {handle.active && (
                                <>
                                    <Scaled
                                        isSlideOn={isSlideOn}
                                        setIsSlideOn={setIsSlideOn}
                                        slide={slides[current]}
                                        index={current}
                                    />
                                    {isSlideOn && (
                                        <MouseTrail {...config}></MouseTrail>
                                    )}
                                </>
                            )}
                        </div>
                    </FullScreen>

                    {/* Main Editor View */}
                    <div className='flex mt-4 h-full'>
                        {/* Left sidebar for slides */}
                        <div className='w-64 mr-2 bg-foreground border border-forground-border overflow-y-auto h-[calc(100vh-200px)] rounded-md p-2'>
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext
                                    items={slides.map((slide) => slide._id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    <div className='flex flex-col'>
                                        {slides.map((slide, index) => (
                                            <SortableItem
                                                key={slide._id}
                                                slide={slide}
                                                index={index}
                                                current={current}
                                                onClick={() =>
                                                    setCurrent(index)
                                                }
                                            />
                                        ))}
                                    </div>
                                </SortableContext>
                            </DndContext>
                        </div>

                        {/* Main editor area */}
                        <div className='flex-1 border border-forground-border rounded-md shadow-sm bg-foreground'>
                            <div
                                ref={editorContainerRef}
                                className='flex overflow-y-auto flex-col h-[700px]'
                            >
                                {/* Header */}
                                <div className='p-2 bg-primary-light border-b border-forground-border flex items-center justify-between'>
                                    <div className='flex items-center'>
                                        <Image
                                            src={
                                                theme !== 'dark'
                                                    ? '/logo-blue.png'
                                                    : '/logo.png'
                                            }
                                            width={140}
                                            height={40}
                                            alt='logo'
                                        />
                                    </div>
                                </div>

                                {/* Editor */}
                                <div className='flex-1 p-2'>
                                    <MessagePreview
                                        text={slides[current]?.content || ''}
                                    />
                                </div>

                                {/* Footer */}
                                <div className='p-2 bg-primary-light border-t border-forground-border flex items-center justify-between'>
                                    <div className='flex items-center'>
                                        <Phone
                                            size={14}
                                            className='text-primary-white mr-1'
                                        />
                                        <span className='text-sm'>
                                            (586)276-7347
                                        </span>
                                    </div>
                                    <div className='text-sm text-primary-white'>
                                        Web: https://www.schoolshub.ai
                                    </div>
                                </div>
                            </div>
                            <GlobalComment contentId={selected?._id || ''} />
                        </div>
                    </div>
                </div>
            </div>

            <GlobalModal
                open={isOpen}
                setOpen={setIsOpen}
                title='AI Content Generator'
            >
                {/* AI Modal Component would go here */}
                <div className='p-4'>
                    <p>AI content generation functionality will go here.</p>
                </div>
            </GlobalModal>

            <AlertDialog
                open={isDeleteModalOpen}
                onOpenChange={setIsDeleteModalOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete the slide.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => handleRemoveSlide(slideToDelete)}
                            className='bg-red-500 text-white'
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

export default ViewSlide;
