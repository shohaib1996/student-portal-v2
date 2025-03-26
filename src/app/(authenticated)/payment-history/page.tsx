'use client';
import GlobalHeader from '@/components/global/GlobalHeader';
import GlobalTable, {
    TCustomColumnDef,
} from '@/components/global/GlobalTable/GlobalTable';
import GlobalPagination from '@/components/global/GlobalPagination';
import GlobalModal from '@/components/global/GlobalModal';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { DateRange } from 'react-day-picker';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
    ArrowLeft,
    Eye,
    PlusCircle,
    BookmarkCheck,
    XCircle,
    Plus,
} from 'lucide-react';
import { Card } from '@/components/ui/card'; // Assuming you have these API slices
import { usePaymentHistoryApiQuery } from '@/redux/api/payment-history/payment-history';
import TdDate from '@/components/global/TdDate';
import Link from 'next/link';
import { PaymentModal } from '@/components/program/online-courses/payment-modal';

// Define transaction type
type Transaction = {
    _id: string;
    amount: number;
    date: string;
    status: 'approved' | 'pending' | 'rejected';
    paymentMethod: string;
    description: string;
};

// Payment Amount Card Component
const PaymentAmount = ({
    transactions,
    totalAmount,
}: {
    transactions: Transaction[];
    totalAmount: number;
}) => {
    const paidAmount = transactions
        ?.filter((t) => t.status === 'approved')
        ?.reduce((a, b) => a + (b.amount || 0), 0);

    const pendingAmount = transactions
        ?.filter((t) => t.status === 'pending')
        ?.reduce((a, b) => a + (b.amount || 0), 0);

    const remainingAmount = totalAmount - paidAmount;

    return (
        <div className='grid grid-cols-1 md:grid-cols-3 gap-2 my-2'>
            <Card className='p-4 bg-green-50 dark:bg-green-900'>
                <h3 className='text-lg font-semibold mb-2'>Total Paid</h3>
                <p className='text-2xl font-bold text-green-600 dark:text-green-400'>
                    ${paidAmount?.toFixed(2)}
                </p>
            </Card>
            <Card className='p-4 bg-yellow-50 dark:bg-yellow-900'>
                <h3 className='text-lg font-semibold mb-2'>Pending</h3>
                <p className='text-2xl font-bold text-yellow-600 dark:text-yellow-400'>
                    ${pendingAmount?.toFixed(2)}
                </p>
            </Card>
            <Card className='p-4 bg-blue-50 dark:bg-blue-900'>
                <h3 className='text-lg font-semibold mb-2'>Remaining</h3>
                <p className='text-2xl font-bold text-blue-600 dark:text-blue-400'>
                    ${remainingAmount?.toFixed(2)}
                </p>
            </Card>
        </div>
    );
};

