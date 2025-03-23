'use client';

import Link from 'next/link';
import { useGetMyDiagramQuery } from '@/redux/api/diagram/diagramApi';
import DiagramCard from './diagram-card';
import { GlobalPagination } from '@/components/global/global-pagination';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import GlobalHeader from '@/components/global/GlobalHeader';

const DiagramComponent = () => {
    const searchParams = useSearchParams();
    const router = useRouter();

    const currentPage = parseInt(searchParams.get('page') || '1', 10) || 1;
    const itemsPerPage = Number(searchParams.get('limit')) || 10;

    const { data, isLoading, error, isFetching } = useGetMyDiagramQuery({
        page: currentPage,
        limit: itemsPerPage,
    });

    const totalItems = data?.count || 10;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const myDiagrams = data?.diagrams || [];

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Something went wrong!</div>;
    }

    return (
        <div className=''>
            <GlobalHeader
                title='Architecture Diagrams'
                subTitle='Visualizing System Structure for Clear Understanding'
                buttons={
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
                }
            />

            <div className='my-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3'>
                {myDiagrams.map((diagram) => (
                    <DiagramCard key={diagram._id} diagram={diagram} />
                ))}
            </div>

            <GlobalPagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                onLimitChange={(number) => {
                    router.push(`/architecture-diagram?limit=${number}`);
                }}
                baseUrl='/architecture-diagram'
            />
        </div>
    );
};

export default DiagramComponent;
