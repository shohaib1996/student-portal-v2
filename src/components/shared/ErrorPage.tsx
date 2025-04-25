'use client';

import type React from 'react';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { AlertCircle, RefreshCw, Home, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

interface ErrorStateProps {
    title?: string;
    description?: string;
    errorMessage?: string;
    onRetry?: () => Promise<void>;
    showHomeButton?: boolean;
    showBackButton?: boolean;
    customAction?: {
        label: string;
        onClick: () => void;
        icon?: React.ReactNode;
    };
}

export function ErrorState({
    title = 'Error Fetching Data',
    description = "We couldn't load the data you requested. This could be due to a network issue or a problem with our servers.",
    errorMessage,
    onRetry,
    showHomeButton = true,
    showBackButton = true,
    customAction,
}: ErrorStateProps) {
    const [isRetrying, setIsRetrying] = useState(false);

    const handleRetry = async () => {
        if (!onRetry) {
            return;
        }

        setIsRetrying(true);
        try {
            await onRetry();
        } catch (error) {
            console.error('Retry failed:', error);
        } finally {
            setIsRetrying(false);
        }
    };

    return (
        <div className='flex h-[90vh] items-center justify-center p-4'>
            <Card className='mx-auto max-w-md w-full shadow-lg'>
                <CardHeader className='text-center pb-2'>
                    <div className='mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-50'>
                        <AlertCircle className='h-10 w-10 text-red-500' />
                    </div>
                    <CardTitle className='text-2xl font-bold'>
                        {title}
                    </CardTitle>
                    <CardDescription className='text-base mt-2'>
                        {description}
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    {errorMessage && (
                        <div className='my-4 rounded-md bg-slate-50 p-4 text-sm text-slate-900 font-mono overflow-auto'>
                            {errorMessage}
                        </div>
                    )}

                    <div className='mt-2 flex justify-center'>
                        <svg
                            viewBox='0 0 24 24'
                            fill='none'
                            xmlns='http://www.w3.org/2000/svg'
                            className='size-16'
                        >
                            <g id='SVGRepo_bgCarrier' stroke-width='0'></g>
                            <g
                                id='SVGRepo_tracerCarrier'
                                stroke-linecap='round'
                                stroke-linejoin='round'
                            ></g>
                            <g id='SVGRepo_iconCarrier'>
                                <path
                                    d='M10 9H8C6.34315 9 5 10.3431 5 12C5 13.6569 6.34315 15 8 15H9M9 15L12 12M9 15L5 19M14 9H15M15 9L19 5M15 9L12 12M14 15H16C17.6569 15 19 13.6569 19 12C19 11.1716 18.6642 10.4216 18.1213 9.87868M8 12H12M15 12H16'
                                    stroke='#464455'
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                ></path>
                            </g>
                        </svg>
                    </div>
                </CardContent>

                <CardFooter className='flex flex-col sm:flex-row gap-3 pt-2'>
                    {onRetry && (
                        <Button
                            onClick={handleRetry}
                            className='w-full sm:w-auto'
                            disabled={isRetrying}
                        >
                            {isRetrying ? (
                                <>
                                    <RefreshCw className='mr-2 h-4 w-4 animate-spin' />
                                    Retrying...
                                </>
                            ) : (
                                <>
                                    <RefreshCw className='mr-2 h-4 w-4' />
                                    Retry
                                </>
                            )}
                        </Button>
                    )}

                    {showBackButton && (
                        <Button
                            variant='outline'
                            onClick={() => window.history.back()}
                            className='w-full sm:w-auto'
                        >
                            <ArrowLeft className='mr-2 h-4 w-4' />
                            Go Back
                        </Button>
                    )}

                    {showHomeButton && (
                        <Button
                            variant='outline'
                            asChild
                            className='w-full sm:w-auto'
                        >
                            <Link href='/' className='flex items-center'>
                                <Home className='mr-2 h-4 w-4' />
                                Home
                            </Link>
                        </Button>
                    )}

                    {customAction && (
                        <Button
                            onClick={customAction.onClick}
                            className='w-full sm:w-auto'
                        >
                            {customAction.icon && (
                                <span className='mr-2'>
                                    {customAction.icon}
                                </span>
                            )}
                            {customAction.label}
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}
