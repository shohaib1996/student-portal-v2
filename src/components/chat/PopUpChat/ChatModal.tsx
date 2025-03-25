'use client';

import type React from 'react';
import { useEffect, useState, useRef, type ReactNode } from 'react';
import { motion, useMotionValue, useDragControls } from 'framer-motion';
import { X, GripVertical, Maximize2, Minimize2 } from 'lucide-react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ChatModalProps {
    children: ReactNode;
    title?: ReactNode;
    position: number; // Position from right to left (0 = rightmost)
    onClose: () => void;
    onMinimize?: () => void;
    isOpen?: boolean;
    width?: number;
    maxWidth?: number;
}

const ChatModal: React.FC<ChatModalProps> = ({
    children,
    title,
    position,
    onClose,
    onMinimize,
    isOpen = true,
    width = 360,
    maxWidth = 500,
}) => {
    const [isMounted, setIsMounted] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Calculate position based on the number of modals
    const rightOffset = 20; // Distance from right edge in pixels
    const spaceBetween = 20; // Space between modals in pixels
    const rightPosition = rightOffset + position * (width + spaceBetween);

    // For animation and dragging
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const dragControls = useDragControls();

    // Handle drag to keep modal within viewport bounds
    const handleDragConstraints = () => {
        if (!modalRef.current || !containerRef.current) {
            return;
        }

        const modalRect = modalRef.current.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();

        const minDistance = 130; // Minimum distance from edges

        // Current position
        let currentX = x.get();
        let currentY = y.get();

        // Calculate boundaries
        const maxLeft = -containerRect.width + modalRect.width + minDistance;
        const maxRight = containerRect.width - modalRect.width - 30;
        const maxTop = -containerRect.height + modalRect.height + minDistance;
        const maxBottom = containerRect.height - modalRect.height + 200;

        // Constrain X position
        if (currentX < maxLeft) {
            currentX = maxLeft;
        }
        if (currentX > maxRight) {
            currentX = maxRight;
        }

        // Constrain Y position
        if (currentY < maxTop) {
            currentY = maxTop;
        }
        if (currentY > maxBottom) {
            currentY = maxBottom;
        }

        // Apply constrained position
        x.set(currentX);
        y.set(currentY);
    };

    // Use client-side rendering
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Add drag event listeners to handle constraints during drag
    useEffect(() => {
        if (isMounted && modalRef.current) {
            // Check position periodically during drag
            const dragInterval = setInterval(handleDragConstraints, 50);

            return () => {
                clearInterval(dragInterval);
            };
        }
    }, [isMounted, x, y]);

    if (!isMounted) {
        return null;
    }

    return createPortal(
        <div
            ref={containerRef}
            className='fixed inset-0 z-40 pointer-events-none hidden lg:block'
        >
            <motion.div
                ref={modalRef}
                className={cn(
                    'bg-foreground border border-forground-border rounded-lg rounded-tr-none shadow-[0px_2px_20px_0px_rgba(0,0,0,0.50)] flex flex-col pointer-events-auto',
                    'fixed',
                )}
                initial={{ opacity: 0, y: 20 }}
                animate={{
                    opacity: 1,
                    y: 0,
                }}
                exit={{ opacity: 0, y: 20 }}
                transition={{
                    duration: 0.2,
                    type: 'spring',
                    stiffness: 300,
                    damping: 30,
                }}
                style={{
                    width: `${width}px`,
                    maxWidth: `${maxWidth}px`,
                    right: `${rightPosition}px`,
                    height: '600px',
                    maxHeight: '80vh',
                    bottom: '80px',
                    x,
                    y,
                }}
                drag
                dragControls={dragControls}
                dragListener={false}
                dragMomentum={false}
                onDrag={handleDragConstraints}
                onDragEnd={handleDragConstraints}
            >
                {/* Using two divs for the polygon - one for border and shadow, one for content */}
                <div className='relative'>
                    {/* Border and shadow element with slightly larger clip path */}
                    <div
                        className='absolute -top-[26px] right-0 z-[9] h-[26px] w-[150px]
                                border-l border-r border-forground-border
                                shadow-[0px_-6px_10px_-2px_rgba(0,0,0,0.3),_-5px_0px_8px_-3px_rgba(0,0,0,0.15),_5px_0px_8px_-3px_rgba(0,0,0,0.15)]'
                        style={{
                            clipPath:
                                'polygon(10% 0, 90% 0, 100% 100%, 0% 100%)',
                            borderTopLeftRadius: '8px',
                            borderTopRightRadius: '8px',
                            overflow: 'hidden',
                        }}
                    >
                        {/* Inner div to help with rounded corners */}
                        <div className='w-full h-full bg-transparent'></div>
                    </div>

                    {/* Background & content element */}
                    <div
                        className='absolute -top-[25px] right-0 z-10 h-[25px] w-fit px-4 
                                bg-foreground  flex items-center justify-end'
                        style={{
                            clipPath:
                                'polygon(11% 0, 89% 0, 100% 100%, 0% 100%)',
                            borderTopLeftRadius: '8px',
                            borderTopRightRadius: '8px',
                            overflow: 'hidden',
                        }}
                    >
                        <div className='flex items-center gap-1'>
                            <Button
                                variant='ghost'
                                size='icon'
                                className='h-7 w-7 rounded-full hover:bg-primary-dark bg-transparent cursor-grab active:cursor-grabbing'
                                onPointerDown={(e) => dragControls.start(e)}
                            >
                                <GripVertical className='h-4 w-4 text-dark-gray' />
                            </Button>
                            {onMinimize && (
                                <Button
                                    variant='ghost'
                                    size='icon'
                                    onClick={onMinimize}
                                    className='h-7 w-7 rounded-full hover:bg-primary-dark bg-transparent'
                                >
                                    <Minimize2 className='h-4 w-4 text-dark-gray' />
                                </Button>
                            )}
                            <Button
                                variant='ghost'
                                size='icon'
                                onClick={onClose}
                                className='h-7 w-7 rounded-full hover:bg-primary-dark bg-transparent'
                            >
                                <X className='h-4 w-4 text-danger' />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Content area */}
                <div className='w-full h-full overflow-hidden pt-2 px-2 pb-2'>
                    {children}
                </div>
            </motion.div>
        </div>,
        document.body,
    );
};

export default ChatModal;
