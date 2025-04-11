'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Message from '../Message/page';
import { useParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
import dayjs from 'dayjs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import ChatFooter, { type ChatData } from '../ChatFooter';
import Cookies from 'js-cookie';
import { Loader2, Pin } from 'lucide-react';
import {
    markRead,
    pushHistoryMessages,
    setCurrentPage,
    setFetchedMore,
    updateChatMessages,
    setMessageCount,
    setTyping,
    updateMessageStatus,
} from '@/redux/features/chatReducer';
import { useAppSelector } from '@/redux/hooks';
import { instance } from '@/lib/axios/axiosInstance';
import Thread from '../thread';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
    joinChatRoom,
    leaveChatRoom,
    connectSocket,
    sendTypingEvent,
} from '@/helper/socketManager';
import EditMessageModal from '../Message/EditMessageModal';
import { TypingData } from '@/helper/socketHandler';
import ForwardMessageModal from '../Message/ForwardMessageModal';

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
    setReloading: (reloading: boolean | ((prev: boolean) => boolean)) => void;
    reloading: boolean;
    searchQuery?: string;
    chatId?: string;
}

interface SentCallbackObject {
    action: string;
    message?: {
        text: string;
    };
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
        return inputDate.toLocaleDateString();
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
    const dispatch = useDispatch();

    // Use the chatId from props if in popup mode, otherwise from URL params
    const selectedChatId = isPopup ? chatId : (params?.chatid as string);
    const [showPinnedMessages, setShowPinnedMessages] = useState(false);
    // Get Redux state using useAppSelector
    const {
        chatMessages,
        chats,
        onlineUsers,
        currentPage: reduxCurrentPage,
        fetchedMore: reduxFetchedMore,
        drafts,
        messageCounts,
    } = useAppSelector((state) => state.chat);
    const { user } = useAppSelector((state) => state.auth);
    const userId = user?._id;

    // Local state for component
    const [chat, setChat] = useState<any | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [editMessage, setEditMessage] = useState<ChatMessage | null>(null);
    const [threadMessage, setThreadMessage] = useState<ChatMessage | null>(
        null,
    );
    const [aiIncomingMessage, setAiIncomingMessage] = useState<string>('');
    const [isThinking, setIsThinking] = useState<boolean>(false);
    const [initialLoaded, setInitialLoaded] = useState<boolean>(false);
    const [refIndex, setRefIndex] = useState<number>(0);
    const [reload, setReload] = useState<number>(0);
    const [isTyping, setIsTyping] = useState<boolean>(false);
    const [isFetching, setIsFetching] = useState<boolean>(false);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [forceScrollBottom, setForceScrollBottom] = useState<boolean>(false);

    // Track if we're doing an initial load or just refreshing/appending messages
    const [initialLoading, setInitialLoading] = useState<boolean>(false);
    const [softLoading, setSoftLoading] = useState<boolean>(false);

    // Get existing messages and counts from Redux
    const messages = chatMessages[selectedChatId as string] || [];
    const messageCount = messageCounts[selectedChatId as string] || 0;

    // Get draft for this chat
    const draft = drafts?.find((f) => f.chat === selectedChatId);

    // Refs for scrolling and DOM access
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const lastMessageRef = useRef<HTMLDivElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const prevChatIdRef = useRef<string>('');
    const prevMessageLengthRef = useRef<number>(0);
    const socketRef = useRef<any>(null);
    const isScrolledToBottomRef = useRef<boolean>(true);
    const [forwardMessage, setForwardMessage] = useState<ChatMessage | null>(
        null,
    );

    // Initialize socket connection and join chat room
    useEffect(() => {
        const setupSocket = async () => {
            try {
                const socket = await connectSocket();
                socketRef.current = socket;

                // Only join if we have a selectedChatId
                if (selectedChatId) {
                    joinChatRoom(selectedChatId);
                }

                return () => {
                    if (selectedChatId) {
                        leaveChatRoom(selectedChatId);
                    }
                };
            } catch (error) {
                console.error('Error setting up socket:', error);
                return () => {};
            }
        };

        const cleanup = setupSocket();

        return () => {
            cleanup.then((cleanupFn) => cleanupFn());
        };
    }, [selectedChatId]);

