'use client';
import React, { useEffect, useRef, useState } from 'react';
import Message from './Message/page';
import { useParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
import dayjs from 'dayjs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import ChatFooter, { type ChatData } from './ChatFooter';
import Cookies from 'js-cookie';
import { ArchiveIcon, Loader2, Pin, PinIcon, SearchIcon } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import {
    markRead,
    pushHistoryMessages,
    setCurrentPage,
    setFetchedMore,
    updateChatMessages,
    updateMessageStatus,
} from '@/redux/features/chatReducer';
import { useAppSelector } from '@/redux/hooks';
import { instance } from '@/lib/axios/axiosInstance';
import Thread from './thread';
import EditMessageModal from './Message/EditMessageModal';
import ForwardMessageModal from './Message/ForwardMessageModal';
import { renderPlainText } from '../lexicalEditor/renderer/renderPlainText';

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
    pinnedBy?: any;
}
interface ChatUser {
    _id: string;
    firstName?: string;
    lastName?: string;
    profilePicture?: string;
    isBlocked?: boolean;
}
interface ChatBodyProps {
    isAi?: boolean;
    setChatInfo: (chat: any | null) => void;
    setProfileInfoShow: (show: boolean) => void;
    profileInfoShow: boolean;
    setReloading: (reloading: boolean) => void;
    setFinalQuery?: () => void;
    reloading: boolean;
    searchQuery?: string;
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

const ChatBody: React.FC<ChatBodyProps> = ({
    isAi,
    setChatInfo,
    setProfileInfoShow,
    profileInfoShow,
    setReloading,
    reloading,
    searchQuery,
    setFinalQuery,
}) => {
    const params = useParams();
    const dispatch = useDispatch();
    const [showPinnedMessages, setShowPinnedMessages] = useState(false);
    const {
        chatMessages,
        chats,
        onlineUsers,
        currentPage,
        fetchedMore,
        drafts,
        selectedChat,
    } = useAppSelector((state) => state.chat);
    const [count, setCount] = useState(0);
    const messages = chatMessages[params?.chatid as string] || [];
    const draft = drafts?.find((f) => f.chat === params?.chatid);

    const [hasMore, setHasMore] = useState(true);
    const [isFetching, setIsFetching] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [limit, setLimit] = useState<number>(15);
    const [forwardMessage, setForwardMessage] = useState<ChatMessage | null>(
        null,
    );

    const fetchMore = (page: number) => {
        const options = {
            page: page + 1,
            chat: params?.chatid,
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
                setIsFetching(false);

                // Scroll to the top of the newly fetched messages
                if (chatContainerRef.current) {
                    const newMessagesHeight = res.data.messages.length * 100; // Approximate height of new messages
                    chatContainerRef.current.scrollTop += newMessagesHeight;
                }
            })
            .catch((err) => {
                setIsFetching(false);
                if (err?.response?.data) {
                    setError(err.response.data);
                }
            });
    };

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [chat, setChat] = useState<any | null>(null);
    const [editMessage, setEditMessage] = useState<ChatMessage | null>(null);
    const [threadMessage, setThreadMessage] = useState<ChatMessage | null>(
        null,
    );

    //for ai
    const [aiIncomingMessage, setAiIncomingMessage] = useState<string>('');
    const [isThinking, setIsThinking] = useState<boolean>(false);
    const [initialLoaded, setInitalLoaded] = useState<boolean>(false);
    const [refIndex, setRefIndex] = useState<number>(15);
    const bottomTextRef = useRef<any | null>(null);
    const [reload, setReload] = useState<number>(0);

    // Modified useEffect for refIndex
    useEffect(() => {
        if (initialLoaded && messages?.length > 0) {
            setRefIndex(
                messages.length > 15 && fetchedMore ? 15 : messages.length - 1,
            );
        }
    }, [messages, fetchedMore, initialLoaded]);

    // Modified useEffect for scrolling to last message
    useEffect(() => {
        if (initialLoaded && lastMessageRef.current && !fetchedMore) {
            lastMessageRef.current.scrollIntoView({
                behavior: 'instant',
                block: 'end',
                inline: 'nearest',
            });
        }
    }, [messages, initialLoaded, fetchedMore]);

    useEffect(() => {
        setInitalLoaded(false);
        setRefIndex(
            messages?.length > 15 && fetchedMore ? 15 : messages?.length - 1,
        );
        setInitalLoaded(true);
    }, [messages, fetchedMore]);

    useEffect(() => {
        setInitalLoaded(false);
    }, [params?.chatid]);

    useEffect(() => {
        if (chats && params?.chatid) {
            const findChat = chats?.find(
                (chat: any) => chat?._id === params?.chatid,
            );
            if (findChat) {
                setChat(findChat);
                setChatInfo(findChat);
            }
        }
    }, [chats, params?.chatid, setChatInfo]);

