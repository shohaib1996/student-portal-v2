'use client';
import React, { useEffect, useState, useCallback, lazy, Suspense } from 'react';
import Image from 'next/image';
import { useDispatch, useSelector } from 'react-redux';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
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
    Maximize2,
    MoreVertical,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { markRead, updateMyData } from '@/redux/features/chatReducer';
import onlineUsers from '../onlineUsers.json';
import NotificationOptionModal from '../ChatForm/NotificationModal';
import { Input } from '@/components/ui/input';
import PopUpChatBody from './PopupchatBody';
import { useRouter } from 'nextjs-toploader/app';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { instance } from '@/lib/axios/axiosInstance';
import GlobalTooltip from '@/components/global/GlobalTooltip';
import {
    EventPopoverProvider,
    EventPopoverTrigger,
} from '@/components/calendar/CreateEvent/EventPopover';
import CreateEventModal from '@/components/calendar/CreateEvent/CreateEventModal';

// Dynamic imports
const ChatBody = lazy(() => import('../ChatBody'));

// Initialize dayjs plugins
dayjs.extend(relativeTime);

// Loading fallback
const LoadingFallback = () => (
    <div className='flex items-center justify-center p-4'>
        <div className='h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent'></div>
    </div>
);

interface PopupInboxProps {
    chatId?: string;
    onBack: () => void;
    onClose: () => void;
    handleToggleInfo: () => void;
    setProfileInfoShow: (value: boolean) => void;
    profileInfoShow: boolean;
    setReloading: (reloading: boolean | ((prev: boolean) => boolean)) => void;
    reloading: boolean;
}

