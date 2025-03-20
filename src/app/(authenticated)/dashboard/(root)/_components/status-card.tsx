import type { ReactNode } from 'react';
import { RadialProgress } from '@/components/global/RadialProgress';

interface StatusCardProps {
    title: string;
    value: number;
    percentage: number;
    color: string;
    icon: ReactNode;
}

export function StatusCard({
    title,
    value,
    percentage,
    color,
    icon,
}: StatusCardProps) {
    return (
        <div className='flex justify-between gap-1.5 border rounded-lg p-4'>
            {icon}
            <div className='mr-auto'>
                <h4 className='text-muted-foreground text-sm'>{title}</h4>
                <p className='text-2xl font-bold'>{value}</p>
            </div>
            <RadialProgress
                value={percentage}
                color={
                    [
                        'primary',
                        'default',
                        'secondary',
                        'success',
                        'warning',
                        'danger',
                    ].includes(color)
                        ? (color as
                              | 'primary'
                              | 'default'
                              | 'secondary'
                              | 'success'
                              | 'warning'
                              | 'danger')
                        : 'primary'
                }
                size='sm'
            />
        </div>
    );
}
