import * as React from 'react';
import { cn } from '@/lib/utils';

interface InputProps
    extends Omit<
        React.InputHTMLAttributes<HTMLInputElement>,
        'prefix' | 'suffix'
    > {
    suffix?: React.ReactNode;
    prefix?: React.ReactNode;
    removeSuffixOnHover?: boolean;
    inputClassName?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    (
        {
            className,
            inputClassName,
            suffix,
            prefix,
            removeSuffixOnHover,
            type,
            ...props
        },
        ref,
    ) => {
        const [isFocused, setIsFocused] = React.useState(false);

        const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
            setIsFocused(true);
            if (props.onFocus) {
                props.onFocus(e);
            }
        };

        const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
            setIsFocused(false);
            if (props.onBlur) {
                props.onBlur(e);
            }
        };

        if (suffix || prefix) {
            return (
                <div
                    className={cn(
                        'flex items-center w-full rounded-lg bg-background transition-colors group border border-input',
                        isFocused &&
                            'ring-2 ring-blue-700/30 border-transparent',
                        className,
                    )}
                >
                    {prefix && (
                        <div className='pl-3 flex items-center'>{prefix}</div>
                    )}
                    <input
                        ref={ref}
                        type={type}
                        className={cn(
                            'flex h-10 text-gray w-full bg-transparent outline-none px-3 py-1 text-base file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus:outline-none border-none focus:ring-0',
                            {
                                'pl-2': prefix,
                                'pr-2': suffix,
                            },
                            inputClassName,
                        )}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        {...props}
                    />
                    {suffix && (
                        <div
                            className={cn(
                                'pr-3 flex items-center',
                                removeSuffixOnHover &&
                                    'group-focus-within:hidden',
                            )}
                        >
                            {suffix}
                        </div>
                    )}
                </div>
            );
        } else {
            return (
                <input
                    ref={ref}
                    type={type}
                    className={cn(
                        'flex h-10 w-full bg-background text-gray rounded-md border border-input px-3 py-1 text-base file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-700/30',
                        className,
                    )}
                    {...props}
                />
            );
        }
    },
);

Input.displayName = 'Input';

export { Input };