    useEffect(() => {
        if (chat?.otherUser?._id === process.env.NEXT_PUBLIC_AI_BOT_ID) {
            const currentMessages: any = messages || [];

            if (currentMessages?.length === 0) {
                return;
            }
            const lastMessage = currentMessages[currentMessages?.length - 1];

            if (
                lastMessage?.sender?._id === process.env.NEXT_PUBLIC_AI_BOT_ID
            ) {
                setAiIncomingMessage('');
            }
        }
    }, [messages, chat, params?.chatid]);

    const chatContainerRef = useRef<HTMLDivElement>(null);
    const lastMessageRef = useRef<HTMLDivElement>(null);

    // 1. Add this useEffect to control initial rendering
    useEffect(() => {
        // Don't render any messages until we're ready to scroll to bottom
        if (params?.chatid && !initialLoaded) {
            setIsLoading(true); // Show loading state instead of messages
        }
    }, [params?.chatid, initialLoaded]);

    // Modified useEffect for fetching initial messages
    useEffect(() => {
        if (params?.chatid) {
            setIsFetching(true);
            setIsLoading(true);
            setError(null);
            dispatch(setCurrentPage(1));
            setCount(0);
            const options = {
                page: 1,
                chat: params?.chatid,
                limit,
                query: searchQuery || '',
            };
            instance
                .post(`/chat/messages`, options)
                .then((res) => {
                    setIsLoading(false);
                    setCount(res.data.count);
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
                    if (params?.chatid) {
                        dispatch(markRead({ chatId: params.chatid as string }));
                    }
                    setIsFetching(false);
                    // Set initialLoaded in the next render cycle
                    // This ensures DOM is ready before we scroll
                    requestAnimationFrame(() => {
                        if (chatContainerRef.current) {
                            // Pre-position the scroll before revealing messages
                            chatContainerRef.current.scrollTop =
                                chatContainerRef.current.scrollHeight;
                            setInitalLoaded(true);
                        }
                    });
                })
                .catch((err) => {
                    setIsLoading(false);
                    if (err?.response?.data?.error) {
                        setError(err.response.data.error);
                    }
                    setInitalLoaded(true);
                    setIsFetching(false);
                });
        }
    }, [params?.chatid, reload, searchQuery]);

    interface SentCallbackObject {
        action: string;
        message?: any;
    }

