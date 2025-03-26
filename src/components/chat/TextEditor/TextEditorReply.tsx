'use client';

import type React from 'react';
import { useEffect, useRef, useState, useCallback } from 'react';
import { Mention, MentionsInput } from 'react-mentions';
import { Avatar } from '@/components/ui/avatar';
import dynamic from 'next/dynamic';
import { toast } from 'sonner';
import { debounce } from 'lodash';
import { useParams } from 'next/navigation';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Smile, Paperclip, Mic, Send, Image } from 'lucide-react';
import { socket } from '@/helper/socketManager';
import { instance } from '@/lib/axios/axiosInstance';
import { pushMessage, updateSendingInfo } from '@/redux/features/chatReducer';
import FileItem from './FileItem';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';

// Dynamically import heavy components to improve performance
const EmojiPicker = dynamic(() => import('emoji-picker-react'), {
    ssr: false,
    loading: () => (
        <div className='p-4 text-center'>Loading emoji picker...</div>
    ),
});
const CaptureAudio = dynamic(() => import('./CaptureAudio'), { ssr: false });

// TypeScript interfaces
interface TextEditorReplyProps {
    chatId: string;
    parentMessage?: any;
    scrollIntoBottom?: () => void;
    selectedMessage?: any;
    onSentCallback?: (data: { action: string; message?: any }) => void;
    setProfileInfoShow?: (show: boolean) => void;
    profileInfoShow?: boolean;
    chat?: any;
}

interface UploadingFile {
    file?: File;
    status?: string;
    name?: string;
    type?: string;
    size?: number;
    url?: string;
}

interface UserSuggestion {
    display?: string;
    id: string | number;
    profilePicture?: string;
}

