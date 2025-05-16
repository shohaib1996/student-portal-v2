import type React from 'react';
import { CheckCircle2, Clock, MessageSquare, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type StatusType =
    | 'not_answered'
    | 'rejected'
    | 'pending'
    | 'completed'
    | 'accepted';

type StatusConfig = {
    label: string;
    icon: React.ElementType;
    className: string;
};

type StatusBadgeProps = {
    status: string; // Changed from StatusType to string to accept any status value
    className?: string;
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
    const statusConfig: Record<string, StatusConfig> = {
        not_answered: {
            label: 'Not Answer',
            icon: MessageSquare,
            className: ' text-blue-700 border-blue-100',
        },
        rejected: {
            label: 'Rejected',
            icon: XCircle,
            className: 'bg-red-50 text-red-700 border-red-100',
        },
        pending: {
            label: 'Pending',
            icon: Clock,
            className: 'bg-amber-50 text-amber-700 border-amber-100',
        },
        completed: {
            label: 'Completed',
            icon: CheckCircle2,
            className: 'bg-green-50 text-green-700 border-green-100',
        },
        accepted: {
            label: 'Accepted',
            icon: CheckCircle2,
            className: 'bg-green-50 text-green-700 border-green-100',
        },
    };

    // Default configuration for unknown status values
    const defaultConfig: StatusConfig = {
        label: status || 'Unknown',
        icon: MessageSquare,
        className: 'bg-gray-50 text-gray-700 border-gray-100',
    };

    // Use the config for the status if it exists, otherwise use the default config
    const config = statusConfig[status] || defaultConfig;
    const Icon = config.icon;

    return (
        <div
            className={cn(
                'inline-flex items-center px-2.5 py-1 rounded-md border text-xs font-medium',
                config.className,
                className,
            )}
        >
            <Icon className='w-3.5 h-3.5 mr-1.5' />
            {config.label}
        </div>
    );
}
