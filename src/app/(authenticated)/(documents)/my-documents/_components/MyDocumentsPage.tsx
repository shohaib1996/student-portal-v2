'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { GlobalDocumentCard } from '@/components/global/documents/GlobalDocumentCard';
import {
    useGetMyDocumentQuery,
    useGetSingleUploadDocumentQuery,
} from '@/redux/api/documents/documentsApi';
import GlobalHeader from '@/components/global/GlobalHeader';
import FilterModal from '@/components/global/FilterModal/FilterModal';
import type { TConditions } from '@/components/global/FilterModal/QueryBuilder'; // Import TConditions type
import SortMenu from '@/components/global/SortMenu'; // Import SortMenu component
import { Button } from '@/components/ui/button';
import {
    Eye,
    FileX,
    LayoutGrid,
    List,
    Search,
    Plus,
    Download,
    TriangleAlert,
} from 'lucide-react';
import GlobalTable, {
    type TCustomColumnDef,
} from '@/components/global/GlobalTable/GlobalTable';
import TdDate from '@/components/global/TdDate';
import { TdUser } from '@/components/global/TdUser';
import GlobalPagination from '@/components/global/GlobalPagination';
import { MyDocumentDetailsModal } from './MyDocumentDetailsModal';
import CardLoader from '@/components/loading-skeletons/CardLoader';
import { instance } from '@/lib/axios/axiosInstance';
import { renderPlainText } from '@/components/lexicalEditor/renderer/renderPlainText';

interface DocumentDescription {
    [key: string]: string;
}

