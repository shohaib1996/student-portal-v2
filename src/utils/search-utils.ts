// /utils/search-utils.ts
import Fuse, { IFuseOptions } from 'fuse.js';
import { searchContentTree } from '@/utils/tree-utils';
import { TContent, ChapterData } from '@/types';

/**
 * Creates a Fuse.js instance for searching through content data
 * @param {TContent[] | ChapterData[]} data - The content data to search through
 * @returns {Fuse<TContent | ChapterData> | null} - A configured Fuse.js instance or null
 */
export const createContentSearchEngine = (
    data: TContent[] | ChapterData[] | null | undefined,
) => {
    if (!data || data.length === 0) {
        return null;
    }

    // Configure Fuse options for optimal content searching
    const options: IFuseOptions<TContent | ChapterData> = {
        keys: [
            // Chapter data
            { name: 'chapter.name', weight: 1.5 }, // Higher weight for chapter names

            // Lesson data
            { name: 'lesson.title', weight: 1.3 },
            { name: 'lesson.description', weight: 0.8 },

            // Type information
            { name: 'type', weight: 0.5 },

            // Priority information
            { name: 'priority', weight: 0.3 },
        ],
        threshold: 0.3, // Lower threshold = stricter matching
        distance: 100, // How far to extend the pattern matching
        includeScore: true, // Add score to results
        useExtendedSearch: true, // Enable extended search features
        ignoreLocation: true, // Ignore location for nested objects
        findAllMatches: true, // Find all matches in a string
    };

    return new Fuse(data, options);
};

/**
 * Searches content using Fuse.js and includes related items
 * @param {TContent[] | ChapterData[]} data - The full content data
 * @param {string} searchTerm - The search term
 * @returns {(TContent[] | ChapterData[])} - Filtered results with related items
 */
export const searchContentWithFuse = (
    data: TContent[] | ChapterData[] | null | undefined | any,
    searchTerm: string,
): TContent[] | ChapterData[] => {
    if (!data || data.length === 0 || !searchTerm || searchTerm.trim() === '') {
        return data || [];
    }

    const fuse = createContentSearchEngine(data);
    if (!fuse) {
        return data;
    }

    // Perform the search
    const searchResults = fuse.search(searchTerm);

    // Extract the items from the results
    const matchedItems = searchResults.map((result) => result.item);

    // Get the IDs of matched chapters
    const matchedIds = matchedItems.map((item) => item._id);

    // Find items whose parent ID matches one of the filtered items
    const relatedItems = data.filter(
        (item: any) =>
            item.myCourse && matchedIds.includes(item.myCourse.parent),
    );

    // Combine the matched items and their related items, removing duplicates
    const combinedResults = [...matchedItems, ...relatedItems];
    const uniqueResults = Array.from(
        new Map(combinedResults.map((item) => [item._id, item])).values(),
    );

    {
        return uniqueResults;
    }
};

/**
 * Filters content data based on multiple property-value criteria
 * @param {TContent[] | ChapterData[]} data - The content data to filter
 * @param {Array<{property: string, value: any}>} filters - Array of {property, value} filter objects
 * @returns {(TContent[] | ChapterData[])} - Filtered content data
 */
export const filterContentWithProperties = (
    data: TContent[] | ChapterData[] | null | undefined,
    filters: Array<{ property: string; value: any }>,
): TContent[] | ChapterData[] | any => {
    if (!data || data.length === 0) {
        return [];
    }

    if (!filters || filters.length === 0) {
        return data;
    }

    return data.filter(
        (item) =>
            filters.some((filter) => {
                const { property, value } = filter;

                // Handle nested properties like "chapter.isFree"
                if (property.includes('.')) {
                    const [parentProp, childProp] = property.split('.');
                    return (
                        item?.[parentProp as keyof typeof item] &&
                        (item[parentProp as keyof typeof item] as any)?.[
                            childProp
                        ] === value
                    );
                }

                // Handle direct properties
                return item[property as keyof typeof item] === value;
            }) as any,
    );
};

/**
 * Combined search and filter function using Fuse.js
 * @param {TContent[] | ChapterData[]} data - The content data
 * @param {string} searchTerm - The search term
 * @param {Array<{property: string, value: any}>} filters - Array of {property, value} filter objects
 * @returns {(TContent[] | ChapterData[])} - Filtered and searched content data
 */
export const searchAndFilterContent = (
    data: TContent[] | ChapterData[] | null | undefined,
    searchTerm: string,
    filters: Array<{ property: string; value: any }>,
): TContent[] | ChapterData[] => {
    if (!data || data.length === 0) {
        return [];
    }

    // First apply filters if any
    let filteredData = data;
    if (filters && filters.length > 0) {
        filteredData = filterContentWithProperties(data, filters);
    }

    // Then apply search if there's a search term
    if (searchTerm && searchTerm.trim() !== '') {
        return searchContentWithFuse(filteredData, searchTerm);
    }

    return filteredData;
};