    // Track scroll position to determine if user is scrolled to bottom
    const handleScroll = useCallback(() => {
        const div = chatContainerRef.current;
        if (!div) {
            return;
        }

        // Check if user is at bottom of chat
        const isAtBottom =
            Math.abs(div.scrollHeight - div.clientHeight - div.scrollTop) < 50;

        isScrolledToBottomRef.current = isAtBottom;

        // Load more messages if scrolled to top
        if (
            div.scrollTop < 100 &&
            !isFetching &&
            messages.length < messageCount
        ) {
            fetchMoreMessages();
        }
    }, [isFetching, messages.length, messageCount]);

    // Update chat information when the chat list or selected chat changes
    useEffect(() => {
        if (chats && selectedChatId) {
            const foundChat = chats.find((c) => c._id === selectedChatId);
            if (foundChat) {
                setChat(foundChat);
                setChatInfo(foundChat);
            }
        }
    }, [chats, selectedChatId, setChatInfo]);

    // Handle AI message stream clearing
    useEffect(() => {
        if (chat?.otherUser?._id === process.env.NEXT_PUBLIC_AI_BOT_ID) {
            if (messages.length === 0) {
                return;
            }

            const lastMessage = messages[messages.length - 1];
            if (
                lastMessage?.sender?._id === process.env.NEXT_PUBLIC_AI_BOT_ID
            ) {
                setAiIncomingMessage('');
            }
        }
    }, [messages, chat]);

    // Check if we need to auto-scroll when messages change
    useEffect(() => {
        // Determine if auto-scroll should happen
        if (messages.length === 0) {
            return;
        }

        // Auto-scroll if:
        // 1. The user is already at the bottom
        // 2. The newest message is from the current user
        // 3. We just loaded the chat for the first time
        // 4. We have a force scroll trigger (e.g., from sending a message)
        const lastMessage = messages[messages.length - 1];
        const isUserMessage = lastMessage?.sender?._id === userId;
        const shouldScroll =
            isScrolledToBottomRef.current ||
            isUserMessage ||
            !initialLoaded ||
            forceScrollBottom;

        if (shouldScroll && bottomRef.current) {
            bottomRef.current.scrollIntoView({
                behavior: initialLoaded ? 'smooth' : 'auto',
                block: 'end',
            });

            if (forceScrollBottom) {
                setForceScrollBottom(false);
            }
        }

        // Update parent component if needed
        if (messages.length !== prevMessageLengthRef.current) {
            setReloading((prev) => !prev);
            prevMessageLengthRef.current = messages.length;
        }

        // Mark messages as read
        if (selectedChatId) {
            dispatch(markRead({ chatId: selectedChatId }));
        }

        // Set initial loaded flag
        if (!initialLoaded && messages.length > 0) {
            setInitialLoaded(true);
        }
    }, [
        messages,
        userId,
        initialLoaded,
        forceScrollBottom,
        dispatch,
        selectedChatId,
        setReloading,
    ]);

    // Handle chat switching
    useEffect(() => {
        if (selectedChatId !== prevChatIdRef.current) {
            // Leave previous chat room if any
            if (prevChatIdRef.current) {
                leaveChatRoom(prevChatIdRef.current);
            }

            // Reset state for new chat
            setInitialLoaded(false);
            setForceScrollBottom(true);
            setRefIndex(0);
            setInitialLoading(true);

            // Join new chat room
            if (selectedChatId) {
                joinChatRoom(selectedChatId);

                // Load messages if not already in Redux
                if (
                    !chatMessages[selectedChatId] ||
                    chatMessages[selectedChatId].length === 0
                ) {
                    fetchInitialMessages();
                } else {
                    // If we already have messages, just mark as read and set loaded
                    dispatch(markRead({ chatId: selectedChatId }));
                    setInitialLoaded(true);
                    setInitialLoading(false);

                    // Scroll to bottom on next tick
                    setTimeout(() => {
                        setForceScrollBottom(true);
                    }, 0);
                }
            }

            // Update ref
            prevChatIdRef.current = selectedChatId || '';
        }
    }, [selectedChatId, dispatch, chatMessages]);

