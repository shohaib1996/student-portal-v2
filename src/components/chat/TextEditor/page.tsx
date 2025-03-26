'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
    Mention,
    MentionsInput,
    MentionsInputStyle,
    OnChangeHandlerFunc,
} from 'react-mentions';
import { Avatar } from '@/components/ui/avatar';
import dynamic from 'next/dynamic';
import { toast } from 'sonner';
import { useParams } from 'next/navigation';
import { debounce } from 'lodash';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Smile, Paperclip, Mic, Send, Trash2, ImageIcon } from 'lucide-react';
import { socket } from '../../../helper/socketManager';
import { store } from '@/redux/store';
import {
    pushMessage,
    removeDraftFiles,
    removeFromDraft,
    setDraft,
    updateDraftFiles,
    updateSendingInfo,
} from '@/redux/features/chatReducer';
import FileItem from './FileItem';
import CaptureAudio from './CaptureAudio';
import { instance } from '@/lib/axios/axiosInstance';
import { useAppSelector } from '@/redux/hooks';
// Dynamically import EmojiPicker to prevent blocking the main bundle
const EmojiPicker = dynamic(() => import('emoji-picker-react'), {
    ssr: false,
    loading: () => (
        <div className='p-4 text-center'>Loading emoji picker...</div>
    ),
});

interface TextEditorProps {
    chatId?: string;
    parentMessage?: any;
    selectedMessage?: any;
    onSentCallback?: (data: any) => void;
    setProfileInfoShow?: (show: boolean) => void;
    profileInfoShow?: boolean;
    chat?: any;
}

interface UploadFile {
    file: File;
    status: string;
    name?: string;
    type?: string;
    size?: number;
    url?: string;
}

interface User {
    _id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
}

// Styles for react-mentions
const mentionStyle = {
    backgroundColor: '#E8F0FE',
    padding: '2px 4px',
    borderRadius: '4px',
    color: '#1E40AF',
    fontWeight: '500',
};

const mentionsInputStyle: MentionsInputStyle = {
    control: {
        fontSize: 16,
        fontWeight: 'normal',
    },
    input: {
        margin: 0,
        padding: '8px 12px',
        overflow: 'auto',
        height: 'auto',
    },
    highlighter: {
        padding: '8px 12px',
    },
    suggestions: {
        list: {
            backgroundColor: 'white',
            border: '1px solid rgba(0,0,0,0.15)',
            fontSize: 16,
            borderRadius: '5px',
            padding: '10px',
            maxHeight: '400px',
            overflowY: 'auto',
        },
        item: {
            padding: '5px 15px',
            borderBottom: '1px solid rgba(0,0,0,0.15)',
            '&focused': {
                backgroundColor: '#f0f0f0',
            },
        },
    },
};

