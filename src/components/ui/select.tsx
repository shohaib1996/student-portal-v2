'use client';

import * as React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown, ChevronUp, Search, X } from 'lucide-react';

import { cn } from '@/lib/utils';

// Create a context to share search term between components
const SelectSearchContext = React.createContext('');
const SelectDeselectContext = React.createContext<{
    onDeselect?: () => void;
    showDeselect: boolean;
}>({ showDeselect: false });

const Select = React.forwardRef<
    React.ComponentRef<typeof SelectPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Root> & {
        allowDeselect?: boolean;
        onValueChange?: (value: string) => void;
    }
>(({ allowDeselect = false, onValueChange, ...props }, ref) => {
    // Create handler to pass through context
    const handleDeselect = React.useCallback(() => {
        if (onValueChange) {
            onValueChange('');
        }
    }, [onValueChange]);

    return (
        <SelectDeselectContext.Provider value={{ onDeselect: handleDeselect, showDeselect: allowDeselect }}>
            <SelectPrimitive.Root onValueChange={onValueChange} {...props} />
        </SelectDeselectContext.Provider>
    );
});
Select.displayName = 'Select';

const SelectGroup = SelectPrimitive.Group;

const SelectValue = SelectPrimitive.Value;



const SelectTrigger = React.forwardRef<
    React.ComponentRef<typeof SelectPrimitive.Trigger>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => {

    const { onDeselect, showDeselect } = React.useContext(SelectDeselectContext);
    const hasValue = Boolean(props.value);

    const handleClearClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onDeselect) {
            onDeselect();
        }
    };

    return <SelectPrimitive.Trigger
        ref={ref}
        className={cn(
            'flex h-10 items-center justify-between bg-background whitespace-nowrap w-full rounded-md border border-forground-border px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-gray outline-none disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 text-gray focus:ring-2 focus:ring-blue-700/30 focus:border-[0px] focus:ring-offset-1',
            className,
        )}
        {...props}
    >
        {children}
        <div className="flex items-center gap-1">
            {showDeselect && hasValue && (
                <button
                    onClick={handleClearClick}
                    className="opacity-70 hover:opacity-100 focus:outline-none"
                    type="button"
                    aria-label="Clear selection"
                >
                    <X className="h-4 w-4 text-gray" />
                </button>
            )}
            <SelectPrimitive.Icon asChild>
                <ChevronDown className='h-4 w-4 opacity-50' />
            </SelectPrimitive.Icon>
        </div>
    </SelectPrimitive.Trigger>
});
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectScrollUpButton = React.forwardRef<
    React.ComponentRef<typeof SelectPrimitive.ScrollUpButton>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
    <SelectPrimitive.ScrollUpButton
        ref={ref}
        className={cn(
            'flex cursor-default items-center justify-center py-1',
            className,
        )}
        {...props}
    >
        <ChevronUp className='h-4 w-4' />
    </SelectPrimitive.ScrollUpButton>
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

const SelectScrollDownButton = React.forwardRef<
    React.ComponentRef<typeof SelectPrimitive.ScrollDownButton>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
    <SelectPrimitive.ScrollDownButton
        ref={ref}
        className={cn(
            'flex cursor-default items-center justify-center py-1',
            className,
        )}
        {...props}
    >
        <ChevronDown className='h-4 w-4' />
    </SelectPrimitive.ScrollDownButton>
));
SelectScrollDownButton.displayName =
    SelectPrimitive.ScrollDownButton.displayName;

// Add searchable prop to SelectContent
const SelectContent = React.forwardRef<
    React.ComponentRef<typeof SelectPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content> & {
        searchable?: boolean;
    }
