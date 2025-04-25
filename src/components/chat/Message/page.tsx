'use client';

import type React from 'react';
import { useState, forwardRef, useEffect } from 'react';
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
import MessagePreview from '../../lexicalEditor/renderer/MessagePreview';
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
import MessageRenderer from '@/components/lexicalEditor/renderer/MessageRenderer';
import ImageSlider from '../ImageSlider';
import MediaSlider from '../MediaSlider';
import { set } from 'lodash';

const emojies = ['👍', '😍', '❤', '😂', '🥰', '😯'];

type MessageComponent = React.ForwardRefExoticComponent<
    React.RefAttributes<HTMLDivElement>
>;

const Message = forwardRef<HTMLDivElement, Message>((props, ref) => {
    const { chats } = useAppSelector((state) => state.chat);
    const params = useParams();
    const pinnedMessages = useAppSelector(
        (state) =>
            state.chat.pinnedMessages?.[String(params?.chatid) || ''] || [],
    ) as Message['message'][];
    const { user } = useAppSelector((state) => state.auth);
    const [deleteMessage, setDeleteMessage] = useState<any>(null);
    const [chatDelOpened, setChatDelOpened] = useState(false);
    const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
    // Add these new state variables at the beginning of the Message component:
    const [initialReplies, setInitialReplies] = useState([]);
    const [loadingReplies, setLoadingReplies] = useState(false);
    // Inside your component function, add these state variables
    const [imagePreviewOpen, setImagePreviewOpen] = useState(false);
    const [initialImageIndex, setInitialImageIndex] = useState(0);
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
        isPopUp,
        isThread = false,
    } = props;

    const [creating, setCreating] = useState(false);
    const [fileType, setFileType] = useState(message?.files?.[0]?.type);
    const [isReplyDeleted, setIsReplyDeleted] = useState(false);
    const router = useRouter();
    const dispatch = useDispatch();

    const handleDeleteMessage = (msg: any) => {
        if (msg?.pinnedBy) {
            toast.info(
                'This message is pinned. Would you like to unpin it before deleting?',
                {
                    action: {
                        label: 'Unpin',
                        onClick: () => handlePin(msg),
                    },
                    duration: 5000,
                },
            );
        } else {
            setDeleteMessage(msg);
            setChatDelOpened(true);
            console.log({ msg });
        }
    };
    // Add this useEffect to fetch initial replies when the message loads
    useEffect(() => {
        // Only fetch if the message has replies and we're not in the thread view
        if (message?.replyCount > 0 && source !== 'thread') {
            setLoadingReplies(true);
            setIsReplyDeleted(false);
            instance
                .post(`/chat/messages`, {
                    page: 1,
                    limit: 1,
                    parentMessage: message._id,
                    chat: message.chat,
                })
                .then((res) => {
                    setInitialReplies(res.data.messages);
                    setLoadingReplies(false);
                })
                .catch((err) => {
                    setLoadingReplies(false);
                    console.error('Failed to fetch initial replies', err);
                });
        }
    }, [message?._id, message?.replyCount, source, isReplyDeleted]);

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
        if (id === user?._id) {
            router.push('/profile');
        } else {
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
        }
    };

    // handle reaction
    const handleReaction = (
        emoji: string,
        messageId: string,
        chatId: string,
    ) => {
        instance
            .put(`/chat/react/${messageId}`, {
                symbol: emoji,
            })
            .then((res) => {
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
                console.error(
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

            // If the message status is "sending", update it to "sent"
            if (message.status === 'sending') {
                // Update the message status in the local state
                instance
                    .put(`/chat/message/${message._id}`, {
                        status: 'sent',
                    })
                    .then((res) => {
                        // Dispatch action to update message in Redux store
                        dispatch(
                            updateMessage({
                                message: {
                                    ...message,
                                    status: 'sent',
                                },
                            }),
                        );
                    })
                    .catch((err) => {
                        console.error('Failed to update message status', err);
                    });
            }
        }
    };

    const handlePin = (message: any) => {
        const isPinned = Boolean(message.pinnedBy);
        const endpoint = `/chat/pin/${message._id}`; // Same endpoint for both pin/unpin

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

                        // Update the message in Redux to reflect pinnedBy status
                        dispatch(
                            updateMessage({
                                message: {
                                    ...message,
                                    _id: message._id,
                                    chat: message.chat,
                                    pinnedBy: null, // Set pinnedBy to null when unpinning
                                },
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

                        // Update the message in Redux to reflect pinnedBy status
                        dispatch(
                            updateMessage({
                                message: {
                                    ...message,
                                    _id: message._id,
                                    chat: message.chat,
                                    pinnedBy: res.data.message.pinnedBy, // Set pinnedBy when pinning
                                },
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
    const forwardedBy = message?.forwardedFrom;
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
                    <div
                        className={`flex max-w-full ${!isPopUp && 'lg:max-w-[80%]'}`}
                    >
                        <div className='flex-shrink-0 mr-2'>
                            {forwardedBy ? (
                                <div
                                    className='cursor-pointer'
                                    onClick={() =>
                                        handleOpenNewChat(
                                            forwardedBy?._id || '',
                                        )
                                    }
                                >
                                    <Image
                                        src={
                                            message.sender?.type === 'bot'
                                                ? '/ai_bot.png'
                                                : forwardedBy?.profilePicture ||
                                                  '/avatar.png'
                                        }
                                        alt={
                                            forwardedBy?.firstName ||
                                            'User images'
                                        }
                                        width={30}
                                        height={30}
                                        className='rounded-full h-8 w-8 object-cover'
                                    />
                                </div>
                            ) : (
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
                                                ? '/ai_bot.png'
                                                : message?.sender
                                                      ?.profilePicture ||
                                                  '/avatar.png'
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
                            )}
                        </div>
                        <div className='flex flex-col w-full'>
                            <div className='flex flex-col w-full'>
                                <div
                                    className={`rounded-lg p-2 ${
                                        !hideAlign &&
                                        !isThread &&
                                        message?.sender?._id === user?._id
                                            ? 'bg-primary text-pure-white'
                                            : 'bg-primary-light border border-blue-600/20'
                                    }`}
                                >
                                    <div className='flex flex-col'>
                                        <span
                                            // onClick={() =>
                                            //     handleOpenNewChat(
                                            //         message?.sender?._id || '',
                                            //     )
                                            // }
                                            className='font-medium text-sm cursor-pointer mb-1 w-full flex flex-row gap-1 items-center'
                                        >
                                            <p className='truncate'>
                                                {forwardedBy
                                                    ? forwardedBy?.fullName ||
                                                      'Bootcamps Hub user'
                                                    : message.sender
                                                          ?.fullName ||
                                                      'Bootcamps Hub user'}{' '}
                                            </p>
                                            <span
                                                className={`text-xs ml-2 front-normal text-nowrap ${!hideAlign && !isThread && message?.sender?._id === user?._id ? 'text-pure-white/80' : 'text-gray'}`}
                                            >
                                                {dayjs(
                                                    message?.createdAt,
                                                ).format('hh:mm A')}
                                            </span>
                                        </span>

                                        {(message?.files ?? []).length > 0 &&
                                            message?.type !== 'delete' && (
                                                <>
                                                    <div
                                                        className={`grid xl:max-w-[500px] ${message?.files.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} gap-2 mb-2`}
                                                    >
                                                        {message?.files
                                                            ?.slice(
                                                                0,
                                                                Math.min(
                                                                    message
                                                                        ?.files
                                                                        .length,
                                                                    4,
                                                                ),
                                                            )
                                                            .map(
                                                                (
                                                                    file: {
                                                                        type: string;
                                                                    },
                                                                    i: number,
                                                                ) => (
                                                                    <div
                                                                        key={i}
                                                                        className={`relative  ${i === 3 && message?.files.length > 4 ? 'group cursor-pointer' : ''}`}
                                                                        onClick={() => {
                                                                            // For images, open the slider
                                                                            if (
                                                                                file.type?.startsWith(
                                                                                    'image/',
                                                                                )
                                                                            ) {
                                                                                setInitialImageIndex(
                                                                                    i,
                                                                                );
                                                                                setImagePreviewOpen(
                                                                                    true,
                                                                                );
                                                                            }
                                                                        }}
                                                                    >
                                                                        <div
                                                                            className={`w-full ${isPopUp ? (file?.type.startsWith('audio') ? 'h-full' : 'h-[100px]') : file?.type.startsWith('audio') ? 'h-full' : 'h-[150px] xl:h-[200px]'}  flex items-center justify-center`}
                                                                        >
                                                                            <FileCard
                                                                                isPopUp={
                                                                                    isPopUp
                                                                                }
                                                                                file={
                                                                                    file
                                                                                }
                                                                            />
                                                                        </div>

                                                                        {/* Overlay for showing remaining images count */}
                                                                        {i ===
                                                                            3 &&
                                                                            message
                                                                                ?.files
                                                                                .length >
                                                                                4 && (
                                                                                <div
                                                                                    className='absolute inset-0 bg-pure-black/70 flex items-center justify-center rounded-md'
                                                                                    onClick={(
                                                                                        e,
                                                                                    ) => {
                                                                                        e.stopPropagation();
                                                                                        setInitialImageIndex(
                                                                                            i,
                                                                                        );
                                                                                        setImagePreviewOpen(
                                                                                            true,
                                                                                        );
                                                                                    }}
                                                                                >
                                                                                    <span className='text-white text-xl font-medium'>
                                                                                        +
                                                                                        {message
                                                                                            ?.files
                                                                                            .length -
                                                                                            4}{' '}
                                                                                        more
                                                                                    </span>
                                                                                </div>
                                                                            )}
                                                                    </div>
                                                                ),
                                                            )}
                                                    </div>

                                                    {/* Image Slider for preview */}
                                                    <MediaSlider
                                                        isOpen={
                                                            imagePreviewOpen
                                                        }
                                                        onClose={() =>
                                                            setImagePreviewOpen(
                                                                false,
                                                            )
                                                        }
                                                        files={
                                                            message?.files || []
                                                        }
                                                        initialIndex={
                                                            initialImageIndex
                                                        }
                                                    />
                                                </>
                                            )}

                                        {message?.type === 'delete' ? (
                                            <p
                                                className={`text-xs italic ${!hideAlign && message?.sender?._id === user?._id ? 'text-red-400' : 'text-red-500'}`}
                                            >
                                                This message has been deleted
                                            </p>
                                        ) : (
                                            <MessageRenderer
                                                searchQuery={searchQuery}
                                                text={message?.text || ''}
                                                isUser={
                                                    message?.sender?._id ===
                                                        user?._id && true
                                                }
                                            />
                                        )}

                                        <div
                                            className={`flex justify-between items-center mt-2 text-xs ${isThread && 'text-dark-gray'}`}
                                        >
                                            {message?.type !== 'delete' && (
                                                <div
                                                    className={`flex items-center gap-1 ${
                                                        isThread
                                                            ? 'text-dark-gray'
                                                            : 'text-pure-white/80'
                                                    }`}
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
                                                            user?._id &&
                                                        !isThread
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
                                    !isThread &&
                                    message?.replyCount
                                        ? message?.replyCount > 0 &&
                                          !hideReplyCount && (
                                              <div
                                                  className='flex items-center gap-1 p-0 h-auto text-xs cursor-pointer'
                                                  onClick={handleThreadMessage}
                                              >
                                                  <span className='text-primary-white flex flex-row items-center gap-1'>
                                                      Replies{' '}
                                                      {message?.replyCount}{' '}
                                                  </span>
                                                  <ChevronDown className='h-3 w-3 text-gray' />
                                              </div>
                                          )
                                        : !isThread &&
                                          message?.type !== 'delete' && (
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
                                                {Object.keys(
                                                    message.reactions,
                                                ).map((e, i) => (
                                                    <span
                                                        key={i}
                                                        className={`flex items-center justify-center px-1.5 py-0.5 rounded-full text-xs bg-secondary border ${
                                                            e === '❤'
                                                                ? 'text-red-500'
                                                                : ''
                                                        }`}
                                                    >
                                                        {e}
                                                        <span className='text-primary-white'>
                                                            {message
                                                                .reactions?.[
                                                                e
                                                            ] ?? ''}
                                                        </span>
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                    {/* Smile-Plus Icon */}
                                    {message?.type !== 'delete' && (
                                        <div
                                            className='h-7 w-7 flex items-center justify-center p-1 rounded-full bg-secondary border cursor-pointer'
                                            onClick={() =>
                                                setIsEmojiPickerOpen(
                                                    !isEmojiPickerOpen,
                                                )
                                            }
                                        >
                                            <SmilePlus className='h-4 w-4' />
                                        </div>
                                    )}

                                    {/* Emoji List */}
                                    {isEmojiPickerOpen && (
                                        <div className='flex flex-row items-center gap-1 mt-1 absolute -top-10 left-2 bg-primary-light shadow-md rounded-full p-1'>
                                            {emojies?.map((x, i) => {
                                                // Assume reactions[emoji] is a count; check if user reacted via server or state
                                                const isSelected =
                                                    message?.reactions?.[x] &&
                                                    message?.reactions[x] > 0; // Adjust based on actual logic
                                                return (
                                                    <div
                                                        key={i}
                                                        className={`h-8 w-8 flex items-center justify-center cursor-pointer hover:bg-white duration-200 rounded-full p-1 ${x === '❤' ? 'text-red-500' : ''} ${isSelected ? 'bg-white' : ''}`}
                                                        onClick={() => {
                                                            handleReaction(
                                                                x,
                                                                message._id,
                                                                message.chat,
                                                            );
                                                            setIsEmojiPickerOpen(
                                                                false,
                                                            );
                                                        }}
                                                    >
                                                        {x}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                            {/* replies tree ------------------------ */}
                            {message?.type !== 'delete' &&
                                message?.replyCount > 0 &&
                                !isThread &&
                                initialReplies.length > 0 &&
                                source !== 'thread' && (
                                    <div className=''>
                                        {initialReplies.map(
                                            (reply: any, index) => (
                                                <div
                                                    key={reply._id}
                                                    className='cursor-pointer my-1' /* Increased margin for gap between replies */
                                                    onClick={
                                                        handleThreadMessage
                                                    }
                                                >
                                                    <div className='flex items-start gap-2'>
                                                        <Image
                                                            src={
                                                                reply.sender
                                                                    ?.type ===
                                                                'bot'
                                                                    ? '/chat/bot.png'
                                                                    : reply
                                                                          ?.sender
                                                                          ?.profilePicture ||
                                                                      '/chat/user.png'
                                                            }
                                                            alt={
                                                                reply?.sender
                                                                    ?.firstName ||
                                                                'User'
                                                            }
                                                            width={20}
                                                            height={20}
                                                            className='rounded-full h-5 w-5 object-cover mt-1'
                                                        />
                                                        <div className='flex-1 flex flex-col'>
                                                            <div
                                                                className={`rounded-lg p-2 ${
                                                                    reply
                                                                        ?.sender
                                                                        ?._id ===
                                                                    user?._id
                                                                        ? 'bg-primary text-primary-light'
                                                                        : 'bg-primary-light border border-blue-600/20'
                                                                }`}
                                                            >
                                                                <div className='flex items-center gap-1 mb-1'>
                                                                    <span
                                                                        className={`font-medium text-xs ${
                                                                            reply
                                                                                ?.sender
                                                                                ?._id ===
                                                                            user?._id
                                                                                ? 'text-pure-white'
                                                                                : ''
                                                                        }`}
                                                                    >
                                                                        {reply
                                                                            .sender
                                                                            ?.fullName ||
                                                                            'Bootcamps Hub user'}
                                                                    </span>
                                                                    <span
                                                                        className={`text-xs ${
                                                                            reply
                                                                                ?.sender
                                                                                ?._id ===
                                                                            user?._id
                                                                                ? 'text-pure-white/80'
                                                                                : 'text-gray'
                                                                        }`}
                                                                    >
                                                                        {dayjs(
                                                                            reply?.createdAt,
                                                                        ).format(
                                                                            'hh:mm A',
                                                                        )}
                                                                    </span>
                                                                </div>

                                                                {/* Display files if any */}
                                                                {(
                                                                    reply?.files ??
                                                                    []
                                                                ).length > 0 &&
                                                                    reply?.type !==
                                                                        'delete' && (
                                                                        <div className='flex flex-wrap gap-2 mb-2 max-w-[180px] md:max-w-[200px]'>
                                                                            {reply?.files?.map(
                                                                                (
                                                                                    file: any,
                                                                                    i: number,
                                                                                ) => (
                                                                                    <FileCard
                                                                                        file={
                                                                                            file
                                                                                        }
                                                                                        key={
                                                                                            i
                                                                                        }
                                                                                    />
                                                                                ),
                                                                            )}
                                                                        </div>
                                                                    )}

                                                                {/* Display message content */}
                                                                {reply?.type ===
                                                                'delete' ? (
                                                                    <p
                                                                        className={`text-xs italic ${
                                                                            reply
                                                                                ?.sender
                                                                                ?._id ===
                                                                            user?._id
                                                                                ? 'text-pure-white/80'
                                                                                : 'text-dark-gray'
                                                                        }`}
                                                                    >
                                                                        This
                                                                        message
                                                                        has been
                                                                        deleted
                                                                    </p>
                                                                ) : (
                                                                    <div
                                                                        className={`text-xs ${
                                                                            reply
                                                                                ?.sender
                                                                                ?._id ===
                                                                            user?._id
                                                                                ? 'text-pure-white'
                                                                                : ''
                                                                        }`}
                                                                    >
                                                                        <MessageRenderer
                                                                            searchQuery={
                                                                                searchQuery
                                                                            }
                                                                            text={
                                                                                reply?.text ||
                                                                                ''
                                                                            }
                                                                            isUser={
                                                                                reply
                                                                                    ?.sender
                                                                                    ?._id ===
                                                                                    user?._id &&
                                                                                true
                                                                            }
                                                                        />
                                                                    </div>
                                                                )}

                                                                {/* Show edited status if applicable */}
                                                                {reply?.type !==
                                                                    'delete' &&
                                                                    reply?.editedAt && (
                                                                        <span className='text-xs italic text-primary-white'>
                                                                            (Edited)
                                                                        </span>
                                                                    )}
                                                            </div>

                                                            {/* Show emoji picker and reactions below the reply message */}
                                                            <div className='flex items-center gap-1 mt-1 ml-1'>
                                                                {/* Existing reactions */}
                                                                {reply?.reactions &&
                                                                    Object.keys(
                                                                        reply?.reactions,
                                                                    ).length >
                                                                        0 && (
                                                                        <div className='flex gap-1'>
                                                                            {Object.keys(
                                                                                reply.reactions,
                                                                            ).map(
                                                                                (
                                                                                    e,
                                                                                    i,
                                                                                ) => (
                                                                                    <span
                                                                                        key={
                                                                                            i
                                                                                        }
                                                                                        className={`flex items-center justify-center px-1 py-0.5 rounded-full text-xs bg-secondary border ${
                                                                                            e ===
                                                                                            '❤'
                                                                                                ? 'text-red-500'
                                                                                                : ''
                                                                                        }`}
                                                                                    >
                                                                                        {
                                                                                            e
                                                                                        }
                                                                                        <span className='text-primary-white text-xs ml-0.5'>
                                                                                            {reply
                                                                                                .reactions?.[
                                                                                                e
                                                                                            ] ??
                                                                                                ''}
                                                                                        </span>
                                                                                    </span>
                                                                                ),
                                                                            )}
                                                                        </div>
                                                                    )}

                                                                {/* Smile-Plus Icon (smaller for replies) */}
                                                                {/* <div
                                                                className='h-5 w-5 flex items-center justify-center p-1 rounded-full bg-secondary border cursor-pointer'
                                                                onClick={(
                                                                    e,
                                                                ) => {
                                                                    e.stopPropagation(); // Prevent opening thread when clicking emoji
                                                                    // We would handle emoji picker here in a real implementation
                                                                    handleReaction(
                                                                        '👍',
                                                                        reply._id,
                                                                        reply.chat,
                                                                    );
                                                                }}
                                                            >
                                                                <SmilePlus className='h-3 w-3' />
                                                            </div> */}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ),
                                        )}

                                        {/* See more button if there are more replies than we're showing */}
                                        {message?.replyCount >
                                            initialReplies.length && (
                                            <div
                                                className='flex justify-center cursor-pointer text-primary-white text-xs hover:bg-primary-light/50 rounded-lg w-fit'
                                                onClick={handleThreadMessage}
                                            >
                                                See{' '}
                                                {message?.replyCount -
                                                    initialReplies.length}{' '}
                                                more{' '}
                                                {message?.replyCount -
                                                    initialReplies.length ===
                                                1
                                                    ? 'reply'
                                                    : 'replies'}
                                            </div>
                                        )}
                                    </div>
                                )}
                            {/* -------------- X replies tree ------------------------ */}
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
                                        className='bg-background'
                                    >
                                        <div className='flex flex-wrap gap-1 border-b pb-1'>
                                            {emojies?.map((x, i) => {
                                                // Assume reactions[emoji] is a count; check if user reacted via server or state
                                                const isSelected =
                                                    message?.reactions?.[x] &&
                                                    message?.reactions[x] > 0; // Adjust based on actual logic
                                                return (
                                                    <div
                                                        key={i}
                                                        className={`cursor-pointer h-8 w-8 flex items-center justify-center hover:bg-foreground hover:border rounded-full ${x === '❤' ? 'text-red-500' : ''} ${isSelected ? 'bg-foreground border' : ''}`}
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
                                                );
                                            })}
                                        </div>
                                        {source !== 'thread' && !isAi && (
                                            <DropdownMenuItem
                                                className='cursor-pointer flex items-center gap-2 hover:!bg-foreground hover:text-primary-white'
                                                onClick={handleThreadMessage}
                                            >
                                                <Reply className='h-4 w-4' />
                                                Reply
                                            </DropdownMenuItem>
                                        )}
                                        {!hideAlign &&
                                            message?.sender?._id ===
                                                user?._id &&
                                            (message?.text ||
                                                (message?.files?.length > 0 &&
                                                    !(
                                                        message?.files
                                                            ?.length === 1 &&
                                                        message?.files[0]?.type?.startsWith(
                                                            'audio/',
                                                        )
                                                    ))) && (
                                                <DropdownMenuItem
                                                    className='cursor-pointer flex items-center gap-2 hover:!bg-foreground hover:text-primary-white'
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
                                                className='cursor-pointer flex items-center gap-2 hover:!bg-foreground hover:text-primary-white'
                                                onClick={handleCopyClick}
                                            >
                                                <Copy className='h-4 w-4' />
                                                Copy
                                            </DropdownMenuItem>
                                        )}

                                        <DropdownMenuItem
                                            className='cursor-pointer flex items-center gap-2 hover:!bg-foreground hover:text-primary-white'
                                            onClick={() =>
                                                toast.info('Coming soon!')
                                            }
                                        >
                                            <Clock className='h-4 w-4' />
                                            History
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className='cursor-pointer flex items-center gap-2 hover:!bg-foreground hover:text-primary-white'
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
                                            className='cursor-pointer flex items-center gap-2 hover:!bg-foreground hover:text-primary-white'
                                            onClick={() =>
                                                toast.info('Coming soon!')
                                            }
                                        >
                                            <Star className='h-4 w-4' />
                                            Star
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className='cursor-pointer flex items-center gap-2 hover:!bg-foreground hover:text-primary-white'
                                            onClick={handleForward}
                                        >
                                            <Forward className='h-4 w-4' />
                                            Forward
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className='cursor-pointer flex items-center gap-2 hover:!bg-foreground hover:text-primary-white'
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
                                                    className='flex items-center gap-2 hover:!bg-foreground !text-red-500'
                                                    onClick={() =>
                                                        handleDeleteMessage(
                                                            message,
                                                        )
                                                    }
                                                >
                                                    <Trash className='h-4 w-4 !text-red-500' />
                                                    Delete
                                                </DropdownMenuItem>
                                            )}
                                        <DropdownMenuItem
                                            className='cursor-pointer flex items-center gap-2 hover:!bg-foreground hover:text-primary-white border-t'
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
                        onDelete={() => {
                            setIsReplyDeleted(true);
                        }}
                    />
                </DialogContent>
            </Dialog>
        </>
    );
});

Message.displayName = 'Message';

export default Message;
