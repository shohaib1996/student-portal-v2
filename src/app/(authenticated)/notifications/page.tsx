'use client';
import EmptyData from '@/components/global/EmptyData';
import GlobalHeader from '@/components/global/GlobalHeader';
import GlobalPagination from '@/components/global/GlobalPagination';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useMyProgramQuery } from '@/redux/api/myprogram/myprogramApi';
import notificationApi, {
    useGetAllNotificationsQuery,
} from '@/redux/api/notification/notificationApi';
import { store } from '@/redux/store';
import { TProgram } from '@/types';
import { TNotification } from '@/types/notification';
import dayjs from 'dayjs';
import { CalendarClock } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

const AllNoficiationsPage = () => {
    const { data: programData } = useMyProgramQuery(undefined);
    const [currentPage, setCurrentPage] = useState(1);
    const [limit, setLimit] = useState(20);
    const program = programData?.program as TProgram;
    const router = useRouter();

    const {
        data: notiData,
        isLoading,
        isFetching,
        isUninitialized,
    } = useGetAllNotificationsQuery({
        limit,
        page: currentPage,
    });
    const notifications = (notiData?.notifications as TNotification[]) || [];

    const generateNotificationUrl = (
        type: string,
        entityId: string,
        text: string,
    ) => {
        console.log(type);
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
        <div className='pt-2'>
            <GlobalHeader
                subTitle='Stay updated with all your latest notifications in one place.'
                title='All Notifications'
            />

            <div className='h-[calc(100vh-120px)] flex flex-col justify-between'>
                <div className='space-y-2 px-2 py-2 overflow-y-auto'>
                    {isLoading || isFetching ? (
                        Array.from({ length: limit }, (_: any, i: number) => (
                            <div
                                className='h-16 w-full bg-foreground rounded-md p-2'
                                key={i}
                            >
                                <div className='flex items-center gap-3 w-full'>
                                    <div className='size-11 rounded-full bg-background'></div>
                                    <div className='w-full'>
                                        <p className='w-1/2 rounded-md h-5 bg-background'></p>
                                        <p className='w-1/3 rounded-md mt-2 h-3 bg-background'></p>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <>
                            {notifications && notifications.length > 0 ? (
                                notifications.map((notification) => (
                                    // <div
                                    //     key={noti._id}
                                    //     onClick={() =>
                                    //         notificationMarkRead(noti)
                                    //     }
                                    //     className={`${
                                    //         !noti.opened
                                    //             ? ' bg-background'
                                    //             : 'bg-foreground'
                                    //     } rounded-lg border cursor-pointer hover:shadow-md`}
                                    // >
                                    //     <div className='flex p-2 gap-2'>
                                    //         <Image
                                    //             src={
                                    //                 noti?.userFrom
                                    //                     ?.profilePicture ||
                                    //                 '/avatar.jpg'
                                    //             }
                                    //             className='size-10 rounded-full border'
                                    //             height={60}
                                    //             width={60}
                                    //             alt='Avater'
                                    //         />

                                    //         <div className='w-full'>
                                    //             <div className='flex justify-between'>
                                    //                 <h3 className='font-semibold text-base text-dark-gray'>
                                    //                     {noti?.generatedTitle ||
                                    //                         'Notification'}
                                    //                 </h3>
                                    //                 {!noti.opened && (
                                    //                     <div className='size-3 ms-auto rounded-full bg-primary'></div>
                                    //                 )}
                                    //             </div>
                                    //             <div className='flex flex-col justify-between'>
                                    //                 <p className='text-gray text-sm'>
                                    //                     {noti?.generatedText ||
                                    //                         'N/A'}
                                    //                 </p>
                                    //                 <p className='text-xs flex gap-1 pt-2 text-gray whitespace-nowrap'>
                                    //                     <CalendarClock
                                    //                         size={14}
                                    //                     />
                                    //                     {dayjs(
                                    //                         noti?.createdAt,
                                    //                     ).fromNow()}
                                    //                 </p>
                                    //             </div>
                                    //         </div>
                                    //     </div>
                                    // </div>
                                    <Card
                                        key={notification._id}
                                        onClick={() =>
                                            notificationMarkRead(notification)
                                        }
                                        className={`transition-all duration-200 hover:shadow-md cursor-pointer ${!notification.opened ? 'border-l-4 border-l-primary' : ''}`}
                                    >
                                        <CardContent className='p-3'>
                                            <div className='flex gap-3'>
                                                <Avatar className='h-12 w-12 border'>
                                                    <AvatarImage
                                                        src={
                                                            notification
                                                                ?.userFrom
                                                                ?.profilePicture ||
                                                            '/avatar.jpg'
                                                        }
                                                        alt={
                                                            notification
                                                                ?.userFrom
                                                                ?.fullName ||
                                                            'User'
                                                        }
                                                    />
                                                    <AvatarFallback>
                                                        {notification?.userFrom?.firstName?.charAt(
                                                            0,
                                                        ) || 'U'}
                                                    </AvatarFallback>
                                                </Avatar>

                                                <div className='flex-1'>
                                                    <div className='flex items-start justify-between'>
                                                        <h3 className='font-medium text-black'>
                                                            {notification?.generatedTitle ||
                                                                'Notification'}
                                                        </h3>
                                                        {!notification.opened && (
                                                            <Badge
                                                                variant='default'
                                                                className='size-3 rounded-full p-0'
                                                            />
                                                        )}
                                                    </div>

                                                    <p className='text-sm text-muted-foreground mt-1 line-clamp-2'>
                                                        {notification?.generatedText ||
                                                            'N/A'}
                                                    </p>

                                                    <div className='flex items-center justify-between mt-2'>
                                                        <div className='flex items-center gap-1 text-xs text-muted-foreground'>
                                                            <CalendarClock
                                                                size={14}
                                                            />
                                                            <span>
                                                                {dayjs(
                                                                    notification?.createdAt,
                                                                ).fromNow()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            ) : (
                                <div className='h-full flex items-center justify-center'>
                                    <EmptyData description='No notification found' />
                                </div>
                            )}
                        </>
                    )}
                </div>

                <GlobalPagination
                    totalItems={notiData?.totalCount}
                    itemsPerPage={limit}
                    currentPage={currentPage}
                    onPageChange={(page, limit) => {
                        setCurrentPage(page);
                        setLimit(limit);
                    }}
                />
            </div>
        </div>
    );
};

export default AllNoficiationsPage;