>(
    (
        {
            className,
            children,
            position = 'popper',
            searchable = false,
            ...props
        },
        ref,
    ) => {
        const [searchTerm, setSearchTerm] = React.useState('');
        const { onDeselect, showDeselect } = React.useContext(SelectDeselectContext);

        // Prevent select from closing when clicking the search input
        const handleSearchClick = (e: React.MouseEvent) => {
            e.stopPropagation();
        };

        return (
            <SelectSearchContext.Provider value={searchTerm}>
                <SelectPrimitive.Portal>
                    <SelectPrimitive.Content
                        ref={ref}
                        className={cn(
                            'relative z-[99999999] max-h-96 overflow-hidden rounded-md border border-forground-border bg-dropdown text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
                            position === 'popper' &&
                            'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
                            // Add this to ensure the width matches the trigger
                            'w-[var(--radix-select-trigger-width)] min-w-52',
                            className,
                        )}
                        position={position}
                        {...props}
                    >
                        <SelectScrollUpButton />
                        {searchable && (
                            <div className='sticky top-0 p-2 bg-dropdown border-b border-forground-border'>
                                <div className='relative'>
                                    <Search className='absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray opacity-70' />
                                    <input
                                        type='text'
                                        value={searchTerm}
                                        onChange={(e) =>
                                            setSearchTerm(e.target.value)
                                        }
                                        onClick={handleSearchClick}
                                        className='w-full rounded-md border border-forground-border bg-background px-8 py-1.5 text-sm focus:outline-none focus:ring-2 focus:primary-700/30'
                                        placeholder='Search...'
                                    />
                                    {searchTerm && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSearchTerm('');
                                            }}
                                            className='absolute right-2 top-1/2 transform -translate-y-1/2 text-gray opacity-70 hover:opacity-100'
                                        >
                                            <span className='sr-only'>
                                                Clear
                                            </span>
                                            <X className='h-4 w-4 text-danger' />
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                        <SelectPrimitive.Viewport
                            className={cn(
                                'p-1',
                                position === 'popper' &&
                                'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] text-gray',
                            )}
                        >
                            {children}
                        </SelectPrimitive.Viewport>
                        <SelectScrollDownButton />
                    </SelectPrimitive.Content>
                </SelectPrimitive.Portal>
            </SelectSearchContext.Provider>
        );
    },
);
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectLabel = React.forwardRef<
    React.ComponentRef<typeof SelectPrimitive.Label>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
    <SelectPrimitive.Label
        ref={ref}
        className={cn(
            'px-2 py-1.5 text-sm font-semibold text-dark-gray',
            className,
        )}
        {...props}
    />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

// Modified SelectItem to filter based on search term and optional searchValue
const SelectItem = React.forwardRef<
    React.ComponentRef<typeof SelectPrimitive.Item>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item> & {
        searchValue?: string;
    }
>(({ className, children, searchValue, ...props }, ref) => {
    const searchTerm = React.useContext(SelectSearchContext);

    // If there's a search term, check if this item matches
    if (searchTerm && searchTerm.trim() !== '') {
        const itemText = String(
            React.Children.toArray(children).join(''),
        ).toLowerCase();
        const lowerSearchTerm = searchTerm.toLowerCase();

        // First try to match with the displayed text
        const matchesDisplayText = itemText.includes(lowerSearchTerm);

        // If no match and searchValue is provided, try matching with searchValue
        const matchesSearchValue =
            !matchesDisplayText && searchValue
                ? searchValue.toLowerCase().includes(lowerSearchTerm)
                : false;

        // Don't render if neither matches
        if (!matchesDisplayText && !matchesSearchValue) {
            return null;
        }
    }

    return (
        <SelectPrimitive.Item
            ref={ref}
            className={cn(
                'relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground focus:ring-2 focus:ring-blue-700/30 data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
                // Add truncate class to handle long text
                'truncate',
                className,
            )}
            {...props}
        >
            <span className='absolute right-2 flex h-3.5 w-3.5 items-center justify-center'>
                <SelectPrimitive.ItemIndicator>
                    <Check className='h-4 w-4' />
                </SelectPrimitive.ItemIndicator>
            </span>
            <SelectPrimitive.ItemText className='truncate max-w-full block whitespace-nowrap overflow-hidden text-ellipsis'>
                {children}
            </SelectPrimitive.ItemText>
        </SelectPrimitive.Item>
    );
});
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectSeparator = React.forwardRef<
    React.ComponentRef<typeof SelectPrimitive.Separator>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
    <SelectPrimitive.Separator
        ref={ref}
        className={cn('-mx-1 my-1 h-px bg-forground-border', className)}
        {...props}
    />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

export {
    Select,
    SelectGroup,
    SelectValue,
    SelectTrigger,
    SelectContent,
    SelectLabel,
    SelectItem,
    SelectSeparator,
    SelectScrollUpButton,
    SelectScrollDownButton,
};
