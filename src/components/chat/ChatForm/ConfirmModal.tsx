'use client';

import type React from 'react';
import { useCallback, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Check, HelpCircle, XCircle, Loader2 } from 'lucide-react';
import GlobalDialog from '@/components/global/GlobalDialogModal/GlobalDialog';

interface ConfirmModalProps {
    opened: boolean;
    close: () => void;
    handleConfirm: () => void;
    text: string;
    subtitle?: string;
    className?: any;
    confirmText?: string;
    cancelText?: string;
    icon?: ReactNode;
    iconColor?: string;
    confirmIcon?: ReactNode;
    variant?:
        | 'default'
        | 'destructive'
        | 'outline'
        | 'secondary'
        | 'ghost'
        | 'link'
        | 'primary_light';
    isLoading?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
    opened,
    close,
    handleConfirm,
    text,
    className = 'max-w-[400px] sm:max-w-[550px]',
    subtitle,
    confirmText = 'Yes',
    cancelText = 'No',
    confirmIcon,
    icon,
    iconColor = 'text-primary',
    variant = 'default',
    isLoading = false,
}) => {
    const modalClose = useCallback(() => {
        close();
    }, [close]);

    // Default icon if none provided
    const defaultIcon = icon || (
        <HelpCircle className={`h-10 w-10 ${iconColor}`} />
    );

    return (
        <GlobalDialog
            header={false}
            open={opened}
            setOpen={(open: boolean) => !open && modalClose()}
            className={className}
            allowFullScreen={false}
            customTitle={<div></div>}
            // showCloseButton={false}
        >
            <div className='flex flex-col items-center p-6'>
                {defaultIcon}

                <h2 className='text-2xl font-semibold text-center mb-2'>
                    {text}
                </h2>

                {subtitle && (
                    <p className='text-center text-muted-foreground mb-2'>
                        {subtitle}
                    </p>
                )}

                <div className='flex flex-row items-center justify-center gap-3 w-full'>
                    <Button
                        variant='primary_light'
                        onClick={modalClose}
                        disabled={isLoading}
                        className='min-w-[100px] w-fit'
                    >
                        <XCircle className='h-4 w-4 ' />
                        {cancelText}
                    </Button>

                    <Button
                        variant={variant}
                        onClick={handleConfirm}
                        disabled={isLoading}
                        className='min-w-[100px] w-fit'
                    >
                        {isLoading ? (
                            confirmIcon ? (
                                confirmIcon
                            ) : (
                                <Loader2 className='h-4 w-4 animate-spin mr-2' />
                            )
                        ) : (
                            confirmIcon || <Check className='h-4 w-4 mr-2' />
                        )}
                        {confirmText}
                    </Button>
                </div>
            </div>
        </GlobalDialog>
    );
};

export default ConfirmModal;
