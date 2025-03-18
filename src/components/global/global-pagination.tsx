import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface GlobalPaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    baseUrl?: string;
    onLimitChange: (page: number) => void;
}

export function GlobalPagination({
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    baseUrl = '',
    onLimitChange,
}: GlobalPaginationProps) {
    const showingStart = Math.min(
        (currentPage - 1) * itemsPerPage + 1,
        totalItems,
    );
    const showingEnd = Math.min(currentPage * itemsPerPage, totalItems);

    const getPageUrl = (page: number) => `${baseUrl}?page=${page}`;

    const renderPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;

        // Always show first page
        pages.push(
            <Button
                key={1}
                variant={currentPage === 1 ? 'default' : 'outline'}
                size='icon'
                className='h-8 w-8'
                asChild
            >
                <Link href={getPageUrl(1)}>1</Link>
            </Button>,
        );

        const startPage = Math.max(
            2,
            currentPage - Math.floor(maxVisiblePages / 2),
        );
        const endPage = Math.min(
            totalPages - 1,
            startPage + maxVisiblePages - 3,
        );

        if (startPage > 2) {
            pages.push(
                <span key='start-ellipsis' className='px-2'>
                    ...
                </span>,
            );
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <Button
                    key={i}
                    variant={currentPage === i ? 'default' : 'outline'}
                    size='icon'
                    className='h-8 w-8'
                    asChild
                >
                    <Link href={getPageUrl(i)}>{i}</Link>
                </Button>,
            );
        }

        if (endPage < totalPages - 1) {
            pages.push(
                <span key='end-ellipsis' className='px-2'>
                    ...
                </span>,
            );
        }

        // Always show last page if there's more than one page
        if (totalPages > 1) {
            pages.push(
                <Button
                    key={totalPages}
                    variant={currentPage === totalPages ? 'default' : 'outline'}
                    size='icon'
                    className='h-8 w-8'
                    asChild
                >
                    <Link href={getPageUrl(totalPages)}>{totalPages}</Link>
                </Button>,
            );
        }

        return pages;
    };

    return (
        <div className='flex items-center justify-between border-t border-border pt-4'>
            <div className='text-sm text-muted-foreground'>
                Showing {showingStart} to {showingEnd} of {totalItems} entries
            </div>
            <div className='flex items-center gap-1'>
                <Button
                    variant='outline'
                    size='icon'
                    className='h-8 w-8'
                    disabled={currentPage === 1}
                    asChild={currentPage !== 1}
                >
                    {currentPage === 1 ? (
                        <ChevronLeft className='h-4 w-4' />
                    ) : (
                        <Link href={getPageUrl(currentPage - 1)}>
                            <ChevronLeft className='h-4 w-4' />
                        </Link>
                    )}
                </Button>
                {renderPageNumbers()}
                <Button
                    variant='outline'
                    size='icon'
                    className='h-8 w-8'
                    disabled={currentPage === totalPages}
                    asChild={currentPage !== totalPages}
                >
                    {currentPage === totalPages ? (
                        <ChevronRight className='h-4 w-4' />
                    ) : (
                        <Link href={getPageUrl(currentPage + 1)}>
                            <ChevronRight className='h-4 w-4' />
                        </Link>
                    )}
                </Button>
            </div>
            <div className='text-sm text-muted-foreground'>
                {totalItems} / Page{' '}
                <select
                    className='rounded border border-input bg-background px-1'
                    defaultValue={itemsPerPage}
                    onChange={(e) => onLimitChange(Number(e.target.value))}
                >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                </select>
            </div>
        </div>
    );
}
