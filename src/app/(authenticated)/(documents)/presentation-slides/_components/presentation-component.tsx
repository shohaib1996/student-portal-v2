// 'use client';

// import { useGetMySlidesQuery } from '@/redux/api/documents/documentsApi';
// import { GlobalHeader } from '@/components/global/global-header';
// import { GlobalPagination } from '@/components/global/global-pagination';
// import { Button } from '@/components/ui/button';
// import { ChevronRight, Eye, Grid3X3, Sheet } from 'lucide-react';
// import { usePathname, useRouter, useSearchParams } from 'next/navigation';
// import PresentationCard from './presentation-card';
// import Link from 'next/link';
// import { useState } from 'react';
// import GlobalTable, {
//     TCustomColumnDef,
// } from '@/components/global/GlobalTable/GlobalTable';
// import { TSlide } from '@/types';
// import TdDate from '@/components/global/TdDate';
// import { TdUser } from '@/components/global/TdUser';

// const PresentationComponents = () => {
//     const searchParams = useSearchParams();
//     const currentPage = parseInt(searchParams.get('page') || '1', 10) || 1;
//     const itemsPerPage = Number(searchParams.get('limit')) || 10;
//     const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

//     const router = useRouter();
//     const pathName = usePathname();

//     const { data, error, isLoading } = useGetMySlidesQuery({
//         page: currentPage,
//         limit: itemsPerPage,
//     });

//     const totalItems = data?.count || 0;
//     const totalPages = Math.ceil(totalItems / itemsPerPage);

//     const handleLimitChange = (number: number) => {
//         console.log(number);
//         router.push(`/dashboard/presentation-slides?limit=${number}`);
//     };

//     if (isLoading) {
//         return 'Please wait...';
//     }

//     if (error) {
//         return 'Something went wrong';
//     }
//     const slides = (data?.slides as TSlide[]) || [];

//     const columns: TCustomColumnDef<TSlide>[] = [
//         {
//             accessorKey: 'index',
//             header: '#',
//             cell: ({ row }) => (
//                 <span>
//                     {row.index < 9 && 0}
//                     {row.index + 1}
//                 </span>
//             ),
//             footer: (data) => data.column.id,
//             id: 'index',
//             visible: true,
//             canHide: false,
//         },
//         {
//             accessorKey: 'title',
//             header: 'Title',
//             cell: ({ row }) => (
//                 <div
//                     className='text-black text-base font-medium'
//                     style={{ minWidth: 220 }}
//                 >
//                     {row.original.title}
//                 </div>
//             ),
//             footer: (data) => data.column.id,
//             id: 'title',
//             visible: true,
//             canHide: false,
//         },
//         {
//             accessorKey: 'status',
//             header: 'Status',
//             cell: ({ row }) => (
//                 <span
//                     className='text-primary-white text-xs font-medium p-1 bg-primary-light bg-opacity-10 rounded-full py-1 px-2'
//                     style={{ minWidth: 220 }}
//                 >
//                     Status
//                 </span>
//             ),
//             footer: (data) => data.column.id,
//             id: 'status',
//             visible: true,
//             canHide: false,
//         },
//         {
//             accessorKey: 'totalSlides',
//             header: 'Total Slides',
//             cell: ({ row }) => (
//                 <span
//                     className='text-black text-sm font-medium'
//                     style={{ minWidth: 220 }}
//                 >
//                     {row.original.slides.length}
//                 </span>
//             ),
//             footer: (data) => data.column.id,
//             id: 'totalSlides',
//             visible: true,
//             canHide: false,
//         },
//         {
//             accessorKey: 'uploadedBy',
//             header: 'Uploaded By',
//             cell: ({ row }) => {
//                 const createdBy = row.original.createdBy;
//                 return <TdUser user={createdBy} />;
//             },
//             footer: (data) => data.column.id,
//             id: 'uploadedBy',
//             visible: true,
//         },
//         {
//             accessorKey: 'uploadedAt',
//             header: 'Uploaded Date',
//             cell: ({ row }) => <TdDate date={row.original.createdAt} />,
//             footer: (data) => data.column.id,
//             id: 'uploadedAt',
//             visible: true,
//         },
//         {
//             accessorKey: 'updateAt',
//             header: 'Last Update',
//             cell: ({ row }) => <TdDate date={row.original.updatedAt} />,
//             footer: (data) => data.column.id,
//             id: 'updateAt',
//             visible: true,
//         },

//         {
//             accessorKey: 'action',
//             header: 'Action',
//             cell: ({ row }) => (
//                 <div className='flex gap-2 items-center'>
//                     <Button
//                         variant='default'
//                         tooltip='View'
//                         onClick={() =>
//                             router.push(
//                                 `${pathName}/subslide?id=${row.original._id}`,
//                             )
//                         }
//                         icon={<Eye size={18} />}
//                     >
//                         View
//                     </Button>
//                 </div>
//             ),
//             footer: (data) => data.column.id,
//             id: 'action',
//             visible: true,
//         },
//     ];

