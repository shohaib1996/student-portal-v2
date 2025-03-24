'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
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
import { instance } from '@/lib/axios/axiosInstance';
import Thread from '../thread';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
    useChatMessages,
    useChats,
    useDraftMessages,
    useTypingIndicator,
} from '@/redux/hooks/chat/chatHooks';
import {
    useGetOnlineUsersQuery,
    useGetChatMessagesQuery,
    useGetChatsQuery,
    useMarkChatAsReadMutation,
} from '@/redux/api/chats/chatApi';
import {
    joinChatRoom,
    leaveChatRoom,
    connectSocket,
} from '@/helper/socketManager';
import EditMessageModal from '../Message/EditMessageModal';

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
    // Initialize socket connection on component mount
    useEffect(() => {
        const initSocket = async () => {
            try {
                // Connect to the socket server
                const socket = await connectSocket();
                return () => {
                    if (socket) {
                        // Disconnect socket on unmount
                        socket.disconnect();
                    }
                };
            } catch (error) {
                console.error('Error connecting to socket:', error);
                return () => {};
            }
        };

        const cleanup = initSocket();
        return () => {
            cleanup.then((cleanupFn) => cleanupFn());
        };
    }, []);

    const params = useParams();
    const selectedChatId = isPopup ? chatId : params?.chatid || '';
    const dispatch = useDispatch();

    // Get current user ID from Redux store
    const { user } = useAppSelector((state) => state.auth || {});
    const userId = user?._id;

    // RTK mutation for marking chats as read
    const [markChatAsRead] = useMarkChatAsReadMutation();

    // Get chats data from the hook
    const { chats, isLoading: isChatsLoading } = useChats();

    // Get drafts data from the hook
    const { drafts, getDraft } = useDraftMessages();

    // Get typing indicator state
    const { isTyping, sendTypingIndicator } = useTypingIndicator(
        selectedChatId as string,
    );

    const [currentPage, setCurrentPage] = useState(1);
    const [fetchedMore, setFetchedMore] = useState(false);

    // Get messages for the selected chat
    const {
        data: messagesData,
        isLoading: isMessagesLoading,
        isFetching: isFetchingMessages,
        refetch: refetchMessages,
    } = useGetChatMessagesQuery(
        { chat: selectedChatId as string, page: currentPage, limit: 15 },
        {
            skip: !selectedChatId,
            // Don't refetch on window focus to avoid disrupting user
            refetchOnFocus: false,
        },
    );

    // Extract messages and count from query response
    const messages = messagesData?.messages || [];
    const count = messagesData?.count || 0;
    const chatInfo = messagesData?.chat;

    // Function to load more messages
    const loadMoreMessages = useCallback(() => {
        setCurrentPage((prev) => prev + 1);
    }, []);

    // Track if we're currently fetching more messages
    const isFetching = isFetchingMessages && currentPage > 1;

    // Check if we have more messages to load
    const hasMore = messages.length < count;

    // Keep track of previous chat ID
    const prevChatIdRef = useRef<string>('');

    // Local states for UI management
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [chat, setChat] = useState<any | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [editMessage, setEditMessage] = useState<ChatMessage | null>(null);
    const [threadMessage, setThreadMessage] = useState<ChatMessage | null>(
        null,
    );
    const [aiIncomingMessage, setAiIncomingMessage] = useState<string>('');
    const [isThinking, setIsThinking] = useState<boolean>(false);
    const [initialLoaded, setInitalLoaded] = useState<boolean>(false);
    const [refIndex, setRefIndex] = useState<number>(15);
    const [reload, setReload] = useState<number>(0);

    // Refs for DOM elements
    const bottomTextRef = useRef<any | null>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const lastMessageRef = useRef<HTMLDivElement>(null);
    const prevTriggerRef = useRef('');
    // Handle chat changes - join/leave rooms and mark as read
    useEffect(() => {
        if (selectedChatId && selectedChatId !== prevChatIdRef.current) {
            // Leave previous chat room if any
            if (
                prevChatIdRef.current &&
                prevChatIdRef.current !== selectedChatId
            ) {
                leaveChatRoom(prevChatIdRef.current);
            }

            // Join new chat room
            joinChatRoom(selectedChatId as string);

            // Reset page and scroll state
            setCurrentPage(1);
            setFetchedMore(false);
            setInitalLoaded(false);

            // Mark chat as read
            if (selectedChatId) {
                markChatAsRead(selectedChatId as string).catch((err) =>
                    console.error(
                        `Error marking chat ${selectedChatId} as read:`,
                        err,
                    ),
                );
                dispatch(markRead({ chatId: selectedChatId as string }));
            }

            // Update ref
            prevChatIdRef.current = selectedChatId as string;
        }
    }, [selectedChatId, dispatch, markChatAsRead]);

    // Update reference index for message rendering
    useEffect(() => {
        setInitalLoaded(false);
        setRefIndex(
            messages?.length > 15 && fetchedMore ? 15 : messages?.length - 1,
        );
        setInitalLoaded(true);
    }, [messages, fetchedMore]);

    // Reset initial loaded state when changing chats
    useEffect(() => {
        setInitalLoaded(false);
    }, [selectedChatId]);

    // Update chat info when chats change
    console.log({ selectedChatId });
    console.log({ chats });
    useEffect(() => {
        if (chats && selectedChatId) {
            const findChat = chats?.find(
                (chat: any) => chat?._id === selectedChatId,
            );
            if (findChat) {
                setChat(findChat);
                setChatInfo(findChat);
            }
        }
    }, [chats, selectedChatId, setChatInfo]);

    // Handle AI bot message clearing
    useEffect(() => {
        if (chat?.otherUser?._id === process.env.NEXT_PUBLIC_AI_BOT_ID) {
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
    }, [messages, chat]);

    // Function to load more messages
    const fetchMore = (page: number) => {
        loadMoreMessages();
        setFetchedMore(true);
    };

    // Handle message sending callback
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
            } else {
                // For regular messages, scroll to bottom after sending
                setTimeout(() => {
                    if (lastMessageRef.current) {
                        lastMessageRef.current.scrollIntoView({
                            behavior: 'smooth',
                            block: 'end',
                        });
                    }
                }, 100);

                // Trigger a refetch to get the latest messages
                refetchMessages();
            }
        }
    };

    // Optimized scroll handling
    const handleScroll = useCallback(() => {
        const div = chatContainerRef.current;
        if (div) {
            // If we're near the top and have more messages to load
            if (
                div.scrollTop < 100 &&
                !isFetching &&
                currentPage * 15 < count &&
                initialLoaded
            ) {
                fetchMore(currentPage);
            }

            // If typing indicator is active and we're scrolled away, scroll into view
            if (
                isTyping &&
                div.scrollHeight - div.scrollTop - div.clientHeight > 100
            ) {
                div.scrollTop = div.scrollHeight;
            }
        }
    }, [currentPage, count, initialLoaded, isFetching, isTyping]);

    // Auto-scroll handling for new messages
    useEffect(() => {
        if (messages?.length > 0 && lastMessageRef.current) {
            const lastMessage = messages[messages.length - 1];
            const shouldScroll =
                lastMessage?.sender?._id === userId ||
                !initialLoaded ||
                lastMessage?.sender?._id ===
                    process.env.NEXT_PUBLIC_AI_BOT_ID ||
                (chatContainerRef.current &&
                    chatContainerRef.current.scrollHeight -
                        chatContainerRef.current.scrollTop -
                        chatContainerRef.current.clientHeight <
                        100);

            if (shouldScroll) {
                lastMessageRef.current.scrollIntoView({
                    behavior: initialLoaded ? 'smooth' : 'instant',
                    block: 'end',
                    inline: 'nearest',
                });

                // Trigger reload for parent component
                const messageKey = lastMessage?._id || 'empty';
                const triggerKey = `${messageKey}-${reload}`;
                if (prevTriggerRef.current !== triggerKey) {
                    prevTriggerRef.current = triggerKey;
                    setReloading(!reloading);
                }
            }
        }
    }, [messages, initialLoaded, userId, reload, setReloading, reloading]);

    // Get the draft from hook
    const draft = getDraft(selectedChatId as string);

    // Render typing indicator component
    const renderTypingIndicator = () => {
        if (isTyping) {
            return (
                <div className='flex items-center gap-2 p-2 ml-3 mb-1'>
                    <div className='typing-indicator'>
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                    <span className='text-sm text-muted-foreground'>
                        Typing...
                    </span>
                </div>
            );
        }
        return null;
    };
    console.log('Render conditions:', {
        editMessageExists: !!editMessage,
        chatExists: !!chat,
        editMessageValue: editMessage,
    });
    return (
        <>
            <div className='scrollbar-container h-[calc(100%-77px)] pl-2'>
                <div
                    className='h-full overflow-y-auto'
                    id='chat-body-id'
                    onScroll={handleScroll}
                    ref={chatContainerRef}
                >
                    {isLoading || isMessagesLoading ? (
                        <div className='h-full w-full flex justify-center items-center'>
                            <Loader2 className='h-14 w-14 text-primary animate-spin' />
                        </div>
                    ) : (
                        <div>
                            {!isLoading && currentPage * 20 < count ? (
                                <div className='flex flex-row items-center gap-1 my-2'>
                                    <div className='w-full h-[2px] bg-border rounded-xl'></div>
                                    <div className='text-center'>
                                        <Button
                                            disabled={isFetching}
                                            className='bg-primary-light rounded-full font-normal text-xs h-6 text-primary'
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
                                    <div className='w-full h-[2px] bg-border rounded-xl'></div>
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
                            {isLoading || isMessagesLoading ? (
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
                                                            index ===
                                                            messages.length - 1
                                                                ? lastMessageRef
                                                                : isLastMessage &&
                                                                    refIndex !==
                                                                        0
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

                            {/* Display typing indicator */}
                            {renderTypingIndicator()}

                            {/* AI message streaming */}
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
                    sendTypingIndicator={sendTypingIndicator}
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

            {editMessage && chat && (
                <EditMessageModal
                    chat={chat}
                    selectedMessage={editMessage}
                    handleCloseEdit={() => setEditMessage(null)}
                />
            )}
        </>
    );
};

// Add CSS for the typing indicator
const typingIndicatorCss = `
.typing-indicator {
  display: flex;
  align-items: center;
}

.typing-indicator span {
  height: 8px;
  width: 8px;
  background: #3B82F6;
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
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-5px);
  }
}
`;

export default PopUpChatBody;
