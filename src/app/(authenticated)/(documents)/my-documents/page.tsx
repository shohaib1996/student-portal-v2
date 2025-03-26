'use client';

// import { Upload } from 'lucide-react';
import { useState, useEffect } from 'react';
import { GlobalPagination } from '@/components/global/global-pagination';
import { DocumentDetailsModal } from './_components/document-details-modal';
import { UploadDocumentModal } from './_components/upload-document-modal';
import { useRouter, useSearchParams } from 'next/navigation';
import { GlobalDocumentCard } from '@/components/global/documents/GlobalDocumentCard';
import { useGetMyDocumentQuery } from '@/redux/api/documents/documentsApi';
import GlobalHeader from '@/components/global/GlobalHeader';
import FilterModal from '@/components/global/FilterModal/FilterModal';
import { Button } from '@/components/ui/button';
import { Eye, LayoutGrid, List } from 'lucide-react';
import GlobalTable, {
    TCustomColumnDef,
} from '@/components/global/GlobalTable/GlobalTable';
import TdDate from '@/components/global/TdDate';
import { TdUser } from '@/components/global/TdUser';

export default function MyDocumentsPage() {
    const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(
        null,
    );
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isGridView, setIsGridView] = useState<boolean>(true);
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
            `/my-documents?page=${currentPage}&limit=${itemsPerPage}&id=${documentId}`,
        );
        setIsDetailsModalOpen(true);
    };

    const handleCloseDetailsModal = () => {
        setIsDetailsModalOpen(false);
        // Remove the id parameter but keep other params
        const params = new URLSearchParams(searchParams.toString());
        params.delete('id');
        router.push(`/my-documents?${params.toString()}`);
    };

    const handleOpenUploadModal = () => {
        setIsUploadModalOpen(true);
    };

    const handleCloseUploadModal = () => {
        setIsUploadModalOpen(false);
    };

    const defaultColumns: TCustomColumnDef<(typeof myDocuments)[0]>[] = [
        {
            accessorKey: 'name',
            header: 'Document Name',
            cell: ({ row }) => <span>{row.original.name || 'Untitled'}</span>,
            footer: (data) => data.column.id,
            id: 'name',
            visible: true,
            canHide: false,
        },
        {
            accessorKey: 'createdBy',
            header: 'Created By',
            cell: ({ row }) => (
                <TdUser
                    user={{
                        _id: row.original.createdBy._id,
                        fullName: row.original.createdBy.fullName,
                    }}
                />
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
            accessorKey: 'priority',
            header: 'Priority',
            cell: ({ row }) => (
                <span
                    className={`capitalize ${row.original.priority ? '' : 'text-gray-400'}`}
                >
                    {row.original.priority || 'Not Set'}
                </span>
            ),
            footer: (data) => data.column.id,
            id: 'priority',
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
                    title='My Documents'
                    subTitle='Resource Library: Access All Essential Documents'
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
                                value={[]}
                                columns={[]}
                                onChange={() => null}
                            />
                        </div>
                    }
                />
            </div>

            <div>
                {isGridView ? (
                    <div className='my-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'>
                        {myDocuments.map((doc) => (
                            <GlobalDocumentCard
                                key={doc._id}
                                {...doc}
                                onClick={() => handleDocumentClick(doc._id)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className=''>
                        <GlobalTable
                            isLoading={false}
                            limit={10}
                            data={myDocuments}
                            defaultColumns={defaultColumns}
                            tableName='my-documents-table'
                        />
                    </div>
                )}
            </div>

            <GlobalPagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                onLimitChange={(number) => {
                    router.push(`/my-documents?page=1&limit=${number}`);
                }}
                baseUrl='/my-documents'
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
