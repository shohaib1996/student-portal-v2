'use client';

import type React from 'react';
import { useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { X, Loader2 } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface Message {
    _id: string;
    [key: string]: any;
}

interface DeleteMessageProps {
    opened: boolean;
    close: () => void;
    selectedMessage: Message | null;
}

const DeleteMessage: React.FC<DeleteMessageProps> = ({
    opened,
    close,
    selectedMessage,
}) => {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteMsg = () => {
        if (!selectedMessage) {
            return;
        }

        setIsDeleting(true);
        axios
            .delete(`/chat/delete/message/${selectedMessage?._id}`)
            .then((res) => {
                toast.success('Message deleted successfully');
                setIsDeleting(false);
                close();
            })
            .catch((err) => {
                setIsDeleting(false);
                toast.error(
                    err?.response?.data?.error || 'Failed to delete message',
                );
            });
    };

    return (
        <Dialog open={opened} onOpenChange={(open) => !open && close()}>
            <DialogContent className='sm:max-w-[580px] p-0 bModalContent'>
                <DialogHeader className='px-6 py-4 flex justify-end items-center bModalHeader'>
                    <Button
                        variant='ghost'
                        size='icon'
                        onClick={close}
                        className='h-10 w-10 rounded-full bg-muted/20 hover:bg-muted/40 btn-close'
                    >
                        <X className='h-5 w-5' />
                        <span className='sr-only'>Close</span>
                    </Button>
                </DialogHeader>

                <div className='p-6 bModalBody'>
                    <div className='reminder-box'>
                        <div className='mb-6'>
                            <h1 className='text-xl font-medium text-center message-title'>
                                Delete this message permanently? <br />
                                <span className='text-destructive text-base block mt-2'>
                                    {`You won't be able to undo this action.`}
                                </span>
                            </h1>
                        </div>

                        <DialogFooter className='form-buttons flex justify-center gap-4 sm:gap-6'>
                            <Button
                                variant='outline'
                                onClick={close}
                                disabled={isDeleting}
                                className='min-w-[100px] cancle default_btn'
                            >
                                No
                            </Button>

                            <Button
                                variant='default'
                                onClick={handleDeleteMsg}
                                disabled={isDeleting}
                                className='min-w-[100px] default_btn'
                            >
                                {isDeleting ? (
                                    <Loader2 className='h-5 w-5 animate-spin' />
                                ) : (
                                    'Yes'
                                )}
                            </Button>
                        </DialogFooter>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default DeleteMessage;
