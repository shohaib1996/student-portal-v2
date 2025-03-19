'use client';

import { useParams, usePathname, useRouter } from 'next/navigation';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
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
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTheme } from 'next-themes';
import { removeChat, updateChats } from '@/redux/features/chatReducer';
import UpdateChannelModal from './UpdateChannelModal';
import { useAppSelector } from '@/redux/hooks';
import chats from './chats.json';
interface ChatInfoProps {
    handleToggleInfo: () => void;
}

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
    const [members, setMembers] = useState<any>(null);
    const { user } = useSelector((s: any) => s.auth);
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    // const { chatMessages, chats, onlineUsers } = useAppSelector(
    //     (state: any) => state.chat,
    // );

    useEffect(() => {
        if (chat?._id) {
            axios
                .post(`/chat/members/${chat?._id}`)
                .then((res) => {
                    console.log(res.data);
                    setMembers(res.data?.results || []);
                })
                .catch((err) => {
                    console.log(err);
                    toast.error(
                        err?.response?.data?.error || 'Error fetching members',
                    );
                });
        }
    }, [chat]);

    useEffect(() => {
        if (chats && params.chatid) {
            const findChat = chats?.find(
                (chat: any) => chat?._id === params.chatid,
            );
            setChat(findChat);
        }
    }, [chats, router]);

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
            })
            .catch((err) => {
                toast.error(err?.message || 'Failed to copy link');
            });
    }, [pathname]);

    const handleUploadImage = useCallback(
        async (image: File) => {
            if (image) {
                console.log(image);

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

                    (
                        document.getElementById(
                            'profile_img_channel',
                        ) as HTMLInputElement
                    ).value = '';
                    setImageLoading(false);
                } catch (error: any) {
                    (
                        document.getElementById(
                            'profile_img_channel',
                        ) as HTMLInputElement
                    ).value = '';
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

    return (
        <>
            <div className='flex flex-col h-full border-l border-border dark:bg-background'>
                <div className='flex items-center justify-between p-4 border-b border-border'>
                    <h1 className='text-xl font-semibold dark:text-foreground'>
                        Chat Info
                    </h1>
                    <button
                        onClick={handleToggleInfo}
                        className='p-2 rounded-full hover:bg-muted transition-colors'
                        aria-label='Close'
                    >
                        <X className='h-5 w-5 dark:text-foreground' />
                    </button>
                </div>
                <div className='flex-1 overflow-y-auto p-4 space-y-6'>
                    <div className='relative rounded-lg bg-muted dark:bg-muted/30'>
                        <img
                            className='w-full h-[250px] object-cover rounded-lg'
                            src={
                                chat?.isChannel
                                    ? chat?.avatar || '/chat/group.png'
                                    : chat?.otherUser?.profilePicture ||
                                      '/chat/user.png'
                            }
                            alt={
                                chat?.isChannel
                                    ? chat?.name
                                    : chat?.otherUser?.fullName
                            }
                        />
                        {chat?.isChannel &&
                            ['owner', 'admin'].includes(chat?.myData?.role) && (
                                <button
                                    onClick={() => setIsUpdateVisible(true)}
                                    className='absolute top-2 right-2 p-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors'
                                >
                                    <Pencil className='h-4 w-4' />
                                </button>
                            )}
                        {chat?.isChannel &&
                            ['owner', 'admin'].includes(chat?.myData?.role) && (
                                <label
                                    className='absolute bottom-2 right-2 p-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors cursor-pointer'
                                    htmlFor='profile_img_channel'
                                >
                                    {imageLoading ? (
                                        <Loader className='h-4 w-4 animate-spin' />
                                    ) : (
                                        <Camera className='h-4 w-4' />
                                    )}
                                    <input
                                        disabled={imageLoading}
                                        onChange={(e) =>
                                            e.target.files &&
                                            handleUploadImage(e.target.files[0])
                                        }
                                        hidden
                                        type='file'
                                        id='profile_img_channel'
                                        accept='image/*'
                                    />
                                </label>
                            )}
                    </div>

                    <h1 className='text-xl font-semibold text-center dark:text-foreground'>
                        {chat?.isChannel
                            ? chat?.name
                            : chat?.otherUser?.fullName}
                    </h1>

                    <div className='flex flex-col space-y-4'>
                        <div className='flex items-center justify-between'>
                            {chat?.isChannel && (
                                <div className='flex items-center text-muted-foreground'>
                                    <Users className='h-4 w-4 mr-2' />
                                    <span>
                                        {chat?.membersCount || 0} members
                                    </span>
                                </div>
                            )}

                            {chat?.isChannel && (
                                <button
                                    className='flex items-center text-primary hover:text-primary/80 transition-colors'
                                    onClick={() => setOpened(true)}
                                >
                                    <PlusCircle className='h-4 w-4 mr-1' />
                                    Add member
                                </button>
                            )}
                        </div>

                        <div className='flex items-center justify-start'>
                            {chat?.isChannel && (
                                <button
                                    className='flex items-center text-muted-foreground hover:text-foreground transition-colors'
                                    onClick={handleCopy}
                                >
                                    <Link className='h-4 w-4 mr-2' />
                                    {!copied
                                        ? 'Click invitation link'
                                        : 'Link copied!'}
                                </button>
                            )}
                        </div>
                    </div>

                    {chat?.isChannel && (
                        <div className='space-y-2'>
                            <h2 className='font-medium dark:text-foreground'>
                                Crowd Description
                            </h2>
                            <p className='text-muted-foreground text-sm'>
                                {chat?.description ||
                                    'No description added yet...'}
                            </p>
                        </div>
                    )}

                    <div className='mt-6'>
                        {chat && (
                            <Tabs
                                defaultValue={
                                    chat.isChannel ? 'members' : 'images'
                                }
                            >
                                <TabsList className='w-full'>
                                    {chat?.isChannel && (
                                        <TabsTrigger
                                            value='members'
                                            className='flex-1'
                                        >
                                            Members
                                        </TabsTrigger>
                                    )}
                                    <TabsTrigger
                                        value='images'
                                        className='flex-1'
                                    >
                                        Images
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value='voice'
                                        className='flex-1'
                                    >
                                        Voice
                                    </TabsTrigger>
                                </TabsList>

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
                            </Tabs>
                        )}
                    </div>
                </div>

                <div className='p-4 border-t border-border space-y-2'>
                    {chat?.isChannel && (
                        <>
                            <button
                                onClick={handleLeaveOpen}
                                className='w-full flex items-center justify-center p-2 text-destructive hover:bg-destructive/10 rounded-md transition-colors'
                            >
                                <Trash2 className='h-4 w-4 mr-2' />
                                Leave Group
                            </button>

                            {isWoner && (
                                <button
                                    onClick={handleArchive}
                                    className='w-full flex items-center justify-center p-2 text-muted-foreground hover:bg-muted rounded-md transition-colors'
                                >
                                    <ArchiveRestore className='h-4 w-4 mr-2' />
                                    {chat?.isArchived
                                        ? 'Retrieve Group'
                                        : 'Archive Group'}
                                </button>
                            )}
                        </>
                    )}
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
