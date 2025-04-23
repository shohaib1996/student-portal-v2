'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface TagsInputProps {
    tags: string[];
    selectedTags: string[];
    setSelectedTags: (tags: string[]) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
}

export function TagsInput({
    tags,
    selectedTags,
    setSelectedTags,
    placeholder = 'Search or add tags...',
    className,
    disabled = false,
}: TagsInputProps) {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [inputValue, setInputValue] = React.useState('');
    const [open, setOpen] = React.useState(false);

    const handleUnselect = (tag: string) => {
        setSelectedTags(selectedTags.filter((s) => s !== tag));
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const input = e.currentTarget;

        // When pressing enter and there's a value
        if (e.key === 'Enter' && inputValue) {
            e.preventDefault();

            // If the tag doesn't exist in the selected tags, add it
            if (!selectedTags.includes(inputValue)) {
                setSelectedTags([...selectedTags, inputValue]);
            }

            setInputValue('');
        } else if (
            e.key === 'Backspace' &&
            !inputValue &&
            selectedTags.length > 0
        ) {
            // Remove the last tag when pressing backspace with an empty input
            handleUnselect(selectedTags[selectedTags.length - 1]);
        }
    };

    const selectTag = (tag: string) => {
        if (!selectedTags.includes(tag)) {
            setSelectedTags([...selectedTags, tag]);
        }
        setInputValue('');
        // Keep focus on the input after selection
        setTimeout(() => {
            inputRef.current?.focus();
        }, 0);
    };

    // Filter tags that match the input value and aren't already selected
    const filteredTags = tags.filter(
        (tag) =>
            tag.toLowerCase().includes(inputValue.toLowerCase()) &&
            !selectedTags.includes(tag),
    );

    return (
        <div className={cn('relative', className)}>
            <div
                className={cn(
                    'flex flex-wrap border-forground-border gap-1.5 p-1.5 rounded-md border bg-foreground min-h-10',
                    selectedTags.length > 0 && 'pb-1.5',
                )}
                onClick={() => inputRef.current?.focus()}
            >
                {selectedTags.map((tag) => (
                    <Badge
                        key={tag}
                        variant='secondary'
                        className='flex items-center gap-1 px-2'
                    >
                        {tag}
                        <button
                            type='button'
                            className='rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1'
                            onMouseDown={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                            }}
                            onClick={() => handleUnselect(tag)}
                            disabled={disabled}
                        >
                            <X className='h-3 w-3 text-muted-foreground hover:text-foreground' />
                        </button>
                    </Badge>
                ))}
                <div className='flex-1'>
                    <input
                        ref={inputRef}
                        value={inputValue}
                        onChange={(e) => {
                            setInputValue(e.target.value);
                            if (!open) {
                                setOpen(true);
                            }
                        }}
                        onKeyDown={handleKeyDown}
                        onFocus={() => setOpen(true)}
                        onBlur={() => {
                            setTimeout(() => setOpen(false), 200);
                        }}
                        className='w-full text-sm bg-transparent outline-none placeholder:text-muted-foreground px-1.5 py-0.5'
                        placeholder={
                            selectedTags.length === 0 ? placeholder : ''
                        }
                        disabled={disabled}
                    />
                </div>
            </div>
            {open && inputRef.current && (
                <div className='absolute w-full z-10 mt-1'>
                    <Command className='rounded-lg border shadow-md'>
                        <CommandList>
                            <CommandEmpty>
                                {inputValue ? (
                                    <div className='py-2 px-4 text-sm'>
                                        No tags found. Press{' '}
                                        <kbd className='px-1.5 py-0.5 bg-muted rounded text-xs'>
                                            Enter
                                        </kbd>{' '}
                                        to create &quot;
                                        {inputValue}&quot;
                                    </div>
                                ) : (
                                    <div className='py-2 px-4 text-sm'>
                                        No tags found.
                                    </div>
                                )}
                            </CommandEmpty>
                            <CommandGroup>
                                {filteredTags.map((tag) => (
                                    <CommandItem
                                        key={tag}
                                        value={tag}
                                        onSelect={(currentValue) => {
                                            selectTag(currentValue);
                                        }}
                                        className='cursor-pointer text-dark-gray'
                                    >
                                        {tag}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </div>
            )}
        </div>
    );
}
