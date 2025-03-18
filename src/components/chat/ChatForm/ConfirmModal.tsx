'use client';

import type React from 'react';
import { Dialog, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ConfirmModalProps {
    opened: boolean;
    close: () => void;
    handleConfirm: () => void;
    text: string;
    confirmText?: string;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
    opened,
    close,
    handleConfirm,
    text,
    confirmText,
}) => {
    return (
        <Dialog open={opened} onOpenChange={(open) => !open && close()}>
            <DialogContent
                className='sm:max-w-[480px] p-6 bModalContent'
                // hideCloseButton
            >
                <div className='reminder-box'>
                    <h2 className='text-lg font-medium text-center mb-6 message-title'>
                        {text}
                    </h2>

                    <DialogFooter className='flex sm:flex-row gap-4 sm:gap-0'>
                        <div className='grid grid-cols-2 gap-4 w-full'>
                            <Button
                                variant='outline'
                                onClick={close}
                                className='w-full button delete'
                            >
                                Cancel
                            </Button>

                            <Button
                                variant='default'
                                onClick={handleConfirm}
                                className='w-full button primary'
                            >
                                {confirmText || 'Leave'}
                            </Button>
                        </div>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ConfirmModal;
