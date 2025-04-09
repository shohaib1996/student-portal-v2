// 'use client';

// import Link from 'next/link';
// import { useState, useEffect } from 'react';
// import { GlobalHeader } from '@/components/global/global-header';
// import { GlobalPagination } from '@/components/global/global-pagination';
// import { DocumentDetailsModal } from './_components/document-details-modal';
// import { Button } from '@/components/ui/button';
// import { ChevronRight } from 'lucide-react';
// import { useSearchParams, useRouter } from 'next/navigation';
// import { GlobalDocumentCard } from '@/components/global/documents/GlobalDocumentCard';
// import {
//     LabContent,
//     useGetLabContentQuery,
// } from '@/redux/api/documents/documentsApi';

// export default function DocumentsPage() {
//     const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(
//         null,
//     );
//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const searchParams = useSearchParams();
//     const router = useRouter();

//     const currentPage = parseInt(searchParams.get('page') || '1', 10) || 1;
//     const itemsPerPage = Number(searchParams.get('limit')) || 10;
//     const documentIdFromUrl = searchParams.get('id');

//     const { data, error, isLoading } = useGetLabContentQuery({
//         page: currentPage,
//         limit: itemsPerPage,
//     });

//     const totalItems = data?.count || 10;
//     const totalPages = Math.ceil(totalItems / itemsPerPage);
//     // Handle modal state based on URL parameter
//     useEffect(() => {
//         if (documentIdFromUrl) {
//             setSelectedDocumentId(documentIdFromUrl);
//             setIsModalOpen(true);
//         }
//     }, [documentIdFromUrl]);

//     if (isLoading) {
//         return <div>Loading...</div>;
//     }
//     if (error) {
//         return <div>Something went wrong!</div>;
//     }

//     const labContent = data?.contents || [];

//     const handleDocumentClick = (documentId: string) => {
//         setSelectedDocumentId(documentId);
//         const params = new URLSearchParams(searchParams.toString());
//         params.set('id', documentId);
//         router.push(`/dashboard/documents-and-labs?${params.toString()}`);
//         setIsModalOpen(true);
//     };

//     const handleCloseModal = () => {
//         setIsModalOpen(false);
//         // Remove the id parameter but keep other params
//         const params = new URLSearchParams(searchParams.toString());
//         params.delete('id');
//         router.push(`/dashboard/documents-and-labs?${params.toString()}`);
//     };

//     return (
//         <div className=''>
//             <GlobalHeader
//                 title='Documents & Labs'
//                 subtitle='View your documents with ease'
//             >
//                 <div className='flex items-center gap-2'>
//                     <Button variant='outline' size='sm'>
//                         Filters
//                     </Button>
//                     <Link href='/dashboard'>
//                         <Button size='sm' asChild>
//                             Go to Dashboard
//                             <ChevronRight className='h-4 w-4' />
//                         </Button>
//                     </Link>
//                 </div>
//             </GlobalHeader>

//             <div className='my-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'>
//                 {labContent.map((content: LabContent) => (
//                     <GlobalDocumentCard
//                         key={content._id}
//                         {...content}
//                         onClick={() => handleDocumentClick(content._id)}
//                     />
//                 ))}
//             </div>

//             <GlobalPagination
//                 currentPage={currentPage}
//                 totalPages={totalPages}
//                 totalItems={totalItems}
//                 itemsPerPage={itemsPerPage}
//                 onLimitChange={(number) => {
//                     router.push(
//                         `/dashboard/documents-and-labs?limit=${number}`,
//                     );
//                 }}
//                 baseUrl='/dashboard/documents-and-labs'
//             />

//             <DocumentDetailsModal
//                 isOpen={isModalOpen}
//                 onClose={handleCloseModal}
//                 documentId={selectedDocumentId}
//             />
//         </div>
//     );
// }
// 'use client';

// import Link from 'next/link';
// import { useState } from 'react';
// import { Button } from '@/components/ui/button';
// import { ChevronRight, LayoutGrid, List, Eye } from 'lucide-react';
// import { useRouter } from 'next/navigation';
// import { GlobalDocumentCard } from '@/components/global/documents/GlobalDocumentCard';
// import {
//     LabContent,
//     useGetLabContentQuery,
// } from '@/redux/api/documents/documentsApi';
// import GlobalHeader from '@/components/global/GlobalHeader';
// import GlobalPagination from '@/components/global/GlobalPagination';
// import { DocumentDetailsModal } from './_components/document-details-modal';
// import FilterModal from '@/components/global/FilterModal/FilterModal';
// import GlobalTable, {
//     TCustomColumnDef,
// } from '@/components/global/GlobalTable/GlobalTable';
// import TdDate from '@/components/global/TdDate';
// import { TdUser } from '@/components/global/TdUser';

// export default function DocumentsPage() {
//     const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(
//         null,
//     );
//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const [isGridView, setIsGridView] = useState<boolean>(true);
//     const [currentPage, setCurrentPage] = useState<number>(1);
//     const [limit, setLimit] = useState<number>(10);
//     const router = useRouter();

