'use client';

import type React from 'react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import GlobalBlockEditor from '@/components/editor/GlobalBlockEditor';
import { Grip, Minus, X } from 'lucide-react';
import { TagsInput } from '@/components/global/TagsInput';

interface StickyNoteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (
        title: string,
        description: string,
        tags: string[],
    ) => Promise<void>;
    initialTitle?: string;
    initialDescription?: string;
    isLoading?: boolean;
    mode: 'create' | 'edit';
}

const StickyNoteModal = ({
    isOpen,
    onClose,
    onSubmit,
    initialTitle = '',
    initialDescription = '',
    isLoading = false,
    mode,
}: StickyNoteModalProps) => {
    const [title, setTitle] = useState(initialTitle);
    const [description, setDescription] = useState(initialDescription);
    const [minimized, setMinimized] = useState(false);
    const [tags, setTags] = useState<string[]>([]);

    // Validation: disable submit if title or description are empty or whitespace

    const isSubmitDisabled =
        isLoading ||
        title.trim().length === 0 ||
        description.trim().length === 0;

    // Use refs for position and size to avoid re-renders during drag/resize
    const positionRef = useRef({
        x: window.innerWidth / 2 - 300,
        y: window.innerHeight / 2 - 250,
    });
    const sizeRef = useRef({ width: 600, height: 500 });

    // Refs for tracking drag/resize state
    const isDraggingRef = useRef(false);
    const isResizingRef = useRef(false);
    const resizeDirectionRef = useRef('');
    const dragStartRef = useRef({ x: 0, y: 0 });

    // Ref for the note element
    const noteRef = useRef<HTMLDivElement>(null);

    // For rendering position and size (not used during drag/resize)
    const [renderPosition, setRenderPosition] = useState(positionRef.current);
    const [renderSize, setRenderSize] = useState(sizeRef.current);

    // Reset form values when props change
    useEffect(() => {
        // Reset form values when props change
        setTitle(initialTitle);
        setDescription(initialDescription);

        // Center the modal on open, with mobile-responsive positioning
        if (isOpen) {
            const isMobile = window.innerWidth < 768;

            if (isMobile) {
                // On mobile, center the modal with fixed dimensions
                const mobileWidth = Math.min(window.innerWidth - 32, 600);
                const mobileHeight = Math.min(window.innerHeight - 64, 500);

                positionRef.current = {
                    x: (window.innerWidth - mobileWidth) / 2,
                    y: (window.innerHeight - mobileHeight) / 2,
                };
                sizeRef.current = { width: mobileWidth, height: mobileHeight };
            } else {
                // On desktop, use the existing dimensions
                positionRef.current = {
                    x: window.innerWidth / 2 - 300,
                    y: window.innerHeight / 2 - 250,
                };
                sizeRef.current = { width: 600, height: 500 };
            }

            setRenderPosition({ ...positionRef.current });
            setRenderSize({ ...sizeRef.current });
        }
    }, [initialTitle, initialDescription, isOpen]);

    // Add a window resize handler to keep the modal properly positioned:

    useEffect(() => {
        const handleResize = () => {
            if (isOpen) {
                const isMobile = window.innerWidth < 768;

                if (isMobile) {
                    // On mobile, center the modal with fixed dimensions
                    const mobileWidth = Math.min(window.innerWidth - 32, 600);
                    const mobileHeight = Math.min(window.innerHeight - 64, 500);

                    positionRef.current = {
                        x: (window.innerWidth - mobileWidth) / 2,
                        y: (window.innerHeight - mobileHeight) / 2,
                    };
                    sizeRef.current = {
                        width: mobileWidth,
                        height: mobileHeight,
                    };

                    setRenderPosition({ ...positionRef.current });
                    setRenderSize({ ...sizeRef.current });

                    // Update the DOM element directly for immediate effect
                    if (noteRef.current) {
                        noteRef.current.style.left = `${positionRef.current.x}px`;
                        noteRef.current.style.top = `${positionRef.current.y}px`;
                        noteRef.current.style.width = `${sizeRef.current.width}px`;
                        noteRef.current.style.height = minimized
                            ? '50px'
                            : `${sizeRef.current.height}px`;
                    }
                }
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isOpen, minimized]);

    // Handle mouse move for dragging and resizing
    const handleMouseMove = useCallback(
        (e: MouseEvent) => {
            if (!isDraggingRef.current && !isResizingRef.current) {
                return;
            }

            requestAnimationFrame(() => {
                if (isDraggingRef.current) {
                    const dx = e.clientX - dragStartRef.current.x;
                    const dy = e.clientY - dragStartRef.current.y;

                    const newX = Math.max(
                        0,
                        Math.min(
                            window.innerWidth - sizeRef.current.width,
                            positionRef.current.x + dx,
                        ),
                    );
                    const newY = Math.max(
                        0,
                        Math.min(
                            window.innerHeight - 40,
                            positionRef.current.y + dy,
                        ),
                    );

                    positionRef.current = { x: newX, y: newY };
                    dragStartRef.current = { x: e.clientX, y: e.clientY };

                    if (noteRef.current) {
                        noteRef.current.style.left = `${newX}px`;
                        noteRef.current.style.top = `${newY}px`;
                    }
                }

                if (isResizingRef.current) {
                    const dx = e.clientX - dragStartRef.current.x;
                    const dy = e.clientY - dragStartRef.current.y;
                    dragStartRef.current = { x: e.clientX, y: e.clientY };
                    let newWidth = sizeRef.current.width;
                    let newHeight = sizeRef.current.height;
                    let newX = positionRef.current.x;
                    let newY = positionRef.current.y;
                    const direction = resizeDirectionRef.current;

                    if (direction.includes('e')) {
                        newWidth = Math.max(300, sizeRef.current.width + dx);
                        newWidth = Math.min(
                            window.innerWidth - positionRef.current.x,
                            newWidth,
                        );
                    }
                    if (direction.includes('w')) {
                        const maxLeftMove = positionRef.current.x;
                        const actualWidthChange = Math.max(-maxLeftMove, dx);
                        newWidth = Math.max(
                            300,
                            sizeRef.current.width - actualWidthChange,
                        );
                        newX = positionRef.current.x + actualWidthChange;
                    }
                    if (direction.includes('s')) {
                        newHeight = Math.max(200, sizeRef.current.height + dy);
                        newHeight = Math.min(
                            window.innerHeight - positionRef.current.y,
                            newHeight,
                        );
                    }
                    if (direction.includes('n')) {
                        const actualHeightChange = Math.max(
                            -positionRef.current.y,
                            dy,
                        );
                        newHeight = Math.max(
                            200,
                            sizeRef.current.height - actualHeightChange,
                        );
                        newY = positionRef.current.y + actualHeightChange;
                    }

                    sizeRef.current = { width: newWidth, height: newHeight };
                    positionRef.current = { x: newX, y: newY };

                    if (noteRef.current) {
                        noteRef.current.style.width = `${newWidth}px`;
                        noteRef.current.style.height = minimized
                            ? '40px'
                            : `${newHeight}px`;
                        noteRef.current.style.left = `${newX}px`;
                        noteRef.current.style.top = `${newY}px`;
                    }
                }
            });
        },
        [minimized],
    );

    // Handle mouse up to end dragging/resizing
    const handleMouseUp = useCallback(() => {
        if (isDraggingRef.current || isResizingRef.current) {
            isDraggingRef.current = false;
            isResizingRef.current = false;
            setRenderPosition({ ...positionRef.current });
            setRenderSize({ ...sizeRef.current });
        }
    }, []);

    useEffect(() => {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [handleMouseMove, handleMouseUp]);

    const startDrag = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        dragStartRef.current = { x: e.clientX, y: e.clientY };
        isDraggingRef.current = true;
    }, []);

    const toggleMinimize = useCallback(() => {
        setMinimized((prev) => !prev);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedTitle = title.trim();
        const trimmedDescription = description.trim();
        if (!trimmedTitle || !trimmedDescription) {
            return;
        }
        await onSubmit(trimmedTitle, trimmedDescription, tags);
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div
            ref={noteRef}
            className='fixed z-50 shadow-lg rounded-md bg-background border border-border overflow-hidden max-w-[calc(100vw-16px)] max-h-[calc(100vh-16px)]'
            style={{
                left: `${renderPosition.x}px`,
                top: `${renderPosition.y}px`,
                width: `${renderSize.width}px`,
                height: minimized ? '50px' : `${renderSize.height}px`,
                transition: 'height 0.2s ease',
            }}
        >
            <div
                className='bg-primary-light px-2 py-2 cursor-move flex items-center justify-between select-none'
                onMouseDown={startDrag}
            >
                <div className='flex items-center gap-2'>
                    <Grip className='h-4 w-4 text-muted-foreground' />
                    <span className='font-medium truncate'>
                        {mode === 'create' ? 'New Note' : title || 'Edit Note'}
                    </span>
                </div>
                <div className='flex items-center gap-1'>
                    <Button
                        size='icon'
                        className='h-6 w-6'
                        variant='ghost'
                        onClick={toggleMinimize}
                        onMouseDown={(e) => e.stopPropagation()}
                    >
                        <Minus className='h-4 w-4' />
                    </Button>
                    <Button
                        variant='ghost'
                        size='icon'
                        className='h-6 w-6'
                        onClick={onClose}
                        onMouseDown={(e) => e.stopPropagation()}
                    >
                        <X className='h-3 w-3' />
                    </Button>
                </div>
            </div>

            {!minimized && (
                <form
                    onSubmit={handleSubmit}
                    className='h-[calc(100%-40px)] flex flex-col'
                >
                    <div className='flex-1 overflow-auto p-2 space-y-2'>
                        <div className='space-y-2'>
                            <Label htmlFor='note-title'>Title</Label>
                            <Input
                                className='bg-foreground'
                                id='note-title'
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder='Enter title'
                                required
                            />
                        </div>
                        <div className='space-y-2'>
                            <Label htmlFor='note-title'>Tags</Label>
                            <TagsInput
                                tags={[]}
                                selectedTags={tags}
                                setSelectedTags={(val) => setTags(val)}
                            />
                        </div>
                        <div className='space-y-2'>
                            <Label>Note Content</Label>
                            <div className='h-[calc(100%-160px)] border rounded-md'>
                                <GlobalBlockEditor
                                    value={description}
                                    onChange={setDescription}
                                />
                            </div>
                        </div>
                    </div>

                    <div className='flex justify-end p-3 mb-3 space-x-2 border-t bg-muted/20'>
                        <Button
                            type='button'
                            variant='outline'
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                        <Button type='submit' disabled={isSubmitDisabled}>
                            {isLoading
                                ? 'Saving...'
                                : mode === 'create'
                                  ? 'Save Note'
                                  : 'Update Note'}
                        </Button>
                    </div>
                </form>
            )}

            {!minimized && (
                <>
                    {/* Resize handles */}
                    <div
                        className='absolute w-3 h-3 bottom-0 right-0 cursor-se-resize'
                        onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            dragStartRef.current = {
                                x: e.clientX,
                                y: e.clientY,
                            };
                            isResizingRef.current = true;
                            resizeDirectionRef.current = 'se';
                        }}
                    />
                    <div
                        className='absolute w-3 h-3 bottom-0 left-0 cursor-sw-resize'
                        onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            dragStartRef.current = {
                                x: e.clientX,
                                y: e.clientY,
                            };
                            isResizingRef.current = true;
                            resizeDirectionRef.current = 'sw';
                        }}
                    />
                    <div
                        className='absolute w-3 h-3 top-0 right-0 cursor-ne-resize'
                        onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            dragStartRef.current = {
                                x: e.clientX,
                                y: e.clientY,
                            };
                            isResizingRef.current = true;
                            resizeDirectionRef.current = 'ne';
                        }}
                    />
                    <div
                        className='absolute w-3 h-3 top-0 left-0 cursor-nw-resize'
                        onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            dragStartRef.current = {
                                x: e.clientX,
                                y: e.clientY,
                            };
                            isResizingRef.current = true;
                            resizeDirectionRef.current = 'nw';
                        }}
                    />
                    <div
                        className='absolute w-1 h-full top-0 right-0 cursor-e-resize'
                        onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            dragStartRef.current = {
                                x: e.clientX,
                                y: e.clientY,
                            };
                            isResizingRef.current = true;
                            resizeDirectionRef.current = 'e';
                        }}
                    />
                    <div
                        className='absolute w-1 h-full top-0 left-0 cursor-w-resize'
                        onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            dragStartRef.current = {
                                x: e.clientX,
                                y: e.clientY,
                            };
                            isResizingRef.current = true;
                            resizeDirectionRef.current = 'w';
                        }}
                    />
                    <div
                        className='absolute w-full h-1 bottom-0 left-0 cursor-s-resize'
                        onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            dragStartRef.current = {
                                x: e.clientX,
                                y: e.clientY,
                            };
                            isResizingRef.current = true;
                            resizeDirectionRef.current = 's';
                        }}
                    />
                    <div
                        className='absolute w-full h-1 top-0 left-0 cursor-n-resize'
                        onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            dragStartRef.current = {
                                x: e.clientX,
                                y: e.clientY,
                            };
                            isResizingRef.current = true;
                            resizeDirectionRef.current = 'n';
                        }}
                    />
                </>
            )}
        </div>
    );
};

export default StickyNoteModal;
