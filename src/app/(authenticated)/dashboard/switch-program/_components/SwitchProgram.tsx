'use client';
import GlobalHeader from '@/components/global/GlobalHeader';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Divide } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import ProgramCard, { BootcampProgram } from './ProgramCard';
import { cn } from '@/lib/utils';

const SwitchProgram = () => {
    const [activeTab, setActiveTab] = useState<
        'all' | 'approved' | 'pending' | 'cancelled'
    >('all');
    const programs: BootcampProgram[] = [
        {
            id: '1',
            title: 'AWS DevOps And CloudOps Engineer',
            image: '/switchprogram.jpg',
            rating: 5.0,
            status: 'approved',
            user: {
                name: 'John Doe',
                avatar: '/avatar.png',
                online: true,
            },
            organization: 'Org With Logo',
            branch: 'TS4U IT Engineer Bootcamps',
            date: 'Dec-2023',
            payment: {
                totalFee: 12000,
                paid: 4000,
                due: 8000,
            },
            progress: 65,
            switched: true,
        },
        {
            id: '2',
            title: 'Project/Product Manager',
            image: '/switchprogram.jpg',
            rating: 5.0,
            status: 'approved',
            user: {
                name: 'Arlene McCoy',
                avatar: '/avatar.png',
                online: true,
            },
            organization: 'Org With Logo',
            branch: 'TS4U IT Engineer Bootcamps',
            date: 'Dec-2023',
            payment: {
                totalFee: 12000,
                paid: 4000,
                due: 8000,
            },
            progress: 45,
        },
        {
            id: '3',
            title: 'MERN Full Stack Developer',
            image: '/switchprogram.jpg',
            rating: 5.0,
            status: 'cancelled',
            user: {
                name: 'Jane Copper',
                avatar: '/avatar.png',
            },
            organization: 'Org With Logo',
            branch: 'TS4U IT Engineer Bootcamps',
            date: 'Dec-2023',
            payment: {
                totalFee: 12000,
                paid: 4000,
                due: 8000,
            },
            progress: 15,
        },
        {
            id: '4',
            title: 'Software Quality Assurance (SQA)',
            image: '/switchprogram.jpg',
            rating: 5.0,
            status: 'pending',
            user: {
                name: 'Jenny Wilson',
                avatar: '/avatar.png',
            },
            organization: 'Org With Logo',
            branch: 'TS4U IT Engineer Bootcamps',
            date: 'Dec-2023',
            payment: {
                totalFee: 12000,
                paid: 0,
                due: 12000,
            },
            progress: 0,
        },
        {
            id: '5',
            title: 'MERN Full Stack Developer',
            image: '/switchprogram.jpg',
            rating: 5.0,
            status: 'cancelled',
            user: {
                name: 'Kristin Watson',
                avatar: '/avatar.png',
            },
            organization: 'Org With Logo',
            branch: 'TS4U IT Engineer Bootcamps',
            date: 'Dec-2023',
            payment: {
                totalFee: 12000,
                paid: 4000,
                due: 8000,
            },
            progress: 65,
        },
        {
            id: '6',
            title: 'Software Quality Assurance (SQA)',
            image: '/switchprogram.jpg',
            rating: 5.0,
            status: 'approved',
            user: {
                name: 'Bessie Cooper',
                avatar: '/avatar.png',
            },
            organization: 'Org With Logo',
            branch: 'TS4U IT Engineer Bootcamps',
            date: 'Dec-2023',
            payment: {
                totalFee: 12000,
                paid: 4000,
                due: 8000,
            },
            progress: 55,
        },
        {
            id: '7',
            title: 'AWS DevOps And CloudOps Engineer',
            image: '/switchprogram.jpg',
            rating: 5.0,
            status: 'pending',
            user: {
                name: 'Savannah Nguyen',
                avatar: '/avatar.png',
            },
            organization: 'Org With Logo',
            branch: 'TS4U IT Engineer Bootcamps',
            date: 'Dec-2023',
            payment: {
                totalFee: 12000,
                paid: 0,
                due: 12000,
            },
            progress: 0,
        },
        {
            id: '8',
            title: 'Project/Product Manager',
            image: '/switchprogram.jpg',
            rating: 5.0,
            status: 'approved',
            user: {
                name: 'Annette Black',
                avatar: '/avatar.png',
            },
            organization: 'Org With Logo',
            branch: 'TS4U IT Engineer Bootcamps',
            date: 'Dec-2023',
            payment: {
                totalFee: 12000,
                paid: 4000,
                due: 8000,
            },
            progress: 45,
        },
    ];

    const router = useRouter();

    const filteredPrograms =
        activeTab === 'all'
            ? programs
            : programs.filter((program) => program.status === activeTab);

    const counts = {
        all: programs.length,
        approved: programs.filter((p) => p.status === 'approved').length,
        pending: programs.filter((p) => p.status === 'pending').length,
        cancelled: programs.filter((p) => p.status === 'cancelled').length,
    };
    return (
        <>
            <GlobalHeader
                title={
                    <span className='flex items-center justify-center gap-1'>
                        <ArrowLeft
                            onClick={() => router.push('/dashboard/program')}
                            size={18}
                            className='cursor-pointer'
                        />
                        Switch Program
                    </span>
                }
                subTitle={
                    <div>
                        Change to another program, please click on
                        <span className='text-primary'>Switch</span> and proceed
                    </div>
                }
                buttons={
                    <Button
                        onClick={() => router.push('/dashboard/program')}
                        variant={'default'}
                        icon={<ArrowLeft size={18} />}
                    >
                        Go Back
                    </Button>
                }
            />
            {/* Tabs */}
            <div className='border-b mb-2'>
                <div className='flex'>
                    <button
                        onClick={() => setActiveTab('all')}
                        className={cn(
                            'px-4 py-2 text-sm font-medium',
                            activeTab === 'all'
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-500 hover:text-gray-700',
                        )}
                    >
                        All ({counts.all})
                    </button>
                    <button
                        onClick={() => setActiveTab('approved')}
                        className={cn(
                            'px-4 py-2 text-sm font-medium',
                            activeTab === 'approved'
                                ? 'text-green-600 border-b-2 border-green-600'
                                : 'text-green-600 hover:text-green-700',
                        )}
                    >
                        Approved ({counts.approved})
                    </button>
                    <button
                        onClick={() => setActiveTab('pending')}
                        className={cn(
                            'px-4 py-2 text-sm font-medium',
                            activeTab === 'pending'
                                ? 'text-amber-500 border-b-2 border-amber-500'
                                : 'text-amber-500 hover:text-amber-600',
                        )}
                    >
                        Pending ({counts.pending})
                    </button>
                    <button
                        onClick={() => setActiveTab('cancelled')}
                        className={cn(
                            'px-4 py-2 text-sm font-medium',
                            activeTab === 'cancelled'
                                ? 'text-red-500 border-b-2 border-red-500'
                                : 'text-red-500 hover:text-red-600',
                        )}
                    >
                        Cancelled ({counts.cancelled})
                    </button>
                </div>
            </div>

            {/* Program Cards */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                {filteredPrograms.map((program, i) => (
                    <ProgramCard key={i} program={program} />
                ))}
            </div>

            {/* Default Account Checkbox */}
            <div className='mt-6 flex items-center gap-2'>
                <input
                    type='checkbox'
                    id='default-account'
                    className='h-4 w-4 rounded border-gray-300 text-blue-600'
                />
                <label
                    htmlFor='default-account'
                    className='text-sm text-gray-600'
                >
                    Set this selected account as the default
                </label>
            </div>
        </>
    );
};

export default SwitchProgram;
