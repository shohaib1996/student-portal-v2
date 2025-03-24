'use client';
import { cn } from '@/lib/utils';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SlidersHorizontal, X } from 'lucide-react';

interface FilterOption {
    id: string;
    label: string;
    checked: boolean;
    value: string;
}

const FilterProgram = ({
    option,
    searchInput,
    setParentId,
}: {
    option: {
        isLoading: boolean;
        isError: boolean;
        courseProgramsLoading: boolean;

        setFilterOption: React.Dispatch<
            React.SetStateAction<{
                filter: string;
                query: string;
            }>
        >;
    };
    searchInput: string;
    setParentId: React.Dispatch<React.SetStateAction<string | null>>;
}) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const { setFilterOption } = option;

    const [selectedFilter, setSelectedFilter] = React.useState<string>('all');
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
        setFilters(
            filters.map((filter) =>
                filter.id === id
                    ? { ...filter, checked: !filter.checked }
                    : filter,
            ),
        );
    };

    const clearFilters = () => {
        setFilters(filters.map((filter) => ({ ...filter, checked: false })));
    };

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
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
            </DropdownMenuTrigger>
            {isOpen && (
                <DropdownMenuContent
                    className='min-w-[200px] rounded-lg border bg-background text-gray shadow-lg'
                    align='end'
                >
                    <DropdownMenuLabel className='border-b'>
                        <div className='flex items-center justify-between'>
                            <button
                                onClick={clearFilters}
                                className='text-dark-gray text-sm font-medium'
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
                    </DropdownMenuLabel>

                    <DropdownMenuRadioGroup
                        defaultValue={filters[0].value}
                        value={selectedFilter}
                        onValueChange={(value) => {
                            setSelectedFilter(value);
                            const selectedOption = filters.find(
                                (filter) => filter.id === value,
                            );

                            if (selectedOption) {
                                setFilterOption((prev) => ({
                                    filter: selectedOption.value /* selectedOption.value */,
                                    query: searchInput,
                                    pId: null,
                                }));
                                setParentId(null);
                            }
                        }}
                    >
                        {filters.map((filter) => (
                            <div
                                key={filter.id}
                                className={cn(
                                    'flex items-center space-x-2 p-2 rounded-md',
                                    filter.checked
                                        ? 'bg-primary-light'
                                        : 'hover:bg-foreground',
                                )}
                                onClick={() => toggleFilter(filter.id)}
                            >
                                <div
                                    className={cn(
                                        'h-4 w-4 rounded border flex items-center justify-center',
                                        filter.checked
                                            ? 'bg-primary border-border-primary-light'
                                            : 'border-border bg-background',
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
                                            ? 'text-primary-white font-medium text-sm'
                                            : 'text-dark-gray',
                                    )}
                                >
                                    {filter.label}
                                </span>
                            </div>
                        ))}
                    </DropdownMenuRadioGroup>
                </DropdownMenuContent>
            )}
        </DropdownMenu>
    );
};

export default FilterProgram;