//     const { data, error, isLoading } = useGetLabContentQuery({
//         page: currentPage,
//         limit: limit,
//     });

//     const totalItems = data?.count || 0;
//     const totalPages = Math.ceil(totalItems / limit);
//     const labContent = data?.contents || [];

//     if (isLoading) {
//         return <div>Loading...</div>;
//     }
//     if (error) {
//         return <div>Something went wrong!</div>;
//     }

//     const handleDocumentClick = (documentId: string) => {
//         setSelectedDocumentId(documentId);
//         setIsModalOpen(true);
//     };

//     const handleCloseModal = () => {
//         setIsModalOpen(false);
//         setSelectedDocumentId(null);
//     };

//     const handlePageChange = (page: number, newLimit?: number) => {
//         const validPage = Math.max(1, Math.min(page, totalPages));
//         setCurrentPage(validPage);

//         if (newLimit) {
//             setLimit(newLimit);
//             const newStartIndex = (validPage - 1) * newLimit;
//             const newCurrentPage = Math.floor(newStartIndex / newLimit) + 1;
//             setCurrentPage(newCurrentPage);
//         }
//     };

//     const defaultColumns: TCustomColumnDef<(typeof labContent)[0]>[] = [
//         {
//             accessorKey: 'name',
//             header: 'Document Name',
//             cell: ({ row }) => <span>Untitled</span>,
//             footer: (data) => data.column.id,
//             id: 'name',
//             visible: true,
//             canHide: false,
//         },
//         {
//             accessorKey: 'createdBy',
//             header: 'Created By',
//             cell: ({ row }) => <span>Author</span>,
//             footer: (data) => data.column.id,
//             id: 'createdBy',
//             visible: true,
//             canHide: false,
//         },
//         {
//             accessorKey: 'createdAt',
//             header: 'Created Date',
//             cell: ({ row }) => <span>March 26, 2025</span>,
//             footer: (data) => data.column.id,
//             id: 'createdAt',
//             visible: true,
//             canHide: false,
//         },
//         {
//             accessorKey: 'updatedAt',
//             header: 'Last Updated',
//             cell: ({ row }) => <TdDate date={'March 26, 2025'} />,
//             footer: (data) => data.column.id,
//             id: 'updatedAt',
//             visible: true,
//             canHide: false,
//         },
//         {
//             accessorKey: 'priority',
//             header: 'Priority',
//             cell: ({ row }) => <span>Not Set</span>,
//             footer: (data) => data.column.id,
//             id: 'priority',
//             visible: true,
//             canHide: true,
//         },
//         {
//             accessorKey: 'description',
//             header: 'Description',
//             cell: ({ row }) => (
//                 <span
//                     className={row.original.description ? '' : 'text-gray-400'}
//                 >
//                     {row.original.description || 'No description'}
//                 </span>
//             ),
//             footer: (data) => data.column.id,
//             id: 'description',
//             visible: true,
//             canHide: true,
//         },
//         {
//             accessorKey: 'actions',
//             header: 'Actions',
//             cell: ({ row }) => (
//                 <div className='flex items-center gap-2'>
//                     <Button
//                         tooltip='View'
//                         variant={'plain'}
//                         className='bg-foreground size-8'
//                         icon={<Eye size={18} />}
//                         size={'icon'}
//                         onClick={() => handleDocumentClick(row.original._id)}
//                     />
//                 </div>
//             ),
//             footer: (data) => data.column.id,
//             id: 'actions',
//             visible: true,
//             canHide: false,
//         },
//     ];

//     return (
//         <div>
//             <div className='mb-3'>
//                 <GlobalHeader
//                     title='Documents & Labs'
//                     subTitle='View your documents with ease'
//                     buttons={
//                         <div className='flex items-center gap-2'>
//                             <Button
//                                 variant={!isGridView ? 'outline' : 'default'}
//                                 onClick={() => setIsGridView(true)}
//                             >
//                                 <LayoutGrid size={16} />
//                             </Button>
//                             <Button
//                                 variant={isGridView ? 'outline' : 'default'}
//                                 onClick={() => setIsGridView(false)}
//                             >
//                                 <List size={16} />
//                             </Button>
//                             <FilterModal
//                                 value={[]}
//                                 columns={[]}
//                                 onChange={() => null}
//                             />
//                             <Link href='/dashboard'>
//                                 <Button size='sm'>
//                                     Go to Dashboard
//                                     <ChevronRight className='h-4 w-4' />
//                                 </Button>
//                             </Link>
//                         </div>
//                     }
//                 />
//             </div>

//             <div className='h-[calc(100vh-120px)] flex flex-col justify-between'>
//                 {isGridView ? (
//                     <div className='my-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'>
//                         {labContent.map((content: LabContent) => (
//                             <GlobalDocumentCard
//                                 key={content._id}
//                                 {...content}
//                                 onClick={() => handleDocumentClick(content._id)}
//                             />
//                         ))}
//                     </div>
//                 ) : (
//                     <div>
//                         <GlobalTable
//                             isLoading={false}
//                             limit={limit}
//                             data={labContent}
//                             defaultColumns={defaultColumns}
//                             tableName='documents-labs-table'
//                         />
//                     </div>
//                 )}

