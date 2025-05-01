'use client';

import { useParams, usePathname, useRouter } from 'next/navigation';
import type React from 'react';
import {
    Suspense,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
    createContext,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import AddUserModal from './AddUserModal';
import Members from './Members';
import ConfirmModal from './ChatForm/ConfirmModal';
import Images from './Images';
import Voices from './Voices';
import Resizer from 'react-image-file-resizer';
import {
    Camera,
    Pencil,
    Trash2,
    ArchiveRestore,
    X,
    Link,
    Users,
    PlusCircle,
    Loader,
    Info,
    Calendar,
    MessageSquare,
    Bot,
    User,
    EditIcon,
    PenLine,
    PencilLine,
    Copy,
    CopyCheck,
    TriangleAlert,
    FileImage,
    Mic,
    Crown,
    ShieldCheck,
    Shield,
    FolderOpenDot,
    SaveIcon,
    Loader2,
    LogOut,
    ChevronRight,
    ChevronLeft,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    removeChat,
    setSelectedChat,
    updateChats,
} from '@/redux/features/chatReducer';
import UpdateChannelModal from './UpdateChannelModal';
import { useAppSelector } from '@/redux/hooks';
import dayjs from 'dayjs';
import GlobalTooltip from '../global/GlobalTooltip';
import { Button } from '../ui/button';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import Files from './Files';
import Links from './Links';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import NotificationOptionModal from './ChatForm/NotificationModal';
import ReportModal from './ChatForm/ReportModal';
import {
    ChatMember,
    useArchiveChannelMutation,
    useGetChatMediaCountsQuery,
    useGetChatMembersQuery,
    useGetChatsQuery,
    useLeaveChannelMutation,
    useUpdateChannelInfoMutation,
    useUploadChannelAvatarMutation,
} from '@/redux/api/chats/chatApi';
import { instance } from '@/lib/axios/axiosInstance';
import { loadChats } from '@/actions/initialActions';

interface ChatInfoProps {
    handleToggleInfo: () => void;
    chatId?: string;
}

// User interface from Members component
interface User {
    _id: string;
    firstName?: string;
    fullName?: string;
    profilePicture?: string;
    lastActive?: string;
}

interface Member {
    _id: string;
    user: User;
    role?: string;
    isBlocked?: boolean;
    isMuted?: boolean;
    muteExpires?: string;
}

// ImageUploader component
const ImageUploader = ({
    onImageUpload,
    isLoading,
    previewImage,
    chat,
}: {
    onImageUpload: (file: File) => void;
    isLoading: boolean;
    previewImage?: string;
    chat?: any;
}) => {
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const { user } = useSelector((state: any) => state.auth);

    // Handle drag events
    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    // Handle drop event
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            if (file.type.match('image.*')) {
                onImageUpload(file);
            } else {
                toast.error('Please upload an image file (JPEG/PNG/JPG)');
            }
        }
    };

    // Handle file input change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            onImageUpload(e.target.files[0]);
        }
    };

    // Handle button click to trigger file input
    const handleClick = () => {
        inputRef.current?.click();
    };

    return chat?.isChannel ? (
        <div className='flex flex-col items-center justify-center w-full'>
            <div
                className={cn(
                    'relative w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden cursor-pointer',
                    'flex flex-col items-center justify-center text-center',
                    'bg-black hover:bg-black/80 transition-all',
                    'border-2 border-dashed border-forground-border',
                    dragActive && 'border-blue-500 bg-black/70',
                )}
                onClick={handleClick}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                {isLoading ? (
                    <div className='absolute inset-0 flex items-center justify-center bg-black/50'>
                        <Loader className='h-6 w-6 text-white animate-spin' />
                    </div>
                ) : (
                    <>
                        {previewImage ? (
                            <>
                                <img
                                    src={previewImage}
                                    alt='Preview'
                                    className='absolute inset-0 w-full h-full object-cover z-0'
                                />
                                <div className=' absolute inset-0 bg-pure-black/50 flex flex-col items-center justify-center z-10'>
                                    <Camera className='h-6 w-6 text-white mb-1' />
                                    <p className='text-white text-xs font-medium'>
                                        <span className='text-white underline'>
                                            Upload
                                        </span>{' '}
                                        <span className='text-white'>or</span>
                                    </p>
                                    <p className='text-white text-xs'>
                                        Drag & drop
                                    </p>
                                </div>
                            </>
                        ) : (
                            <>
                                <Camera className='h-6 w-6 text-white mb-1' />
                                <p className='text-white text-xs font-medium'>
                                    <span className='text-white'>Upload</span>{' '}
                                    <span className='text-white'>or</span>
                                </p>
                                <p className='text-white text-xs'>
                                    Drag & drop
                                </p>
                            </>
                        )}
                    </>
                )}

                <input
                    ref={inputRef}
                    type='file'
                    className='hidden'
                    onChange={handleChange}
                    accept='image/jpeg,image/png,image/jpg'
                    disabled={isLoading}
                />
            </div>
            <p className='mt-2 text-xs text-gray-500'>
                Upload JPEG/PNG/JPG image
            </p>
        </div>
    ) : (
        <div className='w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden'>
            {previewImage ? (
                <img
                    src={previewImage}
                    alt='Preview'
                    className='w-full h-full object-cover'
                />
            ) : (
                <div className='w-full h-full bg-gray-200 flex items-center justify-center'>
                    <User className='h-12 w-12 text-gray-400' />
                </div>
            )}
        </div>
    );
};

// Custom hook to replace Mantine's useDisclosure
const useDisclosure = (
    initialState = false,
): [boolean, { open: () => void; close: () => void; toggle: () => void }] => {
    const [isOpen, setIsOpen] = useState(initialState);

    const open = useCallback(() => setIsOpen(true), []);
    const close = useCallback(() => setIsOpen(false), []);
    const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

    return [isOpen, { open, close, toggle }];
};

const resizeFile = (file: File): Promise<File> =>
    new Promise((resolve) => {
        Resizer.imageFileResizer(
            file,
            700,
            400,
            'JPEG',
            70,
            0,
            (uri: any) => {
                resolve(uri);
            },
            'file',
        );
    });

