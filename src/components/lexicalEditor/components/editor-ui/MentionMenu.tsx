import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from '@/components/lexicalEditor/ui/avatar';
import { cn } from '../../lib/utils';
import {
    BeautifulMentionsMenuItemProps,
    BeautifulMentionsMenuProps,
} from 'lexical-beautiful-mentions';
import { CircleUser, Loader2 } from 'lucide-react';
import { forwardRef } from 'react';

/**
 * Menu component for the BeautifulMentionsPlugin.
 */
export const MentionMenu = forwardRef<any, BeautifulMentionsMenuProps>(
    ({ open, loading, ...other }, ref) => {
        if (loading) {
            return (
                <div
                    ref={ref}
                    className='m-0 mt-6 min-w-[14rem] overflow-hidden rounded-md border bg-popover p-3 text-sm text-popover-foreground shadow-lg animate-in fade-in-50 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 z-[9999999'
                >
                    <div className='flex items-center gap-2 px-1 py-1.5'>
                        <Loader2 className='h-4 w-4 animate-spin text-muted-foreground' />
                        <span className='text-sm text-muted-foreground'>
                            Loading suggestions...
                        </span>
                    </div>
                </div>
            );
        }
        return (
            <ul
                ref={ref}
                style={{
                    scrollbarWidth: 'thin',
                    msOverflowStyle: 'none',
                }}
                className='absolute top-6 m-0 min-w-[14rem] max-h-[200px] overflow-y-auto overflow-x-hidden rounded-md border bg-popover p-1.5 text-popover-foreground shadow-lg animate-in fade-in-50 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95'
                {...other}
            />
        );
    },
);
MentionMenu.displayName = 'Menu';

/**
 * MenuItem component for the BeautifulMentionsPlugin.
 */
export const MentionMenuItem = forwardRef<
    HTMLLIElement,
    BeautifulMentionsMenuItemProps
>(({ selected, itemValue, label, ...props }, ref) => {
    // Extract additional user data if available
    const subtitle = props?.subtitle || props?.description || props?.role || '';
    const hasSubtitle = subtitle && subtitle.length > 0;

    return (
        <li
            ref={ref}
            className={cn(
                'relative flex cursor-pointer select-none items-center rounded-md px-2 py-1.5 text-sm outline-none transition-colors duration-150 ease-in-out',
                selected
                    ? 'bg-accent text-accent-foreground'
                    : 'hover:bg-muted',
                'my-0.5 gap-3',
            )}
            {...props}
        >
            <Avatar className='h-8 w-8 border shadow-sm'>
                <AvatarImage src={props?.avatar} alt={label} />
                <AvatarFallback className='bg-primary/10 text-primary'>
                    {label ? (
                        label.charAt(0).toUpperCase()
                    ) : (
                        <CircleUser className='h-4 w-4' />
                    )}
                </AvatarFallback>
            </Avatar>

            <div className='flex flex-col'>
                <span className='font-medium'>{label}</span>
                {hasSubtitle && (
                    <span
                        className={cn(
                            'text-xs opacity-70',
                            selected
                                ? 'text-accent-foreground'
                                : 'text-muted-foreground',
                        )}
                    >
                        {subtitle}
                    </span>
                )}
            </div>

            {props?.userStatus && (
                <div
                    className={cn(
                        'ml-auto h-2 w-2 rounded-full',
                        props.userStatus === 'online'
                            ? 'bg-green-500'
                            : props.userStatus === 'busy'
                              ? 'bg-red-500'
                              : props.userStatus === 'away'
                                ? 'bg-yellow-500'
                                : 'bg-gray-300',
                    )}
                />
            )}
        </li>
    );
});
MentionMenuItem.displayName = 'MenuItem';
