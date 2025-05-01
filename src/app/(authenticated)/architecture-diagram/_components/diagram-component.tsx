'use client';

import Link from 'next/link';
import { useGetMyDiagramQuery } from '@/redux/api/diagram/diagramApi';
import DiagramCard from './diagram-card';
import { Button } from '@/components/ui/button';
import { ChevronRight, Eye, Grid3X3, Sheet } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import GlobalHeader from '@/components/global/GlobalHeader';
import { useState } from 'react';
import GlobalTable, {
    TCustomColumnDef,
} from '@/components/global/GlobalTable/GlobalTable';
import TdDate from '@/components/global/TdDate';
import { DiagramType } from '@/types/diagram';
import { TConditions } from '@/components/global/FilterModal/QueryBuilder';
import FilterModal from '@/components/global/FilterModal/FilterModal';
import GlobalPagination from '@/components/global/GlobalPagination';
import { TdUser } from '@/components/global/TdUser';
export interface CreatedBy {
    profilePicture: string;
    lastName: string;
    _id: string;
    email: string;
    firstName: string;
    fullName: string;
}

const DiagramComponent = () => {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
    const searchParams = useSearchParams();
    const router = useRouter();

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = Number(searchParams.get('limit')) || 10;
    const [limit, setLimit] = useState<number>(10);
    const [filterData, setFilterData] = useState<TConditions[]>([]);
    const [query, setQuery] = useState('');
    const [date, setDate] = useState('');

    const { data, isLoading, error, isFetching } = useGetMyDiagramQuery({
        page: currentPage,
        limit: limit,
        query,
        createdAt: date,
    });

    const totalItems = data?.count || 10;
    const myDiagrams = data?.diagrams || [];

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Something went wrong!</div>;
    }

    const defaultColumns: TCustomColumnDef<DiagramType & { serial: number }>[] =
        [
            {
                accessorKey: 'serial',
                header: 'Serial No',
                cell: ({ row }) => <span>{row.original.serial}</span>,
                footer: (data) => data.column.id,
                id: 'index',
                visible: true,
                canHide: false,
            },
            {
                accessorKey: 'title',
                header: 'Title',
                cell: ({ row }) => <p>{row.original.title}</p>,
                visible: true,
                id: 'title',
                footer: (data) => data.column.id,
                canHide: false,
            },
            {
                accessorKey: 'isActive',
                header: 'Status',
                cell: ({ row }) => {
                    const isActive = row.original.isActive;
                    return (
                        <div className='flex items-center gap-1'>
                            {isActive ? (
                                <span className='text-primary-white text-xs font-medium p-1 bg-primary-light bg-opacity-10 rounded-full py-1 px-2'>
                                    Active
                                </span>
                            ) : (
                                <span className='text-red-500 text-xs font-medium p-1 bg-primary-light bg-opacity-10 rounded-full py-1 px-2'>
                                    Inactive
                                </span>
                            )}
                        </div>
                    );
                },
                visible: true,
                id: 'isActive',
                footer: (data) => data.column.id,
            },
            {
                accessorKey: 'uploadedBy',
                header: 'Uploaded By',
                cell: ({ row }) => {
                    const createdBy = row.original.createdBy;
                    return <TdUser user={createdBy} />;
                },
                footer: (data) => data.column.id,
                id: 'uploadedBy',
                visible: true,
            },
            {
                accessorKey: 'uploadedAt',
                header: 'Uploaded Date',
                cell: ({ row }) => <TdDate date={row.original.createdAt} />,
                footer: (data) => data.column.id,
                id: 'uploadedAt',
                visible: true,
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
                                    `/architecture-diagram/preview/${row.original._id}`,
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
            },
        ];

    const handleFilter = (
        conditions: TConditions[],
        queryObj: Record<string, string>,
    ) => {
        setFilterData(conditions);
        setQuery(queryObj['query'] || '');
        setDate(queryObj['date'] || '');
    };

    const handlePageChange = (page: number, newLimit: number) => {
        setCurrentPage(page);
        setLimit(newLimit);
    };

    return (
        <div className='pt-2'>
            <GlobalHeader
                title='Architecture Diagrams'
                subTitle='Visualizing System Structure for Clear Understanding'
                buttons={
                    <div className='flex items-center gap-2'>
                        <Button
                            size={'icon'}
                            tooltip='Grid view'
                            onClick={() => setViewMode('grid')}
                            variant={
                                viewMode === 'grid'
                                    ? 'default'
                                    : 'primary_light'
                            }
                            icon={<Grid3X3 size={18} />}
                        />
                        <Button
                            tooltip='List view'
                            size={'icon'}
                            onClick={() => setViewMode('list')}
                            variant={
                                viewMode === 'list'
                                    ? 'default'
                                    : 'primary_light'
                            }
                            icon={<Sheet size={18} />}
                        />
                        <FilterModal
                            value={filterData}
                            onChange={handleFilter}
                            columns={[
                                {
                                    label: 'Search (Name/Uploaded By)',
                                    value: 'query',
                                },
                                {
                                    label: 'Upload Date',
                                    value: 'date',
                                },
                            ]}
                        />
                    </div>
                }
            />

            {viewMode === 'grid' && (
                <div className='my-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3'>
                    {myDiagrams.map((diagram: DiagramType) => (
                        <DiagramCard key={diagram._id} diagram={diagram} />
                    ))}
                </div>
            )}

            {viewMode === 'list' && (
                <GlobalTable
                    limit={itemsPerPage}
                    isLoading={isLoading || isFetching}
                    tableName='diagrams-table'
                    defaultColumns={defaultColumns}
                    data={myDiagrams?.map((item: any, i: number) => ({
                        ...item,
                        serial: i + 1 + (currentPage - 1) * limit,
                    }))}
                />
            )}

            <GlobalPagination
                currentPage={currentPage}
                totalItems={totalItems || 0}
                itemsPerPage={limit}
                onPageChange={handlePageChange}
            />
        </div>
    );
};

export default DiagramComponent;
