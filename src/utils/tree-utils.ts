/**
 * Enhanced function to transform flat array data into hierarchical tree structure
 * Efficiently builds a nested tree based on parent-child relationships
 * with proper ordering based on prev references
 *
 * @param {Array} flatData - Flat array of content items (chapters, lessons)
 * @returns {Array} - Tree structured array with proper hierarchy
 */
import { TContent } from '@/types';

type ItemMap = Map<string, TContent>;
type ParentChildMap = Map<string, string[]>;
type PrevMap = Map<string, string>;

export const buildContentTree = (flatData: TContent[]): TContent[] => {
    if (!Array.isArray(flatData) || flatData.length === 0) {
        return [];
    }

    // Create maps for O(1) lookups
    const itemMap: ItemMap | any = new Map();
    const parentChildMap: ParentChildMap = new Map();
    const prevMap: PrevMap = new Map();

    // First pass: Build the maps
    flatData.forEach((item) => {
        // Clone the item and add an empty children array
        itemMap.set(item._id, { ...item, children: [] });

        // Track parent-child relationships
        const parentId = item.myCourse?.parent || '';
        if (parentId) {
            if (!parentChildMap.has(parentId)) {
                parentChildMap.set(parentId, []);
            }
            const children = parentChildMap.get(parentId) || [];
            children.push(item._id);
            parentChildMap.set(parentId, children);
        }

        // Track prev relationships for ordering
        if (item.myCourse?.prev) {
            prevMap.set(item.myCourse.prev, item._id);
        }
    });

    // Find root items (those without parents or with empty parent)
    const rootIds = flatData
        .filter((item) => !item.myCourse?.parent || item.myCourse.parent === '')
        .map((item) => item._id);

    // Helper function to sort items based on the 'prev' relationship
    const sortByPrev = (ids: string[]): string[] => {
        if (!ids || ids.length <= 1) {
            return ids;
        }

        const result: string[] = [];
        const processedIds = new Set<string>();

        // Find the first item (no prev or prev not in our list)
        let firstItemId = ids.find((id) => {
            const item = itemMap.get(id);
            return !item?.myCourse?.prev || !ids.includes(item.myCourse.prev);
        });

        // If we couldn't find a clear first item, just use the first in the array
        if (!firstItemId && ids.length > 0) {
            firstItemId = ids[0];
        }

        if (firstItemId) {
            result.push(firstItemId);
            processedIds.add(firstItemId);

            // Chain through the 'prev' relationships
            let currentId = firstItemId;

            // Safety limit to prevent infinite loops in case of circular references
            let safetyLimit = ids.length;

            while (processedIds.size < ids.length && safetyLimit > 0) {
                const nextId = prevMap.get(currentId);

                if (
                    nextId &&
                    ids.includes(nextId) &&
                    !processedIds.has(nextId)
                ) {
                    result.push(nextId);
                    processedIds.add(nextId);
                    currentId = nextId;
                } else {
                    // Add remaining unprocessed items
                    ids.forEach((id) => {
                        if (!processedIds.has(id)) {
                            result.push(id);
                            processedIds.add(id);
                        }
                    });
                }

                safetyLimit--;
            }
        }

        return result.length > 0 ? result : ids;
    };

    // Build the tree recursively
    const buildTree = (parentId: string): TContent[] => {
        const childIds = parentChildMap.get(parentId) || [];
        const sortedChildIds = sortByPrev(childIds);

        return sortedChildIds.map((childId) => {
            const childItem = itemMap.get(childId);

            if (!childItem) {
                return null as unknown as TContent; // This should never happen, but TS needs it
            }

            // Recursively build children
            if (parentChildMap.has(childId)) {
                childItem.children = buildTree(childId);
            }

            return childItem;
        });
    };

    // Sort root items
    const sortedRootIds = sortByPrev(rootIds);

    // Build the final tree starting from root items
    const result = sortedRootIds
        .map((rootId) => {
            const rootItem = itemMap.get(rootId);

            if (!rootItem) {
                return null as unknown as TContent; // This should never happen, but TS needs it
            }

            // Build children for each root item
            if (parentChildMap.has(rootId)) {
                rootItem.children = buildTree(rootId);
            }

            return rootItem;
        })
        .filter(Boolean);

    return result;
};

