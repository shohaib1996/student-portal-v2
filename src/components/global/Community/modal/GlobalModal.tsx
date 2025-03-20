'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
    DialogClose,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { IGlobalModalProps } from '@/types';

/**
 * 🚀 **NewGlobalModal Component**
 * A flexible and customizable modal dialog, designed for triggering actions and displaying content with ease.
 *
 * ✅ **Required Props:**
 * - `triggerText` (string | JSX.Element): The text (or element) displayed on the button that opens the modal.
 * - `open` (boolean): Controls the visibility of the modal.
 * - `setOpen` (function): Function to update the `open` state of the modal.
 *
 * 🎨 **Optional Props:**
 * - `triggerIcon` (JSX.Element): Custom icon displayed next to the trigger text.
 * - `leftContent` (JSX.Element): Additional content (e.g., a download button) inside the modal.
 * - `modalTitle` (string): Title displayed at the top of the modal.
 * - `modalDescription` (string): Brief description inside the modal.
 * - `modalContent` (JSX.Element): Custom content (forms, lists, etc.) to display inside the modal.
 * - `className` (string): Custom styles for the modal container.
 * - `disabled` (boolean): If `true`, disables the button that triggers the modal.
 * - `ngClass` (string): Additional classes for styling the trigger button.
 * - `triggerButtonVariant` (string): Variant style of the trigger button (default: "default").
 * - `triggerButtonVariantSize` (string): Size of the trigger button (default: "sm").
 *
 * 💡 **Usage:**
 * Ideal for confirmation dialogs, forms, or alerts. The modal appears on button click and can be closed via the "X" button or `open` state changes.
 *
 * 🎯 **Features:**
 * - Dynamic content support with customizable titles, descriptions, and child components.
 * - State-controlled visibility for seamless integration with applications.
 * - Fully responsive design for an optimal user experience.
 */

const NewGlobalModal: React.FC<IGlobalModalProps> = ({
    triggerText,
    triggerIcon,
    modalTitle,
    modalDescription,
    modalContent,
    className,
    disabled,
    ngClass,
    open,
    leftContent,
    setOpen,
    triggerButtonVariant,
    triggerButtonVariantSize,
}) => {
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    disabled={disabled}
                    variant={triggerButtonVariant || 'default'}
                    size={triggerButtonVariantSize || 'sm'}
                    className={cn('w-full', ngClass)}
                    onClick={() => setOpen(true)}
                >
                    {triggerIcon}
                    {triggerText}
                </Button>
            </DialogTrigger>

            <GlobalModalContent
                modalTitle={modalTitle}
                modalDescription={modalDescription}
                className={className}
                leftContent={leftContent}
            >
                {modalContent}
            </GlobalModalContent>
        </Dialog>
    );
};

export default NewGlobalModal;

const GlobalModalContent: React.FC<
    Pick<
        IGlobalModalProps,
        | 'modalTitle'
        | 'modalDescription'
        | 'className'
        | 'children'
        | 'leftContent'
    >
> = ({ modalTitle, modalDescription, children, className, leftContent }) => {
    return (
        <>
            <DialogContent
                className={cn(
                    'no-scrollbar max-h-[80vh] overflow-y-auto p-common shadow-2xl',
                    'min-w-[90vw] md:min-w-[60vw] lg:min-w-[40vw] xl:min-w-[30vw]',
                    'max-w-[90vw] md:max-w-[60vw] lg:max-w-[40vw] xl:max-w-[30vw]',
                    className,
                )}
            >
                <DialogHeader
                    className={cn(
                        !modalTitle && !modalDescription ? 'sr-only' : '',
                        'text-gray',
                    )}
                >
                    <DialogTitle
                        className={cn(
                            modalTitle ? '' : 'sr-only',
                            leftContent && 'flex justify-between',
                        )}
                    >
                        {modalTitle}
                        {leftContent && leftContent}
                    </DialogTitle>

                    <DialogDescription
                        className={cn(
                            modalDescription ? '' : 'sr-only',
                            'text-gray',
                        )}
                    >
                        {modalDescription}
                    </DialogDescription>
                </DialogHeader>

                {children}
                <DialogClose
                    asChild
                    className='bg-danger/50 text-pure-white absolute right-2 top-2 z-[100] rounded-full p-1 transition'
                >
                    <Button size='icon' className='size-7'>
                        X
                    </Button>
                </DialogClose>
            </DialogContent>
        </>
    );
};
