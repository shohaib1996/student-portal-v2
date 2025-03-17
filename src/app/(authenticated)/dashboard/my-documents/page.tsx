'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { DocumentCard } from './_components/document-card';
import { GlobalPagination } from '@/components/global/global-pagination';
import { DocumentDetailsModal } from './_components/document-details-modal';
import { UploadDocumentModal } from './_components/upload-document-modal';
import { useSearchParams } from 'next/navigation';
import GlobalHeader from '@/components/global/GlobalHeader';

// Mock data for documents
const documents = Array.from({ length: 20 }, (_, i) => ({
    id: `doc-${i + 1}`,
    title: 'Test Document - For Upload File',
    author: 'John Doe',
    date: new Date(2023, 11, 15, 12, 30).toLocaleString(),
    readTime: 5,
    categories: i % 2 === 0 ? ['Document', 'Development'] : ['Document'],
    imageUrl: '/images/documents-and-labs-thumbnail.png',
}));

export default function DocumentsPage() {
    const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(
        null,
    );
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const searchParams = useSearchParams();

    const currentPage = Number(searchParams.get('page')) || 1;
    const itemsPerPage = 10;
    const totalItems = documents.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const paginatedDocuments = documents.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage,
    );

    const handleDocumentClick = (documentId: string) => {
        setSelectedDocumentId(documentId);
        setIsDetailsModalOpen(true);
    };

    const handleCloseDetailsModal = () => {
        setIsDetailsModalOpen(false);
    };

    const handleOpenUploadModal = () => {
        setIsUploadModalOpen(true);
    };

    const handleCloseUploadModal = () => {
        setIsUploadModalOpen(false);
    };

    return (
        <div className='py-8'>
            <div className='mb-8'>
                <GlobalHeader
                    title='Upload Documents'
                    subTitle='Securely upload and manage your files with ease'
                    buttons={
                        <div className='ml-auto flex items-center gap-4'>
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

            <div className='my-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
                {paginatedDocuments.map((doc) => (
                    <DocumentCard
                        key={doc.id}
                        {...doc}
                        onClick={() => handleDocumentClick(doc.id)}
                    />
                ))}
            </div>

            <GlobalPagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                baseUrl='/documents'
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
