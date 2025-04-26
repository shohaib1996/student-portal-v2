'use client';

import type React from 'react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import GlobalBlockEditor from '@/components/editor/GlobalBlockEditor';
import { Grip, Minus, X } from 'lucide-react';

interface StickyNoteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (title: string, description: string) => Promise<void>;
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
        setTitle(initialTitle);
        setDescription(initialDescription);
    }, [initialTitle, initialDescription, isOpen]);

    // Handle mouse move for dragging and resizing
    const handleMouseMove = useCallback(
        (e: MouseEvent) => {
            if (!isDraggingRef.current && !isResizingRef.current) {
                return;
            }

            // Use requestAnimationFrame for smoother performance
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

                    // Update the DOM directly for smoother dragging
                    if (noteRef.current) {
                        noteRef.current.style.left = `${newX}px`;
                        noteRef.current.style.top = `${newY}px`;
                    }
                }

                if (isResizingRef.current) {
                    const dx = e.clientX - dragStartRef.current.x;
                    const dy = e.clientY - dragStartRef.current.y;

                    let newWidth = sizeRef.current.width;
                    let newHeight = sizeRef.current.height;
                    let newX = positionRef.current.x;
                    let newY = positionRef.current.y;

                    // Handle different resize directions
                    if (resizeDirectionRef.current.includes('e')) {
                        // For east direction, ensure we don't exceed screen width
                        newWidth = Math.max(
                            300,
                            Math.min(
                                window.innerWidth - positionRef.current.x,
                                sizeRef.current.width + dx,
                            ),
                        );
                    }
                    if (resizeDirectionRef.current.includes('w')) {
                        // For west direction, when dragging left (negative dx), the width should increase
                        // When dragging right (positive dx), the width should decrease
                        let newWidth = Math.max(
                            300,
                            sizeRef.current.width - dx,
                        );
                        const widthDiff = newWidth - sizeRef.current.width;
                        newX = positionRef.current.x - widthDiff;

                        // Ensure we don't move beyond the left edge of the screen
                        if (newX < 0) {
                            newWidth =
                                sizeRef.current.width + positionRef.current.x;
                            newX = 0;
                        }

                        newWidth = Math.max(300, newWidth);
                        sizeRef.current.width = newWidth;
                        positionRef.current.x = newX;
                    }
                    if (resizeDirectionRef.current.includes('s')) {
                        // For south direction, ensure we don't exceed screen height
                        newHeight = Math.max(
                            200,
                            Math.min(
                                window.innerHeight - positionRef.current.y - 40,
                                sizeRef.current.height + dy,
                            ),
                        );
                    }
                    if (resizeDirectionRef.current.includes('n')) {
                        // For north direction
                        const maxTopMove = positionRef.current.y;
                        const actualTopMove = Math.max(
                            -maxTopMove,
                            Math.min(sizeRef.current.height - 200, -dy),
                        );
                        newHeight = sizeRef.current.height - actualTopMove;
                        newY = positionRef.current.y + actualTopMove;
                    }

                    // Only update width/height if not already handled by w/e directions
                    if (
                        !resizeDirectionRef.current.includes('w') &&
                        !resizeDirectionRef.current.includes('e')
                    ) {
                        sizeRef.current.width = newWidth;
                    }
                    if (
                        !resizeDirectionRef.current.includes('n') &&
                        !resizeDirectionRef.current.includes('s')
                    ) {
                        sizeRef.current.height = newHeight;
                    }

                    // Only update position if not already handled by w/n directions
                    if (!resizeDirectionRef.current.includes('w')) {
                        positionRef.current.x = newX;
                    }
                    if (!resizeDirectionRef.current.includes('n')) {
                        positionRef.current.y = newY;
                    }

                    dragStartRef.current = { x: e.clientX, y: e.clientY };

                    // Update the DOM directly for smoother resizing
                    if (noteRef.current) {
                        noteRef.current.style.width = `${sizeRef.current.width}px`;
                        noteRef.current.style.height = minimized
                            ? '40px'
                            : `${sizeRef.current.height}px`;
                        noteRef.current.style.left = `${positionRef.current.x}px`;
                        noteRef.current.style.top = `${positionRef.current.y}px`;
                    }
                }
            });
        },
        [minimized],
    );

    // Handle mouse up to end dragging/resizing
    const handleMouseUp = useCallback((e: MouseEvent) => {
        if (isDraggingRef.current || isResizingRef.current) {
            // Explicitly set these to false to ensure resize/drag stops
            isDraggingRef.current = false;
            isResizingRef.current = false;

            // Update state for rendering after drag/resize ends
            setRenderPosition({ ...positionRef.current });
            setRenderSize({ ...sizeRef.current });
        }
    }, []);

    // Set up and clean up event listeners
    useEffect(() => {
        // Add event listeners to the document to ensure they work even if mouse moves outside the component
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [handleMouseMove, handleMouseUp]);

    // Start dragging
    const startDrag = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        dragStartRef.current = { x: e.clientX, y: e.clientY };
        isDraggingRef.current = true;
    }, []);

    // Start resizing
    const startResize = useCallback(
        (e: React.MouseEvent, direction: string) => {
            e.preventDefault();
            e.stopPropagation();
            dragStartRef.current = { x: e.clientX, y: e.clientY };
            isResizingRef.current = true;
            resizeDirectionRef.current = direction;
        },
        [],
    );

    // Toggle minimize state
    const toggleMinimize = useCallback(() => {
        setMinimized((prev) => !prev);
    }, []);

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(title, description);
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div
            ref={noteRef}
            className='fixed z-50 shadow-lg rounded-md bg-background border border-border overflow-hidden'
            style={{
                left: `${renderPosition.x}px`,
                top: `${renderPosition.y}px`,
                width: `${renderSize.width}px`,
                height: minimized ? '40px' : `${renderSize.height}px`,
                transition: 'height 0.2s ease',
            }}
        >
            {/* Header/Drag Handle - Only draggable when mouse is pressed on this element */}
            <div
                className='bg-primary-light dark:bg-muted px-3 py-2 cursor-move flex items-center justify-between select-none'
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
                        variant='ghost'
                        size='icon'
                        className='h-6 w-6'
                        onClick={toggleMinimize}
                        onMouseDown={(e) => e.stopPropagation()} // Prevent drag when clicking buttons
                    >
                        <Minus className='h-3 w-3' />
                    </Button>
                    <Button
                        variant='ghost'
                        size='icon'
                        className='h-6 w-6'
                        onClick={onClose}
                        onMouseDown={(e) => e.stopPropagation()} // Prevent drag when clicking buttons
                    >
                        <X className='h-3 w-3' />
                    </Button>
                </div>
            </div>

            {/* Content */}
            {!minimized && (
                <form
                    onSubmit={handleSubmit}
                    className='h-[calc(100%-40px)] flex flex-col'
                >
                    <div className='flex-1 overflow-auto p-4 space-y-3'>
                        <div className='space-y-2'>
                            <Label htmlFor='note-title'>Title</Label>
                            <Input
                                id='note-title'
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder='Enter title'
                                required
                            />
                        </div>

                        <div className='space-y-2 h-[calc(100%-160px)]'>
                            <Label>Note Content</Label>
                            <div className='h-full border rounded-md'>
                                <GlobalBlockEditor
                                    value={description}
                                    onChange={setDescription}
                                />
                            </div>
                        </div>
                    </div>

                    <div className='flex justify-end p-3 space-x-2 border-t bg-muted/20'>
                        <Button
                            type='button'
                            variant='outline'
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                        <Button type='submit' disabled={isLoading}>
                            {isLoading
                                ? 'Saving...'
                                : mode === 'create'
                                  ? 'Save Note'
                                  : 'Update Note'}
                        </Button>
                    </div>
                </form>
            )}

            {/* Resize handles - Only active when mouse is pressed on them */}
            {!minimized && (
                <>
                    <div
                        className='absolute top-0 left-0 w-8 h-8 cursor-nw-resize'
                        onMouseDown={(e) => startResize(e, 'nw')}
                    ></div>
                    <div
                        className='absolute top-0 right-0 w-8 h-8 cursor-ne-resize'
                        onMouseDown={(e) => startResize(e, 'ne')}
                    ></div>
                    <div
                        className='absolute bottom-0 left-0 w-8 h-8 cursor-sw-resize'
                        onMouseDown={(e) => startResize(e, 'sw')}
                    ></div>
                    <div
                        className='absolute bottom-0 right-0 w-8 h-8 cursor-se-resize'
                        onMouseDown={(e) => startResize(e, 'se')}
                    ></div>

                    <div
                        className='absolute top-0 left-8 right-8 h-4 cursor-n-resize'
                        onMouseDown={(e) => startResize(e, 'n')}
                    ></div>
                    <div
                        className='absolute bottom-0 left-8 right-8 h-4 cursor-s-resize'
                        onMouseDown={(e) => startResize(e, 's')}
                    ></div>
                    <div
                        className='absolute left-0 top-8 bottom-8 w-4 cursor-w-resize'
                        onMouseDown={(e) => startResize(e, 'w')}
                    ></div>
                    <div
                        className='absolute right-0 top-8 bottom-8 w-4 cursor-e-resize'
                        onMouseDown={(e) => startResize(e, 'e')}
                    ></div>
                </>
            )}
        </div>
    );
};

export default StickyNoteModal;
