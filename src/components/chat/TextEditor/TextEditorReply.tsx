'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Mention, MentionsInput } from 'react-mentions';
import { Avatar } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import dynamic from 'next/dynamic';
// import FileItem from './FileItem';
import axios from 'axios';
import { toast } from 'sonner';
import { debounce } from 'lodash';
import { pushMessage, updateSendingInfo } from '@/redux/features/chatReducer'; // Will be replaced with RTK
import { useSelector } from 'react-redux';
import { useParams } from 'next/navigation';
import { Smile, Paperclip, Mic, Send, Image, Trash2 } from 'lucide-react';
import { socket } from '@/helper/socketManager';

// Dynamically import heavy components to improve performance
const EmojiPicker = dynamic(() => import('emoji-picker-react'), { ssr: false });
// const CaptureAudio = dynamic(() => import('./CaptureAudio'), { ssr: false });

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

interface User {
    _id: string;
    firstName: string;
    lastName: string;
    profilePicture: string;
}

interface UserSuggestion {
    display?: string;
    id: string;
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
    const [pestFiles, setPestFiles] = useState<string[]>([]);
    const params = useParams();
    const [pestFileModal, setPestFileModal] = useState<boolean>(false);

    useEffect(() => {
        if (selectedMessage) {
            setUploadingFiles(selectedMessage?.files || []);
            setText(selectedMessage?.text || '');
        }
    }, [selectedMessage]);

    // Replace your renderSuggestion function (around line 74) with:
    const renderSuggestion = (
        suggestion: {
            id: string | number;
            display?: string;
            profilePicture?: string;
        },
        search: string,
        highlightedDisplay: React.ReactNode,
    ) => (
        <div className='flex items-center gap-2 p-2'>
            <Avatar className='h-10 w-10 border border-border'>
                <img
                    src={suggestion?.profilePicture}
                    alt={suggestion.display || ''}
                />
            </Avatar>
            <span>{suggestion.display || ''}</span>
        </div>
    );

    const onTyping = useCallback(() => {
        // Get current user from store - this will be replaced with RTK
        const authState = useSelector((state: any) => state.auth);
        const user = authState?.user;

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
    }, [chatId, typing, typingTimeout]);

    const fetchMembers = async (options: {
        chat: string;
        query: string;
        limit: number;
    }) => {
        try {
            const res = await axios.post(
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
        await uploadFile(audio);
    };

    const uploadFile = async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post('/chat/file', formData);
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
            axios
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
            const authState = useSelector((state: any) => state.auth);
            const user = authState?.user;

            const messageData = {
                message: {
                    ...data,
                    _id: randomId,
                    sender: {
                        _id: user?._id,
                        fullName: user?.firstName + ' ' + user?.lastName,
                        profilePicture: user.profilePicture,
                    },
                    createdAt: Date.now(),
                    status: 'sending',
                    chat: chatId,
                    type: 'message',
                },
            };

            // This dispatch would be replaced with RTK
            const dispatch = useSelector((state: any) => state.dispatch);
            dispatch(pushMessage(messageData));
            setText('');

            axios
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

    // Replace your handleKeyDown function (around line 240) with:
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
            backgroundColor: '#transparent',
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
        <>
            {pestFileModal && (
                <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
                    <div className='bg-card rounded-lg p-6 shadow-lg w-full max-w-md'>
                        {pestFiles?.length > 0 && (
                            <div className='flex flex-wrap gap-2 mb-4'>
                                {pestFiles?.map((item, i) => (
                                    <img
                                        className='w-[200px] h-auto rounded-md'
                                        src={item}
                                        key={i}
                                        alt=''
                                    />
                                ))}
                            </div>
                        )}
                        <div className='flex justify-between items-center'>
                            <button
                                onClick={() => {
                                    setPestFileModal(false);
                                    setPestFiles([]);
                                }}
                                className='text-destructive hover:text-destructive/80 flex items-center'
                            >
                                <Trash2 className='h-4 w-4 mr-1' />
                                Remove
                            </button>
                            <button className='bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md'>
                                Send
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div>
                <input
                    type='file'
                    multiple
                    className='hidden'
                    ref={photoVideoInputRef}
                    onChange={handleFileInputChange}
                    accept='image/*,video/*'
                />

                <div className='bg-background border rounded-lg p-2'>
                    {/* File attachments area */}
                    {uploadingFiles.length > 0 && (
                        <div className='flex flex-wrap gap-2 mb-2'>
                            {uploadingFiles.map((uploadingFile, index) => (
                                // <FileItem
                                //     handleRemove={handleRemoveItem}
                                //     file={uploadingFile}
                                //     index={index}
                                //     key={index}
                                // />
                                <p key={index}>
                                    File Attachment is coming soon!
                                </p>
                            ))}
                        </div>
                    )}

                    {isVoiceRecordVisible ? (
                        // <CaptureAudio
                        //     sendRenderedAudio={sendRenderedAudio}
                        //     setIsRecorderVisible={() =>
                        //         setIsVoiceRecordVisible(false)
                        //     }
                        // />
                        <p>Audio input is coming soon!</p>
                    ) : (
                        <div className='flex items-center'>
                            <div className='flex-1 flex items-center'>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button className='p-2 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground'>
                                            <Smile className='h-5 w-5' />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        align='start'
                                        className='w-[350px] p-0'
                                    >
                                        <EmojiPicker
                                            reactionsDefaultOpen={true}
                                            onReactionClick={handleSetEmoji}
                                            onEmojiClick={handleSetEmoji}
                                            // native
                                        />
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                <div className='flex-1 mx-2'>
                                    <MentionsInput
                                        value={text}
                                        onChange={(e) => {
                                            setText(e.target.value);
                                            onTyping();
                                        }}
                                        placeholder='Type a message'
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
                            </div>

                            <div className='flex items-center'>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button className='p-2 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground'>
                                            <Paperclip className='h-5 w-5' />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align='end'>
                                        <DropdownMenuItem
                                            onClick={handleMenuItemClick}
                                            className='cursor-pointer'
                                        >
                                            <Image className='h-4 w-4 mr-2' />
                                            <span>Photos & Videos</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                {text?.length === 0 &&
                                uploadingFiles?.length === 0 ? (
                                    <button
                                        className='p-2 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground ml-1'
                                        onClick={() =>
                                            setIsVoiceRecordVisible(true)
                                        }
                                    >
                                        <Mic className='h-5 w-5' />
                                    </button>
                                ) : (
                                    <button
                                        className={`p-2 rounded-md ml-1 ${
                                            !text &&
                                            uploadingFiles?.length === 0
                                                ? 'bg-primary/50 text-primary-foreground cursor-not-allowed'
                                                : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                                        }`}
                                        disabled={
                                            !text &&
                                            uploadingFiles?.length === 0
                                        }
                                        onClick={sendMessage}
                                    >
                                        <Send className='h-5 w-5' />
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default TextEditorReply;
