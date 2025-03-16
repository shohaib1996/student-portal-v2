'use client';
import { store } from '@/redux/store';
import Link from 'next/link';
import React from 'react';
import { Button } from '../ui/button';
import { Bell, CalendarClock } from 'lucide-react';
import Image from 'next/image';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import GlobalDropdown from '../global/GlobalDropdown';
import notificationApi, {
    useGetAllNotificationsQuery,
} from '@/redux/api/notification/notificationApi';
import { TNotification } from '@/types/notification';
dayjs.extend(relativeTime);

const NotificationMenu = () => {
    const { data: notiData } = useGetAllNotificationsQuery(undefined);
    const notifications = (notiData?.notifications as TNotification[]) || [];

    const handleReadAllNotification = async () => {
        await store
            .dispatch(
                notificationApi.endpoints.markAllRead.initiate(
                    undefined,
                ) as any,
            )
            .unwrap();
    };

    const notificationMarkRead = async (noti: TNotification) => {
        if (noti?.opened === false) {
            await store.dispatch(
                notificationApi.endpoints.markRead.initiate(noti._id) as any,
            );
        }
    };

    return (
        <GlobalDropdown
            className='w-96'
            dropdownRender={
                <div className='space-y-2 px-2 py-2'>
                    {notifications && notifications.length > 0 ? (
                        notifications.map((noti) => (
                            <div
                                key={noti._id}
                                onClick={() => notificationMarkRead(noti)}
                                className={`${
                                    !noti.opened
                                        ? ' bg-sidebar'
                                        : 'bg-foreground'
                                } rounded-lg border cursor-pointer hover:shadow-md`}
                            >
                                <div className='flex p-2 gap-2'>
                                    <Image
                                        src={
                                            noti?.userFrom?.profilePicture ||
                                            '/avatar.jpg'
                                        }
                                        className='size-10 rounded-full border'
                                        height={60}
                                        width={60}
                                        alt='Avater'
                                    />

                                    <div className=''>
                                        <div className='flex justify-between'>
                                            <h3 className='font-semibold text-base text-dark-gray'>
                                                {noti?.generatedTitle ||
                                                    'Notification'}
                                            </h3>
                                            {!noti.opened && (
                                                <div className='size-3 rounded-full bg-primary'></div>
                                            )}
                                        </div>
                                        <div className='flex flex-col justify-between'>
                                            <p className='text-gray text-sm'>
                                                {noti?.generatedText || 'N/A'}
                                            </p>
                                            <p className='text-xs flex gap-1 pt-2 text-gray whitespace-nowrap'>
                                                <CalendarClock size={14} />
                                                {dayjs(
                                                    noti?.createdAt,
                                                ).fromNow()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div>No notifications found</div>
                    )}
                </div>
            }
            title={
                <div className='flex justify-between items-center'>
                    <h3 className='text-base text-black'>Notifications</h3>
                    <div className='flex items-center gap-2'>
                        <Button
                            onClick={() => handleReadAllNotification()}
                            variant={'secondary'}
                        >
                            Read All
                        </Button>
                        <Link
                            href={'/notifications'}
                            className='allNotification'
                        >
                            <Button>All Notifications</Button>
                        </Link>
                    </div>
                </div>
            }
        >
            <Button
                icon={<Bell size={18} />}
                className='rounded-full border-none px-0 w-fit text-text-primary-gray'
                variant={'plain'}
                size={'icon'}
            ></Button>
        </GlobalDropdown>
    );
};

export default NotificationMenu;
