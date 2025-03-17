'use client';

import {
    useState,
    createContext,
    useContext,
    useRef,
    useCallback,
    type ReactNode,
} from 'react';
import * as React from 'react';
import { X, Maximize2, Minimize2, GripHorizontal } from 'lucide-react';
import { motion, useDragControls, useMotionValue } from 'framer-motion';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import CreateEventModal from './CreateEventModal';

type Side = 'top' | 'right' | 'bottom' | 'left';

interface EventPopoverContextType {
    isOpen: boolean;
    openPopover: (triggerRect: DOMRect, side: Side) => void;
    closePopover: () => void;
    title: string;
    setTitle: (title: string) => void;
}

const EventPopoverContext = createContext<EventPopoverContextType | undefined>(
    undefined,
);

interface EventPopoverProviderProps {
    children: ReactNode;
}

export function EventPopoverProvider({ children }: EventPopoverProviderProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [title, setTitle] = useState('');

    const openPopover = useCallback((triggerRect: DOMRect, side: Side) => {
        // Calculate position based on the trigger's position and the specified side
        let x = 0;
        let y = 0;

        const padding = 10; // Space between trigger and popover

        switch (side) {
            case 'top':
                x = triggerRect.left + triggerRect.width / 2 - 300; // Center horizontally (600px width / 2)
                y = triggerRect.top - padding - window.scrollY;
                break;
            case 'right':
                x = triggerRect.right + padding;
                y = triggerRect.top + triggerRect.height / 2 - window.scrollY;
                break;
            case 'bottom':
                x = triggerRect.left + triggerRect.width / 2 - 300; // Center horizontally
                y = triggerRect.bottom + padding - window.scrollY;
                break;
            case 'left':
                x = triggerRect.left - 600 - padding; // 600px is the width of the popover
                y = triggerRect.top + triggerRect.height / 2 - window.scrollY;
                break;
        }

        // Ensure the popover stays within the viewport
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        x = Math.max(10, Math.min(x, viewportWidth - 610)); // 10px margin, 600px width + 10px margin
        y = Math.max(10, Math.min(y, viewportHeight - 400)); // Assuming a min height of ~400px

        setPosition({ x, y });
        setIsOpen(true);
    }, []);

    const closePopover = useCallback(() => {
        setIsOpen(false);
    }, []);

    return (
        <EventPopoverContext.Provider
            value={{ isOpen, openPopover, closePopover, title, setTitle }}
        >
            {children}
            <EventPopover
                isOpen={isOpen}
                onClose={closePopover}
                title={title}
                initialPosition={position}
            >
                <CreateEventModal />
            </EventPopover>
        </EventPopoverContext.Provider>
    );
}

export function useEventPopover() {
    const context = useContext(EventPopoverContext);
    if (!context) {
        throw new Error(
            'useEventPopover must be used within a EventPopoverProvider',
        );
    }
    return context;
}

interface EventPopoverTriggerProps {
    children: ReactNode;
    side?: Side;
}

export function EventPopoverTrigger({
    children,
    side = 'bottom',
}: EventPopoverTriggerProps) {
    const triggerRef = useRef<HTMLDivElement>(null);
    const { openPopover, setTitle } = useEventPopover();

    const handleClick = () => {
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            openPopover(rect, side);
        }
    };

    return (
        <div ref={triggerRef} onClick={handleClick} className='inline-block'>
            {children}
        </div>
    );
}

interface EventPopoverProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children?: ReactNode;
    initialPosition: { x: number; y: number };
}

export function EventPopover({
    isOpen,
    onClose,
    title,
    children,
    initialPosition,
}: EventPopoverProps) {
    const [isFullScreen, setIsFullScreen] = useState(false);
    const dragControls = useDragControls();
    const x = useMotionValue(initialPosition.x);
    const y = useMotionValue(initialPosition.y);

    // Update position when initialPosition changes
    React.useEffect(() => {
        if (isOpen && !isFullScreen) {
            x.set(initialPosition.x);
            y.set(initialPosition.y);
        }
    }, [initialPosition, isOpen, isFullScreen, x, y]);

    // Add click outside handler
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            // Check if the click is outside the popover
            if (isOpen && !target.closest('.event-popover')) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    if (!isOpen) {
        return null;
    }

    const toggleFullScreen = () => {
        setIsFullScreen(!isFullScreen);
        // Reset position when toggling fullscreen
        if (!isFullScreen) {
            x.set(0);
            y.set(0);
        } else {
            x.set(initialPosition.x);
            y.set(initialPosition.y);
        }
    };

    return (
        <div className='fixed inset-0 z-50 pointer-events-none'>
            <motion.div
                className={cn(
                    'bg-white rounded-lg shadow-lg flex flex-col pointer-events-auto event-popover',
                    isFullScreen
                        ? 'fixed inset-0 w-full h-full rounded-none'
                        : 'w-[600px] max-h-[80vh] absolute',
                )}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                drag={!isFullScreen}
                dragControls={dragControls}
                dragListener={false}
                dragMomentum={false}
                style={isFullScreen ? undefined : { x, y }}
            >
                <div
                    className='flex items-center justify-between p-4 border-b cursor-move'
                    onPointerDown={(e) => {
                        if (!isFullScreen) {
                            dragControls.start(e);
                        }
                    }}
                >
                    <div className='flex items-center'>
                        <GripHorizontal className='h-5 w-5 mr-2 text-gray-400' />
                        <h2 className='text-lg font-semibold'>{title}</h2>
                    </div>
                    <div className='flex items-center gap-2'>
                        <Button
                            variant='ghost'
                            size='icon'
                            onClick={toggleFullScreen}
                            className='h-8 w-8'
                        >
                            {isFullScreen ? (
                                <Minimize2 className='h-4 w-4' />
                            ) : (
                                <Maximize2 className='h-4 w-4' />
                            )}
                        </Button>
                        <Button
                            variant='ghost'
                            size='icon'
                            onClick={() => {
                                onClose();
                                setIsFullScreen(false);
                            }}
                            className='h-8 w-8'
                        >
                            <X className='h-4 w-4' />
                        </Button>
                    </div>
                </div>
                <div className='flex-1 overflow-auto p-4'>{children}</div>
            </motion.div>
        </div>
    );
}
