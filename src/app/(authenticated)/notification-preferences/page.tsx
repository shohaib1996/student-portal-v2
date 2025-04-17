import NotificationPreferences from '@/components/NotificationPreferences/NotificationPreferences';

import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Notification Center | BootcampsHub Portal',
    description:
        'Manage your notifications preferences for BootcampsHub Portal',
};

export default function NotificationPreferencesPage() {
    return (
        <div>
            <NotificationPreferences />
        </div>
    );
}
