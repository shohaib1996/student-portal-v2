'use client';
import React, { useState, useMemo } from 'react';
import GlobalTable, {
    TCustomColumnDef,
} from '@/components/global/GlobalTable/GlobalTable';
import GlobalPagination from '@/components/global/GlobalPagination';
import { Button } from '@/components/ui/button';
import { BadgeCheck, CircleDot, Eye } from 'lucide-react';
import { usePaymentHistoryApiQuery } from '@/redux/api/payment-history/paymentHistory';
import LoadingSpinner from '@/components/global/Community/LoadingSpinner/LoadingSpinner';
import dayjs from 'dayjs';
import { toast } from 'sonner';

const commingSoon = () => {
    toast.success('Coming Soon...');
};
// Column definitions
const transactionColumns: TCustomColumnDef<any>[] = [
    {
        accessorKey: 'id',
        header: 'ID',
        cell: ({ row }) => <span>{row.original._id}</span>,
        id: 'id',
        visible: true,
        canHide: false,
    },
    {
        accessorKey: 'amount',
        header: 'Amount',
        cell: ({ row }) => <span>${row.original.amount.toFixed(2)}</span>,
        id: 'amount',
        visible: true,
        canHide: false,
    },
    {
        accessorKey: 'method',
        header: 'Method',
        cell: ({ row }) => (
            <span className='capitalize'>{row.original.method}</span>
        ),
        id: 'method',
        visible: true,
        canHide: false,
    },
    {
        accessorKey: 'dateTime',
        header: 'Date and Time',
        cell: ({ row }) => (
            <span>{dayjs(row.original.date).format('MMM D, YYYY h:mm A')}</span>
        ),
        id: 'dateTime',
        visible: true,
        canHide: false,
    },
    {
        accessorKey: 'attachment',
        header: 'Attachment',
        cell: ({ row }) => {
            const attachment = row.original.attachment;

            // If no attachment, show "None"
            if (!attachment) {
                return <span>None</span>;
            }

            // Get the file extension (case-insensitive)
            const extension = attachment.split('.').pop()?.toLowerCase();

            // Image extensions to display
            const imageExtensions = [
                'png',
                'jpg',
                'jpeg',
                'gif',
                'bmp',
                'webp',
            ];

            // Check if it’s an image
            if (extension && imageExtensions.includes(extension)) {
                return (
                    <img
                        src={attachment}
                        alt='Attachment'
                        className='max-w-[100px] max-h-[100px] object-contain'
                    />
                );
            }

            // Check if it’s a PDF
            if (extension === 'pdf') {
                return (
                    <a
                        href={attachment}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-dark-gray hover:underline'
                    >
                        View PDF
                    </a>
                );
            }

            return <span>{attachment}</span>;
        },
        id: 'attachment',
        visible: true,
        canHide: false,
    },
    {
        accessorKey: 'note',
        header: 'Note',
        cell: ({ row }) => <span>{row.original.note}</span>,
        id: 'note',
        visible: true,
        canHide: false,
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
            <span className='capitalize'>
                {row.original.status === 'pending' ? (
                    <span className='flex items-center gap-1'>
                        <CircleDot className='text-danger' size={16} /> Pending
                    </span>
                ) : (
                    <span>
                        {' '}
                        <BadgeCheck className='text-green-500' size={16} />{' '}
                        Approved{' '}
                    </span>
                )}
            </span>
        ),
        id: 'status',
        visible: true,
        canHide: false,
    },
    {
        accessorKey: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
            <div className='flex gap-2'>
                <Button
                    tooltip='View'
                    variant={'plain'}
                    className='bg-foreground size-8'
                    icon={<Eye size={18} />}
                    size={'icon'}
                    onClick={commingSoon}
                />
            </div>
        ),
        id: 'actions',
        visible: true,
        canHide: false,
    },
];

const TransactionTable = () => {
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [limit, setLimit] = useState<number>(10);
    const { data, isLoading, error } = usePaymentHistoryApiQuery({
        page: currentPage,
        limit: limit,
    });
    const transactions = data?.transactions;

    // Calculate total pages
    const totalItems = transactions?.length;

    const handlePageChange = (page: number, newLimit: number) => {
        setCurrentPage(page);
        setLimit(newLimit);
    };

    if (isLoading) {
        return <LoadingSpinner />;
    } else if (data?.transactions?.length === 0) {
        return (
            <div className='text-center text-black font-bold text-2xl my-4'>
                No payment history available
            </div>
        );
    } else if (error) {
        return (
            <div className='text-center text-red-500 font-bold text-xl my-4'>
                Error loading payment history
            </div>
        );
    }

    return (
        <div className='py-4'>
            <div className='h-[calc(100vh-230px)] flex flex-col justify-between'>
                <GlobalTable
                    isLoading={isLoading}
                    limit={limit}
                    data={transactions}
                    defaultColumns={transactionColumns}
                    tableName='transaction-table'
                />

                <GlobalPagination
                    currentPage={currentPage}
                    totalItems={totalItems}
                    itemsPerPage={limit}
                    onPageChange={handlePageChange}
                />
            </div>
        </div>
    );
};

export default TransactionTable;
