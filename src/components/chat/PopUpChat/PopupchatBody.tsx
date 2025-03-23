'use client';

import React, { useEffect, useRef, useState } from 'react';
import Message from '../Message/page';
import { useParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
import dayjs from 'dayjs';
// import { markRead, updateChatMessages } from '@/redux/features/chatReducer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import ChatFooter, { type ChatData } from '../ChatFooter';
import Cookies from 'js-cookie';
import { Loader2 } from 'lucide-react';
import {
    markRead,
    pushHistoryMessages,
    setCurrentPage,
    setFetchedMore,
    updateChatMessages,
} from '@/redux/features/chatReducer';
import { toast } from 'sonner';
import { useAppSelector } from '@/redux/hooks';
// import chats from './chats.json';
import { instance } from '@/lib/axios/axiosInstance';
import chatStateData from '../ChatStateData.json';
import Thread from '../thread';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
interface ChatMessage {
    _id: string;
    sender: {
        _id: string;
        firstName?: string;
        lastName?: string;
        fullName?: string;
        profilePicture?: string;
    };
    createdAt: string | number;
    status?: string;
    chat: string;
    type: string;
    text: string;
}

interface ChatUser {
    _id: string;
    firstName?: string;
    lastName?: string;
    profilePicture?: string;
    isBlocked?: boolean;
}

interface ChatInfo {
    _id: string;
    name?: string;
    avatar?: string;
    isChannel?: boolean;
    otherUser?: ChatUser;
    myData?: {
        isBlocked?: boolean;
    };
}

interface Draft {
    chat: string;
    text: string;
}

interface PopUpChatBodyProps {
    isAi?: boolean;
    isPopup?: boolean;
    setChatInfo: (chat: any | null) => void;
    setProfileInfoShow: (show: boolean) => void;
    profileInfoShow: boolean;
    setReloading: (reloading: boolean) => void;
    reloading: boolean;
    searchQuery?: string;
    chatId?: string;
}

function formatDateForDisplay(date: string | number): string {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const inputDate = new Date(date);

    if (
        inputDate.getDate() === today.getDate() &&
        inputDate.getMonth() === today.getMonth() &&
        inputDate.getFullYear() === today.getFullYear()
    ) {
        return 'Today';
    } else if (
        inputDate.getDate() === yesterday.getDate() &&
        inputDate.getMonth() === yesterday.getMonth() &&
        inputDate.getFullYear() === yesterday.getFullYear()
    ) {
        return 'Yesterday';
    } else {
        return inputDate.toLocaleDateString(); // Adjust this format as needed
    }
}

function groupMessagesByDate(
    messages: ChatMessage[],
): Record<string, ChatMessage[]> {
    return messages.reduce((groups: Record<string, ChatMessage[]>, message) => {
        const dateKey = formatDateForDisplay(message.createdAt);
        if (!groups[dateKey]) {
            groups[dateKey] = [];
        }
        groups[dateKey].push(message);
        return groups;
    }, {});
}

const PopUpChatBody: React.FC<PopUpChatBodyProps> = ({
    isAi,
    isPopup,
    setChatInfo,
    setProfileInfoShow,
    profileInfoShow,
    setReloading,
    reloading,
    searchQuery,
    chatId,
}) => {
    const params = useParams();
    console.log({ params });
    const selectedChatId = isPopup ? chatId : params?.chatid || '';
    const dispatch = useDispatch();
    // Fix: Add fallbacks for when state.chat is undefined
    const chatState = useAppSelector((state) => state.chat || {});
    const chatData = chatStateData || [];
    console.log({ chatState });
    const chatMessages = chatState.chatMessages || {};
    const { chats } = useAppSelector((state) => state.chat || {});
    const onlineUsers = chatData.onlineUsers || [];
    const currentPage = chatData.currentPage || 1;
    const fetchedMore = chatData.fetchedMore || false;
    const drafts = chatData.drafts || [];
    console.log({ chats });
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [chat, setChat] = useState<any | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [count, setCount] = useState<number>(0);
    const [isFetching, setIsFetching] = useState<boolean>(false);
    const [editMessage, setEditMessage] = useState<ChatMessage | null>(null);
    const [threadMessage, setThreadMessage] = useState<ChatMessage | null>(
        null,
    );
    const [limit, setLimit] = useState<number>(15);
    //for ai
    const [aiIncomingMessage, setAiIncomingMessage] = useState<string>('');
    const [isThinking, setIsThinking] = useState<boolean>(false);
    const [hasMore, setHasMore] = useState<boolean>(true);

    const [initialLoaded, setInitalLoaded] = useState<boolean>(false);

    const messages = chatMessages?.[selectedChatId as string];

    const [refIndex, setRefIndex] = useState<number>(15);
    const bottomTextRef = useRef<any | null>(null);
    const [reload, setReload] = useState<number>(0);

    useEffect(() => {
        setInitalLoaded(false);
        setRefIndex(
            messages?.length > 15 && fetchedMore ? 15 : messages?.length - 1,
        );
        setInitalLoaded(true);
    }, [messages, fetchedMore]);

    useEffect(() => {
        setInitalLoaded(false);
    }, [selectedChatId]);
    console.log({ Chats: chats, ID: selectedChatId });
    useEffect(() => {
        if (chats && selectedChatId) {
            const findChat = chats?.find(
                (chat: any) => chat?._id === selectedChatId,
            );
            console.log({ findChat });
            if (findChat) {
                setChat(findChat);
                setChatInfo(findChat);
            }
        }
        dispatch(markRead({ chatId: selectedChatId as string }));
    }, [chats, selectedChatId, dispatch, setChatInfo]);

    useEffect(() => {
        if (chat?.otherUser?._id === process.env.NEXT_PUBLIC_AI_BOT_ID) {
            const messages = chatMessages?.[selectedChatId as string] || [];

            if (messages?.length === 0) {
                return;
            }
            const lastMessage = messages[messages?.length - 1];

            if (
                lastMessage?.sender?._id === process.env.NEXT_PUBLIC_AI_BOT_ID
            ) {
                setAiIncomingMessage('');
            }
        }
    }, [chatMessages, chat, selectedChatId]);

    const chatContainerRef = useRef<HTMLDivElement>(null);
    const lastMessageRef = useRef<HTMLDivElement>(null);

    const fetchMore = (page: number) => {
        const options = {
            page: page + 1,
            chat: selectedChatId,
            limit,
            query: searchQuery || '',
        };
        setIsFetching(true);
        instance
            .post(`/chat/messages`, options)
            .then((res) => {
                dispatch(setFetchedMore(true));
                dispatch(
                    pushHistoryMessages({
                        chat: res.data.chat?._id,
                        messages: res.data.messages || [],
                    }),
                );
                dispatch(setCurrentPage(page + 1));
                if (res.data?.messages?.length < limit) {
                    setHasMore(false);
                } else {
                    setHasMore(true);
                }
                setRefIndex(messages?.length > 15 ? 15 : messages?.length - 1);
                setIsFetching(false);
                setRefIndex(15);

                if (lastMessageRef.current) {
                    lastMessageRef.current.scrollIntoView({
                        behavior: 'instant',
                        block: 'center',
                        inline: 'nearest',
                    });
                }
            })
            .catch((err) => {
                setIsFetching(false);
                setError(err.response?.data);
                toast.error(err?.response?.data?.message);
                // console.log(err);
            });
    };

    useEffect(() => {
        if (selectedChatId) {
            setIsFetching(true);
            dispatch(
                updateChatMessages({
                    chat: selectedChatId as string,
                    messages: [],
                }),
            );
            setIsLoading(true);
            setError(null);
            dispatch(setCurrentPage(1));
            setCount(0);
            const options = {
                page: currentPage,
                chat: selectedChatId,
                limit,
                query: searchQuery || '',
            };
            instance
                .post(`/chat/messages`, options)
                .then((res) => {
                    setIsLoading(false);
                    // setChat(res.data.chat)
                    setCount(res.data.count);
                    // fetchPinned(res.data.chat._id)
                    dispatch(
                        updateChatMessages({
                            chat: res.data.chat._id,
                            messages: res.data.messages,
                        }),
                    );
                    setInitalLoaded(true);
                    if (res.data?.messages?.length < limit) {
                        setHasMore(false);
                    } else {
                        setHasMore(true);
                    }
                    dispatch(markRead({ chatId: selectedChatId as string }));
                    setIsFetching(false);
                })
                .catch((err) => {
                    setIsLoading(false);
                    setError(err?.response?.data?.error);
                    toast.error(err?.response?.data?.error?.message);
                    setInitalLoaded(true);
                    setIsFetching(false);
                });
        }
    }, [selectedChatId, reload, searchQuery, dispatch, currentPage, limit]);

    interface SentCallbackObject {
        action: string;
        message?: {
            text: string;
        };
    }

    const onSentCallback = async (object: SentCallbackObject) => {
        if (object?.action === 'create') {
            if (chat?.otherUser?._id === process.env.NEXT_PUBLIC_AI_BOT_ID) {
                const histories = chatMessages?.[selectedChatId as string]
                    ?.slice(-3)
                    ?.map((x: any) => ({
                        role: 'assistant',
                        content: x?.text,
                    }));
                const data = {
                    chat: chat?._id,
                    messages: [
                        ...histories,
                        { role: 'user', content: object?.message?.text },
                    ],
                };
                try {
                    setIsThinking(true);
                    const headers: HeadersInit = {
                        'Content-Type': 'application/json',
                    };

                    const authToken = Cookies.get(
                        process.env.NEXT_PUBLIC_AUTH_TOKEN_NAME as string,
                    );
                    if (authToken) {
                        headers['Authorization'] = authToken;
                    }

                    const activeCompany = Cookies.get('activeCompany');
                    if (activeCompany) {
                        headers['organization'] = activeCompany;
                    }

                    const response = await fetch(
                        `${process.env.NEXT_PUBLIC_API_URL}/chat/chatgpt/sendmessage`,
                        {
                            method: 'POST',
                            body: JSON.stringify(data),
                            headers,
                        },
                    );

                    if (!response.ok) {
                        setIsThinking(false);
                        throw new Error(
                            `Request failed with status ${response.status}`,
                        );
                    }

                    const readData = response.body
                        ?.pipeThrough(new TextDecoderStream())
                        .getReader();

                    if (!readData) {
                        setIsThinking(false);
                        throw new Error('Failed to read response data');
                    }

                    setIsThinking(false);
                    let aiRes = '';
                    while (true) {
                        const { done, value } = await readData.read();
                        if (done) {
                            break;
                        }
                        aiRes += value;
                        setAiIncomingMessage(aiRes);
                    }
                } catch (error) {
                    setIsThinking(false);
                    console.error('Error:', error);
                }
            }
        }
    };

    const handleScroll = () => {
        const div = chatContainerRef.current;
        if (div) {
            if (
                div.scrollHeight - div.clientHeight + div.scrollTop < 200 &&
                !isFetching &&
                currentPage * 20 < count &&
                initialLoaded
            ) {
                fetchMore(currentPage);
            }
        }
    };
    const prevTriggerRef = React.useRef('');

    useEffect(() => {
        if (lastMessageRef.current) {
            lastMessageRef.current.scrollIntoView({
                behavior: 'instant',
                block: 'end',
                inline: 'nearest',
            });
        }
        const messageKey =
            messages?.length > 0 ? messages[messages.length - 1]?._id : 'empty';
        const triggerKey = `${messageKey}-${reload}`;
        if (prevTriggerRef.current !== triggerKey) {
            prevTriggerRef.current = triggerKey;
            setReloading(!reloading);
        }
    }, [messages, reload, setReloading, reloading]);

    const draft =
        drafts.length > 0 &&
        drafts?.find((f: any) => f?.chat === selectedChatId);

    return (
        <>
            <div className='scrollbar-container h-[calc(100%-77px)] pl-2'>
                <div
                    className='h-full overflow-y-auto'
                    id='chat-body-id'
                    onScroll={handleScroll}
                    ref={chatContainerRef}
                >
                    {isLoading ? (
                        <div className='h-full w-full flex justify-center items-center'>
                            <Loader2 className='h-14 w-14 text-primary animate-spin' />
                        </div>
                    ) : (
                        <div>
                            {!isLoading && currentPage * 20 < count ? (
                                <div className='text-center'>
                                    <Button
                                        disabled={isFetching}
                                        className='bg-primary hover:bg-primary/90 text-white'
                                        onClick={() => fetchMore(currentPage)}
                                    >
                                        {isFetching ? (
                                            <Loader2 className='h-5 w-5 animate-spin' />
                                        ) : (
                                            'Load More'
                                        )}{' '}
                                    </Button>
                                </div>
                            ) : (
                                <div className='p-2.5 text-center flex flex-col items-center gap-2.5'>
                                    {chat?.isChannel ? (
                                        <>
                                            <Avatar className='h-[50px] w-[50px]'>
                                                <AvatarImage
                                                    src={chat?.avatar}
                                                    alt={chat?.name}
                                                />
                                                <AvatarFallback>
                                                    {chat?.name?.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>

                                            <p className='font-bold text-sm'>
                                                This is the very beginning of
                                                the{' '}
                                                <strong>{chat?.name}</strong>{' '}
                                                channel
                                            </p>
                                        </>
                                    ) : (
                                        <>
                                            <Avatar className='h-[50px] w-[50px]'>
                                                <AvatarImage
                                                    src={
                                                        chat?.otherUser
                                                            ?.profilePicture
                                                    }
                                                    alt={`${chat?.otherUser?.firstName} ${chat?.otherUser?.lastName}`}
                                                />
                                                <AvatarFallback>
                                                    {chat?.otherUser?.firstName?.charAt(
                                                        0,
                                                    )}
                                                </AvatarFallback>
                                            </Avatar>
                                            <p className='font-bold text-sm'>
                                                This is the very beginning of
                                                the chat with{' '}
                                                <strong>
                                                    {chat?.otherUser?.firstName}{' '}
                                                    {chat?.otherUser?.lastName}
                                                </strong>
                                            </p>
                                        </>
                                    )}
                                </div>
                            )}
                            {isLoading ? (
                                <div className='flex justify-center items-center h-[70vh]'>
                                    <Loader2 className='h-14 w-14 text-primary animate-spin' />
                                </div>
                            ) : (
                                chatMessages?.[selectedChatId as string]
                                    ?.length === 0 && (
                                    <div className='text-center mt-15 pb-[25vh]'>
                                        <h3 className='font-bold text-dark-gray'>
                                            No messages found!
                                        </h3>
                                    </div>
                                )
                            )}

                            {error ? (
                                <Alert variant='destructive'>
                                    <AlertTitle>Error</AlertTitle>
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            ) : (
                                <>
                                    {messages?.map(
                                        (message: any, index: number) => {
                                            const isLastMessage =
                                                index === refIndex;
                                            const sameDate =
                                                dayjs(message.createdAt).format(
                                                    'DD-MM-YY',
                                                ) ===
                                                dayjs(
                                                    messages[index - 1]
                                                        ?.createdAt,
                                                ).format('DD-MM-YY');
                                            const messageDate = dayjs(
                                                message?.createdAt,
                                            );
                                            const now = dayjs();
                                            return (
                                                <React.Fragment
                                                    key={message._id || index}
                                                >
                                                    {!sameDate && (
                                                        <div className='flex justify-center flex-row items-center gap-1 my-2'>
                                                            <div className='h-[2px] w-full bg-border'></div>
                                                            <span className='text-primary text-xs bg-primary-light text-nowrap px-2 py-1 rounded-full'>
                                                                {messageDate.isSame(
                                                                    now,
                                                                    'day',
                                                                )
                                                                    ? 'Today'
                                                                    : messageDate.isSame(
                                                                            now.subtract(
                                                                                1,
                                                                                'day',
                                                                            ),
                                                                            'day',
                                                                        )
                                                                      ? 'Yesterday'
                                                                      : dayjs(
                                                                            message.createdAt,
                                                                        ).format(
                                                                            'dddd, MMM DD, YYYY',
                                                                        )}
                                                            </span>
                                                            <div className='h-[2px] w-full bg-border'></div>
                                                        </div>
                                                    )}
                                                    <Message
                                                        isAi={isAi}
                                                        key={
                                                            message._id || index
                                                        }
                                                        message={message}
                                                        setEditMessage={
                                                            setEditMessage
                                                        }
                                                        lastmessage={
                                                            isLastMessage
                                                        }
                                                        setThreadMessage={
                                                            setThreadMessage
                                                        }
                                                        ref={
                                                            isLastMessage &&
                                                            refIndex !== 0
                                                                ? lastMessageRef
                                                                : null
                                                        }
                                                        bottomRef={
                                                            bottomTextRef
                                                        }
                                                        reload={reload}
                                                        setReload={setReload}
                                                        searchQuery={
                                                            searchQuery
                                                        }
                                                    />
                                                </React.Fragment>
                                            );
                                        },
                                    )}
                                </>
                            )}

                            {aiIncomingMessage && (
                                <Message
                                    key={'randomid'}
                                    message={{
                                        _id: 'randomId',
                                        sender: {
                                            _id: 'randomId',
                                            fullName: 'AI Bot',
                                            profilePicture: '',
                                        },
                                        createdAt: Date.now(),
                                        status: 'sending',
                                        chat: chat?._id as string,
                                        type: 'message',
                                        text: aiIncomingMessage,
                                    }}
                                    reload={reload}
                                    setReload={setReload}
                                />
                            )}
                        </div>
                    )}
                </div>
            </div>
            {!(chat?.myData?.isBlocked || error) && (
                <ChatFooter
                    chat={chat as ChatData}
                    className={`chat_${chat?._id}`}
                    draft={draft}
                    onSentCallback={onSentCallback}
                    setProfileInfoShow={setProfileInfoShow}
                    profileInfoShow={profileInfoShow}
                />
            )}

            {threadMessage && (
                <Thread
                    chat={chat}
                    handleClose={() => setThreadMessage(null)}
                    message={threadMessage}
                    setEditMessage={setEditMessage}
                />
            )}

            {/* {editMessage && chat && (
                <EditMessageModal
                    chat={chat}
                    selectedMessage={editMessage}
                    handleCloseEdit={() => setEditMessage(null)}
                />
            )} */}
        </>
    );
};

export default PopUpChatBody;
