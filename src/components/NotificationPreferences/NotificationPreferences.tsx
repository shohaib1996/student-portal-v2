'use client';

import React, { useEffect, useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Loader2, CheckCircle, CircleOff, Save } from 'lucide-react';
import { instance } from '@/lib/axios/axiosInstance';
import { toast } from 'sonner';

const notiRoles = [
    {
        _id: '66c2616ecaab8cad8c53e141',
        id: 'changePassword',
        title: 'Notification of password change.',
        channels: ['web', 'chat', 'email'],
    },
    {
        _id: '66c2616ecaab8cad8c53e142',
        id: 'updateProfile',
        title: 'Profile Updated',
        channels: ['push', 'web', 'chat', 'email'],
    },
    {
        _id: '66c2616ecaab8cad8c53e144',
        id: 'changeStatusShowAndTell',
        title: 'Show & Tell Status Updated',
        channels: ['web', 'push', 'email'],
    },
    {
        _id: '66c2616ecaab8cad8c53e146',
        id: 'createMyDocument',
        title: 'My Document Added',
        channels: ['web', 'chat'],
    },
    {
        _id: '66c2616ecaab8cad8c53e147',
        id: 'mediaSendingToUser',
        title: 'New Media Received',
        channels: ['web', 'chat'],
    },
    {
        _id: '66c2616ecaab8cad8c53e148',
        id: 'createSlide',
        title: 'New Slide Created',
        channels: ['web', 'chat'],
    },
    {
        _id: '66c2616ecaab8cad8c53e149',
        id: 'createCalendarEvent',
        title: 'New Calendar Event Created',
        channels: ['email', 'push', 'chat', 'web', 'sms'],
    },
    {
        _id: '66c2616ecaab8cad8c53e14a',
        id: 'rescheduleCalendarEvent',
        title: 'Calendar Event Rescheduled',
        channels: ['web', 'chat', 'push', 'email'],
    },
    {
        _id: '66c2616ecaab8cad8c53e14b',
        id: 'invitationCalendarEvent',
        title: 'Calendar Event Invitation',
        channels: ['web', 'chat', 'push', 'email'],
    },
    {
        _id: '66c2616ecaab8cad8c53e14c',
        id: 'createImportantLink',
        title: 'New Important Link Created',
        channels: ['web', 'push', 'chat'],
    },
    {
        _id: '66c2616ecaab8cad8c53e14d',
        id: 'createContent',
        title: 'New Content Created',
        channels: ['web', 'push', 'chat'],
    },
    {
        _id: '66c2616ecaab8cad8c53e14e',
        id: 'createTemplate',
        title: 'New Template Created',
        channels: ['web', 'push', 'chat'],
    },
    {
        _id: '66c2616ecaab8cad8c53e14f',
        id: 'createDiagram',
        title: 'New Diagram Created',
        channels: ['web', 'push', 'chat'],
    },
    {
        _id: '66c2616ecaab8cad8c53e150',
        id: 'createMockInterview',
        title: 'New Mock Interview Created',
        channels: ['web', 'push', 'chat'],
    },
    {
        _id: '66c2616ecaab8cad8c53e153',
        id: 'updateTransactionStatus',
        title: 'Payment Status Updated',
        channels: ['web', 'push', 'chat', 'email'],
    },
    {
        _id: '66c2616ecaab8cad8c53e155',
        id: 'organizationStatusChange',
        title: 'Company Status Updated',
        channels: ['web', 'push', 'email', 'sms'],
    },
    {
        _id: '66c2616ecaab8cad8c53e159',
        id: 'enrollmentStatusChange',
        title: 'Enrollment Status Updated',
        channels: ['web', 'push', 'chat', 'email', 'sms'],
    },
    {
        _id: '66c2616ecaab8cad8c53e15b',
        id: 'orderStatusChange',
        title: 'Order Status Updated',
        channels: ['web', 'push', 'chat', 'email', 'sms'],
    },
    {
        _id: '66c2616ecaab8cad8c53e15d',
        id: 'orderTransactionStatusChange',
        title: 'Order Payment Status Updated',
        channels: ['web', 'push', 'chat', 'email'],
    },
    {
        _id: '66c2616ecaab8cad8c53e15e',
        id: 'newLessonAdd',
        title: 'New Lesson',
        channels: ['web', 'push'],
    },
    {
        _id: '66c2616ecaab8cad8c53e160',
        id: 'sendInvoice',
        title: 'Invoice Sent',
        channels: ['web', 'push', 'chat'],
    },
    {
        _id: '66c2616ecaab8cad8c53e161',
        id: 'certificateGenerate',
        title: 'Certificate Generated',
        channels: ['web', 'push', 'chat', 'email'],
    },
    {
        _id: '66d4d9c2cd7127b13a2caed4',
        id: 'calendarReminder',
        title: 'Calendar Event Reminder',
        channels: ['web', 'chat', 'push', 'email', 'groups', 'sms'],
    },
];

