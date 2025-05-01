// /utils/search-utils.ts
import Fuse, { IFuseOptions } from 'fuse.js';
import { ChapterType, TContent, ChapterData } from '@/types';

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
            { name: 'chapter.description', weight: 1.0 },

            // Lesson data
            { name: 'lesson.title', weight: 1.3 },
            { name: 'lesson.type', weight: 0.7 },

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
 * Recursively adds all child IDs to a set
 * @param {TContent} item - The content item to collect children from
 * @param {Set<string>} childIdsSet - Set to add child IDs to
 */
export const collectAllChildrenIds = (
    item: TContent,
    childIdsSet: Set<string>,
) => {
    if (!item) {
        return;
    }

    if (item.children && item.children.length > 0) {
        for (const child of item.children) {
            childIdsSet.add(child._id);
            // Recursively collect grandchildren IDs
            collectAllChildrenIds(child as TContent, childIdsSet);
        }
    }
};

/**
 * Recursively collects IDs of all parent items
 * @param {TContent[]} data - Full data array
 * @param {string} id - ID to find parents for
 * @returns {string[]} - Array of parent IDs
 */
export const findParentIds = (
    data: TContent[] | null | undefined,
    id: string,
): string[] => {
    if (!data || data.length === 0) {
        return [];
    }

    const parentIds: string[] = [];

    const findParents = (
        items: TContent[],
        targetId: string,
        parentId?: string,
    ) => {
        for (const item of items) {
            // If this is the target and it has a parent, add the parent
            if (item._id === targetId && parentId) {
                parentIds.push(parentId);
                return;
            }

            // Check if any children match the target
            if (item.children && item.children.length > 0) {
                // If a direct child matches, this item is a parent
                const hasDirectChild = item.children.some(
                    (child) => child._id === targetId,
                );
                if (hasDirectChild) {
                    parentIds.push(item._id);
                }

                // Continue search in children
                findParents(item.children as TContent[], targetId, item._id);
            }
        }
    };

    findParents(data as TContent[], id);
    return parentIds;
};

/**
 * Finds an item by ID in the content tree
 * @param {TContent[]} data - Content tree to search in
 * @param {string} id - ID to find
 * @returns {TContent | null} - Found item or null
 */
export const findItemById = (
    data: TContent[] | null | undefined,
    id: string,
): TContent | null => {
    if (!data || data.length === 0) {
        return null;
    }

    for (const item of data) {
        if (item._id === id) {
            return item;
        }

        if (item.children && item.children.length > 0) {
            const found = findItemById(item.children as TContent[], id);
            if (found) {
                return found;
            }
        }
    }

    return null;
};

/**
 * Searches content using Fuse.js and preserves the parent-child hierarchy
 * @param {TContent[]} data - Content data to search in
 * @param {string} searchTerm - Search term
 * @returns {TContent[]} - Filtered content with preserved hierarchy
 */
