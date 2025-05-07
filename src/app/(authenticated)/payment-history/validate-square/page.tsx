'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { instance } from '@/lib/axios/axiosInstance';

function Page() {
    const searchParams = useSearchParams();
    const transactionId = searchParams.get('transactionId');

    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);

    useEffect(() => {
        if (transactionId) {
            instance
                .post(`/transaction/validatesquarepayment`, { transactionId })
                .then((res) => {
                    console.log(res);
                    setIsLoading(false);
                    setTimeout(() => {
                        window.location.href = '/payment-history';
                    }, 3000);
                })
                .catch((err) => {
                    console.log(err);
                    setIsLoading(false);
                    setIsError(true);
                    setTimeout(() => {
                        window.location.href = '/payment-history';
                    }, 3000);
                });
        }
    }, [transactionId]);

    return (
        <div className='min-h-screen bg-gray-50 flex items-center justify-center p-4'>
            <div className='bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center'>
                {isLoading ? (
                    <div className='py-6'>
                        <div className='inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4'></div>
                        <h3 className='text-xl font-semibold text-gray-800'>
                            Validating Payment
                        </h3>
                        <p className='text-gray-500 mt-2'>
                            Please wait while we process your transaction...
                        </p>
                    </div>
                ) : isError ? (
                    <div className='py-6'>
                        <div className='mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4'>
                            <svg
                                className='h-8 w-8 text-red-600'
                                fill='none'
                                viewBox='0 0 24 24'
                                stroke='currentColor'
                            >
                                <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    strokeWidth={2}
                                    d='M6 18L18 6M6 6l12 12'
                                />
                            </svg>
                        </div>
                        <h3 className='text-xl font-semibold text-red-600'>
                            Payment Failed
                        </h3>
                        <p className='text-gray-500 mt-2'>
                            Redirecting to payment history in 3 seconds...
                        </p>
                        <div className='mt-6 p-4 bg-red-50 rounded-md'>
                            <p className='text-sm text-gray-700'>
                                If you think this is an error, please contact
                                our support team.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className='py-6'>
                        <div className='mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4'>
                            <svg
                                className='h-8 w-8 text-green-600'
                                fill='none'
                                viewBox='0 0 24 24'
                                stroke='currentColor'
                            >
                                <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    strokeWidth={2}
                                    d='M5 13l4 4L19 7'
                                />
                            </svg>
                        </div>
                        <h3 className='text-xl font-semibold text-green-600'>
                            Payment Successful
                        </h3>
                        <p className='text-gray-500 mt-2'>
                            Redirecting to payment history in 3 seconds...
                        </p>
                        <div className='mt-6 p-4 bg-green-50 rounded-md'>
                            <p className='text-sm text-gray-700'>
                                Thank you for your payment!
                            </p>
                        </div>
                    </div>
                )}

                {/* Progress bar */}
                {!isLoading && (
                    <div className='w-full mt-4'>
                        <div className='h-1 bg-gray-200 rounded-full overflow-hidden'>
                            <div
                                className={`h-full ${isError ? 'bg-red-500' : 'bg-green-500'} transition-all duration-3000 ease-linear`}
                                style={{
                                    width: '100%',
                                    animationName: 'progress',
                                    animationDuration: '3s',
                                    animationTimingFunction: 'linear',
                                }}
                            ></div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Page;