function NotificationPreferences() {
    const availableChannels = ['push', 'web', 'chat', 'email', 'sms'];

    interface NotificationRole {
        id: string | number;
        title: string;
        channels: string[];
    }

    interface Preference {
        id: string | number;
        channels: string[];
    }

    const [notificationsRoles, setNotificationsRoles] =
        useState<NotificationRole[]>(notiRoles);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [preferences, setPreferences] = useState<Preference[]>([]);

    useEffect(() => {
        setIsLoading(true);
        instance
            .get('/notification/preference/getall')
            .then((response) => {
                console.log(response);
                // setNotificationsRoles(response.data?.notiRoles || []);
                setPreferences(response.data?.preferences || []);
                setIsLoading(false);
            })
            .catch((error) => {
                console.error(error);
                setIsLoading(false);
            });
    }, []);

    const handleSwitchChange = (
        channel: string,
        id: string | number,
        checked: boolean,
    ) => {
        setPreferences((prev) =>
            prev.map((pref) =>
                pref.id === id
                    ? {
                          ...pref,
                          channels: checked
                              ? [...pref.channels, channel]
                              : pref.channels.filter(
                                    (ch: string) => ch !== channel,
                                ),
                      }
                    : pref,
            ),
        );
    };

    const handleTurnAll = (channel: string, turnOn: boolean) => {
        setPreferences((prev) =>
            prev.map((pref) => ({
                ...pref,
                channels: turnOn
                    ? [...new Set([...pref.channels, channel])]
                    : pref.channels.filter((ch: string) => ch !== channel),
            })),
        );
    };

    const data = notificationsRoles.map((notification) => {
        const rowData: { [key: string]: string | number | boolean | string[] } =
            { ...notification };
        availableChannels.forEach((channel) => {
            const preference = preferences.find(
                (pref) => pref.id === notification.id,
            );
            rowData[channel] = preference?.channels.includes(channel) || false;
        });
        return rowData;
    });

    console.log({ preferences });

    const handleSaveChanges = async () => {
        setIsSaving(true);
        try {
            await instance.patch('/notification/preference/update', {
                preferences,
            });

            setIsSaving(false);
            toast.success('Notification preferences updated successfully');
        } catch (error) {
            console.error(error);
            setIsSaving(false);
        }
    };

    return (
        <div className='p-common bg-background'>
            <div className='border-b mb-common pb-common flex justify-between items-center'>
                <div className='header_left'>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <h1 className='page_title text-xl font-bold'>
                                    Notification Preferences
                                </h1>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Manage notification Preferences</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <p className='text-sm text-muted-foreground'>
                        A brief description of the setting and why to enable or
                        disable it.
                    </p>
                </div>
                <Button
                    onClick={handleSaveChanges}
                    disabled={isSaving}
                    size='sm'
                    className='gap-2 hover:text-black'
                >
                    {isSaving ? (
                        <Loader2 className='h-4 w-4 animate-spin' />
                    ) : (
                        <Save className='h-4 w-4' />
                    )}
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>

            <div className='notification_body mt-6'>
                {isLoading ? (
                    <Skeleton className='w-full h-[400px]' />
                ) : (
                    <ul className='space-y-4'>
                        <li className='bg-primary rounded-md text-white px-common grid grid-cols-6 gap-4 items-center'>
                            <div className='header_cell'>
                                <span className='text font-medium'>
                                    Notification
                                </span>
                            </div>
                            {availableChannels.map((item) => (
                                <div
                                    key={item}
                                    className='flex justify-between items-center'
                                >
                                    <span className='capitalize font-medium'>
                                        {item === 'sms' ? 'SMS' : item}
                                    </span>
                                    <div className='flex gap-2'>
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant='ghost'
                                                        size='icon'
                                                        onClick={() =>
                                                            handleTurnAll(
                                                                item,
                                                                true,
                                                            )
                                                        }
                                                    >
                                                        <CheckCircle className='h-4 w-4' />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>All Turn On</p>
                                                </TooltipContent>
                                            </Tooltip>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant='ghost'
                                                        size='icon'
                                                        onClick={() =>
                                                            handleTurnAll(
                                                                item,
                                                                false,
                                                            )
                                                        }
                                                    >
                                                        <CircleOff className='h-4 w-4' />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>All Turn Off</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                </div>
                            ))}
                        </li>
                        {data.map((item, index) => (
                            <li
                                key={index}
                                className='px-common grid grid-cols-6 gap-4 items-center'
                            >
                                <div className=''>
                                    <span className='text-xs'>
                                        {item?.title}
                                    </span>
                                </div>
                                {availableChannels.map((channel) => {
                                    const preference = preferences.find(
                                        (pref) => pref.id === item.id,
                                    );
                                    const isChannelEnabled =
                                        preference?.channels.includes(channel);
                                    const isAvailable =
                                        Array.isArray(item.channels) &&
                                        item.channels.includes(channel);

                                    return (
                                        <div
                                            key={channel}
                                            className='cells flex justify-center'
                                        >
                                            {!isAvailable ? (
                                                <span className='text-muted-foreground text-sm'>
                                                    Not Available
                                                </span>
                                            ) : (
                                                <Switch
                                                    defaultChecked={
                                                        isChannelEnabled ||
                                                        false
                                                    }
                                                    checked={isChannelEnabled}
                                                    disabled={!isAvailable}
                                                    onCheckedChange={(
                                                        checked,
                                                    ) =>
                                                        handleSwitchChange(
                                                            channel,
                                                            item.id as
                                                                | string
                                                                | number,
                                                            checked,
                                                        )
                                                    }
                                                />
                                            )}
                                        </div>
                                    );
                                })}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

export default NotificationPreferences;
