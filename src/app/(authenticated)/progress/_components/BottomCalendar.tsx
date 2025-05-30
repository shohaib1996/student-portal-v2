import { Progress } from '@/components/ui/progress';
import { Check, Clock } from 'lucide-react';
import Link from 'next/link';

const BottomCalendar = ({ data }: { data: any }) => {
    return (
        <div className='bg-foreground rounded-xl border border-border p-4 mb-6'>
            <div className='flex justify-between items-center mb-4'>
                <div>
                    <h3 className='font-medium text-black'>Calendar</h3>
                    <p className='text-sm text-gray'>
                        All the details about the calendar event are here
                    </p>
                </div>
                <Link
                    href='/calendar'
                    className='text-sm text-nowrap text-primary-white bg-primary-light rounded-lg py-2 px-2.5 font-medium hover:underline flex items-center'
                >
                    View More
                    <svg
                        width='16'
                        height='16'
                        viewBox='0 0 16 16'
                        fill='none'
                        xmlns='http://www.w3.org/2000/svg'
                        className='ml-1 hidden md:block'
                    >
                        <path
                            d='M6.66675 12L10.6667 8L6.66675 4'
                            stroke='currentColor'
                            strokeWidth='2'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                        />
                    </svg>
                </Link>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-4'>
                {/* Total Accepted */}
                <div className='bg-green-50 dark:bg-background rounded-lg p-4'>
                    <div className='flex items-center gap-2 mb-2'>
                        <div className='w-6 h-6 bg-green-100 rounded-full flex items-center justify-center'>
                            <Check className='h-3 w-3 text-green-600' />
                        </div>
                        <span className='text-sm font-medium text-black'>
                            Total Accepted
                        </span>
                    </div>
                    <div className='text-2xl font-bold text-black mb-2'>
                        {data?.finished}
                    </div>
                    <Progress
                        value={parseFloat(
                            ((data?.finished / data?.total) * 100).toFixed(0),
                        )}
                        className='h-2 bg-white text-green-500'
                        indicatorClass='bg-green-700'
                    />
                    <div className='text-xs text-gray text-right mt-1'>
                        {parseFloat(
                            ((data?.finished / data?.total) * 100).toFixed(0),
                        )}
                        %
                    </div>
                </div>

                {/* Total pending */}
                <div className='bg-orange-50 dark:bg-background rounded-lg p-4'>
                    <div className='flex items-center gap-2 mb-2'>
                        <div className='w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center'>
                            <Clock className='h-3 w-3 text-orange-600' />
                        </div>
                        <span className='text-sm font-medium text-black'>
                            Total pending
                        </span>
                    </div>
                    <div className='text-2xl font-bold text-black mb-2'>
                        {data?.current}
                    </div>
                    <Progress
                        value={parseFloat(
                            ((data?.current / data?.total) * 100).toFixed(0),
                        )}
                        className='h-2 bg-white text-orange-500'
                        indicatorClass='bg-orange-700'
                    />
                    <div className='text-xs text-gray text-right mt-1'>
                        {parseFloat(
                            ((data?.current / data?.total) * 100).toFixed(0),
                        )}
                        %
                    </div>
                </div>

                {/* Denied */}
                <div className='bg-red-50 dark:bg-background rounded-lg p-4'>
                    <div className='flex items-center gap-2 mb-2'>
                        <div className='w-6 h-6 bg-red-100 rounded-full flex items-center justify-center'>
                            <svg
                                width='12'
                                height='12'
                                viewBox='0 0 24 24'
                                fill='none'
                                xmlns='http://www.w3.org/2000/svg'
                                className='text-red-600'
                            >
                                <path
                                    d='M6 18L18 6M6 6l12 12'
                                    stroke='currentColor'
                                    strokeWidth='2'
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                />
                            </svg>
                        </div>
                        <span className='text-sm font-medium text-black'>
                            Denied
                        </span>
                    </div>
                    <div className='text-2xl font-bold text-black mb-2'>
                        {data?.recurrent}
                    </div>
                    <Progress
                        value={parseFloat(
                            ((data?.recurrent / data?.total) * 100).toFixed(0),
                        )}
                        className='h-2 bg-white'
                        indicatorClass='bg-red-700'
                    />
                    <div className='text-xs text-gray text-right mt-1'>
                        {parseFloat(
                            ((data?.recurrent / data?.total) * 100).toFixed(0),
                        )}
                        %
                    </div>
                </div>

                {/* Proposed New Time */}
                <div className='bg-cyan-50 dark:bg-background rounded-lg p-4'>
                    <div className='flex items-center gap-2 mb-2'>
                        <div className='w-6 h-6 bg-cyan-100 rounded-full flex items-center justify-center'>
                            <svg
                                width='12'
                                height='12'
                                viewBox='0 0 24 24'
                                fill='none'
                                xmlns='http://www.w3.org/2000/svg'
                                className='text-cyan-600'
                            >
                                <path
                                    d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                                    stroke='currentColor'
                                    strokeWidth='2'
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                />
                            </svg>
                        </div>
                        <span className='text-sm font-medium text-black'>
                            Proposed New Time
                        </span>
                    </div>
                    <div className='text-2xl font-bold text-black mb-2'>
                        {data?.upcoming}
                    </div>
                    <Progress
                        value={parseFloat(
                            ((data?.upcoming / data?.total) * 100).toFixed(0),
                        )}
                        className='h-2 bg-white'
                        indicatorClass='bg-cyan-700'
                    />
                    <div className='text-xs text-gray text-right mt-1'>
                        {parseFloat(
                            ((data?.upcoming / data?.total) * 100).toFixed(0),
                        )}
                        %
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BottomCalendar;