    const onSentCallback = async (object: SentCallbackObject) => {
        if (object?.action === 'create') {
            if (object?.message?._id) {
                dispatch(
                    updateMessageStatus({
                        chatId: params?.chatid as string,
                        messageId: object.message._id,
                        status: 'sent',
                    }),
                );
            }

            if (chat?.otherUser?._id === process.env.NEXT_PUBLIC_AI_BOT_ID) {
                const histories = messages?.slice(-3)?.map((x: any) => ({
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

    const [isTyping, setIsTyping] = useState<boolean>(false);

    // Function to send typing indicator
    const sendTypingIndicator = (isTyping: boolean) => {
        setIsTyping(isTyping);
    };

    return (
        <>
            {/* Pinned Messages Bar */}
            {!showPinnedMessages &&
                messages.filter(
                    (message) => message.pinnedBy && message?.type !== 'delete',
                ).length > 0 && (
                    <div
                        className='w-full shadow-lg bg-background border shadow-ms cursor-pointer'
                        onClick={() => setShowPinnedMessages(true)}
                    >
                        <div className='container mx-auto flex items-center p-2'>
                            <div className='flex items-center gap-2 w-full'>
                                <span className=' text-primary-white flex items-center justify-center text-xs font-medium'>
                                    {
                                        messages.filter(
                                            (message) =>
                                                message.pinnedBy &&
                                                message?.type !== 'delete',
                                        ).length
                                    }
                                </span>

                                {messages.filter(
                                    (message) =>
                                        message.pinnedBy &&
                                        message?.type !== 'delete',
                                ).length > 0 && (
                                    <>
                                        <Avatar className='h-6 w-6'>
                                            <AvatarImage
                                                src={
                                                    messages
                                                        .filter(
                                                            (message) =>
                                                                message.pinnedBy,
                                                        )
                                                        .sort(
                                                            (a, b) =>
                                                                new Date(
                                                                    b.createdAt as string,
                                                                ).getTime() -
                                                                new Date(
                                                                    a.createdAt as string,
                                                                ).getTime(),
                                                        )[0]?.pinnedBy
                                                        ?.profilePicture
                                                }
                                                alt='User'
                                            />
                                            <AvatarFallback>
                                                {messages
                                                    .filter(
                                                        (message) =>
                                                            message.pinnedBy,
                                                    )
                                                    .sort(
                                                        (a, b) =>
                                                            new Date(
                                                                b.createdAt as string,
                                                            ).getTime() -
                                                            new Date(
                                                                a.createdAt as string,
                                                            ).getTime(),
                                                    )[0]
                                                    ?.pinnedBy?.firstName?.charAt(
                                                        0,
                                                    )}
                                            </AvatarFallback>
                                        </Avatar>

                                        <span className='font-medium text-sm max-w-[150px] truncate'>
                                            {
                                                messages
                                                    .filter(
                                                        (message) =>
                                                            message.pinnedBy,
                                                    )
                                                    .sort(
                                                        (a, b) =>
                                                            new Date(
                                                                b.createdAt as string,
                                                            ).getTime() -
                                                            new Date(
                                                                a.createdAt as string,
                                                            ).getTime(),
                                                    )[0]?.pinnedBy?.fullName
                                            }
                                        </span>

                                        <span className='text-xs text-gray w-fit'>
                                            {dayjs(
                                                messages
                                                    .filter(
                                                        (message) =>
                                                            message.pinnedBy,
                                                    )
                                                    .sort(
                                                        (a, b) =>
                                                            new Date(
                                                                b.createdAt as string,
                                                            ).getTime() -
                                                            new Date(
                                                                a.createdAt as string,
                                                            ).getTime(),
                                                    )[0]?.createdAt,
                                            ).format('h:mm A')}
                                        </span>

                                        <div className='flex-1 truncate text-sm text-gray ml-2 max-w-[calc(100%-200px)]'>
                                            {(() => {
                                                const pinnedMessage = messages
                                                    .filter(
                                                        (message) =>
                                                            message.pinnedBy,
                                                    )
                                                    .sort(
                                                        (a, b) =>
                                                            new Date(
                                                                b.createdAt as string,
                                                            ).getTime() -
                                                            new Date(
                                                                a.createdAt as string,
                                                            ).getTime(),
                                                    )[0];

                                                if (!pinnedMessage) {
                                                    return null;
                                                }

                                                // If there are files, show pinned media
                                                if (
                                                    pinnedMessage.files &&
                                                    pinnedMessage.files.length >
                                                        0
                                                ) {
                                                    return '📎 Pinned Media';
                                                }

                                                // If there's text, show the text
                                                if (pinnedMessage.text) {
                                                    return (
                                                        <p>
                                                            {renderPlainText({
                                                                text: pinnedMessage.text,
                                                                textSize:
                                                                    'text-xs',
                                                                textColor:
                                                                    'text-black',
                                                                width: 'w-full',
                                                                lineClamp: 1,
                                                            })}
                                                        </p>
                                                    );
                                                }

                                                // Default fallback
                                                return '📎 Pinned conversation';
                                            })()}
                                        </div>

                                        <Pin className='h-4 w-4 text-dark-gray rotate-45 ml-2 flex-shrink-0' />
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}

            <div
                className={`scrollbar-container flex-grow overflow-hidden pl-2`}
            >
                <div
                    className='h-full overflow-y-auto'
                    id='chat-body-id'
                    onScroll={handleScroll}
                    ref={chatContainerRef}
                >
                    {showPinnedMessages ? (
                        <div className='p-4'>
                            {messages.filter(
                                (message) =>
                                    message.pinnedBy &&
                                    message?.type !== 'delete',
                            ).length > 0 ? (
                                messages
                                    .filter(
                                        (message) =>
                                            message.pinnedBy &&
                                            message?.type !== 'delete',
                                    )
                                    .map((message) => (
                                        <Message
                                            isAi={isAi}
                                            key={message._id}
                                            hideOptions={false}
                                            source='pinned'
                                            message={message}
                                            setEditMessage={setEditMessage}
                                            setThreadMessage={setThreadMessage}
                                            bottomRef={bottomTextRef}
                                            reload={reload}
                                            setReload={setReload}
                                            searchQuery={searchQuery}
                                        />
                                    ))
                            ) : (
                                <div className='flex flex-col items-center justify-center p-6'>
                                    <div className='rounded-full p-2 bg-primary-light text-primary-white mb-2'>
                                        <PinIcon size={30} />
                                    </div>
                                    <p className='text-black text-center'>
                                        No pinned messages available
                                    </p>
                                    <p className='text-sm text-gray mt-2 text-center'>
                                        Pin messages to keep important
                                        information easily accessible
                                    </p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            {currentPage * 20 < count ? (
                                <div className='w-full flex flex-row items-center gap-2 my-2'>
                                    <div className='w-full h-[2px] bg-border'></div>
                                    <div className='text-center'>
                                        <Button
                                            disabled={isFetching}
                                            className='bg-primary-light text-primary rounded-full h-8 border text-xs'
                                            onClick={() =>
                                                fetchMore(currentPage)
                                            }
                                        >
                                            {isFetching ? (
                                                <Loader2 className='h-5 w-5 animate-spin' />
                                            ) : (
                                                'Load More'
                                            )}{' '}
                                        </Button>
                                    </div>
                                    <div className='w-full h-[2px] bg-border'></div>
                                </div>
                            ) : (
                                messages?.length === 0 &&
                                chat && (
                                    <div className='p-2.5 text-center flex flex-col items-center gap-2.5'>
                                        {/* No results message when searching */}
                                        {searchQuery &&
                                        messages.length === 0 &&
                                        !isLoading ? (
                                            <div className='flex flex-col items-center justify-center h-[50vh] p-4 text-center'>
                                                <SearchIcon className='h-12 w-12 text-muted-foreground mb-2' />
                                                <h3 className='text-lg font-medium'>
                                                    No messages found
                                                </h3>
                                                <p className='text-muted-foreground'>
                                                    {`We couldn't find any messages matching "${searchQuery}"`}
                                                </p>
                                                <Button
                                                    variant='outline'
                                                    className='mt-4'
                                                    onClick={() => {
                                                        setFinalQuery?.();
                                                    }}
                                                >
                                                    Clear search
                                                </Button>
                                            </div>
                                        ) : chat?.isChannel ? (
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
                                                    This is the very beginning
                                                    of the{' '}
                                                    <strong>
                                                        {chat?.name}
                                                    </strong>{' '}
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
                                                    This is the very beginning
                                                    of the chat with{' '}
                                                    <strong>
                                                        {
                                                            chat?.otherUser
                                                                ?.firstName
                                                        }{' '}
                                                        {
                                                            chat?.otherUser
                                                                ?.lastName
                                                        }
                                                    </strong>
                                                </p>
                                            </>
                                        )}
                                    </div>
                                )
                            )}

                            {messages?.length === 0 && !chat && (
                                <div className='text-center mt-15 pb-[25vh]'>
                                    <h3 className='font-bold text-dark-gray'>
                                        No messages found!
                                    </h3>
                                </div>
                            )}

                            {error && !selectedChat?.isArchived ? (
                                // <Alert variant='destructive'>
                                //     <AlertTitle>Error</AlertTitle>
                                //     <AlertDescription>{error}</AlertDescription>
                                // </Alert>
                                <></>
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
                                                            <span className='text-primary-white text-xs bg-primary-light text-nowrap px-2 py-1 rounded-full'>
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
                                                        setForwardMessage={
                                                            setForwardMessage
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
                                        createdAt: dayjs(Date.now()).format(),
                                        status: 'sending',
                                        chat: chat?._id as string,
                                        type: 'message',
                                        text: aiIncomingMessage,
                                    }}
                                    reload={reload}
                                    setReload={setReload}
                                />
                            )}
                        </>
                    )}
                </div>
            </div>

            {selectedChat?.isArchived && (
                <div className='h-[60px] w-full bg-background flex items-center justify-center text-wrap text-danger font-semibold text-2xl '>
                    <p className='flex flex-row items-center gap-2'>
                        <ArchiveIcon size={24} /> This channel is archived
                    </p>
                </div>
            )}

            {chat &&
                !showPinnedMessages &&
                !(chat?.myData?.isBlocked || selectedChat?.isArchived) && (
                    <ChatFooter
                        chat={chat as ChatData}
                        className={`chat_${chat?._id}`}
                        draft={draft}
                        onSentCallback={onSentCallback}
                        setProfileInfoShow={setProfileInfoShow}
                        profileInfoShow={profileInfoShow}
                        sendTypingIndicator={sendTypingIndicator}
                    />
                )}
            {showPinnedMessages && (
                <div className='w-full items-center justify-center flex border-t h-12 mt-2 bg-background'>
                    <Button
                        onClick={() => setShowPinnedMessages(false)}
                        className='w-fit px-10'
                        variant={'destructive'}
                    >
                        Exit Pin Mode
                    </Button>
                </div>
            )}

            {threadMessage && (
                <Thread
                    chat={chat}
                    handleClose={() => setThreadMessage(null)}
                    message={threadMessage}
                    setEditMessage={setEditMessage}
                />
            )}

            {editMessage && chat && (
                <EditMessageModal
                    chat={chat}
                    selectedMessage={editMessage}
                    handleCloseEdit={() => setEditMessage(null)}
                />
            )}

            {forwardMessage && (
                <ForwardMessageModal
                    isOpen={!!forwardMessage}
                    onClose={() => setForwardMessage(null)}
                    message={forwardMessage}
                />
            )}
            {/* <CreateEventModal /> */}
        </>
    );
};

export default ChatBody;