const TextEditor: React.FC<TextEditorProps> = ({
    chatId,
    parentMessage,
    selectedMessage,
    onSentCallback,
    setProfileInfoShow,
    profileInfoShow,
    chat,
}) => {
    const { drafts } = useAppSelector((state) => state.chat);
    console.log({ drafts });
    const [typing, setTyping] = useState<boolean>(false);
    const mentionsInputRef = useRef<HTMLTextAreaElement>(null);
    const photoVideoInputRef = useRef<HTMLInputElement>(null);
    const [isVoiceRecordVisible, setIsVoiceRecordVisible] =
        useState<boolean>(false);
    const [pestFiles, setPestFiles] = useState<string[]>([]);
    const params = useParams();
    const [pestFileModal, setPestFileModal] = useState<boolean>(false);
    // const { drafts } = useAppSelector((state: any) => state.chat);
    const draftsData: any = drafts || [];
    const text =
        (draftsData &&
            draftsData?.find((item: any) => item?.chat === chatId)?.message) ||
        '';
    const uploadFiles: UploadFile[] =
        (draftsData &&
            draftsData?.find((item: any) => item.chat === chatId)
                ?.uploadFiles) ||
        [];

    const [localText, setLocalText] = useState<string>('');

    useEffect(() => {
        store.dispatch(
            setDraft({ chat: chatId as string, message: localText }),
        );
    }, [localText, chatId]);

    useEffect(() => {
        setLocalText(text);
    }, [chatId, text]);

    useEffect(() => {
        if (selectedMessage) {
            store.dispatch(
                setDraft({
                    chat: chatId as string,
                    message: selectedMessage?.text,
                }),
            );
            setLocalText(selectedMessage?.text);
        }
    }, [selectedMessage, chatId]);

    useEffect(() => {
        const el = document.querySelector(
            '.text_input_box__input',
        ) as HTMLElement;
        if (el) {
            el.setAttribute('autoFocus', 'true');
            el.focus();
        }
    }, [chatId]);

    const renderSuggestion = useCallback(
        (
            suggestion: any,
            search: string,
            highlightedDisplay: React.ReactNode,
        ) => {
            return (
                <div className='flex items-center gap-2.5 p-2'>
                    <Avatar className='h-10 w-10 border border-border'>
                        <img
                            src={
                                suggestion?.profilePicture || '/placeholder.svg'
                            }
                            alt={suggestion.display}
                        />
                    </Avatar>
                    <span>{suggestion.display}</span>
                </div>
            );
        },
        [],
    );

    const onTyping = useCallback(
        debounce((e: React.ChangeEvent<HTMLTextAreaElement>) => {
            const user = store.getState().auth?.user;
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
                    chatId,
                    typingData: { isTyping: true, user: profile },
                });
            }

            setTimeout(() => {
                setTyping(false);
                socket?.emit('typing', {
                    chatId,
                    typingData: { isTyping: false, user: profile },
                });
            }, 2000);
        }, 300),
        [chatId, typing],
    );

    const fetchMembers = async (options: {
        query: string;
        limit: number;
        chat: string;
    }) => {
        const res = await instance.post(
            `/chat/members/${options?.chat}`,
            options,
        );
        return res.data?.results || [];
    };

    const fetchUsers = (query: string, callback: (data: any[]) => void) => {
        fetchMembers({
            query: query?.toLowerCase(),
            limit: 15,
            chat: chatId as string,
        })
            .then((userLists) => {
                if (userLists?.length > 2) {
                    const users = userLists?.map((u: any) => ({
                        display: `${u?.user?.firstName} ${u?.user?.lastName}`,
                        id: u?.user?._id,
                        profilePicture: u?.user?.profilePicture,
                    }));
                    callback([
                        { id: 'everyone', display: 'everyone' },
                        ...users,
                    ]);
                }
            })
            .catch((err) => {
                toast.error('Something went wrong!');
            });
    };

    const [isSendingAudio, setIsSendingAudio] = useState<boolean>(false);

    // Modify the sendRenderedAudio function to track sending state
    const sendRenderedAudio = async (audio: File) => {
        const totalCount = uploadFiles?.length + 1;
        if (totalCount > 5) {
            return toast.error("You can't upload more than 5 files");
        }
        const newFiles = [{ file: audio, status: 'uploading' }];
        store.dispatch(
            setDraft({ chat: chatId as string, uploadFiles: newFiles }),
        );
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
            const response = await instance.post('/chat/file', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
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

    const updateFileStatus = (file: File, responseData: any) => {
        store.dispatch(
            updateDraftFiles({
                chat: chatId as string,
                file: file,
                responseData: responseData,
            }),
        );
    };

    const handleRemoveItem = (f: UploadFile) => {
        store.dispatch(
            removeDraftFiles({ chat: chatId as string, file: f.file }),
        );
        store.dispatch(
            setDraft({
                chat: chatId as string,
                uploadFiles: undefined,
            }),
        ); // setting null to the draft reducer
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
        const totalCount = files?.length + uploadFiles?.length;
        if (totalCount > 10) {
            return toast.warning("You can't upload more than 10 files");
        }
        const newFiles = files.map((file) => ({
            file,
            status: 'uploading',
        }));
        store.dispatch(
            setDraft({ chat: chatId as string, uploadFiles: newFiles }),
        );
        for (let i = 0; i < files.length; i++) {
            await uploadFile(files[i]);
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
            store.dispatch(
                setDraft({ chat: chatId as string, message: newText }),
            );
            setLocalText(newText);

            // Need to wait for the state to update before setting selection range
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

    const handleOnChange: OnChangeHandlerFunc = (
        event,
        newValue,
        newPlainTextValue,
        mentions,
    ) => {
        if (chatId) {
            setLocalText(newValue);
        }
        onTyping({
            target: { value: newValue },
        } as React.ChangeEvent<HTMLTextAreaElement>);
    };

    const sendMessage = () => {
        console.log('Clicked to the sned button');
        const successFiles = uploadFiles
            .filter((file) => file.url)
            .map((x) => ({
                name: x?.name,
                type: x?.type,
                size: x?.size,
                url: x?.url,
            }));

        const messageText = localText.trim();

        if (!messageText && successFiles.length === 0) {
            store.dispatch(setDraft({ chat: chatId as string, message: '' }));
            return toast.error('Please write something');
        }

        const data = {
            text: localText,
            files: successFiles,
        } as any;

        if (parentMessage) {
            data['parentMessage'] = parentMessage;
        }

        if (selectedMessage) {
            instance
                .patch(`/chat/update/message/${selectedMessage?._id}`, data)
                .then((res) => {
                    store.dispatch(removeFromDraft(chatId as string));
                    setLocalText('');
                    toast.success('Message updated successfully');
                    if (onSentCallback) {
                        onSentCallback({
                            action: 'create',
                            message: res.data.message,
                        });
                    }
                })
                .catch((err) => {
                    toast.error(
                        err?.response?.data?.error ||
                            'Failed to update message',
                    );
                });
        } else {
            const randomId = Math.floor(Math.random() * (999999 - 1111) + 1111);
            const user = store.getState().auth?.user;
            const messageData = {
                message: {
                    ...data,
                    _id: randomId,
                    sender: {
                        _id: user?._id,
                        fullName: `${user?.firstName} ${user?.lastName}`,
                        profilePicture: user?.profilePicture,
                    },
                    createdAt: Date.now(),
                    status: 'sending',
                    chat: chatId,
                    type: 'message',
                },
            };

            store.dispatch(pushMessage(messageData));
            store.dispatch(removeFromDraft(chatId as string));
            setLocalText('');

            instance
                .put(`/chat/sendmessage/${chatId}`, data)
                .then((res) => {
                    // Update the message status to 'sent' in Redux
                    store.dispatch(
                        updateSendingInfo({
                            message: {
                                ...res.data.message,
                                status: 'sent', // Ensure status is set to 'sent'
                            },
                            trackingId: randomId.toString(),
                        }),
                    );

                    if (!parentMessage && onSentCallback) {
                        onSentCallback({
                            action: 'create',
                            message: res.data.message,
                        });
                    }
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
            | React.KeyboardEvent<HTMLInputElement>
            | React.KeyboardEvent<HTMLTextAreaElement>,
    ) => {
        if (
            event.key === 'Enter' &&
            !event.shiftKey &&
            !event.ctrlKey &&
            !event.metaKey
        ) {
            event.preventDefault();
            sendMessage();
        }
    };

    const modifiedInputStyle: MentionsInputStyle = {
        ...mentionsInputStyle,
        suggestions: {
            ...mentionsInputStyle.suggestions!,
            list: {
                ...mentionsInputStyle.suggestions!.list,
                backgroundColor: 'var(--background)',
            },
            item: {
                ...mentionsInputStyle.suggestions!.item,
                backgroundColor: 'var(--background)',
                '&focused': {
                    backgroundColor: 'var(--muted)',
                },
            },
        },
    };

    return (
        <>
            {pestFileModal && (
                <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
                    <div className='bg-background rounded-lg p-4 max-w-md w-full'>
                        {pestFiles?.length > 0 && (
                            <div className='grid grid-cols-2 gap-2 mb-4'>
                                {pestFiles?.map((item, i) => (
                                    <img
                                        className='w-full h-auto rounded'
                                        src={item || '/placeholder.svg'}
                                        key={i}
                                        alt='Pasted file'
                                    />
                                ))}
                            </div>
                        )}
                        <div className='flex justify-between'>
                            <button
                                onClick={() => {
                                    setPestFileModal(false);
                                    setPestFiles([]);
                                }}
                                className='flex items-center gap-1 text-destructive'
                            >
                                <Trash2 className='h-4 w-4' />
                                Remove
                            </button>
                            <button className='bg-primary text-primary-foreground px-4 py-2 rounded'>
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

                <div className=' border-t border-border py-2 px-2'>
                    {uploadFiles.map((uploadFile, index) => (
                        <div key={index} className='flex flex-wrap gap-2 pb-1'>
                            <FileItem
                                handleRemove={() =>
                                    handleRemoveItem(uploadFile)
                                }
                                file={uploadFile}
                                index={index}
                                key={index}
                            />
                        </div>
                    ))}

                    {isVoiceRecordVisible ? (
                        <CaptureAudio
                            sendRenderedAudio={sendRenderedAudio}
                            setIsRecorderVisible={() =>
                                setIsVoiceRecordVisible(false)
                            }
                            isSendingAudio={isSendingAudio}
                        />
                    ) : (
                        // <p>Capture Audio coming soon!</p>
                        <div className='flex items-center p-1 border rounded-lg bg-background'>
                            <div className='flex items-center w-full'>
                                <div className='mt-auto'>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button className='p-2 rounded-full hover:bg-muted'>
                                                <Smile className='h-5 w-5 text-muted-foreground' />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent
                                            side='top'
                                            align='start'
                                            className='w-auto'
                                        >
                                            <EmojiPicker
                                                reactionsDefaultOpen={true}
                                                onReactionClick={handleSetEmoji}
                                                onEmojiClick={handleSetEmoji}
                                                // native
                                            />
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                <div className='flex-1 mx-2 max-h-32 overflow-y-auto'>
                                    <MentionsInput
                                        value={localText}
                                        onChange={handleOnChange}
                                        placeholder='Type a message'
                                        style={mentionsInputStyle}
                                        allowSuggestionsAboveCursor
                                        className='text_input_box'
                                        inputRef={mentionsInputRef}
                                        onFocus={handleOnFocusEditor}
                                        onKeyDown={handleKeyDown}
                                        autoFocus={true}
                                    >
                                        <Mention
                                            trigger={'@'}
                                            data={fetchUsers}
                                            displayTransform={(id, display) =>
                                                `@${display}`
                                            }
                                            renderSuggestion={renderSuggestion}
                                            markup='@[__display__](__id__)'
                                            className='bg-primary/10 text-primary rounded px-1'
                                            style={mentionStyle}
                                            appendSpaceOnAdd
                                        />
                                    </MentionsInput>
                                </div>

                                <div className='flex items-center'>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button className='p-2 rounded-full hover:bg-muted'>
                                                <Paperclip className='h-5 w-5 text-muted-foreground' />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent
                                            side='top'
                                            align='end'
                                        >
                                            <DropdownMenuItem
                                                className='flex items-center gap-2 cursor-pointer'
                                                onClick={handleMenuItemClick}
                                            >
                                                <ImageIcon size={16} />
                                                Photos & Videos
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>

                                    {localText?.length === 0 &&
                                    uploadFiles?.length === 0 ? (
                                        <button
                                            className='p-2 rounded-full hover:bg-muted'
                                            onClick={() =>
                                                setIsVoiceRecordVisible(true)
                                            }
                                        >
                                            <Mic className='h-5 w-5 text-muted-foreground' />
                                        </button>
                                    ) : (
                                        <button
                                            className={`p-2 rounded-full ${
                                                !localText &&
                                                uploadFiles?.length === 0
                                                    ? 'opacity-50 cursor-not-allowed'
                                                    : 'bg-primary'
                                            }`}
                                            disabled={
                                                !localText &&
                                                uploadFiles?.length === 0
                                            }
                                            onClick={sendMessage}
                                        >
                                            <Send className='h-5 w-5 text-primary-foreground' />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default React.memo(TextEditor);
