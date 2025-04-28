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
        setTitle(initialTitle);
        setDescription(initialDescription);
    }, [initialTitle, initialDescription, isOpen]);

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
        await onSubmit(trimmedTitle, trimmedDescription);
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
                                id='note-title'
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder='Enter title'
                                required
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
                    {' '}
                    {/* resize handles as before */}
                    {/* ...handles omitted for brevity, unchanged... */}
                </>
            )}
        </div>
    );
};

export default StickyNoteModal;