export const searchContentWithFuse = (
    data: TContent[] | null | undefined,
    searchTerm: string,
): TContent[] => {
    if (!data || data.length === 0 || !searchTerm || searchTerm.trim() === '') {
        return data || [];
    }

    const fuse = createContentSearchEngine(data);
    if (!fuse) {
        return data || [];
    }

    // Perform the search
    const searchResults = fuse.search(searchTerm);

    // Extract matched items
    const matchedItems = searchResults.map((result) => result.item);
    const matchedIds = new Set(matchedItems.map((item) => item._id));

    // Create a comprehensive set of relevant IDs (matched items + their parents + all children)
    const relevantIds = new Set<string>(matchedIds);

    // Add parent IDs to maintain the hierarchy
    matchedIds.forEach((id) => {
        const parentIds = findParentIds(data, id);
        parentIds.forEach((parentId) => relevantIds.add(parentId));
    });

    // Add all children of matched items (including nested ones)
    matchedItems.forEach((item) => {
        // Add descendants of matched items
        collectAllChildrenIds(item as TContent, relevantIds);

        // For matched chapters, also ensure we include children mentioned in myCourse
        if (item.type === ChapterType.CHAPTER) {
            data?.forEach((contentItem) => {
                if (
                    contentItem.myCourse &&
                    contentItem.myCourse.parent === item._id
                ) {
                    relevantIds.add(contentItem._id);
                    collectAllChildrenIds(contentItem as TContent, relevantIds);
                }
            });
        }
    });

    // Helper function to create a hierarchy-preserving filtered copy of the content tree
    const createFilteredTree = (items: TContent[]): TContent[] => {
        return items
            .filter((item) => relevantIds.has(item._id))
            .map((item) => {
                // Create a deep copy of the item
                const newItem = { ...item };

                // If this item has children, filter them recursively
                if (item.children && item.children.length > 0) {
                    newItem.children = createFilteredTree(
                        item.children as TContent[],
                    );
                }

                return newItem;
            });
    };

    // Apply hierarchy-preserving filtering
    return createFilteredTree(data as TContent[]);
};

/**
 * Filters content based on property-value pairs
 * @param {TContent[]} data - Content data to filter
 * @param {Array<{property: string, value: any}>} filters - Property-value pairs to filter by
 * @returns {TContent[]} - Filtered content with preserved hierarchy
 */
export const filterContentWithProperties = (
    data: TContent[] | null | undefined,
    filters: Array<{ property: string; value: any }>,
): TContent[] => {
    if (!data || data.length === 0) {
        return [];
    }

    if (!filters || filters.length === 0) {
        return data as TContent[];
    }

    // First identify items that match all filters
    const matchedItems = data.filter((item) => {
        return filters.some((filter) => {
            const { property, value } = filter;

            // Handle nested properties (e.g., "chapter.isFree")
            if (property.includes('.')) {
                const [parentProp, childProp] = property.split('.');
                return (
                    item[parentProp as keyof typeof item] &&
                    (item[parentProp as keyof typeof item] as any)?.[
                        childProp
                    ] === value
                );
            }

            // Handle direct properties
            return item[property as keyof typeof item] === value;
        });
    });

    const matchedIds = matchedItems.map((item) => item._id);
    const relevantIds = new Set<string>(matchedIds);

    // Add parent IDs to maintain hierarchy
    matchedIds.forEach((id) => {
        const parentIds = findParentIds(data, id);
        parentIds.forEach((parentId) => relevantIds.add(parentId));
    });

    // Add all children of matched items
    matchedItems.forEach((item) => {
        collectAllChildrenIds(item as TContent, relevantIds);
    });

    // Create filtered hierarchy
    const createFilteredTree = (items: TContent[]): TContent[] => {
        return items
            .filter((item) => relevantIds.has(item._id))
            .map((item) => {
                const newItem = { ...item };

                if (item.children && item.children.length > 0) {
                    newItem.children = createFilteredTree(
                        item.children as TContent[],
                    );
                }

                return newItem;
            });
    };

    return createFilteredTree(data as TContent[]);
};

/**
 * Combined search and filter function
 * @param {TContent[]} data - Content data to search and filter
 * @param {string} searchTerm - Search term
 * @param {Array<{property: string, value: any}>} filters - Filters to apply
 * @returns {TContent[]} - Filtered and searched content with preserved hierarchy
 */
export const searchAndFilterContent = (
    data: TContent[] | null | undefined,
    searchTerm: string,
    filters: Array<{ property: string; value: any }>,
): TContent[] => {
    if (!data || data.length === 0) {
        return [];
    }

    // First apply filters
    let filteredData = data as TContent[];
    if (filters && filters.length > 0) {
        filteredData = filterContentWithProperties(data, filters);
    }

    // Then apply search
    if (searchTerm && searchTerm.trim() !== '') {
        return searchContentWithFuse(filteredData, searchTerm);
    }

    return filteredData;
};
