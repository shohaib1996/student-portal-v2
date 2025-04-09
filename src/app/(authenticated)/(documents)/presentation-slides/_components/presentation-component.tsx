'use client';

import { useGetMySlidesQuery } from '@/redux/api/documents/documentsApi';
import { Button } from '@/components/ui/button';
import { ChevronRight, Eye, Grid, List } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import PresentationCard from './presentation-card';
import Link from 'next/link';
import { useState, useMemo } from 'react';
import GlobalTable, {
    TCustomColumnDef,
} from '@/components/global/GlobalTable/GlobalTable';
import { TSlide } from '@/types';
import TdDate from '@/components/global/TdDate';
import { TdUser } from '@/components/global/TdUser';
import GlobalHeader from '@/components/global/GlobalHeader';
import GlobalPagination from '@/components/global/GlobalPagination';
import FilterModal from '@/components/global/FilterModal/FilterModal';

interface FilterValues {
    query?: string;
    status?: string;
    date?: string;
}

const PresentationComponents = () => {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [limit, setLimit] = useState<number>(10);
    const [filters, setFilters] = useState<FilterValues>({});

    const router = useRouter();
    const pathName = usePathname();

    const { data, error, isLoading } = useGetMySlidesQuery({
        page: currentPage,
        limit: limit,
    });

    const allSlides = (data?.slides as TSlide[]) || [];
    // const totalItems = data?.count || 0;

    // Filter slides based on filter values
    const filteredSlides = useMemo(() => {
        return allSlides.filter((slide) => {
            const matchesQuery = filters.query
                ? slide.title
                      ?.toLowerCase()
                      .includes(filters.query.toLowerCase())
                : true;

            const matchesStatus = filters.status ? false : true;

            const matchesDate = filters.date
                ? new Date(slide.createdAt).toDateString() ===
                  new Date(filters.date).toDateString()
                : true;

            return matchesQuery && matchesStatus && matchesDate;
        });
    }, [allSlides, filters]);

    const paginatedSlides = useMemo(() => {
        const startIndex = (currentPage - 1) * limit;
        const endIndex = startIndex + limit;
        return filteredSlides.slice(startIndex, endIndex);
    }, [filteredSlides, currentPage, limit]);

    const totalPages = Math.ceil(filteredSlides.length / limit);

    if (isLoading) {
        return 'Please wait...';
    }

    if (error) {
        return 'Something went wrong';
    }

    const handleFilter = (
        conditions: any[],
        queryObj: Record<string, string>,
    ) => {
        setFilters({
            query: queryObj.query,
            status: queryObj.status,
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
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => (
                <span className='text-primary-white text-xs font-medium p-1 bg-primary-light bg-opacity-10 rounded-full py-1 px-2'>
                    {'N/A'}
                </span>
            ),
            footer: (data) => data.column.id,
            id: 'status',
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
            cell: ({ row }) => {
                const createdBy = row.original.createdBy;
                return createdBy ? (
                    <TdUser user={createdBy} />
                ) : (
                    <span>Unknown</span>
                );
            },
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
                        onClick={() =>
                            router.push(
                                `${pathName}/subslide?id=${row.original._id}`,
                            )
                        }
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
            <div className='mb-3'>
                <GlobalHeader
                    title='Presentations/Slides'
                    subTitle='View and manage your presentations'
                    buttons={
                        <div className='flex items-center gap-2'>
                            <Button
                                size={'icon'}
                                onClick={() => setViewMode('grid')}
                                variant={
                                    viewMode === 'grid'
                                        ? 'default'
                                        : 'primary_light'
                                }
                                icon={<Grid size={18} />}
                            />
                            <Button
                                size={'icon'}
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
                                    {
                                        label: 'Search (Title)',
                                        value: 'query',
                                    },
                                    {
                                        label: 'Status',
                                        value: 'status',
                                    },
                                    {
                                        label: 'Uploaded Date',
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
            </div>

            <div className='h-[calc(100vh-120px)] flex flex-col justify-between'>
                {viewMode === 'grid' && (
                    <div className='my-2 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'>
                        {paginatedSlides.map((presentation, index) => (
                            <PresentationCard
                                key={presentation._id}
                                presentation={presentation}
                                onClick={() =>
                                    router.push(
                                        `${pathName}/subslide?id=${presentation._id}`,
                                    )
                                }
                                index={index}
                            />
                        ))}
                    </div>
                )}
                {viewMode === 'list' && (
                    <GlobalTable
                        isLoading={isLoading}
                        tableName='slides-table'
                        defaultColumns={columns}
                        limit={limit}
                        data={paginatedSlides}
                    />
                )}

                <GlobalPagination
                    currentPage={currentPage}
                    totalItems={filteredSlides.length}
                    itemsPerPage={limit}
                    onPageChange={handlePageChange}
                />
            </div>
        </div>
    );
};

export default PresentationComponents;
