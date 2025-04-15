import React, { ReactNode } from 'react';
import {
    TooltipProvider,
    TooltipTrigger,
    TooltipContent,
    Tooltip,
} from './tooltip';
import { cn } from '@/lib/utils';

const CalendarTooltip = ({
    tooltip,
    children,
    side = 'top',
    className,
}: {
    children: ReactNode | string;
    tooltip: ReactNode | string;
    className?: string;
    side?: 'top' | 'bottom' | 'left' | 'right';
}) => {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>{children}</TooltipTrigger>
                <TooltipContent
                    side={side}
                    className={cn('max-w-44 z-50', className)}
                >
                    {tooltip}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};

export default CalendarTooltip;
