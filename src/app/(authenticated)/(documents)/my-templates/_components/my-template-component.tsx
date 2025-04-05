// 'use client';

// import Link from 'next/link';
// import { useState, useEffect } from 'react';
// import { GlobalHeader } from '@/components/global/global-header';
// import { GlobalPagination } from '@/components/global/global-pagination';
// import { Button } from '@/components/ui/button';
// import { ChevronRight } from 'lucide-react';
// import { useSearchParams, useRouter } from 'next/navigation';
// import { GlobalDocumentCard } from '@/components/global/documents/GlobalDocumentCard';
// import {
//     LabContent,
//     useGetMyTemplatesQuery,
// } from '@/redux/api/documents/documentsApi';
// import { DocumentDetailsModal } from './document-details-modal';

// export default function MyTemplateComponent() {
//     const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(
//         null,
//     );
//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const searchParams = useSearchParams();
//     const router = useRouter();

//     const currentPage = parseInt(searchParams.get('page') || '1', 10) || 1;
//     const itemsPerPage = Number(searchParams.get('limit')) || 10;
//     const documentIdFromUrl = searchParams.get('id');

//     const { data, error, isLoading } = useGetMyTemplatesQuery();

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

//     const labContent = data?.templates || [];

//     const handleDocumentClick = (documentId: string) => {
//         setSelectedDocumentId(documentId);
//         const params = new URLSearchParams(searchParams.toString());
//         params.set('id', documentId);
//         router.push(`/dashboard/my-tempaltes?${params.toString()}`);
//         setIsModalOpen(true);
//     };

//     const handleCloseModal = () => {
//         setIsModalOpen(false);

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
//                     console.log(number);
//                     router.push(`/dashboard/my-templates?limit=${number}`);
//                 }}
//                 baseUrl='/dashboard/my-templates'
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
// import { ChevronRight } from 'lucide-react';
// import { useRouter } from 'next/navigation';
// import { GlobalDocumentCard } from '@/components/global/documents/GlobalDocumentCard';
// import {
//     LabContent,
//     useGetMyTemplatesQuery,
// } from '@/redux/api/documents/documentsApi';
// import { DocumentDetailsModal } from './document-details-modal';
// import GlobalHeader from '@/components/global/GlobalHeader';
// import GlobalPagination from '@/components/global/GlobalPagination';

// export default function MyTemplateComponent() {
//     const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(
//         null,
//     );
//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const [currentPage, setCurrentPage] = useState<number>(1);
//     const [limit, setLimit] = useState<number>(10);
//     const router = useRouter();

//     const { data, error, isLoading } = useGetMyTemplatesQuery();

//     const totalItems = data?.count || 0;
//     const totalPages = Math.ceil(totalItems / limit);
//     const labContent = data?.templates || [];

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

//     return (
//         <div>
//             <GlobalHeader
//                 title='Documents & Labs'
//                 subTitle='View your documents with ease' // Fixed prop name from 'subtitle' to 'subTitle'
//                 buttons={
//                     <div className='flex items-center gap-2'>
//                         <Button variant='outline' size='sm'>
//                             Filters
//                         </Button>
//                         <Link href='/dashboard'>
//                             <Button size='sm'>
//                                 Go to Dashboard
//                                 <ChevronRight className='h-4 w-4' />
//                             </Button>
//                         </Link>
//                     </div>
//                 }
//             />

//             <div className='h-[calc(100vh-120px)] flex flex-col justify-between'>
//                 <div className='my-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'>
//                     {labContent.map((content: LabContent) => (
//                         <GlobalDocumentCard
//                             key={content._id}
//                             {...content}
//                             onClick={() => handleDocumentClick(content._id)}
//                         />
//                     ))}
//                 </div>

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
import { ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { GlobalDocumentCard } from '@/components/global/documents/GlobalDocumentCard';
import {
    LabContent,
    useGetMyTemplatesQuery,
} from '@/redux/api/documents/documentsApi';
import { DocumentDetailsModal } from './document-details-modal';
import GlobalHeader from '@/components/global/GlobalHeader';
import GlobalPagination from '@/components/global/GlobalPagination';
import FilterModal from '@/components/global/FilterModal/FilterModal';

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
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [limit, setLimit] = useState<number>(10);
    const [filters, setFilters] = useState<FilterValues>({});

    const router = useRouter();
    const { data, error, isLoading } = useGetMyTemplatesQuery();

    const allTemplates = data?.templates || [];
    const totalItems = data?.count || 0;

    // Filter templates based on filter values
    const filteredTemplates = useMemo(() => {
        interface Template {
            _id: string;
            name?: string;
            description?: string;
            type?: string;
            createdAt: string;
        }

        interface Filters {
            query?: string;
            type?: string;
            date?: string;
        }

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

    return (
        <div>
            <GlobalHeader
                title='My Templates'
                subTitle='Browse and manage your saved templates for quick and easy use.'
                buttons={
                    <div className='flex items-center gap-2'>
                        <FilterModal
                            value={Object.entries(filters)
                                .filter(([_, value]) => value)
                                .map(([field, value]) => ({
                                    field,
                                    operator: 'eq',
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

            <div className='h-[calc(100vh-120px)] flex flex-col justify-between'>
                <div className='my-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'>
                    {paginatedTemplates.map((content: LabContent) => (
                        <GlobalDocumentCard
                            key={content._id}
                            {...content}
                            onClick={() => handleDocumentClick(content._id)}
                        />
                    ))}
                </div>

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
