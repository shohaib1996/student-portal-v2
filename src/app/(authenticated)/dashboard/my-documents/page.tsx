'use client';

// import { Upload } from 'lucide-react';
import { useState, useEffect } from 'react'; // Added useEffect
import { Button } from '@/components/ui/button';
import { GlobalHeader } from '@/components/global/global-header';
import { GlobalPagination } from '@/components/global/global-pagination';
import { DocumentDetailsModal } from './_components/document-details-modal';
import { UploadDocumentModal } from './_components/upload-document-modal';
import { useRouter, useSearchParams } from 'next/navigation';
import { GlobalDocumentCard } from '@/components/global/documents/GlobalDocumentCard';
import { useGetMyDocumentQuery } from '@/redux/api/documents/documentsApi';

export default function MyDocumentsPage() {
    const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(
        null,
    );
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const searchParams = useSearchParams();
    const router = useRouter();

    const currentPage = Number(searchParams.get('page')) || 1;
    const itemsPerPage = Number(searchParams.get('limit')) || 10;
    const documentIdFromUrl = searchParams.get('id');

    const { data, error, isLoading } = useGetMyDocumentQuery({
        page: currentPage,
        limit: itemsPerPage,
    });

    const totalItems = data?.count || 10;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    // Handle modal state based on URL parameter
    useEffect(() => {
        if (documentIdFromUrl) {
            setSelectedDocumentId(documentIdFromUrl);
            setIsDetailsModalOpen(true);
        }
    }, [documentIdFromUrl]);

    console.log(selectedDocumentId);

    if (isLoading) {
        return <div>Loading...</div>;
    }
    if (error) {
        return <div>Something went wrong!</div>;
    }

    const myDocuments = data?.documents || [];

    const handleDocumentClick = (documentId: string) => {
        setSelectedDocumentId(documentId);
        router.push(
            `/dashboard/my-documents?page=${currentPage}&limit=${itemsPerPage}&id=${documentId}`,
        );
        setIsDetailsModalOpen(true);
    };

    const handleCloseDetailsModal = () => {
        setIsDetailsModalOpen(false);
        // Remove the id parameter but keep other params
        const params = new URLSearchParams(searchParams.toString());
        params.delete('id');
        router.push(`/dashboard/my-documents?${params.toString()}`);
    };

    const handleOpenUploadModal = () => {
        setIsUploadModalOpen(true);
    };

    const handleCloseUploadModal = () => {
        setIsUploadModalOpen(false);
    };

    return (
        <div>
            <div className='mb-3'>
                <GlobalHeader
                    title='My Documents'
                    subtitle='Resource Library: Access All Essential Documents'
                >
                    <div className='ml-auto flex items-center gap-2'>
                        <Button variant='outline' size='sm'>
                            Filters
                        </Button>
                        {/* <Button
                            onClick={handleOpenUploadModal}
                            size='sm'
                            className='gap-2'
                        >
                            <Upload className='h-4 w-4' />
                            Upload Document
                        </Button> */}
                    </div>
                </GlobalHeader>
            </div>

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
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                onLimitChange={(number) => {
                    console.log(number);
                    router.push(
                        `/dashboard/my-documents?page=1&limit=${number}`,
                    );
                }}
                baseUrl='/dashboard/my-documents'
            />

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
