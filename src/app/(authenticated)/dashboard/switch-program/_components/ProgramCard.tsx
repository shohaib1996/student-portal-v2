import {
    ArrowRight,
    Package,
    Building,
    Users,
    Calendar,
    CheckCircle,
    XCircle,
    Clock,
} from 'lucide-react';
import Image from 'next/image';
import React from 'react';

type Status = 'approved' | 'pending' | 'cancelled';

export interface BootcampProgram {
    id: string;
    title: string;
    image: string;
    rating: number;
    status: Status;
    user: {
        name: string;
        avatar: string;
        online?: boolean;
    };
    organization: string;
    branch: string;
    date: string;
    payment: {
        totalFee: number;
        paid: number;
        due: number;
    };
    progress: number;
    switched?: boolean;
}

const ProgramCard = ({ program }: { program: BootcampProgram }) => {
    const getStatusBadge = (status: Status) => {
        switch (status) {
            case 'approved':
                return (
                    <div className='absolute top-3 left-3 bg-background z-10 text-green-600 px-3 py-1 rounded-full flex items-center gap-1 text-sm font-medium'>
                        <CheckCircle className='h-4 w-4' />
                        Approved
                    </div>
                );
            case 'pending':
                return (
                    <div className='absolute top-3 left-3 bg-background z-10 text-amber-500 px-3 py-1 rounded-full flex items-center gap-1 text-sm font-medium'>
                        <Clock className='h-4 w-4' />
                        Pending
                    </div>
                );
            case 'cancelled':
                return (
                    <div className='absolute top-3 left-3 bg-background z-10 text-red-500 px-3 py-1 rounded-full flex items-center gap-1 text-sm font-medium'>
                        <XCircle className='h-4 w-4' />
                        Cancelled
                    </div>
                );
        }
    };

    return (
        <div className='bg-foreground rounded-xl overflow-hidden border border-gray-200'>
            {/* Banner Image with Status Badge */}
            <div className='relative'>
                {getStatusBadge(program.status)}
                <Image
                    src={program.image || '/placeholder.svg'}
                    alt={program.title}
                    className='object-contain md:object-cover w-[403px] h-[200px]'
                    width={900}
                    height={599}
                />
                <div className='absolute bottom-2 left-3'>
                    <div className='flex items-center gap-2'>
                        <Package className='h-5 w-5 text-white' />
                        <h3 className='font-semibold text-white'>
                            {program.title}
                        </h3>
                    </div>
                    <div className='flex items-center'>
                        {[...Array(5)].map((_, i) => (
                            <svg
                                xmlns='http://www.w3.org/2000/svg'
                                width='12'
                                height='13'
                                viewBox='0 0 12 13'
                                fill='none'
                                key={i}
                            >
                                <g clip-path='url(#clip0_77_29781)'>
                                    <path
                                        d='M6.19265 9.11938C6.07265 9.04609 5.92173 9.04609 5.80173 9.11938L3.82757 10.3251C3.54291 10.499 3.18996 10.2425 3.26734 9.91807L3.80405 7.66779C3.83667 7.53101 3.79003 7.38748 3.68324 7.296L1.92698 5.79159C1.67364 5.57458 1.80848 5.15963 2.14099 5.13299L4.44635 4.94829C4.58653 4.93706 4.70865 4.84834 4.76265 4.71849L5.65094 2.58257C5.77903 2.27457 6.21535 2.27457 6.34344 2.58257L7.23172 4.71849C7.28573 4.84834 7.40785 4.93706 7.54803 4.94829L9.85375 5.13299C10.1863 5.15963 10.3211 5.57462 10.0677 5.79161L8.31117 7.296C8.20436 7.38747 8.15771 7.53102 8.19033 7.66782L8.72703 9.91807C8.80442 10.2425 8.45146 10.499 8.1668 10.3251L6.19265 9.11938Z'
                                        fill='#EF7817'
                                    />
                                </g>
                                <defs>
                                    <clipPath id='clip0_77_29781'>
                                        <rect
                                            y='0.5'
                                            width='12'
                                            height='12'
                                            rx='0.75'
                                            fill='white'
                                        />
                                    </clipPath>
                                </defs>
                            </svg>
                        ))}
                        <span className='text-white text-sm ml-1'>
                            ({program.rating}.0)
                        </span>
                    </div>
                </div>
            </div>

            {/* Program Title and Rating */}
            <div className='p-4'>
                {/* User Info */}
                <div className='flex items-center justify-between mb-3'>
                    <div className='flex items-center gap-2'>
                        <div className='relative'>
                            <Image
                                src={program.user.avatar || '/placeholder.svg'}
                                alt={program.user.name}
                                width={28}
                                height={28}
                                className='rounded-full'
                            />
                            {program.user.online && (
                                <div className='absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-white'></div>
                            )}
                        </div>
                        <span className='text-sm font-medium'>
                            {program.user.name}
                        </span>
                    </div>

                    <button className='text-blue-600 text-xs flex items-center gap-1'>
                        <svg
                            className='w-3 h-3'
                            viewBox='0 0 24 24'
                            fill='none'
                            xmlns='http://www.w3.org/2000/svg'
                        >
                            <path
                                d='M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z'
                                fill='currentColor'
                            />
                        </svg>
                        Give a Review
                    </button>
                </div>

                {/* Organization Info */}
                <div className='space-y-1 mb-3'>
                    <div className='flex items-center gap-2'>
                        <Building className='h-4 w-4 text-gray-500' />
                        <span className='text-sm text-gray-700'>
                            {program.organization}
                        </span>
                    </div>
                    <div className='flex items-center gap-2'>
                        <Users className='h-4 w-4 text-gray-500' />
                        <span className='text-sm text-gray-700'>
                            {program.branch}
                        </span>
                    </div>
                    <div className='flex items-center gap-2'>
                        <Calendar className='h-4 w-4 text-gray-500' />
                        <span className='text-sm text-gray-700'>
                            {program.date}
                        </span>
                    </div>
                </div>

                {/* Payment Info */}
                <div className='grid grid-cols-3 gap-2 mb-3'>
                    <div>
                        <div className='text-xs text-gray-500'>Total Fee</div>
                        <div className='font-medium'>
                            ${program.payment.totalFee.toLocaleString()}
                        </div>
                    </div>
                    <div>
                        <div className='text-xs text-gray-500'>Paid</div>
                        <div className='font-medium'>
                            ${program.payment.paid.toLocaleString()}
                        </div>
                    </div>
                    <div>
                        <div className='text-xs text-gray-500'>Due</div>
                        <div className='font-medium flex items-center gap-1'>
                            ${program.payment.due.toLocaleString()}
                            {program.payment.due > 0 && (
                                <button className='bg-blue-600 text-white text-[10px] px-1 py-0.5 rounded'>
                                    Pay Now
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Progress Circle and Action Button */}
                <div className='flex items-center justify-between'>
                    <div className='relative w-12 h-12'>
                        <svg className='w-12 h-12' viewBox='0 0 36 36'>
                            <circle
                                cx='18'
                                cy='18'
                                r='16'
                                fill='none'
                                stroke='#e6e6e6'
                                strokeWidth='2'
                            ></circle>
                            <circle
                                cx='18'
                                cy='18'
                                r='16'
                                fill='none'
                                stroke='#0040ff'
                                strokeWidth='2'
                                strokeDasharray={`${program.progress} ${100 - program.progress}`}
                                strokeDashoffset='25'
                                transform='rotate(-90 18 18)'
                            ></circle>
                            <text
                                x='18'
                                y='18'
                                textAnchor='middle'
                                dominantBaseline='middle'
                                fontSize='8'
                                fill='#0040ff'
                                fontWeight='bold'
                            >
                                {program.progress}%
                            </text>
                        </svg>
                    </div>

                    {program.switched ? (
                        <button className='w-full py-2 bg-blue-50 text-blue-600 rounded flex items-center justify-center gap-1 font-medium'>
                            <CheckCircle className='h-4 w-4' />
                            Switched
                        </button>
                    ) : (
                        <button className='w-full py-2 bg-blue-600 text-white rounded flex items-center justify-center gap-1 font-medium'>
                            Switch to Program <ArrowRight className='h-4 w-4' />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProgramCard;
