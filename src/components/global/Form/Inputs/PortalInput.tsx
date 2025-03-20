'use client';
import { FormControl, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import React from 'react';
import { Controller } from 'react-hook-form';

interface FormInputProps {
    name: string;
    type?: string;
    label?: string;
    placeholder?: string;
    className?: string;
    readonly?: boolean;
    required?: boolean;
    rest?: React.InputHTMLAttributes<HTMLInputElement>;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    passwordShowingFunction?: () => void;
    ngClass?: string;
}

export default function PortalInput({
    name,
    type = 'text',
    label,
    placeholder,
    className,
    readonly,
    leftIcon,
    rightIcon,
    required = false,
    passwordShowingFunction,
    ngClass,
    ...rest
}: FormInputProps) {
    return (
        <div className='relative w-full'>
            <Controller
                name={name}
                render={({ field, fieldState: { error } }) => {
                    return (
                        <FormItem className={cn(`${className}`)}>
                            <FormControl>
                                <div className='flex w-full flex-col'>
                                    <label
                                        htmlFor={name}
                                        className='text-sm font-semibold text-gray'
                                    >
                                        {label}
                                        {required && (
                                            <span className='ml-1 text-xs text-destructive'>
                                                *
                                            </span>
                                        )}
                                    </label>

                                    <div className='relative flex w-full items-center'>
                                        {leftIcon && (
                                            <div className='absolute left-3 flex items-center text-gray'>
                                                {leftIcon}
                                            </div>
                                        )}
                                        <Input
                                            className={cn(
                                                `w-full bg-background text-gray placeholder:text-gray ${ngClass}`,
                                                leftIcon ? 'pl-10' : '',
                                                rightIcon ? 'pr-10' : '',
                                            )}
                                            type={type}
                                            {...field}
                                            value={field?.value}
                                            placeholder={placeholder}
                                            id={name}
                                            {...rest}
                                            readOnly={readonly}
                                            required={required}
                                        />
                                        {rightIcon && (
                                            <div
                                                onClick={
                                                    passwordShowingFunction
                                                }
                                                className='absolute right-3 flex items-center text-gray'
                                            >
                                                {rightIcon}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </FormControl>
                            {error && (
                                <strong className='text-xs text-destructive'>
                                    {error?.message}
                                </strong>
                            )}
                        </FormItem>
                    );
                }}
            />
        </div>
    );
}
