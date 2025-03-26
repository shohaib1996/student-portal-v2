'use client';

import type React from 'react';
import { useState, forwardRef } from 'react';
import { useDispatch } from 'react-redux';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import dayjs from 'dayjs';
import { toast } from 'sonner';
import {
    Check,
    CheckCheck,
    Circle,
    MoreVertical,
    Copy,
    Pencil,
    Trash,
    SmilePlus,
    ChevronDown,
    Reply,
    Clock,
    Star,
    Forward,
    Info,
    Share2,
    Pin,
} from 'lucide-react';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import MessagePreview from './MessagePreview';
import { generateActivityText } from './helper';
import FileCard from '../FileCard';
import DeleteMessage from '../ChatForm/DeleteMessage';
import { copyTextToClipboard } from '../../../utils/clipboard';
import {
    addPinnedMessage,
    type Message,
    removePinnedMessage,
    updateChats,
    updateEmoji,
    updateMessage,
} from '@/redux/features/chatReducer';
import { useAppSelector } from '@/redux/hooks';
import { useGetChatsQuery } from '@/redux/api/chats/chatApi';
import { instance } from '@/lib/axios/axiosInstance';
import GlobalTooltip from '@/components/global/GlobalTooltip';
import { store } from '@/redux/store';

const emojies = ['👍', '😍', '❤', '😂', '🥰', '😯'];

type MessageComponent = React.ForwardRefExoticComponent<
    React.RefAttributes<HTMLDivElement>
>;