/**
 * Calculate progress percentage for a chapter
 * Recursively traverses all children to find completed lessons
 *
 * @param {Object} chapter - Chapter object with children
 * @returns {number} - Progress percentage (0-100)
 */
export const calculateProgress = (chapter: TContent): number => {
    // If the chapter itself is completed, return 100%
    if (chapter.isCompleted) {
        return 100;
    }

    // Cache for performance
    const progressCache = new WeakMap<TContent, number>();
    if (progressCache.has(chapter)) {
        return progressCache.get(chapter) || 0;
    }

    // Count all lessons and completed lessons recursively
    let totalLessons = 0;
    let completedLessons = 0;

    // Helper function to count lessons
    const countLessons = (items: TContent[]): void => {
        if (!items || !Array.isArray(items)) {
            return;
        }

        for (const item of items) {
            if (item.type === 'lesson') {
                totalLessons++;
                if (item.isCompleted) {
                    completedLessons++;
                }
            } else if (item?.children && item?.children.length > 0) {
                countLessons(item?.children);
            }
        }
    };

    // Start counting from the chapter's children
    if (chapter?.children && chapter?.children.length > 0) {
        countLessons(chapter.children);
    }

    // Calculate the progress percentage
    const progress =
        totalLessons > 0
            ? Math.round((completedLessons / totalLessons) * 100)
            : 0;

    // Cache the result for future calls
    progressCache.set(chapter, progress);

    return progress;
};

/**
 * Get total duration of a chapter and its children
 *
 * @param {Object} chapter - Chapter object with children
 * @returns {number} - Total duration in seconds
 */
export const getTotalDuration = (chapter: TContent): number => {
    if (!chapter) {
        return 0;
    }

    // If it's a lesson, return its duration
    if (
        chapter.type === 'lesson' &&
        chapter.lesson &&
        chapter.lesson.duration
    ) {
        return Number(chapter.lesson.duration) || 0;
    }

    // If it's a chapter, sum up durations of all children
    let totalDuration = 0;

    if (chapter.children && chapter.children.length > 0) {
        for (const child of chapter.children) {
            totalDuration += getTotalDuration(child);
        }
    }

    return totalDuration;
};

/**
 * Count total number of lessons in a chapter and its children
 *
 * @param {Object} chapter - Chapter object with children
 * @returns {number} - Total number of lessons
 */
export const countLessons = (chapter: TContent): number => {
    if (!chapter) {
        return 0;
    }

    // If it's a lesson, count as 1
    if (chapter.type === 'lesson') {
        return 1;
    }

    // If it's a chapter, sum up counts of all children
    let totalLessons = 0;

    if (chapter.children && chapter.children.length > 0) {
        for (const child of chapter.children) {
            totalLessons += countLessons(child);
        }
    }

    return totalLessons;
};

/**
 * Format seconds into a human-readable string (e.g., "5 min 30 sec")
 *
 * @param {number} totalSeconds - Duration in seconds
 * @returns {string} - Formatted duration string
 */
export const formatSeconds = (totalSeconds: number): string => {
    if (!totalSeconds || isNaN(totalSeconds)) {
        return '0 min 0 sec';
    }

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);

    return `${minutes} min ${seconds} sec`;
};

/**
 * Check if a chapter has any pinned lessons
 *
 * @param {Object} chapter - Chapter object with children
 * @returns {boolean} - True if chapter has any pinned lessons
 */
export const hasPinnedLessons = (chapter: TContent): boolean => {
    if (!chapter) {
        return false;
    }

    // If the chapter itself is pinned, return true
    if (chapter.isPinned) {
        return true;
    }

    // Check if any children are pinned
    if (chapter.children && chapter.children.length > 0) {
        for (const child of chapter.children) {
            if (hasPinnedLessons(child)) {
                return true;
            }
        }
    }

    return false;
};
