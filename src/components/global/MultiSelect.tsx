'use client';
import React, {
    MouseEvent as RMouseEvent,
    useEffect,
    useRef,
    useState,
} from 'react';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import { Search, XIcon } from 'lucide-react';
import { Input } from '../ui/input';

interface Option {
    value: string;
    label: string;
    disable?: boolean;
}

type TProps = {
    value: string[];
    placeholder?: string;
    onChange: (val: string[]) => void;
    options: Option[];
    searchable?: boolean;
    className?: string;
    wrapperClassName?: string;
    disabled?: boolean;
    max?: number;
};

const MultiSelect = ({
    value = [],
    onChange,
    options,
    placeholder,
    wrapperClassName,
    disabled,
    className,
    searchable = false,
    max,
}: TProps) => {
    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const menuRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleOutsideClick = (e: MouseEvent) => {
            if (menuRef && menuRef.current && e.target instanceof Node) {
                if (!menuRef.current.contains(e.target)) {
                    setOpen(false);
                }
            }
        };

        window.addEventListener('click', handleOutsideClick);

        return () => {
            return window.removeEventListener('click', handleOutsideClick);
        };
    }, []);

    useEffect(() => {
        // Focus search input when dropdown opens
        if (open && searchable && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [open, searchable]);

    // Reset search query when dropdown closes
    useEffect(() => {
        if (!open) {
            setSearchQuery('');
        }
    }, [open]);

    const handleSelect = (option: Option) => {
        const newVal = [...value, option.value];
        onChange(newVal);
    };

    const handleRemove = (e: RMouseEvent<HTMLButtonElement>, v: string) => {
        e.stopPropagation();
        onChange(value?.filter((val) => v !== val));
    };

    const handleSearchInputClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent dropdown from closing
    };

    const filteredOptions = options.filter((op) => {
        // Filter out already selected options
        if (value?.includes(op.value)) {
            return false;
        }

        // Filter by search query if there is one
        if (searchQuery) {
            return op.label.toLowerCase()?.includes(searchQuery.toLowerCase());
        }

        return true;
    });

    return (
        <div ref={menuRef} className={cn('relative w-full', wrapperClassName)}>
            <div
                aria-disabled={disabled}
                onClick={(e) => {
                    e.stopPropagation();
                    if (disabled) {
                        return;
                    }
                    setOpen((prev) => !prev);
                }}
                className={cn(
                    'border flex cursor-pointer flex-wrap py-1 px-2 text-gray text-xs items-center gap-1 border-forground-border w-full bg-background min-h-10 rounded-md',
                    className,
                    {
                        'opacity-50 cursor-not-allowed': disabled,
                    },
                )}
            >
                {value?.length > 0 ? (
                    value.map((v, i) => (
                        <div
                            className='bg-foreground w-full flex gap-1 items-center shadow-sm rounded-sm px-2 py-1'
                            key={i}
                        >
                            {options.find((op) => op.value === v)?.label}
                            <button
                                className='w-full'
                                disabled={disabled}
                                type='button'
                                onClick={(e) => handleRemove(e, v)}
                            >
                                <XIcon size={14} />
                            </button>
                        </div>
                    ))
                ) : (
                    <span className='text-muted-foreground'>
                        {placeholder || 'Select options'}
                    </span>
                )}
            </div>
            {open && (
                <div
                    className={cn(
                        'absolute top-11 rounded-md z-50 shadow-md max-h-80 overflow-y-auto w-full bg-dropdown border border-forground-border',
                        'right-0',
                    )}
                >
                    {searchable && (
                        <div className='p-2 sticky top-0 bg-dropdown border-b border-forground-border'>
                            <div className='relative'>
                                <Search className='absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4' />
                                <Input
                                    ref={searchInputRef}
                                    type='text'
                                    placeholder='Search options...'
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    onClick={handleSearchInputClick}
                                    className='pl-8 h-8 text-sm border'
                                />
                            </div>
                        </div>
                    )}
                    <div className='space-y-2 p-2'>
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((op, i) => (
                                <button
                                    type='button'
                                    disabled={max ? value.length >= max : false}
                                    onClick={() => handleSelect(op)}
                                    className='text-gray w-full text-start text-sm cursor-pointer capitalize hover:bg-muted p-1 rounded-sm'
                                    key={i}
                                >
                                    {op.label}
                                </button>
                            ))
                        ) : (
                            <div className='text-muted-foreground text-sm p-1'>
                                No options available
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MultiSelect;
