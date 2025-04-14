'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { ChevronRight, Eye, Grid, List } from 'lucide-react';

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
    status?: string;
    date?: string;
    creationDate?: string;
    updateDate?: string;
}

const PresentationComponents = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const slideId = searchParams.get('slide');

    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [limit, setLimit] = useState<number>(10);
    const [filters, setFilters] = useState<FilterValues>({
        query: '',
        creationDate: '',
        updateDate: '',
    });

    // Fetch a single slide if ID is present
    const { data: singleSlide } = useGetDocumentsAndLabsQuery<{
        data: ISlideApiResponse;
    }>({ id: slideId as string }, { skip: !slideId });

    // Redirect to presentation view if a single slide is found
    if (singleSlide) {
        router.push(`/presentation-slides/${singleSlide.content.slide}`);
    }

    // Fetch all slides
    const { data, error, isLoading } = useGetMySlidesQuery(
        { page: currentPage, limit },
        {
            refetchOnMountOrArgChange: true,
            refetchOnReconnect: true,
        },
    );

    const allSlides = (data?.slides as TSlide[]) || [];
    const totalItems = data?.count || 0;
    const handlePageChange = (page: number, newLimit: number) => {
        setCurrentPage(page);
        setLimit(newLimit);
    };

    const handleFilter = (
        conditions: any[],
        queryObj: Record<string, string>,
    ) => {
        setFilters({
            query: queryObj.query,
            creationDate: queryObj.creationDate,
            updateDate: queryObj.updateDate,
        });
        setCurrentPage(1); // Reset pagination on filter
    };

    if (isLoading) {
        return 'Please wait...';
    }
    if (error) {
        return 'Something went wrong';
    }

    // Table column definitions
    const columns: TCustomColumnDef<TSlide>[] = [
        {
            accessorKey: 'index',
            header: '#',
            cell: ({ row }) => (
                <span>
                    {row.index < 9 && 0}
                    {row.index + 1}
                </span>
            ),
            footer: (data) => data.column.id,
            id: 'index',
            visible: true,
            canHide: false,
        },
        {
            accessorKey: 'title',
            header: 'Title',
            cell: ({ row }) => (
                <div
                    className='text-black text-base font-medium'
                    style={{ minWidth: 220 }}
                >
                    {row.original.title || 'Untitled'}
                </div>
            ),
            footer: (data) => data.column.id,
            id: 'title',
            visible: true,
            canHide: false,
        },
        {
            accessorKey: 'totalSlides',
            header: 'Total Slides',
            cell: ({ row }) => (
                <span className='text-black text-sm font-medium'>
                    {row.original.slides?.length || 0}
                </span>
            ),
            footer: (data) => data.column.id,
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
            footer: (data) => data.column.id,
            id: 'uploadedBy',
            visible: true,
            canHide: false,
        },
        {
            accessorKey: 'uploadedAt',
            header: 'Uploaded Date',
            cell: ({ row }) => <TdDate date={row.original.createdAt} />,
            footer: (data) => data.column.id,
            id: 'uploadedAt',
            visible: true,
            canHide: false,
        },
        {
            accessorKey: 'updateAt',
            header: 'Last Update',
            cell: ({ row }) => <TdDate date={row.original.updatedAt} />,
            footer: (data) => data.column.id,
            id: 'updateAt',
            visible: true,
            canHide: false,
        },
        {
            accessorKey: 'action',
            header: 'Action',
            cell: ({ row }) => (
                <div className='flex gap-2 items-center'>
                    <Button
                        variant='default'
                        tooltip='View'
                        onClick={() => toast.info('New slide is coming soon!')}
                        icon={<Eye size={18} />}
                    >
                        View
                    </Button>
                </div>
            ),
            footer: (data) => data.column.id,
            id: 'action',
            visible: true,
            canHide: false,
        },
    ];

    return (
        <div>
            {/* Header */}
            <div className='mb-3 mt-2'>
                <GlobalHeader
                    title='Presentations/Slides'
                    subTitle='View and manage your presentations'
                    buttons={
                        <div className='flex items-center gap-2'>
                            <Button
                                size='icon'
                                onClick={() => setViewMode('grid')}
                                variant={
                                    viewMode === 'grid'
                                        ? 'default'
                                        : 'primary_light'
                                }
                                icon={<Grid size={18} />}
                            />
                            <Button
                                size='icon'
                                onClick={() => setViewMode('list')}
                                variant={
                                    viewMode === 'list'
                                        ? 'default'
                                        : 'primary_light'
                                }
                                icon={<List size={18} />}
                            />
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
                                    { label: 'Update Date', value: 'date' },
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
            </div>

            {/* Slides Display */}
            <div className='h-[calc(100vh-120px)] flex flex-col justify-between'>
                {viewMode === 'grid' ? (
                    <div className='my-2 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'>
                        {allSlides.map((presentation, index) => (
                            <PresentationCard
                                key={presentation._id}
                                presentation={presentation}
                                index={index}
                            />
                        ))}
                    </div>
                ) : (
                    <GlobalTable
                        isLoading={isLoading}
                        tableName='slides-table'
                        defaultColumns={columns}
                        limit={limit}
                        data={allSlides}
                    />
                )}

                {/* Pagination */}
                <GlobalPagination
                    currentPage={currentPage}
                    totalItems={totalItems}
                    itemsPerPage={limit}
                    onPageChange={handlePageChange}
                />
            </div>
        </div>
    );
};

export default PresentationComponents;