const Message = forwardRef<HTMLDivElement, Message>((props, ref) => {
    const { data: chats = [] } = useGetChatsQuery();
    const params = useParams();
    const pinnedMessages = useAppSelector(
        (state) =>
            state.chat.pinnedMessages?.[String(params?.chatid) || ''] || [],
    ) as Message['message'][];
    const { user } = useAppSelector((state) => state.auth);
    const [deleteMessage, setDeleteMessage] = useState<any>(null);
    const [chatDelOpened, setChatDelOpened] = useState(false);
    const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
    const {
        message,
        lastmessage,
        setEditMessage,
        setThreadMessage,
        setForwardMessage,
        hideOptions,
        hideReplyCount,
        source,
        hideAlign,
        reload,
        setReload,
        isAi,
        searchQuery,
    } = props;

    const [creating, setCreating] = useState(false);
    const [fileType, setFileType] = useState(message?.files?.[0]?.type);

    const router = useRouter();
    const dispatch = useDispatch();

    const handleDeleteMessage = (msg: any) => {
        setDeleteMessage(msg);
        setChatDelOpened(true);
    };

    const handleCopyClick = () => {
        if ((message?.files ?? []).length > 0) {
            // for files
            const allUrl = message?.files?.map((x: { url: string }) => x.url);
            const files = JSON.stringify(allUrl);

            copyTextToClipboard(files)
                .then(() => {
                    toast.success('Image copied!');
                })
                .catch((err: any) => {
                    toast.error('Could not copy message');
                });
        } else {
            // for text
            copyTextToClipboard(message.text || '')
                .then(() => {
                    toast.success('Message copied to clipboard succeed!');
                })
                .catch((err: any) => {
                    toast.error('Could not copy message');
                });
        }
    };

    // handle open new chat
    const handleOpenNewChat = (id: string) => {
        setCreating(true);
        instance
            .post(`/chat/findorcreate/${id}`)
            .then((res) => {
                const filtered = chats.filter(
                    (c: any) => c._id === res.data.chat._id,
                );

                if (filtered.length > 0) {
                    router.push(`/chat/${res.data.chat._id}`);
                } else {
                    dispatch(updateChats(res?.data?.chat));
                    router.push(`/chat/${res.data.chat._id}`);
                }
                setCreating(false);
            })
            .catch((err) => {
                setCreating(false);
                toast.error(
                    err?.response?.data?.error || 'Something went wrong',
                );
            });
    };

    // handle reaction
    const handleReaction = (
        emoji: string,
        messageId: string,
        chatId: string,
    ) => {
        console.log('chatId', JSON.stringify(chatId, null, 2));
        instance
            .put(`/chat/react/${messageId}`, {
                symbol: emoji,
            })
            .then((res) => {
                console.log('res.data', JSON.stringify(res.data, null, 2));
                dispatch(
                    updateEmoji({
                        message: {
                            ...res.data.message,
                            chat: chatId,
                        },
                    }),
                );
            })
            .catch((error) => {
                console.log(
                    'error.response.data',
                    JSON.stringify(error, null, 2),
                );
                toast.error('Something went wrong');
            });
    };

    function formatDate(date: string | number | undefined) {
        if (!date) {
            return 'N/A';
        }

        const today = dayjs().startOf('day');
        const yesterday = dayjs().subtract(1, 'days').startOf('day');

        if (dayjs(date).isSame(today, 'day')) {
            return dayjs(date).format('h:mm A');
        } else if (dayjs(date).isSame(yesterday, 'day')) {
            return `${dayjs(date).format('MMM DD, YYYY')} at ${dayjs(date).format('hh:mm A')} (Yesterday)`;
        } else if (date) {
            return `${dayjs(date).format('MMM DD, YYYY')} at ${dayjs(date).format('hh:mm A')}`;
        } else {
            return 'N/A';
        }
    }

    // Safe function to handle thread message
    const handleThreadMessage = () => {
        if (setThreadMessage) {
            setThreadMessage(message);
        }
    };

    const handlePin = (message: any) => {
        const isPinned = Boolean(message.pinnedBy);
        const endpoint = isPinned
            ? `/chat/pin/${message._id}`
            : `/chat/pin/${message._id}`;

        instance
            .patch(endpoint)
            .then((res) => {
                if (res.data.message) {
                    if (isPinned) {
                        dispatch(
                            removePinnedMessage({
                                chatId: String(params?.chatid) || '',
                                messageId: message._id,
                            }),
                        );
                        toast.success('Message unpinned successfully!');
                    } else {
                        dispatch(
                            addPinnedMessage({
                                chatId: (params?.chatid as string) || '',
                                message: res.data.message,
                            }),
                        );
                        toast.success('Message pinned successfully!');
                    }
                }
            })
            .catch((err) => {
                toast.error('Failed to pin/unpin message');
            });
    };

    const handleForward = () => {
        if (setForwardMessage) {
            setForwardMessage(message);
        } else {
            toast.info('Coming soon!');
        }
    };

    return (
        <>
            {message?.type === 'activity' ? (
                <div
                    ref={lastmessage ? ref : null}
                    className='py-2 px-4 text-center text-sm text-muted-foreground'
                    id={`message-${message._id}`}
                >
                    <p>{generateActivityText(message)}</p>
                </div>
            ) : (
                <div
                    ref={lastmessage ? ref : null}
                    className={`flex mb-4 `}
                    style={{ scrollBehavior: 'smooth' }}
                >
                    <div className='flex max-w-[80%]'>
                        <div className='flex-shrink-0 mr-2'>
                            <div
                                className='cursor-pointer'
                                onClick={() =>
                                    handleOpenNewChat(
                                        message?.sender?._id || '',
                                    )
                                }
                            >
                                <Image
                                    src={
                                        message.sender?.type === 'bot'
                                            ? '/chat/bot.png'
                                            : message?.sender?.profilePicture ||
                                              '/chat/user.png'
                                    }
                                    alt={
                                        message?.sender?.firstName ||
                                        'User images'
                                    }
                                    width={30}
                                    height={30}
                                    className='rounded-full h-8 w-8 object-cover'
                                />
                            </div>
                        </div>
                        <div className='flex flex-col w-full'>
                            <div
                                className={`rounded-lg p-2 ${
                                    !hideAlign &&
                                    message?.sender?._id === user?._id
                                        ? 'bg-primary text-primary-light'
                                        : 'bg-primary-light border border-blue-600/20'
                                }`}
                            >
                                <div className='flex flex-col'>
                                    <span
                                        onClick={() =>
                                            handleOpenNewChat(
                                                message?.sender?._id || '',
                                            )
                                        }
                                        className='font-medium text-sm cursor-pointer mb-1 w-full flex flex-row gap-1 items-center'
                                    >
                                        <p className='truncate'>
                                            {message.sender?.fullName ||
                                                'Bootcamps Hub user'}{' '}
                                        </p>
                                        <span
                                            className={`text-xs ml-2 front-normal text-nowrap ${!hideAlign && message?.sender?._id === user?._id ? 'text-pure-white/80' : 'text-gray'}`}
                                        >
                                            {dayjs(message?.createdAt).format(
                                                'hh:mm A',
                                            )}
                                        </span>
                                    </span>

                                    {(message?.files ?? []).length > 0 &&
                                        message?.type !== 'delete' && (
                                            <div className='flex flex-wrap gap-2 mb-2'>
                                                {message?.files?.map(
                                                    (file: File, i: number) => (
                                                        <FileCard
                                                            file={file}
                                                            key={i}
                                                        />
                                                    ),
                                                )}
                                            </div>
                                        )}

                                    {message?.type === 'delete' ? (
                                        <p
                                            className={`text-xs italic ${!hideAlign && message?.sender?._id === user?._id ? 'text-pure-white/80' : 'text-gray'}`}
                                        >
                                            This message has been deleted
                                        </p>
                                    ) : (
                                        <MessagePreview
                                            searchQuery={searchQuery}
                                            text={message?.text || ''}
                                        />
                                    )}

                                    <div className='flex justify-between items-center mt-2 text-xs'>
                                        {message?.type !== 'delete' && (
                                            <div
                                                className={`flex items-center gap-1 text-pure-white/80`}
                                            >
                                                {message?.sender?._id ===
                                                    user?._id && (
                                                    <>
                                                        {message?.status ===
                                                        'seen' ? (
                                                            <>
                                                                <CheckCheck className='h-3 w-3 ' />
                                                                <span className=''>
                                                                    {
                                                                        message?.status
                                                                    }
                                                                </span>
                                                            </>
                                                        ) : message?.status ===
                                                          'sent' ? (
                                                            <>
                                                                <Check className='h-3 w-3 ' />
                                                                <span className=''>
                                                                    {
                                                                        message?.status
                                                                    }
                                                                </span>
                                                            </>
                                                        ) : message?.status ===
                                                          'delivered' ? (
                                                            <>
                                                                <CheckCheck className='h-3 w-3 ' />
                                                                <span className=''>
                                                                    {
                                                                        message?.status
                                                                    }
                                                                </span>
                                                            </>
                                                        ) : message?.status ===
                                                          'sending' ? (
                                                            <>
                                                                <Circle className='h-3 w-3 ' />
                                                                <span className=''>
                                                                    {
                                                                        message?.status
                                                                    }
                                                                </span>
                                                            </>
                                                        ) : (
                                                            message?.status
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        )}
                                        {message?.forwardedFrom && (
                                            <p
                                                className={`ml-5 text-xs flex flex-row items-center ${
                                                    message?.sender?._id ===
                                                    user?._id
                                                        ? 'text-pure-white/80'
                                                        : 'text-gray'
                                                }`}
                                            >
                                                <Forward size={16} />
                                                Forwarded
                                            </p>
                                        )}
                                    </div>

                                    {message?.type !== 'delete' &&
                                        message?.editedAt && (
                                            <span className='text-xs italic text-primary'>
                                                (Edited)
                                            </span>
                                        )}
                                </div>
                            </div>

                            <div className='flex items-center gap-1 mt-1 relative'>
                                {message?.type !== 'delete' &&
                                message?.replyCount ? (
                                    message?.replyCount > 0 &&
                                    !hideReplyCount && (
                                        <div
                                            className='flex items-center gap-1 p-0 h-auto text-xs cursor-pointer'
                                            onClick={handleThreadMessage}
                                        >
                                            <span className='text-primary flex flex-row items-center gap-1'>
                                                Replies
                                                {message?.replyCount}{' '}
                                            </span>
                                            <ChevronDown className='h-3 w-3 text-gray' />
                                        </div>
                                    )
                                ) : (
                                    <div
                                        className='flex items-center gap-1 p-0 h-auto text-xs cursor-pointer mr-3'
                                        onClick={handleThreadMessage}
                                    >
                                        <span className='text-dark-gray'>
                                            Reply
                                        </span>
                                    </div>
                                )}
                                {/* Existing reactions */}
                                {message?.reactions &&
                                    Object.keys(message?.reactions).length >
                                        0 && (
                                        <div className='flex gap-1'>
                                            {Object.keys(message.reactions).map(
                                                (e, i) => (
                                                    <span
                                                        key={i}
                                                        className={`flex items-center justify-center px-1.5 py-0.5 rounded-full text-xs bg-secondary border ${
                                                            e === '❤'
                                                                ? 'text-red-500'
                                                                : ''
                                                        }`}
                                                    >
                                                        {e}
                                                        <span className='text-primary'>
                                                            {message
                                                                .reactions?.[
                                                                e
                                                            ] ?? ''}
                                                        </span>
                                                    </span>
                                                ),
                                            )}
                                        </div>
                                    )}

                                {/* Smile-Plus Icon */}
                                <div
                                    className='h-7 w-7 flex items-center justify-center p-1 rounded-full bg-secondary border cursor-pointer'
                                    onClick={() =>
                                        setIsEmojiPickerOpen(!isEmojiPickerOpen)
                                    }
                                >
                                    <SmilePlus className='h-4 w-4' />
                                </div>

                                {/* Emoji List */}
                                {isEmojiPickerOpen && (
                                    <div className='flex flex-row items-center gap-1 mt-1 absolute -top-10 left-2 bg-primary-light shadow-md rounded-full p-1'>
                                        {emojies?.map((x, i) => (
                                            <div
                                                key={i}
                                                className={`h-8 w-8 flex items-center justify-center cursor-pointer hover:bg-white duration-200 rounded-full p-1 ${x === '❤' ? 'text-red-500' : ''}`}
                                                onClick={() => {
                                                    handleReaction(
                                                        x,
                                                        message._id,
                                                        message.chat,
                                                    );
                                                    setIsEmojiPickerOpen(false); // Close the emoji list after selection
                                                }}
                                            >
                                                {x}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {!hideOptions && message?.type !== 'delete' && (
                            <div className='mt-2 self-start flex items-center'>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <div className='h-4 w-4 cursor-pointer'>
                                            <MoreVertical className='h-4 w-4 cursor-pointer' />
                                            <span className='sr-only'>
                                                Open menu
                                            </span>
                                        </div>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        align={
                                            !hideAlign &&
                                            message?.sender?._id === user?._id
                                                ? 'start'
                                                : 'end'
                                        }
                                    >
                                        <div className='flex flex-wrap gap-1 border-b pb-1'>
                                            {emojies?.map((x, i) => (
                                                <div
                                                    key={i}
                                                    className={`h-8 w-8 flex items-center justify-center hover:bg-primary-light hover:border rounded-full ${x === '❤' ? 'text-red-500' : ''}`}
                                                    onClick={() =>
                                                        handleReaction(
                                                            x,
                                                            message._id,
                                                            message.chat,
                                                        )
                                                    }
                                                >
                                                    {x}
                                                </div>
                                            ))}
                                        </div>
                                        {source !== 'thread' && !isAi && (
                                            <DropdownMenuItem
                                                className='flex items-center gap-2 hover:bg-primary-light hover:text-primary'
                                                onClick={handleThreadMessage}
                                            >
                                                <Reply className='h-4 w-4' />
                                                Reply
                                            </DropdownMenuItem>
                                        )}
                                        {!hideAlign &&
                                            message?.sender?._id ===
                                                user?._id && (
                                                <DropdownMenuItem
                                                    className='flex items-center gap-2 hover:bg-primary-light hover:text-primary'
                                                    onClick={() => {
                                                        if (setEditMessage) {
                                                            setEditMessage(
                                                                message,
                                                            );
                                                        }
                                                    }}
                                                >
                                                    <Pencil className='h-4 w-4' />
                                                    Edit
                                                </DropdownMenuItem>
                                            )}
                                        {message?.files?.length === 0 && (
                                            <DropdownMenuItem
                                                className='flex items-center gap-2 hover:bg-primary-light hover:text-primary'
                                                onClick={handleCopyClick}
                                            >
                                                <Copy className='h-4 w-4' />
                                                Copy
                                            </DropdownMenuItem>
                                        )}

                                        <DropdownMenuItem
                                            className='flex items-center gap-2 hover:bg-primary-light hover:text-primary'
                                            onClick={() =>
                                                toast.info('Coming soon!')
                                            }
                                        >
                                            <Clock className='h-4 w-4' />
                                            History
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className='flex items-center gap-2 hover:bg-primary-light hover:text-primary'
                                            onClick={() => {
                                                handlePin(message);
                                            }}
                                        >
                                            <Pin className='h-4 w-4 rotate-45' />
                                            {message.pinnedBy
                                                ? 'Unpin Message'
                                                : 'Pin Message'}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className='flex items-center gap-2 hover:bg-primary-light hover:text-primary'
                                            onClick={() =>
                                                toast.info('Coming soon!')
                                            }
                                        >
                                            <Star className='h-4 w-4' />
                                            Star
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className='flex items-center gap-2 hover:bg-primary-light hover:text-primary'
                                            onClick={handleForward}
                                        >
                                            <Forward className='h-4 w-4' />
                                            Forward
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className='flex items-center gap-2 hover:bg-primary-light hover:text-primary'
                                            onClick={() =>
                                                toast.info('Coming soon!')
                                            }
                                        >
                                            <Share2 className='h-4 w-4' />
                                            Share
                                        </DropdownMenuItem>

                                        {!hideAlign &&
                                            message?.sender?._id ===
                                                user?._id &&
                                            !isAi && (
                                                <DropdownMenuItem
                                                    className='flex items-center gap-2 hover:bg-primary-light text-destructive'
                                                    onClick={() =>
                                                        handleDeleteMessage(
                                                            message,
                                                        )
                                                    }
                                                >
                                                    <Trash className='h-4 w-4 !text-danger' />
                                                    Delete
                                                </DropdownMenuItem>
                                            )}
                                        <DropdownMenuItem
                                            className='flex items-center gap-2 hover:bg-primary-light hover:text-primary border-t'
                                            onClick={() =>
                                                toast.info('Coming soon!')
                                            }
                                        >
                                            <Info className='h-4 w-4' />
                                            Info
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                {message.pinnedBy && (
                                    <GlobalTooltip tooltip='Click to Unpin this message'>
                                        <Pin
                                            className='h-4 w-4 text-dark-gray rotate-45 cursor-pointer'
                                            onClick={() => {
                                                handlePin(message);
                                            }}
                                        />
                                    </GlobalTooltip>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            <Dialog open={chatDelOpened} onOpenChange={setChatDelOpened}>
                <DialogContent>
                    <DeleteMessage
                        selectedMessage={deleteMessage}
                        opened={chatDelOpened}
                        close={() => setChatDelOpened(false)}
                    />
                </DialogContent>
            </Dialog>
        </>
    );
});

Message.displayName = 'Message';

export default Message;
