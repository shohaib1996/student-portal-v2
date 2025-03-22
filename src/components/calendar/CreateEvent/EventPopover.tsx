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
import { createPortal } from 'react-dom';

type Side = 'top' | 'right' | 'bottom' | 'left';

interface EventPopoverContextType {
    isOpen: boolean;
    openPopover: (triggerRect: DOMRect, side: Side) => void;
    closePopover: () => void;
    title: string;
    setTitle: (title: string) => void;
    position: { x: number; y: number };
    isFullScreen: boolean;
    setIsFullScreen: React.Dispatch<React.SetStateAction<boolean>>;
    updateId: string | null;
    setUpdateId: (_: string | null) => void;
    renderPopover: (children: ReactNode) => ReactNode | null;
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
    const [updateId, setUpdateId] = useState<string | null>(null);
    const [popoverContent, setPopoverContent] = useState<ReactNode | null>(
        null,
    );
    const [isFullScreen, setIsFullScreen] = useState(false);

    const openPopover = useCallback((triggerRect: DOMRect, side: Side) => {
        // Calculate position based on the trigger's position and the specified side
        let x = 0;
        let y = 0;

        const padding = 10; // Space between trigger and popover

        switch (side) {
            case 'top':
                x = triggerRect.left + triggerRect.width / 2 - 250; // Center horizontally (600px width / 2)
                y = triggerRect.top - padding - window.scrollY;
                break;
            case 'right':
                x = triggerRect.right + padding;
                y = triggerRect.top + triggerRect.height / 2 - window.scrollY;
                break;
            case 'bottom':
                x = triggerRect.left + triggerRect.width / 2 - 250; // Center horizontally
                y = triggerRect.bottom + padding - window.scrollY;
                break;
            case 'left':
                x = triggerRect.left - 500 - padding; // 600px is the width of the popover
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
        setPopoverContent(null);
    }, []);

    const renderPopover = useCallback((content: ReactNode) => {
        setPopoverContent(content);
        return null;
    }, []);

    return (
        <EventPopoverContext.Provider
            value={{
                isOpen,
                openPopover,
                closePopover,
                title,
                setTitle,
                position,
                renderPopover,
                updateId,
                setUpdateId,
                isFullScreen,
                setIsFullScreen,
            }}
        >
            {children}
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
    updateId?: string | null;
}

export function EventPopoverTrigger({
    children,
    side = 'bottom',
    updateId,
}: EventPopoverTriggerProps) {
    const triggerRef = useRef<HTMLDivElement>(null);
    const { openPopover, closePopover, isOpen, setUpdateId, setIsFullScreen } =
        useEventPopover();

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        if (isOpen) {
            return closePopover();
        }
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            openPopover(rect, side);
        }
        if (updateId) {
            setUpdateId(updateId);
            setIsFullScreen(true);
        }
    };

    return (
        <div ref={triggerRef} onClick={handleClick} className='inline-block'>
            {children}
        </div>
    );
}

interface EventPopoverProps {
    children?: ReactNode;
    title?: ReactNode;
    sidebar?: ReactNode;
    allowFullScreen?: boolean;
    className?: string;
}

export function EventPopover({
    children,
    title,
    sidebar,
    allowFullScreen = true,
    className,
}: EventPopoverProps) {
    const { isOpen, closePopover, position, isFullScreen, setIsFullScreen } =
        useEventPopover();
    const dragControls = useDragControls();
    const x = useMotionValue(position.x);
    const y = useMotionValue(position.y);

    // Update position when position from context changes
    React.useEffect(() => {
        if (isOpen && !isFullScreen) {
            x.set(position.x);
            y.set(position.y);
        }
    }, [position, isOpen, isFullScreen, x, y]);

    React.useEffect(() => {
        if (isOpen && isFullScreen) {
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen, isFullScreen]);

    // Add click outside handler
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;

            // Check if the click is outside the popover
            if (isOpen && !target.closest('.event-popover')) {
                // Check if the click is on a select, dropdown, or other UI control
                // that might be rendered outside the popover's DOM tree
                const isSelectOrDropdown =
                    target.closest('select') ||
                    target.closest('[role="listbox"]') ||
                    target.closest('[role="menu"]') ||
                    target.closest('[role="dialog"]') ||
                    target.closest('.popover') ||
                    target.closest('.dropdown');

                // Only close if it's not a select/dropdown element
                if (!isSelectOrDropdown) {
                    closePopover();
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, closePopover]);

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
            x.set(position.x);
            y.set(position.y);
        }
    };

    return createPortal(
        <div className='fixed inset-0 z-50 pointer-events-none'>
            <motion.div
                className={cn(
                    'bg-background border border-forground-border rounded-lg shadow-lg flex flex-col pointer-events-auto event-popover',
                    isFullScreen
                        ? 'fixed inset-0 w-full h-full rounded-none'
                        : 'w-[500px] h-fit max-h-[80vh] absolute',
                    className,
                )}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{
                    opacity: 1,
                    scale: 1,
                    ...(isFullScreen
                        ? {
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              borderRadius: 0,
                          }
                        : {}),
                }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{
                    duration: 0.2,
                    type: 'spring',
                    stiffness: 300,
                    damping: 30,
                }}
                layout
                drag={!isFullScreen}
                dragControls={dragControls}
                dragListener={false}
                dragMomentum={false}
                style={isFullScreen ? undefined : { x, y }}
            >
                <div className='flex'>
                    <div className='border-r border-forground-border w-full'>
                        <div
                            className='flex items-center justify-between p-4 pb-2 border-b cursor-move'
                            onPointerDown={(e) => {
                                if (!isFullScreen) {
                                    dragControls.start(e);
                                }
                            }}
                        >
                            {title}
                            {allowFullScreen && (
                                <Button
                                    variant='secondary'
                                    size='icon'
                                    onClick={toggleFullScreen}
                                    className='ms-2 text-dark-gray'
                                >
                                    {isFullScreen ? (
                                        <Minimize2 className='h-4 w-4' />
                                    ) : (
                                        <Maximize2 className='h-4 w-4' />
                                    )}
                                </Button>
                            )}
                        </div>
                        <div
                            className={cn(
                                'flex-1 overflow-auto p-4 h-[350px]',
                                { 'h-[calc(100vh-61px)]': isFullScreen },
                            )}
                        >
                            {children}
                        </div>
                    </div>
                    {isFullScreen && sidebar}
                </div>
            </motion.div>
        </div>,
        document.body,
    );
}

// Helper component to render content in the popover from anywhere
export function RenderInPopover({
    children,
    title,
}: {
    children: ReactNode;
    title?: string;
}) {
    const { renderPopover, setTitle } = useEventPopover();

    React.useEffect(() => {
        if (title) {
            setTitle(title);
        }
    }, [title, setTitle]);

    return renderPopover(children);
}
