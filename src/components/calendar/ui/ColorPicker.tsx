'use client';

import * as React from 'react';
import { Paintbrush } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface ColorPickerProps {
    value: string;
    onChange: (value: string) => void;
    className?: string;
}

export function ColorPicker({ value, onChange, className }: ColorPickerProps) {
    const [isOpen, setIsOpen] = React.useState(false);

    // Ensure the value is a valid hex color with a default
    const displayColor = /^#[0-9A-Fa-f]{6}$/.test(value) ? value : '#000000';

    // Handle color selection from the color input
    const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newColor = e.target.value;
        onChange(newColor);
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant='outline'
                    className={cn(
                        'w-full justify-start text-left font-normal',
                        className,
                    )}
                >
                    <div
                        className='mr-2 h-4 w-4 rounded-full border'
                        style={{ backgroundColor: displayColor }}
                    />
                    <span className='flex-1'>{value}</span>
                    <Paintbrush className='h-4 w-4 opacity-50' />
                </Button>
            </PopoverTrigger>
            <PopoverContent className='w-64 p-3'>
                <div className='flex flex-col gap-2'>
                    <input
                        type='color'
                        value={displayColor}
                        onChange={handleColorChange}
                        className='w-full h-10 cursor-pointer'
                    />
                    <div className='text-xs text-muted-foreground mt-1'>
                        Click and drag to select a color
                    </div>
                </div>

                <div className='flex items-center justify-between mt-4'>
                    <div className='text-xs text-muted-foreground'>
                        Selected: {value}
                    </div>
                    <Button
                        size='sm'
                        onClick={() => {
                            onChange('#000000');
                            setIsOpen(false);
                        }}
                    >
                        Reset
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}
