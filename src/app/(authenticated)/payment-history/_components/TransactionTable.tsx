'use client';
import React, { useState, useMemo } from 'react';
import GlobalTable, {
    TCustomColumnDef,
} from '@/components/global/GlobalTable/GlobalTable';
import GlobalPagination from '@/components/global/GlobalPagination';
import { Button } from '@/components/ui/button';
import { BadgeCheck, CircleDot, CircleX, Eye, Paperclip } from 'lucide-react';

import { usePaymentHistoryApiQuery } from '@/redux/api/payment-history/paymentHistory';
import dayjs from 'dayjs';
import GlobalModal from '@/components/global/GlobalModal';
import { Badge } from '@/components/ui/badge';
import FileCard from '@/components/chat/FileCard';

const TransactionTable = ({ data, isLoading }: any) => {
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [limit, setLimit] = useState<number>(10);
    const [item, setItem] = useState<any>(null);
    const [open, setOpen] = useState<boolean>(false);
    const [viewerOpen, setViewerOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState('');

    const transactions = data?.transactions;

    // Calculate total pages
    const totalItems = transactions?.length;

    const handlePageChange = (page: number, newLimit: number) => {
        setCurrentPage(page);
        setLimit(newLimit);
    };

    const paginatedTransactions = useMemo(() => {
        const startIndex = (currentPage - 1) * limit;
        const endIndex = startIndex + limit;
        return transactions?.slice(startIndex, endIndex) || [];
    }, [transactions, currentPage, limit]);

    const handleModalOpen = (item: any) => {
        if (item) {
            setItem(item);
            setOpen(true);
        }
    };

    const handleImageClick = (attachment: string) => {
        setSelectedImage(attachment);
        setViewerOpen(true);
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
            canHide: true,
        },
        {
            accessorKey: 'dateTime',
            header: 'Date and Time',
            cell: ({ row }) => (
                <span>
                    {dayjs(row.original.date).format('MMM D, YYYY h:mm A')}
                </span>
            ),
            id: 'dateTime',
            visible: true,
            canHide: true,
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
                            onClick={() => handleImageClick(attachment)}
                            src={attachment}
                            alt='Attachment'
                            className='max-w-[100px] max-h-[100px] object-contain cursor-pointer'
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
            canHide: true,
        },
        {
            accessorKey: 'note',
            header: 'Note',
            cell: ({ row }) => <span>{row.original.note}</span>,
            id: 'note',
            visible: true,
            canHide: true,
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => (
                <span className='capitalize'>
                    {row.original.status === 'pending' ? (
                        <span className='flex items-center gap-1'>
                            <CircleDot className='text-danger' size={16} />{' '}
                            Pending
                        </span>
                    ) : row.original.status === 'rejected' ? (
                        <span className='flex items-center gap-1'>
                            <CircleX className='text-danger' size={16} />{' '}
                            Rejected
                        </span>
                    ) : (
                        <span className='flex items-center gap-1'>
                            {' '}
                            <BadgeCheck
                                className='text-green-500'
                                size={16}
                            />{' '}
                            Approved{' '}
                        </span>
                    )}
                </span>
            ),
            id: 'status',
            visible: true,
            canHide: true,
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
                        onClick={() => handleModalOpen(row.original)}
                    />
                </div>
            ),
            id: 'actions',
            visible: true,
            canHide: false,
        },
    ];

    return (
        <div className='flex h-[calc(100vh-210px)] flex-col justify-between'>
            <GlobalTable
                isLoading={isLoading}
                limit={limit}
                data={paginatedTransactions}
                defaultColumns={transactionColumns}
                tableName='transaction-table'
            />

            <GlobalPagination
                currentPage={currentPage}
                totalItems={totalItems}
                itemsPerPage={limit}
                onPageChange={handlePageChange}
            />

            <GlobalModal
                open={open}
                setOpen={() => setOpen(false)}
                title='Payment Details'
                subTitle='View payment details here.'
                buttons={
                    <Badge
                        className={
                            item?.status === 'approved'
                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }
                    >
                        {item?.status === 'approved' ? (
                            <span className='flex items-center gap-1'>
                                <BadgeCheck className='h-3.5 w-3.5' /> Approved
                            </span>
                        ) : (
                            <span className='flex items-center gap-1'>
                                <CircleDot className='h-3.5 w-3.5' /> Pending
                            </span>
                        )}
                    </Badge>
                }
            >
                {item && (
                    <div className='py-2'>
                        {/* {item.attachment &&
                            (isImage || isPdf) &&
                            (item.attachment && isImage ? (
                                <div className='relative w-full h-[320px] overflow-hidden rounded-md'>
                                    <Image
                                        src={
                                            item.attachment ||
                                            '/placeholder.svg'
                                        }
                                        alt='Payment receipt'
                                        fill
                                        className='object-cover'
                                    />
                                </div>
                            ) : (
                                <div className='flex flex-col items-center justify-center gap-3 p-6'>
                                    <div className='w-16 h-16 bg-background rounded-full flex items-center justify-center'>
                                        <FileText className='h-8 w-8 text-primary-white' />
                                    </div>
                                    <span className='text-sm text-gray'>
                                        {item.attachment && isPdf
                                            ? 'PDF Document'
                                            : 'Attachment'}
                                    </span>
                                    <Button
                                        variant='outline'
                                        size='sm'
                                        className='mt-2'
                                        onClick={() =>
                                            window.open(
                                                item.attachment,
                                                '_blank',
                                            )
                                        }
                                    >
                                        <ExternalLink className='h-4 w-4 mr-2' />
                                        View Full
                                    </Button>
                                </div>
                            ))} */}

                        {/* Payment Details Section */}
                        <div className=''>
                            <div className='grid grid-cols-1 md:grid-cols-2 justify-between items-center gap-4'>
                                <div className='space-y-2'>
                                    <div>
                                        <h4 className='text-sm font-semibold text-gray mb-1'>
                                            Payment ID
                                        </h4>
                                        <p className='font-medium text-black'>
                                            {item?._id}
                                        </p>
                                    </div>

                                    <div>
                                        <h4 className='text-sm font-semibold text-gray mb-1'>
                                            Amount
                                        </h4>
                                        <p className='text-xl font-bold text-black'>
                                            ${item?.amount?.toFixed(2)}
                                        </p>
                                    </div>

                                    <div>
                                        <h4 className='text-sm font-semibold text-gray mb-1'>
                                            Method
                                        </h4>
                                        <p className='font-medium text-black capitalize'>
                                            {item?.method}
                                        </p>
                                    </div>
                                </div>

                                <div className='space-y-4'>
                                    <div>
                                        <h4 className='text-sm font-semibold text-gray mb-1'>
                                            Date and Time
                                        </h4>
                                        <p className='font-medium text-black'>
                                            {dayjs(item?.date).format(
                                                'MMM D, YYYY h:mm A',
                                            )}
                                        </p>
                                    </div>

                                    {item.attachment && (
                                        <div>
                                            <h4 className='text-sm font-semibold text-gray mb-1'>
                                                Attachment
                                            </h4>
                                            <a
                                                href={item?.attachment}
                                                target='_blank'
                                                rel='noopener noreferrer'
                                                className='text-primary hover:underline flex items-center gap-1'
                                            >
                                                <Paperclip className='h-4 w-4' />
                                                Download Attachment
                                            </a>
                                        </div>
                                    )}

                                    {item.note && (
                                        <div>
                                            <h4 className='text-sm font-semibold text-gray mb-1'>
                                                Note
                                            </h4>
                                            <p className='text-black'>
                                                {item?.note}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </GlobalModal>

            {viewerOpen && selectedImage && (
                <div
                    className='fixed inset-0 z-50 flex items-center justify-center bg-pure-black/80'
                    onClick={() => setViewerOpen(false)}
                >
                    <div
                        className='relative max-w-full lg:max-w-[80vw] max-h-full lg:max-h-[95vh]'
                        onClick={(e) => e.stopPropagation()}
                    >
                        <FileCard
                            file={{
                                url: selectedImage,
                                name: 'Payment',
                                type: 'image/jpeg',
                                size: 123200,
                            }}
                            index={0}
                            key={1}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default TransactionTable;
