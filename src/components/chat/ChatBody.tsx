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
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import {
    markRead,
    pushHistoryMessages,
    setCurrentPage,
    setFetchedMore,
    updateChatMessages,
} from '@/redux/features/chatReducer';
import { toast } from 'sonner';
import { useAppSelector } from '@/redux/hooks';
import { instance } from '@/lib/axios/axiosInstance';
import chatStateData from './ChatStateData.json';
import Thread from './thread';
import { useGetChatMessagesQuery } from '@/redux/api/chats/chatApi';
import {
    useChatMessages,
    useChats,
    useDraftMessages,
} from '@/redux/hooks/chat/chatHooks';
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

interface ChatBodyProps {
    isAi?: boolean;
    setChatInfo: (chat: any | null) => void;
    setProfileInfoShow: (show: boolean) => void;
    profileInfoShow: boolean;
    setReloading: (reloading: boolean) => void;
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
}) => {
    const params = useParams();
    const dispatch = useDispatch();
    // Get chats data from RTK Query
    const { chats, isLoading: isChatsLoading } = useChats();

    // Get drafts data from the hook
    const { drafts, getDraft } = useDraftMessages();

    // Get messages for current chat
    const {
        messages,
        totalCount: count,
        chatInfo,
        isLoading: isMessagesLoading,
        isFetchingMore: isFetching,
        loadMoreMessages,
        hasMore,
    } = useChatMessages(params?.chatid as string, 15);

    // Rest of your component logic
    // ...

    // Get draft for this chat
    const draft = getDraft(params?.chatid as string);

    const [currentPage, setCurrentPage] = useState(1);
    const [fetchedMore, setFetchedMore] = useState(false);

    // Update fetchMore to also update currentPage
    const fetchMore = (page: number) => {
        loadMoreMessages();
        setCurrentPage((prev) => prev + 1);
        setFetchedMore(true);
    };
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [chat, setChat] = useState<any | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [editMessage, setEditMessage] = useState<ChatMessage | null>(null);
    const [threadMessage, setThreadMessage] = useState<ChatMessage | null>(
        null,
    );
    const [limit, setLimit] = useState<number>(15);
    //for ai
    const [aiIncomingMessage, setAiIncomingMessage] = useState<string>('');
    const [isThinking, setIsThinking] = useState<boolean>(false);
    const [initialLoaded, setInitalLoaded] = useState<boolean>(false);
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
            // Change this line
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

    // Remove or simplify this useEffect since RTK Query handles the data fetching
    useEffect(() => {
        if (params?.chatid) {
            // Just mark as read
            dispatch(markRead({ chatId: params?.chatid as string }));
        }
    }, [params?.chatid, searchQuery, dispatch]);
    interface SentCallbackObject {
        action: string;
        message?: {
            text: string;
        };
    }

    const onSentCallback = async (object: SentCallbackObject) => {
        if (object?.action === 'create') {
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

    return (
        <>
            <div className='scrollbar-container h-[calc(100%-135px)] pl-2'>
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
                                messages?.length === 0 && (
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

export default ChatBody;
