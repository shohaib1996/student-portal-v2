import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Separator } from '../ui/separator';

type TProps = {
    children: ReactNode;
    items?: DropdownItems[];
    dropdownRender?: ReactNode | string | number;
    title?: ReactNode | string;
    className?: string;
    open?: boolean;
    onOpenChange?: (_: boolean) => void;
    side?: 'top' | 'right' | 'bottom' | 'left';
    align?: 'start' | 'center' | 'end'; // Added align prop
    asChild?: boolean;
};

export type DropdownItems = {
    id: number | string;
    content: ReactNode | string | number;
};

const GlobalDropdown = ({
    children,
    items,
    dropdownRender,
    title,
    className,
    onOpenChange,
    open,
    side = 'bottom',
    align = 'start',
    asChild = false,
}: TProps) => {
    return (
        <Popover open={open} onOpenChange={onOpenChange}>
            <PopoverTrigger asChild={asChild} className='w-full'>
                {children}
            </PopoverTrigger>
            <PopoverContent
                side={side}
                align={align}
                className={cn(
                    'z-50 max-h-96 overflow-y-auto relative p-0 border',
                    className,
                )}
            >
                {title && (
                    <div className='sticky top-0 z-30 bg-dropdown'>
                        <div className='p-2'>{title}</div>
                        <Separator />
                    </div>
                )}

                <div
                    className='overflow-y-auto h-full'
                    onClick={(e) => e.stopPropagation()}
                >
                    {dropdownRender
                        ? dropdownRender
                        : items?.map((item, i) => (
                              <div
                                  key={i}
                                  className=' cursor-pointer  rounded-md  border-b  p-2  hover:bg-background  md:has-[>.md\:hidden]:py-0 has-[>.hidden]:py-0  lg:has-[>lg\:hidden]:py-0
        '
                                  onClick={() => onOpenChange?.(false)}
                              >
                                  {item?.content}
                              </div>
                          ))}
                </div>
            </PopoverContent>
        </Popover>
    );
};

export default GlobalDropdown;
