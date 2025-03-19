'use client';

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
import { IGlobalModalProps } from '@/types/globalTypes/newGlobalModal';

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
                    variant='default'
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
