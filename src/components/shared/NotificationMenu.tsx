'use client';
import { RootState, store } from '@/redux/store';
import Link from 'next/link';
import React, { use } from 'react';
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
import { useMyProgramQuery } from '@/redux/api/myprogram/myprogramApi';
import { TProgram } from '@/types';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { updateNotification } from '@/redux/features/notificationReducer';
dayjs.extend(relativeTime);

const NotificationMenu = () => {
    const { data: programData } = useMyProgramQuery(undefined);

    const program = programData?.program as TProgram;
    const router = useRouter();

    const generateNotificationUrl = (
        type: string,
        entityId: string,
        text: string,
    ) => {
        let url = '';
        switch (type) {
            case 'enrollmentApprove':
                url = `/program`;
                break;
            case 'calendarNoti':
                url = `/calendar?detail=${entityId}`;
                break;

            case 'calendarReminder':
                url = `/calendar?detail=${entityId}`;
                break;
            case 'createCalendarEvent':
                url = `/calendar?detail=${entityId}`;
                break;
            // newly added -------------------------------------
            case 'invitationCalendarEvent':
                url = `/calendar?detail=${entityId}`;
                break;
            case 'rescheduleCalendarEvent':
                url = `/calendar?detail=${entityId}`;
                break;
            case 'createMyDocument':
                url = `/upload-documents`;
                break;
            case 'createMockInterview':
                url = `/mock-interviews`;
                break;
            case 'createContent':
                url = `/documents-and-labs?id=${entityId}`;
                break;
            case 'createSlide':
                url = `/presentation_slide/${entityId}`;
                break;
            // case "createImportantLink ":
            //   url = ``;
            //   break;
            case 'createTemplate':
                url = `/my-templates`;
                break;
            case 'createDiagram':
                url = `/diagram-preview/${entityId}`;
                break;
            case 'newLessonAdd':
                url = `/program-details/${program?.slug}`;
                break;
            default:
                break;
        }
        return url;
    };

    const generateNotificationText = (type: string, user: string) => {
        let text = '';
        switch (type) {
            case 'enrollmentApprove':
                text = `Congratulations! You are now approved for this program`;
                break;
            case 'calendarNoti':
                text = `Calendar Notification`;
                break;
            default:
                text = 'This notification is not defined';
                break;
        }
        return text;
    };

    const { data: notiData } = useGetAllNotificationsQuery(undefined);
    // const notifications = (notiData?.notifications as TNotification[]) || [];
    const dispatch = useDispatch();

    const { notifications, unReadNotification } = useSelector(
        (state: RootState) => state.notification,
    );

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
            store.dispatch(
                updateNotification({
                    ...noti,
                    opened: true,
                }),
            );

            router.push(
                generateNotificationUrl(
                    noti.notificationType as string,
                    noti.entityId as string,
                    noti?.text as string,
                ),
            );
        } else {
            router.push(
                generateNotificationUrl(
                    noti.notificationType as string,
                    noti.entityId as string,
                    noti?.text as string,
                ),
            );
        }
    };

    return (
        <GlobalDropdown
            className='w-96'
            dropdownRender={
                <div className='space-y-2 px-2 py-2'>
                    {notifications && notifications.length > 0 ? (
                        notifications.map((noti: any) => (
                            <div
                                key={noti._id}
                                onClick={() => notificationMarkRead(noti)}
                                className={`${
                                    !noti.opened
                                        ? ' bg-foreground'
                                        : 'bg-background'
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
            <div className='relative'>
                <Button
                    icon={<Bell size={18} />}
                    className='rounded-full text-dark-gray'
                    variant={'outline'}
                    size={'icon'}
                ></Button>

                {unReadNotification && unReadNotification > 0 && (
                    <div className='absolute -top-1 -right-1 rounded-full text-xs min-w-4 max-w-fit p-1 h-4 bg-danger flex items-center justify-center text-pure-white'>
                        {unReadNotification > 99 ? '99+' : unReadNotification}
                    </div>
                )}
            </div>
        </GlobalDropdown>
    );
};

export default NotificationMenu;
