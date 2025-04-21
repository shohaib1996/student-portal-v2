'use client';
import React, { useEffect, useState, useCallback, lazy, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useDispatch, useSelector } from 'react-redux';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import axios from 'axios';
import { toast } from 'sonner';
import {
    Calendar,
    Pin,
    Search,
    Bell,
    BellOff,
    ArrowLeft,
    X,
    Video,
    VideoOff,
    SearchIcon,
    PinOff,
    MoreVertical,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { markRead, updateMyData } from '@/redux/features/chatReducer';
import { Input } from '../ui/input';
import NotificationOptionModal from './ChatForm/NotificationModal';
import { useGetOnlineUsersQuery } from '@/redux/api/chats/chatApi';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Import directly instead of using lazy loading to avoid the initial loading state
import ChatBody from './ChatBody';
import { EventPopoverTrigger } from '../calendar/CreateEvent/EventPopover';
import instance from '@/utils/storage';

dayjs.extend(relativeTime);

interface ChatUser {
    _id: string;
    fullName: string;
    profilePicture: string;
    lastActive: string;
    type?: string;
}

interface ChatData {
    _id: string;
    isChannel: boolean;
    name?: string;
    avatar?: string;
    membersCount?: number;
    otherUser?: ChatUser;
    myData?: {
        isFavourite: boolean;
        notification?: {
            isOn: boolean;
        };
    };
}

interface ChatState {
    onlineUsers: ChatUser[];
}

interface RootState {
    chat: ChatState;
    theme: {
        displayMode: string;
    };
}

interface InboxProps {
    handleToggleInfo: () => void;
    isThinking?: boolean;
    setProfileInfoShow: (value: boolean) => void;
    profileInfoShow: boolean;
    setReloading: (value: boolean) => void;
    reloading: boolean;
}

const Inbox: React.FC<InboxProps> = ({
    handleToggleInfo,
    isThinking,
    setProfileInfoShow,
    profileInfoShow,
    setReloading,
    reloading,
}) => {
    const [chat, setChatInfo] = useState<any>({} as any);
    const [isMeeting, setIsMeeting] = useState(false);
    const { data: onlineUsers = [] } = useGetOnlineUsersQuery();
    const { chats } = useAppSelector((state) => state.chat);
    const [search, setSearch] = useState({
        isOpen: false,
        query: '',
    });

    const [finalQuery, setFinalQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useAppDispatch();
    const handleSearchSubmit = useCallback(() => {
        setFinalQuery(search.query);
    }, [search.query]);
    useEffect(() => {
        if (chat?._id) {
            dispatch(markRead({ chatId: chat._id }));
        }
    }, [chat, dispatch]);

    const handleFavourite = useCallback(
        (value: boolean) => {
            if (!chat?._id) {
                return;
            }

            const data = {
                chat: chat._id,
                isFavourite: value,
            };

            instance
                .put('/chat/favourite', data)
                .then((res: any) => {
                    toast.success(
                        res?.data?.member?.isFavourite === true
                            ? 'Pinned successfully'
                            : 'Unpinned successfully',
                    );
                    dispatch(
                        updateMyData({
                            _id: chat._id,
                            field: 'isFavourite',
                            value,
                        }),
                    );
                })
                .catch((err: any) => {
                    console.error(err);
                    toast.error(
                        err?.response?.data?.error || 'An error occurred',
                    );
                });
        },
        [chat?._id, dispatch],
    );

    const isAi = chat?.otherUser?._id === process.env.NEXT_PUBLIC_AI_BOT_ID;

    const [notificationOption, setNotificationOption] = useState({
        isVisible: false,
    });

    const handleNoti = useCallback(() => {
        setNotificationOption({ isVisible: true });
    }, []);

    const closeNotificationModal = useCallback(() => {
        setNotificationOption({ isVisible: false });
    }, []);

    const resetSearch = useCallback(() => {
        setSearch({ isOpen: false, query: '' });
        setFinalQuery('');
    }, []);

    const toggleMeeting = useCallback(() => {
        setIsMeeting((prev) => !prev);
    }, []);

    const toggleSearch = useCallback(() => {
        setSearch((prev) => ({
            ...prev,
            isOpen: !prev.isOpen,
        }));
    }, []);

    return (
        <>
            {/* Set position relative so the absolute search box is positioned relative to this container */}
            <div className='relative bg-foreground shadow-sm h-[calc(100vh-60px)]'>
                <div className='flex flex-col h-full'>
                    <div className='flex items-center justify-between p-2 border-b'>
                        <div className='flex items-center space-x-3'>
                            <Link
                                className='lg:hidden text-dark-gray hover:text-primary'
                                href='/chat'
                            >
                                <ArrowLeft className='h-5 w-5 text-dark-gray' />
                            </Link>

                            <div className='relative'>
                                <Image
                                    width={40}
                                    height={40}
                                    src={
                                        chat?.isChannel
                                            ? chat?.avatar !== 'undefined'
                                                ? chat?.avatar
                                                : '/group.jpg'
                                            : chat?.otherUser?.profilePicture ||
                                              '/avatar.png'
                                    }
                                    onClick={handleToggleInfo}
                                    className='cursor-pointer object-cover border shadow-md rounded-full bg-primary w-[40px] min-w-[40px] h-[40px]'
                                    alt={
                                        chat?.isChannel
                                            ? chat?.name
                                            : chat?.otherUser?.fullName ||
                                              'User avatar'
                                    }
                                />
                                {onlineUsers?.find(
                                    (x) => x?._id === chat?.otherUser?._id,
                                ) && (
                                    <div className='absolute bottom-0 right-0'>
                                        <span className='flex h-3 w-3'>
                                            <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75'></span>
                                            <span className='relative inline-flex rounded-full h-3 w-3 bg-green-500'></span>
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div
                                className='cursor-pointer flex flex-col gap-0'
                                onClick={handleToggleInfo}
                            >
                                <h4 className='text-dark-gray capitalize text-sm font-semibold truncate max-w-[200px] md:max-w-[300px] 3xl:max-w-[550px] '>
                                    {chat?.isChannel
                                        ? chat?.name
                                        : chat?.otherUser?.fullName ||
                                          'unknown'}
                                </h4>
                                <span className='text-sm text-muted-foreground whitespace-nowrap'>
                                    {isThinking ? (
                                        <span className='text-green-500 whitespace-nowrap'>
                                            Ai is generating your answer...
                                        </span>
                                    ) : chat?.isChannel ? (
                                        `${chat?.membersCount || 0} members`
                                    ) : onlineUsers?.find(
                                          (x) =>
                                              x?._id === chat?.otherUser?._id,
                                      ) ? (
                                        <span className='text-green-500'>
                                            Active now
                                        </span>
                                    ) : chat?.otherUser?.lastActive ? (
                                        dayjs(
                                            chat?.otherUser?.lastActive,
                                        ).fromNow()
                                    ) : (
                                        'Offline'
                                    )}
                                </span>
                            </div>
                        </div>

                        {/* Hidden on small screens, visible on lg and above */}
                        <div className='hidden lg:flex items-center space-x-2'>
                            <Button
                                variant='primary_light'
                                size='icon'
                                className='border'
                                onClick={toggleSearch}
                                tooltip='Search messages'
                            >
                                <Search className='h-5 w-5' />
                            </Button>

                            {chat?.otherUser?.type !== 'bot' && (
                                <>
                                    <EventPopoverTrigger>
                                        <Button
                                            tooltip='Calendar'
                                            variant='primary_light'
                                            size='icon'
                                            className='border cursor-pointer'
                                            asChild
                                        >
                                            <Calendar className='h-5 w-5' />
                                        </Button>
                                    </EventPopoverTrigger>

                                    {/* <Button
                                        variant='primary_light'
                                        size='icon'
                                        className='border'
                                        onClick={toggleMeeting}
                                    >
                                        {isMeeting ? (
                                            <VideoOff className='h-5 w-5' />
                                        ) : (
                                            <Video className='h-5 w-5' />
                                        )}
                                    </Button> */}
                                </>
                            )}

                            <Button
                                variant='primary_light'
                                size='icon'
                                className='border'
                                onClick={() => handleNoti()}
                                tooltip='Notifications'
                            >
                                {chat?.myData?.notification?.isOn ? (
                                    <Bell className='h-5 w-5' />
                                ) : (
                                    <BellOff className='h-5 w-5' />
                                )}
                            </Button>

                            <Button
                                variant='primary_light'
                                size='icon'
                                className='border'
                                tooltip={
                                    !chat?.myData?.isFavourite
                                        ? 'Pin chat'
                                        : 'Unpin chat'
                                }
                                onClick={() =>
                                    handleFavourite(!chat?.myData?.isFavourite)
                                }
                            >
                                {!chat?.myData?.isFavourite ? (
                                    <Pin className='h-5 w-5 rotate-45' />
                                ) : (
                                    <PinOff className='h-5 w-5 rotate-45' />
                                )}
                            </Button>
                        </div>

                        {/* Visible on small screens, hidden on lg and above */}
                        <div className='lg:hidden'>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant='secondary'
                                        size='icon'
                                        className='bg-background h-10 w-10 min-w-10'
                                    >
                                        <MoreVertical className='h-5 w-5' />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align='end'>
                                    <DropdownMenuItem onClick={toggleSearch}>
                                        <Search className='h-4 w-4 ' />
                                        Search
                                    </DropdownMenuItem>

                                    {chat?.otherUser?.type !== 'bot' && (
                                        <>
                                            <DropdownMenuItem asChild>
                                                <EventPopoverTrigger>
                                                    <div className='flex items-center w-full gap-2 cursor-pointer'>
                                                        <Calendar className='h-4 w-4 ' />
                                                        Create Event
                                                    </div>
                                                </EventPopoverTrigger>
                                            </DropdownMenuItem>

                                            {/* <DropdownMenuItem
                                                onClick={toggleMeeting}
                                            >
                                                {isMeeting ? (
                                                    <>
                                                        <VideoOff className='h-4 w-4 ' />
                                                        End Meeting
                                                    </>
                                                ) : (
                                                    <>
                                                        <Video className='h-4 w-4 ' />
                                                        Start Meeting
                                                    </>
                                                )}
                                            </DropdownMenuItem> */}
                                        </>
                                    )}

                                    <DropdownMenuItem
                                        onClick={() => handleNoti()}
                                    >
                                        {chat?.myData?.notification?.isOn ? (
                                            <>
                                                <Bell className='h-4 w-4 ' />
                                                Notifications On
                                            </>
                                        ) : (
                                            <>
                                                <BellOff className='h-4 w-4 ' />
                                                Notifications Off
                                            </>
                                        )}
                                    </DropdownMenuItem>

                                    <DropdownMenuItem
                                        onClick={() =>
                                            handleFavourite(
                                                !chat?.myData?.isFavourite,
                                            )
                                        }
                                    >
                                        {!chat?.myData?.isFavourite ? (
                                            <>
                                                <Pin className='h-4 w-4  rotate-45' />
                                                Pin Chat
                                            </>
                                        ) : (
                                            <>
                                                <PinOff className='h-4 w-4  rotate-45' />
                                                Unpin Chat
                                            </>
                                        )}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    {/* Search box appears when search.isOpen is true */}
                    {search.isOpen && (
                        <div className='absolute top-[60px] left-0 right-0 bg-background p-2 shadow-md z-10 flex items-center gap-2'>
                            <div className='relative w-full'>
                                <Input
                                    type='text'
                                    value={search.query}
                                    onChange={(e) =>
                                        setSearch((prev) => ({
                                            ...prev,
                                            query: e.target.value,
                                        }))
                                    }
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            handleSearchSubmit();
                                        }
                                    }}
                                    placeholder='Search messages...'
                                    className='flex-1 px-3 py-2 max-h-9 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-foreground'
                                />
                                <X
                                    className='h-4 w-4 cursor-pointer text-danger absolute top-2.5 right-2.5'
                                    onClick={resetSearch}
                                />
                            </div>
                            <Button
                                onClick={handleSearchSubmit}
                                variant='outline'
                                className='bg-foreground'
                                icon={<SearchIcon size={18} />}
                            ></Button>
                        </div>
                    )}

                    {isMeeting ? (
                        <div className='flex items-center justify-center h-full'>
                            <div className='text-center p-4'>
                                <Video className='h-12 w-12 mx-auto mb-4 text-primary' />
                                <h3 className='text-lg font-medium mb-2'>
                                    Video Meeting
                                </h3>
                                <p className='text-muted-foreground mb-4'>
                                    Coming soon! This feature is currently under
                                    development.
                                </p>
                                <Button
                                    onClick={toggleMeeting}
                                    variant='outline'
                                >
                                    Return to Chat
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <ChatBody
                            setChatInfo={setChatInfo}
                            setProfileInfoShow={setProfileInfoShow}
                            profileInfoShow={profileInfoShow}
                            setReloading={setReloading}
                            reloading={reloading}
                            isAi={isAi}
                            searchQuery={finalQuery}
                        />
                    )}
                </div>

                {/* Notification Modal - Positioned in the center of the chatbox */}
                {notificationOption.isVisible && (
                    <div className='fixed inset-0 flex items-center justify-center z-50'>
                        <div
                            className='absolute inset-0 bg-black opacity-65'
                            onClick={closeNotificationModal}
                        ></div>
                        <div className='relative z-10 bg-background rounded-md shadow-lg max-w-md w-full mx-auto'>
                            <NotificationOptionModal
                                chatId={chat?._id}
                                opened={notificationOption.isVisible}
                                close={closeNotificationModal}
                                member={chat?.myData}
                                handleUpdateCallback={(updatedMember) => {
                                    // Immediately update local state to reflect the change
                                    setChatInfo((prevChat: any) => ({
                                        ...prevChat,
                                        myData: {
                                            ...prevChat.myData,
                                            notification:
                                                updatedMember.notification,
                                        },
                                    }));

                                    // Also dispatch to update the redux store directly
                                    dispatch(
                                        updateMyData({
                                            _id: chat?._id,
                                            field: 'notification',
                                            value: updatedMember.notification,
                                        }),
                                    );
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default Inbox;
