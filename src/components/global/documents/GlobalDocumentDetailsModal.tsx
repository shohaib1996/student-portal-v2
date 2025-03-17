'use client';

import { Dialog, DialogContent } from '@/components/ui/dialog';

export interface DocumentDetailsProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

export function GlobalDocumentDetailsModal({
    isOpen,
    onClose,
    children,
}: DocumentDetailsProps) {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className='h-screen min-w-[100vw] overflow-y-auto p-0 rounded-none'>
                {children}
            </DialogContent>
        </Dialog>
    );
}
