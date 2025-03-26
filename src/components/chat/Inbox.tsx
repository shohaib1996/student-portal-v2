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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { markRead, updateMyData } from '@/redux/features/chatReducer';
import { Input } from '../ui/input';
import NotificationOptionModal from './ChatForm/NotificationModal';
import { useGetOnlineUsersQuery } from '@/redux/api/chats/chatApi';
import { useAppSelector } from '@/redux/hooks';

// Import directly instead of using lazy loading to avoid the initial loading state
import ChatBody from './ChatBody';
import { EventPopoverTrigger } from '../calendar/CreateEvent/EventPopover';

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
    const dispatch = useDispatch();
    const { data: onlineUsers = [] } = useGetOnlineUsersQuery();
    const { chats } = useAppSelector((state) => state.chat);

    // Search state: controls whether the search box is open and holds the search query
    const [search, setSearch] = useState({
        isOpen: false,
        query: '',
    });

    const [finalQuery, setFinalQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);

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

            axios
                .put('/chat/favourite', data)
                .then((res) => {
                    toast.success('Favorite saved successfully');
                    dispatch(
                        updateMyData({
                            _id: chat._id,
                            field: 'isFavourite',
                            value,
                        }),
                    );
                })
                .catch((err) => {
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

    return (
        <>
            {/* Set position relative so the absolute search box is positioned relative to this container */}
            <div className='relative bg-foreground rounded-md shadow-sm h-[calc(100vh-60px)]'>
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
                                            ? chat?.avatar || '/group.jpg'
                                            : chat?.otherUser?.profilePicture ||
                                              '/avatar.png'
                                    }
                                    onClick={handleToggleInfo}
                                    className='cursor-pointer object-cover border shadow-md rounded-full bg-primary w-[40px] h-[40px]'
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
                                <h4 className='text-dark-gray capitalize text-sm font-semibold truncate'>
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

                        <div className='flex items-center space-x-2'>
                            <Button
                                variant='primary_light'
                                size='icon'
                                className='border'
                                onClick={() =>
                                    setSearch((prev) => ({
                                        ...prev,
                                        isOpen: !prev.isOpen,
                                    }))
                                }
                            >
                                <Search className='h-5 w-5' />
                            </Button>
                            {chat?.otherUser?.type !== 'bot' && (
                                <>
                                    <EventPopoverTrigger>
                                        <Button
                                            tooltip='Create Event'
                                            variant='primary_light'
                                            size='icon'
                                            className='border cursor-pointer'
                                            asChild
                                        >
                                            <Calendar className='h-5 w-5' />
                                        </Button>
                                    </EventPopoverTrigger>

                                    <Button
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
                                    </Button>
                                </>
                            )}
                            <Button
                                variant='primary_light'
                                size='icon'
                                className='border'
                                onClick={() => handleNoti()}
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

                <NotificationOptionModal
                    chatId={chat?._id}
                    opened={notificationOption.isVisible}
                    close={closeNotificationModal}
                    member={chat?.myData}
                />
            </div>
        </>
    );
};

export default Inbox;
