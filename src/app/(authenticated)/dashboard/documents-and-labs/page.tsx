'use client';

import Link from 'next/link';
import { useState } from 'react';
import { GlobalHeader } from '@/components/global/global-header';
import { GlobalPagination } from '@/components/global/global-pagination';
import { DocumentDetailsModal } from './_components/document-details-modal';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { GlobalDocumentCard } from '@/components/global/documents/GlobalDocumentCard';

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
    const [isModalOpen, setIsModalOpen] = useState(false);
    const searchParams = useSearchParams();

    // ✅ Ensure safe parsing of page number
    const currentPage = parseInt(searchParams.get('page') || '1', 10) || 1;
    const itemsPerPage = 10;
    const totalItems = documents.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const paginatedDocuments = documents.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage,
    );

    const handleDocumentClick = (documentId: string) => {
        setSelectedDocumentId(documentId);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    return (
        <div className='py-4'>
            <GlobalHeader
                title='Documents & Labs'
                subtitle='View your documents with ease'
            >
                <div className='flex items-center gap-2'>
                    <Button variant='outline' size='sm'>
                        Filters
                    </Button>
                    <Link href='/dashboard'>
                        <Button size='sm' asChild>
                            Go to Dashboard
                            <ChevronRight className='h-4 w-4' />
                        </Button>
                    </Link>
                </div>
            </GlobalHeader>

            <div className='my-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
                {paginatedDocuments.map((doc) => (
                    <GlobalDocumentCard
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
                onLimitChange={(number) => {
                    console.log(number);
                }}
                baseUrl='/dashboard/documents-and-labs'
            />

            <DocumentDetailsModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                documentId={selectedDocumentId}
            />
        </div>
    );
}
