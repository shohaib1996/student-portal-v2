'use client';

import React, { useState, useEffect, ReactNode } from 'react';
import {
    Bell,
    Calendar,
    FileText,
    MessageSquare,
    Monitor,
    Phone,
    User,
    CreditCard,
    Settings2,
    Briefcase,
    GraduationCap,
    Check,
    X,
    ChevronRight,
    BookmarkCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { instance } from '@/lib/axios/axiosInstance';
import { toast } from 'sonner';
import GlobalHeader from '../global/GlobalHeader';

// Type definitions
type TNotification = {
    categories: string[];
    createdAt: string;
    entityId?: string;
    generatedText?: string;
    generatedTitle?: string;
    indentifier?: string;
    notificationType?: string;
    opened?: boolean;
    text?: string;
    updatedAt: string;
    userFrom?: {
        firstName?: string;
        fullName?: string;
        lastName?: string;
        profilePicture?: string;
        _id: string;
    };
    userTo?: {
        firstName?: string;
        fullName?: string;
        lastName?: string;
        profilePicture?: string;
        _id: string;
    };
    variables?: {
        NAME: string;
        OBJECTID: string;
        _id: string;
        __v: number;
    };
    _id: string;
};

type NotificationRole = {
    _id: string;
    id: string;
    title: string;
    channels: string[];
};

type NotificationPreference = {
    id: string;
    channels: string[];
    _id: string;
};

export default function NotificationSettings() {
    const [activeCategory, setActiveCategory] = useState('account');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [notificationRoles, setNotificationRoles] = useState<
        NotificationRole[]
    >([]);
    const [preferences, setPreferences] = useState<NotificationPreference[]>(
        [],
    );

    const channels: {
        id: string;
        label: string;
        color: string;
        icon: ReactNode;
    }[] = [
        {
            id: 'push',
            label: 'Push',
            icon: <Bell size={18} />,
            color: 'bg-purple-500',
        },
        {
            id: 'web',
            label: 'Web',
            icon: <Monitor size={18} />,
            color: 'bg-blue-500',
        },
        {
            id: 'chat',
            label: 'Chat',
            icon: <MessageSquare size={18} />,
            color: 'bg-green-500',
        },
        {
            id: 'email',
            label: 'Email',
            icon: <FileText size={18} />,
            color: 'bg-amber-500',
        },
        {
            id: 'sms',
            label: 'SMS',
            icon: <Phone size={18} />,
            color: 'bg-rose-500',
        },
    ];

    // Categorized notification types
    const categories = [
        {
            id: 'account',
            label: 'Account',
            icon: User,
            color: 'from-violet-500 to-purple-600',
            notificationIds: [
                'changePassword',
                'updateProfile',
                'changeStatusShowAndTell',
            ],
        },
        {
            id: 'content',
            label: 'Content',
            icon: FileText,
            color: 'from-blue-500 to-cyan-600',
            notificationIds: [
                'createMyDocument',
                'mediaSendingToUser',
                'createSlide',
                'createImportantLink',
                'createContent',
                'createTemplate',
                'createDiagram',
                'createMockInterview',
            ],
        },
        {
            id: 'calendar',
            label: 'Calendar',
            icon: Calendar,
            color: 'from-green-500 to-emerald-600',
            notificationIds: [
                'createCalendarEvent',
                'rescheduleCalendarEvent',
                'invitationCalendarEvent',
                'calendarReminder',
            ],
        },
        {
            id: 'billing',
            label: 'Billing',
            icon: CreditCard,
            color: 'from-amber-500 to-orange-600',
            notificationIds: [
                'updateTransactionStatus',
                'orderStatusChange',
                'orderTransactionStatusChange',
                'sendInvoice',
            ],
        },
        {
            id: 'education',
            label: 'Education',
            icon: GraduationCap,
            color: 'from-emerald-500 to-teal-600',
            notificationIds: ['newLessonAdd', 'certificateGenerate'],
        },
        {
            id: 'organization',
            label: 'Organization',
            icon: Briefcase,
            color: 'from-blue-500 to-indigo-600',
            notificationIds: [
                'organizationStatusChange',
                'enrollmentStatusChange',
            ],
        },
        {
            id: 'other',
            label: 'Other',
            icon: Settings2,
            color: 'from-rose-500 to-pink-600',
            notificationIds: [], // Will be filled with any uncategorized notifications
        },
    ];

    // Fetch notification data
    useEffect(() => {
        instance.get('/notification/preference/getall').then((res) => {
            const data: {
                notiRoles: NotificationRole[];
                preferences: NotificationPreference[];
            } = res?.data;
            setNotificationRoles(data.notiRoles);
            // Check for missing preferences
            const missingPreferences = data.notiRoles
                .filter(
                    (role) =>
                        !data.preferences.find((pref) => pref.id === role.id),
                )
                .map((role) => ({
                    id: role.id,
                    channels: [],
                    _id: `temp-${role.id}`,
                }));

            const updatedPreferences = [
                ...data.preferences,
                ...missingPreferences,
            ];
            setPreferences(updatedPreferences);

            // Categorize any uncategorized notifications
            const allNotificationIds = data.notiRoles.map((role) => role.id);
            const categorizedIds = categories.flatMap(
                (cat) => cat.notificationIds,
            );
            const uncategorizedIds = allNotificationIds.filter(
                (id) => !categorizedIds.includes(id),
            );

            if (uncategorizedIds.length > 0) {
                const updatedCategories = [...categories];
                const otherCategory = updatedCategories.find(
                    (cat) => cat.id === 'other',
                );
                if (otherCategory) {
                    otherCategory.notificationIds = uncategorizedIds;
                }
            }

            setIsLoading(false);
        });
    }, []);

    const handleToggle = (notificationId: string, channel: string) => {
        setPreferences((prev) => {
            return prev.map((pref) => {
                if (pref.id === notificationId) {
                    const updatedChannels = pref.channels.includes(channel)
                        ? pref.channels.filter((ch) => ch !== channel)
                        : [...pref.channels, channel];
                    return { ...pref, channels: updatedChannels };
                }
                return pref;
            });
        });
    };

    const toggleAll = (channel: any, value: any) => {
        setPreferences((prev) => {
            return prev.map((pref) => {
                const notificationRole = notificationRoles.find(
                    (role) => role.id === pref.id,
                );
                if (
                    notificationRole &&
                    notificationRole.channels.includes(channel)
                ) {
                    const updatedChannels = value
                        ? [...new Set([...pref.channels, channel])]
                        : pref.channels.filter((ch) => ch !== channel);
                    return { ...pref, channels: updatedChannels };
                }
                return pref;
            });
        });
    };

    const toggleCategoryAll = (categoryId: string, value: any) => {
        const category = categories.find((c) => c.id === categoryId);
        if (!category) {
            return;
        }

        setPreferences((prev) => {
            return prev.map((pref) => {
                if (category.notificationIds.includes(pref.id)) {
                    const notificationRole = notificationRoles.find(
                        (role) => role.id === pref.id,
                    );
                    if (notificationRole) {
                        const updatedChannels = value
                            ? [
                                  ...new Set([
                                      ...pref.channels,
                                      ...notificationRole.channels,
                                  ]),
                              ]
                            : pref.channels.filter(
                                  (ch) =>
                                      !notificationRole.channels.includes(ch),
                              );
                        return { ...pref, channels: updatedChannels };
                    }
                }
                return pref;
            });
        });
    };

    const handleSaveChanges = () => {
        setIsSaving(true);
        instance
            .patch('/notification/preference/update', { preferences })
            .then((response) => {
                toast.success('Notification preferences updated successfully');
                setIsSaving(false);
            })
            .catch((error) => {
                toast.error(
                    error?.response?.data?.error ||
                        'Failed to update notification preferences',
                );
                console.error(error);
                setIsSaving(false);
            });
    };

    // Get notifications for the active category
    const getCategoryNotifications = (categoryId: string) => {
        const category = categories.find((c) => c.id === categoryId);
        if (!category) {
            return [];
        }

        return notificationRoles.filter((role) =>
            category.notificationIds.includes(role.id),
        );
    };

    const activeCategoryNotifications =
        getCategoryNotifications(activeCategory);
    const activeCategoryColor =
        categories.find((c) => c.id === activeCategory)?.color || '';

    if (isLoading) {
        return (
            <div className='flex items-center justify-center min-h-screen'>
                <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary'></div>
            </div>
        );
    }

    return (
        <div className={cn('pt-2')}>
            <div>
                <GlobalHeader
                    title='Notification Center'
                    subTitle='Customize your notification settings to stay informed your way.'
                    buttons={
                        <div className='flex items-center gap-4'>
                            <Button
                                isLoading={isSaving}
                                onClick={handleSaveChanges}
                                disabled={isSaving}
                                icon={<BookmarkCheck size={18} />}
                            >
                                Save Changes
                            </Button>
                        </div>
                    }
                />

                <div className='grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-2 pt-2'>
                    {/* Sidebar */}
                    <div className='bg-foreground rounded-lg shadow-sm overflow-hidden border border-forground-border'>
                        <div className='p-2 px-3 bg-blue-50 dark:bg-blue-900/35'>
                            <h2 className='text-black font-bold text-xl'>
                                Categories
                            </h2>
                            <p className='text-gray text-sm mt-1'>
                                Select a category to manage
                            </p>
                        </div>
                        <div className='p-2'>
                            {categories.map((category) => {
                                const categoryNotifications =
                                    getCategoryNotifications(category.id);
                                if (categoryNotifications.length === 0) {
                                    return null;
                                }

                                return (
                                    <button
                                        key={category.id}
                                        onClick={() =>
                                            setActiveCategory(category.id)
                                        }
                                        className={cn(
                                            'w-full flex items-center justify-between p-2 rounded-md mb-2 transition-all duration-200',
                                            activeCategory === category.id
                                                ? `bg-gradient-to-r ${category.color} text-white`
                                                : 'hover:bg-gray-100 dark:hover:bg-gray-800',
                                        )}
                                    >
                                        <div className='flex items-center gap-2'>
                                            <div
                                                className={cn(
                                                    'w-10 h-10 rounded-lg flex items-center justify-center',
                                                    activeCategory ===
                                                        category.id
                                                        ? 'bg-white/20'
                                                        : `bg-gradient-to-r ${category.color} text-white`,
                                                )}
                                            >
                                                <category.icon className='h-5 w-5' />
                                            </div>
                                            <span className='font-medium'>
                                                {category.label}
                                            </span>
                                        </div>
                                        <div className='flex items-center gap-2'>
                                            <span className='text-sm opacity-80'>
                                                {categoryNotifications.length}
                                            </span>
                                            <ChevronRight
                                                className={cn(
                                                    'h-5 w-5 transition-transform',
                                                    activeCategory ===
                                                        category.id
                                                        ? 'rotate-90'
                                                        : '',
                                                )}
                                            />
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        <div className='p-2 border-t border-forground-border sidebar-quick-actions'>
                            <h3 className='font-medium mb-4'>Quick Actions</h3>
                            <div className='space-y-4'>
                                <div className='pt-2 border-t dark:border-gray-700'>
                                    <Button
                                        variant='outline'
                                        className='w-full justify-start gap-2 mb-2'
                                        onClick={() =>
                                            toggleCategoryAll(
                                                activeCategory,
                                                true,
                                            )
                                        }
                                    >
                                        <Check className='h-4 w-4' />
                                        Enable All in{' '}
                                        {
                                            categories.find(
                                                (c) => c.id === activeCategory,
                                            )?.label
                                        }
                                    </Button>
                                    <Button
                                        variant='outline'
                                        className='w-full justify-start gap-2'
                                        onClick={() =>
                                            toggleCategoryAll(
                                                activeCategory,
                                                false,
                                            )
                                        }
                                    >
                                        <X className='h-4 w-4' />
                                        Disable All in{' '}
                                        {
                                            categories.find(
                                                (c) => c.id === activeCategory,
                                            )?.label
                                        }
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className='bg-foreground rounded-lg shadow-sm overflow-hidden border border-forground-border'>
                        <div
                            className={cn(
                                'p-2 bg-gradient-to-r',
                                activeCategoryColor,
                            )}
                        >
                            <div className='flex items-center gap-3'>
                                {categories.find((c) => c.id === activeCategory)
                                    ?.icon && (
                                    <div className='w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center'>
                                        {React.createElement(
                                            categories.find(
                                                (c) => c.id === activeCategory,
                                            )?.icon as any,
                                            {
                                                className: 'h-5 w-5 text-white',
                                            },
                                        )}
                                    </div>
                                )}
                                <div>
                                    <h2 className='text-pure-white font-bold text-xl'>
                                        {
                                            categories.find(
                                                (c) => c.id === activeCategory,
                                            )?.label
                                        }{' '}
                                        Notifications
                                    </h2>
                                    <p className='text-white/80 text-sm mt-1'>
                                        Manage how you receive{' '}
                                        {categories
                                            .find(
                                                (c) => c.id === activeCategory,
                                            )
                                            ?.label.toLowerCase()}{' '}
                                        notifications
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className='p-2'>
                            <div className='overflow-x-auto'>
                                <table className='w-full border-collapse'>
                                    <thead>
                                        <tr>
                                            <th className='text-left p-4 border-b dark:border-gray-800'>
                                                Notification Type
                                            </th>
                                            {channels.map((channel) => (
                                                <th
                                                    key={channel.id}
                                                    className='p-4 border-b dark:border-gray-800'
                                                >
                                                    <div className='flex flex-col items-center'>
                                                        <div
                                                            className={cn(
                                                                'w-8 h-8 rounded-full flex items-center justify-center text-pure-white',
                                                                channel.color,
                                                            )}
                                                        >
                                                            {channel.icon}
                                                        </div>
                                                        <span className='text-xs mt-1'>
                                                            {channel.label}
                                                        </span>
                                                    </div>
                                                    <div className='flex justify-center gap-2 mt-2'>
                                                        <Button
                                                            size='sm'
                                                            variant='ghost'
                                                            className='text-xs px-1'
                                                            onClick={() =>
                                                                toggleAll(
                                                                    channel.id,
                                                                    true,
                                                                )
                                                            }
                                                        >
                                                            On
                                                        </Button>
                                                        <span className='text-xs text-gray-400'>
                                                            |
                                                        </span>
                                                        <Button
                                                            size='sm'
                                                            variant='ghost'
                                                            className='text-xs px-1'
                                                            onClick={() =>
                                                                toggleAll(
                                                                    channel.id,
                                                                    false,
                                                                )
                                                            }
                                                        >
                                                            Off
                                                        </Button>
                                                    </div>
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {activeCategoryNotifications.length ===
                                        0 ? (
                                            <tr>
                                                <td
                                                    colSpan={
                                                        channels.length + 1
                                                    }
                                                    className='text-center py-8 text-muted-foreground'
                                                >
                                                    No notifications in this
                                                    category
                                                </td>
                                            </tr>
                                        ) : (
                                            activeCategoryNotifications.map(
                                                (notification) => {
                                                    const preference: any =
                                                        preferences.find(
                                                            (p) =>
                                                                p.id ===
                                                                notification.id,
                                                        ) || { channels: [] };

                                                    return (
                                                        <tr
                                                            key={
                                                                notification.id
                                                            }
                                                            className='hover:bg-gray-50 dark:hover:bg-gray-800'
                                                        >
                                                            <td className='p-4 border-b dark:border-gray-800'>
                                                                <div className='font-medium'>
                                                                    {
                                                                        notification.title
                                                                    }
                                                                </div>
                                                            </td>
                                                            {channels.map(
                                                                (
                                                                    channel: any,
                                                                ) => (
                                                                    <td
                                                                        key={
                                                                            channel.id
                                                                        }
                                                                        className='p-4 border-b dark:border-gray-800 text-center'
                                                                    >
                                                                        {notification.channels.includes(
                                                                            channel.id,
                                                                        ) ? (
                                                                            <Switch
                                                                                checked={preference.channels.includes(
                                                                                    channel?.id as string,
                                                                                )}
                                                                                onCheckedChange={() =>
                                                                                    handleToggle(
                                                                                        notification.id,
                                                                                        channel.id,
                                                                                    )
                                                                                }
                                                                                className={cn(
                                                                                    'data-[state=checked]:bg-current',
                                                                                    preference.channels.includes(
                                                                                        channel?.id as string,
                                                                                    )
                                                                                        ? channel.color
                                                                                        : '',
                                                                                )}
                                                                            />
                                                                        ) : (
                                                                            <div className='w-9 h-5 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center mx-auto'>
                                                                                <span className='text-xs text-gray-400'>
                                                                                    —
                                                                                </span>
                                                                            </div>
                                                                        )}
                                                                    </td>
                                                                ),
                                                            )}
                                                        </tr>
                                                    );
                                                },
                                            )
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
