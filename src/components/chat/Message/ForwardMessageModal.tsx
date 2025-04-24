'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, X, ArrowRight, Loader2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { instance } from '@/lib/axios/axiosInstance';
import { toast } from 'sonner';
import dayjs from 'dayjs';
import { useAppSelector } from '@/redux/hooks';
import { useDispatch } from 'react-redux';
import { updateLatestMessage, pushMessage } from '@/redux/features/chatReducer';
import { socket } from '@/helper/socketManager';
import GlobalDialog from '@/components/global/GlobalDialogModal/GlobalDialog';
import { renderPlainText } from '@/components/lexicalEditor/renderer/renderPlainText';

interface ForwardMessageModalProps {
    isOpen: boolean;
    onClose: () => void;
    message: any;
}

const ForwardMessageModal: React.FC<ForwardMessageModalProps> = ({
    isOpen,
    onClose,
    message,
}) => {
    const dispatch = useDispatch();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedChats, setSelectedChats] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);

    // Get chats from Redux store
    const { chats } = useAppSelector((state) => state.chat);
    const { user } = useAppSelector((state) => state.auth);
    const [filteredChats, setFilteredChats] = useState<any[]>([]);

    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            // Initialize filtered chats with all available chats
            setFilteredChats(chats);
            setLoading(false);
        }
    }, [isOpen, chats]);

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredChats(chats);
        } else {
            const filtered = chats.filter((chat) => {
                if (chat.isChannel) {
                    return chat.name
                        ?.toLowerCase()
                        .includes(searchQuery.toLowerCase());
                } else {
                    return chat.otherUser?.fullName
                        ?.toLowerCase()
                        .includes(searchQuery.toLowerCase());
                }
            });
            setFilteredChats(filtered);
        }
    }, [searchQuery, chats]);

    const handleSelectChat = (chat: any) => {
        if (selectedChats.some((c) => c._id === chat._id)) {
            setSelectedChats(selectedChats.filter((c) => c._id !== chat._id));
        } else {
            setSelectedChats([...selectedChats, chat]);
        }
    };

    const handleRemoveChat = (chatId: string) => {
        setSelectedChats(selectedChats.filter((chat) => chat._id !== chatId));
    };

    const handleForward = async () => {
        if (selectedChats.length === 0) {
            toast.error('Please select at least one chat');
            return;
        }

        setSending(true);
        try {
            const chatIds = selectedChats.map((chat) => chat._id);
            // Call the API to forward message
            const response = await instance.post(
                `/chat/message/forward/${message._id}`,
                {
                    chatIds,
                },
            );
            // Handle the forwarded messages
            if (response.data && response.data.success === true) {
                // Process each forwarded message through Redux

                // response.data.forwardedMessages.forEach(
                //     (forwardedMessage: any) => {
                //         // Update Redux store with the new message
                //         dispatch(
                //             pushMessage({
                //                 message: forwardedMessage,
                //             }),
                //         );

                //         // Update latest message in each chat
                //         dispatch(
                //             updateLatestMessage({
                //                 chatId: forwardedMessage.chat,
                //                 latestMessage: forwardedMessage,
                //             }),
                //         );

                //         // Join the chat room via socket if needed
                //         socket?.emit('join-chat-room', {
                //             chatId: forwardedMessage.chat,
                //         });
                //     },
                // );
                toast.success(
                    selectedChats.length > 1
                        ? `Message forwarded to ${selectedChats.length} chats`
                        : 'Message forwarded successfully',
                );
            }

            // toast.success(
            //     selectedChats.length > 1
            //         ? `Message forwarded to ${selectedChats.length} chats`
            //         : 'Message forwarded successfully',
            // );

            onClose();
        } catch (error) {
            console.error('Error forwarding message:', error);
            toast.error('Failed to forward message');
        } finally {
            setSending(false);
        }
    };

    const getLastActive = (chat: any) => {
        if (chat.isChannel) {
            return null;
        }

        if (!chat.otherUser?.lastActive) {
            return null;
        }

        const lastActive = dayjs(chat.otherUser.lastActive);
        const now = dayjs();

        if (now.diff(lastActive, 'minute') < 5) {
            return { text: 'Active Now', isActive: true };
        } else if (now.diff(lastActive, 'hour') < 1) {
            return { text: 'Active Now', isActive: true };
        } else if (now.diff(lastActive, 'hour') < 24) {
            return {
                text: `${now.diff(lastActive, 'hour')} hours ago`,
                isActive: false,
            };
        } else {
            return {
                text: `${now.diff(lastActive, 'day')} days ago`,
                isActive: false,
            };
        }
    };

    // Get online users from Redux store
    const { onlineUsers } = useAppSelector((state) => state.chat);

    // Check if a user is online
    const isUserOnline = (chat: any) => {
        if (chat.isChannel) {
            return false;
        }
        return onlineUsers.some((user) => user._id === chat.otherUser?._id);
    };

    const renderMessagePreview = () => {
        if (message?.files && message.files.length > 0) {
            return (
                <div
                    className={`flex ${message.files[0].type.startsWith('audio/') ? 'flex-col items-start' : 'flex-row items-center'} gap-1 p-2 bg-background rounded-md mb-2 shadow-md border`}
                >
                    <div
                        className={`h-12 ${message.files[0].type.startsWith('audio/') ? 'w-full' : 'w-12 bg-foreground '} rounded-md overflow-hidden flex-shrink-0`}
                    >
                        {message.files[0] ? (
                            message.files[0].type.startsWith('image/') ? (
                                <img
                                    src={
                                        message.files[0].url ||
                                        '/placeholder.svg'
                                    }
                                    alt='Image preview'
                                    className='w-full h-full object-cover'
                                />
                            ) : message.files[0].type.startsWith('audio/') ? (
                                <audio
                                    controls
                                    className='w-full rounded-md'
                                    style={{
                                        minHeight: '40px',
                                        height: '40px',
                                    }}
                                >
                                    <source
                                        src={message.files[0].url}
                                        type={message.files[0].type}
                                    />
                                    Your browser does not support the audio
                                    element.
                                </audio>
                            ) : message.files[0].type.startsWith('video/') ? (
                                <video
                                    src={message.files[0].url}
                                    className='w-full h-full object-cover'
                                    controls
                                />
                            ) : (
                                <div className='w-full h-full flex items-center justify-center text-xs text-muted-foreground'>
                                    📎
                                </div>
                            )
                        ) : null}
                    </div>

                    <div className='flex-1 min-w-0'>
                        <p className='text-sm font-medium'>
                            {message.files[0]?.type.startsWith('image/')
                                ? 'Image'
                                : message.files[0]?.type.startsWith('audio/')
                                  ? 'Audio'
                                  : message.files[0]?.type.startsWith('video/')
                                    ? 'Video'
                                    : 'Attachment'}
                        </p>
                        <p className='text-xs text-muted-foreground truncate'>
                            {renderPlainText({
                                text: message.text || '',
                                textSize: 'text-xs',
                                textColor: 'text-dark-gray',
                                // truncate: true,
                                lineClamp: 2,
                                width: 'w-full',
                            }) || 'No caption'}
                        </p>
                    </div>
                </div>
            );
        }

        return (
            <div className='flex items-center gap-1 p-2 bg-foreground rounded-md'>
                <div className='flex-1 min-w-0'>
                    <p className='text-sm line-clamp-3 overflow-hidden'>
                        {message.text}
                    </p>
                </div>
                <button
                    className='bg-danger p-1 rounded-full flex-shrink-0'
                    onClick={(e) => {
                        e.stopPropagation();
                        onClose();
                    }}
                >
                    <X size={16} className='text-pure-white' />
                </button>
            </div>
        );
    };

    return (
        <GlobalDialog
            open={isOpen}
            setOpen={onClose}
            allowFullScreen={false}
            title='Forward To'
            className='!max-w-[500px]'
        >
            <div className='space-y-2'>
                {/* Message preview */}
                {renderMessagePreview()}
                {/* Selected chats */}
                {selectedChats.length > 0 && (
                    <div className='flex flex-wrap gap-1 max-h-[100px] overflow-y-auto'>
                        {selectedChats.map((chat) => (
                            <div
                                key={chat._id}
                                className='flex items-center gap-1 bg-background rounded-lg pl-1 pr-2 py-1'
                            >
                                <Avatar className='h-5 w-5'>
                                    <AvatarImage
                                        src={
                                            chat.isChannel
                                                ? chat.avatar
                                                : chat.otherUser?.profilePicture
                                        }
                                        alt={
                                            chat.isChannel
                                                ? chat.name
                                                : chat.otherUser?.fullName || ''
                                        }
                                    />
                                    <AvatarFallback>
                                        {chat.isChannel
                                            ? chat.name.charAt(0)
                                            : chat.otherUser?.firstName?.charAt(
                                                  0,
                                              ) || ''}
                                    </AvatarFallback>
                                </Avatar>
                                <span className='text-xs'>
                                    {chat.isChannel
                                        ? chat.name
                                        : chat.otherUser?.fullName}
                                </span>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemoveChat(chat._id);
                                    }}
                                    className='ml-1'
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
                {/* Forward button */}
                <Button
                    className='w-full'
                    onClick={handleForward}
                    disabled={selectedChats.length === 0 || sending}
                >
                    {sending ? (
                        <>
                            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                            Forwarding...
                        </>
                    ) : (
                        <>
                            Forward <ArrowRight className='ml-2 h-4 w-4' />
                        </>
                    )}
                </Button>
                {/* Search input */}
                <div className='border-t pt-2'>
                    <div className='relative '>
                        <Search className='absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray' />
                        <Input
                            placeholder='Search users/crowds...'
                            className='pl-8 bg-background'
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
                {/* Chats list */}
                <div className='max-h-60 overflow-y-auto'>
                    {loading ? (
                        <div className='text-center py-4'>
                            <Loader2 className='h-5 w-5 animate-spin mx-auto' />
                            <p className='text-sm text-gray-500 mt-2'>
                                Loading chats...
                            </p>
                        </div>
                    ) : filteredChats.length === 0 ? (
                        <div className='text-center py-4'>No chats found</div>
                    ) : (
                        filteredChats.map((chat) => {
                            const activeStatus = chat.isChannel
                                ? null
                                : getLastActive(chat);
                            const isSelected = selectedChats.some(
                                (c) => c._id === chat._id,
                            );
                            const online =
                                !chat.isChannel && isUserOnline(chat);

                            return (
                                <div
                                    key={chat._id}
                                    className='flex items-center justify-between p-2 hover:bg-primary-light border-b pb-2 cursor-pointer'
                                    onClick={() => handleSelectChat(chat)}
                                >
                                    <div className='flex items-center gap-2'>
                                        <div className='relative'>
                                            <Avatar className='h-8 w-8'>
                                                <AvatarImage
                                                    src={
                                                        chat.isChannel
                                                            ? chat.avatar
                                                            : chat.otherUser
                                                                  ?.profilePicture
                                                    }
                                                    alt={
                                                        chat.isChannel
                                                            ? chat.name
                                                            : chat.otherUser
                                                                  ?.fullName ||
                                                              ''
                                                    }
                                                />
                                                <AvatarFallback>
                                                    {chat.isChannel
                                                        ? chat.name.charAt(0)
                                                        : chat.otherUser?.firstName?.charAt(
                                                              0,
                                                          ) || ''}
                                                </AvatarFallback>
                                            </Avatar>
                                            {online && (
                                                <span className='absolute bottom-0 right-0 block h-2 w-2 rounded-full bg-green-500 ring-2 ring-white' />
                                            )}
                                        </div>
                                        <div>
                                            <div className='font-medium text-sm flex items-center gap-1'>
                                                {chat.isChannel
                                                    ? chat.name
                                                    : chat.otherUser?.fullName}
                                                {chat.isChannel && (
                                                    <span className='text-xs bg-background px-1 rounded'>
                                                        Channel
                                                    </span>
                                                )}
                                            </div>
                                            {activeStatus && !online && (
                                                <div
                                                    className={`text-xs ${activeStatus.isActive ? 'text-green-600' : 'text-gray-500'}`}
                                                >
                                                    {activeStatus.text}
                                                </div>
                                            )}
                                            {online && (
                                                <div className='text-xs text-green-600'>
                                                    Online
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <Checkbox
                                        checked={isSelected}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleSelectChat(chat);
                                        }}
                                        className={`${chat.isChannel && isSelected ? 'data-[state=checked]:text-pure-white data-[state=checked]:bg-primary data-[state=checked]:border-primary' : ''}`}
                                    />
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </GlobalDialog>
    );
};

export default ForwardMessageModal;
