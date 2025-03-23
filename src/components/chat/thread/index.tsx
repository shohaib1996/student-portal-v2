'use client';

import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { updateMessage } from '@/redux/features/chatReducer';
import ChatFooter from '../ChatFooter';
import dayjs from 'dayjs';
import { toast } from 'sonner';
import Message from '../Message/page';
import { Loader, X } from 'lucide-react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

function formatDateForDisplay(date: string | Date) {
    const today = dayjs();
    const yesterday = today.subtract(1, 'day');

    const inputDate = dayjs(date);

    if (inputDate.isSame(today, 'day')) {
        return 'Today';
    } else if (inputDate.isSame(yesterday, 'day')) {
        return 'Yesterday';
    } else {
        return inputDate.format('dddd, MMM DD, YYYY');
    }
}

function groupMessagesByDate(messages: any[]) {
    return messages.reduce(
        (groups, message) => {
            const dateKey = formatDateForDisplay(message.createdAt);
            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }
            groups[dateKey].push(message);
            return groups;
        },
        {} as Record<string, any[]>,
    );
}

interface ThreadProps {
    handleClose: () => void;
    message: any;
    chat: any;
    setEditMessage: (message: any) => void;
}

const Thread: React.FC<ThreadProps> = ({
    handleClose,
    message,
    chat,
    setEditMessage,
}) => {
    const dispatch = useDispatch();
    const { chatMessages } = useSelector((state: any) => state.chat);
    const [replies, setReplies] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [count, setCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [error, setError] = useState<string | null>(null);
    const lastmsgref = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useState<boolean>(message !== null);

    useEffect(() => {
        setOpen(message !== null);
    }, [message]);

    useEffect(() => {
        if (chatMessages[chat?._id]) {
            const findMessage = chatMessages[chat?._id]?.find(
                (x: any) => x._id === message?._id,
            );
            setReplies(findMessage?.replies || []);
        }
    }, [chatMessages, chat?._id, message?._id]);

    useEffect(() => {
        if (message?._id) {
            setIsLoading(true);
            setCurrentPage(1);
            setCount(0);
            const options = {
                page: currentPage,
                parentMessage: message?._id,
                chat: chat?._id,
            };

            axios
                .post(`/chat/messages`, options)
                .then((res) => {
                    setIsLoading(false);
                    setCount(res.data.count);
                    dispatch(
                        updateMessage({
                            message: {
                                _id: message?._id,
                                chat: chat?._id,
                                replies: res.data.messages,
                            },
                        }),
                    );
                    scrollIntoBottom();
                })
                .catch((err) => {
                    setIsLoading(false);
                    setError(
                        err.response?.data?.error || 'Failed to fetch messages',
                    );
                    toast.error('Failed to fetch messages');
                });
        }
    }, [message?._id, chat?._id, currentPage, dispatch]);

    const scrollIntoBottom = () => {
        if (lastmsgref.current) {
            lastmsgref.current.scrollIntoView({
                behavior: 'smooth',
                block: 'end',
                inline: 'nearest',
            });
        }
    };

    const onClose = () => {
        setOpen(false);
        handleClose();
    };

    const groupedMessages = groupMessagesByDate([...(replies || [])]);

    return (
        message && (
            <Sheet
                open={open}
                onOpenChange={(open) => {
                    setOpen(open);
                    if (!open) {
                        handleClose();
                    }
                }}
            >
                <SheetContent className='p-1 w-full sm:max-w-md md:max-w-lg lg:max-w-xl overflow-hidden flex flex-col'>
                    <SheetHeader className='border-b px-4 py-2'>
                        <div className='flex justify-between items-center'>
                            <SheetTitle className='text-dark-gray'>
                                Thread
                            </SheetTitle>
                        </div>
                    </SheetHeader>

                    <div className='flex-1 overflow-y-auto py-2'>
                        <div className='mb-2'>
                            <Message
                                message={message}
                                hideOptions={true}
                                hideReplyCount={true}
                                hideAlign
                            />
                        </div>

                        <hr className='my-4 h-[1px] w-full bg-border' />

                        <div>
                            {replies?.length > 0 ? (
                                Object.keys(groupedMessages).map(
                                    (dateHeader) => (
                                        <div key={dateHeader}>
                                            <div className='flex justify-center flex-row items-center gap-1 my-2'>
                                                <div className='h-[2px] w-full bg-border'></div>
                                                <span className='text-primary text-xs bg-primary-light text-nowrap px-2 py-1 rounded-full'>
                                                    {dateHeader}
                                                </span>
                                                <div className='h-[2px] w-full bg-border'></div>
                                            </div>

                                            {groupedMessages[dateHeader].map(
                                                (
                                                    message: any,
                                                    index: number,
                                                ) => {
                                                    const isLastMessage =
                                                        groupedMessages[
                                                            dateHeader
                                                        ].length -
                                                            1 ===
                                                        index;
                                                    return (
                                                        <Message
                                                            key={
                                                                message._id ||
                                                                index
                                                            }
                                                            message={message}
                                                            setEditMessage={
                                                                setEditMessage
                                                            }
                                                            setThreadMessage={() =>
                                                                null
                                                            }
                                                            lastmessage={
                                                                isLastMessage
                                                            }
                                                            ref={
                                                                isLastMessage
                                                                    ? lastmsgref
                                                                    : null
                                                            }
                                                            hideReplyCount={
                                                                true
                                                            }
                                                            source='thread'
                                                        />
                                                    );
                                                },
                                            )}
                                        </div>
                                    ),
                                )
                            ) : isLoading ? (
                                <div className='flex justify-center items-center h-20'>
                                    <Loader className='animate-spin text-primary h-10 w-10' />
                                </div>
                            ) : (
                                <p className='text-center text-muted-foreground'>
                                    No replies found
                                </p>
                            )}
                        </div>
                    </div>

                    <div className='pt-4 mt-auto'>
                        <ChatFooter
                            reply={true}
                            chat={chat}
                            scrollIntoBottom={scrollIntoBottom}
                            className={`chat_${chat?._id}`}
                            parentMessage={message?._id || null}
                        />
                    </div>
                </SheetContent>
            </Sheet>
        )
    );
};

export default React.memo(Thread);
