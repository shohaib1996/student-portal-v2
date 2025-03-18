'use client';

import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { updateMessage } from '@/redux/features/chatReducer'; // Redux reducer
import ChatFooter from '../ChatFooter';
import dayjs from 'dayjs'; // Replacing moment with dayjs
import { toast } from 'sonner'; // Using sonner for toast
import Message from '../Message/page';
import { Loader } from 'lucide-react';
import GlobalModal from '@/components/global/GlobalModal';

function formatDateForDisplay(date: string | Date) {
    const today = dayjs();
    const yesterday = today.subtract(1, 'day');

    const inputDate = dayjs(date);

    if (inputDate.isSame(today, 'day')) {
        return 'Today';
    } else if (inputDate.isSame(yesterday, 'day')) {
        return 'Yesterday';
    } else {
        return inputDate.format('MM/DD/YYYY'); // Adjust this format as needed
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
    const [open, setOpen] = useState<boolean>(message !== null ? true : false); // Fixed here

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

    const groupedMessages = groupMessagesByDate([...(replies || [])]);

    return (
        message && (
            <GlobalModal
                open={open}
                setOpen={setOpen} // Pass the setOpen here for modal state management
                title='Replies'
                className='sm:max-w-4xl'
                customFooter={
                    <ChatFooter
                        reply={true}
                        chat={chat}
                        scrollIntoBottom={scrollIntoBottom}
                        className={`chat_${chat?._id}`}
                        parentMessage={message?._id || null}
                    />
                }
            >
                <div className='flex-1 overflow-y-auto'>
                    <div className='my-4'>
                        <Message
                            message={message}
                            hideOptions={true}
                            hideReplyCount={true}
                            hideAlign
                        />
                    </div>

                    <hr className='my-4 h-[2px] w-full bg-border' />

                    <div>
                        {replies?.length > 0 ? (
                            Object.keys(groupedMessages).map((dateHeader) => (
                                <div key={dateHeader}>
                                    <div className='text-center text-muted-foreground text-sm my-4'>
                                        <span>{dateHeader}</span>
                                    </div>

                                    {groupedMessages[dateHeader].map(
                                        (message: any, index: number) => {
                                            const isLastMessage =
                                                groupedMessages[dateHeader]
                                                    .length -
                                                    1 ===
                                                index;
                                            return (
                                                <Message
                                                    key={message._id || index}
                                                    message={message}
                                                    setEditMessage={
                                                        setEditMessage
                                                    }
                                                    setThreadMessage={() =>
                                                        null
                                                    }
                                                    lastmessage={isLastMessage}
                                                    ref={
                                                        isLastMessage
                                                            ? lastmsgref
                                                            : null
                                                    }
                                                    hideReplyCount={true}
                                                    source='thread'
                                                />
                                            );
                                        },
                                    )}
                                </div>
                            ))
                        ) : isLoading ? (
                            <div className='flex justify-center items-center h-20'>
                                <Loader className='animate-spin text-primary h-10 w-10' />
                            </div>
                        ) : (
                            <p>No replies found</p>
                        )}
                    </div>
                </div>
            </GlobalModal>
        )
    );
};

export default React.memo(Thread);
