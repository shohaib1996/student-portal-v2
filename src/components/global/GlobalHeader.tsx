'use client';
import { cn } from '@/lib/utils';
import React, { ReactNode, useState, createContext, useContext } from 'react';
import { Tooltip } from '../ui/tooltip';
import GlobalTooltip from './GlobalTooltip';
import { Info } from 'lucide-react';

const ExpandContext = createContext<
    { open: boolean; toggleOpen: () => void } | undefined
>(undefined);

type TProps = {
    title: string | ReactNode;
    tooltip?: ReactNode | string;
    withTooltip?: boolean;
    subTitle?: string | ReactNode;
    buttons?: ReactNode;
    expandedButtons?: ReactNode;
    className?: string;
};

const GlobalHeader = ({
    title,
    subTitle,
    buttons,
    withTooltip = true,
    expandedButtons,
    tooltip,
    className,
}: TProps) => {
    const [open, setOpen] = useState(false);
    const toggleOpen = () => setOpen((prev) => !prev);

    return (
        <ExpandContext.Provider value={{ open, toggleOpen }}>
            <div
                className={cn(
                    'flex gap-2 flex-wrap flex-col sm:flex-row sm:items-center justify-between pb-1 border-b border-forground-border',
                    className,
                )}
            >
                <div>
                    <div className='flex items-center gap-1'>
                        <h2 className='text-black text-xl font-semibold'>
                            {title}
                        </h2>
                        {withTooltip && (
                            <GlobalTooltip
                                className='shadow-md border border-forground-border p-2'
                                tooltip={tooltip || subTitle}
                            >
                                <h2 className='pt-1 text-dark-gray cursor-pointer'>
                                    <Info size={16} />
                                </h2>
                            </GlobalTooltip>
                        )}
                    </div>
                    <p className='text-sm text-gray'>{subTitle}</p>
                </div>
                <div>{buttons}</div>
            </div>

            <div className='overflow-hidden'>
                <div
                    className={cn(
                        'h-0 -translate-y-7 overflow-hidden transition-all duration-300 ease-in-out',
                        {
                            'h-12 translate-y-0 pt-2': open,
                        },
                    )}
                >
                    {expandedButtons}
                </div>
            </div>
        </ExpandContext.Provider>
    );
};

// add this buttom inside GlobalHeader. whetever button wrapped inside it will work as the expande button. make sure to pass the expandeButtons props

export const ExpandButton = ({ children }: { children: ReactNode }) => {
    const context = useContext(ExpandContext);
    if (!context) {
        throw new Error('ExpandButton must be used within a GlobalHeader');
    }

    return <div onClick={context.toggleOpen}>{children}</div>;
};

export default GlobalHeader;
