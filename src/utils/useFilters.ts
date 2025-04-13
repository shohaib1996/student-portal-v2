import { useState } from 'react';

export const useFilter = (initialFilter = '') => {
    const [selectedFilter, setSelectedFilter] = useState<string>(initialFilter);

    const selectFilter = (
        filter: string,
        resetFunctions?: {
            setPage?: (value: number) => void;
            setPosts?: (value: any[]) => void;
            setHasMore?: (value: boolean) => void;
        },
    ) => {
        // If clicking the same filter, do nothing (or optionally clear it)
        // Alternatively, you could set it to '' to clear the filter when clicked again
        setSelectedFilter(filter);

        // If reset functions are provided, reset pagination and posts
        if (resetFunctions) {
            resetFunctions.setPage?.(1);
            resetFunctions.setPosts?.([]);
            resetFunctions.setHasMore?.(true);
        }
    };

    return { selectedFilter, selectFilter, setSelectedFilter };
};
