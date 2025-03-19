'use client';

import { useParams, usePathname, useRouter } from 'next/navigation';
import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
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
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { removeChat, updateChats } from '@/redux/features/chatReducer';
import UpdateChannelModal from './UpdateChannelModal';
import { useAppSelector } from '@/redux/hooks';
import chats from './chats.json';
import dayjs from 'dayjs';
import GlobalTooltip from '../global/GlobalTooltip';
import { Button } from '../ui/button';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import Files from './Files';

interface ChatInfoProps {
    handleToggleInfo: () => void;
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
}: {
    onImageUpload: (file: File) => void;
    isLoading: boolean;
    previewImage?: string;
}) => {
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

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

    return (
        <div className='flex flex-col items-center justify-center w-full'>
            <div
                className={cn(
                    'relative w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden cursor-pointer',
                    'flex flex-col items-center justify-center text-center',
                    'bg-black hover:bg-black/80 transition-all',
                    'border-2 border-dashed border-gray-400/30',
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
                                <div className='absolute inset-0 bg-black/50 flex flex-col items-center justify-center z-10'>
                                    <Camera className='h-6 w-6 text-white mb-1' />
                                    <p className='text-white text-xs font-medium'>
                                        <span className='text-white underline'>
                                            Upload
                                        </span>{' '}
                                        <span className='text-green-400'>
                                            or
                                        </span>
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
                                    <span className='text-green-400'>or</span>
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

const ChatInfo: React.FC<ChatInfoProps> = ({ handleToggleInfo }) => {
    const params = useParams();
    const pathname = usePathname();
    const router = useRouter();
    const dispatch = useDispatch();
    const [copied, setCopied] = useState(false);
    const [chat, setChat] = useState<any>(null);
    const [opened, setOpened] = useState(false);
    const [imageLoading, setImageLoading] = useState(false);
    const [isUpdateVisible, setIsUpdateVisible] = useState(false);
    const [members, setMembers] = useState<Member[]>([]);
    const [ownerMember, setOwnerMember] = useState<Member | null>(null);
    const [loadingMembers, setLoadingMembers] = useState(false);
    const { user } = useSelector((s: any) => s.auth);

    // const { chatMessages, chats, onlineUsers } = useAppSelector(
    //     (state: any) => state.chat,
    // );

    useEffect(() => {
        if (chat?._id) {
            setLoadingMembers(true);
            axios
                .post(`/chat/members/${chat?._id}`, { limit: 50 })
                .then((res) => {
                    const membersList = res.data?.results || [];
                    setMembers(membersList);
                    // Find owner among members
                    const owner = membersList.find(
                        (m: Member) => m.role === 'owner',
                    );
                    if (owner) {
                        setOwnerMember(owner);
                    }
                    setLoadingMembers(false);
                })
                .catch((err) => {
                    console.log(err);
                    toast.error(
                        err?.response?.data?.error || 'Error fetching members',
                    );
                    setLoadingMembers(false);
                });
        }
    }, [chat]);

    useEffect(() => {
        if (chat?._id && (!chat.imagesCount || !chat.voiceCount)) {
            axios
                .get(`/chat/media-counts/${chat?._id}`)
                .then((res) => {
                    setChat((prev: any) => ({
                        ...prev,
                        imagesCount: res.data.imagesCount || 0,
                        voiceCount: res.data.voiceCount || 0,
                    }));
                })
                .catch((err) => {
                    console.log(err);
                    // Set default values if the API fails
                    setChat((prev: any) => ({
                        ...prev,
                        imagesCount: 0,
                        voiceCount: 0,
                    }));
                });
        }
    }, [chat?._id]);

    useEffect(() => {
        if (chats && params.chatid) {
            const findChat = chats?.find(
                (chat: any) => chat?._id === params.chatid,
            );
            setChat(findChat);
        }
    }, [chats, router, params.chatid]);

    const isWoner = chat?.myData?.role === 'owner';

    console.log(chat);

    const handleCopy = useCallback(() => {
        const newPathname = pathname.replace('/chat/', '/channel-invitation/');
        navigator.clipboard
            .writeText(`${process.env.NEXT_PUBLIC_CLIENT_URL}${newPathname}`)
            .then(() => {
                setCopied(true);
                setTimeout(() => {
                    setCopied(false);
                }, 3000);
                console.log(
                    `${process.env.NEXT_PUBLIC_CLIENT_URL}${newPathname}`,
                );
                toast.success('Invitation link copied to clipboard');
            })
            .catch((err) => {
                toast.error(err?.message || 'Failed to copy link');
            });
    }, [pathname]);

    const handleUploadImage = useCallback(
        async (image: File) => {
            if (image) {
                console.log('Uploading image:', image);

                try {
                    setImageLoading(true);
                    const newFile = await resizeFile(image);
                    const formData = new FormData();
                    formData.append('image', newFile);
                    formData.append('channel-avatar', 'chat-image');

                    const response = await axios.post(
                        '/settings/watermark-image',
                        formData,
                    );
                    const url = response.data.url;
                    const data = {
                        avatar: url,
                    };
                    const updateRes = await axios.patch(
                        `/chat/channel/update/${chat?._id}`,
                        data,
                    );

                    dispatch(updateChats(updateRes?.data?.channel));

                    // Update local state with new avatar
                    setChat((prev: any) => ({
                        ...prev,
                        avatar: url,
                    }));

                    toast.success('Channel image updated successfully');
                    setImageLoading(false);
                } catch (error: any) {
                    console.log(error);
                    toast.error(
                        error?.response?.data?.error || 'Error uploading image',
                    );
                    setImageLoading(false);
                }
            }
        },
        [chat, dispatch],
    );

    const handleArchive = useCallback(() => {
        axios
            .patch(`/chat/channel/archive/${chat?._id}`, {
                isArchived: !chat?.isArchived,
            })
            .then((res) => {
                console.log(res);
                if (res.data.success) {
                    dispatch(
                        updateChats({ ...chat, isArchived: !chat?.isArchived }),
                    );
                    toast.success('The group has been successfully archived.');
                }
            })
            .catch((error) => {
                console.log(error);
                toast.error(
                    error?.response?.data?.error || 'Error archiving group',
                );
            });
    }, [chat, dispatch]);

    const handleLeave = useCallback(() => {
        axios
            .patch(`/chat/channel/leave/${chat?._id}`)
            .then((res) => {
                dispatch(removeChat(chat?._id));
                router.push('/chat');
            })
            .catch((err) => {
                toast.error(
                    err?.response?.data?.error || 'Error leaving group',
                );
            });
    }, [chat, dispatch, router]);

    console.log(chat);

    const [
        leaveConfirmOpened,
        { open: leaveConfirmOpen, close: leaveConfirmClose },
    ] = useDisclosure(false);

    const handleLeaveOpen = useCallback(() => {
        leaveConfirmOpen();
    }, [leaveConfirmOpen]);

    const handleCancel = useCallback(() => {
        console.log('Closing modal');
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
            <div className='flex flex-col h-full border-l border bg-background'>
                <div className='flex items-center justify-between p-2 border-b border'>
                    <h1 className='text-xl font-semibold text-dark-gray'>
                        Chat Info
                    </h1>
                </div>
                <div className='flex-1 overflow-y-auto p-2 space-y-6'>
                    <div className=''>
                        {chat && (
                            <Tabs defaultValue='about'>
                                <TabsList className='w-full bg-transparent'>
                                    <TabsTrigger
                                        value='about'
                                        className='flex-1 bg-transparent shadow-none rounded-none border-b-2 border-b-border data-[state=active]:border-b-blue-600 data-[state=active]:text-blue-600'
                                    >
                                        <Info size={16} className='mr-1' />
                                        About
                                    </TabsTrigger>
                                    {chat?.isChannel && (
                                        <TabsTrigger
                                            value='members'
                                            className='flex-1 bg-transparent shadow-none rounded-none border-b-2 border-b-border data-[state=active]:border-b-blue-600 data-[state=active]:text-blue-600'
                                        >
                                            <Users size={16} className='mr-1' />
                                            Members ({chat?.membersCount || 0})
                                        </TabsTrigger>
                                    )}
                                    <TabsTrigger
                                        value='images'
                                        className='flex-1 bg-transparent shadow-none rounded-none border-b-2 border-b-border data-[state=active]:border-b-blue-600 data-[state=active]:text-blue-600'
                                    >
                                        <FileImage size={16} className='mr-1' />
                                        Images ({chat?.imagesCount || 0})
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value='voice'
                                        className='flex-1 bg-transparent shadow-none rounded-none border-b-2 border-b-border data-[state=active]:border-b-blue-600 data-[state=active]:text-blue-600'
                                    >
                                        <Mic size={16} className='mr-1' />
                                        Voice ({chat?.voiceCount || 0})
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value='file'
                                        className='flex-1 bg-transparent shadow-none rounded-none border-b-2 border-b-border data-[state=active]:border-b-blue-600 data-[state=active]:text-blue-600'
                                    >
                                        <FolderOpenDot
                                            size={16}
                                            className='mr-1'
                                        />
                                        Files ({chat?.voiceCount || 0})
                                    </TabsTrigger>
                                </TabsList>

                                {/* About Tab Content */}
                                <TabsContent
                                    value='about'
                                    className='mt-4 space-y-6'
                                >
                                    <div className='flex flex-col gap-2 items-center'>
                                        <div className='relative'>
                                            <ImageUploader
                                                onImageUpload={
                                                    handleUploadImage
                                                }
                                                isLoading={imageLoading}
                                                previewImage={
                                                    chat?.isChannel
                                                        ? chat?.avatar ||
                                                          '/chat/group.png'
                                                        : chat?.otherUser
                                                              ?.profilePicture ||
                                                          '/chat/user.png'
                                                }
                                            />
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
                                                        {chat?.isChannel
                                                            ? chat?.name
                                                            : chat?.otherUser
                                                                  ?.fullName}
                                                        {chat?.isChannel &&
                                                            [
                                                                'owner',
                                                                'admin',
                                                            ].includes(
                                                                chat?.myData
                                                                    ?.role,
                                                            ) && (
                                                                <button
                                                                    onClick={() =>
                                                                        setIsUpdateVisible(
                                                                            true,
                                                                        )
                                                                    }
                                                                    className='ml-2'
                                                                >
                                                                    <PencilLine
                                                                        size={
                                                                            16
                                                                        }
                                                                    />
                                                                </button>
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
                                                >
                                                    Mute Notification
                                                </Button>
                                            </div>
                                        </div>
                                        <div className='admin_Date w-full type_readonly grid grid-cols-2 gap-2 w-full'>
                                            <div className='user flex flex-row items-center gap-1'>
                                                {loadingMembers ? (
                                                    <div className='h-9 w-9 rounded-full bg-gray-200 animate-pulse'></div>
                                                ) : (
                                                    <img
                                                        alt='owner avatar'
                                                        src={
                                                            ownerMember?.user
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
                                            <div className='flex items-center text-gray'>
                                                <Calendar className='h-4 w-4 mr-1' />
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
                                        <div className='type_readonly grid grid-cols-2 gap-2 w-full'>
                                            <div className='type flex flex-row items-center gap-2 text-start text-dark-gray text-sm font-semibold '>
                                                Type:{' '}
                                                <p className='text-gray font-normal'>
                                                    {chat?.isPublic
                                                        ? 'Public'
                                                        : 'Private'}
                                                </p>{' '}
                                                {chat?.isChannel &&
                                                    ['owner', 'admin'].includes(
                                                        chat?.myData?.role,
                                                    ) && (
                                                        <button
                                                            onClick={() =>
                                                                setIsUpdateVisible(
                                                                    true,
                                                                )
                                                            }
                                                            className='ml-2'
                                                        >
                                                            <PencilLine
                                                                size={16}
                                                            />
                                                        </button>
                                                    )}
                                            </div>
                                            <div className='readonly flex flex-row items-center gap-2 text-start text-dark-gray text-sm font-semibold '>
                                                Read Only:{' '}
                                                <p className='text-gray font-normal'>
                                                    {chat?.isReadOnly
                                                        ? 'Yes'
                                                        : 'No'}
                                                </p>{' '}
                                                {chat?.isChannel &&
                                                    ['owner', 'admin'].includes(
                                                        chat?.myData?.role,
                                                    ) && (
                                                        <button
                                                            onClick={() =>
                                                                setIsUpdateVisible(
                                                                    true,
                                                                )
                                                            }
                                                            className='ml-2'
                                                        >
                                                            <PencilLine
                                                                size={16}
                                                            />
                                                        </button>
                                                    )}
                                            </div>
                                        </div>
                                        <div className='description flex flex-col gap-1 bg-foreground border rounded-md p-2'>
                                            <div className='flex flex-row items-center gap-3 justify-between'>
                                                <p className='text-sm text-dark-gray font-semibold'>
                                                    Description
                                                </p>
                                                {chat?.isChannel &&
                                                    ['owner', 'admin'].includes(
                                                        chat?.myData?.role,
                                                    ) && (
                                                        <button
                                                            onClick={() =>
                                                                setIsUpdateVisible(
                                                                    true,
                                                                )
                                                            }
                                                            className='ml-2'
                                                        >
                                                            <PencilLine
                                                                size={16}
                                                            />
                                                        </button>
                                                    )}
                                            </div>
                                            <p className='text-xs text-gray'>
                                                {chat?.isChannel &&
                                                    (chat?.description ||
                                                        'No description added yet...')}
                                            </p>

                                            {/* User details for direct messages */}
                                            {!chat?.isChannel &&
                                                chat?.otherUser && (
                                                    <div className='space-y-2 border-t border pt-4'>
                                                        <h2 className='font-medium text-gray text-xs'>
                                                            About{' '}
                                                            {
                                                                chat?.otherUser
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
                                        <div className='border-t pt-2 grid grid-cols-1 md:grid-cols-2 gap-2 w-full'>
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
                                                className='text-start text-gray'
                                            >
                                                {!copied
                                                    ? 'Copy invitation link'
                                                    : 'Link copied!'}
                                            </Button>
                                            <Button
                                                onClick={handleArchive}
                                                icon={<ArchiveRestore />}
                                                variant={'secondary'}
                                                className='text-start text-gray'
                                            >
                                                {chat?.isArchived
                                                    ? 'Retrieve Crowd'
                                                    : 'Archive Crowd'}
                                            </Button>
                                            <Button
                                                onClick={() =>
                                                    toast.info(
                                                        'Report feature is coming soon!',
                                                    )
                                                }
                                                icon={<TriangleAlert />}
                                                variant={'secondary'}
                                                className='text-start text-gray'
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
                                    <Images chat={chat} />
                                </TabsContent>

                                <TabsContent value='voice' className='mt-4'>
                                    <Voices chat={chat} />
                                </TabsContent>
                                <TabsContent value='file' className='mt-4'>
                                    <Files chat={chat} />
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
                text={'Are you sure you want to leave this group?'}
                opened={leaveConfirmOpened}
                close={leaveConfirmClose}
                handleConfirm={handleLeave}
            />
        </>
    );
};

export default ChatInfo;
