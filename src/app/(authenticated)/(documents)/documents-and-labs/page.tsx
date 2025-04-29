'use client';

import Link from 'next/link';
import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight, LayoutGrid, List, Eye, Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { GlobalDocumentCard } from '@/components/global/documents/GlobalDocumentCard';
import {
    LabContent,
    useGetContentDetailsQuery,
    useGetLabContentQuery,
    useGetMyTemplatesQuery,
} from '@/redux/api/documents/documentsApi';
import GlobalHeader from '@/components/global/GlobalHeader';
import GlobalPagination from '@/components/global/GlobalPagination';
import FilterModal from '@/components/global/FilterModal/FilterModal';
import GlobalTable, {
    TCustomColumnDef,
} from '@/components/global/GlobalTable/GlobalTable';
import TdDate from '@/components/global/TdDate';
import { TdUser } from '@/components/global/TdUser';
import { DocumentAndLabsDetailsModal } from './_components/DocumentAndLabsDetailsModal';
import { TConditions } from '@/components/global/FilterModal/QueryBuilder';
import { renderPlainText } from '@/components/lexicalEditor/renderer/renderPlainText';

interface FilterValues {
    query?: string;
    type?: string;
    date?: string;
}
// Filter templates based on filter values
interface Template {
    _id: string;
    name?: string;
    description?: string;
    type?: string;
    createdAt: string;
    updatedAt: string;
    createdBy?: {
        _id: string;
        fullName?: string;
    };
}

interface Filters {
    query?: string;
    type?: string;
    date?: string;
}

export default function DocumentsAndLabsPage() {
    const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(
        null,
    );
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isGridView, setIsGridView] = useState<boolean>(true);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [limit, setLimit] = useState<number>(10);
    const [query, setQuery] = useState('');
    const [date, setDate] = useState('');
    const [filterValues, setFilterValues] = useState<TConditions[]>([]);

    const router = useRouter();
    const searchParams = useSearchParams();

    // Get URL parameters
    const documentId = searchParams.get('documentId');
    const mode = searchParams.get('mode');

    // Fetch templates data
    const {
        data: labsData,
        error,
        isLoading,
    } = useGetLabContentQuery({
        page: currentPage,
        limit: limit,
        ...(query ? { query: query } : {}),
        ...(date ? { date: date } : {}),
    });
    // Fetch single document data if documentId is present
    // Always call hooks at the top level with skip condition
    const { data: singleData, isLoading: isDocumentLoading } =
        useGetContentDetailsQuery(documentId || '', { skip: !documentId });

    // Handle URL-based modal opening
    useEffect(() => {
        if (documentId && mode === 'view') {
            setSelectedDocumentId(documentId);
            setIsModalOpen(true);
        }
    }, [documentId, mode]);
    const allLabsData = labsData?.contents || [];
    // Format document content from API response
    const content = useMemo(() => {
        if (!singleData) {
            return null;
        }

        return {
            _id: singleData?.content?._id || '',
            title: singleData?.content?.name || 'Untitled',
            author: singleData?.content?.createdBy || 'Unknown Author',
            uploadDate:
                singleData?.content?.createdAt || new Date().toISOString(),
            lastUpdate:
                singleData?.content?.updatedAt || new Date().toISOString(),
            tags: singleData?.content?.tags || [],
            content: singleData?.content?.description || '',
            imageUrl: singleData?.content?.thumbnail || '/placeholder.svg',
            attachedFiles: singleData?.content?.attachedFiles || [],
        };
    }, [singleData]);

    const handleDocumentClick = (documentId: string) => {
        setSelectedDocumentId(documentId);
        setIsModalOpen(true);
        router.push(`/documents-and-labs?documentId=${documentId}&mode=view`);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedDocumentId(null);
        router.push('/documents-and-labs');
    };

    const handleFilter = (
        conditions: any[],
        queryObj: Record<string, string>,
    ) => {
        setFilterValues(conditions);
        setQuery(queryObj['query'] ?? '');
        setDate(queryObj['date'] ?? '');
        setCurrentPage(1); // Reset to first page when filtering
    };

    const handlePageChange = (page: number, newLimit: number) => {
        setLimit(newLimit);
        setCurrentPage(page);
    };

    const defaultColumns: TCustomColumnDef<(typeof allLabsData)[0]>[] = [
        {
            accessorKey: 'name',
            header: 'Lab Name',
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
                    <TdUser
                        user={{
                            _id: row.original.createdBy._id,
                            fullName:
                                row.original.createdBy.fullName || 'Unknown',
                        }}
                    />
                ) : (
                    <span>Unknown</span>
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
        // {
        //     accessorKey: 'type',
        //     header: 'Type',
        //     cell: ({ row }) => (
        //         <span className={row.original.type ? '' : 'text-gray'}>
        //             {row.original.type || 'Not Set'}
        //         </span>
        //     ),
        //     footer: (data) => data.column.id,
        //     id: 'type',
        //     visible: true,
        //     canHide: true,
        // },
        {
            accessorKey: 'description',
            header: 'Description',
            cell: ({ row }) => (
                <span
                    className={row.original.description ? '' : 'text-gray-400'}
                >
                    {row.original.description
                        ? renderPlainText({
                              text: row.original.description || '-',
                          })
                        : '-'}
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

    if (isLoading) {
        return (
            <div className='flex items-center justify-center h-screen'>
                <Loader2 className='w-8 h-8 animate-spin text-primary' />
            </div>
        );
    }

    if (error) {
        const errorMessage =
            typeof error === 'object' && error !== null && 'data' in error
                ? (error.data as any)?.error
                : 'Failed to fetch data';
        return (
            <div className='w-full h-[80vh] flex items-center justify-center text-xl'>
                {errorMessage}
            </div>
        );
    }

    console.log(allLabsData);

    return (
        <div className='pt-2'>
            <GlobalHeader
                title='Documents & Labs'
                subTitle='View your documents and labs with ease'
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
                        <FilterModal
                            value={filterValues}
                            onChange={handleFilter}
                            columns={[
                                {
                                    label: 'Search (Name/Description)',
                                    value: 'query',
                                },
                                {
                                    label: 'Creation Date',
                                    value: 'date',
                                },
                            ]}
                        />
                        <Link href='/dashboard'>
                            <Button size='sm'>
                                Go to Dashboard
                                <ChevronRight className='h-4 w-4' />
                            </Button>
                        </Link>
                    </div>
                }
            />

            <div className='h-[calc(100vh-120px)] flex flex-col justify-between'>
                {isGridView ? (
                    <div className='my-2 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'>
                        {allLabsData.map((content: LabContent) => (
                            <GlobalDocumentCard
                                redirect='documents-and-labs'
                                key={content?._id}
                                id={content?._id}
                                {...content}
                                onClick={() =>
                                    handleDocumentClick(content?._id)
                                }
                            />
                        ))}
                    </div>
                ) : (
                    <GlobalTable
                        isLoading={false}
                        limit={limit}
                        data={allLabsData || []}
                        defaultColumns={defaultColumns}
                        tableName='my-templates-table'
                    />
                )}

                <GlobalPagination
                    currentPage={currentPage}
                    totalItems={labsData?.count || 0}
                    itemsPerPage={limit}
                    onPageChange={handlePageChange}
                />
            </div>

            <DocumentAndLabsDetailsModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                documentId={selectedDocumentId}
                documentData={content || undefined}
                relatedDocuments={allLabsData || undefined}
                mode={(mode as 'view' | 'edit' | 'add') || 'view'}
            />
        </div>
    );
}
