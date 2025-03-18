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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { markRead, updateMyData } from '@/redux/features/chatReducer';
import onlineUsers from './onlineUsers.json';
import { Input } from '../ui/input';
// Dynamic imports
const ChatBody = lazy(() => import('./ChatBody'));
// const NotificationOptionModal = lazy(() => import("./ChatForm/NotificationModal"));
// const Meet = lazy(() => import("./jitsi/Meet"));

// Initialize dayjs plugins
dayjs.extend(relativeTime);

// Loading fallback
const LoadingFallback = () => (
    <div className='flex items-center justify-center p-4'>
        <div className='h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent'></div>
    </div>
);

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

    // Search state: controls whether the search box is open and holds the search query
    const [search, setSearch] = useState({
        isOpen: false,
        query: '',
    });

    const [finalQuery, setFinalQuery] = useState('');

    const handleSearchSubmit = useCallback(() => {
        setFinalQuery(search.query);
    }, [search.query]);

    useEffect(() => {
        if (chat?._id) {
            dispatch(markRead({ chatId: chat._id }));
        }
        // handleSearchSubmit("");
        // setSearch({
        //   isOpen: false,
        //   query: "",
        // })
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
    console.log({ chat });
    return (
        <>
            {/* Set position relative so the absolute search box is positioned relative to this container */}
            <div className='relative bg-background rounded-md shadow-sm h-[calc(100vh-60px)]'>
                <div className='flex flex-col h-full'>
                    <div className='flex items-center justify-between p-2 border-b'>
                        <div className='flex items-center space-x-3'>
                            <Link
                                className='text-dark-gray hover:text-primary'
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
                                            ? chat?.avatar || '/chat/group.svg'
                                            : chat?.otherUser?.profilePicture ||
                                              '/chat/user.svg'
                                    }
                                    onClick={handleToggleInfo}
                                    className='cursor-pointer rounded-full bg-primary w-[40px] h-[40px]'
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
                                <h4 className='text-dark-gray capitalize text-sm font-semibold'>
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
                                    <Button
                                        variant='primary_light'
                                        size='icon'
                                        className='border'
                                        asChild
                                    >
                                        <Link
                                            href='/dashboard/calendar'
                                            target='_blank'
                                        >
                                            <Calendar className='h-5 w-5' />
                                        </Link>
                                    </Button>

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
                                {chat?.myData?.isFavourite ? (
                                    <Pin className='h-5 w-5 rotate-45' />
                                ) : (
                                    <svg
                                        width='13'
                                        height='13'
                                        viewBox='0 0 13 13'
                                        fill='none'
                                        xmlns='http://www.w3.org/2000/svg'
                                        className='h-5 w-5'
                                    >
                                        <path
                                            d='M7.06609 0.986328L12.0158 5.93609L11.1909 6.76104L10.7784 6.34856L8.30351 8.82341L7.89104 10.8858L7.06609 11.7108L4.59122 9.23589L1.70387 12.1233L0.878906 11.2983L3.76626 8.41094L1.29139 5.93609L2.11634 5.11112L4.17874 4.69864L6.65361 2.22376L6.24114 1.81129L7.06609 0.986328ZM7.47856 3.04873L4.75392 5.77338L3.10782 6.10257L6.89955 9.89435L7.22878 8.24824L9.95347 5.5236L7.47856 3.04873Z'
                                            className='fill-current text-muted-foreground'
                                        />
                                    </svg>
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
                                    placeholder='Search...'
                                    className='flex-1 px-3 py-2 max-h-9 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-foreground'
                                />
                                <X
                                    className='h-4 w-4 cursor-pointer text-danger absolute top-2.5 right-2.5'
                                    onClick={resetSearch}
                                />
                            </div>
                            <Button
                                onClick={handleSearchSubmit}
                                icon={<SearchIcon size={18} />}
                            ></Button>
                        </div>
                    )}

                    {isMeeting ? (
                        <Suspense fallback={<LoadingFallback />}>
                            {/* <Meet chat={chat} setIsMeeting={setIsMeeting} /> */}
                            <p>Meeting is coming soon!</p>
                        </Suspense>
                    ) : (
                        <Suspense fallback={<LoadingFallback />}>
                            <ChatBody
                                setChatInfo={setChatInfo}
                                setProfileInfoShow={setProfileInfoShow}
                                profileInfoShow={profileInfoShow}
                                setReloading={setReloading}
                                reloading={reloading}
                                isAi={isAi}
                                searchQuery={finalQuery}
                            />
                        </Suspense>
                    )}
                </div>

                <Suspense fallback={null}>
                    {/* <NotificationOptionModal
            chatId={chat?._id}
            opened={notificationOption.isVisible}
            close={closeNotificationModal}
            member={chat?.myData}
          /> */}
                </Suspense>
            </div>
        </>
    );
};

export default Inbox;