    // Fetch initial messages for a chat
    const fetchInitialMessages = useCallback(() => {
        if (!selectedChatId) {
            return;
        }

        setInitialLoading(true);
        setSoftLoading(false);
        setError(null);

        const options = {
            page: 1,
            chat: selectedChatId,
            limit: 15,
            query: searchQuery || '',
        };

        instance
            .post('/chat/messages', options)
            .then((res) => {
                // Update message count in Redux
                dispatch(
                    setMessageCount({
                        chatId: selectedChatId,
                        count: res.data.count,
                    }),
                );

                // Update messages in Redux
                dispatch(
                    updateChatMessages({
                        chat: res.data.chat._id,
                        messages: res.data.messages,
                    }),
                );

                // Update local state
                setHasMore(res.data.messages.length < res.data.count);
                dispatch(markRead({ chatId: selectedChatId }));
                setInitialLoaded(true);

                // Set page in Redux
                dispatch(setCurrentPage(1));
                dispatch(setFetchedMore(false));
            })
            .catch((err) => {
                if (err && err.response) {
                    setError(err.response.data.error);
                }
                console.error('Error fetching messages:', err);
            })
            .finally(() => {
                setInitialLoading(false);
                setSoftLoading(false);
                setForceScrollBottom(true);
            });
    }, [selectedChatId, searchQuery, dispatch]);

    // Fetch more (older) messages
    const fetchMoreMessages = useCallback(() => {
        if (!selectedChatId || isFetching) {
            return;
        }

        setSoftLoading(true);
        setIsFetching(true);

        const currentPage = Math.ceil(messages.length / 15) + 1;

        const options = {
            page: currentPage,
            chat: selectedChatId,
            limit: 15,
            query: searchQuery || '',
        };

        instance
            .post('/chat/messages', options)
            .then((res) => {
                // Remember the current scroll position
                const scrollContainer = chatContainerRef.current;
                const scrollHeight = scrollContainer?.scrollHeight || 0;
                const scrollTop = scrollContainer?.scrollTop || 0;

                // Push history messages
                dispatch(
                    pushHistoryMessages({
                        chat: selectedChatId,
                        messages: res.data.messages || [],
                    }),
                );

                // Update has more flag
                setHasMore(res.data.messages.length >= 15);

                // Update Redux state
                dispatch(setCurrentPage(currentPage));
                dispatch(setFetchedMore(true));

                // Restore scroll position after messages are added
                setTimeout(() => {
                    if (scrollContainer) {
                        const newScrollHeight = scrollContainer.scrollHeight;
                        const scrollDiff = newScrollHeight - scrollHeight;
                        scrollContainer.scrollTop = scrollTop + scrollDiff;
                    }
                }, 10);
            })
            .catch((err) => {
                if (err?.response) {
                    setError(err.response.data.error);
                }
                console.error('Error fetching more messages:', err);
            })
            .finally(() => {
                setSoftLoading(false);
                setIsFetching(false);
            });
    }, [selectedChatId, messages.length, isFetching, searchQuery, dispatch]);

    // Refresh current messages (e.g., after search)
    const refreshMessages = useCallback(() => {
        if (!selectedChatId) {
            return;
        }

        setSoftLoading(true);

        const options = {
            page: 1,
            chat: selectedChatId,
            limit: 15,
            query: searchQuery || '',
        };

        instance
            .post('/chat/messages', options)
            .then((res) => {
                // Update messages in Redux
                dispatch(
                    updateChatMessages({
                        chat: res.data.chat._id,
                        messages: res.data.messages,
                    }),
                );

                // Update has more flag
                setHasMore(res.data.messages.length < res.data.count);

                // Reset page in Redux
                dispatch(setCurrentPage(1));
                dispatch(setFetchedMore(false));
            })
            .catch((err) => {
                if (err && err.response) {
                    setError(err.response.data.error);
                }
                console.error('Error refreshing messages:', err);
            })
            .finally(() => {
                setSoftLoading(false);
                setForceScrollBottom(true);
            });
    }, [selectedChatId, searchQuery, dispatch]);

