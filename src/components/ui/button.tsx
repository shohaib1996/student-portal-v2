import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';
import SpinIcon from '../svgs/common/SpinIcon';
import ExportIcon from '../svgs/common/ExportIcon';
import ImportIcon from '../svgs/common/ImportIcon';
import SortIcon from '../svgs/common/SortIcon';
import RecycleIcon from '../svgs/common/RecycleIcon';
import GlobalTooltip from '../global/GlobalTooltip';
import { History, Trash } from 'lucide-react';

const buttonVariants = cva(
    'inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0',
    {
        variants: {
            variant: {
                default:
                    'bg-primary text-white hover:text-black shadow hover:bg-primary-foreground',
                tertiary: 'bg-tertiary text-white shadow hover:bg-tertiary/90',
                destructive:
                    'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
                outline:
                    'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
                secondary:
                    'bg-secondary text-text-primary hover:bg-secondary border border-secondary-border stroke-primary fill-primary',
                primary_light:
                    'bg-primary-light text-primary-white hover:bg-secondary border stroke-primary fill-primary',
                'secondary-gray':
                    'bg-secondary text-dark-gray hover:bg-secondary border border-secondary-border stroke-dark-gray fill-primary',
                ghost: 'hover:bg-accent hover:text-accent-foreground',
                link: 'text-primary underline-offset-4 hover:underline',
                plain: 'bg-tranparent border border border-forground-border text-dark-gray stroke-dark-gray fill-dark-gray',
                white: 'bg-pure-white border border border-forground-border text-primary stroke-dark-gray fill-dark-gray',
                export_button:
                    'size-9 rounded-md bg-primary-light hover:bg-secondary border',
                import_button:
                    'size-9 rounded-md bg-primary-light border hover:bg-secondary border-secondary-border',
                sort_button:
                    'size-9 rounded-md bg-primary-light border hover:bg-secondary border-secondary-border',
                recycle_button:
                    'size-9 rounded-md bg-primary-light border hover:bg-secondary border-secondary-border',
                history_button:
                    'size-9 rounded-md bg-primary-light border hover:bg-secondary border-secondary-border',
                delete_button:
                    'size-9 rounded-md bg-danger/20 text-danger border hover:bg-secondary border-secondary-border',
                danger_light:
                    'rounded-md bg-danger/20 text-danger border hover:bg-secondary border-secondary-border',
            },
            size: {
                default: 'h-9 text-sm px-3 py-2 rounded-lg font-semibold',
                sm: 'h-8 rounded-md px-3 text-xs',
                lg: 'h-10 rounded-md px-8',
                icon: 'h-9 w-9',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    },
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {
    asChild?: boolean;
    icon?: React.ReactNode;
    isLoading?: boolean;
    tooltip?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            className,
            variant,
            size,
            asChild = false,
            isLoading,
            children,
            disabled,
            tooltip,
            icon,
            ...props
        },
        ref,
    ) => {
        const Comp = asChild ? Slot : 'button';

        const buttonComp = (
            <Comp
                disabled={disabled || isLoading}
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            >
                {variant === 'export_button' ? (
                    isLoading ? (
                        <SpinIcon
                            className={cn(
                                'animate-spin size-4 stroke-dark-gray',
                            )}
                        />
                    ) : (
                        <ExportIcon className='stroke-dark-gray' />
                    )
                ) : variant === 'import_button' ? (
                    isLoading ? (
                        <SpinIcon
                            className={cn(
                                'animate-spin size-4 stroke-dark-gray',
                            )}
                        />
                    ) : (
                        <ImportIcon className='stroke-dark-gray' />
                    )
                ) : variant === 'sort_button' ? (
                    isLoading ? (
                        <SpinIcon
                            className={cn(
                                'animate-spin size-4 stroke-dark-gray',
                            )}
                        />
                    ) : (
                        <SortIcon className='stroke-dark-gray' />
                    )
                ) : variant === 'recycle_button' ? (
                    isLoading ? (
                        <SpinIcon
                            className={cn('animate-spin size-4 stroke-primary')}
                        />
                    ) : (
                        <RecycleIcon />
                    )
                ) : variant === 'history_button' ? (
                    isLoading ? (
                        <SpinIcon
                            className={cn(
                                'animate-spin size-4 stroke-dark-gray',
                            )}
                        />
                    ) : (
                        <History className='stroke-dark-gray' size={20} />
                    )
                ) : variant === 'delete_button' ? (
                    isLoading ? (
                        <SpinIcon
                            className={cn(
                                'animate-spin size-4 stroke-dark-gray',
                            )}
                        />
                    ) : (
                        <Trash size={20} />
                    )
                ) : (
                    <div className='flex gap-1 items-center'>
                        {isLoading ? (
                            <SpinIcon
                                className={cn(
                                    'animate-spin size-4 stroke-white',
                                    {
                                        'stroke-primary':
                                            variant === 'secondary',
                                        'stroke-dark-gray':
                                            variant === 'secondary-gray' ||
                                            variant === 'plain',
                                    },
                                )}
                            />
                        ) : (
                            icon
                        )}
                        {children}
                    </div>
                )}
            </Comp>
        );

        const withTooltip =
            tooltip ||
            variant === 'export_button' ||
            variant === 'import_button' ||
            variant === 'sort_button' ||
            variant === 'recycle_button' ||
            variant === 'history_button';

        const customTooltip = tooltip
            ? tooltip
            : variant === 'export_button'
              ? 'Export'
              : variant === 'import_button'
                ? 'Import'
                : variant === 'sort_button'
                  ? 'Sort'
                  : variant === 'recycle_button'
                    ? 'Recycle'
                    : variant === 'history_button'
                      ? 'History'
                      : '';

        return withTooltip ? (
            <GlobalTooltip tooltip={customTooltip}>{buttonComp}</GlobalTooltip>
        ) : (
            buttonComp
        );
    },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
