'use client';

import { useState, useMemo, useEffect } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';
import { GlobalDocumentCard } from '@/components/global/documents/GlobalDocumentCard';
import {
    useGetMyDocumentQuery,
    useGetSingleUploadDocumentQuery,
} from '@/redux/api/documents/documentsApi';
import GlobalHeader from '@/components/global/GlobalHeader';
import FilterModal from '@/components/global/FilterModal/FilterModal';
import { Button } from '@/components/ui/button';
import { Eye, FileX, LayoutGrid, List, Search } from 'lucide-react';
import GlobalTable, {
    type TCustomColumnDef,
} from '@/components/global/GlobalTable/GlobalTable';
import TdDate from '@/components/global/TdDate';
import { TdUser } from '@/components/global/TdUser';
import GlobalPagination from '@/components/global/GlobalPagination';
import { DocumentDetailsModal } from './document-details-modal';
import { UploadDocumentModal } from './upload-document-modal';

interface FilterValues {
    query?: string;
    priority?: string;
    date?: string;
}

export default function MyDocumentsPage() {
    const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(
        null,
    );
    const searchParams = useSearchParams();
    const documentId = searchParams.get('documentId');
    const mode = searchParams.get('mode') || 'view';
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isGridView, setIsGridView] = useState<boolean>(true);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [limit, setLimit] = useState<number>(10);
    const [filters, setFilters] = useState<FilterValues>({});

    const router = useRouter();
    const { data, error, isLoading } = useGetMyDocumentQuery({
        page: currentPage,
        limit: limit,
    });

    useEffect(() => {
        if (documentId && mode === 'view') {
            setIsDetailsModalOpen(true);
        }
    }, [documentId, mode]);

    const allDocuments = data?.documents || [];

    const { data: singleDocument, isLoading: isSingleDocLoading } =
        useGetSingleUploadDocumentQuery(documentId || '', {
            skip:
                !documentId ||
                (data?.documents || []).some((doc) => doc._id === documentId),
        });
    // Find selected document from local data or use fetched single document
    const selectedDocument = documentId
        ? allDocuments.find((doc) => doc._id === documentId) || singleDocument
        : null;
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
                      false) ||
                  (doc.createdBy?.fullName
                      ?.toLowerCase()
                      .includes(filters.query.toLowerCase()) ??
                      false)
                : true;

            const matchesPriority = filters.priority
                ? doc.priority?.toLowerCase() === filters.priority.toLowerCase()
                : true;

            const matchesDate = filters.date
                ? new Date(doc.createdAt).toDateString() ===
                  new Date(filters.date).toDateString()
                : true;

            return matchesQuery && matchesPriority && matchesDate;
        });
    }, [allDocuments, filters]);

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
        router.push(`/my-documents`);
    };

    const handleCloseUploadModal = () => {
        setIsUploadModalOpen(false);
    };

    const handlePageChange = (page: number, newLimit: number) => {
        setCurrentPage(page);
        setLimit(newLimit);
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
                        _id: row.original.createdBy?._id || '',
                        fullName: row.original.createdBy?.fullName || 'Unknown',
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
            cell: ({ row }) => (
                <span
                    className={`capitalize ${row.original.priority ? '' : 'text-gray-400'}`}
                >
                    {row.original.priority || 'Not Set'}
                </span>
            ),
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
                    title='My Documents'
                    subTitle='Resource Library: Access All Essential Documents'
                    buttons={
                        <div className='flex items-center gap-2'>
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
                            {/* Filter modal  */}
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
                        </div>
                    }
                />
            </div>

            <div className='h-[calc(100vh-120px)] flex flex-col justify-between'>
                {isGridView ? (
                    <div className='my-2 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'>
                        {allDocuments.length > 0 ? (
                            allDocuments.map((doc: any) => (
                                <GlobalDocumentCard
                                    key={doc._id}
                                    id={doc._id}
                                    redirect='my-documents'
                                    {...doc}
                                    onClick={() => handleDocumentClick(doc._id)}
                                />
                            ))
                        ) : (
                            <div className='col-span-full flex flex-col items-center justify-center py-10'>
                                {allDocuments.length === 0 ? (
                                    <>
                                        <FileX
                                            size={64}
                                            className='text-gray-400 mb-4'
                                        />
                                        <h3 className='text-lg font-medium'>
                                            No documents found
                                        </h3>
                                        <p className='text-gray mt-1'>
                                            {`You haven't uploaded any documents
                                            yet`}
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <Search
                                            size={64}
                                            className='text-gray-400 mb-4'
                                        />
                                        <h3 className='text-lg font-medium'>
                                            No matching documents
                                        </h3>
                                        <p className='text-gray mt-1'>
                                            No documents match your current
                                            filter criteria
                                        </p>
                                        <Button
                                            onClick={() => setFilters({})}
                                            variant='outline'
                                            className='mt-4'
                                        >
                                            Clear Filters
                                        </Button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    <div>
                        <GlobalTable
                            isLoading={false}
                            limit={limit}
                            data={allDocuments}
                            defaultColumns={defaultColumns}
                            tableName='my-documents-table'
                        />
                    </div>
                )}

                {allDocuments.length > 0 && (
                    <GlobalPagination
                        currentPage={currentPage}
                        totalItems={data?.count || 0}
                        itemsPerPage={limit}
                        onPageChange={handlePageChange}
                    />
                )}
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
