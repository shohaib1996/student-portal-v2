'use client';

import Link from 'next/link';
import { ArrowLeft, CreditCard, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import GlobalHeader from '@/components/global/GlobalHeader';
import { useState } from 'react';
import { PaymentModal } from '@/components/program/online-courses/PaymentModal';
import TransactionsStatistics from './TransactionsStatistics';
import TransactionTable from './TransactionTable';

export default function PaymentHistoryPage() {
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    return (
        <section className='pt-2'>
            <GlobalHeader
                title={
                    <div className='flex items-center gap-1'>
                        <Link href='/dashboard'>
                            <ArrowLeft />
                        </Link>{' '}
                        Payment History
                    </div>
                }
                subTitle='Track and Manage Your Payments Easily'
                buttons={
                    <div className='flex items-center gap-2'>
                        <Button
                            variant='default'
                            className='col-span-1 text-xs'
                            onClick={handleOpenModal}
                        >
                            <Plus className='mr-1 h-3 w-3' />
                            Add Payment
                        </Button>
                    </div>
                }
            />

            <TransactionsStatistics />
            <TransactionTable />

            <PaymentModal open={isModalOpen} onOpenChange={handleCloseModal} />
        </section>
    );
}
