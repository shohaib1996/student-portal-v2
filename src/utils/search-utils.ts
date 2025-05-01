import { TContent } from '@/types';

/**
 * Search by chapter.name | lesson.title – return only the nodes that
 * match (at any depth) plus every descendant they already own.
 *
 * Example:
 *   searchByNameKeepDescendants(data, 'Variables')
 *   → gives you the single lesson “Variables and Data Types”
 *     together with its empty children array – the chapter above it
 *     is NOT included.
 */
export const searchByNameKeepDescendants = (
    data: TContent[] | null | undefined,
    searchTerm: string,
): TContent[] => {
    if (!data || !searchTerm.trim()) {
        return data || [];
    }

    const term = searchTerm.toLowerCase();
    const matchedIds = new Set<string>(); // nodes whose own name matches

    /* ---------- phase 1: mark the matching nodes ------------------------- */

    const findMatches = (item: TContent | any) => {
        const chap = (item?.chapter as any)?.name?.toLowerCase() ?? '';
        const less = (item.lesson as any)?.title?.toLowerCase() ?? '';

        if (chap.includes(term) || less.includes(term)) {
            matchedIds.add(item._id);
        }

        item.children?.forEach((c: any) => findMatches(c as TContent));
    };
    data.forEach(findMatches);

    /* ---------- phase 2: rebuild the tree -------------------------------- */

    /** clone a node and *all* of its children, depth-first */
    const deepClone = (item: TContent): TContent | any => ({
        ...item,
        children: item.children?.map((c) => deepClone(c as TContent)) ?? [],
    });

    /** walk the tree:
      – if this node matched: return its deep clone (full subtree)
      – otherwise, lift up any matching descendants                    */
    const rebuild = (items: TContent[]): TContent[] =>
        items.flatMap((item) => {
            if (matchedIds.has(item._id)) {
                return [deepClone(item)];
            }
            return item.children?.length
                ? rebuild(item.children as TContent[])
                : [];
        });

    return rebuild(data);
};
