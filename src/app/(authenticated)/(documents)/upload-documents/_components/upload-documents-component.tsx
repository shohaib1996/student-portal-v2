'use client';

import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, LayoutGrid, List, Eye, TriangleAlert } from 'lucide-react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { GlobalDocumentCard } from '@/components/global/documents/GlobalDocumentCard';
import {
    UploadDoc,
    useGetUploadDocumentsQuery,
} from '@/redux/api/documents/documentsApi';
import { UploadDocumentModal } from './upload-document-modal';
import GlobalPagination from '@/components/global/GlobalPagination';
import GlobalHeader from '@/components/global/GlobalHeader';
import FilterModal from '@/components/global/FilterModal/FilterModal';
import GlobalTable, {
    type TCustomColumnDef,
} from '@/components/global/GlobalTable/GlobalTable';
import TdDate from '@/components/global/TdDate';
import { TdUser } from '@/components/global/TdUser';
import {
    DocumentContent,
    UploadedDocumentDetailsModal,
} from './UploadedDocumentDetailsModal';
import CardLoader from '@/components/loading-skeletons/CardLoader';
import { renderPlainText } from '@/components/lexicalEditor/renderer/renderPlainText';
import { TConditions } from '@/components/global/FilterModal/QueryBuilder';
import { Badge } from '@/components/ui/badge';
import { TUser } from '@/types/auth';

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
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();
    const viewMode = searchParams.get('view') || 'grid';
    const [selected, setSelected] = useState<UploadDoc | null>(null);
    const isGridView = viewMode === 'grid';
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [limit, setLimit] = useState<number>(10);
    const [query, setQuery] = useState('');
    const [priority, setPriority] = useState('');
    const [date, setDate] = useState('');

    const [filterValues, setFilterValues] = useState<TConditions[]>([]);
    const documentId = searchParams.get('documentId');
    const mode = searchParams.get('mode');
    const { data, error, isLoading } = useGetUploadDocumentsQuery({
        page: currentPage,
        limit: limit,
        ...(query ? { query: query } : {}),
        ...(priority ? { priority: priority } : {}),
        ...(date ? { date: date } : {}),
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
    const total = data?.count || 0;

    if (isLoading && isGridView) {
        return (
            <div className='flex flex-col gap-3 mt-3'>
                <h3 className='text-black font-2xl'>Loading...</h3>
                <div className='mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'>
                    {Array(10)
                        .fill(0)
                        .map((_, index) => (
                            <div
                                key={index}
                                className={`${index >= 3 ? 'hidden sm:block' : ''} ${index >= 10 ? 'hidden' : ''}`}
                            >
                                <CardLoader />
                            </div>
                        ))}
                </div>
            </div>
        );
    }
    if (error) {
        return (
            <div className='w-full h-[60vh] flex flex-col items-center justify-center gap-2 '>
                <TriangleAlert size={60} color='red' />
                <p className='text-2xl font-semibold'>
                    {(error as { data?: { error: string } })?.data?.error ||
                        'Failed to fetch data'}
                </p>
            </div>
        );
    }

    const handleFilter = (
        conditions: any[],
        queryObj: Record<string, string>,
    ) => {
        setFilterValues(conditions);
        setQuery(queryObj['query'] ?? '');
        setDate(queryObj['date'] ?? '');
        setPriority(queryObj['priority'] ?? '');
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
        router.push('/upload-documents');
        setSelected(null);
    };

    const handlePageChange = (page: number, newLimit: number) => {
        setCurrentPage(page);
        setLimit(newLimit);
    };

    const getPriorityBadgeClassName = (priority?: string) => {
        switch (priority) {
            case 'high':
                return 'bg-blue-500 hover:bg-blue-600 text-white';
            case 'medium':
                return 'bg-yellow-500 hover:bg-yellow-600 text-black';
            case 'low':
                return 'bg-red-500 hover:bg-red-600 text-white';
            default:
                return 'bg-gray-200 hover:bg-gray-300 text-gray-800';
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
                <TdUser user={row.original?.user as unknown as TUser} />
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
                <Badge
                    className={getPriorityBadgeClassName(row.original.priority)}
                >
                    {row.original.priority || 'not defined'}
                </Badge>
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
                <div className={'max-w-40 line-clamp-2'}>
                    {renderPlainText({
                        text: row.original.description,
                        lineClamp: 2,
                    })}
                </div>
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

    const setViewMode = (mode: 'grid' | 'list') => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('view', mode);
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <div className='mt-2'>
            <GlobalHeader
                title='Upload Documents'
                subTitle='Securely upload and manage your files with ease'
                buttons={
                    <div className='ml-auto flex items-center gap-2'>
                        <Button
                            tooltip='Grid View'
                            variant={!isGridView ? 'outline' : 'default'}
                            onClick={() => setViewMode('grid')}
                        >
                            <LayoutGrid size={16} />
                        </Button>
                        <Button
                            tooltip='List View'
                            variant={isGridView ? 'outline' : 'default'}
                            onClick={() => setViewMode('list')}
                        >
                            <List size={16} />
                        </Button>
                        <FilterModal
                            value={filterValues}
                            onChange={handleFilter}
                            columns={[
                                {
                                    label: 'Search (Name/Description/Creator)',
                                    value: 'query',
                                },
                                {
                                    label: 'Priority',
                                    value: 'priority',
                                    type: 'select',
                                    options: [
                                        {
                                            label: 'High',
                                            value: 'high',
                                        },
                                        {
                                            label: 'Medium',
                                            value: 'medium',
                                        },
                                        {
                                            label: 'Low',
                                            value: 'low',
                                        },
                                    ],
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

            <div className='h-[calc(100vh-120px)] flex flex-col justify-between'>
                {isGridView ? (
                    <div className='my-2 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-5 overflow-x-hidden'>
                        {allDocuments.map((doc) => (
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
                    <GlobalTable
                        isLoading={isLoading}
                        limit={limit}
                        data={allDocuments}
                        defaultColumns={defaultColumns}
                        tableName='upload-documents-table'
                    />
                )}

                <GlobalPagination
                    currentPage={currentPage}
                    totalItems={total}
                    itemsPerPage={limit}
                    onPageChange={handlePageChange}
                />
            </div>

            <UploadedDocumentDetailsModal
                setSelected={setSelected}
                isOpen={isDetailsModalOpen}
                onClose={handleCloseDetailsModal}
                documentId={selectedDocumentId || documentId}
                relatedDocuments={allDocuments}
            />

            <UploadDocumentModal
                isOpen={isUploadModalOpen || selected !== null}
                onClose={handleCloseUploadModal}
                selected={selected}
            />
        </div>
    );
}