//     return (
//         <div>
//             <GlobalHeader
//                 title='Presentations'
//                 subtitle='View and manage your presentations'
//             >
//                 <div className='flex items-center gap-2'>
//                     <Button
//                         size={'icon'}
//                         onClick={() => setViewMode('grid')}
//                         variant={
//                             viewMode === 'grid' ? 'default' : 'primary_light'
//                         }
//                         icon={<Grid3X3 size={18} />}
//                     />
//                     <Button
//                         size={'icon'}
//                         onClick={() => setViewMode('list')}
//                         variant={
//                             viewMode === 'list' ? 'default' : 'primary_light'
//                         }
//                         icon={<Sheet size={18} />}
//                     />
//                     <Button variant='outline' size='sm'>
//                         Filters
//                     </Button>
//                     <Link href='/dashboard'>
//                         <Button size='sm' asChild>
//                             Go to Dashboard
//                             <ChevronRight className='h-4 w-4' />
//                         </Button>
//                     </Link>
//                 </div>
//             </GlobalHeader>

//             {viewMode === 'grid' && (
//                 <div className='my-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'>
//                     {data?.slides.map((presentation, index) => (
//                         <PresentationCard
//                             key={presentation._id}
//                             presentation={presentation}
//                             onClick={() => {}}
//                             index={index}
//                         />
//                     ))}
//                 </div>
//             )}
//             {viewMode === 'list' && (
//                 <GlobalTable
//                     isLoading={isLoading}
//                     tableName='slides-table'
//                     defaultColumns={columns}
//                     limit={itemsPerPage}
//                     data={slides}
//                 />
//             )}

//             <GlobalPagination
//                 currentPage={currentPage}
//                 totalPages={totalPages}
//                 totalItems={totalItems}
//                 itemsPerPage={itemsPerPage}
//                 onLimitChange={handleLimitChange}
//                 baseUrl='/dashboard/presentation-slides'
//             />
//         </div>
//     );
// };

// export default PresentationComponents;
'use client';

import { useGetMySlidesQuery } from '@/redux/api/documents/documentsApi';
import { Button } from '@/components/ui/button';
import { ChevronRight, Eye, Grid3X3, Sheet } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import PresentationCard from './presentation-card';
import Link from 'next/link';
import { useState } from 'react';
import GlobalTable, {
    TCustomColumnDef,
} from '@/components/global/GlobalTable/GlobalTable';
import { TSlide } from '@/types';
import TdDate from '@/components/global/TdDate';
import { TdUser } from '@/components/global/TdUser';
import GlobalHeader from '@/components/global/GlobalHeader';
import GlobalPagination from '@/components/global/GlobalPagination';

const PresentationComponents = () => {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [limit, setLimit] = useState<number>(10);

    const router = useRouter();
    const pathName = usePathname();

    const { data, error, isLoading } = useGetMySlidesQuery({
        page: currentPage,
        limit: limit,
    });

    const totalItems = data?.count || 0;
    const totalPages = Math.ceil(totalItems / limit);
    const slides = (data?.slides as TSlide[]) || [];

    if (isLoading) {
        return 'Please wait...';
    }

    if (error) {
        return 'Something went wrong';
    }

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
                    {row.original.title}
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
                <span
                    className='text-primary-white text-xs font-medium p-1 bg-primary-light bg-opacity-10 rounded-full py-1 px-2'
                    style={{ minWidth: 220 }}
                >
                    Status
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
                <span
                    className='text-black text-sm font-medium'
                    style={{ minWidth: 220 }}
                >
                    {row.original.slides.length}
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
            accessorKey: 'updateAt',
            header: 'Last Update',
            cell: ({ row }) => <TdDate date={row.original.updatedAt} />,
            footer: (data) => data.column.id,
            id: 'updateAt',
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
        },
    ];

    return (
        <div>
            <GlobalHeader
                title='Presentations'
                subTitle='View and manage your presentations' // Fixed prop name from 'subtitle' to 'subTitle'
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
                            icon={<Grid3X3 size={18} />}
                        />
                        <Button
                            size={'icon'}
                            onClick={() => setViewMode('list')}
                            variant={
                                viewMode === 'list'
                                    ? 'default'
                                    : 'primary_light'
                            }
                            icon={<Sheet size={18} />}
                        />
                        <Button variant='outline' size='sm'>
                            Filters
                        </Button>
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
                {viewMode === 'grid' && (
                    <div className='my-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'>
                        {slides.map((presentation, index) => (
                            <PresentationCard
                                key={presentation._id}
                                presentation={presentation}
                                onClick={() => {}}
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
                        data={slides}
                    />
                )}

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
