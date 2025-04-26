'use client';

import type React from 'react';

import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { ResizablePanelGroup, ResizablePanel } from '@/components/ui/resizable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import GlobalBlockEditor from '@/components/editor/GlobalBlockEditor';

interface ResizableNoteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (title: string, description: string) => Promise<void>;
    initialTitle?: string;
    initialDescription?: string;
    isLoading?: boolean;
    mode: 'create' | 'edit';
}

const ResizableNoteModal = ({
    isOpen,
    onClose,
    onSubmit,
    initialTitle = '',
    initialDescription = '',
    isLoading = false,
    mode,
}: ResizableNoteModalProps) => {
    const [title, setTitle] = useState(initialTitle);
    const [description, setDescription] = useState(initialDescription);
    const [modalSize, setModalSize] = useState({ width: 800, height: 600 });

    useEffect(() => {
        setTitle(initialTitle);
        setDescription(initialDescription);
    }, [initialTitle, initialDescription, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(title, description);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent
                className='p-0 border-none max-w-[90vw] max-h-[90vh] w-auto h-auto'
                style={{
                    width: `${modalSize.width}px`,
                    height: `${modalSize.height}px`,
                }}
            >
                <ResizablePanelGroup
                    direction='horizontal'
                    className='w-full h-full'
                >
                    <ResizablePanel defaultSize={100} minSize={30}>
                        <form
                            onSubmit={handleSubmit}
                            className='h-full flex flex-col'
                        >
                            <DialogHeader className='px-6 pt-6 pb-2'>
                                <DialogTitle>
                                    {mode === 'create'
                                        ? 'Create New Note'
                                        : 'Edit Note'}
                                </DialogTitle>
                            </DialogHeader>

                            <div className='flex-1 overflow-auto p-6 pt-2 space-y-4'>
                                <div className='space-y-2'>
                                    <Label htmlFor='note-title'>Title</Label>
                                    <Input
                                        id='note-title'
                                        value={title}
                                        onChange={(e) =>
                                            setTitle(e.target.value)
                                        }
                                        placeholder='Enter title'
                                        required
                                    />
                                </div>

                                <div className='space-y-2 h-[calc(100%-80px)]'>
                                    <Label>Note Content</Label>
                                    <div className='h-full border rounded-md'>
                                        <GlobalBlockEditor
                                            value={description}
                                            onChange={setDescription}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className='flex justify-end p-6 pt-2 space-x-2 border-t'>
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
                    </ResizablePanel>
                </ResizablePanelGroup>

                {/* Resize handles */}
                <div
                    className='absolute bottom-0 right-0 w-4 h-4 cursor-se-resize'
                    onMouseDown={(e) => {
                        e.preventDefault();

                        const startX = e.clientX;
                        const startY = e.clientY;
                        const startWidth = modalSize.width;
                        const startHeight = modalSize.height;

                        const onMouseMove = (e: MouseEvent) => {
                            const newWidth = Math.max(
                                600,
                                startWidth + e.clientX - startX,
                            );
                            const newHeight = Math.max(
                                400,
                                startHeight + e.clientY - startY,
                            );
                            setModalSize({
                                width: newWidth,
                                height: newHeight,
                            });
                        };

                        const onMouseUp = () => {
                            document.removeEventListener(
                                'mousemove',
                                onMouseMove,
                            );
                            document.removeEventListener('mouseup', onMouseUp);
                        };

                        document.addEventListener('mousemove', onMouseMove);
                        document.addEventListener('mouseup', onMouseUp);
                    }}
                >
                    <svg
                        width='16'
                        height='16'
                        viewBox='0 0 24 24'
                        fill='none'
                        xmlns='http://www.w3.org/2000/svg'
                    >
                        <path
                            d='M22 22L12 22M22 22L22 12M22 22L11 11'
                            stroke='currentColor'
                            strokeWidth='2'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                        />
                    </svg>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ResizableNoteModal;
