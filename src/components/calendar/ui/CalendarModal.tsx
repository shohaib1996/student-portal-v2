'use client';
import React, { ReactNode, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { Expand, Shrink, XIcon } from 'lucide-react';
import { createPortal } from 'react-dom';
import CalendarTooltip from './CalendarTooltip';

type TProps = {
    open: boolean;
    setOpen: (_: boolean) => void;
    children?: ReactNode;
    triggerText?: string | ReactNode;
    title?: string | ReactNode;
    withTitle?: boolean;
    withTrigger?: boolean;
    resizable?: boolean;
    allowFullScreen?: boolean;
    className?: string;
    customTitle?: string | ReactNode;
    buttons?: ReactNode;
    subTitle?: string;
    customFooter?: ReactNode;
    fullScreen?: boolean;
};

const CalendarModal = React.forwardRef<HTMLDivElement, TProps>(
    (
        {
            open,
            children,
            setOpen,
            title = 'New Modal',
            className,
            subTitle,
            customTitle,
            allowFullScreen = true,

            buttons,
            customFooter,
            withTitle = true,
            fullScreen = false,
            ...rest
        },
        ref,
    ) => {
        const [isFullScreen, setIsFullScreen] = useState(false);

        useEffect(() => {
            if (open) {
                document.body.style.overflow = 'hidden';
            }
            return () => {
                document.body.style.overflow = '';
            };
        }, [open]);

        return (
            <>
                {createPortal(
                    open && (
                        <div
                            id='global_modal'
                            ref={ref}
                            className='fixed inset-0 bg-pure-black/10 backdrop-blur-sm flex items-center justify-center z-[99]'
                        >
                            <div
                                style={
                                    isFullScreen || fullScreen
                                        ? {
                                              width: '100%',
                                              height: '100%',
                                              maxWidth: '100%',
                                          }
                                        : undefined
                                }
                                className={cn(
                                    'bg-foreground rounded-lg w-[90vw] sm:w-[600px] md:w-[700px] lg:w-[800px] max-w-[95%] sm:max-w-[90%] max-h-[90vh] relative flex flex-col',
                                    className,
                                    (isFullScreen || fullScreen) &&
                                        'w-full h-full max-h-full max-w-full',
                                )}
                            >
                                {/* Header */}
                                {customTitle ? (
                                    customTitle
                                ) : (
                                    <div className='flex items-center flex-row justify-between border-b border-forground-border px-5 py-3 pb-2 sticky top-0 rounded-tr-lg rounded-tl-lg'>
                                        <div className=''>
                                            <h3 className='text-black font-medium text-xl'>
                                                {title}
                                            </h3>
                                            {subTitle && (
                                                <p className='text-xs text-gray font-light'>
                                                    {subTitle}
                                                </p>
                                            )}
                                        </div>
                                        <div className='flex items-center gap-2'>
                                            {buttons}
                                            {allowFullScreen && !fullScreen && (
                                                <Button
                                                    onClick={() =>
                                                        setIsFullScreen(
                                                            (prev) => !prev,
                                                        )
                                                    }
                                                    variant={'primary_light'}
                                                    size={'icon'}
                                                >
                                                    {isFullScreen ? (
                                                        <CalendarTooltip tooltip='Minimize'>
                                                            <Shrink className='stroke-primary cursor-pointer' />
                                                        </CalendarTooltip>
                                                    ) : (
                                                        <CalendarTooltip tooltip='Full-Screen'>
                                                            <Expand className='stroke-primary cursor-pointer' />
                                                        </CalendarTooltip>
                                                    )}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Body */}
                                <div className='px-5 pb-4 flex-1 h-full  min-h-20 overflow-y-auto'>
                                    {children}
                                </div>
                                {customFooter && (
                                    <div className='sticky bottom-0 bg-foreground border-t border-forground-border z-10'>
                                        {customFooter}
                                    </div>
                                )}

                                {/* Close Button */}
                                {!isFullScreen && !fullScreen && (
                                    <button
                                        onClick={() => setOpen(false)}
                                        className='absolute rounded-full -right-3 bg-warning size-6 flex items-center justify-center -top-3'
                                    >
                                        <XIcon
                                            className='text-white text-sm'
                                            size={20}
                                        />
                                    </button>
                                )}
                            </div>
                        </div>
                    ),
                    document.body,
                )}
            </>
        );
    },
);

CalendarModal.displayName = 'Modal';

export default CalendarModal;
