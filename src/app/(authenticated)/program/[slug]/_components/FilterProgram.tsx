'use client';

import { cn } from '@/lib/utils';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { SlidersHorizontal, X } from 'lucide-react';

interface FilterOption {
    id: string;
    label: string;
    checked: boolean;
    value: string;
}

const FilterProgram = ({
    setFilterOption,
    filterOption,
}: {
    setFilterOption: React.Dispatch<React.SetStateAction<{ filter: string }[]>>;
    filterOption: { filter: string }[];
}) => {
    const [isOpen, setIsOpen] = React.useState(false);

    const [filters, setFilters] = React.useState<FilterOption[]>([
        { id: 'all', label: 'All', value: '', checked: true },
        { id: 'focused', label: 'Focused', value: 'focused', checked: false },
        { id: 'pinned', label: 'Pinned', value: 'pinned', checked: false },
        {
            id: 'newContents',
            label: 'New Contents',
            value: 'newly updated',
            checked: false,
        },
        {
            id: 'completed',
            label: 'Completed',
            value: 'completed',
            checked: false,
        },
        {
            id: 'incomplete',
            label: 'Incomplete',
            value: 'incomplete',
            checked: false,
        },
        { id: 'summary', label: 'Summary', value: 'summary', checked: false },
        { id: 'share', label: 'Share', value: 'share', checked: false },
        {
            id: 'highPriority',
            label: 'High Priority',
            value: 'highPriority',
            checked: false,
        },
        {
            id: 'mediumPriority',
            label: 'Medium Priority',
            value: 'mediumPriority',
            checked: false,
        },
        {
            id: 'lowPriority',
            label: 'Low Priority',
            value: 'lowPriority',
            checked: false,
        },
    ]);

    const toggleFilter = (id: string) => {
        setFilters((prevFilters) => {
            return prevFilters.map((filter) => {
                if (id === 'all') {
                    return filter.id === 'all'
                        ? { ...filter, checked: true }
                        : { ...filter, checked: false };
                } else {
                    if (filter.id === id) {
                        return { ...filter, checked: !filter.checked };
                    }
                    if (filter.id === 'all') {
                        return { ...filter, checked: false };
                    }
                    return filter;
                }
            });
        });
    };

    const clearFilters = () => {
        setFilters((prevFilters) =>
            prevFilters.map((filter) =>
                filter.id === 'all'
                    ? { ...filter, checked: true }
                    : { ...filter, checked: false },
            ),
        );
    };

    const toggleDropdown = () => setIsOpen(!isOpen);

    const handleClickOutside = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            setIsOpen(false);
        }
    };

    React.useEffect(() => {
        const activeFilters = filters.filter(
            (f) => f.checked && f.id !== 'all',
        );
        if (activeFilters.length === 0) {
            setFilterOption([{ filter: '' }]);
        } else {
            setFilterOption(activeFilters.map((f) => ({ filter: f.value })));
        }
    }, [filters, setFilterOption]);

    return (
        <div className='relative'>
            <Button
                variant='primary_light'
                className='cursor-pointer'
                onClick={toggleDropdown}
            >
                <SlidersHorizontal
                    size={20}
                    className='text-primary-white font-bold'
                />
            </Button>

            {isOpen && (
                <>
                    <div
                        className='fixed inset-0 z-40'
                        onClick={handleClickOutside}
                    ></div>

                    <div className='absolute right-0 top-full mt-1 w-[240px] bg-foreground rounded-md shadow-md border border-border z-50'>
                        <div className='flex items-center justify-between p-3 border-b border-border'>
                            <button
                                onClick={clearFilters}
                                className='text-dark-gray text-sm font-medium hover:text-primary-white'
                            >
                                Clear filters
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className='text-gray hover:text-dark-gray'
                            >
                                <X className='h-4 w-4' />
                            </button>
                        </div>

                        <div className='p-2 max-h-[300px] overflow-y-auto'>
                            {filters.map((filter) => (
                                <div
                                    key={filter.id}
                                    className={cn(
                                        'flex items-center space-x-2 p-2 rounded-md',
                                        filter.checked
                                            ? 'bg-primary-light text-primary-white'
                                            : 'hover:bg-foreground',
                                    )}
                                    onClick={() => toggleFilter(filter.id)}
                                >
                                    <div
                                        className={cn(
                                            'h-4 w-4 rounded border flex items-center justify-center',
                                            filter.checked
                                                ? 'bg-primary border-border-primary-light'
                                                : 'border-border-primary-light bg-background',
                                        )}
                                    >
                                        {filter.checked && (
                                            <svg
                                                width='10'
                                                height='10'
                                                viewBox='0 0 10 10'
                                                fill='none'
                                                xmlns='http://www.w3.org/2000/svg'
                                            >
                                                <path
                                                    d='M8.33334 2.5L3.75001 7.08333L1.66667 5'
                                                    stroke='white'
                                                    strokeWidth='1.5'
                                                    strokeLinecap='round'
                                                    strokeLinejoin='round'
                                                />
                                            </svg>
                                        )}
                                    </div>
                                    <span
                                        className={cn(
                                            'text-sm cursor-pointer',
                                            filter.checked
                                                ? 'text-primary-white font-medium'
                                                : 'text-dark-gray',
                                        )}
                                    >
                                        {filter.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default FilterProgram;
