'use client';
import React, { useState, useMemo } from 'react';
import GlobalTable, {
    TCustomColumnDef,
} from '@/components/global/GlobalTable/GlobalTable';
import GlobalPagination from '@/components/global/GlobalPagination';
import { Button } from '@/components/ui/button';

// Mock transaction data
const mockTransactions = [
    {
        id: 'TXN001',
        amount: 150.0,
        method: 'Credit Card',
        dateTime: '2025-03-25T14:30:00Z',
        attachment: 'receipt1.pdf',
        note: 'Payment for subscription',
        actions: ['view', 'edit', 'delete'],
    },
    {
        id: 'TXN002',
        amount: 45.99,
        method: 'PayPal',
        dateTime: '2025-03-24T09:15:00Z',
        attachment: null,
        note: 'Purchase of digital goods',
        actions: ['view', 'delete'],
    },
    {
        id: 'TXN003',
        amount: 300.0,
        method: 'Bank Transfer',
        dateTime: '2025-03-23T16:45:00Z',
        attachment: 'invoice3.pdf',
        note: 'Client payment',
        actions: ['view', 'edit'],
    },
    {
        id: 'TXN004',
        amount: 25.5,
        method: 'Debit Card',
        dateTime: '2025-03-22T11:00:00Z',
        attachment: null,
        note: 'Coffee shop expense',
        actions: ['view'],
    },
    {
        id: 'TXN005',
        amount: 1000.0,
        method: 'Wire Transfer',
        dateTime: '2025-03-21T13:20:00Z',
        attachment: 'contract5.pdf',
        note: 'Project milestone payment',
        actions: ['view', 'edit', 'delete'],
    },
];

// Column definitions
const transactionColumns: TCustomColumnDef<any>[] = [
    {
        accessorKey: 'id',
        header: 'ID',
        cell: ({ row }) => <span>{row.original.id}</span>,
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
        cell: ({ row }) => <span>{row.original.method}</span>,
        id: 'method',
        visible: true,
        canHide: false,
    },
    {
        accessorKey: 'dateTime',
        header: 'Date and Time',
        cell: ({ row }) => (
            <span>{new Date(row.original.dateTime).toLocaleString()}</span>
        ),
        id: 'dateTime',
        visible: true,
        canHide: false,
    },
    {
        accessorKey: 'attachment',
        header: 'Attachment',
        cell: ({ row }) => <span>{row.original.attachment || 'None'}</span>,
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
        accessorKey: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
            <div className='flex gap-2'>
                {row.original.actions.map((action: string, index: number) => (
                    <Button
                        key={index}
                        className={`px-2 py-1 rounded ${
                            action === 'delete' ? 'bg-red-500' : 'bg-blue-500'
                        } text-white`}
                        onClick={() =>
                            console.log(`${action} ${row.original.id}`)
                        }
                        variant={action === 'delete' ? 'danger_light' : 'plain'}
                        size='sm'
                    >
                        {action}
                    </Button>
                ))}
            </div>
        ),
        id: 'actions',
        visible: true,
        canHide: false,
    },
];

const TransactionTable = () => {
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [limit, setLimit] = useState<number>(10); // Default items per page

    // Calculate total pages
    const totalItems = mockTransactions.length;
    const totalPages = Math.ceil(totalItems / limit);

    // Paginated data using useMemo for performance
    const paginatedTransactions = useMemo(() => {
        const startIndex = (currentPage - 1) * limit;
        const endIndex = startIndex + limit;
        return mockTransactions.slice(startIndex, endIndex);
    }, [currentPage, limit]);

    // Handle page change and limit update
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

    return (
        <div className='p-4'>
            {/* <h2 className='text-2xl font-bold mb-4'>Transaction History</h2> */}
            <div className='h-[calc(100vh-230px)] flex flex-col justify-between'>
                {/* Table */}
                <GlobalTable
                    isLoading={false}
                    limit={limit}
                    data={paginatedTransactions}
                    defaultColumns={transactionColumns}
                    tableName='transaction-table'
                />

                {/* Pagination */}
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
