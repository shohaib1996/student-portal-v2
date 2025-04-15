'use client';

import Link from 'next/link';
import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight, Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
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
    const { data, error, isLoading } = useGetMyTemplatesQuery();
    const allTemplates = data?.templates || [];
    const totalItems = data?.count || 0;
    const router = useRouter();
    const searchParams = useSearchParams();

    // Get URL parameters
    const documentId = searchParams.get('documentId');
    const mode = searchParams.get('mode');
    // Handle URL-based modal opening
    useEffect(() => {
        if (documentId && mode === 'view') {
            setSelectedDocumentId(documentId);
            setIsModalOpen(true);
        }
    }, [documentId, mode]);
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
                      .includes(filters.query?.toLowerCase()) ||
                  template.description
                      ?.toLowerCase()
                      .includes(filters.query?.toLowerCase())
                : true;

            const matchesType = filters.type
                ? template.type?.toLowerCase() === filters.type?.toLowerCase()
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
        return (
            <div className='flex items-center justify-center h-screen'>
                <Loader2 className='w-8 h-8 animate-spin text-primary' />
            </div>
        );
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
        router.push('/my-templates');
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
                <div className='my-2 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'>
                    {paginatedTemplates.map((content: LabContent) => (
                        <GlobalDocumentCard
                            redirect='my-templates'
                            key={content._id}
                            id={content._id}
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
