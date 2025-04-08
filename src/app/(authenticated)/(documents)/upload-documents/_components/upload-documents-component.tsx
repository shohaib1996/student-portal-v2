'use client';

import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, LayoutGrid, List, Eye } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { GlobalDocumentCard } from '@/components/global/documents/GlobalDocumentCard';
import { useGetUploadDocumentsQuery } from '@/redux/api/documents/documentsApi';
import { DocumentDetailsModal } from './document-details-modal';
import { UploadDocumentModal } from './upload-document-modal';
import GlobalPagination from '@/components/global/GlobalPagination';
import GlobalHeader from '@/components/global/GlobalHeader';
import FilterModal from '@/components/global/FilterModal/FilterModal';
import GlobalTable, {
    TCustomColumnDef,
} from '@/components/global/GlobalTable/GlobalTable';
import TdDate from '@/components/global/TdDate';
import { TdUser } from '@/components/global/TdUser';

interface FilterValues {
    query?: string;
    priority?: string;
    date?: string;
}

export default function UploadDocumentComponent() {
    const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(
        null,
    );
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isGridView, setIsGridView] = useState<boolean>(true);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [limit, setLimit] = useState<number>(10);
    const [filters, setFilters] = useState<FilterValues>({});
    const searchParams = useSearchParams();
    const documentId = searchParams.get('documentId');
    const mode = searchParams.get('mode');
    const router = useRouter();
    const { data, error, isLoading } = useGetUploadDocumentsQuery({
        page: currentPage,
        limit: limit,
    });
    useEffect(() => {
        if (documentId && mode === 'view') {
            setIsDetailsModalOpen(true);
        }
        if (documentId && mode === 'edit') {
            setIsUploadModalOpen(true);
        }
    }, [documentId, mode]);
    const allDocuments = data?.documents || [];
    console.log({ allDocuments });
    // Filter documents based on filter values
    const filteredDocuments = useMemo(() => {
        return allDocuments.filter((doc) => {
            const matchesQuery = filters.query
                ? (doc.name
                      ?.toLowerCase()
                      .includes(filters.query.toLowerCase()) ??
                      false) ||
                  (doc.description
                      ?.toLowerCase()
                      .includes(filters.query.toLowerCase()) ??
                      false)
                : true;

            const matchesPriority = filters.priority
                ? (doc as any).priority === filters.priority
                : true;

            const matchesDate = filters.date
                ? new Date(doc.createdAt).toDateString() ===
                  new Date(filters.date).toDateString()
                : true;

            return matchesQuery && matchesPriority && matchesDate;
        });
    }, [allDocuments, filters]);

    const paginatedDocuments = useMemo(() => {
        const startIndex = (currentPage - 1) * limit;
        const endIndex = startIndex + limit;
        return filteredDocuments.slice(startIndex, endIndex);
    }, [filteredDocuments, currentPage, limit]);

    const totalPages = Math.ceil(filteredDocuments.length / limit);

    if (isLoading) {
        return <div>Loading...</div>;
    }
    if (error) {
        return <div>Something went wrong!</div>;
    }

    const handleFilter = (
        conditions: any[],
        queryObj: Record<string, string>,
    ) => {
        setFilters({
            query: queryObj.query,
            priority: queryObj.priority,
            date: queryObj.date,
        });
        setCurrentPage(1); // Reset to first page when filtering
    };

    const handleDocumentClick = (documentId: string) => {
        setSelectedDocumentId(documentId);
        setIsDetailsModalOpen(true);
    };

    const handleCloseDetailsModal = () => {
        setIsDetailsModalOpen(false);
        setSelectedDocumentId(null);
        router.push('/upload-documents');
    };

    const handleOpenUploadModal = () => {
        setIsUploadModalOpen(true);
    };

    const handleCloseUploadModal = () => {
        setIsUploadModalOpen(false);
    };

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

    const defaultColumns: TCustomColumnDef<(typeof allDocuments)[0]>[] = [
        {
            accessorKey: 'name',
            header: 'Document Name',
            cell: ({ row }) => <span>{row.original.name || 'Untitled'}</span>,
            footer: (data) => data.column.id,
            id: 'name',
            visible: true,
            canHide: false,
        },
        {
            accessorKey: 'createdBy',
            header: 'Created By',
            cell: ({ row }) => (
                <TdUser
                    user={{
                        _id: (row.original as any).createdBy?._id || '',
                        fullName:
                            (row.original as any).createdBy?.fullName ||
                            'Unknown',
                    }}
                />
            ),
            footer: (data) => data.column.id,
            id: 'createdBy',
            visible: true,
            canHide: false,
        },
        {
            accessorKey: 'createdAt',
            header: 'Created Date',
            cell: ({ row }) => <TdDate date={row.original.createdAt} />,
            footer: (data) => data.column.id,
            id: 'createdAt',
            visible: true,
            canHide: false,
        },
        {
            accessorKey: 'updatedAt',
            header: 'Last Updated',
            cell: ({ row }) => <TdDate date={row.original.updatedAt} />,
            footer: (data) => data.column.id,
            id: 'updatedAt',
            visible: true,
            canHide: false,
        },
        {
            accessorKey: 'priority',
            header: 'Priority',
            cell: ({ row }) => <span className='text-gray-400'>Not Set</span>,
            footer: (data) => data.column.id,
            id: 'priority',
            visible: true,
            canHide: true,
        },
        {
            accessorKey: 'description',
            header: 'Description',
            cell: ({ row }) => (
                <span
                    className={row.original.description ? '' : 'text-gray-400'}
                >
                    {row.original.description || 'No description'}
                </span>
            ),
            footer: (data) => data.column.id,
            id: 'description',
            visible: true,
            canHide: true,
        },
        {
            accessorKey: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
                <div className='flex items-center gap-2'>
                    <Button
                        tooltip='View'
                        variant={'plain'}
                        className='bg-foreground size-8'
                        icon={<Eye size={18} />}
                        size={'icon'}
                        onClick={() => handleDocumentClick(row.original._id)}
                    />
                </div>
            ),
            footer: (data) => data.column.id,
            id: 'actions',
            visible: true,
            canHide: false,
        },
    ];

    return (
        <div>
            <div className='mb-3'>
                <GlobalHeader
                    title='Upload Documents'
                    subTitle='Securely upload and manage your files with ease'
                    buttons={
                        <div className='ml-auto flex items-center gap-2'>
                            <Button
                                variant={!isGridView ? 'outline' : 'default'}
                                onClick={() => setIsGridView(true)}
                            >
                                <LayoutGrid size={16} />
                            </Button>
                            <Button
                                variant={isGridView ? 'outline' : 'default'}
                                onClick={() => setIsGridView(false)}
                            >
                                <List size={16} />
                            </Button>
                            <FilterModal
                                value={Object.entries(filters)
                                    .filter(([_, value]) => value)
                                    .map(([column, value]) => ({
                                        field: column,
                                        operator: 'eq',
                                        value,
                                    }))}
                                onChange={handleFilter}
                                columns={[
                                    {
                                        label: 'Search (Name/Description/Creator)',
                                        value: 'query',
                                    },
                                    {
                                        label: 'Priority',
                                        value: 'priority',
                                    },
                                    {
                                        label: 'Created Date',
                                        value: 'date',
                                    },
                                ]}
                            />
                            <Button
                                onClick={handleOpenUploadModal}
                                size='sm'
                                className='gap-2'
                            >
                                <Upload className='h-4 w-4' />
                                Upload Document
                            </Button>
                        </div>
                    }
                />
            </div>

            <div className='h-[calc(100vh-120px)] flex flex-col justify-between'>
                {isGridView ? (
                    <div className='my-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'>
                        {paginatedDocuments.map((doc) => (
                            <GlobalDocumentCard
                                key={doc._id}
                                id={doc._id}
                                redirect='upload-documents'
                                {...doc}
                                onClick={() => handleDocumentClick(doc._id)}
                            />
                        ))}
                    </div>
                ) : (
                    <div>
                        <GlobalTable
                            isLoading={false}
                            limit={limit}
                            data={paginatedDocuments}
                            defaultColumns={defaultColumns}
                            tableName='upload-documents-table'
                        />
                    </div>
                )}

                <GlobalPagination
                    currentPage={currentPage}
                    totalItems={filteredDocuments.length}
                    itemsPerPage={limit}
                    onPageChange={handlePageChange}
                />
            </div>

            <DocumentDetailsModal
                isOpen={isDetailsModalOpen}
                onClose={handleCloseDetailsModal}
                documentId={selectedDocumentId || documentId}
            />

            <UploadDocumentModal
                isOpen={isUploadModalOpen}
                onClose={handleCloseUploadModal}
            />
        </div>
    );
}
