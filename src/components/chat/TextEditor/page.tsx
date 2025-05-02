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
    updateMessage,
    updateSendingInfo,
} from '@/redux/features/chatReducer';
import FileItem from './FileItem';
import CaptureAudio from './CaptureAudio';
import { instance } from '@/lib/axios/axiosInstance';
import { useAppSelector } from '@/redux/hooks';

import {
    MentionMenu,
    MentionMenuItem,
} from '@/components/lexicalEditor/components/editor-ui/MentionMenu';
import {
    ChatEditor,
    PluginOptions,
} from '@/components/lexicalEditor/chateditor/editor';
import GlobalTooltip from '@/components/global/GlobalTooltip';
import { Button } from '@/components/ui/button';

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
    isPopUp?: boolean;
    isEdit?: boolean;
    isChannel?: boolean;
    chat?: any;
    setIsAttachment?: (value: boolean) => void;
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

const TextEditor: React.FC<TextEditorProps> = ({
    chatId,
    parentMessage,
    selectedMessage,
    onSentCallback,
    setProfileInfoShow,
    profileInfoShow,
    isPopUp = false,
    isEdit = false,
    setIsAttachment,
    isChannel,
    chat,
}) => {
    console.log('Editing in text editor...', selectedMessage);
    const { user } = useAppSelector((state) => state.auth);
    const { drafts } = useAppSelector((state) => state.chat);
    const [typing, setTyping] = useState<boolean>(false);
    const mentionsInputRef = useRef<HTMLTextAreaElement>(null);
    const photoVideoInputRef = useRef<HTMLInputElement>(null);
    const [isVoiceRecordVisible, setIsVoiceRecordVisible] =
        useState<boolean>(false);
    const [pestFiles, setPestFiles] = useState<string[]>([]);
    const params = useParams();
    const [pestFileModal, setPestFileModal] = useState<boolean>(false);
    const editorRef = useRef<any>(null);
    // Plugin options for the markdown editor
    const pluginOptions: PluginOptions = {
        // Main plugin options
        history: true,
        autoFocus: true,
        richText: true,
        checkList: true,
        horizontalRule: false,
        table: false,
        list: true,
        tabIndentation: false,
        draggableBlock: false,
        images: false,
        codeHighlight: true,
        autoLink: false,
        link: false,
        componentPicker: true,
        contextMenu: true,
        dragDropPaste: true,
        emojiPicker: true,
        floatingLinkEditor: true,
        floatingTextFormat: false,
        maxIndentLevel: true,
        beautifulMentions: isChannel && true,
        showToolbar: true,
        showBottomBar: false,
        quote: false,

        // Toolbar-specific options
        toolbar: {
            history: false,
            blockFormat: isPopUp ? false : true,
            codeLanguage: true,
            fontFormat: {
                bold: true,
                italic: true,
                underline: true,
                strikethrough: true,
            },
            link: false,
            clearFormatting: true,
            horizontalRule: false,
            image: false,
            table: false,
            quote: false,
        },

        // Action bar specific options
        actionBar: {
            maxLength: true,
            characterLimit: true,
            counter: true,
            speechToText: true,
            editModeToggle: true,
            clearEditor: true,
            treeView: true,
        },
    };
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
    const [isSendingAudio, setIsSendingAudio] = useState<boolean>(false);

    useEffect(() => {
        if (
            localText?.length === 0 &&
            uploadFiles?.length === 0 &&
            setIsAttachment
        ) {
            setIsAttachment(true);
        }
    }, [localText, uploadFiles]);

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

    // Modified send rendered audio function
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
        );
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

    const handleOnChange = (newValue: string) => {
        if (chatId) {
            setLocalText(newValue);
        }
        onTyping({
            target: { value: newValue },
        } as React.ChangeEvent<HTMLTextAreaElement>);
    };

    const sendMessage = () => {
        const successFiles = uploadFiles
            .filter((file) => file.url)
            .map((x) => ({
                name: x?.name,
                type: x?.type,
                size: x?.size,
                url: x?.url,
            }));

        const messageText = localText.trim();
        console.log({ messageText });
        if (!messageText && successFiles.length === 0) {
            store.dispatch(setDraft({ chat: chatId as string, message: '' }));
            return toast.error('Please write something or attach a file');
        }

        const data = {
            text: messageText,
            files: successFiles,
        } as any;

        if (parentMessage) {
            data['parentMessage'] = parentMessage;
        }

        editorRef.current?.clearEditor();

        if (selectedMessage) {
            instance
                .patch(`/chat/update/message/${selectedMessage?._id}`, data)
                .then((res) => {
                    store.dispatch(removeFromDraft(chatId as string));
                    store.dispatch(updateMessage(res?.data?.message));
                    setLocalText('');
                    toast.success('Message updated successfully');
                    if (onSentCallback) {
                        onSentCallback({
                            action: 'create',
                            message: res.data.message,
                        });
                    }
                    editorRef.current?.clearEditor();
                })
                .catch((err) => {
                    console.log({ err });
                    // toast.error(
                    //     err?.response?.data?.error ||
                    //         'Failed to update message',
                    // );
                });
        } else {
            const randomId = Math.floor(Math.random() * (999999 - 1111) + 1111);
            const user = store.getState().auth?.user;
            const messageData = {
                message: {
                    ...data,
                    _id: String(randomId),
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
                    store.dispatch(
                        updateSendingInfo({
                            message: {
                                ...res.data.message,
                                status: 'sent',
                            },
                            trackingId: String(randomId),
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
            editorRef.current?.clearEditor();
        }
    };

    // Custom mention search handler
    const handleMentionSearch = async (
        trigger: string,
        query?: string | null,
    ) => {
        const options = {
            query: query?.toLowerCase() || '',
            limit: 50,
            chat: chatId as string,
        };

        const res = await instance.post(
            `/chat/members/${options?.chat}`,
            options,
        );
        // const data = res.data?.results;
        // Filter out the current user from the results
        const data = res.data?.results
            ?.filter(
                (r: { user: { _id: string | number } }) =>
                    r?.user?._id !== user?._id,
            )
            ?.reduce((acc: any[], curr: { user: { _id: string | number } }) => {
                // Check if this user._id already exists in the accumulated array
                const exists = acc.some(
                    (item) => item?.user?._id === curr?.user?._id,
                );
                // Only add to accumulator if it doesn't exist already
                if (!exists) {
                    acc.push(curr);
                }
                return acc;
            }, []);
        console.log({ MentionedUserAfterFilter: data });
        const mappedData = data?.map(
            (x: {
                user: any;
                id: string | number;
                avatar: string;
                role: string;
            }) => ({
                value: `${x?.user?.firstName} ${x?.user?.lastName}`,
                id: String(x?.user?._id),
                avatar: x?.user?.profilePicture || `/avatar.png`,
                role: `${x?.role}`,
            }),
        );

        const finalMentionData = [
            {
                value: 'everyone',
                id: 'everyone',
                avatar: '/avatar.png',
            },
            ...mappedData,
        ];

        return finalMentionData;
    };
    console.log('Message editor');
    return (
        <>
            {/* Pasted Files Modal */}
            {pestFileModal && (
                <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm'>
                    <div className='bg-background rounded-lg p-6 max-w-md w-full shadow-lg border border-border'>
                        <h3 className='text-lg font-medium mb-4'>
                            Pasted Files
                        </h3>
                        {pestFiles?.length > 0 && (
                            <div className='grid grid-cols-2 gap-3 mb-4'>
                                {pestFiles?.map((item, i) => (
                                    <img
                                        className='w-full h-auto rounded-md object-cover'
                                        src={item || '/placeholder.svg'}
                                        key={i}
                                        alt='Pasted file'
                                    />
                                ))}
                            </div>
                        )}
                        <div className='flex justify-between mt-4'>
                            <button
                                onClick={() => {
                                    setPestFileModal(false);
                                    setPestFiles([]);
                                }}
                                className='flex items-center gap-1.5 text-destructive hover:text-destructive/80 transition-colors px-3 py-1.5 rounded-md hover:bg-destructive/10'
                            >
                                <Trash2 className='h-4 w-4' />
                                Remove
                            </button>
                            <button className='bg-primary text-primary-foreground px-4 py-1.5 rounded-md hover:bg-primary/90 transition-colors'>
                                Send
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className='text-editor-container'>
                {/* Hidden file input */}
                <input
                    type='file'
                    multiple
                    className='hidden'
                    ref={photoVideoInputRef}
                    onChange={handleFileInputChange}
                    accept='image/*,video/*,application/*,audio/*'
                />

                <div className='border-border'>
                    {/* Uploaded files preview */}
                    {uploadFiles.length > 0 && (
                        <div className='mb-2 flex flex-row items-center gap-2 w-full overflow-x-auto pt-2'>
                            {uploadFiles.map((uploadFile, index) => (
                                <FileItem
                                    handleRemove={() =>
                                        handleRemoveItem(uploadFile)
                                    }
                                    file={uploadFile}
                                    index={index}
                                    key={index}
                                />
                            ))}
                        </div>
                    )}

                    {isVoiceRecordVisible ? (
                        <CaptureAudio
                            sendRenderedAudio={sendRenderedAudio}
                            setIsRecorderVisible={() =>
                                setIsVoiceRecordVisible(false)
                            }
                            isSendingAudio={isSendingAudio}
                        />
                    ) : (
                        <div
                            className={`flex items-start bg-background shadow-sm border`}
                        >
                            <div className='w-full h-full'>
                                {/* Editor area */}
                                <div className='flex-1 h-full'>
                                    <ChatEditor
                                        height={
                                            isPopUp
                                                ? '89px'
                                                : isEdit
                                                  ? '250px'
                                                  : '130px'
                                        }
                                        initialMarkdown={text}
                                        onMarkdownChange={handleOnChange}
                                        pluginOptions={pluginOptions}
                                        onMentionSearch={handleMentionSearch}
                                        mentionMenu={MentionMenu}
                                        mentionMenuItem={MentionMenuItem}
                                        placeholder='Type a message...'
                                        editorRef={editorRef}
                                        onKeyDown={handleKeyDown as any}
                                    />
                                </div>

                                {/* Action buttons */}
                                <div
                                    className={`flex items-center justify-between ${isPopUp ? 'px-1' : 'px-2'}`}
                                >
                                    <div className='flex items-center gap-1'>
                                        {!uploadFiles.some((file) =>
                                            file.type?.startsWith('audio/'),
                                        ) &&
                                            !isVoiceRecordVisible &&
                                            !isSendingAudio && (
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger
                                                        asChild
                                                    >
                                                        <Button
                                                            className='bg-transparent hover:bg-transparent text-gray hover:!text-primary-white h-8 w-8 min-h-8 rounded-full shadow-none'
                                                            tooltip='Send attachment'
                                                            size={'icon'}
                                                        >
                                                            <Paperclip className='h-5 w-5' />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent
                                                        side='top'
                                                        align='start'
                                                        className='bg-background z-[1000]'
                                                    >
                                                        <DropdownMenuItem
                                                            className='flex items-center gap-2 cursor-pointer'
                                                            onClick={
                                                                handleMenuItemClick
                                                            }
                                                        >
                                                            <ImageIcon
                                                                size={16}
                                                            />
                                                            Photos & Videos
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            )}

                                        {localText?.length === 0 &&
                                        uploadFiles?.length === 0 ? (
                                            <Button
                                                className='bg-transparent hover:bg-transparent text-gray hover:!text-primary-white h-8 w-8 min-h-8 rounded-full shadow-none'
                                                tooltip='Send voice recording'
                                                size={'icon'}
                                                onClick={() =>
                                                    setIsVoiceRecordVisible(
                                                        true,
                                                    )
                                                }
                                            >
                                                <Mic className='h-5 w-5' />
                                            </Button>
                                        ) : null}
                                    </div>

                                    <button
                                        className={`p-2 rounded-full transition-all ${
                                            !localText &&
                                            uploadFiles?.length === 0
                                                ? 'cursor-not-allowed bg-blue-500/60'
                                                : 'bg-primary'
                                        }`}
                                        disabled={
                                            !localText &&
                                            uploadFiles?.length === 0
                                        }
                                        onClick={sendMessage}
                                    >
                                        <Send className='h-4 w-4 text-pure-white' />
                                    </button>
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
