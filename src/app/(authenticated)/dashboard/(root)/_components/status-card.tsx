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
        <div className='flex flex-col md:flex-row 2xl:flex-col 3xl:flex-row justify-between gap-1.5 border rounded-lg p-4 bg-background'>
            <div>{icon}</div>
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
