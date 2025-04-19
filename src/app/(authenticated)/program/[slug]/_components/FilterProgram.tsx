import React, { useCallback, useMemo } from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { SlidersHorizontal } from 'lucide-react';

/**
 * FilterProgram Component - Provides filter options for program content
 * Optimized with React.memo and useCallback for better performance
 */
const FilterProgram = ({
    option,
    searchInput,
    setFilterOption,
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
    setFilterOption: React.Dispatch<
        React.SetStateAction<{
            filter: string;
            query: string;
        }>
    >;
}) => {
    // Use memoized state to avoid re-renders
    const [position, setPosition] = React.useState('');

    // Memoize filter options to prevent re-creation on render
    const filterOptions = useMemo(
        () => [
            { value: 'name', label: 'Sort by Name' },
            { value: 'date', label: 'Sort by Date' },
            { value: 'duration', label: 'Sort by Duration' },
            { value: 'priority', label: 'Sort by Priority' },
        ],
        [],
    );

    // Handle filter selection with optimized callback
    const handleFilterChange = useCallback(
        (value: string) => {
            setPosition(value);
            setFilterOption((prev) => ({
                ...prev,
                filter: value,
            }));
        },
        [setFilterOption],
    );

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant='outline'
                    size='icon'
                    className='border-border rounded-md bg-background'
                >
                    <SlidersHorizontal className='h-5 w-5 text-gray' />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className='w-56'>
                <DropdownMenuRadioGroup
                    value={position}
                    onValueChange={handleFilterChange}
                >
                    {filterOptions.map((option) => (
                        <DropdownMenuRadioItem
                            key={option.value}
                            value={option.value}
                        >
                            {option.label}
                        </DropdownMenuRadioItem>
                    ))}
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

// Use React.memo to prevent unnecessary re-renders
export default React.memo(FilterProgram);
