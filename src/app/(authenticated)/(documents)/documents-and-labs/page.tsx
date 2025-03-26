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
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { DocumentDetailsModal } from './_components/document-details-modal';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { GlobalDocumentCard } from '@/components/global/documents/GlobalDocumentCard';
import {
    LabContent,
    useGetLabContentQuery,
} from '@/redux/api/documents/documentsApi';
import GlobalHeader from '@/components/global/GlobalHeader';
import GlobalPagination from '@/components/global/GlobalPagination';

export default function DocumentsPage() {
    const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(
        null,
    );
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [limit, setLimit] = useState<number>(10);
    const router = useRouter();

    const { data, error, isLoading } = useGetLabContentQuery({
        page: currentPage,
        limit: limit,
    });

    const totalItems = data?.count || 0;
    const totalPages = Math.ceil(totalItems / limit);
    const labContent = data?.contents || [];

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
                title='Documents & Labs'
                subTitle='View your documents with ease' // Fixed prop name from 'subtitle' to 'subTitle'
                buttons={
                    <div className='flex items-center gap-2'>
                        <Button variant='outline' size='sm'>
                            Filters
                        </Button>
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
                    {labContent.map((content: LabContent) => (
                        <GlobalDocumentCard
                            key={content._id}
                            {...content}
                            onClick={() => handleDocumentClick(content._id)}
                        />
                    ))}
                </div>

                <GlobalPagination
                    currentPage={currentPage}
                    totalItems={totalItems}
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