//                 <GlobalPagination
//                     currentPage={currentPage}
//                     totalItems={totalItems}
//                     itemsPerPage={limit}
//                     onPageChange={handlePageChange}
//                 />
//             </div>

//             <DocumentDetailsModal
//                 isOpen={isModalOpen}
//                 onClose={handleCloseModal}
//                 documentId={selectedDocumentId}
//             />
//         </div>
//     );
// }
'use client';

import Link from 'next/link';
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight, LayoutGrid, List, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { GlobalDocumentCard } from '@/components/global/documents/GlobalDocumentCard';
import {
    LabContent,
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
import { DocumentDetailsModal } from './_components/document-details-modal';

interface FilterValues {
    query?: string;
    type?: string;
    date?: string;
}

export default function MyTemplateComponent() {
    const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(
        null,
    );
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isGridView, setIsGridView] = useState<boolean>(true);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [limit, setLimit] = useState<number>(10);
    const [filters, setFilters] = useState<FilterValues>({});

    const router = useRouter();
    const { data, error, isLoading } = useGetMyTemplatesQuery();

    const allTemplates = data?.templates || [];
    const totalItems = data?.count || 0;

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

    const filteredTemplates = useMemo(() => {
        return allTemplates.filter((template: Template) => {
            const matchesQuery = filters.query
                ? template.name
                      ?.toLowerCase()
                      .includes(filters.query.toLowerCase()) ||
                  template.description
                      ?.toLowerCase()
                      .includes(filters.query.toLowerCase())
                : true;

            const matchesType = filters.type
                ? template.type?.toLowerCase() === filters.type.toLowerCase()
                : true;

            const matchesDate = filters.date
                ? new Date(template.createdAt).toDateString() ===
                  new Date(filters.date).toDateString()
                : true;

            return matchesQuery && matchesType && matchesDate;
        });
    }, [allTemplates, filters]);

    const paginatedTemplates = useMemo(() => {
        const startIndex = (currentPage - 1) * limit;
        const endIndex = startIndex + limit;
        return filteredTemplates.slice(startIndex, endIndex);
    }, [filteredTemplates, currentPage, limit]);

    const totalPages = Math.ceil(filteredTemplates.length / limit);

    if (isLoading) {
        return <div>Loading...</div>;
    }
    if (error) {
        return <div>Something went wrong!</div>;
    }

    const handleDocumentClick = (documentId: string) => {
        setSelectedDocumentId(documentId);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedDocumentId(null);
    };

    const handleFilter = (
        conditions: any[],
        queryObj: Record<string, string>,
    ) => {
        setFilters({
            query: queryObj.query,
            type: queryObj.type,
            date: queryObj.date,
        });
        setCurrentPage(1); // Reset to first page when filtering
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

    const defaultColumns: TCustomColumnDef<(typeof allTemplates)[0]>[] = [
        {
            accessorKey: 'name',
            header: 'Template Name',
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
        {
            accessorKey: 'type',
            header: 'Type',
            cell: ({ row }) => (
                <span className={row.original.type ? '' : 'text-gray-400'}>
                    {row.original.type || 'Not Set'}
                </span>
            ),
            footer: (data) => data.column.id,
            id: 'type',
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
                    title='Documents & Labs'
                    subTitle='View your documents with ease'
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
                                value={Object.entries(filters)
                                    .filter(([_, value]) => value)
                                    .map(([column, value]) => ({
                                        field: column,
                                        operator: 'equals', // or any other default operator
                                        value,
                                    }))}
                                onChange={handleFilter}
                                columns={[
                                    {
                                        label: 'Search (Name/Description)',
                                        value: 'query',
                                    },
                                    {
                                        label: 'Type',
                                        value: 'type',
                                    },
                                    {
                                        label: 'Created Date',
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
            </div>

            <div className='h-[calc(100vh-120px)] flex flex-col justify-between'>
                {isGridView ? (
                    <div className='my-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'>
                        {paginatedTemplates.map((content: LabContent) => (
                            <GlobalDocumentCard
                                redirect='documents-and-labs'
                                key={content._id}
                                {...content}
                                onClick={() => handleDocumentClick(content._id)}
                            />
                        ))}
                    </div>
                ) : (
                    <div>
                        <GlobalTable
                            isLoading={false}
                            limit={limit}
                            data={paginatedTemplates}
                            defaultColumns={defaultColumns}
                            tableName='my-templates-table'
                        />
                    </div>
                )}

                <GlobalPagination
                    currentPage={currentPage}
                    totalItems={filteredTemplates.length}
                    itemsPerPage={limit}
                    onPageChange={handlePageChange}
                />
            </div>

            <DocumentDetailsModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                documentId={selectedDocumentId}
            />
        </div>
    );
}
