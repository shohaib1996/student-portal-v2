'use client';

import { useGetMySlidesQuery } from '@/redux/api/documents/documentsApi';
import { GlobalHeader } from '@/components/global/global-header';
import { GlobalPagination } from '@/components/global/global-pagination';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import PresentationCard from './presentation-card';
import Link from 'next/link';

const PresentationComponents = () => {
    const searchParams = useSearchParams();
    const currentPage = parseInt(searchParams.get('page') || '1', 10) || 1;
    const itemsPerPage = Number(searchParams.get('limit')) || 10;

    const router = useRouter();

    const { data, error, isLoading } = useGetMySlidesQuery({
        page: currentPage,
        limit: itemsPerPage,
    });

    const totalItems = data?.count || 0;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const handleLimitChange = (number: number) => {
        console.log(number);
        router.push(`/dashboard/presentation-slides?limit=${number}`);
    };

    if (isLoading) {
        return 'Please wait...';
    }

    if (error) {
        return 'Something went wrong';
    }

    return (
        <div>
            <GlobalHeader
                title='Presentations'
                subtitle='View and manage your presentations'
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
                {data?.slides.map((presentation, index) => (
                    <PresentationCard
                        key={presentation._id}
                        presentation={presentation}
                        onClick={() => {}}
                        index={index}
                    />
                ))}
            </div>

            <GlobalPagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                onLimitChange={handleLimitChange}
                baseUrl='/dashboard/presentation-slides'
            />
        </div>
    );
};

export default PresentationComponents;