const TextEditorReply: React.FC<TextEditorReplyProps> = ({
    chatId,
    parentMessage,
    scrollIntoBottom,
    selectedMessage,
    onSentCallback,
    setProfileInfoShow,
    profileInfoShow,
    chat,
}) => {
    const [text, setText] = useState<string>('');
    const [typing, setTyping] = useState<boolean>(false);
    const mentionsInputRef = useRef<HTMLTextAreaElement | null>(null);
    const photoVideoInputRef = useRef<HTMLInputElement | null>(null);
    const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
    const [isVoiceRecordVisible, setIsVoiceRecordVisible] =
        useState<boolean>(false);
    const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(
        null,
    );
    const [isSendingAudio, setIsSendingAudio] = useState<boolean>(false);
    const params = useParams();
    const authState = useAppSelector((state) => state.auth);
    const user = authState?.user;
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (selectedMessage) {
            setUploadingFiles(selectedMessage?.files || []);
            setText(selectedMessage?.text || '');
        }
    }, [selectedMessage]);

    // Render suggestion for mentions
    const renderSuggestion = (
        suggestion: UserSuggestion,
        search: string,
        highlightedDisplay: React.ReactNode,
    ) => (
        <div className='flex items-center gap-2 p-2'>
            <Avatar className='h-10 w-10 border border-border'>
                <img
                    src={suggestion?.profilePicture || '/placeholder.svg'}
                    alt={suggestion.display || ''}
                />
            </Avatar>
            <span>{suggestion.display || ''}</span>
        </div>
    );

    const onTyping = useCallback(() => {
        const profile = {
            _id: user?._id,
            firstName: user?.firstName,
            lastName: user?.lastName,
            fullName: `${user?.firstName} ${user?.lastName}`,
            profilePicture: user?.profilePicture,
        };

        if (!typing) {
            setTyping(true);
            socket?.emit('typing', {
                chatId: chatId,
                typingData: { isTyping: true, user: profile },
            });
        }

        if (typingTimeout) {
            clearTimeout(typingTimeout);
        }

        const timeout = setTimeout(() => {
            setTyping(false);
            socket?.emit('typing', {
                chatId: chatId,
                typingData: { isTyping: false, user: profile },
            });
        }, 2000);

        setTypingTimeout(timeout);
    }, [chatId, typing, typingTimeout, user]);

    const fetchMembers = async (options: {
        chat: string;
        query: string;
        limit: number;
    }) => {
        try {
            const res = await instance.post(
                `/chat/members/${options?.chat}`,
                options,
            );
            return res.data?.results || [];
        } catch (error) {
            toast.error('Failed to fetch members');
            return [];
        }
    };

    const fetchUsers = useCallback(
        debounce(
            async (
                query: string,
                callback: (users: UserSuggestion[]) => void,
            ) => {
                try {
                    const userLists = await fetchMembers({
                        query: query.toLowerCase(),
                        limit: 15,
                        chat: params?.chatid as string,
                    });

                    if (userLists?.length > 2) {
                        const users = userLists.map((u: any) => ({
                            display: `${u?.user?.firstName} ${u?.user?.lastName}`,
                            id: u?.user?._id,
                            profilePicture: u?.user?.profilePicture,
                        }));
                        callback([
                            { id: 'everyone', display: 'everyone' },
                            ...users,
                        ]);
                    }
                } catch (err) {
                    toast.error('Something went wrong!');
                }
            },
            300,
        ),
        [params?.chatid],
    );

    const sendRenderedAudio = async (audio: File) => {
        const totalCount = uploadingFiles?.length + 1;
        if (totalCount > 5) {
            return toast.error("You can't upload more than 5 files");
        }

        setUploadingFiles((prev) => [
            ...prev,
            { file: audio, status: 'uploading' },
        ]);
        setIsVoiceRecordVisible(false);
        setIsSendingAudio(true);

        try {
            await uploadFile(audio);
        } finally {
            setIsSendingAudio(false);
        }
    };

    const uploadFile = async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await instance.post('/chat/file', formData);
            const fileData = response?.data?.file;

            updateFileStatus(file, {
                name: fileData?.name,
                type: fileData?.type,
                size: fileData?.size,
                url: fileData?.location,
                status: 'success',
            });
        } catch (error) {
            updateFileStatus(file, { status: 'failed' });
        }
    };

    const updateFileStatus = (
        file: File,
        responseData: Partial<UploadingFile>,
    ) => {
        setUploadingFiles((prevState) =>
            prevState.map((f) =>
                f.file === file ? { ...f, ...responseData } : f,
            ),
        );
    };

    const handleRemoveItem = (index: number) => {
        setUploadingFiles((prev) => {
            const newFiles = [...prev];
            newFiles.splice(index, 1);
            return newFiles;
        });
    };

    const handleMenuItemClick = () => {
        if (photoVideoInputRef.current) {
            photoVideoInputRef.current.click();
        }
    };

    const handleFileInputChange = async (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const files = Array.from(event.target.files || []);
        const totalCount = files.length + uploadingFiles.length;

        if (totalCount > 10) {
            return toast.warning("You can't upload more than 10 files");
        }

        setUploadingFiles([
            ...uploadingFiles,
            ...files.map((file) => ({ file, status: 'uploading' })),
        ]);

        for (const file of files) {
            await uploadFile(file);
        }
    };

    const handleSetEmoji = (emojiObject: any) => {
        if (mentionsInputRef.current) {
            const cursorPosition = mentionsInputRef.current.selectionStart || 0;
            const currentText = mentionsInputRef.current.value;
            const newText =
                currentText.substring(0, cursorPosition) +
                emojiObject.emoji +
                currentText.substring(cursorPosition);

            setText(newText);

            // Set cursor position after the emoji
            setTimeout(() => {
                if (mentionsInputRef.current) {
                    mentionsInputRef.current.focus();
                    mentionsInputRef.current.setSelectionRange(
                        cursorPosition + emojiObject?.emoji?.length,
                        cursorPosition + emojiObject?.emoji?.length,
                    );
                }
            }, 0);
        }
    };

    const sendMessage = () => {
        const successFiles = uploadingFiles
            .filter((file) => file.url)
            .map((x) => ({
                name: x?.name,
                type: x?.type,
                size: x?.size,
                url: x?.url,
            }));

        const messageText = text.trim();

        if (!messageText && successFiles.length === 0) {
            return toast.error('Please write something');
        }

        const data: any = { text: messageText, files: successFiles };

        if (parentMessage) {
            data['parentMessage'] = parentMessage;
        }

        if (selectedMessage) {
            instance
                .patch(`/chat/update/message/${selectedMessage?._id}`, data)
                .then((res) => {
                    setText('');
                    toast.success('Message updated successfully');
                    onSentCallback?.({
                        action: 'edit',
                        message: res.data.message,
                    });
                })
                .catch((err) => {
                    toast.error(
                        err?.response?.data?.error ||
                            'Failed to update message',
                    );
                });
        } else {
            // This would be moved to RTK in the future
            const randomId = Math.floor(Math.random() * (999999 - 1111) + 1111);

            const messageData = {
                message: {
                    ...data,
                    _id: randomId,
                    sender: {
                        _id: user?._id,
                        fullName: user?.firstName + ' ' + user?.lastName,
                        profilePicture: user?.profilePicture,
                    },
                    createdAt: Date.now(),
                    status: 'sending',
                    chat: chatId,
                    type: 'message',
                },
            };

            // This dispatch would be replaced with RTK

            dispatch(pushMessage(messageData));
            setText('');

            instance
                .put(`/chat/sendmessage/${chatId}`, data)
                .then((res) => {
                    dispatch(
                        updateSendingInfo({
                            message: res.data.message,
                            trackingId: randomId.toString(),
                        }),
                    );

                    if (!parentMessage) {
                        onSentCallback?.({
                            action: 'create',
                            message: res.data.message,
                        });
                    }

                    setUploadingFiles([]);
                })
                .catch((err) => {
                    toast.error(
                        err?.response?.data?.error || 'Failed to send message',
                    );
                });
        }
    };

    const handleOnFocusEditor = () => {
        if (profileInfoShow && setProfileInfoShow) {
            setProfileInfoShow(false);
        }
    };

    const handleKeyDown = (
        event:
            | React.KeyboardEvent<HTMLTextAreaElement>
            | React.KeyboardEvent<HTMLInputElement>,
    ) => {
        if (
            event.key === 'Enter' &&
            !event.shiftKey &&
            !event.ctrlKey &&
            !event.metaKey
        ) {
            event.preventDefault();
            sendMessage();
        } else if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
            const value = text;
            // We need to check if the target is a textarea
            if ('selectionStart' in event.currentTarget) {
                const cursorPosition = event.currentTarget.selectionStart || 0;
                setText(
                    value.substring(0, cursorPosition) +
                        '\n' +
                        value.substring(cursorPosition),
                );
            }
        }
    };

    // Custom mentions styles adapted for Tailwind theme
    const mentionsInputStyle = {
        control: {
            backgroundColor: 'transparent',
            fontSize: 16,
            fontWeight: 'normal',
        },
        highlighter: {
            boxSizing: 'border-box' as const,
            overflow: 'hidden',
            backgroundColor: 'transparent',
        },
        input: {
            margin: 0,
            overflow: 'auto',
            height: 'auto',
            color: 'inherit',
            backgroundColor: 'transparent',
            padding: '8px 12px',
        },
        suggestions: {
            list: {
                backgroundColor: 'hsl(var(--background))',
                fontSize: 16,
                borderRadius: '0.5rem',
                padding: '0.625rem',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                overflow: 'auto',
                maxHeight: '400px',
            },
            item: {
                padding: '0.3125rem 1.25rem',
                borderRadius: '0.25rem',
                '&focused': {
                    backgroundColor: 'hsl(var(--accent))',
                },
            },
        },
    };

    const mentionStyle = {
        backgroundColor: 'hsl(var(--accent))',
        color: 'hsl(var(--accent-foreground))',
        borderRadius: '0.25rem',
        padding: '0.125rem 0.25rem',
    };

    return (
        <div className='w-full'>
            <input
                type='file'
                multiple
                className='hidden'
                ref={photoVideoInputRef}
                onChange={handleFileInputChange}
                accept='image/*,video/*'
            />

            {/* File attachments area */}
            {uploadingFiles.length > 0 && (
                <div className='flex flex-wrap gap-2 mb-2 p-2 bg-background border border-border rounded-md'>
                    {uploadingFiles.map((uploadingFile, index) => (
                        <FileItem
                            handleRemove={handleRemoveItem}
                            file={uploadingFile}
                            index={index}
                            key={index}
                        />
                    ))}
                </div>
            )}

            {isVoiceRecordVisible ? (
                <CaptureAudio
                    sendRenderedAudio={sendRenderedAudio}
                    setIsRecorderVisible={() => setIsVoiceRecordVisible(false)}
                    isSendingAudio={isSendingAudio}
                />
            ) : (
                <div className='flex items-start gap-2'>
                    <Avatar className='h-8 w-8 mt-2'>
                        <img
                            src={user?.profilePicture || '/placeholder.svg'}
                            alt={user?.firstName || 'User'}
                        />
                    </Avatar>

                    <div className='flex items-center gap-1 w-full border rounded-lg p-1 bg-foreground'>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className='p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground'>
                                    <Smile className='h-5 w-5' />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align='end'
                                side='top'
                                className='w-[350px] p-0'
                            >
                                <EmojiPicker
                                    reactionsDefaultOpen={true}
                                    onReactionClick={handleSetEmoji}
                                    onEmojiClick={handleSetEmoji}
                                />
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <div className='flex-1 flex items-center'>
                            <MentionsInput
                                value={text}
                                onChange={(e) => {
                                    setText(e.target.value);
                                    onTyping();
                                }}
                                placeholder='Start Typing...'
                                style={mentionsInputStyle}
                                allowSuggestionsAboveCursor
                                className='w-full max-h-[120px] overflow-auto'
                                inputRef={mentionsInputRef}
                                onFocus={handleOnFocusEditor}
                                onKeyDown={handleKeyDown}
                            >
                                <Mention
                                    trigger='@'
                                    data={fetchUsers}
                                    displayTransform={(id, display) =>
                                        `@${display}`
                                    }
                                    renderSuggestion={renderSuggestion}
                                    markup='@[__display__](__id__)'
                                    style={mentionStyle}
                                    appendSpaceOnAdd
                                />
                            </MentionsInput>
                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className='p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground'>
                                    <Paperclip className='h-5 w-5' />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align='end' side='top'>
                                <DropdownMenuItem
                                    onClick={handleMenuItemClick}
                                    className='cursor-pointer'
                                >
                                    <Image className='h-4 w-4 mr-2' />
                                    <span>Photos & Videos</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {text?.length === 0 && uploadingFiles?.length === 0 ? (
                            <button
                                className='p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground'
                                onClick={() => setIsVoiceRecordVisible(true)}
                            >
                                <Mic className='h-5 w-5' />
                            </button>
                        ) : (
                            <button
                                className={`p-2 rounded-full ${
                                    !text && uploadingFiles?.length === 0
                                        ? 'bg-primary/50 text-primary-foreground cursor-not-allowed'
                                        : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                                }`}
                                disabled={!text && uploadingFiles?.length === 0}
                                onClick={sendMessage}
                            >
                                <Send className='h-5 w-5' />
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TextEditorReply;