    // Refresh when search query changes
    useEffect(() => {
        if (initialLoaded && selectedChatId) {
            refreshMessages();
        }
    }, [searchQuery, initialLoaded, selectedChatId, refreshMessages]);

    // Handle message send callback
    const onSentCallback = async (object: SentCallbackObject) => {
        if (object?.action === 'create') {
            setForceScrollBottom(true);

            // For AI chat
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

    // Handle typing indicators
    const sendTypingIndicator = (isTyping: boolean) => {
        if (!selectedChatId || !userId) {
            return;
        }

        // Send typing event to socket
        sendTypingEvent(selectedChatId, isTyping);

        // Also update local state
        setIsTyping(isTyping);

        // Update Redux for local UI representation
        dispatch(
            setTyping({
                chatId: selectedChatId,
                typingData: {
                    isTyping: isTyping,
                    userId: userId,
                    username: user?.fullName || '',
                },
            }),
        );
    };
    const bottomTextRef = useRef<any | null>(null);

    return (
        <>
            {!showPinnedMessages &&
                messages.filter((message) => message.pinnedBy).length > 0 && (
                    <div
                        className='w-full shadow-lg bg-foreground border shadow-ms cursor-pointer'
                        onClick={() => setShowPinnedMessages(true)}
                    >
                        <div className='container mx-auto flex items-center p-2'>
                            <div className='flex items-center gap-2 w-full'>
                                <span className=' text-primary flex items-center justify-center text-xs font-medium'>
                                    {
                                        messages.filter(
                                            (message) => message.pinnedBy,
                                        ).length
                                    }
                                </span>

                                {messages.filter((message) => message.pinnedBy)
                                    .length > 0 && (
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

                                        <span className='text-xs text-gray w-[50px]'>
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
                                            {/* <MessagePreview
                                                searchQuery={searchQuery}
                                                text={
                                                    messages
                                                        .filter(
                                                            (message) =>
                                                                message.pinnedBy,
                                                        )
                                                        .sort(
                                                            (a, b) =>
                                                                new Date(
                                                                    b.createdAt,
                                                                ).getTime() -
                                                                new Date(
                                                                    a.createdAt,
                                                                ).getTime(),
                                                        )[0]?.text
                                                }
                                            /> */}
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
                                                    )[0]?.text
                                            }
                                        </div>

                                        <Pin className='h-4 w-4 text-dark-gray rotate-45 ml-2 flex-shrink-0' />
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            <div
                className={`scrollbar-container ${messages.filter((message) => message.pinnedBy).length > 0 ? 'h-[calc(100%-104px)]' : 'h-[calc(100%-127px)]'} pl-2`}
            >
                <div
                    className='h-full overflow-y-auto'
                    id='chat-body-id'
                    onScroll={handleScroll}
                    ref={chatContainerRef}
                >
                    {initialLoading && messages.length === 0 ? (
                        <div className='h-full w-full flex justify-center items-center'>
                            <Loader2 className='h-14 w-14 text-primary animate-spin' />
                        </div>
                    ) : showPinnedMessages ? (
                        <div className='p-4'>
                            {messages
                                .filter((message) => message.pinnedBy)
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
                                ))}
                        </div>
                    ) : (
                        <div>
                            {/* Load more button - only shown if needed */}
                            {hasMore && messages.length > 0 && (
                                <div className='flex flex-row items-center gap-1 my-2'>
                                    <div className='w-full h-[2px] bg-border rounded-xl'></div>
                                    <div className='text-center'>
                                        <Button
                                            disabled={isFetching}
                                            className='bg-primary-light rounded-full font-normal text-xs h-6 text-primary'
                                            onClick={fetchMoreMessages}
                                        >
                                            {softLoading ? (
                                                <Loader2 className='h-3 w-3 animate-spin' />
                                            ) : (
                                                'Load More'
                                            )}
                                        </Button>
                                    </div>
                                    <div className='w-full h-[2px] bg-border rounded-xl'></div>
                                </div>
                            )}

                            {/* Chat start indicator - shown when at the beginning of chat history */}
                            {messages.length > 0 && !hasMore && (
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

                            {/* Empty state - shown when no messages */}
                            {messages.length === 0 && !initialLoading && (
                                <div className='text-center mt-15 pb-[25vh]'>
                                    <h3 className='font-bold text-dark-gray'>
                                        No messages found!
                                    </h3>
                                </div>
                            )}

                            {/* Error message */}
                            {error ? (
                                <Alert variant='destructive'>
                                    <AlertTitle>Error</AlertTitle>
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            ) : (
                                <>
                                    {/* Message list */}
                                    {messages.map(
                                        (message: any, index: number) => {
                                            const isLastMessage =
                                                index === messages.length - 1;
                                            const sameDate =
                                                index > 0 &&
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
                                                    {/* Date header - shown when date changes */}
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

                                                    {/* Message component */}
                                                    <Message
                                                        isAi={isAi}
                                                        key={
                                                            message._id ||
                                                            `message-${index}`
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
                                                            isLastMessage
                                                                ? lastMessageRef
                                                                : null
                                                        }
                                                        bottomRef={bottomRef}
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

                            {/* Typing indicator */}
                            {/* {renderTypingIndicator()} */}

                            {/* AI message streaming */}
                            {aiIncomingMessage && (
                                <Message
                                    key='ai-incoming-message'
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

                            {/* Invisible element for scrolling to bottom */}
                            <div
                                ref={bottomRef}
                                style={{ height: '1px', width: '100%' }}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Chat footer */}
            {!showPinnedMessages && !(chat?.myData?.isBlocked || error) && (
                <ChatFooter
                    chat={chat as ChatData}
                    className={`chat_${chat?._id}`}
                    draft={draft}
                    onSentCallback={onSentCallback}
                    setProfileInfoShow={setProfileInfoShow}
                    profileInfoShow={profileInfoShow}
                    sendTypingIndicator={sendTypingIndicator}
                    isPopUp={true}
                />
            )}
            {showPinnedMessages && (
                <div className='w-full items-center justify-center flex border-t pt-2 mt-2'>
                    <Button
                        onClick={() => setShowPinnedMessages(false)}
                        className='w-fit px-10'
                        variant={'destructive'}
                    >
                        Exit Pin Mode
                    </Button>
                </div>
            )}

            {/* Thread modal */}
            {threadMessage && (
                <Thread
                    chat={chat}
                    handleClose={() => setThreadMessage(null)}
                    message={threadMessage}
                    setEditMessage={setEditMessage}
                />
            )}

            {/* Edit message modal */}
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

            {/* Add styles for typing indicator */}
            <style jsx global>{`
                .typing-indicator {
                    display: flex;
                    align-items: center;
                }

                .typing-indicator span {
                    height: 8px;
                    width: 8px;
                    background: #3b82f6;
                    border-radius: 50%;
                    display: inline-block;
                    margin: 0 1px;
                    animation: typing 1.4s infinite ease-in-out;
                }

                .typing-indicator span:nth-child(1) {
                    animation-delay: 0s;
                }

                .typing-indicator span:nth-child(2) {
                    animation-delay: 0.2s;
                }

                .typing-indicator span:nth-child(3) {
                    animation-delay: 0.4s;
                }

                @keyframes typing {
                    0%,
                    60%,
                    100% {
                        transform: translateY(0);
                    }
                    30% {
                        transform: translateY(-5px);
                    }
                }
            `}</style>
        </>
    );
};

export default PopUpChatBody;
