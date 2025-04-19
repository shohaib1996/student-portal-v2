'use client';

import type React from 'react';
import { useState } from 'react';
import { toast } from 'sonner';
import { X, Loader2, Check, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import GlobalDialog from '@/components/global/GlobalDialogModal/GlobalDialog';
import { instance } from '@/lib/axios/axiosInstance';
import { renderPlainText } from '@/components/lexicalEditor/renderer/renderPlainText';

interface Message {
    _id: string;
    sender?: {
        _id: string;
        firstName?: string;
        lastName?: string;
        fullName?: string;
        profilePicture?: string;
    };
    text?: string;
    createdAt: string | number;
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
        instance
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

    // Format time from the message timestamp
    const formatTime = (timestamp: string | number) => {
        if (!timestamp) {
            return '';
        }
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <GlobalDialog
            open={opened}
            setOpen={(open: boolean) => !open && close()}
            className='sm:max-w-[550px]'
            allowFullScreen={false}
            header={false}
            showCloseButton={true}
        >
            <div className='flex flex-col my-4'>
                {/* Message preview */}
                <div className='bg-background border p-2 rounded-xl mb-2 mx-2'>
                    <div className='flex items-start gap-3'>
                        {selectedMessage?.sender?.profilePicture ? (
                            <Image
                                src={
                                    selectedMessage.sender.profilePicture ||
                                    '/placeholder.svg'
                                }
                                alt={selectedMessage.sender.fullName || 'User'}
                                width={40}
                                height={40}
                                className='rounded-full h-10 w-10 object-cover'
                            />
                        ) : (
                            <div className='h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center'>
                                <span className='text-black font-medium'>
                                    {selectedMessage?.sender?.firstName?.[0] ||
                                        'U'}
                                </span>
                            </div>
                        )}
                        <div className='flex flex-col bg-primary-light rounded-xl border border-blue-500/20 p-2 w-[calc(100%-53px)]'>
                            <div className='flex items-center gap-1'>
                                <span className='font-semibold text-black'>
                                    {selectedMessage?.sender?.fullName ||
                                        'User'}
                                </span>
                                <span className='text-xs text-primary-white'>
                                    {formatTime(
                                        selectedMessage?.createdAt || '',
                                    )}
                                </span>
                            </div>
                            <p className='text-black'>
                                {renderPlainText({
                                    text: selectedMessage?.text || '',
                                    textSize: 'text-xs',
                                    textColor: 'text-dark-gray',
                                    // truncate: true,
                                    lineClamp: 2,
                                    // width: 'w-[calc(100%-10px)]',
                                })}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Confirmation content */}
                <div className='flex flex-col items-center px-4'>
                    <h2 className='text-2xl font-bold text-center mb-2'>
                        Do you want to remove?
                    </h2>
                    <p className='text-black text-center mb-2'>
                        Are you sure you want to delete this message?
                        <br />
                        This action cannot be undone.
                    </p>

                    <div className='flex flex-row items-center justify-center gap-4 w-full'>
                        <Button
                            variant='primary_light'
                            onClick={close}
                            disabled={isDeleting}
                            className='w-[130px]'
                        >
                            <XCircle className='h-5 w-5' /> No
                        </Button>

                        <Button
                            onClick={handleDeleteMsg}
                            disabled={isDeleting}
                            className='w-[130px]'
                        >
                            {isDeleting ? (
                                <Loader2 className='h-5 w-5 animate-spin ' />
                            ) : (
                                <Check className='h-5 w-5 ' />
                            )}
                            Yes
                        </Button>
                    </div>
                </div>
            </div>
        </GlobalDialog>
    );
};

export default DeleteMessage;