const PaymentHistory = () => {
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [limit, setLimit] = useState<number>(20);
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [selectedTransactions, setSelectedTransactions] = useState<string[]>(
        [],
    );

    const { data, isLoading, refetch } = usePaymentHistoryApiQuery({});
    const { user } = useAppSelector((state) => state.auth);

    const transactions: Transaction[] = data?.transactions || [];
    const totalAmount = data?.totalAmount || 0;

    const router = useRouter();
    const pathname = usePathname();

    const paidAmount = transactions
        ?.filter((t) => t.status === 'approved')
        ?.reduce((a, b) => a + (b.amount || 0), 0);

    const shouldRenderAddPayment = totalAmount > 0 && paidAmount < totalAmount;

    const handleOpenModal = () => {
        if (!shouldRenderAddPayment) {
            toast.warning('You have already paid your due amount');
            return;
        }
        setModalOpen(true);
    };

    const totalPages = Math.ceil(transactions.length / limit);

    const paginatedTransactions = useMemo(() => {
        const startIndex = (currentPage - 1) * limit;
        const endIndex = startIndex + limit;
        return transactions.slice(startIndex, endIndex);
    }, [transactions, currentPage, limit]);

    const handlePageChange = (page: number, newLimit?: number) => {
        const validPage = Math.max(1, Math.min(page, totalPages));
        setCurrentPage(validPage);

        if (newLimit) {
            setLimit(newLimit);
            const newStartIndex = (validPage - 1) * newLimit;
            const newCurrentPage = Math.floor(newStartIndex / newLimit) + 1;
            setCurrentPage(newCurrentPage);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
            case 'rejected':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        }
    };

    const defaultColumns: TCustomColumnDef<Transaction>[] = [
        {
            accessorKey: 'select',
            header: '',
            cell: ({ row }) => {
                return (
                    <Checkbox
                        checked={selectedTransactions.includes(
                            row.original._id,
                        )}
                        onCheckedChange={(val) => {
                            if (val === false) {
                                setSelectedTransactions((prev) =>
                                    prev.filter(
                                        (id) => id !== row.original._id,
                                    ),
                                );
                            } else {
                                setSelectedTransactions((prev) => [
                                    ...prev,
                                    row.original._id,
                                ]);
                            }
                        }}
                    />
                );
            },
            footer: (data) => data.column.id,
            id: 'select',
            visible: true,
            canHide: false,
        },
        {
            accessorKey: 'date',
            header: 'Date',
            cell: ({ row }) => {
                return <TdDate date={row.original.date} />;
            },
            footer: (data) => data.column.id,
            id: 'date',
            visible: true,
            canHide: false,
        },
        {
            accessorKey: 'amount',
            header: 'Amount',
            cell: ({ row }) => {
                return (
                    <span className='font-medium'>
                        ${row.original.amount.toFixed(2)}
                    </span>
                );
            },
            footer: (data) => data.column.id,
            id: 'amount',
            visible: true,
            canHide: false,
        },
        {
            accessorKey: 'paymentMethod',
            header: 'Payment Method',
            cell: ({ row }) => {
                return (
                    <span className='capitalize'>
                        {row.original.paymentMethod}
                    </span>
                );
            },
            footer: (data) => data.column.id,
            id: 'paymentMethod',
            visible: true,
            canHide: false,
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => {
                return (
                    <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(row.original.status)}`}
                    >
                        {row.original.status.charAt(0).toUpperCase() +
                            row.original.status.slice(1)}
                    </span>
                );
            },
            footer: (data) => data.column.id,
            id: 'status',
            visible: true,
            canHide: false,
        },
        {
            accessorKey: 'description',
            header: 'Description',
            cell: ({ row }) => {
                return <span>{row.original.description || '-'}</span>;
            },
            footer: (data) => data.column.id,
            id: 'description',
            visible: true,
            canHide: false,
        },
        {
            accessorKey: 'actions',
            header: 'Actions',
            cell: ({ row }) => {
                return (
                    <div className='flex items-center gap-2'>
                        <Link href={`${pathname}?detail=${row.original._id}`}>
                            <Button
                                tooltip='View'
                                variant='plain'
                                className='bg-foreground size-8'
                                icon={<Eye size={18} />}
                                size='icon'
                            />
                        </Link>
                    </div>
                );
            },
            footer: (data) => data.column.id,
            id: 'actions',
            visible: true,
            canHide: false,
        },
    ];

    return (
        <div className='pt-2'>
            <GlobalHeader
                title={
                    <div className='flex items-center gap-2'>
                        <Button
                            variant='ghost'
                            size='icon'
                            onClick={() => router.back()}
                            className='rounded-full'
                        >
                            <ArrowLeft size={20} />
                        </Button>
                        <span>Payment History</span>
                    </div>
                }
                subTitle='View and manage your payment history'
                buttons={
                    <div className='flex items-center gap-2'>
                        {selectedTransactions.length > 0 && (
                            <Button
                                onClick={() => setSelectedTransactions([])}
                                variant='primary_light'
                            >
                                {selectedTransactions.length} Selected
                                <XCircle size={18} />
                            </Button>
                        )}
                        <Button
                            onClick={handleOpenModal}
                            icon={<Plus size={18} />}
                        >
                            Add Payment
                        </Button>
                    </div>
                }
            />

            <PaymentAmount
                transactions={transactions}
                totalAmount={totalAmount}
            />

            <PaymentModal open={modalOpen} onOpenChange={setModalOpen} />

            <div className='h-[calc(100vh-260px)]  flex flex-col justify-between'>
                <GlobalTable
                    tableName='payment-history-table'
                    isLoading={isLoading}
                    limit={limit}
                    data={paginatedTransactions}
                    defaultColumns={defaultColumns}
                />
            </div>
        </div>
    );
};

export default PaymentHistory;
