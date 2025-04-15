'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { ChevronRight, Eye, Grid, List, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import PresentationCard from './presentation-card';
import GlobalTable, {
    TCustomColumnDef,
} from '@/components/global/GlobalTable/GlobalTable';
import GlobalHeader from '@/components/global/GlobalHeader';
import GlobalPagination from '@/components/global/GlobalPagination';
import FilterModal from '@/components/global/FilterModal/FilterModal';
import TdDate from '@/components/global/TdDate';
import { TdUser } from '@/components/global/TdUser';

import { useGetMySlidesQuery } from '@/redux/api/documents/documentsApi';
import { useGetDocumentsAndLabsQuery } from '@/redux/api/slides/slideApi';

import { ISlideApiResponse, TSlide } from '@/types';

interface FilterValues {
    query?: string;
    creationDate?: string;
    updateDate?: string;
}

const PresentationComponents = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const slideId = searchParams.get('slide');

    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [filters, setFilters] = useState<FilterValues>({});

    // Fetch single slide if ID is provided
    const { data: singleSlide } = useGetDocumentsAndLabsQuery<{
        data: ISlideApiResponse;
    }>({ id: slideId as string }, { skip: !slideId });

    // Redirect to presentation view for single slide
    if (singleSlide?.content?.slide) {
        router.push(`/presentation-slides/${singleSlide.content.slide}`);
    }

    // Fetch all slides
    const { data, error, isLoading } = useGetMySlidesQuery(
        { page: currentPage, limit: itemsPerPage },
        {
            refetchOnMountOrArgChange: true,
            refetchOnReconnect: true,
        },
    );

    const slides = (data?.slides as TSlide[]) || [];
    const totalSlides = data?.count || 0;

    // Handle pagination changes
    const handlePageChange = (page: number, newLimit: number) => {
        setCurrentPage(page);
        setItemsPerPage(newLimit);
    };

    // Handle filter changes
    const handleFilter = (
        conditions: any[],
        queryObj: Record<string, string>,
    ) => {
        setFilters({
            query: queryObj.query,
            creationDate: queryObj.creationDate,
            updateDate: queryObj.updateDate,
        });
        setCurrentPage(1);
    };

    // Loading state
    if (isLoading) {
        return (
            <div className='flex h-screen items-center justify-center'>
                <Loader2 className='h-8 w-8 animate-spin text-primary' />
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className='flex h-screen items-center justify-center text-red-500'>
                Something went wrong!
            </div>
        );
    }

    // Table columns
    const tableColumns: TCustomColumnDef<TSlide>[] = [
        {
            accessorKey: 'index',
            header: '#',
            cell: ({ row }) => (
                <span>{String(row.index + 1).padStart(2, '0')}</span>
            ),
            id: 'index',
            visible: true,
            canHide: false,
        },
        {
            accessorKey: 'title',
            header: 'Title',
            cell: ({ row }) => (
                <div className='min-w-[220px] text-base font-medium text-black'>
                    {row.original.title || 'Untitled'}
                </div>
            ),
            id: 'title',
            visible: true,
            canHide: false,
        },
        {
            accessorKey: 'totalSlides',
            header: 'Total Slides',
            cell: ({ row }) => (
                <span className='text-sm font-medium text-black'>
                    {row.original.slides?.length || 0}
                </span>
            ),
            id: 'totalSlides',
            visible: true,
            canHide: false,
        },
        {
            accessorKey: 'uploadedBy',
            header: 'Uploaded By',
            cell: ({ row }) =>
                row.original.createdBy ? (
                    <TdUser user={row.original.createdBy} />
                ) : (
                    <span>Unknown</span>
                ),
            id: 'uploadedBy',
            visible: true,
            canHide: false,
        },
        {
            accessorKey: 'uploadedAt',
            header: 'Uploaded Date',
            cell: ({ row }) => <TdDate date={row.original.createdAt} />,
            id: 'uploadedAt',
            visible: true,
            canHide: false,
        },
        {
            accessorKey: 'updatedAt',
            header: 'Last Update',
            cell: ({ row }) => <TdDate date={row.original.updatedAt} />,
            id: 'updatedAt',
            visible: true,
            canHide: false,
        },
        {
            accessorKey: 'action',
            header: 'Action',
            cell: ({ row }) => (
                <Button
                    variant='default'
                    size='sm'
                    onClick={() => toast.info('New slide is coming soon!')}
                    className='flex items-center gap-1'
                >
                    <Eye size={18} />
                    View
                </Button>
            ),
            id: 'action',
            visible: true,
            canHide: false,
        },
    ];

    return (
        <div className='flex flex-col'>
            {/* Header Section */}
            <GlobalHeader
                title='Presentations & Slides'
                subTitle='Browse and manage your slide decks'
                buttons={
                    <div className='flex items-center gap-2'>
                        <Button
                            size='icon'
                            variant={
                                viewMode === 'grid' ? 'default' : 'outline'
                            }
                            onClick={() => setViewMode('grid')}
                            aria-label='Grid view'
                        >
                            <Grid size={18} />
                        </Button>
                        <Button
                            size='icon'
                            variant={
                                viewMode === 'list' ? 'default' : 'outline'
                            }
                            onClick={() => setViewMode('list')}
                            aria-label='List view'
                        >
                            <List size={18} />
                        </Button>
                        <FilterModal
                            value={Object.entries(filters)
                                .filter(([_, value]) => value)
                                .map(([column, value]) => ({
                                    field: column,
                                    operator: 'eq',
                                    value,
                                }))}
                            onChange={handleFilter}
                            columns={[
                                { label: 'Search (Title)', value: 'query' },
                                {
                                    label: 'Creation Date',
                                    value: 'creationDate',
                                },
                                { label: 'Update Date', value: 'updateDate' },
                            ]}
                        />
                        <Link href='/dashboard'>
                            <Button
                                size='sm'
                                className='flex items-center gap-1'
                            >
                                Go to Dashboard
                                <ChevronRight size={16} />
                            </Button>
                        </Link>
                    </div>
                }
            />

            {/* Content Section */}
            <div className='mt-4 flex flex-1 flex-col justify-between'>
                {viewMode === 'grid' ? (
                    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'>
                        {slides.map((slide, index) => (
                            <PresentationCard
                                key={slide._id}
                                presentation={slide}
                                index={index}
                            />
                        ))}
                    </div>
                ) : (
                    <div className='overflow-x-auto'>
                        <GlobalTable
                            isLoading={isLoading}
                            tableName='slides-table'
                            defaultColumns={tableColumns}
                            limit={itemsPerPage}
                            data={slides}
                        />
                    </div>
                )}

                {/* Pagination */}
                <GlobalPagination
                    currentPage={currentPage}
                    totalItems={totalSlides}
                    itemsPerPage={itemsPerPage}
                    onPageChange={handlePageChange}
                />
            </div>
        </div>
    );
};

export default PresentationComponents;