const ChatInfo: React.FC<ChatInfoProps> = ({ handleToggleInfo, chatId }) => {
    const params = useParams();
    const pathname = usePathname();
    const { chats } = useAppSelector((state) => state.chat);
    const { isLoading: isChatsLoading } = useGetChatsQuery();
    const router = useRouter();
    const dispatch = useDispatch();
    const [copied, setCopied] = useState(false);
    const [chat, setChat] = useState<any>(null);
    const [opened, setOpened] = useState(false);
    const [imageLoading, setImageLoading] = useState(false);
    const [isUpdateVisible, setIsUpdateVisible] = useState(false);
    const [members, setMembers] = useState<ChatMember[]>([]);
    const [ownerMember, setOwnerMember] = useState<ChatMember | null>(null);
    const { user } = useSelector((s: any) => s.auth);
    const [isUpdating, setIsUpdating] = useState(false);
    const [updateField, setUpdateField] = useState('');
    const descriptionEditRef = useRef(null);
    const [isDescriptionEditing, setIsDescriptionEditing] = useState(false);
    const [descriptionValue, setDescriptionValue] = useState('');
    const [notificationOption, setNotificationOption] = useState({
        isVisible: false,
    });
    const [archivedConfirmOpened, setArchivedConfirmOpened] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [mediaCount, setMediaCount] = useState(0);
    const [imagesCount, setImagesCount] = useState(0);
    const [voiceCount, setVoiceCount] = useState(0);
    const [fileCount, setFileCount] = useState(0);
    const [linksCount, setLinksCount] = useState(0);

    console.log({ chat });
    // Add this useEffect to fetch all media counts when the component loads
    useEffect(() => {
        if (chat?._id) {
            // Fetch image count
            instance
                .get(`/chat/media/${chat._id}?type=image&limit=1`)
                .then((res) => {
                    setImagesCount(res.data.totalCount || 0);
                })
                .catch((err) =>
                    console.error('Error fetching image count:', err),
                );

            // Fetch voice count
            instance
                .get(`/chat/media/${chat._id}?type=voice&limit=1`)
                .then((res) => {
                    setVoiceCount(res.data.totalCount || 0);
                })
                .catch((err) =>
                    console.error('Error fetching voice count:', err),
                );

            // Fetch file count
            instance
                .get(`/chat/media/${chat._id}?type=file&limit=1`)
                .then((res) => {
                    setFileCount(res.data.totalCount || 0);
                })
                .catch((err) =>
                    console.error('Error fetching file count:', err),
                );

            // Fetch link count
            instance
                .get(`/chat/media/${chat._id}?type=link&limit=1`)
                .then((res) => {
                    setLinksCount(res.data.totalCount || 0);
                })
                .catch((err) =>
                    console.error('Error fetching link count:', err),
                );
        }
    }, [chat?._id]);

    const handleReport = async (reason: string, details?: string) => {
        setIsSubmitting(true);

        try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1000));
            toast.success('Report feature is coming soon!');
            setIsReportModalOpen(false);
        } catch (error) {
            toast.error('Failed to submit report');
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        if (chat?.description) {
            setDescriptionValue(chat.description);
        }
    }, [chat?.description]);

    const { data: membersData, isLoading: loadingMembers } =
        useGetChatMembersQuery(
            { chatId: chat?._id || '', limit: 50 },
            { skip: !chat?._id },
        );

    useEffect(() => {
        if (membersData?.results) {
            setMembers(membersData.results);
            // Find owner among members
            const owner = membersData.results.find((m) => m.role === 'owner');
            if (owner) {
                setOwnerMember(owner);
            }
        }
    }, [membersData]);

    const { data: mediaCounts } = useGetChatMediaCountsQuery(chat?._id || '', {
        skip: !chat?._id,
    });
    useEffect(() => {
        if (mediaCounts) {
            setImagesCount(mediaCounts.imagesCount || 0);
            setVoiceCount(mediaCounts.voiceCount || 0);
            setFileCount(mediaCounts.fileCount || 0);
            setLinksCount(mediaCounts.linksCount || 0);
        }
    }, [mediaCounts]);

    useEffect(() => {
        if (chats && chats.length > 0) {
            // Prioritize the direct prop chatId if it exists
            if (chatId) {
                const findChat = chats.find((c) => c?._id === chatId);
                setChat(findChat || null);
            }
            // Otherwise use the URL parameter
            else if (params.chatid) {
                const findChat = chats.find((c) => c?._id === params.chatid);
                setChat(findChat || null);
            }
        }
    }, [chats, chatId, params.chatid]);

    const isWoner = chat?.myData?.role === 'owner';

    const handleNoti = useCallback(() => {
        setNotificationOption({ isVisible: true });
    }, []);
    const closeNotificationModal = useCallback(() => {
        setNotificationOption({ isVisible: false });
    }, []);
    const handleCopy = useCallback(() => {
        const newPathname = pathname.replace('/chat/', '/channel-invitation/');
        navigator.clipboard
            .writeText(`${process.env.NEXT_PUBLIC_CLIENT_URL}${newPathname}`)
            .then(() => {
                setCopied(true);
                setTimeout(() => {
                    setCopied(false);
                }, 3000);
                toast.success('Invitation link copied to clipboard');
            })
            .catch((err) => {
                toast.error(err?.message || 'Failed to copy link');
            });
    }, [pathname]);

    const [uploadAvatar] = useUploadChannelAvatarMutation();
    const [updateChannel] = useUpdateChannelInfoMutation();

    const handleUploadImage = useCallback(
        async (image: File) => {
            if (image && chat?._id) {
                try {
                    setImageLoading(true);
                    const newFile = await resizeFile(image);
                    const formData = new FormData();
                    formData.append('file', newFile);

                    const response = await instance.post(
                        '/chat/file',
                        formData,
                        {
                            headers: {
                                'Content-Type': 'multipart/form-data',
                            },
                        },
                    );
                    const url = response?.data?.file?.location;

                    await updateChannel({
                        chatId: chat._id,
                        data: { avatar: url },
                    }).unwrap();

                    // Update local state with new avatar
                    setChat((prev: any) => ({
                        ...prev,
                        avatar: url,
                    }));

                    toast.success('Channel image updated successfully');
                } catch (error: any) {
                    console.error(error);
                    toast.error(
                        error?.response?.data?.error || 'Error uploading image',
                    );
                } finally {
                    setImageLoading(false);
                }
            }
        },
        [chat, updateChannel],
    );

    // Replace handleArchive with this:
    const [archiveChannel] = useArchiveChannelMutation();

    const handleArchive = useCallback(() => {
        // if(user?.role !== 'admin' || user?.role !== 'owner') {
        //     toast.error('You do not have permission to archive this channel');
        //     return;
        // }
        if (chat?._id) {
            archiveChannel({
                chatId: chat._id,
                isArchived: !chat.isArchived,
            })
                .unwrap()
                .then(() => {
                    dispatch(
                        setSelectedChat({
                            ...chat,
                            isArchived: !chat.isArchived,
                        }),
                    );
                    dispatch(loadChats() as any);

                    setArchivedConfirmOpened(false);
                    toast.success(
                        `The group has been successfully ${chat.isArchived ? 'retrieved' : 'archived'}.`,
                    );
                })
                .catch((error) => {
                    console.error(error);
                    setArchivedConfirmOpened(false);
                    toast.error(error?.data?.error || 'Error archiving group');
                });
        }
    }, [chat, archiveChannel]);

    // Replace handleLeave with this:
    const [leaveChannel] = useLeaveChannelMutation();

    const handleLeave = useCallback(() => {
        if (chat?._id) {
            leaveChannel(chat._id)
                .unwrap()
                .then(() => {
                    dispatch(removeChat(chat._id));
                    router.push('/chat');
                    dispatch(loadChats() as any);
                })
                .catch((err) => {
                    toast.error(err?.data?.error || 'Error leaving group');
                });
        }
    }, [chat, leaveChannel, dispatch, router]);

    const handleInlineUpdate = useCallback(
        (value: any, field: any) => {
            // Add validation for name field to prevent empty values
            if (field === 'name' && (!value || value.trim() === '')) {
                toast.error('Crowd name cannot be empty');
                return;
            }
            if (chat?._id) {
                setIsUpdating(true);
                setUpdateField(field);

                updateChannel({
                    chatId: chat._id,
                    data: { [field]: value },
                })
                    .unwrap()
                    .then((response) => {
                        setChat((prev: any) => ({ ...prev, [field]: value }));

                        // Better success messages based on field and value
                        if (field === 'isPublic') {
                            toast.success(
                                `Crowd type updated to ${value ? 'Public' : 'Private'}`,
                            );
                        } else if (field === 'isReadOnly') {
                            toast.success(
                                `Read-only mode ${value ? 'enabled' : 'disabled'}`,
                            );
                        } else if (field === 'name') {
                            toast.success('Crowd name updated successfully');
                        } else if (field === 'description') {
                            toast.success(
                                'Crowd description updated successfully',
                            );
                        } else {
                            toast.success(
                                `${field.charAt(0).toUpperCase() + field.slice(1)} updated successfully`,
                            );
                        }
                    })
                    .catch((err) => {
                        toast.error(
                            err?.data?.error || `Failed to update ${field}`,
                        );
                    })
                    .finally(() => {
                        setIsUpdating(false);
                        setUpdateField('');
                    });
            }
        },
        [chat, updateChannel],
    );
    // Update the description section in ChatInfo component

    // First, modify the InlineTextEdit component to support the new layout:
    const InlineTextEdit = ({
        value,
        onSave,
        placeholder = '',
        multiline = false,
        isLoading = false,
        fieldName = '',
        hideEditButton = false,
        innerRef = null,
        showButtonsInHeader = false,
    }: {
        value: any;
        onSave: any;
        placeholder: string;
        multiline?: boolean;
        isLoading: boolean;
        fieldName: string;
        hideEditButton?: boolean;
        innerRef?: any | null;
        showButtonsInHeader?: boolean;
    }) => {
        const [isEditing, setIsEditing] = useState(false);
        const [inputValue, setInputValue] = useState(value);
        const inputRef: any = useRef(null);

        useEffect(() => {
            if (isEditing && inputRef.current) {
                inputRef.current.focus();
            }
        }, [isEditing]);

        useEffect(() => {
            setInputValue(value);
        }, [value]);

        // If innerRef is provided, expose the setIsEditing method and state
        useEffect(() => {
            if (innerRef) {
                innerRef.current = {
                    startEditing: () => setIsEditing(true),
                    isEditing: isEditing,
                    handleSave,
                    handleCancel,
                };
            }
        }, [innerRef, isEditing]);

        const handleSave = () => {
            onSave(inputValue, fieldName);
            setIsEditing(false);
        };

        const handleCancel = () => {
            setInputValue(value);
            setIsEditing(false);
        };

        const handleKeyDown = (e: any) => {
            if (e.key === 'Escape') {
                handleCancel();
            } else if (e.key === 'Enter' && !multiline) {
                handleSave();
            }
        };

        // Only render the input and not the buttons when showButtonsInHeader is true
        return isEditing ? (
            <div className='w-full flex flex-row items-center gap-1'>
                {multiline ? (
                    <Textarea
                        ref={inputRef}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        className='min-h-[100px] bg-background w-full'
                        disabled={isLoading}
                    />
                ) : (
                    <Input
                        ref={inputRef}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        className='w-full h-7'
                        disabled={isLoading}
                    />
                )}
                {!showButtonsInHeader && (
                    <div className='flex gap-1 justify-end'>
                        <Button
                            tooltip='Update'
                            size='icon'
                            variant={'primary_light'}
                            onClick={handleSave}
                            className='h-7 w-7'
                            icon={
                                isLoading ? (
                                    <Loader2
                                        size={16}
                                        className='animate-spin'
                                    />
                                ) : (
                                    <SaveIcon size={16} />
                                )
                            }
                            disabled={isLoading}
                        />
                        <Button
                            tooltip='Cancel Update'
                            size='icon'
                            onClick={handleCancel}
                            disabled={isLoading}
                            className='bg-red-500/10 h-7 w-7'
                            icon={<X size={16} className='text-danger' />}
                        />
                    </div>
                )}
            </div>
        ) : (
            <>
                {value || placeholder}
                {!hideEditButton && (
                    <button onClick={() => setIsEditing(true)} className='ml-2'>
                        <PencilLine size={16} />
                    </button>
                )}
            </>
        );
    };
    // Modified InlineSelectEdit component
    // Create a context to manage open select dropdowns

    const SelectContext = createContext({
        openSelectId: null,
        setOpenSelectId: (id: any) => {},
    });

    // Provider component to wrap around areas that contain select dropdowns
    // This should be added near the beginning of your ChatInfo component
    const SelectProvider = ({ children }: { children: any }) => {
        const [openSelectId, setOpenSelectId] = useState(null);
        return (
            <SelectContext.Provider value={{ openSelectId, setOpenSelectId }}>
                {children}
            </SelectContext.Provider>
        );
    };

    // Modified InlineSelectEdit component
    const InlineSelectEdit = ({
        value,
        options,
        onSave,
        isLoading = false,
        fieldName = '',
    }: {
        value?: any;
        options?: any[];
        onSave?: any;
        isLoading?: boolean;
        fieldName?: string;
    }) => {
        const [isEditing, setIsEditing] = useState(false);
        const [selectedValue, setSelectedValue] = useState(String(value));
        const [isOpen, setIsOpen] = useState(false);
        const selectId = useRef(
            `select-${fieldName}-${Math.random().toString(36).substring(2, 9)}`,
        ).current;

        // Get context values to track which select is open
        const { openSelectId, setOpenSelectId } = useContext(SelectContext);

        useEffect(() => {
            setSelectedValue(String(value));
        }, [value]);

        // When another select opens, close this one if it's open
        useEffect(() => {
            if (openSelectId && openSelectId !== selectId && isOpen) {
                setIsOpen(false);
            }
        }, [openSelectId, selectId, isOpen]);

        const handleSave = () => {
            // Convert string "true"/"false" to boolean if needed
            const finalValue =
                selectedValue === 'true'
                    ? true
                    : selectedValue === 'false'
                      ? false
                      : selectedValue;

            onSave(finalValue, fieldName);
            setIsEditing(false);
        };

        const handleCancel = () => {
            setSelectedValue(String(value));
            setIsEditing(false);
        };

        const handleOpenChange = (open: boolean) => {
            setIsOpen(open);
            if (open) {
                setOpenSelectId(selectId);
            } else if (openSelectId === selectId) {
                setOpenSelectId(null);
            }
        };

        return isEditing ? (
            <div className='flex flex-row gap-1'>
                <Select
                    value={selectedValue}
                    onValueChange={setSelectedValue}
                    disabled={isLoading}
                    id={selectId as string}
                    open={isOpen}
                    onOpenChange={handleOpenChange}
                >
                    <SelectTrigger className='w-full h-7'>
                        <SelectValue placeholder='Select option' />
                    </SelectTrigger>
                    <SelectContent
                        className='bg-background z-50'
                        position='popper'
                        sideOffset={5}
                    >
                        {options?.map((option: any) => (
                            <SelectItem
                                key={`${selectId}-${option.value}`}
                                value={option.value}
                                className='hover:bg-primary-light hover:text-primary-white border border-transparent hover:border-primary-white focus:bg-primary-light focus:text-primary-white'
                            >
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <div className='flex gap-1'>
                    <Button
                        tooltip='Update'
                        size='icon'
                        variant={'primary_light'}
                        icon={
                            isLoading ? (
                                <Loader2 size={16} className='animate-spin' />
                            ) : (
                                <SaveIcon size={16} />
                            )
                        }
                        onClick={handleSave}
                        disabled={isLoading}
                        className='h-7 max-h-7 w-7 max-w-7'
                    ></Button>
                    <Button
                        tooltip='Cancel Update'
                        size='icon'
                        className='bg-red-500/10 h-7 max-h-7 w-7 max-w-7'
                        icon={<X size={16} className='text-danger' />}
                        onClick={handleCancel}
                        disabled={isLoading}
                    ></Button>
                </div>
            </div>
        ) : (
            <>
                {options?.find((o) => String(o.value) === String(value))
                    ?.label || value}
                <button onClick={() => setIsEditing(true)} className='ml-2'>
                    <PencilLine size={16} />
                </button>
            </>
        );
    };
    const [
        leaveConfirmOpened,
        { open: leaveConfirmOpen, close: leaveConfirmClose },
    ] = useDisclosure(false);

    const handleLeaveOpen = useCallback(() => {
        leaveConfirmOpen();
    }, [leaveConfirmOpen]);

    const handleCancel = useCallback(() => {
        setOpened(false);
    }, []);

    const formatDate = (dateString?: string) => {
        if (!dateString) {
            return 'N/A';
        }
        return dayjs(dateString).format('MMM D, YYYY');
    };

    // Function to render role icon
    const getRoleIcon = (role?: string) => {
        switch (role) {
            case 'owner':
                return <Crown className='h-4 w-4 text-amber-500 mr-1' />;
            case 'admin':
                return <ShieldCheck className='h-4 w-4 text-blue-600 mr-1' />;
            case 'moderator':
                return <Shield className='h-4 w-4 text-blue-500 mr-1' />;
            default:
                return null;
        }
    };

    // Function to get role display name
    const getRoleName = (role?: string) => {
        switch (role) {
            case 'owner':
                return 'Crowd Owner';
            case 'admin':
                return 'Crowd Admin';
            case 'moderator':
                return 'Crowd Moderator';
            default:
                return 'Member';
        }
    };

    return (
        <>
            <div className='flex flex-col h-full border-l border bg-foreground shadow-xl'>
                <div className='flex items-center justify-between p-2 border-b border'>
                    <h1 className='text-xl font-semibold text-dark-gray'>
                        Chat Info
                    </h1>
                </div>
                <div className='flex-1 overflow-y-auto p-2 space-y-6'>
                    <div className=''>
                        {chat && (
                            <Tabs defaultValue='about'>
                                <TabsList className='w-full h-10 bg-background overflow-x-auto flex relative'>
                                    <Button
                                        variant='ghost'
                                        size='icon'
                                        className='absolute left-0 z-10 h-full bg-gradient-to-r from-background to-transparent'
                                        onClick={() => {
                                            const tabList =
                                                document.querySelector(
                                                    '.tabs-list',
                                                );
                                            if (tabList) {
                                                tabList.scrollBy({
                                                    left: -100,
                                                    behavior: 'smooth',
                                                });
                                            }
                                        }}
                                    >
                                        <ChevronLeft className='h-4 w-4' />
                                    </Button>

                                    <div className='tabs-list overflow-x-auto flex-1 flex items-center no-scrollbar scroll-smooth px-6 scrollbar-hidden'>
                                        <TabsTrigger
                                            value='about'
                                            className='flex-1 !bg-transparent shadow-none rounded-none border-b-2 border-b-border data-[state=active]:border-b-blue-600 data-[state=active]:shadow-none data-[state=active]:text-blue-600'
                                        >
                                            <Info size={16} className='mr-1' />
                                            About
                                        </TabsTrigger>
                                        {chat?.isChannel && (
                                            <TabsTrigger
                                                value='members'
                                                className='flex-1 !bg-transparent shadow-none rounded-none border-b-2 border-b-border data-[state=active]:border-b-blue-600 data-[state=active]:shadow-none data-[state=active]:text-blue-600'
                                            >
                                                <Users
                                                    size={16}
                                                    className='mr-1'
                                                />
                                                Members (
                                                {chat?.membersCount || 0})
                                                {/* Members */}
                                            </TabsTrigger>
                                        )}
                                        <TabsTrigger
                                            value='images'
                                            className='flex-1 !bg-transparent shadow-none rounded-none border-b-2 border-b-border data-[state=active]:border-b-blue-600 data-[state=active]:shadow-none data-[state=active]:text-blue-600'
                                        >
                                            <FileImage
                                                size={16}
                                                className='mr-1'
                                            />
                                            Images ({imagesCount || 0})
                                            {/* Images */}
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value='voice'
                                            className='flex-1 !bg-transparent shadow-none rounded-none border-b-2 border-b-border data-[state=active]:border-b-blue-600 data-[state=active]:shadow-none data-[state=active]:text-blue-600'
                                        >
                                            <Mic size={16} className='mr-1' />
                                            Voice ({voiceCount || 0})
                                            {/* Voice */}
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value='file'
                                            className='flex-1 !bg-transparent shadow-none rounded-none border-b-2 border-b-border data-[state=active]:border-b-blue-600 data-[state=active]:shadow-none data-[state=active]:text-blue-600'
                                        >
                                            <FolderOpenDot
                                                size={16}
                                                className='mr-1'
                                            />
                                            Files ({fileCount || 0})
                                            {/* Files */}
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value='link'
                                            className='flex-1 !bg-transparent shadow-none rounded-none border-b-2 border-b-border data-[state=active]:border-b-blue-600 data-[state=active]:shadow-none data-[state=active]:text-blue-600'
                                        >
                                            <FolderOpenDot
                                                size={16}
                                                className='mr-1'
                                            />
                                            Links ({linksCount || 0})
                                            {/* Links */}
                                        </TabsTrigger>
                                    </div>
                                    <Button
                                        variant='ghost'
                                        size='icon'
                                        className='absolute right-0 z-10 h-full bg-gradient-to-l from-background to-transparent'
                                        onClick={() => {
                                            const tabList =
                                                document.querySelector(
                                                    '.tabs-list',
                                                );
                                            if (tabList) {
                                                tabList.scrollBy({
                                                    left: 100,
                                                    behavior: 'smooth',
                                                });
                                            }
                                        }}
                                    >
                                        <ChevronRight className='h-4 w-4' />
                                    </Button>
                                </TabsList>

                                {/* About Tab Content */}
                                <TabsContent
                                    value='about'
                                    className='mt-4 space-y-6'
                                >
                                    <div className='flex flex-col gap-2 items-center'>
                                        <div className='relative'>
                                            {chat?.isChannel &&
                                            ['owner', 'admin'].includes(
                                                chat?.myData?.role,
                                            ) ? (
                                                <ImageUploader
                                                    chat={chat}
                                                    onImageUpload={
                                                        handleUploadImage
                                                    }
                                                    isLoading={imageLoading}
                                                    previewImage={
                                                        chat?.isChannel
                                                            ? chat?.avatar ||
                                                              '/chat/group.png'
                                                            : chat?.otherUser
                                                                    ?.type ===
                                                                'bot'
                                                              ? '/ai_bot.png'
                                                              : chat?.otherUser
                                                                    ?.profilePicture ||
                                                                '/chat/user.png'
                                                    }
                                                />
                                            ) : (
                                                <div className='w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-2 border-primary'>
                                                    <img
                                                        src={
                                                            chat?.isChannel
                                                                ? chat?.avatar ||
                                                                  '/chat/group.png'
                                                                : chat
                                                                        ?.otherUser
                                                                        ?.type ===
                                                                    'bot'
                                                                  ? '/ai_bot.png'
                                                                  : chat
                                                                        ?.otherUser
                                                                        ?.profilePicture ||
                                                                    '/chat/user.png'
                                                        }
                                                        alt='Chat avatar'
                                                        className='w-full h-full object-cover'
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        <div className='name_section flex flex-row gap-3 justify-between w-full pb-2 border-b'>
                                            <div className='left max-w-[100%-162px] flex flex-col gap-1'>
                                                <p className='text-xl font-semibold '>
                                                    <div className='name flex flex-row items-center gap-1 text-black'>
                                                        {chat?.isChannel ? (
                                                            <Users size={20} />
                                                        ) : chat?.otherUser
                                                              ?.type ===
                                                          'bot' ? (
                                                            <Bot size={20} />
                                                        ) : (
                                                            <User size={20} />
                                                        )}

                                                        {chat?.isChannel &&
                                                        [
                                                            'owner',
                                                            'admin',
                                                        ].includes(
                                                            chat?.myData?.role,
                                                        ) ? (
                                                            <InlineTextEdit
                                                                value={
                                                                    chat?.name
                                                                }
                                                                onSave={
                                                                    handleInlineUpdate
                                                                }
                                                                placeholder='Enter channel name'
                                                                isLoading={
                                                                    isUpdating &&
                                                                    updateField ===
                                                                        'name'
                                                                }
                                                                fieldName='name'
                                                            />
                                                        ) : chat?.isChannel ? (
                                                            chat?.name
                                                        ) : (
                                                            chat?.otherUser
                                                                ?.fullName
                                                        )}
                                                    </div>
                                                </p>
                                                <div className='text-xs text-gray flex-flex-row items-center gap-1'>
                                                    {' '}
                                                    {chat?.isChannel && (
                                                        <div className='flex items-center justify-between'>
                                                            <div className='flex items-center gap-1 text-gray'>
                                                                <svg
                                                                    width='16'
                                                                    height='16'
                                                                    viewBox='0 0 16 16'
                                                                    fill='none'
                                                                    xmlns='http://www.w3.org/2000/svg'
                                                                >
                                                                    <path
                                                                        d='M11.9997 4.77301C11.9597 4.76634 11.9131 4.76634 11.8731 4.77301C10.9531 4.73968 10.2197 3.98634 10.2197 3.05301C10.2197 2.09968 10.9864 1.33301 11.9397 1.33301C12.8931 1.33301 13.6597 2.10634 13.6597 3.05301C13.6531 3.98634 12.9197 4.73968 11.9997 4.77301Z'
                                                                        stroke='#5C5958'
                                                                        strokeWidth='1.5'
                                                                        strokeLinecap='round'
                                                                        strokeLinejoin='round'
                                                                    />
                                                                    <path
                                                                        d='M11.313 9.62645C12.2263 9.77978 13.233 9.61978 13.9396 9.14645C14.8796 8.51978 14.8796 7.49312 13.9396 6.86645C13.2263 6.39312 12.2063 6.23311 11.293 6.39311'
                                                                        stroke='#5C5958'
                                                                        strokeWidth='1.5'
                                                                        strokeLinecap='round'
                                                                        strokeLinejoin='round'
                                                                    />
                                                                    <path
                                                                        d='M3.98031 4.77301C4.02031 4.76634 4.06698 4.76634 4.10698 4.77301C5.02698 4.73968 5.76031 3.98634 5.76031 3.05301C5.76031 2.09968 4.99365 1.33301 4.04031 1.33301C3.08698 1.33301 2.32031 2.10634 2.32031 3.05301C2.32698 3.98634 3.06031 4.73968 3.98031 4.77301Z'
                                                                        stroke='#5C5958'
                                                                        strokeWidth='1.5'
                                                                        strokeLinecap='round'
                                                                        strokeLinejoin='round'
                                                                    />
                                                                    <path
                                                                        d='M4.66663 9.62645C3.75329 9.77978 2.74663 9.61978 2.03996 9.14645C1.09996 8.51978 1.09996 7.49312 2.03996 6.86645C2.75329 6.39312 3.77329 6.23311 4.68663 6.39311'
                                                                        stroke='#5C5958'
                                                                        strokeWidth='1.5'
                                                                        strokeLinecap='round'
                                                                        strokeLinejoin='round'
                                                                    />
                                                                    <path
                                                                        d='M8.0007 9.75348C7.9607 9.74681 7.91404 9.74681 7.87404 9.75348C6.95404 9.72015 6.2207 8.96681 6.2207 8.03348C6.2207 7.08014 6.98737 6.31348 7.9407 6.31348C8.89403 6.31348 9.6607 7.08681 9.6607 8.03348C9.65404 8.96681 8.9207 9.72681 8.0007 9.75348Z'
                                                                        stroke='#5C5958'
                                                                        strokeWidth='1.5'
                                                                        strokeLinecap='round'
                                                                        strokeLinejoin='round'
                                                                    />
                                                                    <path
                                                                        d='M6.06047 11.8532C5.12047 12.4799 5.12047 13.5066 6.06047 14.1332C7.12714 14.8466 8.8738 14.8466 9.94047 14.1332C10.8805 13.5066 10.8805 12.4799 9.94047 11.8532C8.88047 11.1466 7.12714 11.1466 6.06047 11.8532Z'
                                                                        stroke='#5C5958'
                                                                        strokeWidth='1.5'
                                                                        strokeLinecap='round'
                                                                        strokeLinejoin='round'
                                                                    />
                                                                </svg>

                                                                <p className='flex flex-row gap-1'>
                                                                    Crowd
                                                                    Members -
                                                                    <span>
                                                                        {chat?.membersCount ||
                                                                            0}{' '}
                                                                    </span>
                                                                </p>
                                                                <GlobalTooltip tooltip='Add member'>
                                                                    <button
                                                                        onClick={() =>
                                                                            setOpened(
                                                                                true,
                                                                            )
                                                                        }
                                                                    >
                                                                        <PlusCircle className='h-4 w-4 ml-2' />
                                                                    </button>
                                                                </GlobalTooltip>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className='right'>
                                                <Button
                                                    variant={'primary_light'}
                                                    className='!p-2'
                                                    onClick={() => handleNoti()}
                                                >
                                                    Mute Notification
                                                </Button>
                                            </div>
                                        </div>
                                        <div className='admin_Date w-full type_readonly grid grid-cols-2 gap-2 '>
                                            {chat?.isChannel && (
                                                <div className='user flex flex-row items-center gap-1'>
                                                    {loadingMembers ? (
                                                        <div className='h-9 w-9 rounded-full bg-gray-200 animate-pulse'></div>
                                                    ) : (
                                                        <img
                                                            alt='owner avatar'
                                                            src={
                                                                ownerMember
                                                                    ?.user
                                                                    ?.profilePicture ||
                                                                '/avatar.png'
                                                            }
                                                            height={34}
                                                            width={34}
                                                            className='rounded-full object-cover h-9 w-9'
                                                        />
                                                    )}
                                                    <div className='info flex flex-col'>
                                                        <div
                                                            className='name text-[14px] text-dark-gray font-semibold flex items-center'
                                                            style={{
                                                                lineHeight: 1.1,
                                                            }}
                                                        >
                                                            {loadingMembers ? (
                                                                <div className='h-4 w-24 bg-gray-200 rounded animate-pulse'></div>
                                                            ) : (
                                                                <>
                                                                    {getRoleIcon(
                                                                        ownerMember?.role,
                                                                    )}
                                                                    {ownerMember
                                                                        ?.user
                                                                        ?.fullName ||
                                                                        'Owner not found'}
                                                                </>
                                                            )}
                                                        </div>
                                                        <div
                                                            className='role text-xs text-gray'
                                                            style={{
                                                                lineHeight: 1.1,
                                                            }}
                                                        >
                                                            {loadingMembers ? (
                                                                <div className='h-3 w-16 bg-gray-200 rounded animate-pulse mt-1'></div>
                                                            ) : (
                                                                getRoleName(
                                                                    ownerMember?.role,
                                                                )
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            <div className='flex items-center text-gray'>
                                                {chat?.isChannel ? (
                                                    <Calendar className='h-4 w-4 mr-1' />
                                                ) : (
                                                    <p className='text-dark-gray font-semibold mr-2'>
                                                        Joined at:
                                                    </p>
                                                )}
                                                <span>
                                                    {dayjs(
                                                        chat?.createdAt,
                                                    ).format(
                                                        'MMM DD, YYYY',
                                                    )}{' '}
                                                    |{' '}
                                                    {dayjs(
                                                        chat?.createdAt,
                                                    ).format('hh:mm A')}
                                                </span>
                                            </div>
                                        </div>
                                        {chat?.otherUser?.type && (
                                            <div className='flex items-center text-gray w-full'>
                                                <p className='text-dark-gray font-semibold mr-2'>
                                                    User type:
                                                </p>

                                                <span className='capitalize'>
                                                    {chat?.otherUser?.type}
                                                </span>
                                            </div>
                                        )}
                                        {chat?.isChannel && (
                                            // In your ChatInfo component, around the area with the Type and Read Only fields
                                            <SelectProvider>
                                                <div className='type_readonly grid grid-cols-2 gap-2 w-full'>
                                                    <div className='type flex flex-row items-center gap-2 text-start text-dark-gray text-sm font-semibold '>
                                                        Type:{' '}
                                                        {chat?.isChannel &&
                                                        [
                                                            'owner',
                                                            'admin',
                                                        ].includes(
                                                            chat?.myData?.role,
                                                        ) ? (
                                                            <InlineSelectEdit
                                                                value={
                                                                    chat?.isPublic
                                                                }
                                                                options={[
                                                                    {
                                                                        value: 'true',
                                                                        label: 'Public',
                                                                    },
                                                                    {
                                                                        value: 'false',
                                                                        label: 'Private',
                                                                    },
                                                                ]}
                                                                onSave={
                                                                    handleInlineUpdate
                                                                }
                                                                isLoading={
                                                                    isUpdating &&
                                                                    updateField ===
                                                                        'isPublic'
                                                                }
                                                                fieldName='isPublic'
                                                            />
                                                        ) : (
                                                            <p className='text-gray font-normal'>
                                                                {chat?.isPublic
                                                                    ? 'Public'
                                                                    : 'Private'}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className='readonly flex flex-row items-center gap-2 text-start text-dark-gray text-sm font-semibold '>
                                                        Read Only:{' '}
                                                        {chat?.isChannel &&
                                                        [
                                                            'owner',
                                                            'admin',
                                                        ].includes(
                                                            chat?.myData?.role,
                                                        ) ? (
                                                            <InlineSelectEdit
                                                                value={
                                                                    chat?.isReadOnly
                                                                }
                                                                options={[
                                                                    {
                                                                        value: 'true',
                                                                        label: 'Yes',
                                                                    },
                                                                    {
                                                                        value: 'false',
                                                                        label: 'No',
                                                                    },
                                                                ]}
                                                                onSave={
                                                                    handleInlineUpdate
                                                                }
                                                                isLoading={
                                                                    isUpdating &&
                                                                    updateField ===
                                                                        'isReadOnly'
                                                                }
                                                                fieldName='isReadOnly'
                                                            />
                                                        ) : (
                                                            <p className='text-gray font-normal'>
                                                                {chat?.isReadOnly
                                                                    ? 'Yes'
                                                                    : 'No'}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </SelectProvider>
                                        )}
                                        {chat?.isChannel && (
                                            <div className='description flex flex-col gap-1 bg-background border rounded-md p-2 w-full'>
                                                <div className='flex flex-row items-center justify-between'>
                                                    <p className='text-sm text-dark-gray font-semibold'>
                                                        Description
                                                    </p>
                                                    {chat?.isChannel &&
                                                        [
                                                            'owner',
                                                            'admin',
                                                        ].includes(
                                                            chat?.myData?.role,
                                                        ) &&
                                                        (isDescriptionEditing ? (
                                                            // Show save/cancel buttons when in edit mode
                                                            <div className='flex gap-1'>
                                                                <Button
                                                                    tooltip='Update'
                                                                    size='icon'
                                                                    variant={
                                                                        'primary_light'
                                                                    }
                                                                    onClick={() => {
                                                                        handleInlineUpdate(
                                                                            descriptionValue,
                                                                            'description',
                                                                        );
                                                                        setIsDescriptionEditing(
                                                                            false,
                                                                        );
                                                                    }}
                                                                    className='h-7 w-7'
                                                                    icon={
                                                                        isUpdating &&
                                                                        updateField ===
                                                                            'description' ? (
                                                                            <Loader2
                                                                                size={
                                                                                    16
                                                                                }
                                                                                className='animate-spin'
                                                                            />
                                                                        ) : (
                                                                            <SaveIcon
                                                                                size={
                                                                                    16
                                                                                }
                                                                            />
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        isUpdating &&
                                                                        updateField ===
                                                                            'description'
                                                                    }
                                                                />
                                                                <Button
                                                                    tooltip='Cancel Update'
                                                                    size='icon'
                                                                    onClick={() => {
                                                                        setDescriptionValue(
                                                                            chat?.description ||
                                                                                '',
                                                                        );
                                                                        setIsDescriptionEditing(
                                                                            false,
                                                                        );
                                                                    }}
                                                                    disabled={
                                                                        isUpdating &&
                                                                        updateField ===
                                                                            'description'
                                                                    }
                                                                    className='bg-red-500/10 h-7 w-7'
                                                                    icon={
                                                                        <X
                                                                            size={
                                                                                16
                                                                            }
                                                                            className='text-danger'
                                                                        />
                                                                    }
                                                                />
                                                            </div>
                                                        ) : (
                                                            // Show edit button when not in edit mode
                                                            <button
                                                                onClick={() =>
                                                                    setIsDescriptionEditing(
                                                                        true,
                                                                    )
                                                                }
                                                                className='ml-2'
                                                            >
                                                                <PencilLine
                                                                    size={16}
                                                                />
                                                            </button>
                                                        ))}
                                                </div>

                                                {chat?.isChannel &&
                                                ['owner', 'admin'].includes(
                                                    chat?.myData?.role,
                                                ) ? (
                                                    isDescriptionEditing ? (
                                                        <Textarea
                                                            value={
                                                                descriptionValue
                                                            }
                                                            onChange={(e) =>
                                                                setDescriptionValue(
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            placeholder='Add crowd description...'
                                                            className='min-h-[100px] bg-background w-full'
                                                            disabled={
                                                                isUpdating &&
                                                                updateField ===
                                                                    'description'
                                                            }
                                                        />
                                                    ) : (
                                                        <p className='text-sm text-gray'>
                                                            {chat?.description ||
                                                                'No description added yet...'}
                                                        </p>
                                                    )
                                                ) : (
                                                    <p className='text-sm text-gray'>
                                                        {chat?.isChannel
                                                            ? chat?.description ||
                                                              'No description added yet...'
                                                            : ''}
                                                    </p>
                                                )}

                                                {/* User details for direct messages */}
                                                {!chat?.isChannel &&
                                                    chat?.otherUser && (
                                                        <div className='space-y-2 border-t border p-2 rounded-lg bg-foreground'>
                                                            <h2 className='font-medium text-gray text-xs'>
                                                                About{' '}
                                                                {
                                                                    chat
                                                                        ?.otherUser
                                                                        ?.fullName
                                                                }
                                                            </h2>
                                                            <p className='text-xs text-gray'>
                                                                {chat?.otherUser
                                                                    ?.bio ||
                                                                    'No bio available.'}
                                                            </p>
                                                        </div>
                                                    )}
                                            </div>
                                        )}
                                        {chat?.isChannel && (
                                            <div className='border-t pt-2 grid grid-cols-1 md:grid-cols-2 gap-2 w-full'>
                                                {/* <Button
                                                onClick={handleCopy}
                                                icon={
                                                    !copied ? (
                                                        <Copy />
                                                    ) : (
                                                        <CopyCheck />
                                                    )
                                                }
                                                variant={'secondary'}
                                                className='text-start text-gray'
                                            >
                                                {!copied
                                                    ? 'Copy invitation link'
                                                    : 'Link copied!'}
                                            </Button> */}
                                                <Button
                                                    onClick={handleCopy}
                                                    icon={
                                                        !copied ? (
                                                            <Copy />
                                                        ) : (
                                                            <CopyCheck />
                                                        )
                                                    }
                                                    variant={'secondary'}
                                                    className='text-start text-gray bg-background'
                                                >
                                                    {!copied
                                                        ? 'Copy invitation link'
                                                        : 'Link copied!'}
                                                </Button>
                                                <Button
                                                    onClick={() =>
                                                        setArchivedConfirmOpened(
                                                            true,
                                                        )
                                                    }
                                                    icon={<ArchiveRestore />}
                                                    variant={'secondary'}
                                                    className='text-start text-gray bg-background'
                                                >
                                                    {chat?.isArchived
                                                        ? 'Retrieve Crowd'
                                                        : 'Archive Crowd'}
                                                </Button>
                                                <Button
                                                    onClick={() =>
                                                        setIsReportModalOpen(
                                                            true,
                                                        )
                                                    }
                                                    icon={<TriangleAlert />}
                                                    variant={'secondary'}
                                                    className='text-start text-gray bg-background'
                                                >
                                                    Report
                                                </Button>
                                                <Button
                                                    onClick={handleLeaveOpen}
                                                    icon={<Trash2 />}
                                                    className='bg-destructive/10 text-danger'
                                                >
                                                    {chat?.isChannel
                                                        ? 'Exit Crowd'
                                                        : 'Leave'}
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </TabsContent>

                                {chat?.isChannel && (
                                    <TabsContent
                                        value='members'
                                        className='mt-4'
                                    >
                                        <Members chat={chat} />
                                    </TabsContent>
                                )}

                                <TabsContent value='images' className='mt-4'>
                                    <Images
                                        chat={chat}
                                        setMediaCount={setMediaCount}
                                    />
                                </TabsContent>

                                <TabsContent value='voice' className='mt-4'>
                                    <Voices chat={chat} />
                                </TabsContent>
                                <TabsContent value='file' className='mt-4'>
                                    <Files chat={chat} />
                                </TabsContent>
                                <TabsContent value='link' className='mt-4'>
                                    <Links chat={chat} />
                                </TabsContent>
                            </Tabs>
                        )}
                    </div>
                </div>
            </div>

            <AddUserModal
                channel={chat}
                opened={opened}
                handleCancel={() => setOpened(false)}
            />

            <UpdateChannelModal
                channel={chat}
                isUpdateVisible={isUpdateVisible}
                handleCancel={() => setIsUpdateVisible(false)}
            />

            <ConfirmModal
                text={'Do you want to leave this crowd?'}
                subtitle='Leaving this crowd will remove your access to its messages and activities.'
                opened={leaveConfirmOpened}
                close={leaveConfirmClose}
                handleConfirm={handleLeave}
                confirmText='Leave'
                cancelText='Cancel'
                icon={
                    <div className='p-5 bg-red-500/20 rounded-full'>
                        <svg
                            width='47'
                            height='46'
                            viewBox='0 0 47 46'
                            fill='none'
                            xmlns='http://www.w3.org/2000/svg'
                        >
                            <path
                                d='M14.7955 8.40008C14.3488 10.4905 15.3904 12.4851 17.1219 12.8552C18.8535 13.2252 20.6194 11.8306 21.0661 9.74013C21.5129 7.6497 20.4713 5.6551 18.7397 5.28506C17.0081 4.91501 15.2422 6.30966 14.7955 8.40008Z'
                                fill='#DF2B2B'
                            />
                            <path
                                d='M22.6982 29.9051C22.6133 29.354 22.3028 28.8639 21.8392 28.5534L18.5564 26.3552C18.9262 25.0601 19.3146 23.4289 19.5242 21.7782L21.5004 23.8897C21.7977 24.2091 22.2108 24.3807 22.6301 24.3807C22.8238 24.3807 23.0202 24.3435 23.2069 24.2692L28.442 22.1647C29.2346 21.8463 29.6203 20.944 29.301 20.1514C28.9834 19.3587 28.0811 18.9739 27.2885 19.2924L23.0361 21.0024C23.0361 21.0024 20.2876 14.5305 16.3944 14.0519C12.5021 13.5742 8.43113 18.383 8.43113 18.383C8.2321 18.5334 8.07198 18.7298 7.96494 18.9553L4.94133 25.3095C4.5751 26.0818 4.90329 27.0054 5.67467 27.3725C5.88963 27.4742 6.1161 27.5229 6.33902 27.5229C6.91756 27.5229 7.47221 27.1973 7.7376 26.6391L10.5958 20.629L11.5857 19.8851C11.3902 22.2514 9.75187 31.7257 9.75187 31.7257L4.99883 36.0567C4.18675 36.7972 4.12837 38.0569 4.86967 38.8689C5.26156 39.2997 5.80117 39.5182 6.34167 39.5182C6.82025 39.5182 7.3006 39.3466 7.68098 38.999L12.7879 34.3441C13.0196 34.1327 13.1992 33.8691 13.3098 33.5745L15.0976 28.8285L18.897 31.3727L20.0806 39.0865C20.2328 40.0711 21.0794 40.7753 22.0454 40.7753C22.1453 40.7753 22.2479 40.7673 22.3514 40.7523C23.4369 40.586 24.1826 39.5695 24.0154 38.4832L22.6982 29.9051Z'
                                fill='#DF2B2B'
                            />
                            <path
                                d='M42.3011 29.2387L35.8257 24.2168C35.3596 23.855 34.9774 24.0416 34.9774 24.6325V26.8627H26.5859V32.9285H34.9774V35.1586C34.9774 35.7495 35.3596 35.9362 35.8257 35.5744L42.3011 30.5524C42.7673 30.1924 42.7673 29.6005 42.3011 29.2387Z'
                                fill='#DF2B2B'
                            />
                        </svg>
                    </div>
                }
                confirmIcon={<LogOut />}
            />
            <ConfirmModal
                text={`Do you want to ${chat?.isArchived ? 'Retrieve' : 'Archive'} this crowd?`}
                subtitle={
                    chat?.isArchived
                        ? `Retrieving this crowd will restore your access to its messages and activities.`
                        : `Archiving this crowd will remove your access to its messages and activities.`
                }
                opened={archivedConfirmOpened}
                close={() => setArchivedConfirmOpened(false)}
                handleConfirm={handleArchive}
                confirmText={chat?.isArchived ? 'Retrieve' : 'Archive'}
                cancelText='Cancel'
                icon={
                    <div className='p-5 bg-red-500/20 rounded-full'>
                        <ArchiveRestore className='text-danger h-12 w-12' />
                    </div>
                }
                confirmIcon={<LogOut />}
            />
            <ReportModal
                opened={isReportModalOpen}
                close={() => setIsReportModalOpen(false)}
                onSubmit={handleReport}
                isLoading={isSubmitting}
            />
            <Suspense fallback={null}>
                <NotificationOptionModal
                    chatId={chat?._id}
                    opened={notificationOption.isVisible}
                    close={closeNotificationModal}
                    member={chat?.myData}
                />
            </Suspense>
        </>
    );
};

export default ChatInfo;
