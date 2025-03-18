export interface TBootcampCategory {
    name: string;
    slug?: string;
}

export interface TBootcampResult {
    category: TBootcampCategory;
    totalItems: number;
    completedItems: number;
    pinnedItems: number;
    incompletedItems: number;
}
