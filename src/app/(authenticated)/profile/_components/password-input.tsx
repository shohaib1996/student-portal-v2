'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Info, Eye, EyeOff } from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import GlobalTooltip from '@/components/global/GlobalTooltip';

interface PasswordInputProps {
    id: string;
    label: string;
    tooltipText: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    required?: boolean;
}

export default function PasswordInput({
    id,
    label,
    tooltipText,
    value,
    onChange,
    placeholder = 'Enter password',
    required = false,
}: PasswordInputProps) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className='space-y-2'>
            <div className='flex items-center'>
                <Label htmlFor={id} className='text-base font-medium mr-1'>
                    {label}{' '}
                    {required && <span className='text-red-500'>*</span>}
                </Label>
                <GlobalTooltip
                    className='shadow-md border border-forground-border'
                    tooltip={tooltipText}
                >
                    <h2 className='pt-1 text-dark-gray cursor-pointer'>
                        <Info size={16} />
                    </h2>
                </GlobalTooltip>
            </div>
            <div className='relative'>
                <Input
                    id={id}
                    type={showPassword ? 'text' : 'password'}
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className='pr-10 bg-foreground'
                    required={required}
                />
                <button
                    type='button'
                    onClick={() => setShowPassword(!showPassword)}
                    className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500'
                >
                    {showPassword ? (
                        <EyeOff className='h-5 w-5' />
                    ) : (
                        <Eye className='h-5 w-5' />
                    )}
                </button>
            </div>
        </div>
    );
}