export default function MyDocumentsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const documentId = searchParams.get('documentId');
    const mode = searchParams.get('mode') || 'view';
    const viewMode = searchParams.get('view') || 'grid';

    // State variables
    const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(
        null,
    );
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isGridView, setIsGridView] = useState<boolean>(viewMode === 'grid');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [limit, setLimit] = useState<number>(10);
    const [documentDescriptions, setDocumentDescriptions] =
        useState<DocumentDescription>({});
    const [isCsvLoading, setIsCsvLoading] = useState(false);

    // Filter and sort state
    const [filterData, setFilterData] = useState<TConditions[]>([]);
    const [sortData, setSortData] = useState<Record<string, number>>({});
    const [query, setQuery] = useState('');
    const [priority, setPriority] = useState('');
    const [date, setDate] = useState('');

    // Fetch documents with filter and sort parameters
    const { data, error, isLoading } = useGetMyDocumentQuery({
        page: currentPage,
        limit: limit,
        // sort: serializeSortData(sortData),
        query,
        priority,
        createdAt: date,
    });
    console.log({ data });
    // Update URL when view mode changes
    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('view', isGridView ? 'grid' : 'list');

        // Preserve other query parameters
        if (documentId) {
            params.set('documentId', documentId);
        }
        if (mode !== 'view') {
            params.set('mode', mode);
        }

        router.push(`/my-documents?${params.toString()}`);
    }, [isGridView, router, searchParams, documentId, mode]);

    useEffect(() => {
        if (documentId && mode === 'view') {
            setIsDetailsModalOpen(true);
        }
    }, [documentId, mode]);

    // Set initial view mode from URL
    useEffect(() => {
        setIsGridView(viewMode === 'grid');
    }, [viewMode]);

    const allDocuments = data?.documents || [];

    console.log(allDocuments);

    // Fetch descriptions for documents that don't have one
    useEffect(() => {
        const fetchMissingDescriptions = async () => {
            if (!allDocuments || allDocuments.length === 0) {
                return;
            }

            const documentsWithoutDescription = allDocuments.filter(
                (doc) => !doc.description && !documentDescriptions[doc._id],
            );

            if (documentsWithoutDescription.length === 0) {
                return;
            }

            const fetchPromises = documentsWithoutDescription.map(
                async (doc) => {
                    try {
                        const res = await instance.get(
                            `/content/singlecontent/${doc._id}`,
                        );
                        return {
                            id: doc._id,
                            description: res.data.content?.description || '',
                        };
                    } catch (error) {
                        console.error((error as Error).message);
                        return { id: doc._id, description: '' };
                    }
                },
            );

            const results = await Promise.all(fetchPromises);
            const newDescriptions = results.reduce(
                (acc, { id, description }) => {
                    acc[id] = description;
                    return acc;
                },
                {} as DocumentDescription,
            );

            setDocumentDescriptions((prev) => ({
                ...prev,
                ...newDescriptions,
            }));
        };

        fetchMissingDescriptions();
    }, [allDocuments]);

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

    // Handle filter changes
    const handleFilter = (
        conditions: TConditions[],
        queryObj: Record<string, string>,
    ) => {
        setFilterData(conditions);
        setQuery(queryObj['query'] || '');
        setPriority(queryObj['priority'] || '');
        setDate(queryObj['date'] || '');
        setCurrentPage(1);
    };

    const handleDocumentClick = (documentId: string) => {
        setSelectedDocumentId(documentId);
        setIsDetailsModalOpen(true);
    };

    const handleCloseDetailsModal = () => {
        setIsDetailsModalOpen(false);
        setSelectedDocumentId(null);
        router.push(`/my-documents?view=${isGridView ? 'grid' : 'list'}`);
    };

    const handlePageChange = (page: number, newLimit: number) => {
        setCurrentPage(page);
        setLimit(newLimit);
    };

    const toggleViewMode = (gridView: boolean) => {
        setIsGridView(gridView);
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
            cell: ({ row }) =>
                row.original.createdBy ? (
                    <TdUser user={row.original.createdBy} />
                ) : (
                    <span>N/A</span>
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
            cell: ({ row }) => {
                const description =
                    row.original.description ||
                    documentDescriptions[row.original._id] ||
                    '';
                return (
                    <span className={description ? '' : 'text-gray-400'}>
                        {renderPlainText({ text: description, lineClamp: 2 })}
                    </span>
                );
            },
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
                        className='size-8 bg-foreground'
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

    // Loading state
    if (isLoading) {
        if (isGridView) {
            return (
                <div className='flex flex-col gap-3'>
                    <h3 className='text-black font-2xl'>Loading...</h3>
                    <div className='mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'>
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
    }

    // Error state
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

    return (
        <div className='my-2'>
            <GlobalHeader
                title='My Documents'
                subTitle='Resource Library: Access All Essential Documents'
                tooltip={
                    <div>
                        <h5>
                            This page displays all your documents in one place.
                        </h5>
                        <h5>
                            You can view, filter, and manage your documents. Use
                            the grid view for a visual representation or list
                            view for detailed information.
                        </h5>
                    </div>
                }
                buttons={
                    <div className='flex items-center gap-2'>
                        {/* View mode toggles */}
                        <Button
                            tooltip='Grid View'
                            variant={!isGridView ? 'outline' : 'default'}
                            onClick={() => toggleViewMode(true)}
                        >
                            <LayoutGrid size={16} />
                        </Button>
                        <Button
                            tooltip='List View'
                            variant={isGridView ? 'outline' : 'default'}
                            onClick={() => toggleViewMode(false)}
                        >
                            <List size={16} />
                        </Button>

                        {/* Filter modal */}
                        <FilterModal
                            value={filterData}
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
                                        { value: 'high', label: 'High' },
                                        {
                                            value: 'medium',
                                            label: 'Medium',
                                        },
                                        { value: 'low', label: 'Low' },
                                    ],
                                },
                                {
                                    label: 'Creation Date',
                                    value: 'date',
                                },
                            ]}
                        />

                        {/* Sort menu */}
                        <SortMenu
                            value={sortData}
                            onChange={(val) => setSortData(val)}
                            columns={defaultColumns.filter(
                                (col) =>
                                    !['actions'].includes(
                                        col.accessorKey as string,
                                    ),
                            )}
                        />
                    </div>
                }
            />

            <div className='flex h-[calc(100vh-125px)] flex-col justify-between'>
                {isGridView ? (
                    <div className='my-2 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'>
                        {allDocuments.length > 0 ? (
                            allDocuments.map((doc: any) => (
                                <GlobalDocumentCard
                                    key={doc._id}
                                    id={doc._id}
                                    redirect='my-documents'
                                    {...doc}
                                    description={
                                        doc.description ||
                                        documentDescriptions[doc._id] ||
                                        ''
                                    }
                                    onClick={() => handleDocumentClick(doc._id)}
                                />
                            ))
                        ) : (
                            <div className='col-span-full flex flex-col items-center justify-center py-10'>
                                {!query && !priority && !date ? (
                                    <>
                                        <FileX
                                            size={64}
                                            className='mb-4 text-gray-400'
                                        />
                                        <h3 className='text-lg font-medium'>
                                            No documents found
                                        </h3>
                                        <p className='mt-1 text-gray'>{`You haven't uploaded any documents yet`}</p>
                                    </>
                                ) : (
                                    <>
                                        <Search
                                            size={64}
                                            className='mb-4 text-gray-400'
                                        />
                                        <h3 className='text-lg font-medium'>
                                            No matching documents
                                        </h3>
                                        <p className='mt-1 text-gray'>
                                            No documents match your current
                                            filter criteria
                                        </p>
                                        <Button
                                            onClick={() => {
                                                setFilterData([]);
                                                setQuery('');
                                                setPriority('');
                                                setDate('');
                                            }}
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
                    <GlobalTable
                        isLoading={false}
                        limit={limit}
                        data={allDocuments}
                        defaultColumns={defaultColumns}
                        tableName='my-documents-table'
                    />
                )}
                {/* Update the GlobalPagination component call */}
                {allDocuments.length > 0 && (
                    <GlobalPagination
                        currentPage={currentPage}
                        totalItems={data?.count || 0}
                        itemsPerPage={limit}
                        onPageChange={handlePageChange}
                    />
                )}
            </div>

            <MyDocumentDetailsModal
                isOpen={isDetailsModalOpen}
                onClose={handleCloseDetailsModal}
                documentId={selectedDocumentId || documentId}
                relatedDocuments={data?.documents || []}
            />
        </div>
    );
}
