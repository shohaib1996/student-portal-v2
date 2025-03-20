import { useState } from 'react';

export const useFilter = (initialFilter = '') => {
    const [selectedFilter, setSelectedFilter] = useState<string>(initialFilter);

    const selectFilter = (filter: string) => {
        setSelectedFilter(filter); // Only one filter can be selected at a time
    };

    return { selectedFilter, selectFilter, setSelectedFilter };
};
