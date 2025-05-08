'use client';

import { usePaymentHistoryApiQuery } from '@/redux/api/payment-history/paymentHistory';

export default function TransactionsStatistics({ data, isLoading }: any) {
    const paidAmount = data?.transactions
        ?.filter((t: any) => t.status === 'approved')
        ?.reduce((a: any, b: any) => a + (b.amount || 0), 0);

    const dueAmount = data?.totalAmount - paidAmount;

    return (
        <div className='flex flex-col md:flex-row gap-4 w-full mt-1'>
            {/* Total Amount Card */}
            <div className='rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 p-4 flex-1 relative overflow-hidden'>
                <div className='absolute inset-0 bg-white/10 rounded-full scale-150 translate-x-1/3 translate-y-1/3 opacity-20'></div>
                <div className='relative z-10'>
                    <h3 className='text-white text-sm font-medium mb-1'>
                        Total Amount
                    </h3>
                    <p className='text-white text-2xl font-bold'>
                        ${data?.totalAmount?.toFixed(2) || 0}
                    </p>
                </div>
            </div>

            {/* Due Amount Card */}
            <div className='rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 p-4 flex-1 relative overflow-hidden'>
                <div className='absolute inset-0 bg-white/10 rounded-full scale-150 translate-x-1/3 translate-y-1/3 opacity-20'></div>
                <div className='relative z-10'>
                    <h3 className='text-white text-sm font-medium mb-1'>
                        Due Amount
                    </h3>
                    <p className='text-white text-2xl font-bold'>
                        ${dueAmount?.toFixed(2) || 0}
                    </p>
                </div>
            </div>

            {/* Paid Amount Card */}
            <div className='rounded-lg bg-gradient-to-br from-green-500 to-green-600 p-4 flex-1 relative overflow-hidden'>
                <div className='absolute inset-0 bg-white/10 rounded-full scale-150 translate-x-1/3 translate-y-1/3 opacity-20'></div>
                <div className='relative z-10'>
                    <h3 className='text-white text-sm font-medium mb-1'>
                        Paid Amount
                    </h3>
                    <p className='text-white text-2xl font-bold'>
                        ${paidAmount?.toFixed(2) || 0}
                    </p>
                </div>
            </div>
        </div>
    );
}