const PopupInbox: React.FC<PopupInboxProps> = ({
    chatId,
    onBack,
    onClose,
    handleToggleInfo,
    setProfileInfoShow,
    profileInfoShow,
    setReloading,
    reloading,
}) => {
    const [chat, setChatInfo] = useState<any>({} as any);
    const [isMeeting, setIsMeeting] = useState(false);
    const dispatch = useDispatch();
    const router = useRouter();
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
        <EventPopoverProvider>
            {/* Adjusted container height for dropdown context */}
            <div className='relative rounded-md h-full'>
                <div className='flex flex-col h-full'>
                    <div className='flex items-center justify-between pb-2 border-b'>
                        <div className='flex items-center space-x-3 w-[calc(60%-50px)]'>
                            <div className='relative'>
                                <Image
                                    width={40}
                                    height={40}
                                    src={
                                        chat?.isChannel
                                            ? chat?.avatar !== 'undefined'
                                                ? chat?.avatar
                                                : '/group.jpg'
                                            : chat?.otherUser
                                                    ?.profilePicture !==
                                                'undefined'
                                              ? chat?.otherUser?.profilePicture
                                              : '/avatar.png'
                                    }
                                    onClick={handleToggleInfo}
                                    className='cursor-pointer object-cover border shadow-md rounded-full bg-primary h-10 w-10 min-w-10'
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
                                className='cursor-pointer flex flex-col gap-0 w-full'
                                onClick={handleToggleInfo}
                            >
                                <GlobalTooltip
                                    tooltip={
                                        chat?.isChannel
                                            ? chat?.name
                                            : chat?.otherUser?.fullName ||
                                              'User avatar'
                                    }
                                >
                                    <h4 className='text-dark-gray capitalize text-sm font-semibold truncate w-full'>
                                        {chat?.isChannel
                                            ? chat?.name
                                            : chat?.otherUser?.fullName ||
                                              'unknown'}
                                    </h4>
                                </GlobalTooltip>
                                <span className='text-sm text-muted-foreground whitespace-nowrap'>
                                    {chat?.isChannel ? (
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
                            {/* Search button - keep in header */}
                            <Button
                                variant='secondary'
                                size='icon'
                                className='border h-8 w-8 bg-foreground'
                                onClick={() =>
                                    setSearch((prev) => ({
                                        ...prev,
                                        isOpen: !prev.isOpen,
                                    }))
                                }
                            >
                                <Search className='h-4 w-4' />
                            </Button>

                            {/* Maximize button - keep in header */}
                            <Button
                                variant='secondary'
                                size='icon'
                                className='border h-8 w-8 bg-foreground'
                                onClick={() => router.push(`/chat/${chatId}`)}
                            >
                                <Maximize2 className='h-4 w-4' />
                            </Button>

                            {/* Three-dot menu for other actions */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant='secondary'
                                        size='icon'
                                        className='border h-8 w-8 bg-foreground'
                                    >
                                        <MoreVertical className='h-4 w-4' />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align='end'
                                    className='min-w-[180px]'
                                >
                                    {/* Calendar option */}
                                    {/* <EventPopoverTrigger className='w-full'>
                                        <DropdownMenuItem className='flex items-center gap-2 cursor-pointer'>
                                            <Calendar className='h-4 w-4' />
                                            <span>Calendar</span>
                                        </DropdownMenuItem>
                                    </EventPopoverTrigger> */}

                                    {/* Notification option */}
                                    <DropdownMenuItem
                                        className='flex items-center gap-2 cursor-pointer'
                                        onClick={() => handleNoti()}
                                    >
                                        {chat?.myData?.notification?.isOn ? (
                                            <>
                                                <Bell className='h-4 w-4' />
                                                <span>Notifications On</span>
                                            </>
                                        ) : (
                                            <>
                                                <BellOff className='h-4 w-4' />
                                                <span>Notifications Off</span>
                                            </>
                                        )}
                                    </DropdownMenuItem>

                                    {/* Pin/Favorite option */}
                                    <DropdownMenuItem
                                        className='flex items-center gap-2 cursor-pointer'
                                        onClick={() =>
                                            handleFavourite(
                                                !chat?.myData?.isFavourite,
                                            )
                                        }
                                    >
                                        {!chat?.myData?.isFavourite ? (
                                            <>
                                                <Pin className='h-4 w-4 rotate-45' />
                                                <span>Pin Conversation</span>
                                            </>
                                        ) : (
                                            <>
                                                <PinOff className='h-4 w-4 rotate-45' />
                                                <span>Unpin Conversation</span>
                                            </>
                                        )}
                                    </DropdownMenuItem>

                                    {/* <DropdownMenuSeparator /> */}

                                    {/* Meeting toggle option */}
                                    {/* <DropdownMenuItem
                                        className='flex items-center gap-2 cursor-pointer'
                                        onClick={toggleMeeting}
                                    >
                                        {isMeeting ? (
                                            <>
                                                <VideoOff className='h-4 w-4' />
                                                <span>End Meeting</span>
                                            </>
                                        ) : (
                                            <>
                                                <Video className='h-4 w-4' />
                                                <span>Start Meeting</span>
                                            </>
                                        )}
                                    </DropdownMenuItem> */}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    {/* Search box appears when search.isOpen is true */}
                    {search.isOpen && (
                        <div className='absolute top-[48px] left-0 right-0 bg-background p-2 shadow-md z-10 flex items-center gap-2'>
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
                                variant='plain'
                                onClick={handleSearchSubmit}
                                icon={<SearchIcon size={18} />}
                            ></Button>
                        </div>
                    )}

                    <div className='flex-1 h-[calc(100%-48px)] overflow-hidden'>
                        {isMeeting ? (
                            <Suspense fallback={<LoadingFallback />}>
                                <p className='text-center p-4'>
                                    Meeting is coming soon!
                                </p>
                            </Suspense>
                        ) : (
                            <Suspense fallback={<LoadingFallback />}>
                                <PopUpChatBody
                                    setChatInfo={setChatInfo}
                                    setProfileInfoShow={setProfileInfoShow}
                                    profileInfoShow={profileInfoShow}
                                    setReloading={setReloading}
                                    reloading={reloading}
                                    isAi={isAi}
                                    searchQuery={finalQuery}
                                    isPopup={true}
                                    chatId={chatId}
                                />
                            </Suspense>
                        )}
                    </div>
                </div>

                <Suspense fallback={null}>
                    <NotificationOptionModal
                        chatId={chat?._id}
                        opened={notificationOption.isVisible}
                        close={closeNotificationModal}
                        member={chat?.myData}
                    />
                </Suspense>
                <CreateEventModal />
            </div>
        </EventPopoverProvider>
    );
};

export default PopupInbox;
