'use client';

import type React from 'react';
import { X } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import ChatInfo from '../ChatInfo';

interface ProfileInfoModalProps {
    opened: boolean;
    close: () => void;
    chatId?: string;
}

const ProfileInfoModal: React.FC<ProfileInfoModalProps> = ({
    opened,
    close,
    chatId,
}) => {
    return (
        <Dialog open={opened} onOpenChange={(open) => !open && close()}>
            <DialogContent className='sm:max-w-[374px] p-0'>
                <DialogHeader className='px-6 py-4 border-b border-border chat-info-header'>
                    <div className='flex items-center justify-between'>
                        <DialogTitle className='text-xl font-medium chat-info-title'>
                            Chat Info
                        </DialogTitle>
                        <Button
                            variant='ghost'
                            size='icon'
                            onClick={close}
                            className='h-10 w-10 rounded-full bg-muted/20 hover:bg-muted/40 btn-close'
                        >
                            <X className='h-5 w-5' />
                            <span className='sr-only'>Close</span>
                        </Button>
                    </div>
                </DialogHeader>

                <div className='bModalBody'>
                    <ChatInfo handleToggleInfo={close} />
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ProfileInfoModal;
