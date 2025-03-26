// 'use client';

// import { useState, useEffect } from 'react'; // Added useEffect
// import { Button } from '@/components/ui/button';
// import { Upload } from 'lucide-react';
// import { GlobalHeader } from '@/components/global/global-header';
// import { GlobalPagination } from '@/components/global/global-pagination';
// import { useRouter, useSearchParams } from 'next/navigation';
// import { GlobalDocumentCard } from '@/components/global/documents/GlobalDocumentCard';
// import { useGetUploadDocumentsQuery } from '@/redux/api/documents/documentsApi';
// import { DocumentDetailsModal } from './document-details-modal';
// import { UploadDocumentModal } from './upload-document-modal';

// export default function UploadDocumentComponent() {
//     const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(
//         null,
//     );
//     const [currentDoc, setCurrentDoc] = useState({});
//     const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
//     const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
//     const searchParams = useSearchParams();
//     const router = useRouter();

//     const currentPage = Number(searchParams.get('page')) || 1;
//     const itemsPerPage = Number(searchParams.get('limit')) || 10;
//     const documentIdFromUrl = searchParams.get('id');

//     const { data, error, isLoading } = useGetUploadDocumentsQuery({
//         page: currentPage,
//         limit: itemsPerPage,
//     });

//     const totalItems = data?.count || 10;
//     const totalPages = Math.ceil(totalItems / itemsPerPage);

//     // Handle modal state based on URL parameter
//     useEffect(() => {
//         if (documentIdFromUrl) {
//             setSelectedDocumentId(documentIdFromUrl);
//             setIsDetailsModalOpen(true);
//         }
//     }, [documentIdFromUrl]);

//     if (isLoading) {
//         return <div>Loading...</div>;
//     }
//     if (error) {
//         return <div>Something went wrong!</div>;
//     }

//     const myDocuments = data?.documents || [];

//     const handleDocumentClick = (documentId: string) => {
//         setSelectedDocumentId(documentId);
//         router.push(
//             `/dashboard/upload-documents?page=${currentPage}&limit=${itemsPerPage}&id=${documentId}`,
//         );
//         setIsDetailsModalOpen(true);
//     };

//     const handleCloseDetailsModal = () => {
//         setIsDetailsModalOpen(false);
//         // Remove the id parameter but keep other params
//         const params = new URLSearchParams(searchParams.toString());
//         params.delete('id');
//         router.push(`/dashboard/upload-documents?${params.toString()}`);
//     };

//     const handleOpenUploadModal = () => {
//         setIsUploadModalOpen(true);
//     };

//     const handleCloseUploadModal = () => {
//         setIsUploadModalOpen(false);
//     };

//     return (
//         <div>
//             <div className='mb-3'>
//                 <GlobalHeader
//                     title='Upload Documents'
//                     subtitle='Securely upload and manage your files with ease'
//                 >
//                     <div className='ml-auto flex items-center gap-2'>
//                         <Button variant='outline' size='sm'>
//                             Filters
//                         </Button>
//                         <Button
//                             onClick={handleOpenUploadModal}
//                             size='sm'
//                             className='gap-2'
//                         >
//                             <Upload className='h-4 w-4' />
//                             Upload Document
//                         </Button>
//                     </div>
//                 </GlobalHeader>
//             </div>

//             <div className='my-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'>
//                 {myDocuments.map((doc) => (
//                     <GlobalDocumentCard
//                         key={doc._id}
//                         {...doc}
//                         onClick={() => handleDocumentClick(doc._id)}
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
//                     router.push(
//                         `/dashboard/upload-documents?page=1&limit=${number}`,
//                     );
//                 }}
//                 baseUrl='/dashboard/upload-documents'
//             />

//             <DocumentDetailsModal
//                 isOpen={isDetailsModalOpen}
//                 onClose={handleCloseDetailsModal}
//                 documentId={selectedDocumentId}
//             />

//             <UploadDocumentModal
//                 isOpen={isUploadModalOpen}
//                 onClose={handleCloseUploadModal}
//             />
//         </div>
//     );
// }
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { GlobalDocumentCard } from '@/components/global/documents/GlobalDocumentCard';
import { useGetUploadDocumentsQuery } from '@/redux/api/documents/documentsApi';
import { DocumentDetailsModal } from './document-details-modal';
import { UploadDocumentModal } from './upload-document-modal';
import GlobalPagination from '@/components/global/GlobalPagination';
import GlobalHeader from '@/components/global/GlobalHeader';

export default function UploadDocumentComponent() {
    const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(
        null,
    );
    const [currentDoc, setCurrentDoc] = useState({});
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [limit, setLimit] = useState<number>(10);
    const router = useRouter();

    const { data, error, isLoading } = useGetUploadDocumentsQuery({
        page: currentPage,
        limit: limit,
    });

    const totalItems = data?.count || 0;
    const totalPages = Math.ceil(totalItems / limit);
    const myDocuments = data?.documents || [];

    if (isLoading) {
        return <div>Loading...</div>;
    }
    if (error) {
        return <div>Something went wrong!</div>;
    }

    const handleDocumentClick = (documentId: string) => {
        setSelectedDocumentId(documentId);
        setIsDetailsModalOpen(true);
    };

    const handleCloseDetailsModal = () => {
        setIsDetailsModalOpen(false);
        setSelectedDocumentId(null);
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

    return (
        <div>
            <div className='mb-3'>
                <GlobalHeader
                    title='Upload Documents'
                    subTitle='Securely upload and manage your files with ease' // Fixed prop name from 'subtitle' to 'subTitle'
                    buttons={
                        <div className='ml-auto flex items-center gap-2'>
                            <Button variant='outline' size='sm'>
                                Filters
                            </Button>
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
                <div className='my-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'>
                    {myDocuments.map((doc) => (
                        <GlobalDocumentCard
                            key={doc._id}
                            {...doc}
                            onClick={() => handleDocumentClick(doc._id)}
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
                isOpen={isDetailsModalOpen}
                onClose={handleCloseDetailsModal}
                documentId={selectedDocumentId}
            />

            <UploadDocumentModal
                isOpen={isUploadModalOpen}
                onClose={handleCloseUploadModal}
            />
        </div>
    );
}
