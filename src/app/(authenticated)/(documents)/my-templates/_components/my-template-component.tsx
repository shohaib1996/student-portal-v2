'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { GlobalHeader } from '@/components/global/global-header';
import { GlobalPagination } from '@/components/global/global-pagination';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { GlobalDocumentCard } from '@/components/global/documents/GlobalDocumentCard';
import {
    LabContent,
    useGetMyTemplatesQuery,
} from '@/redux/api/documents/documentsApi';
import { DocumentDetailsModal } from './document-details-modal';

export default function MyTemplateComponent() {
    const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(
        null,
    );
    const [isModalOpen, setIsModalOpen] = useState(false);
    const searchParams = useSearchParams();
    const router = useRouter();

    const currentPage = parseInt(searchParams.get('page') || '1', 10) || 1;
    const itemsPerPage = Number(searchParams.get('limit')) || 10;
    const documentIdFromUrl = searchParams.get('id');

    const { data, error, isLoading } = useGetMyTemplatesQuery();

    const totalItems = data?.count || 10;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    // Handle modal state based on URL parameter
    useEffect(() => {
        if (documentIdFromUrl) {
            setSelectedDocumentId(documentIdFromUrl);
            setIsModalOpen(true);
        }
    }, [documentIdFromUrl]);

    if (isLoading) {
        return <div>Loading...</div>;
    }
    if (error) {
        return <div>Something went wrong!</div>;
    }

    const labContent = data?.templates || [];

    const handleDocumentClick = (documentId: string) => {
        setSelectedDocumentId(documentId);
        const params = new URLSearchParams(searchParams.toString());
        params.set('id', documentId);
        router.push(`/dashboard/my-tempaltes?${params.toString()}`);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);

        const params = new URLSearchParams(searchParams.toString());
        params.delete('id');
        router.push(`/dashboard/documents-and-labs?${params.toString()}`);
    };

    return (
        <div className=''>
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
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                onLimitChange={(number) => {
                    console.log(number);
                    router.push(`/dashboard/my-templates?limit=${number}`);
                }}
                baseUrl='/dashboard/my-templates'
            />

            <DocumentDetailsModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                documentId={selectedDocumentId}
            />
        </div>
    );
}
