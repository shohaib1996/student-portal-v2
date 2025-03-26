'use client';

import React, { type ReactNode, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Expand, Shrink, XIcon } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import GlobalTooltip from '../GlobalTooltip';
import './global_dialog_modal.css';

type GlobalDialogProps = {
    open: boolean;
    header?: boolean;
    children?: ReactNode;
    triggerText?: string | ReactNode;
    title?: string | ReactNode;
    withTrigger?: boolean;
    resizable?: boolean;
    allowFullScreen?: boolean;
    className?: string;
    customTitle?: string | ReactNode;
    buttons?: ReactNode;
    subTitle?: string;
    setOpen: (_: boolean) => void;
    customFooter?: ReactNode;
    showCloseButton?: boolean;
};

const GlobalDialog = React.forwardRef<HTMLDivElement, GlobalDialogProps>(
    (
        {
            open,
            children,
            header = true,
            setOpen,
            title = 'New Dialog',
            className,
            subTitle,
            customTitle,
            allowFullScreen = true,
            buttons,
            customFooter,
            showCloseButton = true,
            ...rest
        },
        ref,
    ) => {
        const [isFullScreen, setIsFullScreen] = useState(false);

        // Lock body scroll when modal is open
        useEffect(() => {
            if (open) {
                document.body.style.overflow = 'hidden';
            }
            return () => {
                document.body.style.overflow = '';
            };
        }, [open]);

        return (
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent
                    ref={ref}
                    className={cn(
                        'global_dialog_modal p-0 bg-foreground rounded-lg w-[90vw] sm:w-[600px] md:w-[700px] lg:w-[800px] max-w-[95%] sm:max-w-[90%] max-h-[90vh] relative flex flex-col fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] gap-2 border',
                        className,
                        isFullScreen &&
                            'w-[100vw] h-[100vh] max-h-[100vh] max-w-[100vw] rounded-none',
                    )}
                    style={
                        isFullScreen
                            ? {
                                  width: '100vw',
                                  height: '100vh',
                                  maxWidth: '100vw',
                                  maxHeight: '100vh',
                                  borderRadius: 0,
                                  transform: 'none',
                                  top: 0,
                                  left: 0,
                              }
                            : undefined
                    }
                >
                    {/* Header */}
                    {customTitle
                        ? customTitle
                        : header && (
                              <div className='flex items-center justify-between border-b px-5 py-3 pb-2 sticky top-0 rounded-tr-lg rounded-tl-lg bg-foreground z-10'>
                                  <div>
                                      <DialogTitle className='text-black font-medium text-xl'>
                                          {title}
                                      </DialogTitle>
                                      {subTitle && (
                                          <DialogDescription className='text-xs text-gray font-light'>
                                              {subTitle}
                                          </DialogDescription>
                                      )}
                                  </div>
                                  <div className='flex items-center gap-2'>
                                      {buttons}
                                      {allowFullScreen && (
                                          <Button
                                              onClick={() =>
                                                  setIsFullScreen(
                                                      (prev) => !prev,
                                                  )
                                              }
                                              variant='primary_light'
                                              size='icon'
                                              className='w-10 h-10'
                                          >
                                              {isFullScreen ? (
                                                  <GlobalTooltip tooltip='Minimize'>
                                                      <Shrink className='stroke-primary cursor-pointer' />
                                                  </GlobalTooltip>
                                              ) : (
                                                  <GlobalTooltip tooltip='Full-Screen'>
                                                      <Expand className='stroke-primary cursor-pointer' />
                                                  </GlobalTooltip>
                                              )}
                                          </Button>
                                      )}
                                  </div>
                              </div>
                          )}

                    {/* Body */}
                    <div className='px-2 pb-2 flex-1 h-full min-h-20 overflow-y-auto'>
                        {children}
                    </div>

                    {/* Footer */}
                    {customFooter && (
                        <div className='sticky bottom-0 bg-background border-t border-forground-border z-10'>
                            {customFooter}
                        </div>
                    )}

                    {/* Close Button */}
                    {!isFullScreen && showCloseButton && (
                        <button
                            onClick={() => setOpen(false)}
                            className='absolute rounded-full -right-3 bg-warning size-6 flex items-center justify-center -top-3 z-20'
                        >
                            <XIcon className='text-white text-sm' size={20} />
                        </button>
                    )}
                </DialogContent>
            </Dialog>
        );
    },
);

GlobalDialog.displayName = 'GlobalDialog';

export default GlobalDialog;
